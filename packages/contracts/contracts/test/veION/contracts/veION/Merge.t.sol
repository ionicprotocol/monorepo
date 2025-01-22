// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "../../Utils.sol";

contract Merge is veIONTest {
  address user;
  LockInfo lockInput_1;
  LockInfo lockInput_2;
  LockInfoMultiple lockInputMultiLP;

  function setUp() public {
    _setUp();
    user = address(0x1234);
    lockInput_1 = _createLockInternal(user);
    lockInput_2 = _createLockInternal(user);
    lockInputMultiLP = _createLockMultipleInternal(user);
    IveION(ve).setVoter(address(this));
  }

  function test_merge_UserCanMerge() public {
    vm.prank(user);
    IveION(ve).merge(lockInput_1.tokenId, lockInput_2.tokenId);

    IveION.LockedBalance memory mergedLock = IveION(ve).getUserLock(lockInput_2.tokenId, veloLpType);
    IveION.LockedBalance memory burnedLock = IveION(ve).getUserLock(lockInput_1.tokenId, veloLpType);

    assertEq(
      mergedLock.amount,
      lockInput_2.tokenAmount * 2,
      "Merged lock amount should be the sum of the original locks"
    );
    assertEq(burnedLock.amount, 0, "First lock amount should be zero after merge");
    assertEq(burnedLock.end, 0, "First lock end time should be zero after merge");

    vm.expectRevert("ERC721: invalid token ID");
    IveION(ve).ownerOf(lockInput_1.tokenId);
  }

  function test_merge_UserCanMergeMultiLockIntoSingleLock() public {
    vm.prank(user);
    IveION(ve).merge(lockInputMultiLP.tokenId, lockInput_2.tokenId);

    IveION.LockedBalance memory mergedLockVelo = IveION(ve).getUserLock(lockInput_2.tokenId, veloLpType);
    IveION.LockedBalance memory mergedLockBalancer = IveION(ve).getUserLock(lockInput_2.tokenId, balancerLpType);

    assertEq(mergedLockVelo.amount, MINT_AMT * 2, "Velo merged lock amount should be the sum of the original locks");
    assertEq(
      mergedLockBalancer.amount,
      MINT_AMT,
      "Balancer merged lock amount should be the sum of the original locks"
    );
    address[] memory assetsLocked = IveION(ve).getAssetsLocked(lockInput_2.tokenId);
    bool foundVelo = false;
    bool foundBalancer = false;

    for (uint256 i = 0; i < assetsLocked.length; i++) {
      if (assetsLocked[i] == address(modeVelodrome5050IonMode)) {
        foundVelo = true;
      }
      if (assetsLocked[i] == address(modeBalancer8020IonEth)) {
        foundBalancer = true;
      }
    }

    assertTrue(foundVelo, "Velo token should be in assetsLocked for lockInput_2");
    assertTrue(foundBalancer, "Balancer token should be in assetsLocked for lockInput_2");
  }

  function test_merge_UserCanMergeSingleLockIntoMultiLock() public {
    vm.prank(user);
    IveION(ve).merge(lockInput_1.tokenId, lockInputMultiLP.tokenId);

    IveION.LockedBalance memory mergedLockVelo = IveION(ve).getUserLock(lockInputMultiLP.tokenId, veloLpType);
    IveION.LockedBalance memory mergedLockBalancer = IveION(ve).getUserLock(lockInputMultiLP.tokenId, balancerLpType);

    assertEq(mergedLockVelo.amount, MINT_AMT * 2, "Velo merged lock amount should be the sum of the original locks");
    assertEq(
      mergedLockBalancer.amount,
      MINT_AMT,
      "Balancer merged lock amount should be the sum of the original locks"
    );
    address[] memory assetsLocked = IveION(ve).getAssetsLocked(lockInputMultiLP.tokenId);
    bool foundVelo = false;
    bool foundBalancer = false;

    for (uint256 i = 0; i < assetsLocked.length; i++) {
      if (assetsLocked[i] == address(modeVelodrome5050IonMode)) {
        foundVelo = true;
      }
      if (assetsLocked[i] == address(modeBalancer8020IonEth)) {
        foundBalancer = true;
      }
    }

    assertTrue(foundVelo, "Velo token should be in assetsLocked for lockInputMultiLP");
    assertTrue(foundBalancer, "Balancer token should be in assetsLocked for lockInputMultiLP");
  }

  function test_merge_RevertIfNotOwnerOfFromToken() public {
    address randomUser = address(0x3524);
    LockInfo memory strangerLockInput = _createLockInternal(randomUser);

    vm.prank(randomUser);
    vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
    IveION(ve).merge(lockInput_1.tokenId, strangerLockInput.tokenId);
  }

  function test_merge_RevertIfNotOwnerOfToToken() public {
    address randomUser = address(0x3524);
    LockInfo memory strangerLockInput = _createLockInternal(randomUser);

    vm.prank(randomUser);
    vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
    IveION(ve).merge(strangerLockInput.tokenId, lockInput_1.tokenId);
  }

  function test_merge_RevertIfVoting() public {
    IveION(ve).voting(lockInput_1.tokenId, true);
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("AlreadyVoted()"));
    IveION(ve).merge(lockInput_1.tokenId, lockInput_2.tokenId);
  }

  function test_merge_RevertIfSameToken() public {
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("SameNFT()"));
    IveION(ve).merge(lockInput_1.tokenId, lockInput_1.tokenId);
  }

  function test_merge_RevertIfEitherTokenDoesNotExist() public {
    uint256 nonExistentTokenId = 97959;

    vm.prank(user);
    vm.expectRevert("ERC721: invalid token ID");
    IveION(ve).merge(nonExistentTokenId, lockInput_1.tokenId);

    vm.prank(user);
    vm.expectRevert("ERC721: invalid token ID");
    IveION(ve).merge(lockInput_1.tokenId, nonExistentTokenId);
  }

  function test_merge_RevertIfToExpiredOrFromExpired() public {
    uint256 amount = MINT_AMT;
    modeVelodrome5050IonMode.mint(user, amount);

    address[] memory tokenAddresses = new address[](1);
    tokenAddresses[0] = address(modeVelodrome5050IonMode);
    uint256[] memory tokenAmounts = new uint256[](1);
    tokenAmounts[0] = amount;
    uint256[] memory durations = new uint256[](1);
    durations[0] = 80 weeks;

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), amount);
    uint256 tokenId = IveION(ve).createLock(tokenAddresses, tokenAmounts, durations, new bool[](1));
    vm.stopPrank();

    vm.warp(block.timestamp + 54 weeks);

    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("LockExpired()"));
    IveION(ve).merge(tokenId, lockInput_1.tokenId);

    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("LockExpired()"));
    IveION(ve).merge(lockInput_1.tokenId, tokenId);
  }

  function test_merge_RevertIfFromPermanentOrToPermanent() public {
    vm.prank(user);
    IveION(ve).lockPermanent(lockInput_1.tokenAddress, lockInput_1.tokenId);

    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("PermanentLock()"));
    IveION(ve).merge(lockInput_1.tokenId, lockInput_2.tokenId);

    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("PermanentLock()"));
    IveION(ve).merge(lockInput_2.tokenId, lockInput_1.tokenId);
  }

  function test_merge_ShouldRecalculateBoostUsingEarlierStartAndLaterEnd() public {
    vm.warp(block.timestamp + 40 weeks);
    uint256 amount = MINT_AMT;
    modeVelodrome5050IonMode.mint(user, amount);

    address[] memory tokenAddresses = new address[](1);
    tokenAddresses[0] = address(modeVelodrome5050IonMode);
    uint256[] memory tokenAmounts = new uint256[](1);
    tokenAmounts[0] = amount;
    uint256[] memory durations = new uint256[](1);
    durations[0] = 26 weeks;

    IveION.LockedBalance memory locked1 = IveION(ve).getUserLock(lockInput_1.tokenId, veloLpType);
    uint256 expectedStart = locked1.start;

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), amount);
    uint256 tokenId = IveION(ve).createLock(tokenAddresses, tokenAmounts, durations, new bool[](1));

    IveION.LockedBalance memory locked2 = IveION(ve).getUserLock(tokenId, veloLpType);
    uint256 expectedEnd = locked2.end;

    IveION(ve).merge(lockInput_1.tokenId, tokenId);
    vm.stopPrank();

    IveION.LockedBalance memory mergedLock = IveION(ve).getUserLock(tokenId, veloLpType);

    assertEq(mergedLock.start, expectedStart, "Merged lock should have the earlier start time");
    assertEq(mergedLock.end, expectedEnd, "Merged lock should have the later end time");

    emit log_named_uint("boost", mergedLock.boost);
  }

  function test_merge_IfToHasNoLockForParticularAssetStartShouldNotBeZero() public {
    uint256 amount = MINT_AMT;
    modeBalancer8020IonEth.mint(user, amount);

    address[] memory tokenAddresses = new address[](1);
    tokenAddresses[0] = address(modeBalancer8020IonEth);
    uint256[] memory tokenAmounts = new uint256[](1);
    tokenAmounts[0] = amount;
    uint256[] memory durations = new uint256[](1);
    durations[0] = 70 weeks;

    IveION.LockedBalance memory locked1 = IveION(ve).getUserLock(lockInput_1.tokenId, veloLpType);
    uint256 expectedStart = locked1.start;
    uint256 expectedEnd = locked1.end;
    uint256 boost = locked1.boost;

    emit log_named_uint("locked1 start time", locked1.start);
    emit log_named_uint("locked1 end time", locked1.end);

    vm.startPrank(user);
    modeBalancer8020IonEth.approve(address(ve), amount);
    uint256 secondTokenId = IveION(ve).createLock(tokenAddresses, tokenAmounts, durations, new bool[](1));
    IveION.LockedBalance memory locked2 = IveION(ve).getUserLock(secondTokenId, veloLpType);
    emit log_named_uint("locked2 start time", locked2.start);
    emit log_named_uint("locked2 end time", locked2.end);
    IveION(ve).merge(lockInput_1.tokenId, secondTokenId);
    vm.stopPrank();

    IveION.LockedBalance memory mergedLock = IveION(ve).getUserLock(secondTokenId, veloLpType);

    emit log_named_uint("mergedLock start time", mergedLock.start);
    emit log_named_uint("mergedLock end time", mergedLock.end);
    assertEq(mergedLock.start, expectedStart, "Merged lock should have the earlier start time");
    assertEq(mergedLock.end, expectedEnd, "Merged lock should have the later end time");
    assertEq(mergedLock.boost, boost, "Should maintain original boost");
  }
}
