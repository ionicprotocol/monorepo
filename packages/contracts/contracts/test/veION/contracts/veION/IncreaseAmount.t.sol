// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "../../Utils.sol";

contract IncreaseAmount is veIONTest {
  address user;
  uint256 tokenId;
  LockInfo lockInput;
  LockInfoMultiple lockInputMultiLP;

  function setUp() public {
    _setUp();
    user = address(0x1234);
    lockInput = _createLockInternal(user);
    lockInputMultiLP = _createLockMultipleInternal(user);
  }

  function test_increaseAmount_UserCanIncreaseLock() public {
    uint256 additionalAmount = 500 * 10 ** 18; // 500 tokens
    modeVelodrome5050IonMode.mint(user, additionalAmount);

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), additionalAmount);
    ve.increaseAmount(address(modeVelodrome5050IonMode), lockInput.tokenId, additionalAmount, false);
    vm.stopPrank();

    IveION.LockedBalance memory actualLocked = ve.getUserLock(lockInput.tokenId, veloLpType);
    uint256 calculated_end = ((block.timestamp + lockInput.duration) / WEEK) * WEEK; // Update end time
    uint256 userEpoch = ve.s_userPointEpoch(lockInput.tokenId, ve.s_lpType(lockInput.tokenAddress));
    uint256[] memory ownerTokenIds = ve.getOwnedTokenIds(user);
    address[] memory assetsLocked = ve.getAssetsLocked(lockInput.tokenId);

    assertEq(lockInput.tokenAmount + additionalAmount, actualLocked.amount, "Lock amount should be increased");
    assertEq(lockInput.tokenAddress, actualLocked.tokenAddress, "Token address mismatch");
    assertEq(calculated_end, actualLocked.end, "Unlock time mismatch");
    assertEq(false, actualLocked.isPermanent, "Lock should not be permanent");
    assertEq(
      ve.s_supply(ve.s_lpType(lockInput.tokenAddress)),
      actualLocked.amount + lockInputMultiLP.tokenAmounts[0],
      "Supply mismatch"
    );
    assertEq(userEpoch, 1, "User epoch mismatch");
    assertEq(lockInput.tokenId + 1, ve.s_tokenId(), "Token ID mismatch");
    assertEq(ownerTokenIds.length, 2, "Owner should have one token ID");
    assertEq(ownerTokenIds[0], lockInput.tokenId, "Owner token ID mismatch");
    assertEq(assetsLocked.length, 1, "Assets locked length mismatch");
    assertEq(assetsLocked[0], lockInput.tokenAddress, "Assets locked address mismatch");
  }

  function test_increaseAmountI_PermanentLock() public {
    vm.prank(user);
    ve.lockPermanent(address(modeVelodrome5050IonMode), lockInput.tokenId);

    uint256 additionalAmount = 500 * 10 ** 18; // 500 tokens
    modeVelodrome5050IonMode.mint(user, additionalAmount);

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), additionalAmount);
    ve.increaseAmount(address(modeVelodrome5050IonMode), lockInput.tokenId, additionalAmount, false);
    vm.stopPrank();

    IveION.LockedBalance memory actualLocked = ve.getUserLock(lockInput.tokenId, veloLpType);
    uint256 userEpoch = ve.s_userPointEpoch(lockInput.tokenId, ve.s_lpType(lockInput.tokenAddress));
    IveION.UserPoint memory userPoint = ve.getUserPoint(
      lockInput.tokenId,
      ve.s_lpType(lockInput.tokenAddress),
      userEpoch
    );

    assertEq(lockInput.tokenAmount + additionalAmount, actualLocked.amount, "Lock amount should be increased");
    assertTrue(actualLocked.isPermanent, "Lock should be permanent");
    assertEq(
      lockInput.tokenAmount + additionalAmount,
      userPoint.permanent,
      "Permanent Lock amount should be increased"
    );
  }

  function test_increaseAmount_RevertIfAssetWhitelistedButNotLockedByUser() public {
    uint256 additionalAmount = 500 * 10 ** 18; // 500 tokens
    modeBalancer8020IonEth.mint(user, additionalAmount);

    vm.startPrank(user);
    modeBalancer8020IonEth.approve(address(ve), additionalAmount);
    vm.expectRevert(abi.encodeWithSignature("NoLockFound()"));
    ve.increaseAmount(address(modeBalancer8020IonEth), lockInput.tokenId, additionalAmount, false);
    vm.stopPrank();
  }

  function test_increaseAmountI_RevertIfAssetWhitelistedLockedAndWithdrawnByUser() public {
    vm.warp(block.timestamp + lockInputMultiLP.durations[0]);
    vm.prank(user);
    ve.withdraw(lockInputMultiLP.tokenAddresses[0], lockInputMultiLP.tokenId);

    uint256 additionalAmount = 500 * 10 ** 18; // 500 tokens
    modeBalancer8020IonEth.mint(user, additionalAmount);

    vm.startPrank(user);
    modeBalancer8020IonEth.approve(address(ve), additionalAmount);
    vm.expectRevert(abi.encodeWithSignature("NoLockFound()"));
    ve.increaseAmount(lockInputMultiLP.tokenAddresses[0], lockInputMultiLP.tokenId, additionalAmount, false);
    vm.stopPrank();
  }

  function test_increaseAmount_RevertIfNotOwner() public {
    uint256 additionalAmount = 500 * 10 ** 18; // 500 tokens
    modeVelodrome5050IonMode.mint(user, additionalAmount);
    address otherUser = address(0x9353);

    vm.prank(user);
    modeVelodrome5050IonMode.approve(address(ve), additionalAmount);
    vm.prank(otherUser);
    vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
    ve.increaseAmount(address(modeVelodrome5050IonMode), lockInput.tokenId, additionalAmount, false);
  }

  function test_increaseAmount_RevertIfValueIsZero() public {
    uint256 additionalAmount = 0;

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), additionalAmount);
    vm.expectRevert(abi.encodeWithSignature("ZeroAmount()"));
    ve.increaseAmount(address(modeVelodrome5050IonMode), lockInput.tokenId, additionalAmount, false);
    vm.stopPrank();
  }

  function test_increaseAmount_RevertIfTokenIdNonexistent() public {
    uint256 additionalAmount = 500 * 10 ** 18; // 500 tokens
    modeVelodrome5050IonMode.mint(user, additionalAmount);

    uint256 nonexistentToken = 3463;

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), additionalAmount);
    vm.expectRevert("ERC721: invalid token ID");
    ve.increaseAmount(address(modeVelodrome5050IonMode), nonexistentToken, additionalAmount, false);
    vm.stopPrank();
  }

  function test_increaseAmount_RevertIfLockExpired() public {
    vm.warp(block.timestamp + lockInput.duration);

    uint256 additionalAmount = 500 * 10 ** 18; // 500 tokens
    modeVelodrome5050IonMode.mint(user, additionalAmount);

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), additionalAmount);
    vm.expectRevert(abi.encodeWithSignature("LockExpired()"));
    ve.increaseAmount(address(modeVelodrome5050IonMode), lockInput.tokenId, additionalAmount, false);
    vm.stopPrank();
  }

  function test_increaseAmount_RevertIfTokenNotWhitelisted() public {
    uint256 additionalAmount = 500 * 10 ** 18; // 500 tokens
    MockERC20 randomMockToken = new MockERC20("MockToken", "MTK", 18);
    randomMockToken.mint(user, additionalAmount);

    vm.startPrank(user);
    randomMockToken.approve(address(ve), additionalAmount);
    vm.expectRevert(abi.encodeWithSignature("TokenNotWhitelisted()"));
    ve.increaseAmount(address(randomMockToken), lockInput.tokenId, additionalAmount, false);
    vm.stopPrank();
  }
}
