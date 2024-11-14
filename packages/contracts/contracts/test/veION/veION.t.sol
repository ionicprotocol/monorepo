// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "./Utils.sol";
import "./harness/veIONHarness.sol";

contract CreateLock is veIONTest {
  function setUp() public {
    _setUp();
  }

  function test_createLock_UserCanCreateLock() public {
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

  function test_createLock_MinBoostIsApplied() public {
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

  function test_createLock_MaxBoostIsApplied() public {
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

  function test_createLock_UserCanLockMultipleLP() public {
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

  function test_createLock_RevertsIfUnequalArrayLenghts() public {
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

  function test_createLock_RevertsIfZeroAmount() public {
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

  function test_createLock_RevertsIfDurationTooShort() public {
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

  function test_createLock_RevertIfDurationTooLong() public {
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

  function test_createLock_RevertIfAmountTooSmall() public {
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

  function test_createLock_RevertIfTokenNotWhitelisted() public {
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

  function test_createLock_RevertIfDuplicateTokens() public {
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

contract LockAdditionalAsset is veIONTest {
  address user;
  uint256 tokenId;
  LockInfo lockInput;
  LockInfoMultiple lockInputMultiLP;

  function setUp() public {
    _setUp();
    user = address(0x1234);
    lockInput = _createLockInternal(user);
    lockInputMultiLP = _createLockMultipleInternal(user);
    ve.setVoter(address(this));
  }

  function test_lockAdditionalAsset_UserCanLockAdditionalLp() public {
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

  function test_lockAdditionalAsset_RevertIfNotOwner() public {
    modeBalancer8020IonEth.mint(user, lockInput.tokenAmount);
    uint256 additionalAmount = 500 * 10 ** 18; // 500 tokens
    address randomUser = address(0x1345);

    vm.prank(user);
    modeBalancer8020IonEth.approve(address(ve), lockInput.tokenAmount);
    vm.prank(randomUser);
    vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
    ve.lockAdditionalAsset(address(modeBalancer8020IonEth), additionalAmount, lockInput.tokenId, 26 weeks, false);
  }

  function test_lockAdditionalAsset_RevertIfZeroAmount() public {
    modeBalancer8020IonEth.mint(user, lockInput.tokenAmount);
    uint256 additionalAmount = 0;

    vm.startPrank(user);
    modeBalancer8020IonEth.approve(address(ve), lockInput.tokenAmount);
    vm.expectRevert(abi.encodeWithSignature("ZeroAmount()"));
    ve.lockAdditionalAsset(address(modeBalancer8020IonEth), additionalAmount, lockInput.tokenId, 26 weeks, false);
    vm.stopPrank();
  }

  function test_lockAdditionalAsset_RevertIfAlreadyVoted() public {
    modeBalancer8020IonEth.mint(user, lockInput.tokenAmount);
    uint256 additionalAmount = 500 * 10 ** 18;

    ve.voting(lockInput.tokenId, true);

    vm.startPrank(user);
    modeBalancer8020IonEth.approve(address(ve), lockInput.tokenAmount);
    vm.expectRevert(abi.encodeWithSignature("AlreadyVoted()"));
    ve.lockAdditionalAsset(address(modeBalancer8020IonEth), additionalAmount, lockInput.tokenId, 26 weeks, false);
    vm.stopPrank();
  }

  function test_lockAdditionalAsset_RevertIfDuplicateAsset() public {
    modeVelodrome5050IonMode.mint(user, lockInput.tokenAmount);
    uint256 additionalAmount = 500 * 10 ** 18;

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), lockInput.tokenAmount);
    vm.expectRevert(abi.encodeWithSignature("DuplicateAsset()"));
    ve.lockAdditionalAsset(address(modeVelodrome5050IonMode), additionalAmount, lockInput.tokenId, 26 weeks, false);
    vm.stopPrank();
  }

  function test_lockAdditionalAsset_RevertIfMinimumNotMet() public {
    modeBalancer8020IonEth.mint(user, lockInput.tokenAmount);
    uint256 additionalAmount = 9 * 10 ** 18;

    vm.startPrank(user);
    modeBalancer8020IonEth.approve(address(ve), lockInput.tokenAmount);
    vm.expectRevert(abi.encodeWithSignature("MinimumNotMet()"));
    ve.lockAdditionalAsset(address(modeBalancer8020IonEth), additionalAmount, lockInput.tokenId, 26 weeks, false);
    vm.stopPrank();
  }

  function test_lockAdditionalAsset_RevertIfLockTooLong() public {
    modeBalancer8020IonEth.mint(user, lockInput.tokenAmount);
    uint256 additionalAmount = 500 * 10 ** 18;

    vm.startPrank(user);
    modeBalancer8020IonEth.approve(address(ve), lockInput.tokenAmount);
    vm.expectRevert(abi.encodeWithSignature("LockDurationTooLong()"));
    ve.lockAdditionalAsset(address(modeBalancer8020IonEth), additionalAmount, lockInput.tokenId, 150 weeks, false);
    vm.stopPrank();
  }

  function test_lockAdditionalAsset_RevertIfLockTooShort() public {
    modeBalancer8020IonEth.mint(user, lockInput.tokenAmount);
    uint256 additionalAmount = 500 * 10 ** 18;

    vm.startPrank(user);
    modeBalancer8020IonEth.approve(address(ve), lockInput.tokenAmount);
    vm.expectRevert(abi.encodeWithSignature("LockDurationTooShort()"));
    ve.lockAdditionalAsset(address(modeBalancer8020IonEth), additionalAmount, lockInput.tokenId, 25 weeks, false);
    vm.stopPrank();
  }

  function test_lockAdditionAsset_RevertIfTokenNotWhitelisted() public {
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
  address user;
  uint256 tokenId;
  LockInfo lockInput;
  LockInfoMultiple lockInputMultiLp;

  function setUp() public {
    _setUp();
    user = address(0x1234);
    lockInput = _createLockInternal(user);
    lockInputMultiLp = _createLockMultipleInternal(user);
  }

  function test_increaseUnlockTime_UserCanIncreaseTime() public {
    uint256 newLockTime = 104 weeks;
    vm.prank(user);
    ve.increaseUnlockTime(address(modeVelodrome5050IonMode), lockInput.tokenId, newLockTime);

    IveION.LockedBalance memory actualLocked = ve.getUserLock(lockInput.tokenId, veloLpType);
    uint256 expectedEndTime = ((block.timestamp + newLockTime) / WEEK) * WEEK;
    assertEq(expectedEndTime, actualLocked.end, "Lock end time should be increased");
  }

  function test_increaseUnlockTime_RevertIfNotOwner() public {
    uint256 newLockTime = 104 weeks;
    vm.prank(address(0x2352));
    vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
    ve.increaseUnlockTime(address(modeVelodrome5050IonMode), lockInput.tokenId, newLockTime);
  }

  function test_increaseUnlockTime_RevertIfLockPermanent() public {
    uint256 newLockTime = 104 weeks;
    vm.startPrank(user);
    ve.lockPermanent(lockInput.tokenAddress, lockInput.tokenId);
    vm.expectRevert(abi.encodeWithSignature("PermanentLock()"));
    ve.increaseUnlockTime(address(modeVelodrome5050IonMode), lockInput.tokenId, newLockTime);
    vm.stopPrank();
  }

  function test_increaseUnlockTime_RevertIfLockExpires() public {
    uint256 newLockTime = 104 weeks;
    vm.warp(block.timestamp + lockInput.duration);
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("LockExpired()"));
    ve.increaseUnlockTime(address(modeVelodrome5050IonMode), lockInput.tokenId, newLockTime);
  }

  function test_increaseUnlockTime_RevertIfLockNonexistent() public {
    uint256 newLockTime = 104 weeks;
    uint256 amountToMint = 500 * 10 ** 18; // 500 tokens
    modeBalancer8020IonEth.mint(user, amountToMint);

    vm.startPrank(user);
    modeBalancer8020IonEth.approve(address(ve), amountToMint);
    vm.expectRevert(abi.encodeWithSignature("LockExpired()"));
    ve.increaseUnlockTime(address(modeBalancer8020IonEth), lockInput.tokenId, newLockTime);
    vm.stopPrank();
  }

  function test_increaseUnlockTime_RevertIfLockNotInFuture() public {
    uint256 newLockTime = 52 weeks;
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("LockDurationNotInFuture()"));
    ve.increaseUnlockTime(address(modeVelodrome5050IonMode), lockInput.tokenId, newLockTime);
  }

  function test_increaseUnlockTime_RevertIfLockTooLong() public {
    uint256 newLockTime = 120 weeks;
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("LockDurationTooLong()"));
    ve.increaseUnlockTime(address(modeVelodrome5050IonMode), lockInput.tokenId, newLockTime);
  }

  function test_increaseUnlockTime_RevertIfTokenNonexistent() public {
    uint256 newLockTime = 52 weeks;
    vm.prank(user);
    vm.expectRevert("ERC721: invalid token ID");
    ve.increaseUnlockTime(address(modeVelodrome5050IonMode), 544, newLockTime);
  }

  function test_increaseUnlockTimeI_RevertIfUserWithdrewLock() public {
    uint256 newLockTime = 52 weeks;
    vm.startPrank(user);
    ve.withdraw(lockInputMultiLp.tokenAddresses[0], lockInputMultiLp.tokenId);
    vm.expectRevert(abi.encodeWithSignature("LockExpired()"));
    ve.increaseUnlockTime(address(modeVelodrome5050IonMode), lockInputMultiLp.tokenId, newLockTime);
  }
}

contract Withdraw is veIONTest {
  address user;
  LockInfo lockInput;
  LockInfoMultiple lockInputMultiLP;

  function setUp() public {
    _setUp();
    user = address(0x1234);
    lockInput = _createLockInternal(user);
    lockInputMultiLP = _createLockMultipleInternal(user);
    ve.setVoter(address(this));
  }

  function test_withdraw_UserCanWithdrawFinishedLock() public {
    vm.warp(block.timestamp + 52 weeks + 1);

    uint256 supplyBefore = ve.s_supply(ve.s_lpType(lockInput.tokenAddress));
    uint256 cumulativeLPAmountBefore = ve.s_userCumulativeAssetValues(user, address(modeVelodrome5050IonMode));
    vm.prank(user);
    ve.withdraw(address(modeVelodrome5050IonMode), lockInput.tokenId);

    IveION.LockedBalance memory locked = ve.getUserLock(lockInput.tokenId, veloLpType);

    uint256 cumulativeLPAmountAfter = ve.s_userCumulativeAssetValues(user, address(modeVelodrome5050IonMode));
    uint256 userBalanceAfterWithdraw = modeVelodrome5050IonMode.balanceOf(user);
    uint256 userEpoch = ve.s_userPointEpoch(lockInput.tokenId, ve.s_lpType(lockInput.tokenAddress));
    IveION.UserPoint memory userPoint = ve.getUserPoint(
      lockInput.tokenId,
      ve.s_lpType(lockInput.tokenAddress),
      userEpoch
    );
    uint256[] memory ownerTokenIds = ve.getOwnedTokenIds(user);
    address[] memory assetsLocked = ve.getAssetsLocked(lockInput.tokenId);

    assertEq(locked.amount, 0, "Lock amount should be zero after withdrawal");
    assertEq(locked.end, 0, "Lock end time should be zero after withdrawal");
    assertEq(userBalanceAfterWithdraw, lockInput.tokenAmount, "User should receive the locked tokens back");
    assertEq(ve.s_supply(ve.s_lpType(lockInput.tokenAddress)), supplyBefore - lockInput.tokenAmount, "Supply mismatch");
    assertEq(userEpoch, 2, "User epoch mismatch");
    assertEq(userPoint.ts, block.timestamp, "User point timestamp mismatch");
    assertEq(userPoint.blk, block.number, "User point block number mismatch");
    assertEq(userPoint.bias, 0, "User point bias mismatch");
    assertEq(userPoint.slope, 0, "User point slope mismatch");
    assertEq(userPoint.permanent, 0, "User point permanent mismatch");
    assertEq(ve.s_tokenId(), 2, "Token ID mismatch");
    assertEq(ownerTokenIds.length, 1, "Owner should have one token ID");
    assertEq(assetsLocked.length, 0, "Assets locked length mismatch");
    assertEq(
      cumulativeLPAmountBefore - lockInput.tokenAmount,
      cumulativeLPAmountAfter,
      "Cumulative amount should have decreased "
    );
  }

  function test_withdraw_UserCanWithdrawEarly() public {
    address randomWallet = address(0x7890);
    uint256 mintAmount = 100000000000000000 ether; // Mint tokens so that penalty comes into effect
    modeVelodrome5050IonMode.mint(randomWallet, mintAmount);

    vm.warp(block.timestamp + 10 weeks);

    vm.prank(user);
    ve.withdraw(address(modeVelodrome5050IonMode), lockInput.tokenId);

    IveION.LockedBalance memory actualLocked = ve.getUserLock(lockInput.tokenId, veloLpType);

    uint256 userBalanceAfterWithdraw = modeVelodrome5050IonMode.balanceOf(user);
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
    uint256 tokenId = ve.createLock(vars.tokenAddresses, vars.tokenAmounts, vars.durations, vars.stakeUnderlying);

    // Advance the blockchain by 1 week
    vm.warp(block.timestamp + 1 weeks);

    address stakingWalletInstance = veloIonModeStakingStrategy.userStakingWallet(vars.user);
    uint256 rewardEarned = IVeloIonModeStaking(veloGauge).earned(stakingWalletInstance);

    // Withdraw the tokens
    vm.prank(vars.user);
    ve.withdraw(address(ionMode5050), tokenId);

    uint256 stakingWalletInstanceBalance = IVeloIonModeStaking(veloGauge).balanceOf(stakingWalletInstance);
    uint256 userBalance = IERC20(ionMode5050).balanceOf(vars.user);
    address rewardToken = IVeloIonModeStaking(veloGauge).rewardToken();
    uint256 rewardBalance = IERC20(rewardToken).balanceOf(vars.user);

    assertEq(stakingWalletInstanceBalance, 0, "Staking wallet balance should be zero after withdrawal");
    assertEq(
      userBalance,
      2e18,
      "User's balance should be equal to the initial amount, minus the penalty after withdrawal"
    );
    assertEq(rewardBalance, rewardEarned, "User should have claimed some reward");
  }

  function test_withdraw_RevertIfNotOwner() public {
    vm.prank(address(0x3523));
    vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
    ve.withdraw(address(modeVelodrome5050IonMode), lockInput.tokenId);
  }

  function test_withdraw_RevertIfVoting() public {
    ve.voting(lockInput.tokenId, true);
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("AlreadyVoted()"));
    ve.withdraw(address(modeVelodrome5050IonMode), lockInput.tokenId);
  }

  function test_withdraw_RevertIfPermanentLock() public {
    vm.startPrank(user);
    ve.lockPermanent(lockInput.tokenAddress, lockInput.tokenId);
    vm.expectRevert(abi.encodeWithSignature("PermanentLock()"));
    ve.withdraw(address(modeVelodrome5050IonMode), lockInput.tokenId);
    vm.stopPrank();
  }

  function test_withdraw_RevertIfTokenNotWhitelisted() public {
    MockERC20 randomMockToken = new MockERC20("Random_Token", "RND", 18);
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("TokenNotWhitelisted()"));
    ve.withdraw(address(randomMockToken), lockInput.tokenId);
  }

  function test_withdraw_TokenShouldStillExistIfRemainingLP() public {
    vm.prank(user);
    ve.withdraw(address(modeVelodrome5050IonMode), lockInputMultiLP.tokenId);
    address owner = ve.ownerOf(lockInputMultiLP.tokenId);
    assertEq(owner, user, "User should still own their token");
  }

  function test_withdraw_TokenShouldBeBurntInAllLPRemoved() public {
    vm.startPrank(user);
    ve.withdraw(address(modeVelodrome5050IonMode), lockInputMultiLP.tokenId);
    ve.withdraw(address(modeBalancer8020IonEth), lockInputMultiLP.tokenId);
    vm.stopPrank();

    vm.expectRevert("ERC721: invalid token ID");
    ve.ownerOf(lockInputMultiLP.tokenId);

    uint256[] memory ownerTokenIds = ve.getOwnedTokenIds(user);
    bool tokenIdFound = false;
    for (uint256 i = 0; i < ownerTokenIds.length; i++) {
      if (ownerTokenIds[i] == lockInputMultiLP.tokenId) {
        tokenIdFound = true;
        break;
      }
    }
    assertFalse(tokenIdFound, "Token ID should be removed from user's owned tokens");
  }

  function test_withdraw_WithdrawAssetNotOwnedButWhitelisted() public {
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("NoLockFound()"));
    ve.withdraw(address(modeBalancer8020IonEth), lockInput.tokenId);
  }
}

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
    ve.setVoter(address(this));
  }

  function test_merge_UserCanMerge() public {
    vm.prank(user);
    ve.merge(lockInput_1.tokenId, lockInput_2.tokenId);

    IveION.LockedBalance memory mergedLock = ve.getUserLock(lockInput_2.tokenId, veloLpType);
    IveION.LockedBalance memory burnedLock = ve.getUserLock(lockInput_1.tokenId, veloLpType);

    assertEq(
      mergedLock.amount,
      lockInput_2.tokenAmount * 2,
      "Merged lock amount should be the sum of the original locks"
    );
    assertEq(burnedLock.amount, 0, "First lock amount should be zero after merge");
    assertEq(burnedLock.end, 0, "First lock end time should be zero after merge");

    vm.expectRevert("ERC721: invalid token ID");
    ve.ownerOf(lockInput_1.tokenId);
  }

  function test_merge_UserCanMergeMultiLockIntoSingleLock() public {
    vm.prank(user);
    ve.merge(lockInputMultiLP.tokenId, lockInput_2.tokenId);

    IveION.LockedBalance memory mergedLockVelo = ve.getUserLock(lockInput_2.tokenId, veloLpType);
    IveION.LockedBalance memory mergedLockBalancer = ve.getUserLock(lockInput_2.tokenId, balancerLpType);

    assertEq(mergedLockVelo.amount, MINT_AMT * 2, "Velo merged lock amount should be the sum of the original locks");
    assertEq(
      mergedLockBalancer.amount,
      MINT_AMT,
      "Balancer merged lock amount should be the sum of the original locks"
    );
    address[] memory assetsLocked = ve.getAssetsLocked(lockInput_2.tokenId);
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
    ve.merge(lockInput_1.tokenId, lockInputMultiLP.tokenId);

    IveION.LockedBalance memory mergedLockVelo = ve.getUserLock(lockInputMultiLP.tokenId, veloLpType);
    IveION.LockedBalance memory mergedLockBalancer = ve.getUserLock(lockInputMultiLP.tokenId, balancerLpType);

    assertEq(mergedLockVelo.amount, MINT_AMT * 2, "Velo merged lock amount should be the sum of the original locks");
    assertEq(
      mergedLockBalancer.amount,
      MINT_AMT,
      "Balancer merged lock amount should be the sum of the original locks"
    );
    address[] memory assetsLocked = ve.getAssetsLocked(lockInputMultiLP.tokenId);
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
    ve.merge(lockInput_1.tokenId, strangerLockInput.tokenId);
  }

  function test_merge_RevertIfNotOwnerOfToToken() public {
    address randomUser = address(0x3524);
    LockInfo memory strangerLockInput = _createLockInternal(randomUser);

    vm.prank(randomUser);
    vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
    ve.merge(strangerLockInput.tokenId, lockInput_1.tokenId);
  }

  function test_merge_RevertIfVoting() public {
    ve.voting(lockInput_1.tokenId, true);
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("AlreadyVoted()"));
    ve.merge(lockInput_1.tokenId, lockInput_2.tokenId);
  }

  function test_merge_RevertIfSameToken() public {
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("SameNFT()"));
    ve.merge(lockInput_1.tokenId, lockInput_1.tokenId);
  }

  function test_merge_RevertIfEitherTokenDoesNotExist() public {
    uint256 nonExistentTokenId = 97959;

    vm.prank(user);
    vm.expectRevert("ERC721: invalid token ID");
    ve.merge(nonExistentTokenId, lockInput_1.tokenId);

    vm.prank(user);
    vm.expectRevert("ERC721: invalid token ID");
    ve.merge(lockInput_1.tokenId, nonExistentTokenId);
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
    uint256 tokenId = ve.createLock(tokenAddresses, tokenAmounts, durations, new bool[](1));
    vm.stopPrank();

    vm.warp(block.timestamp + 54 weeks);

    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("LockExpired()"));
    ve.merge(tokenId, lockInput_1.tokenId);

    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("LockExpired()"));
    ve.merge(lockInput_1.tokenId, tokenId);
  }

  function test_merge_RevertIfFromPermanentOrToPermanent() public {
    vm.prank(user);
    ve.lockPermanent(lockInput_1.tokenAddress, lockInput_1.tokenId);

    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("PermanentLock()"));
    ve.merge(lockInput_1.tokenId, lockInput_2.tokenId);

    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("PermanentLock()"));
    ve.merge(lockInput_2.tokenId, lockInput_1.tokenId);
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

    IveION.LockedBalance memory locked1 = ve.getUserLock(lockInput_1.tokenId, veloLpType);
    uint256 expectedStart = locked1.start;

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), amount);
    uint256 tokenId = ve.createLock(tokenAddresses, tokenAmounts, durations, new bool[](1));

    IveION.LockedBalance memory locked2 = ve.getUserLock(tokenId, veloLpType);
    uint256 expectedEnd = locked2.end;

    ve.merge(lockInput_1.tokenId, tokenId);
    vm.stopPrank();

    IveION.LockedBalance memory mergedLock = ve.getUserLock(tokenId, veloLpType);

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

    IveION.LockedBalance memory locked1 = ve.getUserLock(lockInput_1.tokenId, veloLpType);
    uint256 expectedStart = locked1.start;
    uint256 expectedEnd = locked1.end;
    uint256 boost = locked1.boost;

    emit log_named_uint("locked1 start time", locked1.start);
    emit log_named_uint("locked1 end time", locked1.end);

    vm.startPrank(user);
    modeBalancer8020IonEth.approve(address(ve), amount);
    uint256 secondTokenId = ve.createLock(tokenAddresses, tokenAmounts, durations, new bool[](1));
    IveION.LockedBalance memory locked2 = ve.getUserLock(secondTokenId, veloLpType);
    emit log_named_uint("locked2 start time", locked2.start);
    emit log_named_uint("locked2 end time", locked2.end);
    ve.merge(lockInput_1.tokenId, secondTokenId);
    vm.stopPrank();

    IveION.LockedBalance memory mergedLock = ve.getUserLock(secondTokenId, veloLpType);

    emit log_named_uint("mergedLock start time", mergedLock.start);
    emit log_named_uint("mergedLock end time", mergedLock.end);
    assertEq(mergedLock.start, expectedStart, "Merged lock should have the earlier start time");
    assertEq(mergedLock.end, expectedEnd, "Merged lock should have the later end time");
    assertEq(mergedLock.boost, boost, "Should maintain original boost");
  }
}

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

