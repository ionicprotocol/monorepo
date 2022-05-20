import { ethers, getChainId, run } from "hardhat";
import { BigNumber, constants, providers, utils } from "ethers";
import {
  CErc20,
  CEther,
  EIP20Interface,
  FuseFeeDistributor,
  FuseSafeLiquidator,
  MasterPriceOracle,
  SimplePriceOracle,
} from "../../lib/contracts/typechain";
import { createPool, DeployedAsset } from "./pool";
import { expect } from "chai";
import { cERC20Conf, ChainLiquidationConfig, Fuse } from "../../";
import { getOrCreateFuse } from "./fuseSdk";
import { assetSymbols } from "../../src/chainConfig";
import { BSC_POOLS, getAssetsConf } from "./assets";

export const resetPriceOracle = async (erc20One, erc20Two) => {
  const chainId = parseInt(await getChainId());

  if (chainId !== 31337 && chainId !== 1337) {
    const { deployer } = await ethers.getNamedSigners();
    const sdk = new Fuse(ethers.provider, Number(chainId));
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
  const sdk = await getOrCreateFuse();
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
  await run("swap-wtoken-for-token", { token, amount, account });
};

export const tradeAssetForAsset = async ({ token1, token2, amount, account }) => {
  await run("swap-token-for-token", { token1, token2, amount, account });
};

export const setUpPools = async (poolNames: BSC_POOLS[]) => {
  let poolAddress: string;
  const { deployer } = await ethers.getNamedSigners();
  const poolAddresses: string[] = [];
  for (const poolName of poolNames) {
    [poolAddress] = await createPool({ poolName, signer: deployer });
    poolAddresses.push(poolAddress);
  }
  return poolAddresses;
};

export const setUpLiquidation = async (poolName: BSC_POOLS | string) => {

  let poolAddress: string;
  let oracle: MasterPriceOracle;
  let liquidator: FuseSafeLiquidator;
  let fuseFeeDistributor: FuseFeeDistributor;


  const { deployer, rando } = await ethers.getNamedSigners();

  const sdk = await getOrCreateFuse();

  oracle = (await ethers.getContractAt(
    "MasterPriceOracle",
    sdk.oracles.MasterPriceOracle.address,
    deployer
  )) as MasterPriceOracle;
  fuseFeeDistributor = (await ethers.getContractAt(
    "FuseFeeDistributor",
    sdk.contracts.FuseFeeDistributor.address,
    deployer
  )) as FuseFeeDistributor;

  liquidator = (await ethers.getContractAt(
    "FuseSafeLiquidator",
    sdk.contracts.FuseSafeLiquidator.address,
    rando
  )) as FuseSafeLiquidator;

  [poolAddress] = await createPool({ poolName, signer: deployer });

  const assets = await getAssetsConf(
    poolAddress,
    fuseFeeDistributor.address,
    sdk.irms.JumpRateModel.address,
    ethers,
    poolName
  );

  for (const asset of assets) {
    const assetPrice = await oracle.callStatic.price(asset.underlying);
    console.log("Setting up liquis with prices: ");
    console.log(`erc20Two: ${asset.symbol}, price: ${ethers.utils.formatEther(assetPrice)}`);
  }
  return {
    poolAddress,
    liquidator,
    oracle,
    fuseFeeDistributor,
  };
};

export const liquidateAndVerify = async (
  poolName: string,
  poolAddress: string,
  liquidatedUserName: string,
  liquidator: FuseSafeLiquidator,
  liquidationConfigOverrides: ChainLiquidationConfig,
  liquidatorBalanceCalculator: (address: string) => Promise<BigNumber>
) => {
  let tx: providers.TransactionResponse;

  const { rando } = await ethers.getNamedSigners();
  const sdk = await getOrCreateFuse();

  // Check balance before liquidation
  const ratioBefore = await getPositionRatio({
    name: poolName,
    userAddress: undefined,
    namedUser: liquidatedUserName,
  });
  console.log(`Ratio Before: ${ratioBefore}`);

  const liquidations = await sdk.getPotentialLiquidations([poolAddress]);
  expect(liquidations.length).to.eq(1);

  const desiredLiquidation = liquidations.filter((l) => l.comptroller === poolAddress)[0].liquidations[0];

  const liquidatorBalanceBeforeLiquidation = await liquidatorBalanceCalculator(rando.address);

  tx = await liquidator[desiredLiquidation.method](...desiredLiquidation.args, {
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
  const liquidatorBalanceAfterLiquidation = await liquidatorBalanceCalculator(rando.address);

  console.log("Liquidator balance before liquidation: ", utils.formatEther(liquidatorBalanceBeforeLiquidation));
  console.log("Liquidator balance after liquidation: ", utils.formatEther(liquidatorBalanceAfterLiquidation));

  expect(liquidatorBalanceAfterLiquidation).gt(liquidatorBalanceBeforeLiquidation);
  expect(ratioBefore).to.be.gte(ratioAfter);
};
