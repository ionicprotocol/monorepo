import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect, use } from "chai";
import { solidity } from "ethereum-waffle";
import { deployments, ethers } from "hardhat";

import MidasSdk from "../../src/MidasSdk";
import { setUpPriceOraclePrices } from "../utils";
import * as assetHelpers from "../utils/assets";
import { getOrCreateMidas } from "../utils/midasSdk";
import * as poolHelpers from "../utils/pool";

use(solidity);

describe("FusePoolsModule", function () {
  let poolAddress: string;
  let sdk: MidasSdk;
  let deployer: SignerWithAddress;

  this.beforeEach(async () => {
    await deployments.fixture("prod");
    await setUpPriceOraclePrices();
    deployer = (await ethers.getNamedSigners()).deployer;

    sdk = await getOrCreateMidas();

    [poolAddress] = await poolHelpers.createPool({ signer: deployer, poolName: "Fetching-Pools-Test" });
    const assets = await assetHelpers.getAssetsConf(
      poolAddress,
      sdk.contracts.FuseFeeDistributor.address,
      sdk.chainDeployment.JumpRateModel.address,
      ethers
    );
    await poolHelpers.deployAssets(assets);
  });

  describe("fetch pools", async function () {
    it("user can fetch all pools", async function () {
      const pools = await sdk.fetchPoolsManual();
      expect(pools.length).to.equal(1);
      expect(pools[0].creator).to.equal(deployer.address);
      expect(pools[0].name).to.equal("Fetching-Pools-Test");
      expect(pools[0].totalLiquidityNative).to.equal(0);
      expect(pools[0].totalSuppliedNative).to.equal(0);
      expect(pools[0].totalBorrowedNative).to.equal(0);
      expect(pools[0].totalSupplyBalanceNative).to.equal(0);
      expect(pools[0].totalBorrowBalanceNative).to.equal(0);
    });

    it("user can fetch filtered pools", async function () {
      let pools = await sdk.fetchPools({
        filter: "created-pools",
        options: { from: deployer.address },
      });
      expect(pools.length).to.equal(1);
      expect(pools[0].creator).to.equal(deployer.address);
      expect(pools[0].name).to.equal("Fetching-Pools-Test");
      expect(pools[0].totalLiquidityNative).to.equal(0);
      expect(pools[0].totalSuppliedNative).to.equal(0);
      expect(pools[0].totalBorrowedNative).to.equal(0);
      expect(pools[0].totalSupplyBalanceNative).to.equal(0);
      expect(pools[0].totalBorrowBalanceNative).to.equal(0);

      pools = await sdk.fetchPools({
        filter: "verified-pools",
        options: { from: deployer.address },
      });
      expect(pools.length).to.equal(0);

      pools = await sdk.fetchPools({
        filter: "unverified-pools",
        options: { from: deployer.address },
      });
      expect(pools.length).to.equal(1);

      pools = await sdk.fetchPools({
        filter: "random-filter",
        options: { from: deployer.address },
      });
      expect(pools.length).to.equal(1);
    });
  });
});