contract LockPermanent is veIONTest {
  address user;
  LockInfo lockInput;
  LockInfoMultiple lockInputMultiLP;
  veIONHarness harness;

  function setUp() public {
    _setUp();
    user = address(0x1234);
    lockInputMultiLP = _createLockMultipleInternal(user);
    lockInput = _createLockInternal(user);
    ve.setVoter(address(this));

    harness = new veIONHarness();
  }

  function test_lockPermanent_UserCanLockPermanent() public {
    vm.prank(user);
    ve.lockPermanent(address(modeVelodrome5050IonMode), lockInput.tokenId);

    IveION.LockedBalance memory lock = ve.getUserLock(lockInput.tokenId, veloLpType);

    uint256 userEpoch = ve.s_userPointEpoch(lockInput.tokenId, veloLpType);
    IveION.UserPoint memory userPoint = ve.getUserPoint(
      lockInput.tokenId,
      ve.s_lpType(lockInput.tokenAddress),
      userEpoch
    );
    assertEq(
      lock.tokenAddress,
      address(modeVelodrome5050IonMode),
      "Lock token address should match the expected address"
    );
    assertEq(lock.amount, lockInput.tokenAmount, "Lock amount should match the initial lock amount");
    assertEq(lock.boost, harness.exposed_calculateBoost(MAXTIME), "Lock boost should be calculated based on MAXTIME");
    assertEq(lock.delegateAmount, 0, "Lock delegate amount should be zero for a new permanent lock");

    assertEq(lock.isPermanent, true, "Lock should be permanent");
    assertEq(lock.end, 0, "Lock end time should be zero for permanent lock");
    assertEq(userPoint.bias, 0, "User point bias should be zero for permanent lock");
    assertEq(userPoint.slope, 0, "User point slope should be zero for permanent lock");
    assertEq(userPoint.ts, block.timestamp, "User point timestamp should be current block timestamp");
    assertEq(userPoint.blk, block.number, "User point block number should be current block number");
    assertEq(userPoint.permanent, lock.amount, "User point permanent lock should match lock amount");
  }

  function test_lockPermanent_RevertIfNotOwner() public {
    vm.prank(address(0x2352));
    vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
    ve.lockPermanent(address(modeVelodrome5050IonMode), lockInput.tokenId);
  }

  function test_lockPermanent_RevertIfPermanentLock() public {
    vm.startPrank(user);
    ve.lockPermanent(address(modeVelodrome5050IonMode), lockInput.tokenId);
    vm.expectRevert(abi.encodeWithSignature("PermanentLock()"));
    ve.lockPermanent(address(modeVelodrome5050IonMode), lockInput.tokenId);
    vm.stopPrank();
  }

  function test_lockPermanent_RevertIfLockExpired() public {
    vm.warp(block.timestamp + lockInput.duration);
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("LockExpired()"));
    ve.lockPermanent(address(modeVelodrome5050IonMode), lockInput.tokenId);
  }

  function test_lockPermanent_RevertIfNoLockFound() public {
    vm.prank(user);
    vm.expectRevert("ERC721: invalid token ID");
    ve.lockPermanent(address(modeVelodrome5050IonMode), 933);
  }
}

