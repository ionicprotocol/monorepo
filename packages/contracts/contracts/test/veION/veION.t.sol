// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "./Utils.sol";

contract CreateLock is veIONTest {
  function test_createLock_UserCanCreateLock() public fork(MODE_MAINNET) {
    TestVars memory vars;
    vars.user = address(0x1234);

    LockInfo memory lockInput = _createLockInternal(vars.user);
    IveION.LockedBalance memory actualLock = ve.getUserLock(lockInput.tokenId, ve.s_lpType(lockInput.tokenAddress));

    vars.lockedBalance_end_test = ((block.timestamp + lockInput.duration) / WEEK) * WEEK;
    vars.expectedSupply = lockInput.tokenAmount;
    vars.userEpoch = ve.s_userPointEpoch(lockInput.tokenId, ve.s_lpType(lockInput.tokenAddress));
    IveION.UserPoint memory userPoint = ve.getUserPoint(
      lockInput.tokenId,
      ve.s_lpType(lockInput.tokenAddress),
      vars.userEpoch
    );
    vars.ownerTokenIds = ve.getOwnedTokenIds(vars.user);
    vars.assetsLocked = ve.getAssetsLocked(lockInput.tokenId);

    assertEq(lockInput.tokenAddress, actualLock.tokenAddress, "Token address mismatch");
    assertEq(lockInput.tokenAmount, actualLock.amount, "Token amount mismatch");
    assertEq(vars.lockedBalance_end_test, actualLock.end, "Unlock time mismatch");
    assertEq(false, actualLock.isPermanent, "Lock should not be permanent");
    assertEq(ve.s_supply(ve.s_lpType(lockInput.tokenAddress)), actualLock.amount, "Supply mismatch");
    assertEq(vars.userEpoch, 1, "User epoch mismatch");
    assertEq(userPoint.ts, block.timestamp, "User point timestamp mismatch");
    assertEq(userPoint.blk, block.number, "User point block number mismatch");
    assertGt(userPoint.bias, 0, "User point bias mismatch");
    assertGt(userPoint.slope, 0, "User point slope mismatch");
    assertEq(userPoint.permanent, 0, "User point permanent mismatch");
    assertEq(ve.s_tokenId(), lockInput.tokenId, "Token ID mismatch");
    assertEq(vars.ownerTokenIds.length, 1, "Owner should have one token ID");
    assertEq(vars.ownerTokenIds[0], lockInput.tokenId, "Owner token ID mismatch");
    assertEq(vars.assetsLocked.length, 1, "Assets locked length mismatch");
    assertEq(vars.assetsLocked[0], lockInput.tokenAddress, "Assets locked address mismatch");
  }

  function test_createLock_MinBoostIsApplied() public fork(MODE_MAINNET) {
    address user = address(0x1234);
    uint256 amount = MINT_AMT; // 1000 tokens
    modeVelodrome5050IonMode.mint(user, amount);

    address[] memory tokenAddresses = new address[](1);
    tokenAddresses[0] = address(modeVelodrome5050IonMode);

    uint256[] memory tokenAmounts = new uint256[](1);
    tokenAmounts[0] = amount;

    uint256[] memory durations = new uint256[](1);
    durations[0] = 180 * 86400;

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), amount);
    uint256 tokenId = ve.createLock(tokenAddresses, tokenAmounts, durations, new bool[](1));
    vm.stopPrank();

    IveION.LockedBalance memory actualLock = ve.getUserLock(tokenId, ve.s_lpType(tokenAddresses[0]));

    uint256 boost = actualLock.boost;
    assertEq(boost, 1e18, "Boost mismatch");
  }

  function test_createLock_MaxBoostIsApplied() public fork(MODE_MAINNET) {
    address user = address(0x1234);
    uint256 amount = MINT_AMT; // 1000 tokens
    modeVelodrome5050IonMode.mint(user, amount);

    address[] memory tokenAddresses = new address[](1);
    tokenAddresses[0] = address(modeVelodrome5050IonMode);

    uint256[] memory tokenAmounts = new uint256[](1);
    tokenAmounts[0] = amount;

    uint256[] memory durations = new uint256[](1);
    durations[0] = 2 * 365 * 86400;

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), amount);
    uint256 tokenId = ve.createLock(tokenAddresses, tokenAmounts, durations, new bool[](1));
    vm.stopPrank();

    IveION.LockedBalance memory actualLock = ve.getUserLock(tokenId, ve.s_lpType(tokenAddresses[0]));

    uint256 boost = actualLock.boost;
    assertApproxEqAbs(boost, 2e18, 1e16, "Boost mismatch");
  }

  function test_createLock_UserCanLockMultipleLP() public fork(MODE_MAINNET) {
    TestVars memory vars;

    vars.user = address(0x1234);
    LockInfoMultiple memory lockInput = _createLockMultipleInternal(vars.user);

    for (uint256 i = 0; i < lockInput.tokenAddresses.length; i++) {
      (address lb_tokenAddress, uint256 lb_amount, , , uint256 lb_end, , ) = ve.s_locked(
        lockInput.tokenId,
        ve.s_lpType(lockInput.tokenAddresses[i])
      );
      uint256 unlockTime = ((block.timestamp + lockInput.durations[i]) / WEEK) * WEEK;

      assertEq(lb_tokenAddress, lockInput.tokenAddresses[i], "Token address mismatch");
      assertEq(lb_amount, lockInput.tokenAmounts[i], "Token amount mismatch");
      assertEq(lb_end, unlockTime, "Unlock time mismatch");
    }

    vars.expectedSupply = MINT_AMT;
    vars.userEpoch = ve.s_userPointEpoch(lockInput.tokenId, ve.s_lpType(lockInput.tokenAddresses[0]));
    vars.ownerTokenIds = ve.getOwnedTokenIds(vars.user);
    vars.assetsLocked = ve.getAssetsLocked(lockInput.tokenId);

    assertEq(ve.s_supply(ve.s_lpType(lockInput.tokenAddresses[1])), vars.expectedSupply, "Supply mismatch");
    assertEq(ve.s_supply(ve.s_lpType(lockInput.tokenAddresses[0])), vars.expectedSupply, "Supply mismatch");
    assertEq(vars.userEpoch, 1, "User epoch mismatch");
    assertEq(ve.s_tokenId(), lockInput.tokenId, "Token ID mismatch");
    assertEq(vars.ownerTokenIds.length, 1, "Owner should have one token ID");
    assertEq(vars.ownerTokenIds[0], lockInput.tokenId, "Owner token ID mismatch");
    assertEq(vars.assetsLocked.length, lockInput.tokenAddresses.length, "Assets locked length mismatch");
    for (uint256 i = 0; i < vars.assetsLocked.length; i++) {
      assertEq(vars.assetsLocked[i], lockInput.tokenAddresses[i], "Assets locked address mismatch");
    }
  }

  function test_createLock_StakeUnderlyingLP() public fork(MODE_MAINNET) {
    TestVars memory vars;

    address ionMode5050 = 0x690A74d2eC0175a69C0962B309E03021C0b5002E;
    address veloGauge = 0x8EE410cC13948e7e684ebACb36b552e2c2A125fC;

    VeloIonModeStakingStrategy veloIonModeStakingStrategy = new VeloIonModeStakingStrategy(
      address(ve),
      ionMode5050,
      veloGauge,
      address(veloStakingWalletImplementation)
    );

    ve.setStakeStrategy(veloLpType, IStakeStrategy(veloIonModeStakingStrategy));

    address[] memory whitelistedTokens = new address[](1);
    bool[] memory isWhitelistedTokens = new bool[](1);
    whitelistedTokens[0] = ionMode5050;
    isWhitelistedTokens[0] = true;

    ve.whitelistTokens(whitelistedTokens, isWhitelistedTokens);
    ve.setLpTokenType(ionMode5050, IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE);
    // Mint ModeVelodrome tokens to the user
    vars.user = address(0x5678);
    vars.amount = 10 ether;

    vm.prank(0x8034857f8A467624BaF973de28026CEB9A2fF5F1);
    IERC20(ionMode5050).transfer(vars.user, vars.amount);

    // Approve veION contract to spend user's tokens
    vm.prank(vars.user);
    IERC20(ionMode5050).approve(address(ve), vars.amount);

    // Prepare parameters for createLock
    vars.tokenAddresses = new address[](1);
    vars.tokenAddresses[0] = address(ionMode5050);

    vars.tokenAmounts = new uint256[](1);
    vars.tokenAmounts[0] = vars.amount;

    vars.durations = new uint256[](1);
    vars.durations[0] = 52 weeks;

    vars.stakeUnderlying = new bool[](1);
    vars.stakeUnderlying[0] = true;

    // Create lock
    vm.prank(vars.user);
    ve.createLock(vars.tokenAddresses, vars.tokenAmounts, vars.durations, vars.stakeUnderlying);

    address stakingWalletInstance = veloIonModeStakingStrategy.userStakingWallet(vars.user);
    uint256 stakingWalletInstanceBalance = IVeloIonModeStaking(veloGauge).balanceOf(stakingWalletInstance);

    // Advance the blockchain by 1 week
    vm.warp(block.timestamp + 1 weeks);
    uint256 reward = IVeloIonModeStaking(veloGauge).earned(stakingWalletInstance);

    assertTrue(stakingWalletInstance != address(0), "Staking Wallet Instance should not be zero address");
    assertEq(stakingWalletInstanceBalance, vars.amount, "Staking Wallet Instance Balance should match locked amount");
    assertTrue(reward > 0, "Reward should be greater than zero after 1 week");
  }

  function test_createLock_StakeUnderlyingLPAndClaimRewards() public fork(MODE_MAINNET) {
    TestVars memory vars;

    address ionMode5050 = 0x690A74d2eC0175a69C0962B309E03021C0b5002E;
    address veloGauge = 0x8EE410cC13948e7e684ebACb36b552e2c2A125fC;

    VeloIonModeStakingStrategy veloIonModeStakingStrategy = new VeloIonModeStakingStrategy(
      address(ve),
      ionMode5050,
      veloGauge,
      address(veloStakingWalletImplementation)
    );

    ve.setStakeStrategy(veloLpType, IStakeStrategy(veloIonModeStakingStrategy));

    address[] memory whitelistedTokens = new address[](1);
    bool[] memory isWhitelistedTokens = new bool[](1);
    whitelistedTokens[0] = ionMode5050;
    isWhitelistedTokens[0] = true;

    ve.whitelistTokens(whitelistedTokens, isWhitelistedTokens);
    ve.setLpTokenType(ionMode5050, IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE);
    // Mint ModeVelodrome tokens to the user
    vars.user = address(0x5678);
    vars.amount = 10 ether;

    vm.prank(0x8034857f8A467624BaF973de28026CEB9A2fF5F1);
    IERC20(ionMode5050).transfer(vars.user, vars.amount);

    // Approve veION contract to spend user's tokens
    vm.prank(vars.user);
    IERC20(ionMode5050).approve(address(ve), vars.amount);

    // Prepare parameters for createLock
    vars.tokenAddresses = new address[](1);
    vars.tokenAddresses[0] = address(ionMode5050);

    vars.tokenAmounts = new uint256[](1);
    vars.tokenAmounts[0] = vars.amount;

    vars.durations = new uint256[](1);
    vars.durations[0] = 52 weeks;

    vars.stakeUnderlying = new bool[](1);
    vars.stakeUnderlying[0] = true;

    // Create lock
    vm.prank(vars.user);
    ve.createLock(vars.tokenAddresses, vars.tokenAmounts, vars.durations, vars.stakeUnderlying);

    vm.warp(block.timestamp + 1 weeks);

    address stakingWalletInstance = veloIonModeStakingStrategy.userStakingWallet(vars.user);
    uint256 stakingWalletInstanceBalance = IVeloIonModeStaking(veloGauge).balanceOf(stakingWalletInstance);
    uint256 reward = IVeloIonModeStaking(veloGauge).earned(stakingWalletInstance);

    vm.prank(vars.user);
    ve.claimEmissions(vars.tokenAddresses[0]);

    stakingWalletInstanceBalance = IVeloIonModeStaking(veloGauge).balanceOf(stakingWalletInstance);
    reward = IVeloIonModeStaking(veloGauge).earned(stakingWalletInstance);

    uint256 userRewardBalance = IERC20(IVeloIonModeStaking(veloGauge).rewardToken()).balanceOf(vars.user);

    assertEq(
      stakingWalletInstanceBalance,
      vars.amount,
      "Staking Wallet Instance Balance After Claim should be the same"
    );
    assertEq(reward, 0, "Earned After Claim should be 0");
    assertGt(userRewardBalance, reward, "User Reward Balance should be the earned amount");
  }

  function test_createLock_RevertsIfUnequalArrayLenghts() public fork(MODE_MAINNET) {
    address user = address(0x1234);
    uint256 amount = MINT_AMT; // 1000 tokens
    modeVelodrome5050IonMode.mint(user, amount);

    address[] memory tokenAddresses = new address[](2);
    tokenAddresses[0] = address(modeVelodrome5050IonMode);
    tokenAddresses[1] = address(modeBalancer8020IonEth);

    uint256[] memory tokenAmounts = new uint256[](1);
    tokenAmounts[0] = amount;

    uint256[] memory durations = new uint256[](1);
    durations[0] = 52 weeks;

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), amount);
    vm.expectRevert(abi.encodeWithSignature("ArrayMismatch()"));
    ve.createLock(tokenAddresses, tokenAmounts, durations, new bool[](1));
    vm.stopPrank();
  }

  function test_createLock_RevertsIfZeroAmount() public fork(MODE_MAINNET) {
    address user = address(0x1234);
    uint256 amount = MINT_AMT; // 1000 tokens
    modeVelodrome5050IonMode.mint(user, amount);

    address[] memory tokenAddresses = new address[](1);
    tokenAddresses[0] = address(modeVelodrome5050IonMode);

    uint256[] memory tokenAmounts = new uint256[](1);
    tokenAmounts[0] = 0;

    uint256[] memory durations = new uint256[](1);
    durations[0] = 52 weeks;

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), amount);
    vm.expectRevert(abi.encodeWithSignature("ZeroAmount()"));
    ve.createLock(tokenAddresses, tokenAmounts, durations, new bool[](1));
    vm.stopPrank();
  }

  function test_createLock_RevertsIfDurationTooShort() public fork(MODE_MAINNET) {
    address user = address(0x1234);
    uint256 amount = MINT_AMT; // 1000 tokens
    modeVelodrome5050IonMode.mint(user, amount);

    address[] memory tokenAddresses = new address[](1);
    tokenAddresses[0] = address(modeVelodrome5050IonMode);

    uint256[] memory tokenAmounts = new uint256[](1);
    tokenAmounts[0] = amount;

    uint256[] memory durations = new uint256[](1);
    durations[0] = 10 weeks;

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), amount);
    vm.expectRevert(abi.encodeWithSignature("LockDurationTooShort()"));
    ve.createLock(tokenAddresses, tokenAmounts, durations, new bool[](1));
    vm.stopPrank();
  }

  function test_createLock_RevertIfDurationTooLong() public fork(MODE_MAINNET) {
    address user = address(0x1234);
    uint256 amount = MINT_AMT; // 1000 tokens
    modeVelodrome5050IonMode.mint(user, amount);

    address[] memory tokenAddresses = new address[](1);
    tokenAddresses[0] = address(modeVelodrome5050IonMode);

    uint256[] memory tokenAmounts = new uint256[](1);
    tokenAmounts[0] = amount;

    uint256[] memory durations = new uint256[](1);
    durations[0] = 3 * 365 * 86400;

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), amount);
    vm.expectRevert(abi.encodeWithSignature("LockDurationTooLong()"));
    ve.createLock(tokenAddresses, tokenAmounts, durations, new bool[](1));
    vm.stopPrank();
  }

  function test_createLock_RevertIfAmountTooSmall() public fork(MODE_MAINNET) {
    address user = address(0x1234);
    uint256 amount = 5e18; // 1000 tokens
    modeVelodrome5050IonMode.mint(user, amount);

    address[] memory tokenAddresses = new address[](1);
    tokenAddresses[0] = address(modeVelodrome5050IonMode);

    uint256[] memory tokenAmounts = new uint256[](1);
    tokenAmounts[0] = amount;

    uint256[] memory durations = new uint256[](1);
    durations[0] = 52 weeks;

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), amount);
    vm.expectRevert(abi.encodeWithSignature("MinimumNotMet()"));
    ve.createLock(tokenAddresses, tokenAmounts, durations, new bool[](1));
    vm.stopPrank();
  }

  function test_createLock_RevertIfTokenNotWhitelisted() public fork(MODE_MAINNET) {
    address user = address(0x1234);
    uint256 amount = MINT_AMT; // 1000 tokens

    // Deploy a new random MockERC20 token
    MockERC20 randomMockToken = new MockERC20("Random_Token", "RND", 18);
    randomMockToken.mint(user, amount);

    address[] memory tokenAddresses = new address[](1);
    tokenAddresses[0] = address(randomMockToken);

    uint256[] memory tokenAmounts = new uint256[](1);
    tokenAmounts[0] = amount;

    uint256[] memory durations = new uint256[](1);
    durations[0] = 52 weeks;

    vm.startPrank(user);
    randomMockToken.approve(address(ve), amount);
    vm.expectRevert(abi.encodeWithSignature("TokenNotWhitelisted()"));
    ve.createLock(tokenAddresses, tokenAmounts, durations, new bool[](1));
    vm.stopPrank();
  }

  function test_createLock_RevertIfDuplicateTokens() public fork(MODE_MAINNET) {
    address user = address(0x1234);
    uint256 amount = MINT_AMT; // 2000 tokens
    modeVelodrome5050IonMode.mint(user, amount);

    address[] memory tokenAddresses = new address[](2);
    tokenAddresses[0] = address(modeVelodrome5050IonMode);
    tokenAddresses[1] = address(modeVelodrome5050IonMode);

    uint256[] memory tokenAmounts = new uint256[](2);
    tokenAmounts[0] = amount / 2;
    tokenAmounts[1] = amount / 2;

    uint256[] memory durations = new uint256[](2);
    durations[0] = 52 weeks;
    durations[1] = 52 weeks;

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), amount);
    vm.expectRevert(abi.encodeWithSignature("DuplicateAsset()"));
    ve.createLock(tokenAddresses, tokenAmounts, durations, new bool[](2));
    vm.stopPrank();
  }
}

