// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "../../Utils.sol";

contract UnlockPermanent is veIONTest {
  address user;
  LockInfo lockInput;
  LockInfoMultiple lockInputMultiLP;

  function setUp() public {
    _setUp();
    user = address(0x1234);
    lockInputMultiLP = _createLockMultipleInternal(user);
    lockInput = _createLockInternal(user);
    IveION(ve).setVoter(address(this));

    vm.prank(user);
    IveION(ve).lockPermanent(address(modeVelodrome5050IonMode), lockInput.tokenId);
  }

  function test_unlockPermanent_UserCanUnlockPermanent() public {
    vm.prank(user);
    IveION(ve).unlockPermanent(address(modeVelodrome5050IonMode), lockInput.tokenId);

    uint256 endTime = ((block.timestamp + MAXTIME) / WEEK) * WEEK;
    IveIONStructsEnumsErrorsEvents.LockedBalance memory locked = IveION(ve).getUserLock(lockInput.tokenId, veloLpType);
    assertEq(locked.tokenAddress, lockInput.tokenAddress);
    assertEq(locked.amount, lockInput.tokenAmount, "Amount should be reset to the original lock input value");
    assertEq(locked.delegateAmount, 0, "Delegate amount should be zero after unlocking permanent lock");
    assertEq(locked.start, block.timestamp, "Should get back the original start time");
    assertEq(locked.end, endTime, "Lock end time should be zero for permanent lock");
    assertEq(locked.isPermanent, false, "Lock should be permanent");
    assertEq(
      locked.boost,
      harness.exposed_calculateBoost(MAXTIME),
      "Boost should be zero after unlocking permanent lock"
    );
  }

  function test_unlockPermanent_RevertIfNotOwner() public {
    vm.prank(address(0x0915));
    vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
    IveION(ve).unlockPermanent(address(modeVelodrome5050IonMode), lockInput.tokenId);
  }

  function test_unlockPermanent_RevertIfNotPermanentLock() public {
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("NotPermanentLock()"));
    IveION(ve).unlockPermanent(address(modeVelodrome5050IonMode), lockInputMultiLP.tokenId);
  }

  function test_unlockPermanent_RevertIfHasDelegatees() public {
    vm.startPrank(user);
    IveION(ve).lockPermanent(address(modeVelodrome5050IonMode), lockInputMultiLP.tokenId);
    IveION(ve).delegate(lockInput.tokenId, lockInputMultiLP.tokenId, address(modeVelodrome5050IonMode), MINT_AMT / 2);
    vm.expectRevert(abi.encodeWithSignature("TokenHasDelegatees()"));
    IveION(ve).unlockPermanent(address(modeVelodrome5050IonMode), lockInput.tokenId);
    vm.stopPrank();
  }

  function test_unlockPermanent_RevertIfHasDelegators() public {
    vm.startPrank(user);
    IveION(ve).lockPermanent(address(modeVelodrome5050IonMode), lockInputMultiLP.tokenId);
    IveION(ve).delegate(lockInputMultiLP.tokenId, lockInput.tokenId, address(modeVelodrome5050IonMode), MINT_AMT / 2);
    vm.expectRevert(abi.encodeWithSignature("TokenHasDelegators()"));
    IveION(ve).unlockPermanent(address(modeVelodrome5050IonMode), lockInput.tokenId);
    vm.stopPrank();
  }
}
