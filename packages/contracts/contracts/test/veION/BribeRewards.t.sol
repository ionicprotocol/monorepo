// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import { MockERC20 } from "solmate/test/utils/mocks/MockERC20.sol";
import "forge-std/Test.sol";
import "../../veION/BribeRewards.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../config/BaseTest.t.sol";
import "../../veION/Voter.sol";
import "../../oracles/MasterPriceOracle.sol";
import { SimplePriceOracle } from "../../oracles/default/SimplePriceOracle.sol";
import "../../veION/libraries/IonicTimeLibrary.sol";

contract BribeRewardsTest is BaseTest {
  MockERC20 bribeTokenA;
  MockERC20 bribeTokenB;
  MockERC20 bribeTokenC;
  BribeRewards bribeRewards;
  Voter voter;
  SimplePriceOracle simpleOracle;
  MasterPriceOracle mpo = MasterPriceOracle(0x2BAF3A2B667A5027a83101d218A9e8B73577F117);
  address token = address(0x4);
  address lpTokenA = address(0x5);
  address lpTokenB = address(0x6);
  uint256 tokenId = 1;
  uint256 amount = 1000 ether;

  function afterForkSetUp() internal override {
    super.afterForkSetUp();
    voter = new Voter();
    voter.initialize(new address[](0), address(0), MasterPriceOracle(mpo));
    bribeRewards = new BribeRewards();
    bribeRewards.initialize(address(voter), address(mpo));

    simpleOracle = new SimplePriceOracle();
    simpleOracle.initialize();

    simpleOracle.setDirectPrice(lpTokenA, 3e18); // Set price for lpTokenA
    simpleOracle.setDirectPrice(lpTokenB, 5e18); // Set price for lpTokenB

    address[] memory underlyings = new address[](2);
    underlyings[0] = lpTokenA;
    underlyings[1] = lpTokenB;

    BasePriceOracle[] memory _oracles = new BasePriceOracle[](2);
    _oracles[0] = simpleOracle;
    _oracles[1] = simpleOracle;

    vm.prank(mpo.admin());
    mpo.add(underlyings, _oracles);

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
      vm.prank(voter.governor());
      voter.whitelistToken(bribeTokens[i], true);
    }
  }

  function testBribeDeposit() public fork(MODE_MAINNET) {
    vm.prank(address(voter));
    bribeRewards._deposit(lpTokenA, amount, tokenId);

    uint256 balance = bribeRewards.balanceOf(tokenId, lpTokenA);
    assertEq(balance, amount, "Balance should be equal to deposited amount");
  }

  function testBribeWithdraw() public fork(MODE_MAINNET) {
    vm.prank(address(voter));
    bribeRewards._deposit(lpTokenA, amount, tokenId);

    vm.prank(address(voter));
    bribeRewards._withdraw(lpTokenA, amount, tokenId);

    uint256 balance = bribeRewards.balanceOf(tokenId, lpTokenA);
    assertEq(balance, 0, "Balance should be zero after withdrawal");
  }

  function testBribeGetReward() public fork(MODE_MAINNET) {
    address[] memory tokens = new address[](1);
    tokens[0] = token;

    vm.prank(address(voter));
    bribeRewards.notifyRewardAmount(token, amount);

    vm.prank(address(voter));
    bribeRewards.getReward(tokenId, tokens);

    uint256 lastEarned = bribeRewards.lastEarn(token, tokenId);
    assertEq(lastEarned, block.timestamp, "Last earned timestamp should be updated");
  }

  function testBribeEarned() public fork(MODE_MAINNET) {
    bribeTokenA.mint(address(this), 1_000_000 ether);
    bribeTokenA.approve(address(bribeRewards), 1_000_000 ether);

    vm.startPrank(address(voter));
    bribeRewards._deposit(lpTokenA, amount, tokenId);
    bribeRewards._deposit(lpTokenB, amount, tokenId);
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
