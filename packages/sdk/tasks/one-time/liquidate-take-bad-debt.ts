import { constants } from "ethers";
import { task } from "hardhat/config";
import { ChainDeployConfig, chainDeployConfig } from "../../chainDeploy";
import { MidasSafeLiquidator } from "../../lib/contracts/typechain/MidasSafeLiquidator";
import { MasterPriceOracle } from "../../lib/contracts/typechain/MasterPriceOracle";
import { CTokenFirstExtension } from "../../lib/contracts/typechain/CTokenFirstExtension";
import { CErc20 } from "../../lib/contracts/typechain/CErc20";
import { ERC20 } from "../../lib/contracts/typechain/ERC20";
import { IUniswapV2Factory } from "../../lib/contracts/typechain/IUniswapV2Factory";

task("liquidate:take-bad-debt", "liquidate a debt position by borrowing the same asset from the same market")
  .setAction(async ({}, { deployments, ethers, getChainId }) => {
    const deployer = await ethers.getNamedSigner("deployer");

    const chainId = getChainId();

    if (!chainDeployConfig[chainId]) {
      throw new Error(`Config invalid for ${chainId}`);
    }
    const { config: chainDeployParams, deployFunc }: { config: ChainDeployConfig; deployFunc: any } =
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
        }
      }
    });

    if (msl.transactionHash) await ethers.provider.waitForTransaction(msl.transactionHash);
    console.log("MidasSafeLiquidator: ", msl.address);


    const midasSafeLiquidator = (await ethers.getContract("MidasSafeLiquidator", deployer)) as MidasSafeLiquidator;
    const fslOwner = await midasSafeLiquidator.callStatic.owner();
    console.log(`MidasSafeLiquidator owner is ${fslOwner}`);

    const redemptionStrategy = await ethers.getContract("UniswapV2Liquidator", deployer);

    const whitelisted = await midasSafeLiquidator.callStatic.redemptionStrategiesWhitelist(redemptionStrategy.address);
    if (!whitelisted) {
      let tx = await midasSafeLiquidator._whitelistRedemptionStrategy(redemptionStrategy.address, true);
      await tx.wait();
    } else {
      console.log(`UniswapV2Liquidator already whitelisted`);
    }

    const usdc = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
    const debtMarket = "0x456b363D3dA38d3823Ce2e1955362bBd761B324b"; // jJPY
    const collateralMarket = "0x28D0d45e593764C4cE88ccD1C033d0E2e8cE9aF3"; // MAI
    const stableCollateralMarket = "0x9b38995CA2CEe8e49144b98d09BE9dC3fFA0BE8E"; // WMATIC market
    const repayAmount = 70648061919138038486382;

    // estimate funding amount
    const mpo = await ethers.getContract("MasterPriceOracle", deployer) as MasterPriceOracle;
    const debtAssetPrice = await mpo.getUnderlyingPrice(debtMarket);
    const stableCollateralAssetPrice = await mpo.getUnderlyingPrice(stableCollateralMarket);

    const debtValue = debtAssetPrice.mul(repayAmount).div(constants.WeiPerEther);
    const stableCollateralEquivalent = debtValue.mul(constants.WeiPerEther).div(stableCollateralAssetPrice);

    const overcollateralizationFactor = 0.5;

    const additionalCollateralRequired = stableCollateralEquivalent.mul(overcollateralizationFactor);

    const stableCollateralCTokenExtension = (await ethers.getContractAt(
      "CTokenFirstExtension",
      stableCollateralMarket,
      deployer
    )) as CTokenFirstExtension;

    const collateralCToken = (await ethers.getContractAt(
      "CErc20",
      collateralMarket,
      deployer
    )) as CErc20;

    const stableCollateralCToken = (await ethers.getContractAt(
      "CErc20",
      collateralMarket,
      deployer
    )) as CErc20;

    const stableCollateralAssetAddress = await stableCollateralCToken.callStatic.underlying();

    const stableCollateralAsset = (await ethers.getContractAt(
      "ERC20",
      stableCollateralAssetAddress,
      deployer
    )) as ERC20;

    const currentStableCollateral = await stableCollateralCTokenExtension.callStatic.balanceOfUnderlying(midasSafeLiquidator.address);
    if (currentStableCollateral < additionalCollateralRequired) {
      let tx = await stableCollateralAsset.approve(midasSafeLiquidator.address, additionalCollateralRequired);
      await tx.wait();
      console.log(`approved the MSL to pull ${additionalCollateralRequired} of the stable collateral`);
    }

    const redemptionStrategies = [
      redemptionStrategy.address
    ];

    const collateralAsset = await collateralCToken.callStatic.underlying();
    const redemptionStrategiesData = [
      new ethers.utils.AbiCoder().encode(["address", "address[]"], [
        chainDeployParams.uniswap.uniswapV2RouterAddress,
        [
          collateralAsset, usdc
        ]
      ])
    ];

    const factory = (await ethers.getContractAt(
      "IUniswapV2Factory",
      chainDeployParams.uniswap.uniswapV2FactoryAddress,
      deployer
    )) as IUniswapV2Factory;


    const flashSwapPair = await factory.callStatic.getPair(
      stableCollateralAssetAddress,
      usdc
    );

    await midasSafeLiquidator.liquidateAndTakeDebtPosition({
      borrower: "0xA4F4406D3dc6482dB1397d0ad260fd223C8F37FC",
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
      repayAmount,
      stableCollateralMarket,
      uniswapV2RouterForBorrow: chainDeployParams.uniswap.uniswapV2RouterAddress,
      uniswapV2RouterForCollateral: chainDeployParams.uniswap.uniswapV2RouterAddress
    });
  });

