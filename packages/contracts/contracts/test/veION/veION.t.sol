// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;
import { MockERC20 } from "solmate/test/utils/mocks/MockERC20.sol";
import "../config/BaseTest.t.sol";
import "../../veION/veION.sol";
import "../../veION/interfaces/IveION.sol";
import "../../veION/stake/IStakeStrategy.sol";
import "../../veION/stake/velo/VeloIonModeStakingStrategy.sol";
import "../../veION/stake/IStakeStrategy.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { AddressesProvider } from "../../ionic/AddressesProvider.sol";
import "../../veION/stake/velo/VeloIonModeStakingStrategy.sol";
import "../../veION/stake/velo/VelodromeStakingWallet.sol";
import "../../veION/stake/velo/IVeloIonModeStaking.sol";

contract VotingEscrowNFTTest is BaseTest {
  veION ve;
  MockERC20 modeVelodrome5050IonMode;
  MockERC20 modeBalancer8020IonEth;
  MockERC20 baseAerodrome5050IonWstEth;
  MockERC20 baseBalancer8020IonEth;
  MockERC20 optimismVelodrome5050IonOp;
  MockERC20 optimismBalancer8020IonEth;
  IveION.LpTokenType veloLpType;
  IveION.LpTokenType balancerLpType;

  uint256 internal constant MINT_AMT = 1000 ether;
  uint256 internal constant WEEK = 1 weeks;
  uint256 internal constant MAXTIME = 4 * 365 * 86400;

  function afterForkSetUp() internal override {
    super.afterForkSetUp();
    ve = new veION();
    ve.initialize(ap);
    modeVelodrome5050IonMode = new MockERC20("Mode_Velodrome_5050_ION_MODE", "MV5050", 18);
    modeBalancer8020IonEth = new MockERC20("Mode_Balancer_8020_ION_ETH", "MB8020", 18);

    address[] memory whitelistedTokens = new address[](2);
    bool[] memory isWhitelistedTokens = new bool[](2);

    whitelistedTokens[0] = address(modeVelodrome5050IonMode);
    whitelistedTokens[1] = address(modeBalancer8020IonEth);

    for (uint i = 0; i < 2; i++) {
      isWhitelistedTokens[i] = true;
    }
    ve.whitelistTokens(whitelistedTokens, isWhitelistedTokens);

    ve.setLpTokenType(address(modeVelodrome5050IonMode), IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE);
    ve.setLpTokenType(address(modeBalancer8020IonEth), IveION.LpTokenType.Mode_Balancer_8020_ION_ETH);

    veloLpType = IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE;
    balancerLpType = IveION.LpTokenType.Mode_Balancer_8020_ION_ETH;

    ve.setTeam(address(this));
  }

  // Function: _createLockMultipleInternal
  // Tokens Locked:
  //   1. "Mode_Velodrome_5050_ION_MODE" - 1000 tokens
  // Lock Duration: 52 weeks for each token
  function _createLockInternal(address user) internal returns (uint256) {
    TestVars memory vars;
    // Mint ModeVelodrome tokens to the user
    vars.user = user;
    vars.amount = MINT_AMT; // 1000 tokens
    modeVelodrome5050IonMode.mint(vars.user, vars.amount);

    // Approve veION contract to spend user's tokens
    vm.startPrank(vars.user);
    modeVelodrome5050IonMode.approve(address(ve), vars.amount);
    vm.stopPrank();

    // Prepare parameters for createLock
    vars.tokenAddresses = new address[](1);
    vars.tokenAddresses[0] = address(modeVelodrome5050IonMode);

    vars.tokenAmounts = new uint256[](1);
    vars.tokenAmounts[0] = vars.amount;

    vars.durations = new uint256[](1);
    vars.durations[0] = 52 weeks;

    // Create lock
    vm.startPrank(vars.user);
    uint256 tokenId = ve.createLock(vars.tokenAddresses, vars.tokenAmounts, vars.durations, new bool[](1));
    vm.stopPrank();

    return tokenId;
  }

  // Function: _createLockMultipleInternal
  // Tokens Locked:
  //   1. "Mode_Velodrome_5050_ION_MODE" - 1000 tokens
  //   2. "Mode_Balancer_8020_ION_ETH" - 1000 tokens
  // Lock Duration: 52 weeks for each token
  function _createLockMultipleInternal(address user) internal returns (uint256) {
    TestVars memory vars;
    vars.user = user;

    // Mint tokens to the user
    vars.amount = MINT_AMT; // 1000 tokens
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
    return vars.tokenId;
  }

  struct TestVars {
    address user;
    address user2;
    uint256 amount;
    address[] tokenAddresses;
    uint256[] tokenAmounts;
    uint256[] durations;
    bool[] stakeUnderlying;
    uint256 tokenId;
    uint256 secondTokenId;
    uint256 expectedSupply;
    uint256 userEpoch;
    uint256 globalEpoch;
    address lockedBalance_tokenAddress;
    int128 lockedBalance_amount;
    uint256 lockedBalance_start;
    uint256 lockedBalance_end;
    bool lockedBalance_isPermanent;
    uint256 lockedBalance_boost;
    int128 userPoint_bias;
    int128 userPoint_slope;
    uint256 userPoint_ts;
    uint256 userPoint_blk;
    uint256 userPoint_permanent;
    int128 globalPoint_bias;
    int128 globalPoint_slope;
    uint256 globalPoint_ts;
    uint256 globalPoint_blk;
    uint256 globalPoint_permanentLockBalance;
    uint256[] ownerTokenIds;
    address[] assetsLocked;
  }

  function testCreateLockVE() public fork(MODE_MAINNET) {
    TestVars memory vars;
    vars.user = address(0x1234);
    vars.amount = 1000 * 10 ** 18; // 1000 tokens

    // Create lock and check the lock
    vars.tokenId = _createLockInternal(vars.user);
    (
      vars.lockedBalance_tokenAddress,
      vars.lockedBalance_amount,
      vars.lockedBalance_start,
      vars.lockedBalance_end,
      vars.lockedBalance_isPermanent,
      vars.lockedBalance_boost
    ) = ve.s_locked(vars.tokenId, ve.s_lpType(vars.tokenAddresses[0]));

    vars.lockedBalance_end = ((block.timestamp + vars.durations[0]) / WEEK) * WEEK; // Update end time

    // Assert the locked balance state
    assertEq(vars.lockedBalance_tokenAddress, vars.tokenAddresses[0], "Token address mismatch");
    assertEq(vars.lockedBalance_amount, int128(int256(vars.tokenAmounts[0])), "Token amount mismatch");
    assertEq(vars.lockedBalance_end, vars.lockedBalance_end, "Unlock time mismatch");
    assertEq(vars.lockedBalance_isPermanent, false, "Lock should not be permanent");

    // Assert the supply state
    vars.expectedSupply = vars.amount;
    assertEq(ve.s_supply(ve.s_lpType(vars.tokenAddresses[0])), vars.expectedSupply, "Supply mismatch");

    // Assert the user point history state
    vars.userEpoch = ve.s_userPointEpoch(vars.tokenId, ve.s_lpType(vars.tokenAddresses[0]));
    assertEq(vars.userEpoch, 1, "User epoch mismatch");

    // Assert the global point history state
    vars.globalEpoch = ve.s_epoch(ve.s_lpType(vars.tokenAddresses[0]));
    assertEq(vars.globalEpoch, 1, "Global epoch mismatch");

    // Check the user point history
    (vars.userPoint_bias, vars.userPoint_slope, vars.userPoint_ts, vars.userPoint_blk, vars.userPoint_permanent) = ve
      .s_userPointHistory(vars.tokenId, ve.s_lpType(vars.tokenAddresses[0]), vars.userEpoch);
    assertEq(vars.userPoint_ts, block.timestamp, "User point timestamp mismatch");
    assertEq(vars.userPoint_blk, block.number, "User point block number mismatch");
    assertEq(vars.userPoint_bias, 0, "User point bias mismatch");
    assertEq(vars.userPoint_slope, 0, "User point slope mismatch");
    assertEq(vars.userPoint_permanent, 0, "User point permanent mismatch");

    // Check the global point history
    (
      vars.globalPoint_bias,
      vars.globalPoint_slope,
      vars.globalPoint_ts,
      vars.globalPoint_blk,
      vars.globalPoint_permanentLockBalance
    ) = ve.s_pointHistory(vars.globalEpoch, ve.s_lpType(vars.tokenAddresses[0]));
    assertEq(vars.globalPoint_ts, block.timestamp, "Global point timestamp mismatch");
    assertEq(vars.globalPoint_blk, block.number, "Global point block number mismatch");
    assertEq(vars.globalPoint_bias, 0, "Global point bias mismatch");
    assertEq(vars.globalPoint_slope, 0, "Global point slope mismatch");
    assertEq(vars.globalPoint_permanentLockBalance, 0, "Global point permanent lock balance mismatch");

    // Assert the token ID state
    assertEq(ve.s_tokenId(), vars.tokenId, "Token ID mismatch");

    // Assert the owner to token IDs mapping
    vars.ownerTokenIds = ve.getOwnedTokenIds(vars.user);
    assertEq(vars.ownerTokenIds.length, 1, "Owner should have one token ID");
    assertEq(vars.ownerTokenIds[0], vars.tokenId, "Owner token ID mismatch");

    // Assert the assets locked mapping
    vars.assetsLocked = ve.getAssetsLocked(vars.tokenId);
    assertEq(vars.assetsLocked.length, 1, "Assets locked length mismatch");
    assertEq(vars.assetsLocked[0], vars.tokenAddresses[0], "Assets locked address mismatch");
  }

  function testCreateLockMultipleVE() public fork(MODE_MAINNET) {
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
      (address lb_tokenAddress, int128 lb_amount, , uint256 lb_end, , ) = ve.s_locked(
        vars.tokenId,
        ve.s_lpType(vars.tokenAddresses[i])
      );
      uint256 unlockTime = ((block.timestamp + vars.durations[i]) / WEEK) * WEEK;

      assertEq(lb_tokenAddress, vars.tokenAddresses[i], "Token address mismatch");
      assertEq(lb_amount, int128(int256(vars.tokenAmounts[i])), "Token amount mismatch");
      assertEq(lb_end, unlockTime, "Unlock time mismatch");
    }

    // Assert the supply state
    vars.expectedSupply = vars.amount;
    assertEq(ve.s_supply(ve.s_lpType(vars.tokenAddresses[0])), vars.expectedSupply, "Supply mismatch");
    assertEq(ve.s_supply(ve.s_lpType(vars.tokenAddresses[1])), vars.expectedSupply, "Supply mismatch");

    // Assert the user point history state
    vars.userEpoch = ve.s_userPointEpoch(vars.tokenId, ve.s_lpType(vars.tokenAddresses[0]));
    assertEq(vars.userEpoch, 1, "User epoch mismatch");

    // Assert the global point history state
    vars.globalEpoch = ve.s_epoch(ve.s_lpType(vars.tokenAddresses[0]));
    assertEq(vars.globalEpoch, 1, "Global epoch mismatch");

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

  function testCreateLockAndStakeUnderlying() public fork(MODE_MAINNET) {
    TestVars memory vars;

    address ionMode5050 = 0x690A74d2eC0175a69C0962B309E03021C0b5002E;
    address veloGauge = 0x8EE410cC13948e7e684ebACb36b552e2c2A125fC;

    VeloIonModeStakingStrategy veloIonModeStakingStrategy = new VeloIonModeStakingStrategy(
      address(ve),
      ionMode5050,
      veloGauge
    );

    ve.setStakeStrategy(veloLpType, IStakeStrategy(veloIonModeStakingStrategy), bytes(""));

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

  function testCreateLockStakeUnderlyingAndClaim() public fork(MODE_MAINNET) {
    TestVars memory vars;

    address ionMode5050 = 0x690A74d2eC0175a69C0962B309E03021C0b5002E;
    address veloGauge = 0x8EE410cC13948e7e684ebACb36b552e2c2A125fC;

    VeloIonModeStakingStrategy veloIonModeStakingStrategy = new VeloIonModeStakingStrategy(
      address(ve),
      ionMode5050,
      veloGauge
    );

    ve.setStakeStrategy(veloLpType, IStakeStrategy(veloIonModeStakingStrategy), bytes(""));

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

  function testIncreaseLockAmount() public fork(MODE_MAINNET) {
    TestVars memory vars;
    vars.user = address(0x1234);
    vars.amount = 1000 * 10 ** 18; // 1000 tokens

    // Create lock and check the lock
    vars.tokenId = _createLockInternal(vars.user);
    (
      vars.lockedBalance_tokenAddress,
      vars.lockedBalance_amount,
      vars.lockedBalance_start,
      vars.lockedBalance_end,
      vars.lockedBalance_isPermanent,
      vars.lockedBalance_boost
    ) = ve.s_locked(vars.tokenId, ve.s_lpType(vars.tokenAddresses[0]));

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

    vars.lockedBalance_end = ((block.timestamp + vars.durations[0]) / WEEK) * WEEK; // Update end time

    // Assert the locked balance state
    assertEq(vars.lockedBalance_tokenAddress, vars.tokenAddresses[0], "Token address mismatch");
    assertEq(vars.lockedBalance_end, vars.lockedBalance_end, "Unlock time mismatch");
    assertEq(vars.lockedBalance_isPermanent, false, "Lock should not be permanent");

    // Assert the supply state
    vars.expectedSupply = vars.amount;
    assertEq(
      ve.s_supply(ve.s_lpType(vars.tokenAddresses[0])),
      vars.expectedSupply + additionalAmount,
      "Supply mismatch"
    );

    // Assert the user point history state
    vars.userEpoch = ve.s_userPointEpoch(vars.tokenId, ve.s_lpType(vars.tokenAddresses[0]));
    assertEq(vars.userEpoch, 1, "User epoch mismatch");

    // Assert the global point history state
    vars.globalEpoch = ve.s_epoch(ve.s_lpType(vars.tokenAddresses[0]));
    assertEq(vars.globalEpoch, 1, "Global epoch mismatch");

    // Assert the token ID state
    assertEq(ve.s_tokenId(), vars.tokenId, "Token ID mismatch");

    // Assert the owner to token IDs mapping
    vars.ownerTokenIds = ve.getOwnedTokenIds(vars.user);
    assertEq(vars.ownerTokenIds.length, 1, "Owner should have one token ID");
    assertEq(vars.ownerTokenIds[0], vars.tokenId, "Owner token ID mismatch");

    // Assert the assets locked mapping
    vars.assetsLocked = ve.getAssetsLocked(vars.tokenId);
    assertEq(vars.assetsLocked.length, 1, "Assets locked length mismatch");
    assertEq(vars.assetsLocked[0], vars.tokenAddresses[0], "Assets locked address mismatch");

    // Display results
    emit log_named_uint("Token ID", vars.tokenId);
    emit log_named_uint("Initial Amount", vars.amount);
    emit log_named_uint("Additional Amount", additionalAmount);
    emit log_named_uint("Total Locked Amount", uint256(int256(locked.amount)));

    emit log_named_address("Token Address", locked.tokenAddress);
    emit log_named_uint("Lock End Time", locked.end);
  }

  function testIncreaseUnlockTime() public fork(MODE_MAINNET) {
    TestVars memory vars;
    vars.user = address(0x1234);
    vars.amount = 1000 * 10 ** 18; // 1000 tokens

    // Create lock and check the lock
    vars.tokenId = _createLockInternal(vars.user);
    (
      vars.lockedBalance_tokenAddress,
      vars.lockedBalance_amount,
      vars.lockedBalance_start,
      vars.lockedBalance_end,
      vars.lockedBalance_isPermanent,
      vars.lockedBalance_boost
    ) = ve.s_locked(vars.tokenId, ve.s_lpType(vars.tokenAddresses[0]));

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
    emit log_named_uint("Initial Duration", vars.durations[0]);
    emit log_named_uint("Additional Duration", newLockTime);
    emit log_named_uint("New Lock End Time", locked.end);
  }

  function testLockAdditionalAsset() public fork(MODE_MAINNET) {
    TestVars memory vars;
    vars.user = address(0x1234);
    vars.amount = 1000 * 10 ** 18; // 1000 tokens

    // Create lock and check the lock
    vars.tokenId = _createLockInternal(vars.user);
    (
      vars.lockedBalance_tokenAddress,
      vars.lockedBalance_amount,
      vars.lockedBalance_start,
      vars.lockedBalance_end,
      vars.lockedBalance_isPermanent,
      vars.lockedBalance_boost
    ) = ve.s_locked(vars.tokenId, ve.s_lpType(vars.tokenAddresses[0]));

    IveION.LpTokenType lpType = IveION.LpTokenType.Mode_Balancer_8020_ION_ETH;

    vars.tokenAddresses[0] = address(modeBalancer8020IonEth);

    modeBalancer8020IonEth.mint(vars.user, vars.amount);

    vm.prank(vars.user);
    modeBalancer8020IonEth.approve(address(ve), vars.amount);

    // Lock additional asset
    uint256 additionalAmount = 500 * 10 ** 18; // 500 tokens
    vm.prank(vars.user);
    ve.lockAdditionalAsset(vars.tokenAddresses[0], additionalAmount, vars.tokenId, 26 weeks, false);

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

  function testWithdrawVENormal() public fork(MODE_MAINNET) {
    TestVars memory vars;
    vars.user = address(0x1234);
    vars.amount = 1000 * 10 ** 18; // 1000 tokens

    // Create lock and check the lock
    vars.tokenId = _createLockInternal(vars.user);
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

  function testWithdrawVEEarly() public fork(MODE_MAINNET) {
    TestVars memory vars;
    vars.user = address(0x1234);
    vars.amount = 1000 * 10 ** 18; // 1000 tokens

    // Create lock and check the lock
    vars.tokenId = _createLockInternal(vars.user);
    IveION.LpTokenType lpType = IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE;

    // Fast forward time to after the lock duration
    vm.warp(block.timestamp + 10 weeks);

    IveION.LockedBalance memory oldLocked = ve.getUserLock(vars.tokenId, lpType);
    emit log_named_uint("Lock Start Time", oldLocked.start);
    emit log_named_uint("Lock End Time", oldLocked.end);

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
      veloGauge
    );

    ve.setStakeStrategy(veloLpType, IStakeStrategy(veloIonModeStakingStrategy), bytes(""));

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

  function testMergeLocks() public fork(MODE_MAINNET) {
    TestVars memory vars;
    vars.user = address(0x1234);
    vars.amount = 1000 * 10 ** 18; // 1000 tokens

    // Create lock and check the lock
    vars.tokenId = _createLockInternal(vars.user);
    IveION.LpTokenType veloLpType = IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE;

    // Create second lock for the user
    vm.prank(vars.user);
    vars.secondTokenId = _createLockInternal(vars.user);

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
    vars.secondTokenId = _createLockInternal(vars.user);

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

  function testTotalSplit() public fork(MODE_MAINNET) {
    TestVars memory vars;

    // Create a user
    vars.user = address(0x5678);
    vars.tokenId = _createLockMultipleInternal(vars.user);

    vm.prank(ve.s_team());
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

    vm.prank(ve.s_team());
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

  function testLockPermanent() public fork(MODE_MAINNET) {
    TestVars memory vars;

    // Create a user
    vars.user = address(0x5678);
    vars.tokenId = _createLockInternal(vars.user);

    // Lock the tokens permanently
    vm.prank(vars.user);
    ve.lockPermanent(address(modeVelodrome5050IonMode), vars.tokenId);

    // Verify the permanent lock
    IveION.LockedBalance memory locked = ve.getUserLock(vars.tokenId, veloLpType);
    assertEq(locked.isPermanent, true, "Lock should be permanent");
    assertEq(locked.end, 0, "Lock end time should be zero for permanent lock");

    // Verify the latest user point history for the lock
    vars.userEpoch = ve.s_userPointEpoch(vars.tokenId, veloLpType);
    (vars.userPoint_bias, vars.userPoint_slope, vars.userPoint_ts, vars.userPoint_blk, vars.userPoint_permanent) = ve
      .s_userPointHistory(vars.tokenId, veloLpType, vars.userEpoch);
    assertEq(vars.userPoint_bias, 0, "User point bias should be zero for permanent lock");
    assertEq(vars.userPoint_slope, 0, "User point slope should be zero for permanent lock");
    assertEq(vars.userPoint_ts, block.timestamp, "User point timestamp should be current block timestamp");
    assertEq(vars.userPoint_blk, block.number, "User point block number should be current block number");
    assertEq(
      vars.userPoint_permanent,
      uint256(int256(locked.amount)),
      "User point permanent lock should match lock amount"
    );

    // Verify the latest global point history
    uint256 epoch = ve.s_epoch(veloLpType);
    (
      vars.globalPoint_bias,
      vars.globalPoint_slope,
      vars.globalPoint_ts,
      vars.globalPoint_blk,
      vars.globalPoint_permanentLockBalance
    ) = ve.s_pointHistory(epoch, veloLpType);
    assertEq(vars.globalPoint_bias, 0, "Global point bias should be zero for permanent lock");
    assertEq(vars.globalPoint_slope, 0, "Global point slope should be zero for permanent lock");
    assertEq(vars.globalPoint_ts, block.timestamp, "Global point timestamp should be current block timestamp");
    assertEq(vars.globalPoint_blk, block.number, "Global point block number should be current block number");
    assertEq(
      vars.globalPoint_permanentLockBalance,
      uint256(int256(locked.amount)),
      "Global permanent lock balance should match lock amount"
    );
  }

  function testUnlockPermanent() public fork(MODE_MAINNET) {
    TestVars memory vars;

    // Create a user
    vars.user = address(0x5678);
    vars.tokenId = _createLockInternal(vars.user);

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

  function testDelegation() public fork(MODE_MAINNET) {
    TestVars memory vars;

    // Create a user
    vars.user = address(0x5678);
    vars.tokenId = _createLockInternal(vars.user);

    // Create another user
    vars.user2 = address(0x1234);
    vars.secondTokenId = _createLockInternal(vars.user2);

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
    assertEq(
      locked2.amount,
      int128(uint128(MINT_AMT * 2)),
      "All voting power should have been delegated to this token"
    );

    uint256[] memory delegatees = ve.getDelegatees(vars.tokenId);
    bool found = false;
    for (uint256 i = 0; i < delegatees.length; i++) {
      if (delegatees[i] == vars.secondTokenId) {
        found = true;
        break;
      }
    }
    assertTrue(found, "secondTokenId should be in the list of delegatees");

    assertEq(ve.s_delegations(vars.tokenId, vars.secondTokenId), MINT_AMT, "Delegated amount should be recorded");
  }

  function testDeDelegation() public fork(MODE_MAINNET) {
    TestVars memory vars;

    // Create a user
    vars.user = address(0x5678);
    vars.tokenId = _createLockInternal(vars.user);

    // Create another user
    vars.user2 = address(0x1234);
    vars.secondTokenId = _createLockInternal(vars.user2);

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
    ve.deDelegate(vars.tokenId, toTokenIds, address(modeVelodrome5050IonMode), amounts);

    // Verify the de-delegation
    IveION.LockedBalance memory locked1 = ve.getUserLock(vars.tokenId, veloLpType);
    IveION.LockedBalance memory locked2 = ve.getUserLock(vars.secondTokenId, veloLpType);

    assertEq(locked1.amount, int128(uint128(MINT_AMT)), "Voting power should be returned to the original token");
    assertEq(
      locked2.amount,
      int128(uint128(MINT_AMT)),
      "Delegated voting power should be removed from the second token"
    );

    uint256[] memory delegatees = ve.getDelegatees(vars.tokenId);
    bool found = false;
    for (uint256 i = 0; i < delegatees.length; i++) {
      if (delegatees[i] == vars.secondTokenId) {
        found = true;
        break;
      }
    }
    assertFalse(found, "secondTokenId should not be in the list of delegatees after de-delegation");

    assertEq(
      ve.s_delegations(vars.tokenId, vars.secondTokenId),
      0,
      "Delegated amount should be zero after de-delegation"
    );
  }

  //   function testBoostOnLockCreationAndExtension() public fork(MODE_MAINNET) {
  //     TestVars memory vars;
  //     IveION.LpTokenType lpType = IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE;

  //     // Create a user
  //     vars.user = address(0x5678);

  //     // Mint ModeVelodrome tokens to the user
  //     vars.amount = 1000 * 10 ** 18; // 1000 tokens
  //     modeVelodrome5050IonMode.mint(vars.user, vars.amount);

  //     // Approve veION contract to spend user's tokens
  //     vm.prank(vars.user);
  //     modeVelodrome5050IonMode.approve(address(ve), vars.amount);

  //     // Prepare parameters for createLock
  //     vars.tokenAddresses = new address[](1);
  //     vars.tokenAddresses[0] = address(modeVelodrome5050IonMode);

  //     vars.tokenAmounts = new uint256[](1);
  //     vars.tokenAmounts[0] = vars.amount;

  //     vars.durations = new uint256[](1);
  //     vars.durations[0] = 54 weeks; // 1 year

  //     // Create lock for the user
  //     vm.prank(vars.user);
  //     vars.tokenId = ve.createLock(vars.tokenAddresses, vars.tokenAmounts, vars.durations);

  //     // Verify the boost after 1 year lock
  //     IveION.LockedBalance memory locked = ve.getUserLock(vars.tokenId, lpType);
  //     assertEq(locked.boost, 1.25 * 1 ether, "Boost should be 1.25 after 1 year lock");

  //     // Extend the lock for another year
  //     vars.durations[0] += 52 weeks; // 1 additional year
  //     vm.prank(vars.user);
  //     ve.increaseUnlockTime(address(modeVelodrome5050IonMode), vars.tokenId, vars.durations[0]);

  //     // Verify the boost after extending the lock to 2 years
  //     locked = ve.getUserLock(vars.tokenId, lpType);
  //     assertEq(locked.boost, 2 * 1 ether, "Boost should be 2 after extending lock to 2 years");

  //     // Display results
  //     emit log_named_uint("Token ID", vars.tokenId);
  //     emit log_named_uint("User Balance After Lock", modeVelodrome5050IonMode.balanceOf(vars.user));
  //     emit log_named_uint("Lock Amount", uint256(int256(locked.amount)));
  //     emit log_named_uint("Lock End Time", locked.end);
  //     emit log_named_uint("Lock Boost", locked.boost);
  //   }

  //   struct StakeStrategyVars {
  //     TestVars vars;
  //     IveION.LpTokenType lpType;
  //     IERC20 real5050IonModeVelo;
  //     address user1;
  //     address user2;
  //     address user3;
  //     uint256 totalTokenAmount;
  //     uint256 user1TokenAmount;
  //     uint256 user2TokenAmount;
  //     uint256 user3TokenAmount;
  //     uint256 stakedBalanceUser1;
  //     uint256 stakedBalanceUser2;
  //     uint256 stakedBalanceUser3;
  //     uint256 stakedBalanceUsere;
  //     uint256 totalStaked;
  //     uint256 rewardRate;
  //     uint256 periodFinish;
  //     uint256 rewardPerTokenStored;
  //     uint256 lastUpdateTime;
  //     uint256 user1Earnings;
  //     uint256 user2Earnings;
  //     uint256 user3Earnings;
  //     uint256 veIONEarnings;
  //     uint256 user1EarningsAfterClaim;
  //     uint256 user2EarningsAfterClaim;
  //     uint256 user3EarningsAfterClaim;
  //     uint256 veIONEarningsAfterClaim;
  //     uint256 user1RewardTokenBalance;
  //     uint256 user2RewardTokenBalance;
  //     uint256 user3RewardTokenBalance;
  //   }

  //   function testStakeStrategyVeloIonMode5050() public forkAtBlock(MODE_MAINNET, 12711533) {
  //     StakeStrategyVars memory sVars;
  //     sVars.lpType = IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE;
  //     sVars.real5050IonModeVelo = IERC20(0x690A74d2eC0175a69C0962B309E03021C0b5002E);

  //     address[] memory whitelistedTokens = new address[](1);
  //     bool[] memory isWhitelistedTokens = new bool[](1);
  //     whitelistedTokens[0] = 0x690A74d2eC0175a69C0962B309E03021C0b5002E; // vAMMV2-ION/MODE
  //     isWhitelistedTokens[0] = true;
  //     ve.whitelistTokens(whitelistedTokens, isWhitelistedTokens);
  //     ve.setLpTokenType(address(sVars.real5050IonModeVelo), IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE);

  //     VeloIonModeStakingModeReward stakingStrategy = new VeloIonModeStakingModeReward();
  //     ve.setStakeStrategy(sVars.lpType, stakingStrategy, "");

  //     // Create two users
  //     sVars.user1 = address(0x5678);
  //     sVars.user2 = address(0x1234);

  //     sVars.totalTokenAmount = sVars.real5050IonModeVelo.balanceOf(0x148F4e63611be189601f1F1555d4C79e8cEBddC8);
  //     sVars.user1TokenAmount = (sVars.totalTokenAmount * 30) / 100; // 30% of total tokens
  //     sVars.user2TokenAmount = (sVars.totalTokenAmount * 10) / 100; // 20% of total tokens

  //     // Transfer tokens to user1
  //     vm.prank(0x148F4e63611be189601f1F1555d4C79e8cEBddC8);
  //     sVars.real5050IonModeVelo.transfer(sVars.user1, sVars.user1TokenAmount);

  //     // Transfer tokens to user2
  //     vm.prank(0x148F4e63611be189601f1F1555d4C79e8cEBddC8);
  //     sVars.real5050IonModeVelo.transfer(sVars.user2, sVars.user2TokenAmount);

  //     // Approve veION contract to spend user1's tokens
  //     vm.prank(sVars.user1);
  //     sVars.real5050IonModeVelo.approve(address(ve), sVars.user1TokenAmount);

  //     // Approve veION contract to spend user2's tokens
  //     vm.prank(sVars.user2);
  //     sVars.real5050IonModeVelo.approve(address(ve), sVars.user2TokenAmount);

  //     // Prepare parameters for createLock for user1
  //     sVars.vars.tokenAddresses = new address[](1);
  //     sVars.vars.tokenAddresses[0] = address(sVars.real5050IonModeVelo);

  //     sVars.vars.tokenAmounts = new uint256[](1);
  //     sVars.vars.tokenAmounts[0] = sVars.user1TokenAmount;

  //     sVars.vars.durations = new uint256[](1);
  //     sVars.vars.durations[0] = 52 weeks; // 1 year

  //     // Create lock for user1
  //     vm.prank(sVars.user1);
  //     sVars.vars.tokenId = ve.createLock(sVars.vars.tokenAddresses, sVars.vars.tokenAmounts, sVars.vars.durations);

  //     // Prepare parameters for createLock for user2
  //     sVars.vars.tokenAmounts[0] = sVars.user2TokenAmount;

  //     // Create lock for user2
  //     vm.prank(sVars.user2);
  //     sVars.vars.tokenId = ve.createLock(sVars.vars.tokenAddresses, sVars.vars.tokenAmounts, sVars.vars.durations);

  //     // Wait for a day to simulate the passage of time
  //     vm.warp(block.timestamp + 1 days);
  //     emit log_named_uint("block timestamp after 1 more day", block.timestamp);

  //     // Create a new user
  //     sVars.user3 = address(0x7890);

  //     // Transfer tokens to newUser
  //     sVars.user3TokenAmount = (sVars.totalTokenAmount * 60) / 100; // 10% of total tokens
  //     vm.prank(0x148F4e63611be189601f1F1555d4C79e8cEBddC8);
  //     sVars.real5050IonModeVelo.transfer(sVars.user3, sVars.user3TokenAmount);

  //     // Approve veION contract to spend newUser's tokens
  //     vm.prank(sVars.user3);
  //     sVars.real5050IonModeVelo.approve(address(ve), sVars.user3TokenAmount);

  //     // Prepare parameters for createLock for newUser
  //     sVars.vars.tokenAmounts[0] = sVars.user3TokenAmount;

  //     // Create lock for newUser
  //     vm.prank(sVars.user3);
  //     sVars.vars.tokenId = ve.createLock(sVars.vars.tokenAddresses, sVars.vars.tokenAmounts, sVars.vars.durations);

  //     emit log_named_uint("block timestamp", block.timestamp);
  //     // Wait for a few days to simulate the passage of time
  //     vm.warp(block.timestamp + 2 days);
  //     emit log_named_uint("block timestamp after 2 days", block.timestamp);

  //     sVars.stakedBalanceUser1 = ve.s_userBalanceStrategy(sVars.user1, stakingStrategy);
  //     sVars.stakedBalanceUser2 = ve.s_userBalanceStrategy(sVars.user2, stakingStrategy);
  //     sVars.stakedBalanceUser3 = ve.s_userBalanceStrategy(sVars.user3, stakingStrategy);
  //     sVars.totalStaked = ve.s_totalSupplyStrategy(stakingStrategy);

  //     emit log_named_uint("User1 Staked Balance", sVars.stakedBalanceUser1);
  //     emit log_named_uint("User2 Staked Balance", sVars.stakedBalanceUser2);
  //     emit log_named_uint("User3 Staked Balance", sVars.stakedBalanceUser3);
  //     emit log_named_uint("Total Staked Balance", sVars.totalStaked);

  //     // Assert that user1's staked balance matches the token amount
  //     assertEq(sVars.stakedBalanceUser1, sVars.user1TokenAmount, "User1 staked balance does not match the token amount");
  //     // Assert that user2's staked balance matches the token amount
  //     assertEq(sVars.stakedBalanceUser2, sVars.user2TokenAmount, "User2 staked balance does not match the token amount");

  //     // Assert that the total staked balance includes both users' staked amounts
  //     assertEq(
  //       sVars.totalStaked,
  //       sVars.user1TokenAmount + sVars.user2TokenAmount + sVars.user3TokenAmount,
  //       "Total staked balance does not include both users' staked amounts"
  //     );

  //     // Check other staking parameters
  //     sVars.rewardRate = stakingStrategy.rewardRate();
  //     sVars.periodFinish = stakingStrategy.periodFinish();
  //     sVars.rewardPerTokenStored = ve.rewardPerToken(stakingStrategy);
  //     sVars.lastUpdateTime = ve.s_lastUpdateTime(stakingStrategy);

  //     emit log_named_uint("Reward Rate", sVars.rewardRate);
  //     emit log_named_uint("Period Finish", sVars.periodFinish);
  //     emit log_named_uint("Reward Per Token Stored", sVars.rewardPerTokenStored);
  //     emit log_named_uint("Last Update Time", sVars.lastUpdateTime);

  //     // Assert that the reward rate is greater than zero
  //     assertGt(sVars.rewardRate, 0, "Reward rate should be greater than zero");

  //     // Check user1 earnings in veION contract
  //     sVars.user1Earnings = ve.earned(sVars.user1, stakingStrategy);
  //     emit log_named_uint("User1 Earnings", sVars.user1Earnings);

  //     // Assert that user1's earnings are greater than zero
  //     assertGt(sVars.user1Earnings, 0, "User1 earnings should be greater than zero");

  //     // Check user2 earnings in veION contract
  //     sVars.user2Earnings = ve.earned(sVars.user2, stakingStrategy);
  //     emit log_named_uint("User2 Earnings", sVars.user2Earnings);

  //     // Check user2 earnings in veION contract
  //     sVars.user3Earnings = ve.earned(sVars.user3, stakingStrategy);
  //     emit log_named_uint("User3 Earnings", sVars.user3Earnings);

  //     // Assert that user2's earnings are greater than zero
  //     assertGt(sVars.user2Earnings, 0, "User2 earnings should be greater than zero");

  //     // Check veION earnings in IStakingRewards
  //     sVars.veIONEarnings = IStakingRewards(0x8EE410cC13948e7e684ebACb36b552e2c2A125fC).earned(address(ve));
  //     emit log_named_uint("veION Earnings", sVars.veIONEarnings);

  //     // Assert that the veION earnings are greater than zero
  //     assertGt(sVars.veIONEarnings, 0, "veION earnings should be greater than zero");

  //     // Attempt to claim emissions for a specific token address
  //     address tokenAddress = address(sVars.real5050IonModeVelo); // Replace with the actual token address
  //     address rewardToken = IStakingRewards(0x8EE410cC13948e7e684ebACb36b552e2c2A125fC).rewardToken();

  //     vm.prank(sVars.user1);
  //     ve.claimEmissions(tokenAddress);
  //     vm.prank(sVars.user2);
  //     ve.claimEmissions(tokenAddress);

  //     emit log(
  //       "===========================================================AFTER CLAIM==========================================================="
  //     );

  //     sVars.user1RewardTokenBalance = IERC20(rewardToken).balanceOf(sVars.user1);
  //     emit log_named_uint("User1 Reward Token Balance", sVars.user1RewardTokenBalance);

  //     sVars.user2RewardTokenBalance = IERC20(rewardToken).balanceOf(sVars.user2);
  //     emit log_named_uint("User2 Reward Token Balance", sVars.user2RewardTokenBalance);

  //     sVars.user3RewardTokenBalance = IERC20(rewardToken).balanceOf(sVars.user3);
  //     emit log_named_uint("User3 Reward Token Balance", sVars.user3RewardTokenBalance);

  //     emit log_named_uint("VE Reward Token Balance", IERC20(rewardToken).balanceOf(address(ve)));

  //     // Assert that user1's reward token balance is greater than zero
  //     assertGt(sVars.user1RewardTokenBalance, 0, "User1 reward token balance should be greater than zero");

  //     // Assert that user2's reward token balance is greater than zero
  //     assertGt(sVars.user2RewardTokenBalance, 0, "User2 reward token balance should be greater than zero");

  //     // Check the updated earnings for user1 after claiming emissions
  //     sVars.user1EarningsAfterClaim = ve.earned(sVars.user1, stakingStrategy);
  //     emit log_named_uint("User1 Earnings After Claim", sVars.user1EarningsAfterClaim);

  //     // Check the updated earnings for user2 after claiming emissions
  //     sVars.user2EarningsAfterClaim = ve.earned(sVars.user2, stakingStrategy);
  //     emit log_named_uint("User2 Earnings After Claim", sVars.user2EarningsAfterClaim);

  //     // Check the updated earnings for user2 after claiming emissions
  //     sVars.user3EarningsAfterClaim = ve.earned(sVars.user3, stakingStrategy);
  //     emit log_named_uint("User3 Earnings After Claim", sVars.user3EarningsAfterClaim);

  //     // Check the updated veION earnings in IStakingRewards after claiming emissions
  //     sVars.veIONEarningsAfterClaim = IStakingRewards(0x8EE410cC13948e7e684ebACb36b552e2c2A125fC).earned(address(ve));
  //     emit log_named_uint("veION Earnings After Claim", sVars.veIONEarningsAfterClaim);

  //     // Wait for half a day
  //     vm.warp(block.timestamp + 1 days);

  //     // Check the updated earnings for user1 after 2 days
  //     sVars.user1Earnings = ve.earned(sVars.user1, stakingStrategy);
  //     emit log_named_uint("User1 Earnings After 1 Day", sVars.user1Earnings);

  //     // Check the updated earnings for user2 after 2 days
  //     sVars.user2Earnings = ve.earned(sVars.user2, stakingStrategy);
  //     emit log_named_uint("User2 Earnings After 1 Day", sVars.user2Earnings);

  //     // Check the updated earnings for user2 after 2 days
  //     sVars.user3Earnings = ve.earned(sVars.user3, stakingStrategy);
  //     emit log_named_uint("User3 Earnings After 1 Day", sVars.user3Earnings);

  //     // Check the updated veION earnings in IStakingRewards after 2 days
  //     sVars.veIONEarnings = IStakingRewards(0x8EE410cC13948e7e684ebACb36b552e2c2A125fC).earned(address(ve));
  //     emit log_named_uint("veION Earnings After 1 Day", sVars.veIONEarnings);

  //     // Assert that user1's earnings are greater than zero after 2 days
  //     assertGt(sVars.user1Earnings, 0, "User1 earnings should be greater than zero after 1 days");

  //     // Assert that user2's earnings are greater than zero after 2 days
  //     assertGt(sVars.user2Earnings, 0, "User2 earnings should be greater than zero after 1 days");

  //     // Assert that the veION earnings are greater than zero after 2 days
  //     assertGt(sVars.veIONEarnings, 0, "veION earnings should be greater than zero after 1 days");
  //   }

  // function testRewardsConsistency() public fork(MODE_MAINNET) {
  //   TestVars memory vars;
  //   IveION.LpTokenType lpType = IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE;

  //   vars.user = address(0x7890);
  //   vars.amount = 1000 * 10 ** 18; // 1000 tokens

  //   // Mint and approve tokens for the user
  //   modeVelodrome5050IonMode.mint(vars.user, vars.amount);
  //   vm.prank(vars.user);
  //   modeVelodrome5050IonMode.approve(address(ve), vars.amount);

  //   // Create lock in veION
  //   vars.tokenAddresses = new address[](1);
  //   vars.tokenAddresses[0] = address(modeVelodrome5050IonMode);
  //   vars.tokenAmounts = new uint256[](1);
  //   vars.tokenAmounts[0] = vars.amount;
  //   vars.durations = new uint256[](1);
  //   vars.durations[0] = 52 weeks; // 1 year

  //   vm.prank(vars.user);
  //   vars.tokenId = ve.createLock(vars.tokenAddresses, vars.tokenAmounts, vars.durations);

  //   // Check rewards in veION
  //   vm.warp(block.timestamp + 1 weeks);
  //   uint256 veIONRewards = ve.earned(vars.user, stakingStrategy);
  //   emit log_named_uint("Rewards from veION", veIONRewards);

  //   // Stake directly in the staking contract
  //   modeVelodrome5050IonMode.mint(vars.user, vars.amount);
  //   vm.prank(vars.user);
  //   modeVelodrome5050IonMode.approve(address(stakingStrategy), vars.amount);

  //   vm.prank(vars.user);
  //   stakingStrategy.stake(vars.amount);

  //   // Check rewards in the staking contract
  //   vm.warp(block.timestamp + 1 weeks);
  //   uint256 directStakingRewards = stakingStrategy.earned(vars.user);
  //   emit log_named_uint("Rewards from direct staking", directStakingRewards);

  //   // Assert that the rewards are the same
  //   assertEq(veIONRewards, directStakingRewards, "Rewards from veION should match direct staking rewards");
  // }
}