contract IncreaseAmount is veIONTest {
  address user;
  uint256 tokenId;
  LockInfo lockInput;
  LockInfoMultiple lockInputMultiLP;

  function afterForkSetUp() internal override {
    super.afterForkSetUp();
    user = address(0x1234);
    lockInput = _createLockInternal(user);
    lockInputMultiLP = _createLockMultipleInternal(user);
  }

  function test_increaseAmount_UserCanIncreaseLock() public fork(MODE_MAINNET) {
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

  function test_increaseAmountI_PermanentLock() public fork(MODE_MAINNET) {
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

  function test_increaseAmount_RevertIfAssetWhitelistedButNotLockedByUser() public fork(MODE_MAINNET) {
    uint256 additionalAmount = 500 * 10 ** 18; // 500 tokens
    modeBalancer8020IonEth.mint(user, additionalAmount);

    vm.startPrank(user);
    modeBalancer8020IonEth.approve(address(ve), additionalAmount);
    vm.expectRevert(abi.encodeWithSignature("NoLockFound()"));
    ve.increaseAmount(address(modeBalancer8020IonEth), lockInput.tokenId, additionalAmount, false);
    vm.stopPrank();
  }

  function test_increaseAmountI_RevertIfAssetWhitelistedLockedAndWithdrawnByUser() public fork(MODE_MAINNET) {
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

  function test_increaseAmount_RevertIfNotOwner() public fork(MODE_MAINNET) {
    uint256 additionalAmount = 500 * 10 ** 18; // 500 tokens
    modeVelodrome5050IonMode.mint(user, additionalAmount);
    address otherUser = address(0x9353);

    vm.prank(user);
    modeVelodrome5050IonMode.approve(address(ve), additionalAmount);
    vm.prank(otherUser);
    vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
    ve.increaseAmount(address(modeVelodrome5050IonMode), lockInput.tokenId, additionalAmount, false);
  }

  function test_increaseAmount_RevertIfValueIsZero() public fork(MODE_MAINNET) {
    uint256 additionalAmount = 0;

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), additionalAmount);
    vm.expectRevert(abi.encodeWithSignature("ZeroAmount()"));
    ve.increaseAmount(address(modeVelodrome5050IonMode), lockInput.tokenId, additionalAmount, false);
    vm.stopPrank();
  }

  function test_increaseAmount_RevertIfTokenIdNonexistent() public fork(MODE_MAINNET) {
    uint256 additionalAmount = 500 * 10 ** 18; // 500 tokens
    modeVelodrome5050IonMode.mint(user, additionalAmount);

    uint256 nonexistentToken = 3463;

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), additionalAmount);
    vm.expectRevert("ERC721: invalid token ID");
    ve.increaseAmount(address(modeVelodrome5050IonMode), nonexistentToken, additionalAmount, false);
    vm.stopPrank();
  }

  function test_increaseAmount_RevertIfLockExpired() public fork(MODE_MAINNET) {
    vm.warp(block.timestamp + lockInput.duration);

    uint256 additionalAmount = 500 * 10 ** 18; // 500 tokens
    modeVelodrome5050IonMode.mint(user, additionalAmount);

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), additionalAmount);
    vm.expectRevert(abi.encodeWithSignature("LockExpired()"));
    ve.increaseAmount(address(modeVelodrome5050IonMode), lockInput.tokenId, additionalAmount, false);
    vm.stopPrank();
  }

  function test_increaseAmount_RevertIfTokenNotWhitelisted() public fork(MODE_MAINNET) {
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

contract LockAdditionalAsset is veIONTest {
  address user;
  uint256 tokenId;
  LockInfo lockInput;
  LockInfoMultiple lockInputMultiLP;

  function afterForkSetUp() internal override {
    super.afterForkSetUp();
    user = address(0x1234);
    lockInput = _createLockInternal(user);
    lockInputMultiLP = _createLockMultipleInternal(user);
    ve.setVoter(address(this));
  }

  function test_lockAdditionalAsset_UserCanLockAdditionalLp() public fork(MODE_MAINNET) {
    modeBalancer8020IonEth.mint(user, lockInput.tokenAmount);

    vm.prank(user);
    modeBalancer8020IonEth.approve(address(ve), lockInput.tokenAmount);

    uint256 additionalAmount = 500 * 10 ** 18; // 500 tokens
    vm.prank(user);
    ve.lockAdditionalAsset(address(modeBalancer8020IonEth), additionalAmount, lockInput.tokenId, 26 weeks, false);

    IveION.LockedBalance memory lockedBalancer = ve.getUserLock(lockInput.tokenId, balancerLpType);
    uint256 expectedEndTimeBalancer = ((block.timestamp + 26 weeks) / WEEK) * WEEK;

    IveION.LockedBalance memory lockedVelo = ve.getUserLock(
      lockInput.tokenId,
      IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE
    );
    uint256 expectedEndTimeVelo = ((block.timestamp + 52 weeks) / WEEK) * WEEK;

    assertEq(lockedBalancer.amount, additionalAmount, "Total locked amount mismatch");
    assertEq(lockedBalancer.end, expectedEndTimeBalancer, "Lock end time should be increased balancer");
    assertEq(lockedVelo.amount, lockInput.tokenAmount, "Total locked amount mismatch");
    assertEq(lockedVelo.end, expectedEndTimeVelo, "Lock end time should be increased velo");
  }

  function test_lockAdditionalAsset_RevertIfNotOwner() public fork(MODE_MAINNET) {
    modeBalancer8020IonEth.mint(user, lockInput.tokenAmount);
    uint256 additionalAmount = 500 * 10 ** 18; // 500 tokens
    address randomUser = address(0x1345);

    vm.prank(user);
    modeBalancer8020IonEth.approve(address(ve), lockInput.tokenAmount);
    vm.prank(randomUser);
    vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
    ve.lockAdditionalAsset(address(modeBalancer8020IonEth), additionalAmount, lockInput.tokenId, 26 weeks, false);
  }

  function test_lockAdditionalAsset_RevertIfZeroAmount() public fork(MODE_MAINNET) {
    modeBalancer8020IonEth.mint(user, lockInput.tokenAmount);
    uint256 additionalAmount = 0;

    vm.startPrank(user);
    modeBalancer8020IonEth.approve(address(ve), lockInput.tokenAmount);
    vm.expectRevert(abi.encodeWithSignature("ZeroAmount()"));
    ve.lockAdditionalAsset(address(modeBalancer8020IonEth), additionalAmount, lockInput.tokenId, 26 weeks, false);
    vm.stopPrank();
  }

  function test_lockAdditionalAsset_RevertIfAlreadyVoted() public fork(MODE_MAINNET) {
    modeBalancer8020IonEth.mint(user, lockInput.tokenAmount);
    uint256 additionalAmount = 500 * 10 ** 18;

    ve.voting(lockInput.tokenId, true);

    vm.startPrank(user);
    modeBalancer8020IonEth.approve(address(ve), lockInput.tokenAmount);
    vm.expectRevert(abi.encodeWithSignature("AlreadyVoted()"));
    ve.lockAdditionalAsset(address(modeBalancer8020IonEth), additionalAmount, lockInput.tokenId, 26 weeks, false);
    vm.stopPrank();
  }

  function test_lockAdditionalAsset_RevertIfDuplicateAsset() public fork(MODE_MAINNET) {
    modeVelodrome5050IonMode.mint(user, lockInput.tokenAmount);
    uint256 additionalAmount = 500 * 10 ** 18;

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), lockInput.tokenAmount);
    vm.expectRevert(abi.encodeWithSignature("DuplicateAsset()"));
    ve.lockAdditionalAsset(address(modeVelodrome5050IonMode), additionalAmount, lockInput.tokenId, 26 weeks, false);
    vm.stopPrank();
  }

  function test_lockAdditionalAsset_RevertIfMinimumNotMet() public fork(MODE_MAINNET) {
    modeBalancer8020IonEth.mint(user, lockInput.tokenAmount);
    uint256 additionalAmount = 9 * 10 ** 18;

    vm.startPrank(user);
    modeBalancer8020IonEth.approve(address(ve), lockInput.tokenAmount);
    vm.expectRevert(abi.encodeWithSignature("MinimumNotMet()"));
    ve.lockAdditionalAsset(address(modeBalancer8020IonEth), additionalAmount, lockInput.tokenId, 26 weeks, false);
    vm.stopPrank();
  }

  function test_lockAdditionalAsset_RevertIfLockTooLong() public fork(MODE_MAINNET) {
    modeBalancer8020IonEth.mint(user, lockInput.tokenAmount);
    uint256 additionalAmount = 500 * 10 ** 18;

    vm.startPrank(user);
    modeBalancer8020IonEth.approve(address(ve), lockInput.tokenAmount);
    vm.expectRevert(abi.encodeWithSignature("LockDurationTooLong()"));
    ve.lockAdditionalAsset(address(modeBalancer8020IonEth), additionalAmount, lockInput.tokenId, 150 weeks, false);
    vm.stopPrank();
  }

  function test_lockAdditionalAsset_RevertIfLockTooShort() public fork(MODE_MAINNET) {
    modeBalancer8020IonEth.mint(user, lockInput.tokenAmount);
    uint256 additionalAmount = 500 * 10 ** 18;

    vm.startPrank(user);
    modeBalancer8020IonEth.approve(address(ve), lockInput.tokenAmount);
    vm.expectRevert(abi.encodeWithSignature("LockDurationTooShort()"));
    ve.lockAdditionalAsset(address(modeBalancer8020IonEth), additionalAmount, lockInput.tokenId, 25 weeks, false);
    vm.stopPrank();
  }

  function test_lockAdditionAsset_RevertIfTokenNotWhitelisted() public fork(MODE_MAINNET) {
    MockERC20 randomToken = new MockERC20("Random Token", "RND", 18);
    randomToken.mint(user, lockInput.tokenAmount);
    uint256 additionalAmount = 500 * 10 ** 18;

    vm.startPrank(user);
    randomToken.approve(address(ve), lockInput.tokenAmount);
    vm.expectRevert(abi.encodeWithSignature("TokenNotWhitelisted()"));
    ve.lockAdditionalAsset(address(randomToken), additionalAmount, lockInput.tokenId, 26 weeks, false);
    vm.stopPrank();
  }
}

