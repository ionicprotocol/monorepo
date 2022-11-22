import { expect } from "chai";
import { deployments, ethers } from "hardhat";

import { CErc20 } from "../../typechain/CErc20";
import { EIP20Interface } from "../../typechain/EIP20Interface";
import MidasSdk from "../../src/MidasSdk";
import { setUpPriceOraclePrices, tradeNativeForAsset } from "../utils";
import * as assetHelpers from "../utils/assets";
import * as collateralHelpers from "../utils/collateral";
import { getOrCreateMidas } from "../utils/midasSdk";
import * as poolHelpers from "../utils/pool";
import { wrapNativeToken } from "../utils/setup";

describe("FlywheelModule", function () {
  let poolAAddress: string;
  let poolBAddress: string;
  let sdk: MidasSdk;
  let erc20OneCToken: CErc20;
  let erc20TwoCToken: CErc20;

  let erc20OneUnderlying: EIP20Interface;

  let chainId: number;

  beforeEach(async () => {
    ({ chainId } = await ethers.provider.getNetwork());
    await deployments.fixture("prod");
    await setUpPriceOraclePrices();
    const { deployer } = await ethers.getNamedSigners();

    sdk = await getOrCreateMidas();

    [poolAAddress] = await poolHelpers.createPool({ signer: deployer, poolName: "PoolA-Flywheel-Test" });
    [poolBAddress] = await poolHelpers.createPool({ signer: deployer, poolName: "PoolB-Flywheel-Test" });

    const assetsA = await assetHelpers.getAssetsConf(
      poolAAddress,
      sdk.contracts.FuseFeeDistributor.address,
      sdk.irms.JumpRateModel.address,
      ethers
    );

    const deployedAssetsA = await poolHelpers.deployAssets(assetsA, deployer);

    const deployedErc20One = deployedAssetsA.find((a) => a.underlying !== sdk.chainSpecificAddresses.W_TOKEN);
    const deployedErc20Two = deployedAssetsA.find(
      (a) => a.underlying !== sdk.chainSpecificAddresses.W_TOKEN && a.underlying !== deployedErc20One.underlying
    );

    erc20OneCToken = (await ethers.getContractAt("CErc20", deployedErc20One.assetAddress)) as CErc20;
    erc20TwoCToken = (await ethers.getContractAt("CErc20", deployedErc20Two.assetAddress)) as CErc20;

    erc20OneUnderlying = (await ethers.getContractAt("EIP20Interface", deployedErc20One.underlying)) as EIP20Interface;

    if (chainId !== 1337) {
      await tradeNativeForAsset({ account: "alice", token: deployedErc20One.underlying, amount: "500" });
      await tradeNativeForAsset({ account: "deployer", token: deployedErc20Two.underlying, amount: "500" });
    }
    await wrapNativeToken({ account: "deployer", amount: "500", weth: undefined });
  });

  it("1 Pool, 1 Flywheel, FlywheelStaticRewards", async function () {
    const { deployer, alice } = await ethers.getNamedSigners();
    const rewardToken = erc20OneUnderlying;
    const market = erc20OneCToken;

    // Setup FuseFlywheelCore with FlywheelStaticRewards
    const fwCore = await sdk.deployFlywheelCore(rewardToken.address);
    const fwStaticRewards = await sdk.deployFlywheelStaticRewards(fwCore.address);

    await sdk.setFlywheelRewards(fwCore.address, fwStaticRewards.address);
    expect(await fwCore.flywheelRewards()).to.eq(fwStaticRewards.address);
    await sdk.addFlywheelCoreToComptroller(fwCore.address, poolAAddress);
    const wheels = await sdk.getFlywheelsByPool(poolAAddress);
    expect(wheels.length).to.eq(1);
    expect(wheels[0].address).to.eq(fwCore.address);

    expect((await sdk.getFlywheelsByPool(poolAAddress))[0].address).to.eq(fwCore.address);
    expect((await sdk.getFlywheelsByPool(poolBAddress)).length).to.eq(0);

    // Funding FlywheelStaticRewards
    await rewardToken.connect(deployer).transfer(fwStaticRewards.address, ethers.utils.parseUnits("100", 18));
    expect(await rewardToken.balanceOf(fwStaticRewards.address)).to.not.eq(0);

    await collateralHelpers.addCollateral(poolAAddress, alice, await market.callStatic.symbol(), "100", true);
    expect(await market.functions.totalSupply()).to.not.eq(0);

    await collateralHelpers.addCollateral(poolAAddress, alice, await erc20TwoCToken.callStatic.symbol(), "100", true);
    expect(await erc20TwoCToken.functions.totalSupply()).to.not.eq(0);

    // Setup Rewards, enable and set RewardInfo
    const rewardsPerSecond = ethers.utils.parseUnits("0.0001", 18);
    const rewardsEndTimestamp = 0;

    await sdk.addMarketForRewardsToFlywheelCore(fwCore.address, market.address);

    await sdk.setStaticRewardInfo(fwStaticRewards.address, market.address, {
      rewardsEndTimestamp: 0,
      rewardsPerSecond,
    });

    // Check if Rewards are correctly set
    const infoForMarket = await sdk.getFlywheelRewardsInfoForMarket(fwCore.address, market.address);
    expect(infoForMarket.rewardsPerSecond).to.eq(rewardsPerSecond);
    expect(infoForMarket.rewardsEndTimestamp).to.eq(rewardsEndTimestamp);

    const marketRewardsPoolA = await sdk.getFlywheelMarketRewardsByPool(poolAAddress);
    const marketReward = marketRewardsPoolA.find((r) => r.market === market.address);

    expect(marketReward.rewardsInfo.length).to.eq(1);
    // TODO this is not the same
    // expect(marketReward.rewardsInfo[0].rewardSpeedPerSecondPerToken).to.eq(rewardsPerSecond);

    // TODO test claimable functions
  });
});
