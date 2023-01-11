import { expect } from "chai";
import { deployments, ethers } from "hardhat";

import MidasSdk from "../../src/MidasSdk";
import { CErc20 } from "../../typechain/CErc20";
import { setUpPriceOraclePrices } from "../utils";
import * as assetHelpers from "../utils/assets";
import { getOrCreateMidas } from "../utils/midasSdk";
import * as poolHelpers from "../utils/pool";

describe("JumpRateModel", function () {
  let poolAddress: string;
  let sdk: MidasSdk;
  let cTokenA: CErc20;

  beforeEach(async () => {
    await deployments.fixture("prod");
    await setUpPriceOraclePrices();
    const { deployer } = await ethers.getNamedSigners();

    sdk = await getOrCreateMidas();

    [poolAddress] = await poolHelpers.createPool({ signer: deployer, poolName: "Pool-JumpRateModel-Test" });

    const assetsA = await assetHelpers.getAssetsConf(
      poolAddress,
      sdk.contracts.FuseFeeDistributor.address,
      sdk.chainDeployment.JumpRateModel.address,
      ethers
    );

    const deployedAssetsA = await poolHelpers.deployAssets(assetsA, deployer);

    const deployedErc20One = deployedAssetsA.find((a) => a.underlying !== sdk.chainSpecificAddresses.W_TOKEN);

    cTokenA = (await ethers.getContractAt("CErc20", deployedErc20One.assetAddress)) as CErc20;
  });

  it("Class and Contract rate calculations are in sync", async function () {
    const irmClass = await sdk.getInterestRateModel(cTokenA.address);
    const irmContract = sdk.createJumpRateModel(sdk.chainDeployment.JumpRateModel.address);

    const borrows = ethers.utils.parseEther("1");
    const cash = borrows.mul(1);
    const reserves = ethers.utils.parseEther("0");

    const utilization = await irmContract.callStatic.utilizationRate(cash, borrows, reserves);
    const contractRate = await irmContract.callStatic.getBorrowRate(cash, borrows, reserves);
    const classRate = irmClass.getBorrowRate(utilization);

    expect(classRate).eq(contractRate);
  });
});