contract IncreaseUnlockTime is veIONTest {
  function test_increaseUnlockTime_UserCanIncreaseTime() public fork(MODE_MAINNET) {
    TestVars memory vars;
    vars.user = address(0x1234);

    LockInfo memory lockInput = _createLockInternal(vars.user);

    uint256 newLockTime = 104 weeks;
    vm.prank(vars.user);
    ve.increaseUnlockTime(address(modeVelodrome5050IonMode), lockInput.tokenId, newLockTime);

    IveION.LockedBalance memory actualLocked = ve.getUserLock(lockInput.tokenId, veloLpType);
    uint256 expectedEndTime = ((block.timestamp + newLockTime) / WEEK) * WEEK;
    assertEq(expectedEndTime, actualLocked.end, "Lock end time should be increased");
  }
}

contract Withdraw is veIONTest {
  function test_withdraw_UserCanWithdrawFinishedLock() public fork(MODE_MAINNET) {
    TestVars memory vars;
    vars.user = address(0x1234);

    LockInfo memory lockInput = _createLockInternal(vars.user);

    vm.warp(block.timestamp + 52 weeks + 1);

    vm.prank(vars.user);
    ve.withdraw(address(modeVelodrome5050IonMode), lockInput.tokenId);

    IveION.LockedBalance memory locked = ve.getUserLock(lockInput.tokenId, veloLpType);

    uint256 userBalanceAfterWithdraw = modeVelodrome5050IonMode.balanceOf(vars.user);

    assertEq(locked.amount, 0, "Lock amount should be zero after withdrawal");
    assertEq(locked.end, 0, "Lock end time should be zero after withdrawal");
    assertEq(userBalanceAfterWithdraw, lockInput.tokenAmount, "User should receive the locked tokens back");
  }

  function test_withdraw_UserCanWithdrawEarly() public fork(MODE_MAINNET) {
    TestVars memory vars;
    vars.user = address(0x1234);
    LockInfo memory lockInput = _createLockInternal(vars.user);

    address randomWallet = address(0x7890);
    uint256 mintAmount = 100000000000000000 ether; // Mint tokens so that penalty comes into effect
    modeVelodrome5050IonMode.mint(randomWallet, mintAmount);

    vm.warp(block.timestamp + 10 weeks);

    vm.prank(vars.user);
    ve.withdraw(address(modeVelodrome5050IonMode), lockInput.tokenId);

    IveION.LockedBalance memory actualLocked = ve.getUserLock(lockInput.tokenId, veloLpType);

    uint256 userBalanceAfterWithdraw = modeVelodrome5050IonMode.balanceOf(vars.user);
    assertEq(actualLocked.amount, 0, "Lock amount should be zero after withdrawal");
    assertEq(actualLocked.end, 0, "Lock end time should be zero after withdrawal");
    assertEq(
      userBalanceAfterWithdraw,
      (lockInput.tokenAmount * 20) / 100,
      "User should receive 20% of the locked tokens back after withdraw penalty"
    );
  }

  function test_withdraw_UserStakedUnderlying() public fork(MODE_MAINNET) {
    TestVars memory vars;

    address ionMode5050 = 0x690A74d2eC0175a69C0962B309E03021C0b5002E;
    address veloGauge = 0x8EE410cC13948e7e684ebACb36b552e2c2A125fC;

    VeloIonModeStakingStrategy veloIonModeStakingStrategy = new VeloIonModeStakingStrategy(
      address(ve),
      ionMode5050,
      veloGauge,
      address(veloStakingWalletImplementation)
    );

    ve.setStakeStrategy(veloLpType, IStakeStrategy(veloIonModeStakingStrategy));

    address[] memory whitelistedTokens = new address[](1);
    bool[] memory isWhitelistedTokens = new bool[](1);
    whitelistedTokens[0] = ionMode5050;
    isWhitelistedTokens[0] = true;

    ve.whitelistTokens(whitelistedTokens, isWhitelistedTokens);
    ve.setLpTokenType(ionMode5050, IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE);
    // Mint ModeVelodrome tokens to the user
    vars.user = address(0x5678);
    vars.amount = 5 ether;

    vm.prank(0x8034857f8A467624BaF973de28026CEB9A2fF5F1);
    IERC20(ionMode5050).transfer(vars.user, vars.amount);

    // Approve veION contract to spend user's tokens
    vm.prank(vars.user);
    IERC20(ionMode5050).approve(address(ve), vars.amount);

    // Prepare parameters for createLock
    vars.tokenAddresses = new address[](1);
    vars.tokenAddresses[0] = address(ionMode5050);

    vars.tokenAmounts = new uint256[](1);
    vars.tokenAmounts[0] = vars.amount;

    vars.durations = new uint256[](1);
    vars.durations[0] = 52 weeks;

    vars.stakeUnderlying = new bool[](1);
    vars.stakeUnderlying[0] = true;

    // Create lock
    vm.prank(vars.user);
    uint256 tokenId = ve.createLock(vars.tokenAddresses, vars.tokenAmounts, vars.durations, vars.stakeUnderlying);

    // Advance the blockchain by 1 week
    vm.warp(block.timestamp + 1 weeks);

    address stakingWalletInstance = veloIonModeStakingStrategy.userStakingWallet(vars.user);
    uint256 rewardEarned = IVeloIonModeStaking(veloGauge).earned(stakingWalletInstance);

    // Withdraw the tokens
    vm.prank(vars.user);
    ve.withdraw(address(ionMode5050), tokenId);

    uint256 stakingWalletInstanceBalance = IVeloIonModeStaking(veloGauge).balanceOf(stakingWalletInstance);
    // Check the staking wallet balance after withdrawal
    assertEq(stakingWalletInstanceBalance, 0, "Staking wallet balance should be zero after withdrawal");

    // Check the user's balance after withdrawal
    uint256 userBalance = IERC20(ionMode5050).balanceOf(vars.user);
    assertEq(
      userBalance,
      1e18,
      "User's balance should be equal to the initial amount, minus the penalty after withdrawal"
    );

    address rewardToken = IVeloIonModeStaking(veloGauge).rewardToken();
    uint256 rewardBalance = IERC20(rewardToken).balanceOf(vars.user);

    assertEq(rewardBalance, rewardEarned, "User should have claimed some reward");
  }
}

