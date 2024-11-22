// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "../../Utils.sol";
import "../../harness/veIONHarness.sol";

contract RemoveDelegateesAndRemoveDelegators is veIONTest {
  address cindy;
  address andy;
  LockInfo lockInputAlice;
  LockInfoMultiple lockInputBob;
  LockInfo lockInputCandy;
  LockInfo lockInputRalph;
  veIONHarness harness;
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
    ve.lockPermanent(address(modeVelodrome5050IonMode), tokenIdAlice);
    ve.lockPermanent(address(modeVelodrome5050IonMode), tokenIdBob);
    ve.delegate(tokenIdAlice, tokenIdBob, address(modeVelodrome5050IonMode), MINT_AMT);
    vm.stopPrank();

    vm.startPrank(andy);
    ve.lockPermanent(address(modeVelodrome5050IonMode), tokenIdCandy);
    ve.lockPermanent(address(modeVelodrome5050IonMode), tokenIdRalph);
    ve.delegate(tokenIdCandy, tokenIdRalph, address(modeVelodrome5050IonMode), MINT_AMT);
    vm.stopPrank();
  }

  function test_removeDelegatees_UserCanRemoveDelegatees() public {
    uint256[] memory toTokenIds = new uint256[](1);
    toTokenIds[0] = tokenIdBob;
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = MINT_AMT;

    vm.prank(cindy);
    ve.removeDelegatees(tokenIdAlice, toTokenIds, address(modeVelodrome5050IonMode), amounts);

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

    uint256 userEpoch = ve.s_userPointEpoch(tokenIdBob, ve.s_lpType(address(modeVelodrome5050IonMode)));
    IveION.UserPoint memory userPoint = ve.getUserPoint(
      tokenIdBob,
      ve.s_lpType(address(modeVelodrome5050IonMode)),
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

  function test_removeDelegatees_RevertIfUnmatchedArrays() public {
    uint256[] memory toTokenIds = new uint256[](2);
    toTokenIds[0] = tokenIdBob;
    toTokenIds[1] = tokenIdBob;
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = MINT_AMT;

    vm.prank(cindy);
    vm.expectRevert(abi.encodeWithSignature("ArrayMismatch()"));
    ve.removeDelegatees(tokenIdAlice, toTokenIds, address(modeVelodrome5050IonMode), amounts);
  }

  function test_removeDelegatees_RevertIfNotOwner() public {
    uint256[] memory toTokenIds = new uint256[](1);
    toTokenIds[0] = tokenIdBob;
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = MINT_AMT;

    vm.prank(address(0x1413));
    vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
    ve.removeDelegatees(tokenIdAlice, toTokenIds, address(modeVelodrome5050IonMode), amounts);
  }

  function test_removeDelegatees_RevertIfNoDelegation() public {
    uint256[] memory toTokenIds = new uint256[](1);
    toTokenIds[0] = tokenIdCandy;
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = MINT_AMT;

    vm.prank(cindy);
    vm.expectRevert(abi.encodeWithSignature("NoDelegationBetweenTokens(uint256,uint256)", tokenIdAlice, tokenIdCandy));
    ve.removeDelegatees(tokenIdAlice, toTokenIds, address(modeVelodrome5050IonMode), amounts);
  }

  function test_removeDelegators_UserCanRemoveDelegators() public {
    uint256[] memory fromTokenIds = new uint256[](1);
    fromTokenIds[0] = tokenIdAlice;
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = MINT_AMT;

    vm.prank(cindy);
    ve.removeDelegators(fromTokenIds, tokenIdBob, address(modeVelodrome5050IonMode), amounts);

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

    uint256 userEpoch = ve.s_userPointEpoch(tokenIdBob, ve.s_lpType(address(modeVelodrome5050IonMode)));
    IveION.UserPoint memory userPoint = ve.getUserPoint(
      tokenIdBob,
      ve.s_lpType(address(modeVelodrome5050IonMode)),
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
    ve.removeDelegators(fromTokenIDs, tokenIdBob, address(modeVelodrome5050IonMode), amounts);
  }
  function test_removeDelegators_RevertIfNotOwner() public {
    uint256[] memory fromTokenIDs = new uint256[](1);
    fromTokenIDs[0] = tokenIdAlice;
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = MINT_AMT;

    vm.prank(address(0x2352));
    vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
    ve.removeDelegators(fromTokenIDs, tokenIdBob, address(modeVelodrome5050IonMode), amounts);
  }

  function test_removeDelegators_RevertIfNoDelegationBetweenTokens() public {
    uint256[] memory fromTokenIDs = new uint256[](1);
    fromTokenIDs[0] = tokenIdCandy;
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = MINT_AMT;

    vm.prank(cindy);
    vm.expectRevert(abi.encodeWithSignature("NoDelegationBetweenTokens(uint256,uint256)", tokenIdCandy, tokenIdBob));
    ve.removeDelegators(fromTokenIDs, tokenIdBob, address(modeVelodrome5050IonMode), amounts);
  }
}
