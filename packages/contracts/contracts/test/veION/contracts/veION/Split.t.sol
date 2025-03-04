// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "../../Utils.sol";

contract Split is veIONTest {
  address user;
  LockInfoMultiple lockInputMultiLP;
  uint256 splitAmount;

  address alice;
  address bob;
  address cindy;
  address ralph;
  LockInfo lockInfoAlice;
  LockInfo lockInfoBob;
  LockInfo lockInfoCindy;
  LockInfo lockInfoRalph;

  function setUp() public {
    _setUp();
    user = address(0x1234);
    lockInputMultiLP = _createLockMultipleInternal(user);
    splitAmount = MINT_AMT / 2;
    IveION(ve).setVoter(address(this));
    vm.prank(IveION(ve).owner());
    IveION(ve).toggleSplit(user, true);
  }

  function afterForkSetUp() internal override {
    _afterForkSetUpMode();
    alice = address(0x8325);
    bob = address(0x2542);
    cindy = address(0x3423);
    ralph = address(0x2524);
    lockInfoAlice = _createLockInternalRealLP(alice, true);
    lockInfoBob = _createLockInternalRealLP(bob, false);
    lockInfoCindy = _createLockInternalRealLP(cindy, true);
    lockInfoRalph = _createLockInternalRealLP(ralph, false);
  }

  function test_split_UserCanSplitAllLP() public {
    splitAmount = MINT_AMT - MINIMUM_LOCK_AMOUNT;
    vm.prank(user);
    (uint256 tokenId1, uint256 tokenId2) = IveION(ve).split(
      address(modeVelodrome5050IonMode),
      lockInputMultiLP.tokenId,
      splitAmount
    );

    IveIONStructsEnumsErrorsEvents.LockedBalance memory veloLocked1 = IveION(ve).getUserLock(tokenId1, veloLpType);
    IveIONStructsEnumsErrorsEvents.LockedBalance memory balancerLocked1 = IveION(ve).getUserLock(
      tokenId1,
      balancerLpType
    );
    IveIONStructsEnumsErrorsEvents.LockedBalance memory veloLocked2 = IveION(ve).getUserLock(tokenId2, veloLpType);
    IveIONStructsEnumsErrorsEvents.LockedBalance memory balancerLocked2 = IveION(ve).getUserLock(
      tokenId2,
      balancerLpType
    );

    assertEq(IveION(ve).balanceOf(user), 2, "User balance should be 2 after split");
    assertEq(veloLocked1.amount, MINIMUM_LOCK_AMOUNT, "First token's velo balance should be reduced by split amount");
    assertEq(balancerLocked1.amount, MINT_AMT, "First token's balancer should be unaffected");
    assertEq(veloLocked2.amount, splitAmount, "Second token's balance should be equal to split amount");
    assertEq(balancerLocked2.amount, 0, "Second token's balancer should be 0");

    address[] memory assetsLocked1 = IveION(ve).getAssetsLocked(tokenId1);
    address[] memory assetsLocked2 = IveION(ve).getAssetsLocked(tokenId2);

    bool foundModeVeloInTokenId1 = false;
    for (uint256 i = 0; i < assetsLocked1.length; i++) {
      if (assetsLocked1[i] == address(modeVelodrome5050IonMode)) foundModeVeloInTokenId1 = true;
    }

    bool foundModeVeloInTokenId2 = false;
    for (uint256 i = 0; i < assetsLocked2.length; i++) {
      if (assetsLocked2[i] == address(modeVelodrome5050IonMode)) foundModeVeloInTokenId2 = true;
    }

    assertTrue(foundModeVeloInTokenId1, "TokenId1 should still have the asset modeVelodrome5050IonMode");
    assertTrue(foundModeVeloInTokenId2, "TokenId2 should have the asset modeVelodrome5050IonMode");
  }

  function test_split_UserCanSplitSomeLP() public {
    vm.prank(user);
    (uint256 tokenId1, uint256 tokenId2) = IveION(ve).split(
      address(modeVelodrome5050IonMode),
      lockInputMultiLP.tokenId,
      splitAmount
    );

    IveIONStructsEnumsErrorsEvents.LockedBalance memory veloLocked1 = IveION(ve).getUserLock(tokenId1, veloLpType);
    IveIONStructsEnumsErrorsEvents.LockedBalance memory balancerLocked1 = IveION(ve).getUserLock(
      tokenId1,
      balancerLpType
    );
    IveIONStructsEnumsErrorsEvents.LockedBalance memory veloLocked2 = IveION(ve).getUserLock(tokenId2, veloLpType);
    IveIONStructsEnumsErrorsEvents.LockedBalance memory balancerLocked2 = IveION(ve).getUserLock(
      tokenId2,
      balancerLpType
    );

    assertEq(veloLocked1.amount, MINT_AMT / 2, "First split lock amount should be half of the original");
    assertEq(balancerLocked1.amount, MINT_AMT, "Second split lock amount should be half of the original");
    assertEq(veloLocked2.amount, MINT_AMT / 2, "Second split lock amount should be half of the original");
    assertEq(balancerLocked2.amount, 0, "Second split lock amount should be half of the original");
  }

  function test_split_UnderlyingStakeAlsoSplit() public forkAtBlock(MODE_MAINNET, 16559826) {
    IveION(ve).toggleSplit(address(0), true);
    IveION(ve).setMinimumLockAmount(lockInfoAlice.tokenAddress, 1e18);

    uint256 splitAmt = 4e18;

    vm.startPrank(alice);
    (uint256 tokenId1, uint256 tokenId2) = IveION(ve).split(
      lockInfoAlice.tokenAddress,
      lockInfoAlice.tokenId,
      splitAmt
    );

    assertEq(
      IveION(ve).s_underlyingStake(tokenId1, lockInfoAlice.tokenAddress),
      REAL_LP_LOCK_AMOUNT - splitAmt,
      "Underlying stake for tokenId1 should be half of the original lock amount"
    );

    assertEq(
      IveION(ve).s_underlyingStake(tokenId2, lockInfoAlice.tokenAddress),
      splitAmt,
      "Underlying stake for tokenId2 should be half of the original lock amount"
    );

    vm.stopPrank();
  }

  function test_split_RevertIfAlreadyVoted() public {
    IveION(ve).voting(lockInputMultiLP.tokenId, true);
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("AlreadyVoted()"));
    IveION(ve).split(address(modeVelodrome5050IonMode), lockInputMultiLP.tokenId, splitAmount);
  }

  function test_split_RevertIfSplitNotAllowedForUser() public {
    IveION(ve).toggleSplit(user, false);
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("SplitNotAllowed()"));
    IveION(ve).split(address(modeVelodrome5050IonMode), lockInputMultiLP.tokenId, splitAmount);
  }

  function test_split_CanSplitNotAllowedForUserButAllowedGeneral() public {
    IveION(ve).toggleSplit(user, false);
    IveION(ve).toggleSplit(address(0), true);
    vm.prank(user);
    vm.expectEmit(false, false, false, false);
    emit IveIONStructsEnumsErrorsEvents.SplitCompleted(0, 0, 0, 0, address(0));
    IveION(ve).split(address(modeVelodrome5050IonMode), lockInputMultiLP.tokenId, splitAmount);
  }

  function test_split_RevertIfNotOwner() public {
    vm.prank(address(0x9352));
    vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
    IveION(ve).split(address(modeVelodrome5050IonMode), lockInputMultiLP.tokenId, splitAmount);
  }

  function test_split_RevertIfLockExpired() public {
    vm.warp(block.timestamp + lockInputMultiLP.durations[0]);
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("LockExpired()"));
    IveION(ve).split(address(modeVelodrome5050IonMode), lockInputMultiLP.tokenId, splitAmount);
  }

  function test_split_RevertIfSplitTooSmall() public {
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("SplitTooSmall()"));
    IveION(ve).split(address(modeVelodrome5050IonMode), lockInputMultiLP.tokenId, 0);
  }

  function test_split_RevertIfAmountTooBig() public {
    splitAmount = MINT_AMT * 2;
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("AmountTooBig()"));
    IveION(ve).split(address(modeVelodrome5050IonMode), lockInputMultiLP.tokenId, splitAmount);
  }

  function test_split_RevertIfNotEnoughRemainingInOldToken() public {
    splitAmount = 995e18;
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("NotEnoughRemainingAfterSplit()"));
    IveION(ve).split(address(modeVelodrome5050IonMode), lockInputMultiLP.tokenId, splitAmount);
  }
}