contract Merge is veIONTest {
  function test_merge_UserCanMerge() public fork(MODE_MAINNET) {
    TestVars memory vars;
    vars.user = address(0x1234);

    LockInfo memory lockInput = _createLockInternal(vars.user);
    LockInfo memory lockInput2 = _createLockInternal(vars.user);

    vm.prank(vars.user);
    ve.merge(lockInput.tokenId, lockInput2.tokenId);

    IveION.LockedBalance memory mergedLock = ve.getUserLock(lockInput2.tokenId, veloLpType);
    IveION.LockedBalance memory burnedLock = ve.getUserLock(lockInput.tokenId, veloLpType);

    assertEq(
      mergedLock.amount,
      lockInput.tokenAmount * 2,
      "Merged lock amount should be the sum of the original locks"
    );
    assertEq(burnedLock.amount, 0, "First lock amount should be zero after merge");
    assertEq(burnedLock.end, 0, "First lock end time should be zero after merge");
  }

  function test_merge_UserCanMergeMultiLPLocks() public fork(MODE_MAINNET) {
    TestVars memory vars;
    vars.user = address(0x1234);
    LockInfoMultiple memory lockInput = _createLockMultipleInternal(vars.user);
    LockInfo memory lockInput2 = _createLockInternal(vars.user);

    vm.prank(vars.user);
    ve.merge(lockInput.tokenId, lockInput2.tokenId);

    IveION.LockedBalance memory mergedLockVelo = ve.getUserLock(lockInput2.tokenId, veloLpType);
    IveION.LockedBalance memory mergedLockBalancer = ve.getUserLock(lockInput2.tokenId, balancerLpType);

    assertEq(mergedLockVelo.amount, MINT_AMT * 2, "Velo merged lock amount should be the sum of the original locks");
    assertEq(
      mergedLockBalancer.amount,
      MINT_AMT,
      "Balancer merged lock amount should be the sum of the original locks"
    );
  }
}

