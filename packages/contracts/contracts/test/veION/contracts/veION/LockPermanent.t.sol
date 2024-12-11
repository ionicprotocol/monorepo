// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "../../Utils.sol";

contract LockPermanent is veIONTest {
  address user;
  LockInfo lockInput;
  LockInfoMultiple lockInputMultiLP;

  function setUp() public {
    _setUp();
    user = address(0x1234);
    lockInputMultiLP = _createLockMultipleInternal(user);
    lockInput = _createLockInternal(user);
    ve.setVoter(address(this));
  }

  function test_lockPermanent_UserCanLockPermanent() public {
    vm.prank(user);
    ve.lockPermanent(IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, lockInput.tokenId);

    IveION.LockedBalance memory lock = ve.getUserLock(lockInput.tokenId, veloLpType);

    uint256 userEpoch = ve.s_userPointEpoch(lockInput.tokenId, veloLpType);
    IveION.UserPoint memory userPoint = ve.getUserPoint(
      lockInput.tokenId,
      ve.s_addressToLpType(lockInput.tokenAddress),
      userEpoch
    );
    assertEq(
      lock.tokenAddress,
      address(modeVelodrome5050IonMode),
      "Lock token address should match the expected address"
    );
    assertEq(lock.amount, lockInput.tokenAmount, "Lock amount should match the initial lock amount");
    assertEq(lock.boost, harness.exposed_calculateBoost(MAXTIME), "Lock boost should be calculated based on MAXTIME");
    assertEq(lock.delegateAmount, 0, "Lock delegate amount should be zero for a new permanent lock");

    assertEq(lock.isPermanent, true, "Lock should be permanent");
    assertEq(lock.end, 0, "Lock end time should be zero for permanent lock");
    assertEq(userPoint.bias, 0, "User point bias should be zero for permanent lock");
    assertEq(userPoint.slope, 0, "User point slope should be zero for permanent lock");
    assertEq(userPoint.ts, block.timestamp, "User point timestamp should be current block timestamp");
    assertEq(userPoint.blk, block.number, "User point block number should be current block number");
    assertEq(userPoint.permanent, lock.amount, "User point permanent lock should match lock amount");
  }

  function test_lockPermanent_RevertIfNotOwner() public {
    vm.prank(address(0x2352));
    vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
    ve.lockPermanent(IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, lockInput.tokenId);
  }

  function test_lockPermanent_RevertIfPermanentLock() public {
    vm.startPrank(user);
    ve.lockPermanent(IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, lockInput.tokenId);
    vm.expectRevert(abi.encodeWithSignature("PermanentLock()"));
    ve.lockPermanent(IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, lockInput.tokenId);
    vm.stopPrank();
  }

  function test_lockPermanent_RevertIfLockExpired() public {
    vm.warp(block.timestamp + lockInput.duration);
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("LockExpired()"));
    ve.lockPermanent(IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, lockInput.tokenId);
  }

  function test_lockPermanent_RevertIfNoLockFound() public {
    vm.prank(user);
    vm.expectRevert("ERC721: invalid token ID");
    ve.lockPermanent(IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, 933);
  }
}
