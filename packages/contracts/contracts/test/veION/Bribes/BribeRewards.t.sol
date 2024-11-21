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

  function test_earned_MultipleBribeRewardsSandbox() public {
    bribeTokenA.mint(address(this), 1_000_000 ether);
    bribeTokenA.approve(address(bribeRewards), 1_000_000 ether);
    bribeTokenB.mint(address(this), 1_000_000 ether);
    bribeTokenB.approve(address(bribeRewards), 1_000_000 ether);
    bribeTokenC.mint(address(this), 1_000_000 ether);
    bribeTokenC.approve(address(bribeRewards), 1_000_000 ether);

    bribeRewards.notifyRewardAmount(address(bribeTokenA), 1000 ether);
    bribeRewards.notifyRewardAmount(address(bribeTokenB), 1000 ether);
    bribeRewards.notifyRewardAmount(address(bribeTokenC), 1000 ether);
    bribeRewards.setHistoricalPrices(block.timestamp, lpTokenA, 3e18);
    bribeRewards.setHistoricalPrices(block.timestamp, lpTokenB, 5e18);

    vm.startPrank(address(voter));
    bribeRewards.deposit(lpTokenA, amount, tokenId);
    vm.warp(block.timestamp + 3 days);
    bribeRewards.deposit(lpTokenB, amount, tokenId);
    vm.stopPrank();

    emit log_named_uint("Current Timestamp", block.timestamp);
    uint256 epochStart = IonicTimeLibrary.epochStart(block.timestamp);
    console.log("----------------------------------------------------------------");
    emit log_named_uint("Epoch Start", epochStart);

    uint256 priorBalanceIndexA = bribeRewards.getPriorBalanceIndex(tokenId, lpTokenA, block.timestamp);
    uint256 priorBalanceIndexB = bribeRewards.getPriorBalanceIndex(tokenId, lpTokenB, block.timestamp);
    BribeRewards.Checkpoint memory checkpointA = bribeRewards.getCheckpoint(tokenId, lpTokenA, priorBalanceIndexA);
    BribeRewards.Checkpoint memory checkpointB = bribeRewards.getCheckpoint(tokenId, lpTokenB, priorBalanceIndexB);

    emit log_named_uint("Prior Balance Index for lpTokenA", priorBalanceIndexA);
    emit log_named_uint("Prior Balance Index for lpTokenB", priorBalanceIndexB);

    emit log_named_uint("Checkpoint lpTokenA Timestamp", checkpointA.timestamp);
    emit log_named_uint("Checkpoint lpTokenA BalanceOf", checkpointA.balanceOf);
    emit log_named_uint("Checkpoint lpTokenB Timestamp", checkpointB.timestamp);
    emit log_named_uint("Checkpoint lpTokenB BalanceOf", checkpointB.balanceOf);

    uint256 tokenRewardsEpochA = bribeRewards.tokenRewardsPerEpoch(address(bribeTokenA), epochStart);
    uint256 tokenRewardsEpochB = bribeRewards.tokenRewardsPerEpoch(address(bribeTokenB), epochStart);
    uint256 tokenRewardsEpochC = bribeRewards.tokenRewardsPerEpoch(address(bribeTokenC), epochStart);

    emit log_named_uint("Token Rewards for bribeTokenA in current epoch", tokenRewardsEpochA);
    emit log_named_uint("Token Rewards for bribeTokenB in current epoch", tokenRewardsEpochB);
    emit log_named_uint("Token Rewards for bribeTokenC in current epoch", tokenRewardsEpochC);

    uint256 historicalPriceA = bribeRewards.historicalPrices(lpTokenA, epochStart);
    uint256 historicalPriceB = bribeRewards.historicalPrices(lpTokenB, epochStart);

    emit log_named_uint("Historical Price for lpTokenA in current epoch", historicalPriceA);
    emit log_named_uint("Historical Price for lpTokenB in current epoch", historicalPriceB);
    console.log("----------------------------------------------------------------");

    vm.warp(block.timestamp + 4 days - 2);

    // uint256 earnedA = bribeRewards.earned(address(bribeTokenA), tokenId);
    // uint256 earnedB = bribeRewards.earned(address(bribeTokenB), tokenId);
    // uint256 earnedC = bribeRewards.earned(address(bribeTokenC), tokenId);

    // emit log_named_uint("Earned rewards for bribeTokenA", earnedA);
    // emit log_named_uint("Earned rewards for bribeTokenB", earnedB);
    // emit log_named_uint("Earned rewards for bribeTokenC", earnedC);

    // START OF NEW EPOCH
    vm.warp(block.timestamp + 1); //604800

    bribeRewards.notifyRewardAmount(address(bribeTokenA), 1000 ether);
    bribeRewards.notifyRewardAmount(address(bribeTokenB), 1000 ether);
    bribeRewards.notifyRewardAmount(address(bribeTokenC), 1000 ether);

    bribeRewards.setHistoricalPrices(block.timestamp, lpTokenA, 1e18);
    bribeRewards.setHistoricalPrices(block.timestamp, lpTokenB, 2e18);

    vm.warp(block.timestamp + 3 days);
    vm.warp(block.timestamp + 4 days - 1);
    vm.warp(block.timestamp + 1);
    emit log_named_uint("Block Timestamp", block.timestamp);

    bribeRewards.notifyRewardAmount(address(bribeTokenA), 1000 ether);
    bribeRewards.notifyRewardAmount(address(bribeTokenB), 1000 ether);
    bribeRewards.notifyRewardAmount(address(bribeTokenC), 1000 ether);

    bribeRewards.setHistoricalPrices(block.timestamp, lpTokenA, 1e18);
    bribeRewards.setHistoricalPrices(block.timestamp, lpTokenB, 2e18);

    vm.warp(block.timestamp + 7 days);
    emit log_named_uint("Block Timestamp", block.timestamp);

    bribeRewards.notifyRewardAmount(address(bribeTokenA), 1000 ether);
    bribeRewards.notifyRewardAmount(address(bribeTokenB), 1000 ether);
    bribeRewards.notifyRewardAmount(address(bribeTokenC), 1000 ether);

    bribeRewards.setHistoricalPrices(block.timestamp, lpTokenA, 1.1e18);
    bribeRewards.setHistoricalPrices(block.timestamp, lpTokenB, 2.1e18);

    vm.warp(block.timestamp + 7 days);
    emit log_named_uint("Block Timestamp", block.timestamp);

    bribeRewards.notifyRewardAmount(address(bribeTokenA), 1000 ether);
    bribeRewards.notifyRewardAmount(address(bribeTokenB), 1000 ether);
    bribeRewards.notifyRewardAmount(address(bribeTokenC), 1000 ether);

    bribeRewards.setHistoricalPrices(block.timestamp, lpTokenA, 1.2e18);
    bribeRewards.setHistoricalPrices(block.timestamp, lpTokenB, 2.2e18);
    vm.warp(block.timestamp + 7 days);

    emit log_named_uint("Block Timestamp", block.timestamp);

    bribeRewards.notifyRewardAmount(address(bribeTokenA), 1000 ether);
    bribeRewards.notifyRewardAmount(address(bribeTokenB), 1000 ether);
    bribeRewards.notifyRewardAmount(address(bribeTokenC), 1000 ether);

    bribeRewards.setHistoricalPrices(block.timestamp, lpTokenA, 1.3e18);
    bribeRewards.setHistoricalPrices(block.timestamp, lpTokenB, 2.3e18);

    vm.warp(block.timestamp + 7 days);
    bribeRewards.notifyRewardAmount(address(bribeTokenA), 1000 ether);
    bribeRewards.notifyRewardAmount(address(bribeTokenB), 1000 ether);
    bribeRewards.notifyRewardAmount(address(bribeTokenC), 1000 ether);

    bribeRewards.setHistoricalPrices(block.timestamp, lpTokenA, 1.3e18);
    bribeRewards.setHistoricalPrices(block.timestamp, lpTokenB, 2.3e18);

    vm.startPrank(address(voter));
    bribeRewards.withdraw(lpTokenA, 1000 ether, tokenId);
    bribeRewards.withdraw(lpTokenB, 1000 ether, tokenId);
    vm.stopPrank();

    vm.warp(block.timestamp + 7 days);

    for (uint256 i = 0; i < 5; i++) {
      emit log_named_uint("Block Timestamp", block.timestamp);

      bribeRewards.notifyRewardAmount(address(bribeTokenA), 1000 ether);
      bribeRewards.notifyRewardAmount(address(bribeTokenB), 1000 ether);
      bribeRewards.notifyRewardAmount(address(bribeTokenC), 1000 ether);

      bribeRewards.setHistoricalPrices(block.timestamp, lpTokenA, 1.3e18 + (i * 0.1e18));
      bribeRewards.setHistoricalPrices(block.timestamp, lpTokenB, 2.3e18 + (i * 0.1e18));

      vm.warp(block.timestamp + 7 days);
    }

    uint256 earnedA = bribeRewards.earned(address(bribeTokenA), tokenId);
    emit log_named_uint("Earned rewards for bribeTokenA", earnedA);

    uint256 priorBalanceIndex = bribeRewards.getPriorBalanceIndex(tokenId, lpTokenA, block.timestamp);
    emit log_named_uint("Prior Balance Index for current timestamp and lpTokenA", priorBalanceIndex);
    BribeRewards.Checkpoint memory checkpoint = bribeRewards.getCheckpoint(tokenId, lpTokenA, priorBalanceIndex);
    emit log_named_uint("Prior Balance Index for current timestamp and lpTokenA", priorBalanceIndex);
    emit log_named_uint("Checkpoint Timestamp", checkpoint.timestamp);
    emit log_named_uint("Checkpoint BalanceOf", checkpoint.balanceOf);
  }

  function test_earned_PriorBalanceIndexShouldRemainConstantIfDepositInSameEpoch() public {
    bribeTokenA.mint(address(this), 1_000_000 ether);
    bribeTokenA.approve(address(bribeRewards), 1_000_000 ether);
    bribeTokenB.mint(address(this), 1_000_000 ether);
    bribeTokenB.approve(address(bribeRewards), 1_000_000 ether);
    bribeTokenC.mint(address(this), 1_000_000 ether);
    bribeTokenC.approve(address(bribeRewards), 1_000_000 ether);

    bribeRewards.notifyRewardAmount(address(bribeTokenA), 1000 ether);
    bribeRewards.notifyRewardAmount(address(bribeTokenB), 1000 ether);
    bribeRewards.notifyRewardAmount(address(bribeTokenC), 1000 ether);
    bribeRewards.setHistoricalPrices(block.timestamp, lpTokenA, 3e18);
    bribeRewards.setHistoricalPrices(block.timestamp, lpTokenB, 5e18);

    vm.startPrank(address(voter));
    bribeRewards.deposit(lpTokenA, amount, tokenId);
    vm.warp(block.timestamp + 1 days);
    bribeRewards.deposit(lpTokenB, amount / 2, tokenId);
    vm.warp(block.timestamp + 1 days);
    bribeRewards.deposit(lpTokenA, amount / 2, tokenId);
    vm.warp(block.timestamp + 1 days);
    bribeRewards.deposit(lpTokenB, amount / 2, tokenId);
    vm.warp(block.timestamp + 1 days);
    bribeRewards.deposit(lpTokenA, amount / 2, tokenId);
    vm.warp(block.timestamp + 1 days);
    bribeRewards.deposit(lpTokenB, amount / 2, tokenId);
    vm.stopPrank();

    vm.warp(block.timestamp + 10 weeks);

    uint256 priorBalanceIndexA = bribeRewards.getPriorBalanceIndex(tokenId, lpTokenA, block.timestamp);
    uint256 priorBalanceIndexB = bribeRewards.getPriorBalanceIndex(tokenId, lpTokenB, block.timestamp);

    emit log_named_uint("Prior Balance Index for lpTokenA", priorBalanceIndexA);
    emit log_named_uint("Prior Balance Index for lpTokenB", priorBalanceIndexB);

    assertEq(priorBalanceIndexA, 0, "Prior Balance Index for lpTokenA should be 0");
    assertEq(priorBalanceIndexB, 0, "Prior Balance Index for lpTokenB should be 0");
  }

  function test_earned_MultipleDepositors() public {
    bribeTokenA.mint(address(this), type(uint256).max);
    bribeTokenB.mint(address(this), type(uint256).max);
    bribeTokenC.mint(address(this), type(uint256).max);
    bribeTokenA.approve(address(bribeRewards), type(uint256).max);
    bribeTokenB.approve(address(bribeRewards), type(uint256).max);
    bribeTokenC.approve(address(bribeRewards), type(uint256).max);

    uint256 numEpochs = 10;
    uint256 numTokenIds = 20;

    address[] memory lpTokens = new address[](2);
    lpTokens[0] = lpTokenA;
    lpTokens[1] = lpTokenB;
    uint256[] memory tokenIds = new uint256[](numTokenIds);
    for (uint256 i = 0; i < tokenIds.length; i++) {
      tokenIds[i] = i;
    }

    for (uint256 epoch = 0; epoch < numEpochs; epoch++) {
      _performDeposits(lpTokens, tokenIds, 1 ether, 100 ether);

      bribeRewards.notifyRewardAmount(address(bribeTokenA), 100 ether);
      bribeRewards.notifyRewardAmount(address(bribeTokenB), 100 ether);
      bribeRewards.notifyRewardAmount(address(bribeTokenC), 100 ether);

      bribeRewards.setHistoricalPrices(block.timestamp, lpTokenA, 3e18);
      bribeRewards.setHistoricalPrices(block.timestamp, lpTokenB, 5e18);

      vm.warp(block.timestamp + 1 weeks); // Advance time by one epoch (assuming 1 week per epoch)
    }

    uint256 totalSupplyA = bribeRewards.totalSupply(lpTokenA);
    uint256 totalSupplyB = bribeRewards.totalSupply(lpTokenB);
    emit log_named_uint("Total Supply for lpTokenA", totalSupplyA / 1e18);
    emit log_named_uint("Total Supply for lpTokenB", totalSupplyB / 1e18);
    emit log("----------------------------------------------------------------");

    for (uint256 i = 0; i < tokenIds.length; i++) {
      vm.startPrank(user);

      uint256 balanceA = bribeRewards.balanceOf(i, lpTokenA);
      uint256 balanceB = bribeRewards.balanceOf(i, lpTokenB);

      emit log_named_uint("Token ID", i);
      emit log_named_uint(string(abi.encodePacked("Balance of user for lpTokenA")), balanceA / 1e18);
      emit log_named_uint(string(abi.encodePacked("Balance of user for lpTokenB")), balanceB / 1e18);
      emit log("----------------------------------------------------------------");

      vm.stopPrank();
    }

    uint256 totalBribeTokenA = bribeTokenA.balanceOf(address(bribeRewards));
    uint256 totalBribeTokenB = bribeTokenB.balanceOf(address(bribeRewards));
    uint256 totalBribeTokenC = bribeTokenC.balanceOf(address(bribeRewards));

    emit log_named_uint("Total Bribe Token A in Contract", totalBribeTokenA / 1e18);
    emit log_named_uint("Total Bribe Token B in Contract", totalBribeTokenB / 1e18);
    emit log_named_uint("Total Bribe Token C in Contract", totalBribeTokenC / 1e18);
    emit log("----------------------------------------------------------------");

    address randomUser = address(0x1234);
    uint256 tokenIdToMock = tokenIds[0];

    vm.mockCall(
      address(ve),
      abi.encodeWithSelector(ERC721Upgradeable.ownerOf.selector, tokenIdToMock),
      abi.encode(randomUser)
    );

    address[] memory rewardTokens = new address[](3);
    rewardTokens[0] = address(bribeTokenA);
    rewardTokens[1] = address(bribeTokenB);
    rewardTokens[2] = address(bribeTokenC);

    vm.prank(voter);
    bribeRewards.getReward(tokenIdToMock, rewardTokens);

    uint256 balanceForTokenIdToMockA = bribeRewards.balanceOf(tokenIdToMock, lpTokenA);
    uint256 balanceForTokenIdToMockB = bribeRewards.balanceOf(tokenIdToMock, lpTokenB);

    emit log_named_uint("Balance for tokenIdToMock for lpTokenA", balanceForTokenIdToMockA / 1e18);
    emit log_named_uint("Balance for tokenIdToMock for lpTokenB", balanceForTokenIdToMockB / 1e18);
    emit log("----------------------------------------------------------------");

    uint256 userBribeTokenABalance = bribeTokenA.balanceOf(randomUser);
    emit log_named_uint("User Bribe Token A Balance after Redemption", userBribeTokenABalance / 1e18);

    uint256 expectedRewardA = (totalBribeTokenA * 5) / 100;
    uint256 actualRewardA = userBribeTokenABalance;

    emit log_named_uint("Expected Reward for User (5% of Total Bribe Token A)", expectedRewardA / 1e18);
    emit log_named_uint("Actual Reward for User for Bribe Token A", actualRewardA / 1e18);

    assertApproxEqAbs(actualRewardA, expectedRewardA, 50 ether, "Bribe Token A reward does not match expected value");

    uint256 userBribeTokenBBalance = bribeTokenB.balanceOf(randomUser);
    emit log_named_uint("User Bribe Token B Balance after Redemption", userBribeTokenBBalance / 1e18);

    uint256 expectedRewardB = (totalBribeTokenB * 5) / 100;
    uint256 actualRewardB = userBribeTokenBBalance;

    emit log_named_uint("Expected Reward for User (5% of Total Bribe Token B)", expectedRewardB / 1e18);
    emit log_named_uint("Actual Reward for User for Bribe Token B", actualRewardB / 1e18);

    assertApproxEqAbs(actualRewardB, expectedRewardB, 50 ether, "Bribe Token B reward does not match expected value");

    uint256 userBribeTokenCBalance = bribeTokenC.balanceOf(randomUser);
    emit log_named_uint("User Bribe Token C Balance after Redemption", userBribeTokenCBalance / 1e18);

    uint256 expectedRewardC = (totalBribeTokenC * 5) / 100;
    uint256 actualRewardC = userBribeTokenCBalance;

    emit log_named_uint("Expected Reward for User (5% of Total Bribe Token C)", expectedRewardC / 1e18);
    emit log_named_uint("Actual Reward for User for Bribe Token C", actualRewardC / 1e18);

    assertApproxEqAbs(actualRewardC, expectedRewardC, 50 ether, "Bribe Token C reward does not match expected value");
  }

  function test_earned_UserWithdraws() public {
    bribeTokenA.mint(address(this), type(uint256).max);
    bribeTokenB.mint(address(this), type(uint256).max);
    bribeTokenC.mint(address(this), type(uint256).max);
    bribeTokenA.approve(address(bribeRewards), type(uint256).max);
    bribeTokenB.approve(address(bribeRewards), type(uint256).max);
    bribeTokenC.approve(address(bribeRewards), type(uint256).max);

    uint256 numEpochs = 10;
    uint256 numTokenIds = 20;

    address[] memory lpTokens = new address[](2);
    lpTokens[0] = lpTokenA;
    lpTokens[1] = lpTokenB;
    uint256[] memory tokenIds = new uint256[](numTokenIds);
    for (uint256 i = 0; i < tokenIds.length; i++) {
      tokenIds[i] = i;
    }

    for (uint256 epoch = 0; epoch < numEpochs; epoch++) {
      _performDeposits(lpTokens, tokenIds, 1 ether, 100 ether);

      bribeRewards.notifyRewardAmount(address(bribeTokenA), 100 ether);
      bribeRewards.notifyRewardAmount(address(bribeTokenB), 100 ether);
      bribeRewards.notifyRewardAmount(address(bribeTokenC), 100 ether);

      bribeRewards.setHistoricalPrices(block.timestamp, lpTokenA, 3e18);
      bribeRewards.setHistoricalPrices(block.timestamp, lpTokenB, 5e18);

      vm.warp(block.timestamp + 1 weeks); //
    }

    uint256 tokenIdToWithdraw = tokenIds[0];
    for (uint256 j = 0; j < lpTokens.length; j++) {
      address selectedLpToken = lpTokens[j];
      uint256 balanceBeforeWithdraw = bribeRewards.balanceOf(tokenIdToWithdraw, selectedLpToken);

      vm.prank(address(voter));
      bribeRewards.withdraw(selectedLpToken, balanceBeforeWithdraw, tokenIdToWithdraw);
    }
    uint256 tokenIdNotWithdrawn = tokenIds[1];

    uint256 earnedForTokenIdNotWithdrawn = bribeRewards.earned(address(bribeTokenA), tokenIdNotWithdrawn);
    emit log_named_uint("Earned for Bribe Token A for Token ID not withdrawn", earnedForTokenIdNotWithdrawn / 1e18);

    uint256 totalEarnedABefore = bribeRewards.earned(address(bribeTokenA), tokenIdToWithdraw);
    emit log_named_uint("Total Earned for Bribe Token A after Withdraw", totalEarnedABefore / 1e18);

    for (uint256 epoch = 0; epoch < 30; epoch++) {
      bribeRewards.notifyRewardAmount(address(bribeTokenA), 100 ether);
      bribeRewards.notifyRewardAmount(address(bribeTokenB), 100 ether);
      bribeRewards.notifyRewardAmount(address(bribeTokenC), 100 ether);

      bribeRewards.setHistoricalPrices(block.timestamp, lpTokenA, 3e18);
      bribeRewards.setHistoricalPrices(block.timestamp, lpTokenB, 5e18);

      vm.warp(block.timestamp + 1 weeks);
    }

    uint256 totalEarnedAAfter = bribeRewards.earned(address(bribeTokenA), tokenIdToWithdraw);
    emit log_named_uint("Total Earned for Bribe Token A after timeskip", totalEarnedAAfter / 1e18);

    assertEq(
      totalEarnedABefore,
      totalEarnedAAfter,
      "Total earned for Bribe Token A should be the same before and after."
    );

    uint256 earnedForNotWithdrawn = bribeRewards.earned(address(bribeTokenA), tokenIdNotWithdrawn);
    emit log_named_uint("Earned for Bribe Token A for Token ID that didn't withdraw", earnedForNotWithdrawn / 1e18);

    assertGt(
      earnedForNotWithdrawn,
      totalEarnedAAfter,
      "Token ID that did not withdraw should have more earned than the token ID that withdrew."
    );
  }

  function test_earned_RewardCalculationResetsAfterCollectingReward() public {
    bribeTokenA.mint(address(this), type(uint256).max);
    bribeTokenB.mint(address(this), type(uint256).max);
    bribeTokenC.mint(address(this), type(uint256).max);
    bribeTokenA.approve(address(bribeRewards), type(uint256).max);
    bribeTokenB.approve(address(bribeRewards), type(uint256).max);
    bribeTokenC.approve(address(bribeRewards), type(uint256).max);

    uint256 numEpochs = 10;
    uint256 numTokenIds = 20;

    address[] memory lpTokens = new address[](2);
    lpTokens[0] = lpTokenA;
    lpTokens[1] = lpTokenB;
    uint256[] memory tokenIds = new uint256[](numTokenIds);
    for (uint256 i = 0; i < tokenIds.length; i++) {
      tokenIds[i] = i;
    }

    for (uint256 epoch = 0; epoch < numEpochs; epoch++) {
      _performDeposits(lpTokens, tokenIds, 1 ether, 100 ether);

      bribeRewards.notifyRewardAmount(address(bribeTokenA), 100 ether);
      bribeRewards.notifyRewardAmount(address(bribeTokenB), 100 ether);
      bribeRewards.notifyRewardAmount(address(bribeTokenC), 100 ether);

      bribeRewards.setHistoricalPrices(block.timestamp, lpTokenA, 3e18);
      bribeRewards.setHistoricalPrices(block.timestamp, lpTokenB, 5e18);

      vm.warp(block.timestamp + 1 weeks);
    }

    uint256 tokenIdThatClaims = tokenIds[0];
    uint256 tokenIdThatDontClaim = tokenIds[1];

    vm.mockCall(
      address(ve),
      abi.encodeWithSelector(ERC721Upgradeable.ownerOf.selector, tokenIdThatClaims),
      abi.encode(address(this))
    );

    address[] memory bribeTokens = new address[](3);
    bribeTokens[0] = address(bribeTokenA);
    bribeTokens[1] = address(bribeTokenB);
    bribeTokens[2] = address(bribeTokenC);
    vm.prank(address(voter));
    bribeRewards.getReward(tokenIdThatClaims, bribeTokens);

    for (uint256 epoch = 0; epoch < numEpochs; epoch++) {
      _performDeposits(lpTokens, tokenIds, 1 ether, 100 ether);

      bribeRewards.notifyRewardAmount(address(bribeTokenA), 100 ether);
      bribeRewards.notifyRewardAmount(address(bribeTokenB), 100 ether);
      bribeRewards.notifyRewardAmount(address(bribeTokenC), 100 ether);

      bribeRewards.setHistoricalPrices(block.timestamp, lpTokenA, 3e18);
      bribeRewards.setHistoricalPrices(block.timestamp, lpTokenB, 5e18);

      vm.warp(block.timestamp + 1 weeks);
    }

    uint256 earnedAfterClaim = bribeRewards.earned(address(bribeTokenA), tokenIdThatClaims);
    emit log_named_uint("Earned for Bribe Token A after claiming and 10 more epochs", earnedAfterClaim / 1e18);

    uint256 earnedNeverClaimed = bribeRewards.earned(address(bribeTokenA), tokenIdThatDontClaim);
    emit log_named_uint("Earned for Bribe Token A for user who never claimed", earnedNeverClaimed / 1e18);

    assertGt(
      earnedNeverClaimed,
      earnedAfterClaim,
      "User who never claimed should have more earned than the user who claimed."
    );
  }

  function test_earned_ClaimOnlyOneToken() public {
    bribeTokenA.mint(address(this), type(uint256).max);
    bribeTokenB.mint(address(this), type(uint256).max);
    bribeTokenC.mint(address(this), type(uint256).max);
    bribeTokenA.approve(address(bribeRewards), type(uint256).max);
    bribeTokenB.approve(address(bribeRewards), type(uint256).max);
    bribeTokenC.approve(address(bribeRewards), type(uint256).max);

    uint256 numEpochs = 10;
    uint256 numTokenIds = 20;

    address[] memory lpTokens = new address[](2);
    lpTokens[0] = lpTokenA;
    lpTokens[1] = lpTokenB;
    uint256[] memory tokenIds = new uint256[](numTokenIds);
    for (uint256 i = 0; i < tokenIds.length; i++) {
      tokenIds[i] = i;
    }

    for (uint256 epoch = 0; epoch < numEpochs; epoch++) {
      _performDeposits(lpTokens, tokenIds, 1 ether, 100 ether);

      bribeRewards.notifyRewardAmount(address(bribeTokenA), 100 ether);
      bribeRewards.notifyRewardAmount(address(bribeTokenB), 100 ether);
      bribeRewards.notifyRewardAmount(address(bribeTokenC), 100 ether);

      bribeRewards.setHistoricalPrices(block.timestamp, lpTokenA, 3e18);
      bribeRewards.setHistoricalPrices(block.timestamp, lpTokenB, 5e18);

      vm.warp(block.timestamp + 1 weeks);
    }

    address[] memory tokensToClaim = new address[](1);
    tokensToClaim[0] = address(bribeTokenA);

    uint256 tokenIdToClaim = tokenIds[0];

    vm.mockCall(
      address(ve),
      abi.encodeWithSelector(ERC721Upgradeable.ownerOf.selector, tokenIdToClaim),
      abi.encode(address(this))
    );

    vm.prank(address(voter));
    bribeRewards.getReward(tokenIdToClaim, tokensToClaim);

    for (uint256 epoch = 0; epoch < numEpochs; epoch++) {
      _performDeposits(lpTokens, tokenIds, 1 ether, 100 ether);

      bribeRewards.notifyRewardAmount(address(bribeTokenA), 100 ether);
      bribeRewards.notifyRewardAmount(address(bribeTokenB), 100 ether);
      bribeRewards.notifyRewardAmount(address(bribeTokenC), 100 ether);

      bribeRewards.setHistoricalPrices(block.timestamp, lpTokenA, 3e18);
      bribeRewards.setHistoricalPrices(block.timestamp, lpTokenB, 5e18);

      vm.warp(block.timestamp + 1 weeks);
    }

    uint256 earnedBribeA = bribeRewards.earned(address(bribeTokenA), tokenIdToClaim);
    uint256 earnedBribeB = bribeRewards.earned(address(bribeTokenB), tokenIdToClaim);
    uint256 earnedBribeC = bribeRewards.earned(address(bribeTokenC), tokenIdToClaim);

    emit log_named_uint("Earned for Bribe Token A", earnedBribeA / 1e18);
    emit log_named_uint("Earned for Bribe Token B", earnedBribeB / 1e18);
    emit log_named_uint("Earned for Bribe Token C", earnedBribeC / 1e18);

    assertGt(earnedBribeB, earnedBribeA, "Bribe Token B earned should be greater than Bribe Token A earned.");
    assertGt(earnedBribeC, earnedBribeA, "Bribe Token C earned should be greater than Bribe Token A earned.");
  }

  function _performDeposits(
    address[] memory lpTokens,
    uint256[] memory tokenIds,
    uint256 minDepositAmount,
    uint256 maxDepositAmount
  ) internal {
    lpTokens[0] = lpTokenA;
    lpTokens[1] = lpTokenB;

    for (uint256 i = 0; i < tokenIds.length; i++) {
      for (uint256 j = 0; j < lpTokens.length; j++) {
        address selectedLpToken = lpTokens[j];
        uint256 randomAmount = minDepositAmount +
          (uint256(keccak256(abi.encodePacked(block.timestamp, i, j))) % (maxDepositAmount - minDepositAmount));
        vm.prank(address(voter));
        bribeRewards.deposit(selectedLpToken, randomAmount, tokenIds[i]);
      }
    }
  }
}