contract Split is veIONTest {
  function test_split_UserCanSplitAllLP() public fork(MODE_MAINNET) {
    TestVars memory vars;

    vars.user = address(0x5678);
    LockInfoMultiple memory lockInput = _createLockMultipleInternal(vars.user);

    vm.prank(ve.owner());
    ve.toggleSplit(vars.user, true);

    uint256 splitAmount = MINT_AMT;
    vm.prank(vars.user);
    (uint256 tokenId1, uint256 tokenId2) = ve.split(address(modeVelodrome5050IonMode), lockInput.tokenId, splitAmount);

    IveION.LockedBalance memory veloLocked1 = ve.getUserLock(tokenId1, veloLpType);
    IveION.LockedBalance memory balancerLocked1 = ve.getUserLock(tokenId1, balancerLpType);
    IveION.LockedBalance memory veloLocked2 = ve.getUserLock(tokenId2, veloLpType);
    IveION.LockedBalance memory balancerLocked2 = ve.getUserLock(tokenId2, balancerLpType);

    assertEq(veloLocked1.amount, 0, "First split lock amount should be half of the original");
    assertEq(balancerLocked1.amount, splitAmount, "Second split lock amount should be half of the original");
    assertEq(veloLocked2.amount, splitAmount, "Second split lock amount should be half of the original");
    assertEq(balancerLocked2.amount, 0, "Second split lock amount should be half of the original");
  }

  function test_split_UserCanSplitSomeLP() public fork(MODE_MAINNET) {
    TestVars memory vars;

    vars.user = address(0x5678);
    LockInfoMultiple memory lockInput = _createLockMultipleInternal(vars.user);

    vm.prank(ve.owner());
    ve.toggleSplit(vars.user, true);

    uint256 splitAmount = MINT_AMT / 2;
    vm.prank(vars.user);
    (uint256 tokenId1, uint256 tokenId2) = ve.split(address(modeVelodrome5050IonMode), lockInput.tokenId, splitAmount);

    IveION.LockedBalance memory veloLocked1 = ve.getUserLock(tokenId1, veloLpType);
    IveION.LockedBalance memory balancerLocked1 = ve.getUserLock(tokenId1, balancerLpType);
    IveION.LockedBalance memory veloLocked2 = ve.getUserLock(tokenId2, veloLpType);
    IveION.LockedBalance memory balancerLocked2 = ve.getUserLock(tokenId2, balancerLpType);

    assertEq(veloLocked1.amount, MINT_AMT / 2, "First split lock amount should be half of the original");
    assertEq(balancerLocked1.amount, MINT_AMT, "Second split lock amount should be half of the original");
    assertEq(veloLocked2.amount, MINT_AMT / 2, "Second split lock amount should be half of the original");
    assertEq(balancerLocked2.amount, 0, "Second split lock amount should be half of the original");
  }
}

