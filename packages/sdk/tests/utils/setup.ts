import { bsc } from "@midas-capital/chains";
import { expect } from "chai";
import { constants, providers, Wallet } from "ethers";
import { ethers, getChainId, run } from "hardhat";

import { MidasSdk } from "../../src";
import { EIP20Interface } from "../../typechain/EIP20Interface";
import { FuseFeeDistributor } from "../../typechain/FuseFeeDistributor";
import { FuseSafeLiquidator } from "../../typechain/FuseSafeLiquidator";
import { MasterPriceOracle } from "../../typechain/MasterPriceOracle";
import { SimplePriceOracle } from "../../typechain/SimplePriceOracle";

import { getAssetsConf } from "./assets";
import { getOrCreateMidas } from "./midasSdk";
import { createPool, deployAssets } from "./pool";

export const resetPriceOracle = async (erc20One, erc20Two) => {
  const chainId = parseInt(await getChainId());

  if (chainId !== 31337 && chainId !== 1337) {
    const { deployer } = await ethers.getNamedSigners();
    const sdk = new MidasSdk(ethers.provider, bsc);
    const mpo = (await ethers.getContractAt(
      "MasterPriceOracle",
      sdk.oracles.MasterPriceOracle.address,
      deployer
    )) as MasterPriceOracle;
    const tx = await mpo.add(
      [erc20One.underlying, erc20Two.underlying],
      [sdk.chainDeployment.ChainlinkPriceOracleV2.address, sdk.chainDeployment.ChainlinkPriceOracleV2.address]
    );
    await tx.wait();
  }
};

export const setUpPriceOraclePrices = async (assets?: Array<string>) => {
  const chainId = parseInt(await getChainId());
  if (chainId === 31337 || chainId === 1337) {
    await setupLocalOraclePrices();
  } else if (chainId === 56) {
    await setUpBscOraclePrices(assets);
  }
};

const setupLocalOraclePrices = async () => {
  await run("oracle:set-price", { token: "TRIBE", price: "94.283240360313659894" });
  await run("oracle:set-price", { token: "TOUCH", price: "0.002673507105644885" });
};

const setUpBscOraclePrices = async (assets?: Array<string>) => {
  const { deployer } = await ethers.getNamedSigners();
  const sdk = await getOrCreateMidas();
  const spo = await ethers.getContractAt("SimplePriceOracle", sdk.oracles.SimplePriceOracle.address, deployer);
  const mpo = await ethers.getContractAt("MasterPriceOracle", sdk.oracles.MasterPriceOracle.address, deployer);
  const assetAddresses = assets ? assets : [constants.AddressZero];
  const oracleAddresses = Array(assetAddresses.length).fill(spo.address);
  let tx = await mpo.add(assetAddresses, oracleAddresses);
  await tx.wait();
  tx = await spo.setDirectPrice(constants.AddressZero, ethers.utils.parseEther("1"));
  await tx.wait();
};

export const getPositionRatio = async ({ name, namedUser, userAddress }) => {
  return await run("get-position-ratio", { name, namedUser, userAddress });
};

export const tradeNativeForAsset = async ({ token, amount, account }) => {
  await run("swap:wtoken-token", { token, amount, account });
};

export const tradeAssetForAsset = async ({ token1, token2, amount, account }) => {
  await run("swap-token-for-token", { token1, token2, amount, account });
};

export const wrapNativeToken = async ({ amount, account, weth }) => {
  await run("swap:native-wtoken", { amount, account, weth });
};

export const setUpLiquidation = async (poolName: string) => {
  const { deployer } = await ethers.getNamedSigners();

  const sdk = await getOrCreateMidas();

  const simplePriceOracle: SimplePriceOracle = (await ethers.getContractAt(
    "SimplePriceOracle",
    sdk.oracles.SimplePriceOracle.address,
    deployer
  )) as SimplePriceOracle;

  const oracle: MasterPriceOracle = (await ethers.getContractAt(
    "MasterPriceOracle",
    sdk.oracles.MasterPriceOracle.address,
    deployer
  )) as MasterPriceOracle;
  const fuseFeeDistributor: FuseFeeDistributor = (await ethers.getContractAt(
    "FuseFeeDistributor",
    sdk.contracts.FuseFeeDistributor.address,
    deployer
  )) as FuseFeeDistributor;

  const liquidator = (await ethers.getContractAt(
    "FuseSafeLiquidator",
    sdk.contracts.FuseSafeLiquidator.address,
    deployer
  )) as FuseSafeLiquidator;

  const [poolAddress] = await createPool({ poolName, signer: deployer });

  const assets = await getAssetsConf(poolAddress, fuseFeeDistributor.address, sdk.irms.JumpRateModel.address, ethers);
  let tx;
  for (const asset of assets) {
    const assetPrice = await oracle.callStatic.price(asset.underlying);
    console.log("Setting up liquis with prices: ");
    console.log(`erc: ${asset.symbol}, price: ${ethers.utils.formatEther(assetPrice)}`);
    tx = await oracle.add([asset.underlying], [simplePriceOracle.address]);
    await tx.wait();
    tx = await simplePriceOracle.setDirectPrice(asset.underlying, assetPrice);
    await tx.wait();
  }
  const deployedAssets = await deployAssets(assets, deployer);
  return {
    poolAddress,
    liquidator,
    oracle,
    fuseFeeDistributor,
    deployedAssets,
    simplePriceOracle,
    assets,
  };
};

export const liquidateAndVerify = async (
  poolName: string,
  poolAddress: string,
  liquidatedUserName: string,
  liquidator: FuseSafeLiquidator
) => {
  const { deployer } = await ethers.getNamedSigners();
  const sdk = await getOrCreateMidas();

  // Check balance before liquidation
  const ratioBefore = await getPositionRatio({
    name: poolName,
    userAddress: undefined,
    namedUser: liquidatedUserName,
  });
  console.log(`Ratio Before: ${ratioBefore}`);

  const [liquidations, _] = await sdk.getPotentialLiquidations([]);
  expect(liquidations.length).to.eq(1);

  const desiredLiquidation = liquidations.filter((l) => l.comptroller === poolAddress)[0].liquidations[0];
  const liquidatorBalanceBeforeLiquidation = await ethers.provider.getBalance(deployer.address);

  const tx: providers.TransactionResponse = await liquidator[desiredLiquidation.method](...desiredLiquidation.args, {
    value: desiredLiquidation.value,
  });

  await tx.wait();

  const receipt = await tx.wait();
  expect(receipt.status).to.eq(1);

  const ratioAfter = await getPositionRatio({
    name: poolName,
    userAddress: undefined,
    namedUser: liquidatedUserName,
  });

  console.log(`Ratio After: ${ratioAfter}`);
  expect(ratioBefore).to.be.gte(ratioAfter);

  // Assert balance after liquidation > balance before liquidation
  const liquidatorBalanceAfterLiquidation = await ethers.provider.getBalance(deployer.address);

  console.log(`Liquidator balance before liquidation: ${ethers.utils.formatEther(liquidatorBalanceBeforeLiquidation)}`);
  console.log(`Liquidator balance after liquidation: ${ethers.utils.formatEther(liquidatorBalanceAfterLiquidation)}`);

  expect(liquidatorBalanceAfterLiquidation.gt(liquidatorBalanceBeforeLiquidation));
  expect(ratioBefore).to.be.gte(ratioAfter);
};