contract UnlockPermanent is veIONTest {
  address user;
  LockInfo lockInput;
  LockInfoMultiple lockInputMultiLP;
  veIONHarness harness;

  function setUp() public {
    _setUp();
    user = address(0x1234);
    lockInputMultiLP = _createLockMultipleInternal(user);
    lockInput = _createLockInternal(user);
    ve.setVoter(address(this));

    harness = new veIONHarness();
    vm.prank(user);
    ve.lockPermanent(address(modeVelodrome5050IonMode), lockInput.tokenId);
  }

  function test_unlockPermanent_UserCanUnlockPermanent() public {
    vm.prank(user);
    ve.unlockPermanent(address(modeVelodrome5050IonMode), lockInput.tokenId);

    uint256 endTime = ((block.timestamp + MAXTIME) / WEEK) * WEEK;
    IveION.LockedBalance memory locked = ve.getUserLock(lockInput.tokenId, veloLpType);
    assertEq(locked.tokenAddress, lockInput.tokenAddress);
    assertEq(locked.amount, lockInput.tokenAmount, "Amount should be reset to the original lock input value");
    assertEq(locked.delegateAmount, 0, "Delegate amount should be zero after unlocking permanent lock");
    assertEq(locked.start, block.timestamp, "Should get back the original start time");
    assertEq(locked.end, endTime, "Lock end time should be zero for permanent lock");
    assertEq(locked.isPermanent, false, "Lock should be permanent");
    assertEq(
      locked.boost,
      harness.exposed_calculateBoost(MAXTIME),
      "Boost should be zero after unlocking permanent lock"
    );
  }

  function test_unlockPermanent_RevertIfNotOwner() public {
    vm.prank(address(0x0915));
    vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
    ve.unlockPermanent(address(modeVelodrome5050IonMode), lockInput.tokenId);
  }

  function test_unlockPermanent_RevertIfNotPermanentLock() public {
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("NotPermanentLock()"));
    ve.unlockPermanent(address(modeVelodrome5050IonMode), lockInputMultiLP.tokenId);
  }

  function test_unlockPermanent_RevertIfHasDelegatees() public {
    vm.startPrank(user);
    ve.lockPermanent(address(modeVelodrome5050IonMode), lockInputMultiLP.tokenId);
    ve.delegate(lockInput.tokenId, lockInputMultiLP.tokenId, address(modeVelodrome5050IonMode), MINT_AMT / 2);
    vm.expectRevert(abi.encodeWithSignature("TokenHasDelegatees()"));
    ve.unlockPermanent(address(modeVelodrome5050IonMode), lockInput.tokenId);
    vm.stopPrank();
  }

  function test_unlockPermanent_RevertIfHasDelegators() public {
    vm.startPrank(user);
    ve.lockPermanent(address(modeVelodrome5050IonMode), lockInputMultiLP.tokenId);
    ve.delegate(lockInputMultiLP.tokenId, lockInput.tokenId, address(modeVelodrome5050IonMode), MINT_AMT / 2);
    vm.expectRevert(abi.encodeWithSignature("TokenHasDelegators()"));
    ve.unlockPermanent(address(modeVelodrome5050IonMode), lockInput.tokenId);
    vm.stopPrank();
  }
}

