import { FundOperationMode, FusePoolData } from "@midas-capital/types";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { deployments, ethers } from "hardhat";

import MidasSdk from "../../src/MidasSdk";
import { setUpPriceOraclePrices } from "../utils";
import * as assetHelpers from "../utils/assets";
import { getOrCreateMidas } from "../utils/midasSdk";
import * as poolHelpers from "../utils/pool";
import { wrapNativeToken } from "../utils/setup";

describe("AssetModule", function () {
  let poolAddress: string;
  let sdk: MidasSdk;
  let assetsInPool: FusePoolData;

  this.beforeEach(async () => {
    await deployments.fixture("prod");
    await setUpPriceOraclePrices();
    const { deployer } = await ethers.getNamedSigners();

    sdk = await getOrCreateMidas();

    [poolAddress] = await poolHelpers.createPool({ signer: deployer, poolName: "Pool-Asset-Updates-Test" });

    const assets = await assetHelpers.getAssetsConf(
      poolAddress,
      sdk.contracts.FuseFeeDistributor.address,
      sdk.chainDeployment.JumpRateModel.address,
      ethers
    );
    await poolHelpers.deployAssets(assets, deployer);
    await wrapNativeToken({ account: "deployer", amount: "500", weth: sdk.chainSpecificAddresses.W_TOKEN });
    const poolId = (await poolHelpers.getPoolIndex(poolAddress, sdk)).toString();
    assetsInPool = await sdk.fetchFusePoolData(poolId);
  });

  it("Asset can be updated on supply", async function () {
    const updatedAssets = await sdk.getUpdatedAssets(
      FundOperationMode.SUPPLY,
      0,
      assetsInPool.assets,
      BigNumber.from("100")
    );

    expect(updatedAssets[0].supplyBalance).to.eq(100);
  });

  it("Asset can be updated on borrow", async function () {
    const updatedAssets = await sdk.getUpdatedAssets(
      FundOperationMode.BORROW,
      0,
      assetsInPool.assets,
      BigNumber.from("10")
    );

    expect(updatedAssets[0].borrowBalance).to.eq(10);
  });

  it("Asset can be updated on repay", async function () {
    const updatedAssets = await sdk.getUpdatedAssets(
      FundOperationMode.REPAY,
      0,
      assetsInPool.assets,
      BigNumber.from("10")
    );

    expect(updatedAssets[0].borrowBalance).to.eq(-10);
  });

  it("Asset can be updated on withdraw", async function () {
    const updatedAssets = await sdk.getUpdatedAssets(
      FundOperationMode.WITHDRAW,
      0,
      assetsInPool.assets,
      BigNumber.from("100")
    );

    expect(updatedAssets[0].supplyBalance).to.eq(-100);
  });
});
