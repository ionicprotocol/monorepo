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
    IveION(ve).setVoter(address(this));

    (tokenIdAlice, tokenIdBob, tokenIdCandy, tokenIdRalph) = (
      lockInputAlice.tokenId,
      lockInputBob.tokenId,
      lockInputCandy.tokenId,
      lockInputRalph.tokenId
    );

    vm.startPrank(cindy);
    IveION(ve).lockPermanent(address(modeVelodrome5050IonMode), tokenIdAlice);
    IveION(ve).lockPermanent(address(modeVelodrome5050IonMode), tokenIdBob);
    IveION(ve).delegate(tokenIdAlice, tokenIdBob, address(modeVelodrome5050IonMode), MINT_AMT);
    vm.stopPrank();

    vm.startPrank(andy);
    IveION(ve).lockPermanent(address(modeVelodrome5050IonMode), tokenIdCandy);
    IveION(ve).lockPermanent(address(modeVelodrome5050IonMode), tokenIdRalph);
    IveION(ve).delegate(tokenIdCandy, tokenIdRalph, address(modeVelodrome5050IonMode), MINT_AMT);
    vm.stopPrank();
  }

  function test_removeDelegatees_UserCanRemoveDelegatees() public {
    uint256[] memory toTokenIds = new uint256[](1);
    toTokenIds[0] = tokenIdBob;
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = MINT_AMT;

    vm.prank(cindy);
    IveION(ve).removeDelegatees(tokenIdAlice, toTokenIds, address(modeVelodrome5050IonMode), amounts);

    IveION.LockedBalance memory locked1 = IveION(ve).getUserLock(tokenIdAlice, veloLpType);
    IveION.LockedBalance memory locked2 = IveION(ve).getUserLock(tokenIdBob, veloLpType);

    uint256[] memory delegatees = IveION(ve).getDelegatees(tokenIdAlice, veloLpType);
    uint256 amountDelegated = IveION(ve).s_delegations(tokenIdAlice, tokenIdBob, veloLpType);
    bool found = false;
    for (uint256 i = 0; i < delegatees.length; i++) {
      if (delegatees[i] == tokenIdBob) {
        found = true;
        break;
      }
    }

    uint256 userEpoch = IveION(ve).s_userPointEpoch(tokenIdBob, IveION(ve).s_lpType(address(modeVelodrome5050IonMode)));
    IveION.UserPoint memory userPoint = IveION(ve).getUserPoint(
      tokenIdBob,
      IveION(ve).s_lpType(address(modeVelodrome5050IonMode)),
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
    IveION(ve).lockPermanent(lockInfoUser1.tokenAddress, lockInfoUser1.tokenId);
    vm.stopPrank();

    vm.startPrank(address(0x5678));
    IveION(ve).lockPermanent(lockInfoUser2.tokenAddress, lockInfoUser2.tokenId);
    vm.stopPrank();

    vm.startPrank(address(0x9ABC));
    IveION(ve).lockPermanent(lockInfoUser3.tokenAddress, lockInfoUser3.tokenId);
    vm.stopPrank();

    vm.startPrank(address(0xDEF0));
    IveION(ve).lockPermanent(lockInfoUser4.tokenAddress, lockInfoUser4.tokenId);
    vm.stopPrank();

    vm.startPrank(address(0x1111));
    IveION(ve).lockPermanent(lockInfoUser5.tokenAddress, lockInfoUser5.tokenId);
    vm.stopPrank();

    vm.startPrank(address(0x2222));
    IveION(ve).lockPermanent(lockInfoUser6.tokenAddress, lockInfoUser6.tokenId);
    vm.stopPrank();

    vm.startPrank(address(0x3333));
    IveION(ve).lockPermanent(lockInfoUser7.tokenAddress, lockInfoUser7.tokenId);
    vm.stopPrank();

    vm.startPrank(cindy);
    IveION(ve).delegate(tokenIdBob, lockInfoUser1.tokenId, lockInfoUser1.tokenAddress, MINT_AMT / 7);
    IveION(ve).delegate(tokenIdBob, lockInfoUser2.tokenId, lockInfoUser2.tokenAddress, MINT_AMT / 7);
    IveION(ve).delegate(tokenIdBob, lockInfoUser3.tokenId, lockInfoUser3.tokenAddress, MINT_AMT / 7);
    IveION(ve).delegate(tokenIdBob, lockInfoUser4.tokenId, lockInfoUser4.tokenAddress, MINT_AMT / 7);
    IveION(ve).delegate(tokenIdBob, lockInfoUser5.tokenId, lockInfoUser5.tokenAddress, MINT_AMT / 7);
    IveION(ve).delegate(tokenIdBob, lockInfoUser6.tokenId, lockInfoUser6.tokenAddress, MINT_AMT / 7);
    IveION(ve).delegate(tokenIdBob, lockInfoUser7.tokenId, lockInfoUser7.tokenAddress, MINT_AMT / 7);
    vm.stopPrank();

    uint256[] memory delegateesBefore = IveION(ve).getDelegatees(tokenIdBob, veloLpType);
    console.log("Delegatees length before transfer:", delegateesBefore.length);

    vm.prank(cindy);
    IveION(ve).transferFrom(cindy, address(0x9ABC), tokenIdBob);

    uint256[] memory delegateesAfter = IveION(ve).getDelegatees(tokenIdBob, veloLpType);
    console.log("Delegatees length after transfer:", delegateesAfter.length);

    assertEq(delegateesBefore.length, 7, "Expected 7 delegatees before transfer");
    assertEq(delegateesAfter.length, 0, "Expected 0 delegatees after transfer");
  }

  function test_removeDelegatees_RemoveByTransferMultiLP() public {
    LockInfoMultiple memory lockInfoUser1 = _createLockMultipleInternal(cindy);
    LockInfoMultiple memory lockInfoUser2 = _createLockMultipleInternal(address(0x92365));

    vm.startPrank(address(0x92365));
    IveION(ve).lockPermanent(lockInfoUser2.tokenAddresses[0], lockInfoUser2.tokenId);
    IveION(ve).lockPermanent(lockInfoUser2.tokenAddresses[1], lockInfoUser2.tokenId);
    vm.stopPrank();

    vm.startPrank(cindy);
    IveION(ve).lockPermanent(lockInfoUser1.tokenAddresses[0], lockInfoUser1.tokenId);
    IveION(ve).lockPermanent(lockInfoUser1.tokenAddresses[1], lockInfoUser1.tokenId);
    vm.stopPrank();

    vm.startPrank(cindy);
    IveION(ve).delegate(lockInfoUser1.tokenId, lockInfoUser2.tokenId, lockInfoUser1.tokenAddresses[0], MINT_AMT / 5);
    IveION(ve).delegate(lockInfoUser1.tokenId, lockInfoUser2.tokenId, lockInfoUser1.tokenAddresses[1], MINT_AMT / 5);
    vm.stopPrank();

    uint256[] memory delegateesBeforeTransferVelo = IveION(ve).getDelegatees(lockInfoUser1.tokenId, veloLpType);
    assertEq(delegateesBeforeTransferVelo.length, 1, "Expected 1 delegatee before transfer for velo LP type");
    uint256[] memory delegateesBeforeTransferBalancer = IveION(ve).getDelegatees(lockInfoUser1.tokenId, balancerLpType);
    assertEq(delegateesBeforeTransferBalancer.length, 1, "Expected 1 delegatee before transfer for balancer LP type");

    vm.prank(cindy);
    IveION(ve).transferFrom(cindy, andy, lockInfoUser1.tokenId);

    uint256[] memory delegateesAfterTransferVelo = IveION(ve).getDelegatees(lockInfoUser1.tokenId, veloLpType);
    assertEq(delegateesAfterTransferVelo.length, 0, "Expected 0 delegatees after transfer for velo LP type");
    uint256[] memory delegateesAfterTransferBalancer = IveION(ve).getDelegatees(lockInfoUser1.tokenId, balancerLpType);
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
    IveION(ve).removeDelegatees(tokenIdAlice, toTokenIds, address(modeVelodrome5050IonMode), amounts);
  }

  function test_removeDelegatees_RevertIfNotOwner() public {
    uint256[] memory toTokenIds = new uint256[](1);
    toTokenIds[0] = tokenIdBob;
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = MINT_AMT;

    vm.prank(address(0x1413));
    vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
    IveION(ve).removeDelegatees(tokenIdAlice, toTokenIds, address(modeVelodrome5050IonMode), amounts);
  }

  function test_removeDelegatees_RevertIfNoDelegation() public {
    uint256[] memory toTokenIds = new uint256[](1);
    toTokenIds[0] = tokenIdCandy;
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = MINT_AMT;

    vm.prank(cindy);
    vm.expectRevert(abi.encodeWithSignature("NoDelegationBetweenTokens(uint256,uint256)", tokenIdAlice, tokenIdCandy));
    IveION(ve).removeDelegatees(tokenIdAlice, toTokenIds, address(modeVelodrome5050IonMode), amounts);
  }

  function test_removeDelegators_UserCanRemoveDelegators() public {
    uint256[] memory fromTokenIds = new uint256[](1);
    fromTokenIds[0] = tokenIdAlice;
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = MINT_AMT;

    vm.prank(cindy);
    IveION(ve).removeDelegators(fromTokenIds, tokenIdBob, address(modeVelodrome5050IonMode), amounts);

    IveION.LockedBalance memory locked1 = IveION(ve).getUserLock(tokenIdAlice, veloLpType);
    IveION.LockedBalance memory locked2 = IveION(ve).getUserLock(tokenIdBob, veloLpType);

    uint256 amountDelegated = IveION(ve).s_delegations(tokenIdAlice, tokenIdBob, veloLpType);

    uint256[] memory delegatees = IveION(ve).getDelegatees(tokenIdAlice, veloLpType);
    bool foundDelegatee = false;
    for (uint256 i = 0; i < delegatees.length; i++) {
      if (delegatees[i] == tokenIdBob) {
        foundDelegatee = true;
        break;
      }
    }

    uint256[] memory delegators = IveION(ve).getDelegators(tokenIdBob, veloLpType);
    bool foundDelegator = false;
    for (uint256 i = 0; i < delegators.length; i++) {
      if (delegatees[i] == tokenIdBob) {
        foundDelegator = true;
        break;
      }
    }

    uint256 userEpoch = IveION(ve).s_userPointEpoch(tokenIdBob, IveION(ve).s_lpType(address(modeVelodrome5050IonMode)));
    IveION.UserPoint memory userPoint = IveION(ve).getUserPoint(
      tokenIdBob,
      IveION(ve).s_lpType(address(modeVelodrome5050IonMode)),
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
    IveION(ve).removeDelegators(fromTokenIDs, tokenIdBob, address(modeVelodrome5050IonMode), amounts);
  }
  function test_removeDelegators_RevertIfNotOwner() public {
    uint256[] memory fromTokenIDs = new uint256[](1);
    fromTokenIDs[0] = tokenIdAlice;
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = MINT_AMT;

    vm.prank(address(0x2352));
    vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
    IveION(ve).removeDelegators(fromTokenIDs, tokenIdBob, address(modeVelodrome5050IonMode), amounts);
  }

  function test_removeDelegators_RevertIfNoDelegationBetweenTokens() public {
    uint256[] memory fromTokenIDs = new uint256[](1);
    fromTokenIDs[0] = tokenIdCandy;
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = MINT_AMT;

    vm.prank(cindy);
    vm.expectRevert(abi.encodeWithSignature("NoDelegationBetweenTokens(uint256,uint256)", tokenIdCandy, tokenIdBob));
    IveION(ve).removeDelegators(fromTokenIDs, tokenIdBob, address(modeVelodrome5050IonMode), amounts);
  }
}
