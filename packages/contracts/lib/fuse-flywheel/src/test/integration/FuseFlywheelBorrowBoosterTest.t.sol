// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.10;

import {DSTestPlus} from "solmate/test/utils/DSTestPlus.sol";
import {MockERC20, ERC20} from "solmate/test/utils/mocks/MockERC20.sol";
import {FlywheelStaticRewards} from "flywheel/rewards/FlywheelStaticRewards.sol";

import "../../booster/FuseFlywheelBorrowBooster.sol";
import "../../FuseFlywheelBorrowerCore.sol";
import "../mocks/MockCToken.sol";

contract FuseFlywheelBorrowBoosterTest is DSTestPlus {
    FuseFlywheelBorrowerCore flywheel;
    FlywheelStaticRewards rewards;
    MockERC20 rewardToken;
    MockCToken strategy;
    FuseFlywheelBorrowBooster booster;

    address alice = address(0x10);
    address bob = address(0x20);

    function setUp() public {
        MockERC20 underlying = new MockERC20("mock token", "MOCK", 18);
        rewardToken = new MockERC20("reward token", "RTK", 18);

        booster = new FuseFlywheelBorrowBooster();

        flywheel = new FuseFlywheelBorrowerCore(
            rewardToken,
            FlywheelStaticRewards(address(0)),
            booster,
            address(this),
            Authority(address(0))
        );

        rewards = new FlywheelStaticRewards(
            flywheel,
            address(this),
            Authority(address(0))
        );

        flywheel.setFlywheelRewards(rewards);

        strategy = new MockCToken(address(underlying), false);
        flywheel.addStrategyForRewards(strategy);

        // seed rewards to flywheel
        rewardToken.mint(address(rewards), 100 ether);

        uint224 rate = 1e10 / uint224(7 days);
        rewards.setRewardsInfo(
            ERC20(address(strategy)),
            FlywheelStaticRewards.RewardsInfo({
                rewardsPerSecond: rate,
                rewardsEndTimestamp: 0
            })
        );
    }

    function testBorrowBooster() public {
        // Alice contributes 40% of the supply
        strategy.mint(alice, 4000);
        // the rest is supplied by Bob
        strategy.mint(bob, 6000);

        // Alice contributes 10% of the borrowed
        hevm.prank(alice);
        strategy.borrow(135);
        // the rest is borrowed by Bob
        hevm.prank(bob);
        strategy.borrow(1215);

        // advance the time accrue any amount of rewards
        hevm.warp(block.timestamp + 7 days);

        strategy.accrueInterest();

        flywheel.accrue(strategy, alice);
        flywheel.accrue(strategy, bob);

        // claiming the accrued rewards
        flywheel.claimRewards(alice);
        flywheel.claimRewards(bob);

        uint256 aliceRewardsAfter = rewardToken.balanceOf(alice);
        uint256 bobRewardsAfter = rewardToken.balanceOf(bob);

        assertTrue(
            bobRewardsAfter / aliceRewardsAfter == 9,
            "rewards ratio should be 9:1 (10% for alice)"
        );
    }
}
