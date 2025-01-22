// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "../../Utils.sol";

contract veIONFuzzing is veIONTest {
  address user;
  function setUp() public {
    _setUp();
    user = address(0x987);
  }

  function testFuzz_createLock_BoostShouldNeverBeAboveMaximum(uint256 _amount, uint256 _duration) public {
    _amount = bound(_amount, IveION(ve).s_minimumLockAmount(veloLpType), type(uint256).max);
    _duration = bound(_duration, IveION(ve).s_minimumLockDuration(), MAXTIME);

    modeVelodrome5050IonMode.mint(user, _amount);

    vm.prank(user);
    modeVelodrome5050IonMode.approve(address(ve), _amount);

    address[] memory tokenAddresses = new address[](1);
    uint256[] memory tokenAmounts = new uint256[](1);
    uint256[] memory durations = new uint256[](1);
    bool[] memory stakeUnderlying = new bool[](1);
    tokenAddresses[0] = address(modeVelodrome5050IonMode);
    tokenAmounts[0] = _amount;
    durations[0] = _duration;
    stakeUnderlying[0] = false;

    vm.startPrank(user);
    MockERC20(modeVelodrome5050IonMode).approve(address(ve), _amount);
    uint256 tokenId = IveION(ve).createLock(tokenAddresses, tokenAmounts, durations, stakeUnderlying);
    vm.stopPrank();

    IveION.LockedBalance memory lock = IveION(ve).getUserLock(tokenId, IveION(ve).s_lpType(tokenAddresses[0]));

    uint256 maxBoost = 2e18;
    assertGe(maxBoost, lock.boost, "Boost should never be above the maximum");
  }

  function testFuzz_createLock_VotingPowerShouldBeAmountDepositedAtMost(uint256 _amount, uint256 _duration) public {
    _amount = bound(_amount, IveION(ve).s_minimumLockAmount(veloLpType), type(uint256).max);
    _duration = bound(_duration, IveION(ve).s_minimumLockDuration(), MAXTIME);

    modeVelodrome5050IonMode.mint(user, _amount);

    vm.prank(user);
    modeVelodrome5050IonMode.approve(address(ve), _amount);

    address[] memory tokenAddresses = new address[](1);
    uint256[] memory tokenAmounts = new uint256[](1);
    uint256[] memory durations = new uint256[](1);
    bool[] memory stakeUnderlying = new bool[](1);
    tokenAddresses[0] = address(modeVelodrome5050IonMode);
    tokenAmounts[0] = _amount;
    durations[0] = _duration;
    stakeUnderlying[0] = false;

    vm.startPrank(user);
    MockERC20(modeVelodrome5050IonMode).approve(address(ve), _amount);
    uint256 tokenId = IveION(ve).createLock(tokenAddresses, tokenAmounts, durations, stakeUnderlying);
    vm.stopPrank();

    (, uint256[] memory balances, ) = IveION(ve).balanceOfNFT(tokenId);
    assertGe(_amount, balances[0], "Boost should never be above the maximum");
  }
}