contract Delegate is veIONTest {
  address user;
  LockInfo lockInput;
  LockInfoMultiple lockInputMultiLP;
  veIONHarness harness;
  uint256 tokenId1;
  uint256 tokenId2;

  function setUp() public {
    _setUp();
    user = address(0x1234);
    lockInputMultiLP = _createLockMultipleInternal(user);
    lockInput = _createLockInternal(user);
    ve.setVoter(address(this));

    harness = new veIONHarness();
    vm.startPrank(user);
    ve.lockPermanent(address(modeVelodrome5050IonMode), lockInput.tokenId);
    ve.lockPermanent(address(modeVelodrome5050IonMode), lockInputMultiLP.tokenId);
    vm.stopPrank();

    (tokenId1, tokenId2) = (lockInput.tokenId, lockInputMultiLP.tokenId);
  }

  function test_delegation_UserCanDelegate() public {
    vm.prank(user);
    ve.delegate(tokenId1, tokenId2, address(modeVelodrome5050IonMode), MINT_AMT);

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

    uint256 userEpoch2 = ve.s_userPointEpoch(tokenId2, ve.s_lpType(address(modeVelodrome5050IonMode)));
    IveION.UserPoint memory userPoint2 = ve.getUserPoint(
      tokenId2,
      ve.s_lpType(address(modeVelodrome5050IonMode)),
      userEpoch2
    );

    uint256 userEpoch1 = ve.s_userPointEpoch(tokenId1, ve.s_lpType(address(modeVelodrome5050IonMode)));
    IveION.UserPoint memory userPoint1 = ve.getUserPoint(
      tokenId1,
      ve.s_lpType(address(modeVelodrome5050IonMode)),
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
    ve.delegate(tokenId1, tokenId2, address(modeVelodrome5050IonMode), smallDelegation);
    ve.delegate(tokenId1, tokenId2, address(modeVelodrome5050IonMode), smallDelegation);
    ve.delegate(tokenId1, tokenId2, address(modeVelodrome5050IonMode), smallDelegation);
    ve.delegate(tokenId1, tokenId2, address(modeVelodrome5050IonMode), smallDelegation);
    ve.delegate(tokenId1, tokenId2, address(modeVelodrome5050IonMode), smallDelegation);
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
    ve.delegate(tokenId1, tokenId2, address(modeVelodrome5050IonMode), MINT_AMT);
  }

  function test_delegation_RevertIfAmountTooBig() public {
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("AmountTooBig()"));
    ve.delegate(tokenId1, tokenId2, address(modeVelodrome5050IonMode), MINT_AMT * 2);
  }

  function test_delegation_RevertIfNotPermanentLockFrom() public {
    vm.startPrank(user);
    ve.unlockPermanent(address(modeVelodrome5050IonMode), tokenId1);
    vm.expectRevert(abi.encodeWithSignature("NotPermanentLock()"));
    ve.delegate(tokenId1, tokenId2, address(modeVelodrome5050IonMode), MINT_AMT);
    vm.stopPrank();
  }

  function test_delegation_RevertIfNotPermanentLockTo() public {
    vm.startPrank(user);
    ve.unlockPermanent(address(modeVelodrome5050IonMode), tokenId2);
    vm.expectRevert(abi.encodeWithSignature("NotPermanentLock()"));
    ve.delegate(tokenId1, tokenId2, address(modeVelodrome5050IonMode), MINT_AMT);
    vm.stopPrank();
  }
}

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

contract ClaimEmissions is veIONTest {
  address user;

  function afterForkSetUp() internal override {
    super.afterForkSetUp();
    user = address(0x8325);
    _createLockInternalRealLP(user);
    stakingWalletInstance = veloIonModeStakingStrategy.userStakingWallet(user);
  }

  function setUp() public {
    _setUp();
    emit log("setUp function override is running");
  }

  function test_claimEmissions_UserCanClaimEmissionsFromUnderlyingStake() public fork(MODE_MAINNET) {
    vm.warp(block.timestamp + 1 weeks);
    uint256 reward = IVeloIonModeStaking(veloGauge).earned(stakingWalletInstance);

    vm.prank(user);
    ve.claimEmissions(address(ionMode5050LP));

    assertTrue(reward > 0, "Reward should be greater than zero after 1 week");
  }

  function test_claimEmissions_NoEmissionsToClaim() public fork(MODE_MAINNET) {}
}

contract TrasferVeION is veIONTest {}

contract ToggleSplit is veIONTest {}

contract Setters is veIONTest {}

contract ViewFunctions is veIONTest {}

contract BalanceOfNFT is veIONTest {}

contract Voting is veIONTest {}

contract Withdrawals is veIONTest {}
