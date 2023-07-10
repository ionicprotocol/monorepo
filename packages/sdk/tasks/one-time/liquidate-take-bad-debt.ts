import { BigNumber, constants } from "ethers";
import { task, types } from "hardhat/config";

import { ChainDeployConfig, chainDeployConfig } from "../../chainDeploy";
import { CErc20 } from "../../typechain/CErc20";
import { CTokenFirstExtension } from "../../typechain/CTokenFirstExtension";
import { ERC20 } from "../../typechain/ERC20";
import { IUniswapV2Factory } from "../../typechain/IUniswapV2Factory";
import { MasterPriceOracle } from "../../typechain/MasterPriceOracle";
import { MidasSafeLiquidator as IonicSafeLiquidator } from "../../typechain/MidasSafeLiquidator";
import { WETH } from "../../typechain/WETH";

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
      const { config: chainDeployParams }: { config: ChainDeployConfig; deployFunc: CallableFunction } =
        chainDeployConfig[chainId];
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

      const ionicSafeLiquidator = (await ethers.getContract("MidasSafeLiquidator", deployer)) as IonicSafeLiquidator;
      const fslOwner = await ionicSafeLiquidator.callStatic.owner();
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

      const whitelisted = await ionicSafeLiquidator.callStatic.redemptionStrategiesWhitelist(
        redemptionStrategy.address
      );
      if (!whitelisted) {
        const tx = await ionicSafeLiquidator._whitelistRedemptionStrategy(redemptionStrategy.address, true);
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
        ionicSafeLiquidator.address
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

        const tx = await wNative.approve(ionicSafeLiquidator.address, diffNeeded);
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

      const tx = await ionicSafeLiquidator.liquidateAndTakeDebtPosition({
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
        repayAmount: repayAmountBN,
        stableCollateralMarket,
        uniswapV2RouterForBorrow: chainDeployParams.uniswap.uniswapV2RouterAddress,
        uniswapV2RouterForCollateral: chainDeployParams.uniswap.uniswapV2RouterAddress,
      });
      await tx.wait();
      console.log(`liquidated with tx  ${tx.hash}`);
    }
  );