contract ToggleSplit is veIONTest {}

contract LockPermanent is veIONTest {
  function test_lockPermanent_UserCanLockPermanent() public fork(MODE_MAINNET) {
    TestVars memory vars;

    vars.user = address(0x5678);
    LockInfo memory lockInput = _createLockInternal(vars.user);

    vm.prank(vars.user);
    ve.lockPermanent(address(modeVelodrome5050IonMode), lockInput.tokenId);

    IveION.LockedBalance memory actualLocked = ve.getUserLock(lockInput.tokenId, veloLpType);

    vars.userEpoch = ve.s_userPointEpoch(lockInput.tokenId, veloLpType);
    IveION.UserPoint memory userPoint = ve.getUserPoint(
      lockInput.tokenId,
      ve.s_lpType(lockInput.tokenAddress),
      vars.userEpoch
    );

    assertEq(actualLocked.isPermanent, true, "Lock should be permanent");
    assertEq(actualLocked.end, 0, "Lock end time should be zero for permanent lock");
    assertEq(userPoint.bias, 0, "User point bias should be zero for permanent lock");
    assertEq(userPoint.slope, 0, "User point slope should be zero for permanent lock");
    assertEq(userPoint.ts, block.timestamp, "User point timestamp should be current block timestamp");
    assertEq(userPoint.blk, block.number, "User point block number should be current block number");
    assertEq(userPoint.permanent, actualLocked.amount, "User point permanent lock should match lock amount");
  }
}

