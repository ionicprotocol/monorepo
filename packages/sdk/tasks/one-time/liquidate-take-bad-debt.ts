import { BigNumber, constants, providers } from "ethers";
import { task, types } from "hardhat/config";

import { ChainDeployConfig, chainDeployConfig } from "../../chainDeploy";
import { FuseFeeDistributor } from "../../typechain";
import { CErc20 } from "../../typechain/CErc20";
import { CTokenFirstExtension } from "../../typechain/CTokenFirstExtension";
import { IUniswapV2Factory } from "../../typechain/IUniswapV2Factory";
import { MasterPriceOracle } from "../../typechain/MasterPriceOracle";
import { MidasSafeLiquidator } from "../../typechain/MidasSafeLiquidator";
import { WETH } from "../../typechain/WETH";

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
  .setAction(async ({ nonce, sender }, { ethers, getChainId }) => {
    let tx: providers.TransactionResponse;

    const chainid = parseInt(await getChainId());
    if (chainid != 137) throw new Error(`configure the max gas fees for the chain`);

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

task("liquidate:take-bad-debt", "liquidate a debt position by borrowing the same asset from the same market")
  .addParam("debtMarket", "Market address for which to borrow", undefined, types.string)
  .addParam("collateralMarket", "Market address for which to borrow", undefined, types.string)
  .addParam("stableCollateralMarket", "Market address for which to borrow", undefined, types.string)
  .addParam("repayAmount", "Amount to repay", undefined, types.string)
  .addParam("borrower", "Borrower address", undefined, types.string)
  .setAction(
    async (
      { debtMarket, collateralMarket, stableCollateralMarket, repayAmount, borrower },
      { deployments, ethers, getChainId }
    ) => {
      const deployer = await ethers.getNamedSigner("deployer");

      const chainId = parseInt(await getChainId());

      if (!chainDeployConfig[chainId]) {
        throw new Error(`Config invalid for ${chainId}`);
      }
      const { config: chainDeployParams }: { config: ChainDeployConfig; deployFunc: any } = chainDeployConfig[chainId];
      console.log("chainDeployParams: ", chainDeployParams);

      const msl = await deployments.deploy("MidasSafeLiquidator", {
        from: deployer.address,
        contract: "MidasSafeLiquidator",
        log: true,
        waitConfirmations: 1,
        proxy: {
          proxyContract: "OpenZeppelinTransparentProxy",
          owner: deployer.address,
          execute: {
            init: {
              methodName: "initialize",
              args: [
                chainDeployParams.wtoken,
                chainDeployParams.uniswap.uniswapV2RouterAddress,
                chainDeployParams.stableToken ?? constants.AddressZero,
                chainDeployParams.wBTCToken ?? constants.AddressZero,
                chainDeployParams.uniswap.pairInitHashCode ?? "0x",
                chainDeployParams.uniswap.flashSwapFee,
              ],
            },
          },
        },
      });

      if (msl.transactionHash) await ethers.provider.waitForTransaction(msl.transactionHash);
      console.log("MidasSafeLiquidator: ", msl.address);

      const midasSafeLiquidator = (await ethers.getContract("MidasSafeLiquidator", deployer)) as MidasSafeLiquidator;
      const fslOwner = await midasSafeLiquidator.callStatic.owner();
      console.log(`MidasSafeLiquidator owner is ${fslOwner}`);

      const univ2Liquidator = await deployments.deploy("UniswapV2Liquidator", {
        from: deployer.address,
        log: true,
        args: [],
        waitConfirmations: 1,
      });

      if (univ2Liquidator.transactionHash) await ethers.provider.waitForTransaction(univ2Liquidator.transactionHash);
      console.log("UniswapV2Liquidator: ", univ2Liquidator.address);

      const redemptionStrategy = await ethers.getContractAt("UniswapV2Liquidator", univ2Liquidator.address, deployer);

      const whitelisted = await midasSafeLiquidator.callStatic.redemptionStrategiesWhitelist(
        redemptionStrategy.address
      );
      if (!whitelisted) {
        const tx = await midasSafeLiquidator._whitelistRedemptionStrategy(redemptionStrategy.address, true);
        await tx.wait();
      } else {
        console.log(`UniswapV2Liquidator already whitelisted`);
      }

      const usdc = chainDeployParams.stableToken;
      if (!usdc) throw new Error("no stable token configured");

      const repayAmountBN = BigNumber.from(repayAmount);

      // estimate funding amount
      const mpo = (await ethers.getContract("MasterPriceOracle", deployer)) as MasterPriceOracle;
      const debtAssetPrice = await mpo.getUnderlyingPrice(debtMarket);
      const stableCollateralAssetPrice = await mpo.getUnderlyingPrice(stableCollateralMarket);

      const debtValue = debtAssetPrice.mul(repayAmountBN).div(constants.WeiPerEther);
      const stableCollateralEquivalent = debtValue.mul(constants.WeiPerEther).div(stableCollateralAssetPrice);

      const overcollateralizationFactor = 25;
      const additionalCollateralRequired = stableCollateralEquivalent.mul(overcollateralizationFactor).div(100);

      console.log(`required to have ${additionalCollateralRequired} WMATIC extra collateral`);

      const stableCollateralCTokenExtension = (await ethers.getContractAt(
        "CTokenFirstExtension",
        stableCollateralMarket,
        deployer
      )) as CTokenFirstExtension;

      const collateralCToken = (await ethers.getContractAt("CErc20", collateralMarket, deployer)) as CErc20;

      const stableCollateralCToken = (await ethers.getContractAt("CErc20", stableCollateralMarket, deployer)) as CErc20;

      const stableCollateralAssetAddress = await stableCollateralCToken.callStatic.underlying();

      const stableCollateralAsset = (await ethers.getContractAt(
        "ERC20",
        stableCollateralAssetAddress,
        deployer
      )) as ERC20;

      const currentStableCollateral = await stableCollateralCTokenExtension.callStatic.balanceOfUnderlying(
        midasSafeLiquidator.address
      );
      if (currentStableCollateral < additionalCollateralRequired) {
        const wNative = (await ethers.getContractAt("WETH", stableCollateralAsset.address, deployer)) as WETH;

        const currentWNativeBalance = await wNative.callStatic.balanceOf(deployer.address);

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
      } else {
        console.log(`no additional collateral needed`);
      }

      const redemptionStrategies = [redemptionStrategy.address];

      const collateralAsset = await collateralCToken.callStatic.underlying();
      const redemptionStrategiesData = [
        new ethers.utils.AbiCoder().encode(
          ["address", "address[]"],
          [chainDeployParams.uniswap.uniswapV2RouterAddress, [collateralAsset, usdc]]
        ),
      ];

      const factory = (await ethers.getContractAt(
        "IUniswapV2Factory",
        chainDeployParams.uniswap.uniswapV2FactoryAddress,
        deployer
      )) as IUniswapV2Factory;

      const flashSwapPair = await factory.callStatic.getPair(stableCollateralAssetAddress, usdc);

      const tx = await midasSafeLiquidator.liquidateAndTakeDebtPosition({
        borrower,
        collateralFundingStrategies: [],
        collateralFundingStrategiesData: [],
        collateralMarket,
        debtMarket,
        ethToCoinbase: 0,
        exchangeProfitTo: constants.AddressZero,
        flashSwapPair,
        fundingAmount: stableCollateralEquivalent,
        minProfitAmount: 0,
        redemptionStrategies,
        redemptionStrategiesData,
        repayAmountBN,
        stableCollateralMarket,
        uniswapV2RouterForBorrow: chainDeployParams.uniswap.uniswapV2RouterAddress,
        uniswapV2RouterForCollateral: chainDeployParams.uniswap.uniswapV2RouterAddress,
      });
      await tx.wait();
      console.log(`liquidated with tx  ${tx.hash}`);
    }
  );
