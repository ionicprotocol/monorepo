// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "../../Utils.sol";
import "../../harness/veIONHarness.sol";

contract Split is veIONTest {
  address user;
  LockInfoMultiple lockInputMultiLP;
  uint256 splitAmount;

  function setUp() public {
    _setUp();
    user = address(0x1234);
    lockInputMultiLP = _createLockMultipleInternal(user);
    splitAmount = MINT_AMT / 2;
    ve.setVoter(address(this));
    vm.prank(ve.owner());
    ve.toggleSplit(user, true);
  }

  function test_split_UserCanSplitAllLP() public {
    splitAmount = MINT_AMT - MINIMUM_LOCK_AMOUNT;
    vm.prank(user);
    (uint256 tokenId1, uint256 tokenId2) = ve.split(
      address(modeVelodrome5050IonMode),
      lockInputMultiLP.tokenId,
      splitAmount
    );

    IveION.LockedBalance memory veloLocked1 = ve.getUserLock(tokenId1, veloLpType);
    IveION.LockedBalance memory balancerLocked1 = ve.getUserLock(tokenId1, balancerLpType);
    IveION.LockedBalance memory veloLocked2 = ve.getUserLock(tokenId2, veloLpType);
    IveION.LockedBalance memory balancerLocked2 = ve.getUserLock(tokenId2, balancerLpType);

    assertEq(ve.balanceOf(user), 2, "User balance should be 2 after split");
    assertEq(veloLocked1.amount, MINIMUM_LOCK_AMOUNT, "First token's velo balance should be reduced by split amount");
    assertEq(balancerLocked1.amount, MINT_AMT, "First token's balancer should be unaffected");
    assertEq(veloLocked2.amount, splitAmount, "Second token's balance should be equal to split amount");
    assertEq(balancerLocked2.amount, 0, "Second token's balancer should be 0");

    address[] memory assetsLocked1 = ve.getAssetsLocked(tokenId1);
    address[] memory assetsLocked2 = ve.getAssetsLocked(tokenId2);

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
    (uint256 tokenId1, uint256 tokenId2) = ve.split(
      address(modeVelodrome5050IonMode),
      lockInputMultiLP.tokenId,
      splitAmount
    );

    IveION.LockedBalance memory veloLocked1 = ve.getUserLock(tokenId1, veloLpType);
    IveION.LockedBalance memory balancerLocked1 = ve.getUserLock(tokenId1, balancerLpType);
    IveION.LockedBalance memory veloLocked2 = ve.getUserLock(tokenId2, veloLpType);
    IveION.LockedBalance memory balancerLocked2 = ve.getUserLock(tokenId2, balancerLpType);

    assertEq(veloLocked1.amount, MINT_AMT / 2, "First split lock amount should be half of the original");
    assertEq(balancerLocked1.amount, MINT_AMT, "Second split lock amount should be half of the original");
    assertEq(veloLocked2.amount, MINT_AMT / 2, "Second split lock amount should be half of the original");
    assertEq(balancerLocked2.amount, 0, "Second split lock amount should be half of the original");
  }

  function test_split_RevertIfAlreadyVoted() public {
    ve.voting(lockInputMultiLP.tokenId, true);
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("AlreadyVoted()"));
    ve.split(address(modeVelodrome5050IonMode), lockInputMultiLP.tokenId, splitAmount);
  }

  function test_split_RevertIfSplitNotAllowedForUser() public {
    ve.toggleSplit(user, false);
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("SplitNotAllowed()"));
    ve.split(address(modeVelodrome5050IonMode), lockInputMultiLP.tokenId, splitAmount);
  }

  function test_split_CanSplitNotAllowedForUserButAllowedGeneral() public {
    ve.toggleSplit(user, false);
    ve.toggleSplit(address(0), true);
    vm.prank(user);
    ve.split(address(modeVelodrome5050IonMode), lockInputMultiLP.tokenId, splitAmount);
  }

  function test_split_RevertIfNotOwner() public {
    vm.prank(address(0x9352));
    vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
    ve.split(address(modeVelodrome5050IonMode), lockInputMultiLP.tokenId, splitAmount);
  }

  function test_split_RevertIfLockExpired() public {
    vm.warp(block.timestamp + lockInputMultiLP.durations[0]);
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("LockExpired()"));
    ve.split(address(modeVelodrome5050IonMode), lockInputMultiLP.tokenId, splitAmount);
  }

  function test_split_RevertIfSplitTooSmall() public {
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("SplitTooSmall()"));
    ve.split(address(modeVelodrome5050IonMode), lockInputMultiLP.tokenId, 0);
  }

  function test_split_RevertIfAmountTooBig() public {
    splitAmount = MINT_AMT * 2;
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("AmountTooBig()"));
    ve.split(address(modeVelodrome5050IonMode), lockInputMultiLP.tokenId, splitAmount);
  }

  function test_split_RevertIfNotEnoughRemainingInOldToken() public {
    splitAmount = 995e18;
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("NotEnoughRemainingAfterSplit()"));
    ve.split(address(modeVelodrome5050IonMode), lockInputMultiLP.tokenId, splitAmount);
  }
}