contract UnlockPermanent is veIONTest {
  function test_unlockPermanent_UserCanUnlockPermanent() public fork(MODE_MAINNET) {
    TestVars memory vars;

    vars.user = address(0x5678);
    LockInfo memory lockInput = _createLockInternal(vars.user);

    vm.startPrank(vars.user);
    ve.lockPermanent(address(modeVelodrome5050IonMode), lockInput.tokenId);
    ve.unlockPermanent(address(modeVelodrome5050IonMode), lockInput.tokenId);
    vm.stopPrank();

    uint256 endTime = ((block.timestamp + MAXTIME) / WEEK) * WEEK;
    IveION.LockedBalance memory actualLocked = ve.getUserLock(lockInput.tokenId, veloLpType);
    assertEq(actualLocked.isPermanent, false, "Lock should be permanent");
    assertEq(actualLocked.end, endTime, "Lock end time should be zero for permanent lock");
  }
}

contract Delegate is veIONTest {
  function test_delegation_UserCanDelegate() public fork(MODE_MAINNET) {
    TestVars memory vars;

    vars.user = address(0x5678);
    LockInfo memory lockInput = _createLockInternal(vars.user);

    vars.user2 = address(0x1234);
    LockInfo memory lockInput2 = _createLockInternal(vars.user2);

    vm.prank(vars.user);
    ve.lockPermanent(address(modeVelodrome5050IonMode), lockInput.tokenId);
    vm.prank(vars.user2);
    ve.lockPermanent(address(modeVelodrome5050IonMode), lockInput2.tokenId);

    vm.prank(vars.user);
    ve.delegate(lockInput.tokenId, lockInput2.tokenId, address(modeVelodrome5050IonMode), MINT_AMT);

    IveION.LockedBalance memory locked1 = ve.getUserLock(lockInput.tokenId, veloLpType);
    IveION.LockedBalance memory locked2 = ve.getUserLock(lockInput2.tokenId, veloLpType);

    uint256[] memory delegatees = ve.getDelegatees(lockInput.tokenId, veloLpType);
    uint256 amountDelegated = ve.s_delegations(lockInput.tokenId, lockInput2.tokenId, veloLpType);
    bool found = false;
    for (uint256 i = 0; i < delegatees.length; i++) {
      if (delegatees[i] == lockInput2.tokenId) {
        found = true;
        break;
      }
    }

    assertEq(locked1.amount, 0, "All voting power should have been delegated from this token");
    assertEq(locked2.delegateAmount, MINT_AMT, "All voting power should have been delegated to this token");
    assertTrue(found, "secondTokenId should be in the list of delegatees");
    assertEq(amountDelegated, MINT_AMT, "Delegated amount should be recorded");
  }
}

