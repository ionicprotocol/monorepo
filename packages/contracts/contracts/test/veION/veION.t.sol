// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "./Utils.sol";

contract CreateLock is veIONTest {
  function test_createLock_UsersCanCreateLocks() public fork(MODE_MAINNET) {
    TestVars memory vars;
    vars.user = address(0x1234);

    (
      vars.tokenId,
      vars.lockedBalance_tokenAddress_test,
      vars.lockedBalance_amount_test,
      vars.lockedBalance_duration_test
    ) = _createLockInternal(vars.user);

    (
      vars.lockedBalance_tokenAddress,
      vars.lockedBalance_amount,
      vars.delegated_lockedBalance_amount,
      vars.lockedBalance_start,
      vars.lockedBalance_end,
      vars.lockedBalance_isPermanent,
      vars.lockedBalance_boost
    ) = ve.s_locked(vars.tokenId, ve.s_lpType(vars.lockedBalance_tokenAddress_test));

    vars.lockedBalance_end_test = ((block.timestamp + vars.lockedBalance_duration_test) / WEEK) * WEEK; // Update end time

    // Assert the locked balance state
    assertEq(vars.lockedBalance_tokenAddress, vars.lockedBalance_tokenAddress_test, "Token address mismatch");
    assertEq(vars.lockedBalance_amount, vars.lockedBalance_amount_test, "Token amount mismatch");
    assertEq(vars.lockedBalance_end, vars.lockedBalance_end_test, "Unlock time mismatch");
    assertEq(vars.lockedBalance_isPermanent, false, "Lock should not be permanent");

    // Assert the supply state
    vars.expectedSupply = vars.amount;
    assertEq(
      ve.s_supply(ve.s_lpType(vars.lockedBalance_tokenAddress_test)),
      vars.lockedBalance_amount_test,
      "Supply mismatch"
    );

    // Assert the user point history state
    vars.userEpoch = ve.s_userPointEpoch(vars.tokenId, ve.s_lpType(vars.lockedBalance_tokenAddress_test));
    assertEq(vars.userEpoch, 1, "User epoch mismatch");

    // Check the user point history
    (
      vars.userPoint_bias,
      vars.userPoint_slope,
      vars.userPoint_ts,
      vars.userPoint_blk,
      vars.userPoint_permanent,
      vars.userPoint_permanentDelegate
    ) = ve.s_userPointHistory(vars.tokenId, ve.s_lpType(vars.lockedBalance_tokenAddress_test), vars.userEpoch);
    assertEq(vars.userPoint_ts, block.timestamp, "User point timestamp mismatch");
    assertEq(vars.userPoint_blk, block.number, "User point block number mismatch");
    assertGt(vars.userPoint_bias, 0, "User point bias mismatch");
    assertGt(vars.userPoint_slope, 0, "User point slope mismatch");
    assertEq(vars.userPoint_permanent, 0, "User point permanent mismatch");

    // Assert the token ID state
    assertEq(ve.s_tokenId(), vars.tokenId, "Token ID mismatch");

    // Assert the owner to token IDs mapping
    vars.ownerTokenIds = ve.getOwnedTokenIds(vars.user);
    assertEq(vars.ownerTokenIds.length, 1, "Owner should have one token ID");
    assertEq(vars.ownerTokenIds[0], vars.tokenId, "Owner token ID mismatch");

    // Assert the assets locked mapping
    vars.assetsLocked = ve.getAssetsLocked(vars.tokenId);
    assertEq(vars.assetsLocked.length, 1, "Assets locked length mismatch");
    assertEq(vars.assetsLocked[0], vars.lockedBalance_tokenAddress_test, "Assets locked address mismatch");
  }

  function test_createLock_UserCanLockMultipleLP() public fork(MODE_MAINNET) {
    TestVars memory vars;

    // Create a user
    vars.user = address(0x1234);

    // Mint tokens to the user
    vars.amount = 1000 * 10 ** 18; // 1000 tokens
    modeVelodrome5050IonMode.mint(vars.user, vars.amount);
    modeBalancer8020IonEth.mint(vars.user, vars.amount);

    // Approve veION contract to spend user's tokens
    vm.startPrank(vars.user);
    modeVelodrome5050IonMode.approve(address(ve), vars.amount);
    modeBalancer8020IonEth.approve(address(ve), vars.amount);
    vm.stopPrank();

    // Prepare parameters for createLock
    vars.tokenAddresses = new address[](2);
    vars.tokenAddresses[0] = address(modeVelodrome5050IonMode);
    vars.tokenAddresses[1] = address(modeBalancer8020IonEth);

    vars.tokenAmounts = new uint256[](2);
    vars.tokenAmounts[0] = vars.amount;
    vars.tokenAmounts[1] = vars.amount;

    vars.durations = new uint256[](2);
    vars.durations[0] = 52 weeks;
    vars.durations[1] = 52 weeks;

    // Create lock and check the lock

    vm.startPrank(vars.user);
    vars.tokenId = ve.createLock(vars.tokenAddresses, vars.tokenAmounts, vars.durations, new bool[](2));
    vm.stopPrank();

    // Assert the locked balance state for each token
    for (uint256 i = 0; i < vars.tokenAddresses.length; i++) {
      (address lb_tokenAddress, uint256 lb_amount, , , uint256 lb_end, , ) = ve.s_locked(
        vars.tokenId,
        ve.s_lpType(vars.tokenAddresses[i])
      );
      uint256 unlockTime = ((block.timestamp + vars.durations[i]) / WEEK) * WEEK;

      assertEq(lb_tokenAddress, vars.tokenAddresses[i], "Token address mismatch");
      assertEq(lb_amount, vars.tokenAmounts[i], "Token amount mismatch");
      assertEq(lb_end, unlockTime, "Unlock time mismatch");
    }

    // Assert the supply state
    vars.expectedSupply = vars.amount;
    assertEq(ve.s_supply(ve.s_lpType(vars.tokenAddresses[0])), vars.expectedSupply, "Supply mismatch");
    assertEq(ve.s_supply(ve.s_lpType(vars.tokenAddresses[1])), vars.expectedSupply, "Supply mismatch");

    // Assert the user point history state
    vars.userEpoch = ve.s_userPointEpoch(vars.tokenId, ve.s_lpType(vars.tokenAddresses[0]));
    assertEq(vars.userEpoch, 1, "User epoch mismatch");

    // Assert the token ID state
    assertEq(ve.s_tokenId(), vars.tokenId, "Token ID mismatch");

    // Assert the owner to token IDs mapping
    vars.ownerTokenIds = ve.getOwnedTokenIds(vars.user);
    assertEq(vars.ownerTokenIds.length, 1, "Owner should have one token ID");
    assertEq(vars.ownerTokenIds[0], vars.tokenId, "Owner token ID mismatch");

    // Assert the assets locked mapping
    vars.assetsLocked = ve.getAssetsLocked(vars.tokenId);
    assertEq(vars.assetsLocked.length, vars.tokenAddresses.length, "Assets locked length mismatch");
    for (uint256 i = 0; i < vars.assetsLocked.length; i++) {
      assertEq(vars.assetsLocked[i], vars.tokenAddresses[i], "Assets locked address mismatch");
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
    ve.createLock(vars.tokenAddresses, vars.tokenAmounts, vars.durations, vars.stakeUnderlying);

    address stakingWalletInstance = veloIonModeStakingStrategy.userStakingWallet(vars.user);
    uint256 stakingWalletInstanceBalance = IVeloIonModeStaking(veloGauge).balanceOf(stakingWalletInstance);

    // Advance the blockchain by 1 week
    vm.warp(block.timestamp + 1 weeks);
    uint256 reward = IVeloIonModeStaking(veloGauge).earned(stakingWalletInstance);

    emit log_named_address("Staking Wallet Instance", stakingWalletInstance);
    emit log_named_uint("Staking Wallet Instance Balance", stakingWalletInstanceBalance);
    emit log_named_uint("Reward", reward);

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
    ve.createLock(vars.tokenAddresses, vars.tokenAmounts, vars.durations, vars.stakeUnderlying);

    vm.warp(block.timestamp + 1 weeks);

    address stakingWalletInstance = veloIonModeStakingStrategy.userStakingWallet(vars.user);
    uint256 stakingWalletInstanceBalance = IVeloIonModeStaking(veloGauge).balanceOf(stakingWalletInstance);
    uint256 reward = IVeloIonModeStaking(veloGauge).earned(stakingWalletInstance);

    emit log_named_address("Staking Wallet Instance", stakingWalletInstance);
    emit log_named_uint("Staking Wallet Instance Balance", stakingWalletInstanceBalance);
    emit log_named_uint("Earned ", reward);

    vm.prank(vars.user);
    ve.claimEmissions(vars.tokenAddresses[0]);

    stakingWalletInstanceBalance = IVeloIonModeStaking(veloGauge).balanceOf(stakingWalletInstance);
    reward = IVeloIonModeStaking(veloGauge).earned(stakingWalletInstance);

    emit log_named_uint("Staking Wallet Instance Balance After Claim", stakingWalletInstanceBalance);
    emit log_named_uint("Earned After Claim", reward);

    uint256 userRewardBalance = IERC20(IVeloIonModeStaking(veloGauge).rewardToken()).balanceOf(vars.user);
    emit log_named_uint("User Reward Balance", userRewardBalance);

    assertEq(
      stakingWalletInstanceBalance,
      vars.amount,
      "Staking Wallet Instance Balance After Claim should be the same"
    );
    assertEq(reward, 0, "Earned After Claim should be 0");
    assertGt(userRewardBalance, reward, "User Reward Balance should be the earned amount");
  }
}

contract ClaimEmissions is veIONTest {}

contract IncreaseAmount is veIONTest {
  function testIncreaseLockAmount() public fork(MODE_MAINNET) {
    TestVars memory vars;
    vars.user = address(0x1234);
    vars.amount = 1000 * 10 ** 18; // 1000 tokens

    // Create lock and check the lock
    (
      vars.tokenId,
      vars.lockedBalance_tokenAddress_test,
      vars.lockedBalance_amount_test,
      vars.lockedBalance_duration_test
    ) = _createLockInternal(vars.user);

    (
      vars.lockedBalance_tokenAddress,
      vars.lockedBalance_amount,
      vars.delegated_lockedBalance_amount,
      vars.lockedBalance_start,
      vars.lockedBalance_end,
      vars.lockedBalance_isPermanent,
      vars.lockedBalance_boost
    ) = ve.s_locked(vars.tokenId, ve.s_lpType(vars.lockedBalance_tokenAddress_test));

    IveION.LpTokenType lpType = IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE;

    // Mint additional tokens to the user for increasing the lock amount
    uint256 additionalAmount = 500 * 10 ** 18; // 500 tokens
    modeVelodrome5050IonMode.mint(vars.user, additionalAmount);

    // Approve veION contract to spend user's additional tokens
    vm.prank(vars.user);
    modeVelodrome5050IonMode.approve(address(ve), additionalAmount);

    // Increase the lock amount
    vm.prank(vars.user);
    ve.increaseAmount(address(modeVelodrome5050IonMode), vars.tokenId, additionalAmount, false);

    // Verify the lock amount has increased
    IveION.LockedBalance memory locked = ve.getUserLock(vars.tokenId, lpType);
    assertEq(uint256(int256(locked.amount)), vars.amount + additionalAmount, "Lock amount should be increased");

    vars.lockedBalance_end_test = ((block.timestamp + vars.lockedBalance_duration_test) / WEEK) * WEEK; // Update end time

    // Assert the locked balance state
    assertEq(vars.lockedBalance_tokenAddress, vars.lockedBalance_tokenAddress_test, "Token address mismatch");
    assertEq(vars.lockedBalance_end, vars.lockedBalance_end_test, "Unlock time mismatch");
    assertEq(vars.lockedBalance_isPermanent, false, "Lock should not be permanent");

    // Assert the supply state
    vars.expectedSupply = vars.amount;
    assertEq(
      ve.s_supply(ve.s_lpType(vars.lockedBalance_tokenAddress_test)),
      vars.expectedSupply + additionalAmount,
      "Supply mismatch"
    );

    // Assert the user point history state
    vars.userEpoch = ve.s_userPointEpoch(vars.tokenId, ve.s_lpType(vars.lockedBalance_tokenAddress_test));
    assertEq(vars.userEpoch, 1, "User epoch mismatch");

    // Assert the token ID state
    assertEq(ve.s_tokenId(), vars.tokenId, "Token ID mismatch");

    // Assert the owner to token IDs mapping
    vars.ownerTokenIds = ve.getOwnedTokenIds(vars.user);
    assertEq(vars.ownerTokenIds.length, 1, "Owner should have one token ID");
    assertEq(vars.ownerTokenIds[0], vars.tokenId, "Owner token ID mismatch");

    // Assert the assets locked mapping
    vars.assetsLocked = ve.getAssetsLocked(vars.tokenId);
    assertEq(vars.assetsLocked.length, 1, "Assets locked length mismatch");
    assertEq(vars.assetsLocked[0], vars.lockedBalance_tokenAddress_test, "Assets locked address mismatch");

    // Display results
    emit log_named_uint("Token ID", vars.tokenId);
    emit log_named_uint("Initial Amount", vars.amount);
    emit log_named_uint("Additional Amount", additionalAmount);
    emit log_named_uint("Total Locked Amount", uint256(int256(locked.amount)));

    emit log_named_address("Token Address", locked.tokenAddress);
    emit log_named_uint("Lock End Time", locked.end);
  }
}

contract IncreaseUnlockTime is veIONTest {
  function testIncreaseUnlockTime() public fork(MODE_MAINNET) {
    TestVars memory vars;
    vars.user = address(0x1234);
    vars.amount = 1000 * 10 ** 18; // 1000 tokens

    // Create lock and check the lock
    (
      vars.tokenId,
      vars.lockedBalance_tokenAddress_test,
      vars.lockedBalance_amount_test,
      vars.lockedBalance_duration_test
    ) = _createLockInternal(vars.user);
    (
      vars.lockedBalance_tokenAddress,
      vars.lockedBalance_amount,
      vars.delegated_lockedBalance_amount,
      vars.lockedBalance_start,
      vars.lockedBalance_end,
      vars.lockedBalance_isPermanent,
      vars.lockedBalance_boost
    ) = ve.s_locked(vars.tokenId, ve.s_lpType(vars.lockedBalance_tokenAddress_test));

    IveION.LpTokenType lpType = IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE;

    // Increase the unlock time
    uint256 newLockTime = 104 weeks;
    vm.prank(vars.user);
    ve.increaseUnlockTime(address(modeVelodrome5050IonMode), vars.tokenId, newLockTime);

    // Verify the unlock time has increased
    IveION.LockedBalance memory locked = ve.getUserLock(vars.tokenId, lpType);
    uint256 expectedEndTime = ((block.timestamp + newLockTime) / WEEK) * WEEK;
    assertEq(locked.end, expectedEndTime, "Lock end time should be increased");

    // Display results
    emit log_named_uint("Token ID", vars.tokenId);
    emit log_named_uint("Initial Duration", vars.lockedBalance_duration_test);
    emit log_named_uint("Additional Duration", newLockTime);
    emit log_named_uint("New Lock End Time", locked.end);
  }
}

contract LockAdditionalAsset is veIONTest {
  function testLockAdditionalAsset() public fork(MODE_MAINNET) {
    TestVars memory vars;
    vars.user = address(0x1234);
    vars.amount = 1000 * 10 ** 18; // 1000 tokens

    // Create lock and check the lock
    (
      vars.tokenId,
      vars.lockedBalance_tokenAddress_test,
      vars.lockedBalance_amount_test,
      vars.lockedBalance_duration_test
    ) = _createLockInternal(vars.user);
    (
      vars.lockedBalance_tokenAddress,
      vars.lockedBalance_amount,
      vars.delegated_lockedBalance_amount,
      vars.lockedBalance_start,
      vars.lockedBalance_end,
      vars.lockedBalance_isPermanent,
      vars.lockedBalance_boost
    ) = ve.s_locked(vars.tokenId, ve.s_lpType(vars.lockedBalance_tokenAddress_test));

    IveION.LpTokenType lpType = IveION.LpTokenType.Mode_Balancer_8020_ION_ETH;

    vars.lockedBalance_tokenAddress_test = address(modeBalancer8020IonEth);

    modeBalancer8020IonEth.mint(vars.user, vars.amount);

    vm.prank(vars.user);
    modeBalancer8020IonEth.approve(address(ve), vars.amount);

    // Lock additional asset
    uint256 additionalAmount = 500 * 10 ** 18; // 500 tokens
    vm.prank(vars.user);
    ve.lockAdditionalAsset(vars.lockedBalance_tokenAddress_test, additionalAmount, vars.tokenId, 26 weeks, false);

    // Verify the additional asset is locked
    IveION.LockedBalance memory lockedBalancer = ve.getUserLock(vars.tokenId, lpType);
    uint256 expectedEndTimeBalancer = ((block.timestamp + 26 weeks) / WEEK) * WEEK;
    assertEq(uint256(int256(lockedBalancer.amount)), additionalAmount, "Total locked amount mismatch");
    assertEq(lockedBalancer.end, expectedEndTimeBalancer, "Lock end time should be increased balancer");

    IveION.LockedBalance memory lockedVelo = ve.getUserLock(
      vars.tokenId,
      IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE
    );
    uint256 expectedEndTimeVelo = ((block.timestamp + 52 weeks) / WEEK) * WEEK;
    assertEq(uint256(int256(lockedVelo.amount)), vars.amount, "Total locked amount mismatch");
    assertEq(lockedVelo.end, expectedEndTimeVelo, "Lock end time should be increased velo");

    // Display results
    emit log_named_uint("Token ID", vars.tokenId);
    emit log_named_uint("Initial Amount", vars.amount);
    emit log_named_uint("Additional Amount", additionalAmount);
    emit log_named_uint("Total Locked Amount", uint256(int256(lockedBalancer.amount)));
  }
}

contract Withdraw is veIONTest {
  function testWithdrawVENormal() public fork(MODE_MAINNET) {
    TestVars memory vars;
    vars.user = address(0x1234);
    vars.amount = 1000 * 10 ** 18; // 1000 tokens

    // Create lock and check the lock
    (
      vars.tokenId,
      vars.lockedBalance_tokenAddress_test,
      vars.lockedBalance_amount_test,
      vars.lockedBalance_duration_test
    ) = _createLockInternal(vars.user);
    IveION.LpTokenType lpType = IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE;

    // Fast forward time to after the lock duration
    vm.warp(block.timestamp + 52 weeks + 1);

    // Withdraw the tokens
    vm.prank(vars.user);
    ve.withdraw(address(modeVelodrome5050IonMode), vars.tokenId);

    // Verify the lock has been withdrawn
    IveION.LockedBalance memory locked = ve.getUserLock(vars.tokenId, lpType);
    assertEq(locked.amount, 0, "Lock amount should be zero after withdrawal");
    assertEq(locked.end, 0, "Lock end time should be zero after withdrawal");

    // Verify the user's token balance has increased
    uint256 userBalanceAfterWithdraw = modeVelodrome5050IonMode.balanceOf(vars.user);
    assertEq(userBalanceAfterWithdraw, vars.amount, "User should receive the locked tokens back");

    // Display results
    emit log_named_uint("Token ID", vars.tokenId);
    emit log_named_uint("User Balance After Withdraw", userBalanceAfterWithdraw);
    emit log_named_uint("Lock Amount After Withdraw", uint256(int256(locked.amount)));
    emit log_named_uint("Lock End Time After Withdraw", locked.end);
  }

  function testWithdrawWithUnderlyingStake() public fork(MODE_MAINNET) {
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
  function testMergeLocks() public fork(MODE_MAINNET) {
    TestVars memory vars;
    vars.user = address(0x1234);
    vars.amount = 1000 * 10 ** 18; // 1000 tokens

    // Create lock and check the lock
    (
      vars.tokenId,
      vars.lockedBalance_tokenAddress_test,
      vars.lockedBalance_amount_test,
      vars.lockedBalance_duration_test
    ) = _createLockInternal(vars.user);

    // Create second lock for the user
    vm.prank(vars.user);
    (vars.secondTokenId, , , ) = _createLockInternal(vars.user);

    // Merge the locks
    vm.prank(vars.user);
    ve.merge(vars.tokenId, vars.secondTokenId);

    // Verify the merged lock
    IveION.LockedBalance memory mergedLock = ve.getUserLock(vars.secondTokenId, veloLpType);
    assertEq(
      uint256(int256(mergedLock.amount)),
      vars.amount * 2,
      "Merged lock amount should be the sum of the original locks"
    );

    // Verify the first lock is burned
    IveION.LockedBalance memory burnedLock = ve.getUserLock(vars.tokenId, veloLpType);
    assertEq(uint256(int256(burnedLock.amount)), 0, "First lock amount should be zero after merge");
    assertEq(burnedLock.end, 0, "First lock end time should be zero after merge");
  }

  function testMergeMultipleLP() public fork(MODE_MAINNET) {
    TestVars memory vars;

    vars.user = address(0x1234);
    vars.tokenId = _createLockMultipleInternal(vars.user);
    (vars.secondTokenId, , , ) = _createLockInternal(vars.user);

    vm.prank(vars.user);
    ve.merge(vars.tokenId, vars.secondTokenId);

    // Verify the merged lock
    IveION.LockedBalance memory mergedLockVelo = ve.getUserLock(vars.secondTokenId, veloLpType);
    IveION.LockedBalance memory mergedLockBalancer = ve.getUserLock(vars.secondTokenId, balancerLpType);

    assertEq(
      uint256(int256(mergedLockVelo.amount)),
      MINT_AMT * 2,
      "Velo merged lock amount should be the sum of the original locks"
    );

    assertEq(
      uint256(int256(mergedLockBalancer.amount)),
      MINT_AMT,
      "Balancer merged lock amount should be the sum of the original locks"
    );
  }
}

contract Split is veIONTest {
  function testTotalSplit() public fork(MODE_MAINNET) {
    TestVars memory vars;

    // Create a user
    vars.user = address(0x5678);
    vars.tokenId = _createLockMultipleInternal(vars.user);

    vm.prank(ve.owner());
    ve.toggleSplit(vars.user, true);

    // Split the lock
    uint256 splitAmount = MINT_AMT;
    vm.prank(vars.user);
    (uint256 tokenId1, uint256 tokenId2) = ve.split(address(modeVelodrome5050IonMode), vars.tokenId, splitAmount);

    // Verify the split locks
    IveION.LockedBalance memory veloLocked1 = ve.getUserLock(tokenId1, veloLpType);
    IveION.LockedBalance memory balancerLocked1 = ve.getUserLock(tokenId1, balancerLpType);
    IveION.LockedBalance memory veloLocked2 = ve.getUserLock(tokenId2, veloLpType);
    IveION.LockedBalance memory balancerLocked2 = ve.getUserLock(tokenId2, balancerLpType);

    assertEq(uint256(int256(veloLocked1.amount)), 0, "First split lock amount should be half of the original");
    assertEq(
      uint256(int256(balancerLocked1.amount)),
      splitAmount,
      "Second split lock amount should be half of the original"
    );
    assertEq(
      uint256(int256(veloLocked2.amount)),
      splitAmount,
      "Second split lock amount should be half of the original"
    );
    assertEq(uint256(int256(balancerLocked2.amount)), 0, "Second split lock amount should be half of the original");
  }

  function testPartialSplit() public fork(MODE_MAINNET) {
    TestVars memory vars;

    // Create a user
    vars.user = address(0x5678);
    vars.tokenId = _createLockMultipleInternal(vars.user);

    vm.prank(ve.owner());
    ve.toggleSplit(vars.user, true);

    // Split the lock
    uint256 splitAmount = MINT_AMT / 2;
    vm.prank(vars.user);
    (uint256 tokenId1, uint256 tokenId2) = ve.split(address(modeVelodrome5050IonMode), vars.tokenId, splitAmount);

    // Verify the split locks
    IveION.LockedBalance memory veloLocked1 = ve.getUserLock(tokenId1, veloLpType);
    IveION.LockedBalance memory balancerLocked1 = ve.getUserLock(tokenId1, balancerLpType);
    IveION.LockedBalance memory veloLocked2 = ve.getUserLock(tokenId2, veloLpType);
    IveION.LockedBalance memory balancerLocked2 = ve.getUserLock(tokenId2, balancerLpType);

    assertEq(
      uint256(int256(veloLocked1.amount)),
      MINT_AMT / 2,
      "First split lock amount should be half of the original"
    );
    assertEq(
      uint256(int256(balancerLocked1.amount)),
      MINT_AMT,
      "Second split lock amount should be half of the original"
    );
    assertEq(
      uint256(int256(veloLocked2.amount)),
      MINT_AMT / 2,
      "Second split lock amount should be half of the original"
    );
    assertEq(uint256(int256(balancerLocked2.amount)), 0, "Second split lock amount should be half of the original");
  }
}

contract ToggleSplit is veIONTest {}

contract LockPermanent is veIONTest {
  function testLockPermanent() public fork(MODE_MAINNET) {
    TestVars memory vars;

    // Create a user
    vars.user = address(0x5678);
    (
      vars.tokenId,
      vars.lockedBalance_tokenAddress_test,
      vars.lockedBalance_amount_test,
      vars.lockedBalance_duration_test
    ) = _createLockInternal(vars.user);

    // Lock the tokens permanently
    vm.prank(vars.user);
    ve.lockPermanent(address(modeVelodrome5050IonMode), vars.tokenId);

    // Verify the permanent lock
    IveION.LockedBalance memory locked = ve.getUserLock(vars.tokenId, veloLpType);
    assertEq(locked.isPermanent, true, "Lock should be permanent");
    assertEq(locked.end, 0, "Lock end time should be zero for permanent lock");

    // Verify the latest user point history for the lock
    vars.userEpoch = ve.s_userPointEpoch(vars.tokenId, veloLpType);
    (
      vars.userPoint_bias,
      vars.userPoint_slope,
      vars.userPoint_ts,
      vars.userPoint_blk,
      vars.userPoint_permanent,
      vars.userPoint_permanentDelegate
    ) = ve.s_userPointHistory(vars.tokenId, veloLpType, vars.userEpoch);
    assertEq(vars.userPoint_bias, 0, "User point bias should be zero for permanent lock");
    assertEq(vars.userPoint_slope, 0, "User point slope should be zero for permanent lock");
    assertEq(vars.userPoint_ts, block.timestamp, "User point timestamp should be current block timestamp");
    assertEq(vars.userPoint_blk, block.number, "User point block number should be current block number");
    assertEq(
      vars.userPoint_permanent,
      uint256(int256(locked.amount)),
      "User point permanent lock should match lock amount"
    );
  }
}

contract UnlockPermanent is veIONTest {
  function testUnlockPermanent() public fork(MODE_MAINNET) {
    TestVars memory vars;

    // Create a user
    vars.user = address(0x5678);
    (
      vars.tokenId,
      vars.lockedBalance_tokenAddress_test,
      vars.lockedBalance_amount_test,
      vars.lockedBalance_duration_test
    ) = _createLockInternal(vars.user);

    // Lock the tokens permanently
    vm.startPrank(vars.user);
    ve.lockPermanent(address(modeVelodrome5050IonMode), vars.tokenId);
    ve.unlockPermanent(address(modeVelodrome5050IonMode), vars.tokenId);
    vm.stopPrank();

    uint256 endTime = ((block.timestamp + MAXTIME) / WEEK) * WEEK;
    // Verify the permanent lock
    IveION.LockedBalance memory locked = ve.getUserLock(vars.tokenId, veloLpType);
    assertEq(locked.isPermanent, false, "Lock should be permanent");
    assertEq(locked.end, endTime, "Lock end time should be zero for permanent lock");
  }
}

contract Delegate is veIONTest {
  function testDelegation() public fork(MODE_MAINNET) {
    TestVars memory vars;

    // Create a user
    vars.user = address(0x5678);
    (
      vars.tokenId,
      vars.lockedBalance_tokenAddress_test,
      vars.lockedBalance_amount_test,
      vars.lockedBalance_duration_test
    ) = _createLockInternal(vars.user);

    // Create another user
    vars.user2 = address(0x1234);
    (vars.secondTokenId, , , ) = _createLockInternal(vars.user2);

    // Lock both tokens permanently
    vm.prank(vars.user);
    ve.lockPermanent(address(modeVelodrome5050IonMode), vars.tokenId);

    vm.prank(vars.user2);
    ve.lockPermanent(address(modeVelodrome5050IonMode), vars.secondTokenId);

    // Lock the tokens permanently
    vm.prank(vars.user);
    ve.delegate(vars.tokenId, vars.secondTokenId, address(modeVelodrome5050IonMode), MINT_AMT);

    IveION.LockedBalance memory locked1 = ve.getUserLock(vars.tokenId, veloLpType);
    IveION.LockedBalance memory locked2 = ve.getUserLock(vars.secondTokenId, veloLpType);

    assertEq(locked1.amount, 0, "All voting power should have been delegated from this token");
    assertEq(locked2.delegateAmount, MINT_AMT, "All voting power should have been delegated to this token");

    uint256[] memory delegatees = ve.getDelegatees(vars.tokenId, veloLpType);
    bool found = false;
    for (uint256 i = 0; i < delegatees.length; i++) {
      if (delegatees[i] == vars.secondTokenId) {
        found = true;
        break;
      }
    }
    assertTrue(found, "secondTokenId should be in the list of delegatees");

    assertEq(
      ve.s_delegations(vars.tokenId, vars.secondTokenId, veloLpType),
      MINT_AMT,
      "Delegated amount should be recorded"
    );
  }
}

contract RemoveDelegatees is veIONTest {
  function testRemoveDelegatees() public fork(MODE_MAINNET) {
    TestVars memory vars;

    // Create a user
    vars.user = address(0x5678);
    (
      vars.tokenId,
      vars.lockedBalance_tokenAddress_test,
      vars.lockedBalance_amount_test,
      vars.lockedBalance_duration_test
    ) = _createLockInternal(vars.user);

    // Create another user
    vars.user2 = address(0x1234);
    (vars.secondTokenId, , , ) = _createLockInternal(vars.user2);

    // Lock both tokens permanently
    vm.prank(vars.user);
    ve.lockPermanent(address(modeVelodrome5050IonMode), vars.tokenId);

    vm.prank(vars.user2);
    ve.lockPermanent(address(modeVelodrome5050IonMode), vars.secondTokenId);

    // Delegate voting power
    vm.prank(vars.user);
    ve.delegate(vars.tokenId, vars.secondTokenId, address(modeVelodrome5050IonMode), MINT_AMT);

    // De-delegate voting power
    uint256[] memory toTokenIds = new uint256[](1);
    toTokenIds[0] = vars.secondTokenId;
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = MINT_AMT;

    vm.prank(vars.user);
    ve.removeDelegatees(vars.tokenId, toTokenIds, address(modeVelodrome5050IonMode), amounts);

    // Verify the de-delegation
    IveION.LockedBalance memory locked1 = ve.getUserLock(vars.tokenId, veloLpType);
    IveION.LockedBalance memory locked2 = ve.getUserLock(vars.secondTokenId, veloLpType);

    assertEq(locked1.amount, MINT_AMT, "Voting power should be returned to the original token");
    assertEq(locked2.delegateAmount, 0, "Delegated voting power should be removed from the second token");

    uint256[] memory delegatees = ve.getDelegatees(vars.tokenId, veloLpType);
    bool found = false;
    for (uint256 i = 0; i < delegatees.length; i++) {
      if (delegatees[i] == vars.secondTokenId) {
        found = true;
        break;
      }
    }
    assertFalse(found, "secondTokenId should not be in the list of delegatees after de-delegation");

    assertEq(
      ve.s_delegations(vars.tokenId, vars.secondTokenId, veloLpType),
      0,
      "Delegated amount should be zero after de-delegation"
    );
  }
}

contract RemoveDelegators is veIONTest {}

contract TrasferVeION is veIONTest {}

contract Setters is veIONTest {}

contract ViewFunctions is veIONTest {}

contract BalanceOfNFT is veIONTest {}

contract Voting is veIONTest {}

contract Withdrawals is veIONTest {}
