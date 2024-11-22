// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "../../Utils.sol";
import "../../harness/veIONHarness.sol";

contract IncreaseUnlockTime is veIONTest {
  address user;
  uint256 tokenId;
  LockInfo lockInput;
  LockInfoMultiple lockInputMultiLp;

  function setUp() public {
    _setUp();
    user = address(0x1234);
    lockInput = _createLockInternal(user);
    lockInputMultiLp = _createLockMultipleInternal(user);
  }

  function test_increaseUnlockTime_UserCanIncreaseTime() public {
    uint256 newLockTime = 104 weeks;
    vm.prank(user);
    ve.increaseUnlockTime(address(modeVelodrome5050IonMode), lockInput.tokenId, newLockTime);

    IveION.LockedBalance memory actualLocked = ve.getUserLock(lockInput.tokenId, veloLpType);
    uint256 expectedEndTime = ((block.timestamp + newLockTime) / WEEK) * WEEK;
    assertEq(expectedEndTime, actualLocked.end, "Lock end time should be increased");
  }

  function test_increaseUnlockTime_RevertIfNotOwner() public {
    uint256 newLockTime = 104 weeks;
    vm.prank(address(0x2352));
    vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
    ve.increaseUnlockTime(address(modeVelodrome5050IonMode), lockInput.tokenId, newLockTime);
  }

  function test_increaseUnlockTime_RevertIfLockPermanent() public {
    uint256 newLockTime = 104 weeks;
    vm.startPrank(user);
    ve.lockPermanent(lockInput.tokenAddress, lockInput.tokenId);
    vm.expectRevert(abi.encodeWithSignature("PermanentLock()"));
    ve.increaseUnlockTime(address(modeVelodrome5050IonMode), lockInput.tokenId, newLockTime);
    vm.stopPrank();
  }

  function test_increaseUnlockTime_RevertIfLockExpires() public {
    uint256 newLockTime = 104 weeks;
    vm.warp(block.timestamp + lockInput.duration);
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("LockExpired()"));
    ve.increaseUnlockTime(address(modeVelodrome5050IonMode), lockInput.tokenId, newLockTime);
  }

  function test_increaseUnlockTime_RevertIfLockNonexistent() public {
    uint256 newLockTime = 104 weeks;
    uint256 amountToMint = 500 * 10 ** 18; // 500 tokens
    modeBalancer8020IonEth.mint(user, amountToMint);

    vm.startPrank(user);
    modeBalancer8020IonEth.approve(address(ve), amountToMint);
    vm.expectRevert(abi.encodeWithSignature("LockExpired()"));
    ve.increaseUnlockTime(address(modeBalancer8020IonEth), lockInput.tokenId, newLockTime);
    vm.stopPrank();
  }

  function test_increaseUnlockTime_RevertIfLockNotInFuture() public {
    uint256 newLockTime = 52 weeks;
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("LockDurationNotInFuture()"));
    ve.increaseUnlockTime(address(modeVelodrome5050IonMode), lockInput.tokenId, newLockTime);
  }

  function test_increaseUnlockTime_RevertIfLockTooLong() public {
    uint256 newLockTime = 120 weeks;
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("LockDurationTooLong()"));
    ve.increaseUnlockTime(address(modeVelodrome5050IonMode), lockInput.tokenId, newLockTime);
  }

  function test_increaseUnlockTime_RevertIfTokenNonexistent() public {
    uint256 newLockTime = 52 weeks;
    vm.prank(user);
    vm.expectRevert("ERC721: invalid token ID");
    ve.increaseUnlockTime(address(modeVelodrome5050IonMode), 544, newLockTime);
  }

  function test_increaseUnlockTimeI_RevertIfUserWithdrewLock() public {
    uint256 newLockTime = 52 weeks;
    vm.startPrank(user);
    ve.withdraw(lockInputMultiLp.tokenAddresses[0], lockInputMultiLp.tokenId);
    vm.expectRevert(abi.encodeWithSignature("LockExpired()"));
    ve.increaseUnlockTime(address(modeVelodrome5050IonMode), lockInputMultiLp.tokenId, newLockTime);
  }
}