contract RemoveDelegatees is veIONTest {
  function test_removeDelegatees_UserCanRemoveDelegatees() public fork(MODE_MAINNET) {
    TestVars memory vars;

    vars.user = address(0x5678);
    LockInfo memory lockInput = _createLockInternal(vars.user);

    vars.user2 = address(0x1234);
    LockInfo memory lockInput2 = _createLockInternal(vars.user2);

    vm.prank(vars.user);
    ve.lockPermanent(address(modeVelodrome5050IonMode), lockInput.tokenId);
    vm.prank(vars.user2);
    ve.lockPermanent(address(modeVelodrome5050IonMode), lockInput2.tokenId);

    vm.prank(vars.user);
    ve.delegate(lockInput.tokenId, lockInput2.tokenId, address(modeVelodrome5050IonMode), MINT_AMT);

    uint256[] memory toTokenIds = new uint256[](1);
    toTokenIds[0] = lockInput2.tokenId;
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = MINT_AMT;

    vm.prank(vars.user);
    ve.removeDelegatees(lockInput.tokenId, toTokenIds, address(modeVelodrome5050IonMode), amounts);

    IveION.LockedBalance memory locked1 = ve.getUserLock(lockInput.tokenId, veloLpType);
    IveION.LockedBalance memory locked2 = ve.getUserLock(lockInput2.tokenId, veloLpType);

    uint256[] memory delegatees = ve.getDelegatees(vars.tokenId, veloLpType);
    uint256 amountDelegated = ve.s_delegations(lockInput.tokenId, lockInput2.tokenId, veloLpType);
    bool found = false;
    for (uint256 i = 0; i < delegatees.length; i++) {
      if (delegatees[i] == vars.secondTokenId) {
        found = true;
        break;
      }
    }

    assertEq(locked1.amount, MINT_AMT, "Voting power should be returned to the original token");
    assertEq(locked2.delegateAmount, 0, "Delegated voting power should be removed from the second token");
    assertFalse(found, "secondTokenId should not be in the list of delegatees after de-delegation");
    assertEq(amountDelegated, 0, "Delegated amount should be zero after de-delegation");
  }
}

contract RemoveDelegators is veIONTest {}

contract ClaimEmissions is veIONTest {}

contract TrasferVeION is veIONTest {}

contract Setters is veIONTest {}

contract ViewFunctions is veIONTest {}

contract BalanceOfNFT is veIONTest {}

contract Voting is veIONTest {}

contract Withdrawals is veIONTest {}
