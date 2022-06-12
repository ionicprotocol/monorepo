import { expect } from "chai";
import { constants } from "ethers";
import { deployments, ethers } from "hardhat";

import { CErc20, EIP20Interface } from "../../lib/contracts/typechain";
import Fuse from "../../src/Fuse";
import { setUpPriceOraclePrices, tradeNativeForAsset } from "../utils";
import * as assetHelpers from "../utils/assets";
import * as collateralHelpers from "../utils/collateral";
import { getOrCreateFuse } from "../utils/fuseSdk";
import * as poolHelpers from "../utils/pool";
import * as timeHelpers from "../utils/time";

describe("RewardsDistributorModule", function () {
  let poolAAddress: string;
  let poolBAddress: string;
  let sdk: Fuse;
  let erc20OneCToken: CErc20;
  let erc20TwoCToken: CErc20;

  let erc20OneUnderlying: EIP20Interface;
  let erc20TwoUnderlying: EIP20Interface;

  let chainId: number;

  this.beforeEach(async () => {
    ({ chainId } = await ethers.provider.getNetwork());
    await deployments.fixture("local");
    await setUpPriceOraclePrices();
    const { deployer } = await ethers.getNamedSigners();

    sdk = await getOrCreateFuse();

    [poolAAddress] = await poolHelpers.createPool({ signer: deployer, poolName: "PoolA-RewardsDistributor-Test" });
    [poolBAddress] = await poolHelpers.createPool({ signer: deployer, poolName: "PoolB-RewardsDistributor-Test" });

    const assetsA = await assetHelpers.getAssetsConf(
      poolAAddress,
      sdk.contracts.FuseFeeDistributor.address,
      sdk.irms.JumpRateModel.address,
      ethers
    );
    const deployedAssetsA = await poolHelpers.deployAssets(assetsA, deployer);

    const erc20One = assetsA.find((a) => a.underlying !== constants.AddressZero); // find first one
    const erc20Two = assetsA.find(
      (a) => a.underlying !== constants.AddressZero && a.underlying !== erc20One.underlying
    ); // find second one

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
  });

  it("1 Pool, 1 Reward Distributor", async function () {
    const { deployer, alice } = await ethers.getNamedSigners();
    // Deploy RewardsDistributors
    const erc20TwoRewardsDistributor = await sdk.deployRewardsDistributor(erc20TwoUnderlying.address, {
      from: deployer.address,
    });

    // Fund RewardsDistributors
    const fundingAmount = ethers.utils.parseUnits("100", 18);
    await sdk.fundRewardsDistributor(erc20TwoRewardsDistributor.address, fundingAmount, {
      from: deployer.address,
    });

    // Add RewardsDistributor to Pool
    await sdk.addRewardsDistributorToPool(erc20TwoRewardsDistributor.address, poolAAddress, {
      from: deployer.address,
    });

    // Setup 'TOUCH' Supply Side Speed
    const supplySpeed = ethers.utils.parseUnits("1", 0);
    await sdk.updateRewardsDistributorSupplySpeed(
      erc20TwoRewardsDistributor.address,
      erc20TwoCToken.address,
      supplySpeed,
      {
        from: deployer.address,
      }
    );

    // Setup 'TOUCH' Borrow Side Speed
    const borrowSpeed = ethers.utils.parseUnits("1", 0);
    await sdk.updateRewardsDistributorBorrowSpeed(
      erc20TwoRewardsDistributor.address,
      erc20TwoCToken.address,
      borrowSpeed,
      {
        from: deployer.address,
      }
    );

    // Check if MarketRewards are correctly returned
    const marketRewards = await sdk.getRewardsDistributorMarketRewardsByPool(poolAAddress, { from: alice.address });
    const erc20TwoMarketRewards = marketRewards.find((mr) => mr.cToken === erc20TwoCToken.address);
    expect(erc20TwoMarketRewards).to.be.ok;

    const supplyRewardsErc20Two = erc20TwoMarketRewards.supplyRewards.find(
      (br) => br.distributor === erc20TwoRewardsDistributor.address
    );
    expect(supplyRewardsErc20Two).to.be.ok;
    expect(supplyRewardsErc20Two.rewardsPerBlock).to.eq(supplySpeed);

    const borrowRewardsErc20Two = erc20TwoMarketRewards.borrowRewards.find(
      (br) => br.distributor === erc20TwoRewardsDistributor.address
    );
    expect(borrowRewardsErc20Two).to.be.ok;
    expect(supplyRewardsErc20Two.rewardsPerBlock).to.eq(borrowSpeed);

    // Check if ClaimableRewards are correctly returned => no rewards yet
    const claimableRewardsBefore = await sdk.getRewardsDistributorClaimableRewards(alice.address, {
      from: alice.address,
    });
    expect(claimableRewardsBefore.length).to.eq(0);

    // Enter Rewarded Market, Single User so 100% Rewards from RewardDistributor
    await collateralHelpers.addCollateral(poolAAddress, alice, await erc20TwoCToken.callStatic.symbol(), "100", true);

    // Advance Blocks
    const blocksToAdvance = 250;
    await timeHelpers.advanceBlocks(blocksToAdvance);

    // Check if ClaimableRewards are correctly returned
    const claimableRewardsAfter250 = await sdk.getRewardsDistributorClaimableRewards(alice.address, {
      from: alice.address,
    });
    expect(claimableRewardsAfter250[0].amount).to.eq(supplySpeed.mul(blocksToAdvance));

    // Claim Rewards
    await sdk.claimAllRewardsDistributorRewards(erc20TwoRewardsDistributor.address, { from: alice.address });
    const claimableRewardsAfterClaim = await sdk.getRewardsDistributorClaimableRewards(alice.address, {
      from: alice.address,
    });
    expect(claimableRewardsAfterClaim.length).to.eq(0);
  });
});
