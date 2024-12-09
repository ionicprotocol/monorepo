// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.10;

import "forge-std/Test.sol";
import { MockERC20 } from "solmate/test/utils/mocks/MockERC20.sol";
import { MockBooster } from "./mocks/MockBooster.sol";
import { MockRewards } from "./mocks/MockRewards.sol";
import { Authority } from "solmate/auth/Auth.sol";
import { MockEmissionsManager } from "./mocks/MockEmissionsManager.sol";
import { IEmissionsManager } from "../../IEmissionsManager.sol";
import "../../ionic/strategies/flywheel/IonicFlywheel.sol";
import "../../ionic/strategies/flywheel/IFlywheelBooster.sol";
import "../../ionic/strategies/flywheel/rewards/IFlywheelRewards.sol";

import "forge-std/console.sol";

contract IonicFlywheelTest is Test {
    IonicFlywheel flywheel;
    MockRewards rewards;
    MockBooster booster;

    MockERC20 strategy;
    MockERC20 rewardToken;
    MockEmissionsManager emissionsManager;

    address constant user = address(0xDEAD);
    address constant user2 = address(0xBEEF);
    uint224 public constant ONE = 1e18;

    function setUp() public {
        rewardToken = new MockERC20("Reward Token", "RWD", 18);

        strategy = new MockERC20("Strategy Token", "STRAT", 18);

        booster = new MockBooster();

        flywheel = new IonicFlywheel();
        flywheel.initialize(
            rewardToken,
            MockRewards(address(0)),
            IFlywheelBooster(address(0)),
            address(this)
        );
        
        flywheel.updateFeeSettings(0, address(this));

        rewards = new MockRewards(flywheel);

        emissionsManager = new MockEmissionsManager();
        flywheel.setEmissionsManager(IEmissionsManager(address(emissionsManager)));

        flywheel.setFlywheelRewards(rewards);
    }

    function test_addStrategyForRewards_StrategyCanBeAdded(ERC20 strat) public {
        flywheel.addStrategyForRewards(strat);
        (uint224 index, uint32 timestamp) = flywheel.strategyState(strat);
        require(index == ONE);
        require(timestamp == block.timestamp);
    }

    function test_addStrategyForRewards_Unauthorized() public {
        vm.prank(address(1));
        vm.expectRevert(bytes("Ownable: caller is not the owner"));
        flywheel.addStrategyForRewards(strategy);
    }

    function test_setFlywheelRewards_FlywheelRewardsCanBeAdded(uint256 mintAmount) public {
        rewardToken.mint(address(rewards), mintAmount);

        flywheel.setFlywheelRewards(IFlywheelRewards(address(1)));
        require(flywheel.flywheelRewards() == IFlywheelRewards(address(1)));

        // assert rewards transferred
        require(rewardToken.balanceOf(address(1)) == mintAmount);
        require(rewardToken.balanceOf(address(rewards)) == 0);
    }

    function test_setFlywheelRewards_Unauthorized() public {
        vm.prank(address(1));
        vm.expectRevert(bytes("Ownable: caller is not the owner"));
        flywheel.setFlywheelRewards(IFlywheelRewards(address(1)));
    }

    function test_setBooster_FlywheelBoosterCanBeAdded(IFlywheelBooster booster) public {
        flywheel.setBooster(booster);
        require(flywheel.flywheelBooster() == booster);
    }

    function test_setBooster_Unauthorized() public {
        vm.prank(address(1));
        vm.expectRevert(bytes("Ownable: caller is not the owner"));
        flywheel.setBooster(IFlywheelBooster(address(1)));
    }

    function test_accrue_UserCanBeAccrued(
        uint128 userBalance1,
        uint128 userBalance2,
        uint128 rewardAmount
    ) public {
        vm.assume(userBalance1 != 0 && userBalance2 != 0 && rewardAmount != 0 && userBalance1 < 1e25 && userBalance2 < 1e25);
        strategy.mint(user, userBalance1);
        strategy.mint(user2, userBalance2);

        rewardToken.mint(address(rewards), rewardAmount);
        rewards.setRewardsAmount(strategy, rewardAmount);

        flywheel.addStrategyForRewards(strategy);

        uint256 accrued = flywheel.accrue(strategy, user);
        (uint224 index, ) = flywheel.strategyState(strategy);

        uint256 diff = (rewardAmount * ONE) / (uint256(userBalance1) + userBalance2);

        require(index == ONE + diff);
        require(flywheel.userIndex(strategy, user) == index);
        require(flywheel.rewardsAccrued(user) == (diff * userBalance1) / ONE);
        require(accrued == (diff * userBalance1) / ONE);
        require(flywheel.rewardsAccrued(user2) == 0 ether);

        require(rewardToken.balanceOf(address(rewards)) == rewardAmount);
    }

    function test_accrue_TwoUsersCanBeAccrued(
        uint128 userBalance1,
        uint128 userBalance2,
        uint128 rewardAmount
    ) public {
        vm.assume(userBalance1 != 0 && userBalance2 != 0 && rewardAmount != 0);

        strategy.mint(user, userBalance1);
        strategy.mint(user2, userBalance2);

        rewardToken.mint(address(rewards), rewardAmount);
        rewards.setRewardsAmount(strategy, rewardAmount);

        flywheel.addStrategyForRewards(strategy);

        (uint256 accrued1, uint256 accrued2) = flywheel.accrue(strategy, user, user2);

        (uint224 index, ) = flywheel.strategyState(strategy);

        uint256 diff = (rewardAmount * ONE) / (uint256(userBalance1) + userBalance2);

        require(index == ONE + diff);
        require(flywheel.userIndex(strategy, user) == index);
        require(flywheel.userIndex(strategy, user2) == index);
        require(flywheel.rewardsAccrued(user) == (diff * userBalance1) / ONE);
        require(flywheel.rewardsAccrued(user2) == (diff * userBalance2) / ONE);
        require(accrued1 == (diff * userBalance1) / ONE);
        require(accrued2 == (diff * userBalance2) / ONE);

        require(rewardToken.balanceOf(address(rewards)) == rewardAmount);
    }

    function test_accrue_AccrueBeforeAddStrategy(uint128 mintAmount, uint128 rewardAmount) public {
        strategy.mint(user, mintAmount);

        rewardToken.mint(address(rewards), rewardAmount);
        rewards.setRewardsAmount(strategy, rewardAmount);

        require(flywheel.accrue(strategy, user) == 0);
    }

    function test_accrue_AccrueTwoUsersBeforeAddStrategy() public {
        strategy.mint(user, 1 ether);
        strategy.mint(user2, 3 ether);

        rewardToken.mint(address(rewards), 10 ether);
        rewards.setRewardsAmount(strategy, 10 ether);

        (uint256 accrued1, uint256 accrued2) = flywheel.accrue(strategy, user, user2);

        require(accrued1 == 0);
        require(accrued2 == 0);
    }

    function test_accrue_AccrueTwoUsersSeparately() public {
        strategy.mint(user, 1 ether);
        strategy.mint(user2, 3 ether);

        rewardToken.mint(address(rewards), 10 ether);
        rewards.setRewardsAmount(strategy, 10 ether);

        flywheel.addStrategyForRewards(strategy);

        uint256 accrued = flywheel.accrue(strategy, user);

        rewards.setRewardsAmount(strategy, 0);

        uint256 accrued2 = flywheel.accrue(strategy, user2);

        (uint224 index, ) = flywheel.strategyState(strategy);

        require(index == ONE + 2.5 ether);
        require(flywheel.userIndex(strategy, user) == index);
        require(flywheel.rewardsAccrued(user) == 2.5 ether);
        require(flywheel.rewardsAccrued(user2) == 7.5 ether);
        require(accrued == 2.5 ether);
        require(accrued2 == 7.5 ether);

        require(rewardToken.balanceOf(address(rewards)) == 10 ether);
    }

    function test_accrue_AccrueSecondUserLater() public {
        strategy.mint(user, 1 ether);

        rewardToken.mint(address(rewards), 10 ether);
        rewards.setRewardsAmount(strategy, 10 ether);

        flywheel.addStrategyForRewards(strategy);

        (uint256 accrued, uint256 accrued2) = flywheel.accrue(strategy, user, user2);

        (uint224 index, ) = flywheel.strategyState(strategy);

        require(index == ONE + 10 ether);
        require(flywheel.userIndex(strategy, user) == index);
        require(flywheel.rewardsAccrued(user) == 10 ether);
        require(flywheel.rewardsAccrued(user2) == 0);
        require(accrued == 10 ether);
        require(accrued2 == 0);

        require(rewardToken.balanceOf(address(rewards)) == 10 ether);

        strategy.mint(user2, 3 ether);

        rewardToken.mint(address(rewards), 4 ether);
        rewards.setRewardsAmount(strategy, 4 ether);

        (accrued, accrued2) = flywheel.accrue(strategy, user, user2);

        (index, ) = flywheel.strategyState(strategy);

        require(index == ONE + 11 ether);
        require(flywheel.userIndex(strategy, user) == index);
        require(flywheel.rewardsAccrued(user) == 11 ether);
        require(flywheel.rewardsAccrued(user2) == 3 ether);
        require(accrued == 11 ether);
        require(accrued2 == 3 ether);

        require(rewardToken.balanceOf(address(rewards)) == 14 ether);
    }

    function test_claimRewards_UserCanClaim(
        uint128 userBalance1,
        uint128 userBalance2,
        uint128 rewardAmount
    ) public {
        vm.assume(userBalance1 != 0 && userBalance2 != 0 && rewardAmount != 0);

        test_accrue_UserCanBeAccrued(userBalance1, userBalance2, rewardAmount);
        flywheel.claimRewards(user);

        uint256 diff = (rewardAmount * ONE) / (uint256(userBalance1) + userBalance2);
        uint256 accrued = (diff * userBalance1) / ONE;

        require(rewardToken.balanceOf(address(rewards)) == rewardAmount - accrued);
        require(rewardToken.balanceOf(user) == accrued);
        require(flywheel.rewardsAccrued(user) == 0);

        flywheel.claimRewards(user);
    }

    function test_rewardsAccrued_BoostedRewardsAccrued(
        uint128 userBalance1,
        uint128 userBalance2,
        uint128 rewardAmount,
        uint128 boost
    ) public {
        vm.assume(userBalance1 != 0 && userBalance2 != 0 && rewardAmount != 0);

        booster.setBoost(user, boost);

        flywheel.setBooster(IFlywheelBooster(address(booster)));

        strategy.mint(user, userBalance1);
        strategy.mint(user2, userBalance2);

        rewardToken.mint(address(rewards), rewardAmount);
        rewards.setRewardsAmount(strategy, rewardAmount);

        flywheel.addStrategyForRewards(strategy);

        uint256 accrued = flywheel.accrue(strategy, user);

        (uint224 index, ) = flywheel.strategyState(strategy);

        uint256 diff = (rewardAmount * ONE) / (uint256(userBalance1) + userBalance2 + boost);
        uint256 user1Boosted = uint256(userBalance1) + boost;

        require(index == ONE + diff);
        require(flywheel.userIndex(strategy, user) == index);
        require(flywheel.rewardsAccrued(user) == (diff * user1Boosted) / ONE);
        require(accrued == (diff * user1Boosted) / ONE);

        require(flywheel.rewardsAccrued(user2) == 0 ether);

        require(rewardToken.balanceOf(address(rewards)) == rewardAmount);
    }

    function test_updateFeeSettings_UpdateFeeSettings(uint256 fee, address feeRecipient) public {
        vm.assume(flywheel.feeRecipient() != feeRecipient);
        
        flywheel.updateFeeSettings(fee, feeRecipient);
        assertEq(flywheel.performanceFee(), fee);
        assertEq(flywheel.feeRecipient(), feeRecipient);
    }

    function test_updateFeeSettings_Unauthorized(uint256 fee, address feeRecipient, address caller) public {
        vm.assume(flywheel.feeRecipient() != feeRecipient && caller != flywheel.owner());
        
        vm.prank(caller);
        vm.expectRevert(bytes("Ownable: caller is not the owner"));
        flywheel.updateFeeSettings(fee, feeRecipient);
    }

    function test_takeRewardsFromUser_RewardsCanBeTakenFromUser(
        address user1,
        uint256 userBalance1,
        uint256 rewardAmount,
        address receiver
    ) public {
        vm.assume(userBalance1 != 0 && rewardAmount != 0 && rewardAmount < 1e25 && userBalance1 < 1e25 );
        strategy.mint(user1, userBalance1);

        rewardToken.mint(address(rewards), rewardAmount);
        rewards.setRewardsAmount(strategy, rewardAmount);

        flywheel.addStrategyForRewards(strategy);

        uint256 accrued = flywheel.accrue(strategy, user1);

        emissionsManager.blacklistUser(user1);
        vm.prank(address(emissionsManager));
        flywheel.takeRewardsFromUser(user1, receiver);

        assertEq(rewardToken.balanceOf(address(rewards)), rewardAmount - accrued);
        assertEq(rewardToken.balanceOf(receiver), accrued);
        assertEq(flywheel.rewardsAccrued(user1), 0);
    }

    function test_takeRewardsFromUser_test_addStrategyForRewards_Unauthorized(
        address user1,
        uint256 userBalance1,
        uint256 rewardAmount,
        address receiver
    ) public {
        vm.assume(userBalance1 != 0 && rewardAmount != 0 && rewardAmount < 1e25 && userBalance1 < 1e25 );
        strategy.mint(user1, userBalance1);

        rewardToken.mint(address(rewards), rewardAmount);
        rewards.setRewardsAmount(strategy, rewardAmount);

        flywheel.addStrategyForRewards(strategy);

        uint256 accrued = flywheel.accrue(strategy, user1);

        emissionsManager.blacklistUser(user1);
        vm.expectRevert(bytes("!emissionsManager"));
        flywheel.takeRewardsFromUser(user1, receiver);
    }

    function test_setEmissionsManager_SetNewEmissionsManager(address newEmissionsManager) public {
        
        flywheel.setEmissionsManager(IEmissionsManager(newEmissionsManager));
        assertEq(address(flywheel.emissionsManager()), newEmissionsManager);
    }

    function test_setEmissionsManager_Unauthorized(address newEmissionsManager, address caller) public {
        vm.assume(caller != flywheel.owner());
        
        vm.prank(caller);
        vm.expectRevert(bytes("Ownable: caller is not the owner"));
        flywheel.setEmissionsManager(IEmissionsManager(newEmissionsManager));
    }

    function test_whitelistUser_UserCanBeWhitelisted(address user1) public {
        vm.prank(address(emissionsManager));
        flywheel.whitelistUser(strategy, user1);
        assertEq(flywheel.blacklistedSupply(strategy), 0);
        assertEq(flywheel.userBlacklistedSupply(strategy, user1), 0);
    }

    function test_whitelistUser_Unauthorized(address user1, address caller) public {
        vm.assume(caller != address(emissionsManager));

        vm.prank(caller);
        vm.expectRevert(bytes("!emissionsManager"));
        flywheel.whitelistUser(strategy, user1);
    }

    function test_updateBlacklistBalances_UserCanBeWhitelisted(address user1, uint256 userBalance1) public {
        vm.assume(userBalance1 < 1e25);

        emissionsManager.blacklistUser(user1);
        strategy.mint(user1, userBalance1);

        vm.prank(address(emissionsManager));
        flywheel.updateBlacklistBalances(strategy, user1);
        assertEq(flywheel.blacklistedSupply(strategy), userBalance1);
        assertEq(flywheel.userBlacklistedSupply(strategy, user1), userBalance1);
    }

    function test_updateBlacklistBalances_Unauthorized(address user1, address caller) public {
        emissionsManager.blacklistUser(user1);

        vm.assume(caller != address(emissionsManager));
        
        vm.prank(caller);
        vm.expectRevert(bytes("!emissionsManager"));
        flywheel.updateBlacklistBalances(strategy, user1);
    }
}
