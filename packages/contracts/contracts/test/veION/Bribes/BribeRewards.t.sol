// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { MockERC20 } from "solmate/test/utils/mocks/MockERC20.sol";
import "forge-std/Test.sol";
import "../../../veION/BribeRewards.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../config/BaseTest.t.sol";
import "../../../veION/Voter.sol";
import "../../../oracles/MasterPriceOracle.sol";
import { SimplePriceOracle } from "../../../oracles/default/SimplePriceOracle.sol";
import "../../../veION/libraries/IonicTimeLibrary.sol";

contract BribeRewardsTest is BaseTest {
  MockERC20 bribeTokenA;
  MockERC20 bribeTokenB;
  MockERC20 bribeTokenC;
  BribeRewards bribeRewards;
  SimplePriceOracle simpleOracle;
  address ve = address(0x123);
  address voter = address(0x456);
  address rewardToken = 0x18470019bF0E94611f15852F7e93cf5D65BC34CA;
  address lpTokenA = address(0x5);
  address lpTokenB = address(0x6);
  uint256 tokenId = 1;
  uint256 amount = 1000 ether;
  address user = address(0x789);

  function afterForkSetUp() internal override {
    super.afterForkSetUp();
  }

  function setUp() public {
    bribeRewards = new BribeRewards();
    bribeRewards.initialize(address(voter), ve);

    address[] memory mockLpTokens = new address[](2);
    mockLpTokens[0] = lpTokenA;
    mockLpTokens[1] = lpTokenB;
    vm.mockCall(address(voter), abi.encodeWithSelector(IVoter.getAllLpRewardTokens.selector), abi.encode(mockLpTokens));

    bribeTokenA = new MockERC20("Bribe Token A", "BTA", 18);
    bribeTokenB = new MockERC20("Bribe Token B", "BTB", 18);
    bribeTokenC = new MockERC20("Bribe Token C", "BTC", 18);

    address[] memory bribeTokens = new address[](3);
    bribeTokens[0] = address(bribeTokenA);
    bribeTokens[1] = address(bribeTokenB);
    bribeTokens[2] = address(bribeTokenC);

    for (uint256 i = 0; i < bribeTokens.length; i++) {
      vm.mockCall(
        address(voter),
        abi.encodeWithSelector(IVoter.isWhitelistedToken.selector, bribeTokens[i]),
        abi.encode(true)
      );

      vm.mockCall(ve, abi.encodeWithSelector(ERC721Upgradeable.ownerOf.selector, tokenId), abi.encode(user));
    }
  }

  function test_deposit_VoterCanDeposit() public {
    vm.prank(address(voter));
    bribeRewards.deposit(lpTokenA, amount, tokenId);

    uint256 balance = bribeRewards.balanceOf(tokenId, lpTokenA);
    assertEq(balance, amount, "Balance should be equal to deposited amount");
    uint256 totalSupply = bribeRewards.totalSupply(lpTokenA);
    assertEq(totalSupply, amount, "Total supply should be equal to deposited amount");
  }

  function test_withdraw_VoterCanWithdraw() public {
    vm.prank(address(voter));
    bribeRewards.deposit(lpTokenA, amount, tokenId);

    vm.prank(address(voter));
    bribeRewards.withdraw(lpTokenA, amount, tokenId);

    uint256 balance = bribeRewards.balanceOf(tokenId, lpTokenA);
    assertEq(balance, 0, "Balance should be zero after withdrawal");
  }

  function test_getReward_VoterCanGetReward() public {
    bribeTokenA.mint(address(this), 1_000_000 ether);
    bribeTokenA.approve(address(bribeRewards), 1_000_000 ether);

    bribeRewards.notifyRewardAmount(address(bribeTokenA), 1_000_000 ether);

    address[] memory tokens = new address[](1);
    tokens[0] = address(bribeTokenA);

    vm.startPrank(address(voter));
    bribeRewards.deposit(lpTokenA, amount, tokenId);
    bribeRewards.getReward(tokenId, tokens);
    vm.stopPrank();

    uint256 lastEarned = bribeRewards.lastEarn(tokens[0], tokenId);
    assertEq(lastEarned, block.timestamp, "Last earned timestamp should be updated");
  }

  function test_earned_EarnedShouldBeCorrect() public {
    bribeTokenA.mint(address(this), 1_000_000 ether);
    bribeTokenA.approve(address(bribeRewards), 1_000_000 ether);

    vm.startPrank(address(voter));
    bribeRewards.deposit(lpTokenA, amount, tokenId);
    bribeRewards.deposit(lpTokenB, amount, tokenId);
    vm.stopPrank();

    emit log_named_uint("Current Timestamp", block.timestamp);

    bribeRewards.notifyRewardAmount(address(bribeTokenA), 1000 ether);
    bribeRewards.setHistoricalPrices(block.timestamp, lpTokenA, 3e18);
    bribeRewards.setHistoricalPrices(block.timestamp, lpTokenB, 5e18);
    vm.warp(block.timestamp + 1 weeks);

    emit log_named_uint("Current Timestamp", block.timestamp);
    emit log_named_uint("Epoch Start", IonicTimeLibrary.epochStart(block.timestamp));

    bribeRewards.notifyRewardAmount(address(bribeTokenA), 1000 ether);
    bribeRewards.setHistoricalPrices(block.timestamp, lpTokenA, 2e18);
    bribeRewards.setHistoricalPrices(block.timestamp, lpTokenB, 8e18);
    vm.warp(block.timestamp + 1 weeks);

    emit log_named_uint("Current Timestamp", block.timestamp);
    emit log_named_uint("Epoch Start", IonicTimeLibrary.epochStart(block.timestamp));

    uint256 earnedAmount = bribeRewards.earned(address(bribeTokenA), tokenId);
    emit log("--------------------------------------END EARNED--------------------------------------");
    emit log_named_uint("Earned amount", earnedAmount);
  }
}

// TODO try for multiple users with multiple LPs
