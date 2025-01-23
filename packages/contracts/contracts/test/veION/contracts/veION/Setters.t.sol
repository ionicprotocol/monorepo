// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "../../Utils.sol";

contract Setters is veIONTest {
  function setUp() public {
    _setUp();
  }

  function test_setAeroVoting() public {
    address newAeroVoting = address(0x123);
    IveION(ve).setAeroVoting(newAeroVoting);
    assertEq(IveION(ve).s_aeroVoting(), newAeroVoting, "AeroVoting address should be updated");
  }

  function test_setAeroVoting_revertIfInvalidAddress() public {
    address invalidAddress = address(0);
    vm.expectRevert(abi.encodeWithSignature("InvalidAddress()"));
    IveION(ve).setAeroVoting(invalidAddress);
  }

  function test_setAeroVoterBoost() public {
    uint256 newBoost = 500;
    IveION(ve).setAeroVoterBoost(newBoost);
    assertEq(IveION(ve).s_aeroVoterBoost(), newBoost, "AeroVoterBoost should be updated");
  }

  function test_setAeroVoterBoost_revertIfZeroBoost() public {
    uint256 zeroBoost = 0;
    vm.expectRevert(abi.encodeWithSignature("AeroBoostAmountMustBeGreaterThanZero()"));
    IveION(ve).setAeroVoterBoost(zeroBoost);
  }

  function test_setMaxEarlyWithdrawFee() public {
    uint256 newFee = 100;
    IveION(ve).setMaxEarlyWithdrawFee(newFee);
    assertEq(IveION(ve).s_maxEarlyWithdrawFee(), newFee, "MaxEarlyWithdrawFee should be updated");
  }

  function test_setMaxEarlyWithdrawFee_revertIfZeroFee() public {
    uint256 zeroFee = 0;
    vm.expectRevert(abi.encodeWithSignature("MaxEarlyWithdrawFeeMustBeGreaterThanZero()"));
    IveION(ve).setMaxEarlyWithdrawFee(zeroFee);
  }

  function test_setLpTokenType() public {
    address tokenAddress = address(0x456);
    IveIONStructsEnumsErrorsEvents.LpTokenType lpType = IveIONStructsEnumsErrorsEvents.LpTokenType(1);
    IveION(ve).setLpTokenType(tokenAddress, lpType);
    assertEq(uint256(IveION(ve).s_lpType(tokenAddress)), uint256(lpType), "LP token type should be updated");
  }

  function test_setLpTokenType_revertIfInvalidTokenAddress() public {
    address invalidTokenAddress = address(0);
    IveIONStructsEnumsErrorsEvents.LpTokenType lpType = IveIONStructsEnumsErrorsEvents.LpTokenType(1);
    vm.expectRevert(abi.encodeWithSignature("InvalidTokenAddress()"));
    IveION(ve).setLpTokenType(invalidTokenAddress, lpType);
  }

  function test_setStakeStrategy() public {
    IveIONStructsEnumsErrorsEvents.LpTokenType lpType = IveIONStructsEnumsErrorsEvents.LpTokenType(1);
    IStakeStrategy strategy = IStakeStrategy(address(0x789));
    IveION(ve).setStakeStrategy(lpType, strategy);
    assertEq(address(IveION(ve).s_stakeStrategy(lpType)), address(strategy), "Stake strategy should be updated");
  }

  function test_setStakeStrategy_revertIfInvalidStrategyAddress() public {
    IveIONStructsEnumsErrorsEvents.LpTokenType lpType = IveIONStructsEnumsErrorsEvents.LpTokenType(1);
    IStakeStrategy invalidStrategy = IStakeStrategy(address(0));
    vm.expectRevert(abi.encodeWithSignature("InvalidStrategyAddress()"));
    IveION(ve).setStakeStrategy(lpType, invalidStrategy);
  }

  function test_toggleLimitedBoost() public {
    IveION(ve).toggleLimitedBoost(true);
    assertTrue(IveION(ve).s_limitedBoostActive(), "Limited boost should be active");
  }

  function test_setLimitedTimeBoost() public {
    uint256 boostAmount = 1000;
    IveION(ve).setLimitedTimeBoost(boostAmount);
    assertEq(IveION(ve).s_limitedBoost(), boostAmount, "Limited time boost should be updated");
  }

  function test_setVoter() public {
    address newVoter = address(0xABC);
    IveION(ve).setVoter(newVoter);
    assertEq(IveION(ve).s_voter(), newVoter, "Voter address should be updated");
  }

  function test_setVoter_revertIfInvalidAddress() public {
    address invalidVoter = address(0);
    vm.expectRevert(abi.encodeWithSignature("InvalidAddress()"));
    IveION(ve).setVoter(invalidVoter);
  }

  function test_setMinimumLockAmount() public {
    address tokenAddress = address(0xDEF);
    uint256 minimumAmount = 100;
    IveION(ve).setLpTokenType(tokenAddress, veloLpType);
    IveION(ve).setMinimumLockAmount(tokenAddress, minimumAmount);
    assertEq(
      IveION(ve).s_minimumLockAmount(IveION(ve).s_lpType(tokenAddress)),
      minimumAmount,
      "Minimum lock amount should be updated"
    );
  }

  function test_setMinimumLockDuration() public {
    uint256 minimumDuration = 1 weeks;
    IveION(ve).setMinimumLockDuration(minimumDuration);
    assertEq(IveION(ve).s_minimumLockDuration(), minimumDuration, "Minimum lock duration should be updated");
  }

  function test_setMinimumLockDuration_revertIfZeroDuration() public {
    uint256 zeroDuration = 0;
    vm.expectRevert(abi.encodeWithSignature("MinimumLockDurationMustBeGreaterThanZero()"));
    IveION(ve).setMinimumLockDuration(zeroDuration);
  }

  function test_setIonicPool() public {
    address newIonicPool = address(0xFED);
    IveION(ve).setIonicPool(newIonicPool);
    assertEq(IveION(ve).s_ionicPool(), newIonicPool, "Ionic pool address should be updated");
  }

  function test_setIonicPool_revertIfInvalidAddress() public {
    address invalidIonicPool = address(0);
    vm.expectRevert(abi.encodeWithSignature("InvalidAddress()"));
    IveION(ve).setIonicPool(invalidIonicPool);
  }
}
