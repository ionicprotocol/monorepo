// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "../../Utils.sol";

contract Delegate is veIONTest {
  address user;
  LockInfo lockInput;
  LockInfoMultiple lockInputMultiLP;
  uint256 tokenId1;
  uint256 tokenId2;

  function setUp() public {
    _setUp();
    user = address(0x1234);
    lockInputMultiLP = _createLockMultipleInternal(user);
    lockInput = _createLockInternal(user);
    IveION(ve).setVoter(address(this));

    vm.startPrank(user);
    IveION(ve).lockPermanent(address(modeVelodrome5050IonMode), lockInput.tokenId);
    IveION(ve).lockPermanent(address(modeVelodrome5050IonMode), lockInputMultiLP.tokenId);
    vm.stopPrank();

    (tokenId1, tokenId2) = (lockInput.tokenId, lockInputMultiLP.tokenId);
  }

  function test_delegation_UserCanDelegate() public {
    vm.prank(user);
    IveION(ve).delegate(tokenId1, tokenId2, address(modeVelodrome5050IonMode), MINT_AMT);

    IveIONStructsEnumsErrorsEvents.LockedBalance memory locked1 = IveION(ve).getUserLock(tokenId1, veloLpType);
    IveIONStructsEnumsErrorsEvents.LockedBalance memory locked2 = IveION(ve).getUserLock(tokenId2, veloLpType);

    uint256 amountDelegated = IveION(ve).s_delegations(tokenId1, tokenId2, veloLpType);

    uint256[] memory delegatees = IveION(ve).getDelegatees(tokenId1, veloLpType);
    bool foundDelegatee = false;
    for (uint256 i = 0; i < delegatees.length; i++) {
      if (delegatees[i] == tokenId2) {
        foundDelegatee = true;
        break;
      }
    }

    uint256[] memory delegators = IveION(ve).getDelegators(tokenId2, veloLpType);
    bool foundDelegator = false;
    for (uint256 i = 0; i < delegators.length; i++) {
      if (delegators[i] == tokenId1) {
        foundDelegator = true;
        break;
      }
    }

    uint256 userEpoch2 = IveION(ve).s_userPointEpoch(tokenId2, IveION(ve).s_lpType(address(modeVelodrome5050IonMode)));
    IveIONStructsEnumsErrorsEvents.UserPoint memory userPoint2 = IveION(ve).getUserPoint(
      tokenId2,
      IveION(ve).s_lpType(address(modeVelodrome5050IonMode)),
      userEpoch2
    );

    uint256 userEpoch1 = IveION(ve).s_userPointEpoch(tokenId1, IveION(ve).s_lpType(address(modeVelodrome5050IonMode)));
    IveIONStructsEnumsErrorsEvents.UserPoint memory userPoint1 = IveION(ve).getUserPoint(
      tokenId1,
      IveION(ve).s_lpType(address(modeVelodrome5050IonMode)),
      userEpoch1
    );

    assertEq(userPoint2.ts, block.timestamp, "User point timestamp mismatch");
    assertEq(userPoint2.blk, block.number, "User point block number mismatch");
    assertEq(userPoint2.bias, 0, "User point bias mismatch");
    assertEq(userPoint2.slope, 0, "User point slope mismatch");
    assertEq(userPoint2.permanent, MINT_AMT, "User point permanent mismatch");
    assertEq(userPoint2.permanentDelegate, MINT_AMT, "User point permanent delegate mismatch");

    assertEq(userPoint1.ts, block.timestamp, "User point timestamp mismatch");
    assertEq(userPoint1.blk, block.number, "User point block number mismatch");
    assertEq(userPoint1.bias, 0, "User point bias mismatch");
    assertEq(userPoint1.slope, 0, "User point slope mismatch");
    assertEq(userPoint1.permanent, 0, "User point permanent mismatch");
    assertEq(userPoint1.permanentDelegate, 0, "User point permanent delegate mismatch");

    assertEq(locked1.amount, 0, "All voting power should have been delegated from this token");
    assertEq(locked2.delegateAmount, MINT_AMT, "All voting power should have been delegated to this token");
    assertEq(amountDelegated, MINT_AMT, "Delegated amount should be recorded");
    assertTrue(foundDelegatee, "tokenId2 found in list of tokenId1's delegatees");
    assertTrue(foundDelegator, "tokenId1 found in  list of tokenId2's delegators");
  }

  function test_delegation_NoDuplicateDelegateesOrDelegators() public {
    uint256 smallDelegation = 10e18;
    vm.startPrank(user);
    IveION(ve).delegate(tokenId1, tokenId2, address(modeVelodrome5050IonMode), smallDelegation);
    IveION(ve).delegate(tokenId1, tokenId2, address(modeVelodrome5050IonMode), smallDelegation);
    IveION(ve).delegate(tokenId1, tokenId2, address(modeVelodrome5050IonMode), smallDelegation);
    IveION(ve).delegate(tokenId1, tokenId2, address(modeVelodrome5050IonMode), smallDelegation);
    IveION(ve).delegate(tokenId1, tokenId2, address(modeVelodrome5050IonMode), smallDelegation);
    vm.stopPrank();

    uint256[] memory delegatees = IveION(ve).getDelegatees(tokenId1, veloLpType);
    assertEq(delegatees.length, 1, "Should only be one delegeatee despite several delegations");

    uint256[] memory delegators = IveION(ve).getDelegators(tokenId2, veloLpType);
    assertEq(delegators.length, 1, "Should only be one delegator despite several delegations");

    uint256 amountDelegated = IveION(ve).s_delegations(tokenId1, tokenId2, veloLpType);
    assertEq(amountDelegated, smallDelegation * 5, "Should accumulate");
  }

  function test_delegation_RevertIfNotOwner() public {
    vm.prank(address(0x2352));
    vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
    IveION(ve).delegate(tokenId1, tokenId2, address(modeVelodrome5050IonMode), MINT_AMT);
  }

  function test_delegation_RevertIfAmountTooBig() public {
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("AmountTooBig()"));
    IveION(ve).delegate(tokenId1, tokenId2, address(modeVelodrome5050IonMode), MINT_AMT * 2);
  }

  function test_delegation_RevertIfNotPermanentLockFrom() public {
    vm.startPrank(user);
    IveION(ve).unlockPermanent(address(modeVelodrome5050IonMode), tokenId1);
    vm.expectRevert(abi.encodeWithSignature("NotPermanentLock()"));
    IveION(ve).delegate(tokenId1, tokenId2, address(modeVelodrome5050IonMode), MINT_AMT);
    vm.stopPrank();
  }

  function test_delegation_RevertIfNotPermanentLockTo() public {
    vm.startPrank(user);
    IveION(ve).unlockPermanent(address(modeVelodrome5050IonMode), tokenId2);
    vm.expectRevert(abi.encodeWithSignature("NotPermanentLock()"));
    IveION(ve).delegate(tokenId1, tokenId2, address(modeVelodrome5050IonMode), MINT_AMT);
    vm.stopPrank();
  }
}
