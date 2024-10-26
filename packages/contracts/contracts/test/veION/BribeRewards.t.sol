// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "forge-std/Test.sol";
import "../../veION/BribeRewards.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../config/BaseTest.t.sol";
import "../../veION/Voter.sol";

contract BribeRewardsTest is BaseTest {
  BribeRewards bribeRewards;
  Voter voter;
  address mpo = address(0x2);
  address token = address(0x4);
  address lpToken = address(0x5);
  uint256 tokenId = 1;
  uint256 amount = 1000;

  function afterForkSetUp() internal override {
    super.afterForkSetUp();
    voter = new Voter();
    voter.initialize(new address[](0), address(0), MasterPriceOracle(mpo));
    bribeRewards = new BribeRewards();
    bribeRewards.initialize(address(voter), mpo);
  }

  function testBribeDeposit() public fork(MODE_MAINNET) {
    vm.prank(address(voter));
    bribeRewards._deposit(lpToken, amount, tokenId);

    uint256 balance = bribeRewards.balanceOf(tokenId, lpToken);
    assertEq(balance, amount, "Balance should be equal to deposited amount");
  }

  function testBribeWithdraw() public fork(MODE_MAINNET) {
    vm.prank(address(voter));
    bribeRewards._deposit(lpToken, amount, tokenId);

    vm.prank(address(voter));
    bribeRewards._withdraw(lpToken, amount, tokenId);

    uint256 balance = bribeRewards.balanceOf(tokenId, lpToken);
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
}
