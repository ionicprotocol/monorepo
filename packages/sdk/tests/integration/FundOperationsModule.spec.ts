import { expect } from "chai";
import { providers, utils } from "ethers";
import { deployments, ethers } from "hardhat";

import MidasSdk from "../../src/MidasSdk";
import { setUpPriceOraclePrices } from "../utils";
import * as assetHelpers from "../utils/assets";
import { getOrCreateMidas } from "../utils/midasSdk";
import * as poolHelpers from "../utils/pool";
import { wrapNativeToken } from "../utils/setup";

describe("FundOperationsModule", function () {
  let poolAddress: string;
  let sdk: MidasSdk;
  let tx: providers.TransactionResponse;
  let rec: providers.TransactionReceipt;

  this.beforeEach(async () => {
    await deployments.fixture("prod");
    await setUpPriceOraclePrices();
    const { deployer } = await ethers.getNamedSigners();

    sdk = await getOrCreateMidas();

    [poolAddress] = await poolHelpers.createPool({ signer: deployer, poolName: "Pool-Fund-Operations-Test" });

    const assets = await assetHelpers.getAssetsConf(
      poolAddress,
      sdk.contracts.FuseFeeDistributor.address,
      sdk.irms.JumpRateModel.address,
      ethers
    );
    await poolHelpers.deployAssets(assets, deployer);
    await wrapNativeToken({ account: "deployer", amount: "500", weth: sdk.chainSpecificAddresses.W_TOKEN });
  });

  it("user can supply", async function () {
    const { deployer } = await ethers.getNamedSigners();
    const poolId = (await poolHelpers.getPoolIndex(poolAddress, sdk)).toString();
    const assetsInPool = await sdk.fetchFusePoolData(poolId);
    const asset = assetsInPool.assets.find((asset) => asset.underlyingToken === sdk.chainSpecificAddresses.W_TOKEN);
    const res = await sdk.supply(
      asset.cToken,
      asset.underlyingToken,
      assetsInPool.comptroller,
      true,
      utils.parseUnits("3", 18)
    );
    tx = res.tx;
    rec = await tx.wait();
    expect(rec.status).to.eq(1);
    const assetAfterSupply = await poolHelpers.assetInPool(poolId, sdk, "WETH", deployer.address);
    expect(utils.formatUnits(assetAfterSupply.supplyBalance, 18)).to.eq("3.0");
  });

  it("user can borrow", async function () {
    const { deployer } = await ethers.getNamedSigners();
    const poolId = (await poolHelpers.getPoolIndex(poolAddress, sdk)).toString();
    const assetsInPool = await sdk.fetchFusePoolData(poolId);
    const asset = assetsInPool.assets.find((asset) => asset.underlyingToken === sdk.chainSpecificAddresses.W_TOKEN);

    const res = await sdk.supply(
      asset.cToken,
      asset.underlyingToken,
      assetsInPool.comptroller,
      true,
      utils.parseUnits("3", 18)
    );
    tx = res.tx;
    rec = await tx.wait();
    expect(rec.status).to.eq(1);
    const resp = await sdk.borrow(asset.cToken, utils.parseUnits("2", 18));
    tx = resp.tx;
    rec = await tx.wait();
    expect(rec.status).to.eq(1);
    const assetAfterBorrow = await poolHelpers.assetInPool(poolId, sdk, await "WETH", deployer.address);
    expect(utils.formatUnits(assetAfterBorrow.borrowBalance, 18)).to.eq("2.0");
  });

  it("user can withdraw", async function () {
    const { deployer } = await ethers.getNamedSigners();
    const poolId = (await poolHelpers.getPoolIndex(poolAddress, sdk)).toString();
    const assetsInPool = await sdk.fetchFusePoolData(poolId);
    const asset = assetsInPool.assets.find((asset) => asset.underlyingToken === sdk.chainSpecificAddresses.W_TOKEN);
    const res = await sdk.supply(
      asset.cToken,
      asset.underlyingToken,
      assetsInPool.comptroller,
      true,
      utils.parseUnits("3", 18)
    );
    tx = res.tx;
    rec = await tx.wait();
    expect(rec.status).to.eq(1);
    const resp = await sdk.withdraw(asset.cToken, utils.parseUnits("2", 18));
    tx = resp.tx;
    rec = await tx.wait();
    expect(rec.status).to.eq(1);
    const assetAfterWithdraw = await poolHelpers.assetInPool(poolId, sdk, await "WETH", deployer.address);
    expect(utils.formatUnits(assetAfterWithdraw.supplyBalance, 18)).to.eq("1.0");
  });

  it("user can repay", async function () {
    const { deployer } = await ethers.getNamedSigners();
    const poolId = (await poolHelpers.getPoolIndex(poolAddress, sdk)).toString();
    const assetsInPool = await sdk.fetchFusePoolData(poolId);
    const asset = assetsInPool.assets.find((asset) => asset.underlyingToken === sdk.chainSpecificAddresses.W_TOKEN);
    let res = await sdk.supply(
      asset.cToken,
      asset.underlyingToken,
      assetsInPool.comptroller,
      true,
      utils.parseUnits("5", 18)
    );
    tx = res.tx;
    rec = await tx.wait();
    expect(rec.status).to.eq(1);

    res = await sdk.borrow(asset.cToken, utils.parseUnits("3", 18));
    tx = res.tx;
    rec = await tx.wait();
    expect(rec.status).to.eq(1);

    const assetBeforeRepay = await poolHelpers.assetInPool(poolId, sdk, "WETH", deployer.address);

    res = await sdk.repay(asset.cToken, asset.underlyingToken, false, utils.parseUnits("2", 18));
    tx = res.tx;
    rec = await tx.wait();
    expect(rec.status).to.eq(1);
    const assetAfterRepay = await poolHelpers.assetInPool(poolId, sdk, "WETH", deployer.address);
    expect(assetBeforeRepay.borrowBalance.gt(assetAfterRepay.borrowBalance)).to.eq(true);
  });
});
