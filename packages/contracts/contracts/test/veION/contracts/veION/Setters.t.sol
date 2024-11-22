// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "../../Utils.sol";

contract Setters is veIONTest {
  function setUp() public {
    _setUp();
  }

  function test_setAeroVoting() public {
    address newAeroVoting = address(0x123);
    ve.setAeroVoting(newAeroVoting);
    assertEq(ve.s_aeroVoting(), newAeroVoting, "AeroVoting address should be updated");
  }

  function test_setAeroVoterBoost() public {
    uint256 newBoost = 500;
    ve.setAeroVoterBoost(newBoost);
    assertEq(ve.s_aeroVoterBoost(), newBoost, "AeroVoterBoost should be updated");
  }

  function test_setMaxEarlyWithdrawFee() public {
    uint256 newFee = 100;
    ve.setMaxEarlyWithdrawFee(newFee);
    assertEq(ve.s_maxEarlyWithdrawFee(), newFee, "MaxEarlyWithdrawFee should be updated");
  }

  function test_setLpTokenType() public {
    address tokenAddress = address(0x456);
    IveION.LpTokenType lpType = IveION.LpTokenType(1);
    ve.setLpTokenType(tokenAddress, lpType);
    assertEq(uint256(ve.s_lpType(tokenAddress)), uint256(lpType), "LP token type should be updated");
  }

  function test_setStakeStrategy() public {
    IveION.LpTokenType lpType = IveION.LpTokenType(1);
    IStakeStrategy strategy = IStakeStrategy(address(0x789));
    ve.setStakeStrategy(lpType, strategy);
    assertEq(address(ve.s_stakeStrategy(lpType)), address(strategy), "Stake strategy should be updated");
  }

  function test_toggleLimitedBoost() public {
    ve.toggleLimitedBoost(true);
    assertTrue(ve.s_limitedBoostActive(), "Limited boost should be active");
  }

  function test_setLimitedTimeBoost() public {
    uint256 boostAmount = 1000;
    ve.setLimitedTimeBoost(boostAmount);
    assertEq(ve.s_limitedBoost(), boostAmount, "Limited time boost should be updated");
  }

  function test_setVoter() public {
    address newVoter = address(0xABC);
    ve.setVoter(newVoter);
    assertEq(ve.s_voter(), newVoter, "Voter address should be updated");
  }

  function test_setMinimumLockAmount() public {
    address tokenAddress = address(0xDEF);
    uint256 minimumAmount = 100;
    ve.setLpTokenType(tokenAddress, veloLpType);
    ve.setMinimumLockAmount(tokenAddress, minimumAmount);
    assertEq(ve.s_minimumLockAmount(ve.s_lpType(tokenAddress)), minimumAmount, "Minimum lock amount should be updated");
  }

  function test_setMinimumLockDuration() public {
    uint256 minimumDuration = 1 weeks;
    ve.setMinimumLockDuration(minimumDuration);
    assertEq(ve.s_minimumLockDuration(), minimumDuration, "Minimum lock duration should be updated");
  }

  function test_setIonicPool() public {
    address newIonicPool = address(0xFED);
    ve.setIonicPool(newIonicPool);
    assertEq(ve.s_ionicPool(), newIonicPool, "Ionic pool address should be updated");
  }
}
