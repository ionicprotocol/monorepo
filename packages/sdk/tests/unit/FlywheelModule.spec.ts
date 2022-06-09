import { expect } from "chai";
import { deployments, ethers } from "hardhat";

import { CErc20 } from "../../lib/contracts/typechain/CErc20.sol";
import { EIP20Interface } from "../../lib/contracts/typechain/EIP20Interface";
import { WETH } from "../../lib/contracts/typechain/WETH";
import Fuse from "../../src/Fuse";
import { setUpPriceOraclePrices, tradeNativeForAsset } from "../utils";
import * as assetHelpers from "../utils/assets";
import * as collateralHelpers from "../utils/collateral";
import { getOrCreateFuse } from "../utils/fuseSdk";
import * as poolHelpers from "../utils/pool";
import { wrapNativeToken } from "../utils/setup";
import * as timeHelpers from "../utils/time";

describe("FlywheelModule", function () {
  let poolAAddress: string;
  let poolBAddress: string;
  let sdk: Fuse;
  let weth: WETH;
  let erc20OneCToken: CErc20;
  let erc20TwoCToken: CErc20;

  let erc20OneUnderlying: EIP20Interface;
  let erc20TwoUnderlying: EIP20Interface;

  let chainId: number;

  this.beforeEach(async () => {
    ({ chainId } = await ethers.provider.getNetwork());
    await deployments.fixture("prod");
    weth = (await ethers.getContract("WETH")) as WETH;
    await setUpPriceOraclePrices();
    const { deployer } = await ethers.getNamedSigners();

    sdk = await getOrCreateFuse();
    sdk.chainSpecificAddresses.W_TOKEN = weth.address;

    [poolAAddress] = await poolHelpers.createPool({ signer: deployer, poolName: "PoolA-RewardsDistributor-Test" });
    [poolBAddress] = await poolHelpers.createPool({ signer: deployer, poolName: "PoolB-RewardsDistributor-Test" });

    const assetsA = await assetHelpers.getAssetsConf(
      poolAAddress,
      sdk.contracts.FuseFeeDistributor.address,
      sdk.irms.JumpRateModel.address,
      ethers
    );

    const deployedAssetsA = await poolHelpers.deployAssets(assetsA, deployer);

    const [erc20One, erc20Two] = assetsA.slice(1);

    const deployedErc20One = deployedAssetsA.find((a) => a.underlying === erc20One.underlying);
    const deployedErc20Two = deployedAssetsA.find((a) => a.underlying === erc20Two.underlying);

    erc20OneCToken = (await ethers.getContractAt("CErc20", deployedErc20One.assetAddress)) as CErc20;
    erc20TwoCToken = (await ethers.getContractAt("CErc20", deployedErc20Two.assetAddress)) as CErc20;

    erc20OneUnderlying = (await ethers.getContractAt("EIP20Interface", erc20One.underlying)) as EIP20Interface;
    erc20TwoUnderlying = (await ethers.getContractAt("EIP20Interface", erc20Two.underlying)) as EIP20Interface;

    if (chainId !== 1337) {
      await tradeNativeForAsset({ account: "alice", token: erc20Two.underlying, amount: "500" });
      await tradeNativeForAsset({ account: "deployer", token: erc20Two.underlying, amount: "500" });
    }
    await wrapNativeToken({ account: "deployer", amount: "500", weth: weth.address });
  });

  it("1 Pool, 1 Flywheel, FlywheelStaticRewards", async function () {
    const { deployer, alice } = await ethers.getNamedSigners();
    const rewardToken = erc20OneUnderlying;
    const market = erc20OneCToken;

    // Setup FuseFlywheelCore with FlywheelStaticRewards
    const fwCore = await sdk.deployFlywheelCore(rewardToken.address, {
      from: deployer.address,
    });
    const fwStaticRewards = await sdk.deployFlywheelStaticRewards(fwCore.address, {
      from: deployer.address,
    });

    await sdk.setFlywheelRewards(fwCore.address, fwStaticRewards.address, { from: deployer.address });
    expect(await fwCore.flywheelRewards()).to.eq(fwStaticRewards.address);
    await sdk.addFlywheelCoreToComptroller(fwCore.address, poolAAddress, { from: deployer.address });
    const wheels = await sdk.getFlywheelsByPool(poolAAddress, { from: alice.address });
    expect(wheels.length).to.eq(1);
    expect(wheels[0].address).to.eq(fwCore.address);

    expect((await sdk.getFlywheelsByPool(poolAAddress, { from: alice.address }))[0].address).to.eq(fwCore.address);
    expect((await sdk.getFlywheelsByPool(poolBAddress, { from: alice.address })).length).to.eq(0);

    // Funding FlywheelStaticRewards
    await rewardToken.transfer(fwStaticRewards.address, ethers.utils.parseUnits("100", 18), { from: deployer.address });
    expect(await rewardToken.balanceOf(fwStaticRewards.address)).to.not.eq(0);

    await collateralHelpers.addCollateral(poolAAddress, alice, await market.callStatic.symbol(), "100", true);
    expect(await market.functions.totalSupply()).to.not.eq(0);

    await collateralHelpers.addCollateral(poolAAddress, alice, await erc20TwoCToken.callStatic.symbol(), "100", true);
    expect(await erc20TwoCToken.functions.totalSupply()).to.not.eq(0);

    // Setup Rewards, enable and set RewardInfo
    const rewardsPerSecond = ethers.utils.parseUnits("0.0001", 18);
    const rewardsEndTimestamp = 0;

    await sdk.addMarketForRewardsToFlywheelCore(fwCore.address, market.address, { from: deployer.address });

    await sdk.setStaticRewardInfo(
      fwStaticRewards.address,
      market.address,
      {
        rewardsEndTimestamp: 0,
        rewardsPerSecond,
      },
      { from: deployer.address }
    );

    // Check if Rewards are correctly set
    const infoForMarket = await sdk.getFlywheelRewardsInfoForMarket(fwCore.address, market.address, {
      from: alice.address,
    });
    expect(infoForMarket.rewardsPerSecond).to.eq(rewardsPerSecond);
    expect(infoForMarket.rewardsEndTimestamp).to.eq(rewardsEndTimestamp);

    const marketRewardsPoolA = await sdk.getFlywheelMarketRewardsByPool(poolAAddress, {
      from: alice.address,
    });
    const marketReward = marketRewardsPoolA.find((r) => r.market === market.address);

    expect(marketReward.rewardsInfo.length).to.eq(1);
    // TODO this is not the same
    // expect(marketReward.rewardsInfo[0].rewardSpeedPerSecondPerToken).to.eq(rewardsPerSecond);

    // TODO test claimable functions
  });

  it("1 Pool, 1 Flywheel, 1 Reward Distributor", async function () {
    const { deployer, alice } = await ethers.getNamedSigners();

    const rewardToken = erc20OneUnderlying;
    const market = erc20OneCToken;

    // Deploy RewardsDistributor
    const rewardDistributor = await sdk.deployRewardsDistributor(rewardToken.address, {
      from: deployer.address,
    });

    // Deploy Flywheel with Static Rewards
    const fwCore = await sdk.deployFlywheelCore(rewardToken.address, {
      from: deployer.address,
    });
    const fwStaticRewards = await sdk.deployFlywheelStaticRewards(fwCore.address, {
      from: deployer.address,
    });

    // Fund RewardsDistributors
    const fundingAmount = ethers.utils.parseUnits("100", 18);
    await sdk.fundRewardsDistributor(rewardDistributor.address, fundingAmount, {
      from: deployer.address,
    });
    expect(await rewardToken.balanceOf(rewardDistributor.address)).to.not.eq(0);

    // Funding Static Rewards
    await rewardToken.transfer(fwStaticRewards.address, fundingAmount, { from: deployer.address });
    expect(await rewardToken.balanceOf(fwStaticRewards.address)).to.not.eq(0);

    // Add RewardsDistributor to Pool
    await sdk.addRewardsDistributorToPool(rewardDistributor.address, poolAAddress, {
      from: deployer.address,
    });

    // Add Flywheel to Pool
    await sdk.setFlywheelRewards(fwCore.address, fwStaticRewards.address, { from: deployer.address });
    await sdk.addFlywheelCoreToComptroller(fwCore.address, poolAAddress, { from: deployer.address });

    // Setup 'TOUCH' Borrow Side Speed on Rewards Distributor
    const rewardSpeed = ethers.utils.parseUnits("1", 0);
    await sdk.updateRewardsDistributorBorrowSpeed(rewardDistributor.address, market.address, rewardSpeed, {
      from: deployer.address,
    });

    // Setup Rewards, enable and set RewardInfo
    await sdk.addMarketForRewardsToFlywheelCore(fwCore.address, market.address, { from: deployer.address });
    await sdk.setStaticRewardInfo(
      fwStaticRewards.address,
      market.address,
      {
        rewardsEndTimestamp: 0,
        rewardsPerSecond: rewardSpeed,
      },
      { from: deployer.address }
    );

    // Enter Rewarded Market, Single User so 100% Rewards from RewardDistributor & Flywheel
    await collateralHelpers.addCollateral(poolAAddress, alice, await market.callStatic.symbol(), "100", true);

    // Advance Blocks
    await timeHelpers.advanceBlocks(250);
    const rewardDistributors = await sdk.getRewardsDistributorsByPool(poolAAddress, { from: alice.address });
    expect(rewardDistributors.length).to.eq(1);
    expect(rewardDistributors[0].address).to.eq(rewardDistributor.address);

    const flywheels = await sdk.getFlywheelsByPool(poolAAddress, { from: alice.address });
    expect(flywheels.length).to.eq(1);
    expect(flywheels[0].address).to.eq(fwCore.address);
  });
});
