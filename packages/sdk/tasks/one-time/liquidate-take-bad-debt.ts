import {BigNumber, constants, providers} from "ethers";
import { task, types } from "hardhat/config";

import { ChainDeployConfig, chainDeployConfig } from "../../chainDeploy";
import { CErc20 } from "../../typechain/CErc20";
import { CTokenFirstExtension } from "../../typechain/CTokenFirstExtension";
import { IUniswapV2Factory } from "../../typechain/IUniswapV2Factory";
import { MasterPriceOracle } from "../../typechain/MasterPriceOracle";
import { MidasSafeLiquidator } from "../../typechain/MidasSafeLiquidator";
import { WETH } from "../../typechain/WETH";
import {FuseFeeDistributor} from "../../typechain";

task("boost:tx", "increase the max gas fees to speed up a tx")
  .addParam("txHash", "tx hash", undefined, types.string)
  .addParam("nonce", "nonce", undefined, types.int)
  .setAction(async ({ txHash, nonce }, { ethers }) => {
    let tx: providers.TransactionResponse;

    const tr = await ethers.provider.getTransaction(txHash);

    console.log(`tx response ${JSON.stringify(tr)}`);

    // TODO check if already included in a block?
    // if (!tr.blockNumber) {}

    const signer = await ethers.getSigner(tr.from);
    tx = await signer.sendTransaction({
      from: tr.from,
      to: tr.to,
      value: tr.value,
      nonce: nonce,
      data: tr.data,
      gasLimit: tr.gasLimit,
      maxFeePerGas: tr.maxFeePerGas?.mul(120).div(100),
      maxPriorityFeePerGas: tr.maxPriorityFeePerGas?.mul(120).div(100),
    });
    console.log(`new tx hash ${tx.hash}`);
    await tx.wait();
    console.log(`tx mined ${tx.hash}`);
  });

task("cancel:tx", "cancel a tx with the same nonce")
  .addParam("nonce", "nonce", undefined, types.int)
  .addParam("sender", "sender address", "deployer", types.string)
  .setAction(async ({ nonce, sender }, { ethers }) => {
    let tx: providers.TransactionResponse;

    const signer = await ethers.getNamedSigner(sender);
    tx = await signer.sendTransaction({
      from: signer.address,
      to: signer.address,
      value: 0,
      nonce,
      maxFeePerGas: ethers.utils.parseUnits("300", "gwei"),
      maxPriorityFeePerGas: ethers.utils.parseUnits("120", "gwei"),
    });
    console.log(`cancelling tx hash ${tx.hash}`);
    await tx.wait();
    console.log(`tx mined ${tx.hash}`);
  });

task("fund:liquidator", "").setAction(async ({}, { ethers }) => {
  let tx: providers.TransactionResponse;

  const signer = await ethers.getNamedSigner("deployer");
  const transaction = {
    from: signer.address,
    to: "0x19F2bfCA57FDc1B7406337391d2F54063CaE8748",
    value: ethers.utils.parseUnits("8", 18),
    gasLimit: 21000,
    nonce: 494,
    maxFeePerGas: ethers.utils.parseUnits("400", "gwei"),
    maxPriorityFeePerGas: ethers.utils.parseUnits("180", "gwei"),
  };
  console.log(`sending transaction ${JSON.stringify(transaction)}`);
  tx = await signer.sendTransaction(transaction);
  console.log(`funding tx hash ${tx.hash}`);
  await tx.wait();
  console.log(`tx mined ${tx.hash}`);
});

task("liquidate:jmxn")
  .setAction(async ({}, { ethers, run }) => {
  await run("liquidate:take-bad-debt", {
    debtMarket: "0xD8029d67a7CfbD08d21968a4Cf284b9C89EB70C6",
    collateralMarket: "0x28D0d45e593764C4cE88ccD1C033d0E2e8cE9aF3",
    stableCollateralMarket: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // wmatic
    repayAmount: "13643174439320386319124",
    borrower: "0x29b38578A5d7D9232901a329FF99B4C28Bc439e5"
  });
});

