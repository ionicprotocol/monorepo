import { deployments, ethers } from "hardhat";
import { expect, use } from "chai";
import { solidity } from "ethereum-waffle";
import { Fuse } from "../src";
import { DeployedAsset, poolAssets } from "./utils/pool";
import { utils } from "ethers";
import { MasterPriceOracle } from "../lib/contracts/typechain/MasterPriceOracle";
import { setUpPriceOraclePrices } from "./utils";
import { getOrCreateFuse } from "./utils/fuseSdk";

use(solidity);

describe("FusePoolDirectory", function () {
  let sdk: Fuse;

  this.beforeEach(async () => {
    await deployments.fixture("prod");
    sdk = await getOrCreateFuse();
    await setUpPriceOraclePrices();
  });

  describe("Deploy pool", async function () {
    it("should deploy pool from sdk without whitelist", async function () {
      this.timeout(120_000);
      const POOL_NAME = "TEST_BOB";
      const { bob } = await ethers.getNamedSigners();

      const mpo = (await ethers.getContractAt(
        "MasterPriceOracle",
        sdk.oracles.MasterPriceOracle.address,
        bob
      )) as MasterPriceOracle;

      // 50% -> 0.5 * 1e18
      const bigCloseFactor = utils.parseEther((50 / 100).toString());
      // 8% -> 1.08 * 1e8
      const bigLiquidationIncentive = utils.parseEther((8 / 100 + 1).toString());
      const [poolAddress, implementationAddress, priceOracleAddress] = await sdk.deployPool(
        POOL_NAME,
        false,
        bigCloseFactor,
        bigLiquidationIncentive,
        mpo.address,
        {},
        { from: bob.address },
        []
      );
      console.log(
        `Pool with address: ${poolAddress}, \noracle address: ${priceOracleAddress} deployed\nimplementation address: ${implementationAddress}`
      );
      expect(poolAddress).to.be.ok;
      expect(implementationAddress).to.be.ok;

      const allPools = await sdk.contracts.FusePoolDirectory.callStatic.getAllPools();
      const { comptroller, name: _unfiliteredName } = await allPools.filter((p) => p.name === POOL_NAME).at(-1);

      expect(_unfiliteredName).to.be.equal(POOL_NAME);

      const assets = await poolAssets(
        sdk.irms.JumpRateModel.address,
        comptroller,
        sdk.contracts.FuseFeeDistributor.address
      );
      const deployedAssets: DeployedAsset[] = [];
      for (const assetConf of assets.assets) {
        const [assetAddress, cTokenImplementationAddress, irmModel, receipt] = await sdk.deployAsset(
          sdk.JumpRateModelConf,
          assetConf,
          { from: bob.address }
        );
        console.log("-----------------");
        console.log("deployed asset: ", assetConf.name);
        console.log("Asset Address: ", assetAddress);
        console.log("irmModel: ", irmModel);
        console.log("Implementation Address: ", cTokenImplementationAddress);
        console.log("TX Receipt: ", receipt.transactionHash);
        console.log("-----------------");
        deployedAssets.push({
          assetAddress,
          implementationAddress: cTokenImplementationAddress,
          interestRateModel: irmModel,
          receipt,
          symbol: assetConf.symbol,
          underlying: assetConf.underlying,
        });
      }
      const [, , , underlyingSymbols] = await sdk.contracts.FusePoolLens.callStatic.getPoolSummary(poolAddress);
      expect(underlyingSymbols).to.have.members(deployedAssets.map((d) => d.symbol));

      const fusePoolData = await sdk.contracts.FusePoolLens.callStatic.getPoolAssetsWithData(poolAddress);
      expect(fusePoolData.length).to.eq(3);
      expect(fusePoolData.map((f: any[]) => f[3])).to.have.members(deployedAssets.map((d) => d.symbol));
    });
  });
});
