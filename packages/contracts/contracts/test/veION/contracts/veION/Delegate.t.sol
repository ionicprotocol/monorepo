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
    ve.setVoter(address(this));

    vm.startPrank(user);
    ve.lockPermanent(IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, lockInput.tokenId);
    ve.lockPermanent(IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, lockInputMultiLP.tokenId);
    vm.stopPrank();

    (tokenId1, tokenId2) = (lockInput.tokenId, lockInputMultiLP.tokenId);
  }

  function test_delegation_UserCanDelegate() public {
    vm.prank(user);
    ve.delegate(tokenId1, tokenId2, IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, MINT_AMT);

    IveION.LockedBalance memory locked1 = ve.getUserLock(tokenId1, veloLpType);
    IveION.LockedBalance memory locked2 = ve.getUserLock(tokenId2, veloLpType);

    uint256 amountDelegated = ve.s_delegations(tokenId1, tokenId2, veloLpType);

    uint256[] memory delegatees = ve.getDelegatees(tokenId1, veloLpType);
    bool foundDelegatee = false;
    for (uint256 i = 0; i < delegatees.length; i++) {
      if (delegatees[i] == tokenId2) {
        foundDelegatee = true;
        break;
      }
    }

    uint256[] memory delegators = ve.getDelegators(tokenId2, veloLpType);
    bool foundDelegator = false;
    for (uint256 i = 0; i < delegators.length; i++) {
      if (delegators[i] == tokenId1) {
        foundDelegator = true;
        break;
      }
    }

    uint256 userEpoch2 = ve.s_userPointEpoch(tokenId2, ve.s_addressToLpType(address(modeVelodrome5050IonMode)));
    IveION.UserPoint memory userPoint2 = ve.getUserPoint(
      tokenId2,
      ve.s_addressToLpType(address(modeVelodrome5050IonMode)),
      userEpoch2
    );

    uint256 userEpoch1 = ve.s_userPointEpoch(tokenId1, ve.s_addressToLpType(address(modeVelodrome5050IonMode)));
    IveION.UserPoint memory userPoint1 = ve.getUserPoint(
      tokenId1,
      ve.s_addressToLpType(address(modeVelodrome5050IonMode)),
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
    ve.delegate(tokenId1, tokenId2, IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, smallDelegation);
    ve.delegate(tokenId1, tokenId2, IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, smallDelegation);
    ve.delegate(tokenId1, tokenId2, IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, smallDelegation);
    ve.delegate(tokenId1, tokenId2, IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, smallDelegation);
    ve.delegate(tokenId1, tokenId2, IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, smallDelegation);
    vm.stopPrank();

    uint256[] memory delegatees = ve.getDelegatees(tokenId1, veloLpType);
    assertEq(delegatees.length, 1, "Should only be one delegeatee despite several delegations");

    uint256[] memory delegators = ve.getDelegators(tokenId2, veloLpType);
    assertEq(delegators.length, 1, "Should only be one delegator despite several delegations");

    uint256 amountDelegated = ve.s_delegations(tokenId1, tokenId2, veloLpType);
    assertEq(amountDelegated, smallDelegation * 5, "Should accumulate");
  }

  function test_delegation_RevertIfNotOwner() public {
    vm.prank(address(0x2352));
    vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
    ve.delegate(tokenId1, tokenId2, IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, MINT_AMT);
  }

  function test_delegation_RevertIfAmountTooBig() public {
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("AmountTooBig()"));
    ve.delegate(tokenId1, tokenId2, IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, MINT_AMT * 2);
  }

  function test_delegation_RevertIfNotPermanentLockFrom() public {
    vm.startPrank(user);
    ve.unlockPermanent(IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, tokenId1);
    vm.expectRevert(abi.encodeWithSignature("NotPermanentLock()"));
    ve.delegate(tokenId1, tokenId2, IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, MINT_AMT);
    vm.stopPrank();
  }

  function test_delegation_RevertIfNotPermanentLockTo() public {
    vm.startPrank(user);
    ve.unlockPermanent(IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, tokenId2);
    vm.expectRevert(abi.encodeWithSignature("NotPermanentLock()"));
    ve.delegate(tokenId1, tokenId2, IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, MINT_AMT);
    vm.stopPrank();
  }
}