task("liquidate:take-bad-debt", "liquidate a debt position by borrowing the same asset from the same market")
  .addParam("debtMarket", "Market address for which to borrow", undefined, types.string)
  .addParam("collateralMarket", "Market address for which to borrow", undefined, types.string)
  .addParam("stableCollateralMarket", "Market address for which to borrow", undefined, types.string)
  .addParam("repayAmount", "Amount to repay", undefined, types.string)
  .addParam("borrower", "Borrower address", undefined, types.string)
  .setAction(
    async (
      { debtMarket, collateralMarket, stableCollateralMarket, repayAmount, borrower },
      { ethers, getChainId }
    ) => {
      const liquidatorBot = await ethers.getNamedSigner("alice");

      const chainId = parseInt(await getChainId());

      if (!chainDeployConfig[chainId]) {
        throw new Error(`Config invalid for ${chainId}`);
      }
      const { config: chainDeployParams }: { config: ChainDeployConfig; deployFunc: any } = chainDeployConfig[chainId];
      console.log("chainDeployParams: ", chainDeployParams);

      const midasSafeLiquidator = (await ethers.getContract(
        "MidasSafeLiquidator",
        liquidatorBot
      )) as MidasSafeLiquidator;
      const fslOwner = await midasSafeLiquidator.callStatic.owner();
      console.log(`MidasSafeLiquidator owner is ${fslOwner}`);

      const usdc = chainDeployParams.stableToken;
      if (!usdc) throw new Error("no stable token configured");

      const repayAmountBN = BigNumber.from(repayAmount);
      const overcollateralizationFactor = 0;
      const collateralCToken = (await ethers.getContractAt("CErc20", collateralMarket)) as CErc20;

      if(overcollateralizationFactor > 0) {
        // estimate funding amount
        const mpo = (await ethers.getContract("MasterPriceOracle")) as MasterPriceOracle;
        const debtAssetPrice = await mpo.callStatic.getUnderlyingPrice(debtMarket);
        const stableCollateralAssetPrice = await mpo.callStatic.getUnderlyingPrice(stableCollateralMarket);

        const debtValue = debtAssetPrice.mul(repayAmountBN).div(constants.WeiPerEther);
        const stableCollateralEquivalent = debtValue.mul(constants.WeiPerEther).div(stableCollateralAssetPrice);

        const additionalCollateralRequired = stableCollateralEquivalent.mul(overcollateralizationFactor).div(100);

        console.log(`required to have ${additionalCollateralRequired} WMATIC extra collateral`);

        const stableCollateralCTokenExtension = (await ethers.getContractAt(
          "CTokenFirstExtension",
          stableCollateralMarket
        )) as CTokenFirstExtension;

        const stableCollateralCToken = (await ethers.getContractAt("CErc20", stableCollateralMarket)) as CErc20;

        const stableCollateralAssetAddress = await stableCollateralCToken.callStatic.underlying();

        const currentStableCollateral = await stableCollateralCTokenExtension.callStatic.balanceOfUnderlying(
          midasSafeLiquidator.address
        );
        if (currentStableCollateral < additionalCollateralRequired) {
          const wNative = (await ethers.getContractAt("WETH", stableCollateralAssetAddress, liquidatorBot)) as WETH;

          const currentWNativeBalance = await wNative.callStatic.balanceOf(liquidatorBot.address);

          const diffNeeded = additionalCollateralRequired.sub(currentStableCollateral);

          if (currentWNativeBalance.lt(diffNeeded)) {
            const amountToWrap = diffNeeded.sub(currentWNativeBalance);
            const tx = await wNative.deposit({ value: amountToWrap });
            await tx.wait();
            console.log(`wrapped ${amountToWrap}`);
          } else {
            console.log(
              `no need to top up the current ${currentWNativeBalance} WMATIC balance having ${currentStableCollateral}`
            );
          }

          const tx = await wNative.approve(midasSafeLiquidator.address, diffNeeded);
          await tx.wait();
          console.log(`approved the MSL to pull ${diffNeeded} WMATIC of the stable collateral`);

          const factory = (await ethers.getContractAt(
            "IUniswapV2Factory",
            chainDeployParams.uniswap.uniswapV2FactoryAddress
          )) as IUniswapV2Factory;

          const flashSwapPair = await factory.callStatic.getPair(stableCollateralAssetAddress, usdc);
        } else {
          console.log(`no additional collateral needed`);
        }
      }

      const redemptionStrategies: string[] = [];
      const redemptionStrategiesData = [];

      const collateralAsset = await collateralCToken.callStatic.underlying();
      if (redemptionStrategies.length == 1) {
        redemptionStrategiesData.push(new ethers.utils.AbiCoder().encode(
          ["address", "address[]"],
          [chainDeployParams.uniswap.uniswapV2RouterAddress, [collateralAsset, usdc]]
        ));
      }

      const tx = await midasSafeLiquidator.liquidateAndTakeDebtPosition({
        borrower,
        collateralFundingStrategies: [],
        collateralFundingStrategiesData: [],
        collateralMarket,
        debtMarket,
        ethToCoinbase: 0,
        exchangeProfitTo: constants.AddressZero,
        flashSwapPair: constants.AddressZero,
        fundingAmount: 0,
        minProfitAmount: 0,
        redemptionStrategies,
        redemptionStrategiesData,
        repayAmount: repayAmountBN,
        stableCollateralMarket,
        uniswapV2RouterForBorrow: chainDeployParams.uniswap.uniswapV2RouterAddress,
        uniswapV2RouterForCollateral: chainDeployParams.uniswap.uniswapV2RouterAddress,
      });
      await tx.wait();
      console.log(`liquidated with tx  ${tx.hash}`);
    }
  );
