// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "../../Utils.sol";

contract RemoveDelegateesAndRemoveDelegators is veIONTest {
  address cindy;
  address andy;
  LockInfo lockInputAlice;
  LockInfoMultiple lockInputBob;
  LockInfo lockInputCandy;
  LockInfo lockInputRalph;
  uint256 tokenIdAlice;
  uint256 tokenIdBob;
  uint256 tokenIdCandy;
  uint256 tokenIdRalph;

  function setUp() public {
    _setUp();
    cindy = address(0x1234);
    andy = address(0x3245);
    lockInputAlice = _createLockInternal(cindy);
    lockInputBob = _createLockMultipleInternal(cindy);
    lockInputCandy = _createLockInternal(andy);
    lockInputRalph = _createLockInternal(andy);
    ve.setVoter(address(this));

    (tokenIdAlice, tokenIdBob, tokenIdCandy, tokenIdRalph) = (
      lockInputAlice.tokenId,
      lockInputBob.tokenId,
      lockInputCandy.tokenId,
      lockInputRalph.tokenId
    );

    vm.startPrank(cindy);
    ve.lockPermanent(IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, tokenIdAlice);
    ve.lockPermanent(IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, tokenIdBob);
    ve.delegate(tokenIdAlice, tokenIdBob, IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, MINT_AMT);
    vm.stopPrank();

    vm.startPrank(andy);
    ve.lockPermanent(IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, tokenIdCandy);
    ve.lockPermanent(IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, tokenIdRalph);
    ve.delegate(tokenIdCandy, tokenIdRalph, IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, MINT_AMT);
    vm.stopPrank();
  }

  function test_removeDelegatees_UserCanRemoveDelegatees() public {
    uint256[] memory toTokenIds = new uint256[](1);
    toTokenIds[0] = tokenIdBob;
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = MINT_AMT;

    vm.prank(cindy);
    ve.removeDelegatees(tokenIdAlice, toTokenIds, IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, amounts);

    IveION.LockedBalance memory locked1 = ve.getUserLock(tokenIdAlice, veloLpType);
    IveION.LockedBalance memory locked2 = ve.getUserLock(tokenIdBob, veloLpType);

    uint256[] memory delegatees = ve.getDelegatees(tokenIdAlice, veloLpType);
    uint256 amountDelegated = ve.s_delegations(tokenIdAlice, tokenIdBob, veloLpType);
    bool found = false;
    for (uint256 i = 0; i < delegatees.length; i++) {
      if (delegatees[i] == tokenIdBob) {
        found = true;
        break;
      }
    }

    uint256 userEpoch = ve.s_userPointEpoch(tokenIdBob, ve.s_addressToLpType(address(modeVelodrome5050IonMode)));
    IveION.UserPoint memory userPoint = ve.getUserPoint(
      tokenIdBob,
      ve.s_addressToLpType(address(modeVelodrome5050IonMode)),
      userEpoch
    );

    assertEq(userPoint.ts, block.timestamp, "User point timestamp mismatch");
    assertEq(userPoint.blk, block.number, "User point block number mismatch");
    assertEq(userPoint.bias, 0, "User point bias mismatch");
    assertEq(userPoint.slope, 0, "User point slope mismatch");
    assertEq(userPoint.permanent, MINT_AMT, "User point permanent mismatch");
    assertEq(userPoint.permanentDelegate, 0, "User point permanent delegate mismatch");

    assertEq(locked1.amount, MINT_AMT, "Voting power should be returned to the original token");
    assertEq(locked2.delegateAmount, 0, "Delegated voting power should be removed from the second token");
    assertFalse(found, "secondTokenId should not be in the list of delegatees after de-delegation");
    assertEq(amountDelegated, 0, "Delegated amount should be zero after de-delegation");
  }

  function test_removeDelegatees_RemoveByTransfer() public {
    LockInfo memory lockInfoUser1 = _createLockInternal(address(0x1234));
    LockInfo memory lockInfoUser2 = _createLockInternal(address(0x5678));
    LockInfo memory lockInfoUser3 = _createLockInternal(address(0x9ABC));
    LockInfo memory lockInfoUser4 = _createLockInternal(address(0xDEF0));
    LockInfo memory lockInfoUser5 = _createLockInternal(address(0x1111));
    LockInfo memory lockInfoUser6 = _createLockInternal(address(0x2222));
    LockInfo memory lockInfoUser7 = _createLockInternal(address(0x3333));

    console.log("Token ID User 1:", lockInfoUser1.tokenId);
    console.log("Token ID User 2:", lockInfoUser2.tokenId);
    console.log("Token ID User 3:", lockInfoUser3.tokenId);
    console.log("Token ID User 4:", lockInfoUser4.tokenId);
    console.log("Token ID User 5:", lockInfoUser5.tokenId);
    console.log("Token ID User 6:", lockInfoUser6.tokenId);
    console.log("Token ID User 7:", lockInfoUser7.tokenId);

    vm.startPrank(address(0x1234));
    ve.lockPermanent(lockInfoUser1.lpType, lockInfoUser1.tokenId);
    vm.stopPrank();

    vm.startPrank(address(0x5678));
    ve.lockPermanent(lockInfoUser2.lpType, lockInfoUser2.tokenId);
    vm.stopPrank();

    vm.startPrank(address(0x9ABC));
    ve.lockPermanent(lockInfoUser3.lpType, lockInfoUser3.tokenId);
    vm.stopPrank();

    vm.startPrank(address(0xDEF0));
    ve.lockPermanent(lockInfoUser4.lpType, lockInfoUser4.tokenId);
    vm.stopPrank();

    vm.startPrank(address(0x1111));
    ve.lockPermanent(lockInfoUser5.lpType, lockInfoUser5.tokenId);
    vm.stopPrank();

    vm.startPrank(address(0x2222));
    ve.lockPermanent(lockInfoUser6.lpType, lockInfoUser6.tokenId);
    vm.stopPrank();

    vm.startPrank(address(0x3333));
    ve.lockPermanent(lockInfoUser7.lpType, lockInfoUser7.tokenId);
    vm.stopPrank();

    vm.startPrank(cindy);
    ve.delegate(tokenIdBob, lockInfoUser1.tokenId, lockInfoUser1.lpType, MINT_AMT / 7);
    ve.delegate(tokenIdBob, lockInfoUser2.tokenId, lockInfoUser2.lpType, MINT_AMT / 7);
    ve.delegate(tokenIdBob, lockInfoUser3.tokenId, lockInfoUser3.lpType, MINT_AMT / 7);
    ve.delegate(tokenIdBob, lockInfoUser4.tokenId, lockInfoUser4.lpType, MINT_AMT / 7);
    ve.delegate(tokenIdBob, lockInfoUser5.tokenId, lockInfoUser5.lpType, MINT_AMT / 7);
    ve.delegate(tokenIdBob, lockInfoUser6.tokenId, lockInfoUser6.lpType, MINT_AMT / 7);
    ve.delegate(tokenIdBob, lockInfoUser7.tokenId, lockInfoUser7.lpType, MINT_AMT / 7);
    vm.stopPrank();

    uint256[] memory delegateesBefore = ve.getDelegatees(tokenIdBob, veloLpType);
    console.log("Delegatees length before transfer:", delegateesBefore.length);

    vm.prank(cindy);
    ve.transferFrom(cindy, address(0x9ABC), tokenIdBob);

    uint256[] memory delegateesAfter = ve.getDelegatees(tokenIdBob, veloLpType);
    console.log("Delegatees length after transfer:", delegateesAfter.length);

    assertEq(delegateesBefore.length, 7, "Expected 7 delegatees before transfer");
    assertEq(delegateesAfter.length, 0, "Expected 0 delegatees after transfer");
  }

  function test_removeDelegatees_RemoveByTransferMultiLP() public {
    LockInfoMultiple memory lockInfoUser1 = _createLockMultipleInternal(cindy);
    LockInfoMultiple memory lockInfoUser2 = _createLockMultipleInternal(address(0x92365));

    vm.startPrank(address(0x92365));
    ve.lockPermanent(lockInfoUser2.lpTypes[0], lockInfoUser2.tokenId);
    ve.lockPermanent(lockInfoUser2.lpTypes[1], lockInfoUser2.tokenId);
    vm.stopPrank();

    vm.startPrank(cindy);
    ve.lockPermanent(lockInfoUser1.lpTypes[0], lockInfoUser1.tokenId);
    ve.lockPermanent(lockInfoUser1.lpTypes[1], lockInfoUser1.tokenId);
    vm.stopPrank();

    vm.startPrank(cindy);
    ve.delegate(lockInfoUser1.tokenId, lockInfoUser2.tokenId, lockInfoUser1.lpTypes[0], MINT_AMT / 5);
    ve.delegate(lockInfoUser1.tokenId, lockInfoUser2.tokenId, lockInfoUser1.lpTypes[1], MINT_AMT / 5);
    vm.stopPrank();

    uint256[] memory delegateesBeforeTransferVelo = ve.getDelegatees(lockInfoUser1.tokenId, veloLpType);
    assertEq(delegateesBeforeTransferVelo.length, 1, "Expected 1 delegatee before transfer for velo LP type");
    uint256[] memory delegateesBeforeTransferBalancer = ve.getDelegatees(lockInfoUser1.tokenId, balancerLpType);
    assertEq(delegateesBeforeTransferBalancer.length, 1, "Expected 1 delegatee before transfer for balancer LP type");

    vm.prank(cindy);
    ve.transferFrom(cindy, andy, lockInfoUser1.tokenId);

    uint256[] memory delegateesAfterTransferVelo = ve.getDelegatees(lockInfoUser1.tokenId, veloLpType);
    assertEq(delegateesAfterTransferVelo.length, 0, "Expected 0 delegatees after transfer for velo LP type");
    uint256[] memory delegateesAfterTransferBalancer = ve.getDelegatees(lockInfoUser1.tokenId, balancerLpType);
    assertEq(delegateesAfterTransferBalancer.length, 0, "Expected 0 delegatees after transfer for balancer LP type");
  }

  function test_removeDelegatees_RevertIfUnmatchedArrays() public {
    uint256[] memory toTokenIds = new uint256[](2);
    toTokenIds[0] = tokenIdBob;
    toTokenIds[1] = tokenIdBob;
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = MINT_AMT;

    vm.prank(cindy);
    vm.expectRevert(abi.encodeWithSignature("ArrayMismatch()"));
    ve.removeDelegatees(tokenIdAlice, toTokenIds, IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, amounts);
  }

  function test_removeDelegatees_RevertIfNotOwner() public {
    uint256[] memory toTokenIds = new uint256[](1);
    toTokenIds[0] = tokenIdBob;
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = MINT_AMT;

    vm.prank(address(0x1413));
    vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
    ve.removeDelegatees(tokenIdAlice, toTokenIds, IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, amounts);
  }

  function test_removeDelegatees_RevertIfNoDelegation() public {
    uint256[] memory toTokenIds = new uint256[](1);
    toTokenIds[0] = tokenIdCandy;
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = MINT_AMT;

    vm.prank(cindy);
    vm.expectRevert(abi.encodeWithSignature("NoDelegationBetweenTokens(uint256,uint256)", tokenIdAlice, tokenIdCandy));
    ve.removeDelegatees(tokenIdAlice, toTokenIds, IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, amounts);
  }

  function test_removeDelegators_UserCanRemoveDelegators() public {
    uint256[] memory fromTokenIds = new uint256[](1);
    fromTokenIds[0] = tokenIdAlice;
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = MINT_AMT;

    vm.prank(cindy);
    ve.removeDelegators(fromTokenIds, tokenIdBob, IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, amounts);

    IveION.LockedBalance memory locked1 = ve.getUserLock(tokenIdAlice, veloLpType);
    IveION.LockedBalance memory locked2 = ve.getUserLock(tokenIdBob, veloLpType);

    uint256 amountDelegated = ve.s_delegations(tokenIdAlice, tokenIdBob, veloLpType);

    uint256[] memory delegatees = ve.getDelegatees(tokenIdAlice, veloLpType);
    bool foundDelegatee = false;
    for (uint256 i = 0; i < delegatees.length; i++) {
      if (delegatees[i] == tokenIdBob) {
        foundDelegatee = true;
        break;
      }
    }

    uint256[] memory delegators = ve.getDelegators(tokenIdBob, veloLpType);
    bool foundDelegator = false;
    for (uint256 i = 0; i < delegators.length; i++) {
      if (delegatees[i] == tokenIdBob) {
        foundDelegator = true;
        break;
      }
    }

    uint256 userEpoch = ve.s_userPointEpoch(tokenIdBob, ve.s_addressToLpType(address(modeVelodrome5050IonMode)));
    IveION.UserPoint memory userPoint = ve.getUserPoint(
      tokenIdBob,
      ve.s_addressToLpType(address(modeVelodrome5050IonMode)),
      userEpoch
    );

    assertEq(userPoint.ts, block.timestamp, "User point timestamp mismatch");
    assertEq(userPoint.blk, block.number, "User point block number mismatch");
    assertEq(userPoint.bias, 0, "User point bias mismatch");
    assertEq(userPoint.slope, 0, "User point slope mismatch");
    assertEq(userPoint.permanent, MINT_AMT, "User point permanent mismatch");
    assertEq(userPoint.permanentDelegate, 0, "User point permanent delegate mismatch");

    assertEq(locked1.amount, MINT_AMT, "Voting power should be returned to the original token");
    assertEq(locked2.delegateAmount, 0, "Delegated voting power should be removed from the second token");
    assertFalse(foundDelegatee, "bob token should not be in the list of delegatees for alice after de-delegation");
    assertFalse(foundDelegator, "alice token should not be in the list of delegators for bob after de-delegation");
    assertEq(amountDelegated, 0, "Delegated amount should be zero after de-delegation");
  }

  function test_removeDelegators_RevertIfUnmatchedArrays() public {
    uint256[] memory fromTokenIDs = new uint256[](2);
    fromTokenIDs[0] = tokenIdAlice;
    fromTokenIDs[1] = tokenIdAlice;
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = MINT_AMT;

    vm.prank(cindy);
    vm.expectRevert(abi.encodeWithSignature("ArrayMismatch()"));
    ve.removeDelegators(fromTokenIDs, tokenIdBob, IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, amounts);
  }
  function test_removeDelegators_RevertIfNotOwner() public {
    uint256[] memory fromTokenIDs = new uint256[](1);
    fromTokenIDs[0] = tokenIdAlice;
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = MINT_AMT;

    vm.prank(address(0x2352));
    vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
    ve.removeDelegators(fromTokenIDs, tokenIdBob, IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, amounts);
  }

  function test_removeDelegators_RevertIfNoDelegationBetweenTokens() public {
    uint256[] memory fromTokenIDs = new uint256[](1);
    fromTokenIDs[0] = tokenIdCandy;
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = MINT_AMT;

    vm.prank(cindy);
    vm.expectRevert(abi.encodeWithSignature("NoDelegationBetweenTokens(uint256,uint256)", tokenIdCandy, tokenIdBob));
    ve.removeDelegators(fromTokenIDs, tokenIdBob, IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE, amounts);
  }
}
