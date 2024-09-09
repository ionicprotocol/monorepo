// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;
import { MockERC20 } from "solmate/test/utils/mocks/MockERC20.sol";
import "../config/BaseTest.t.sol";
import "../../veION/veION.sol";
import "../../veION/IveION.sol";
import "../../veION/stake/IStakeStrategy.sol";
import "../../veION/stake/VeloIonModeStakingModeReward.sol";
import "../../veION/stake/IStakingRewards.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract VotingEscrowNFTTest is BaseTest {
  veION ve;
  MockERC20 modeVelodrome5050IonMode;
  MockERC20 modeBalancer8020IonEth;
  MockERC20 baseAerodrome5050IonWstEth;
  MockERC20 baseBalancer8020IonEth;
  MockERC20 optimismVelodrome5050IonOp;
  MockERC20 optimismBalancer8020IonEth;
  uint256 internal constant WEEK = 1 weeks;

  function afterForkSetUp() internal override {
    super.afterForkSetUp();
    ve = new veION();
    ve.initialize();
    modeVelodrome5050IonMode = new MockERC20("Mode_Velodrome_5050_ION_MODE", "MV5050", 18);
    modeBalancer8020IonEth = new MockERC20("Mode_Balancer_8020_ION_ETH", "MB8020", 18);
    baseAerodrome5050IonWstEth = new MockERC20("Base_Aerodrome_5050_ION_wstETH", "BA5050", 18);
    baseBalancer8020IonEth = new MockERC20("Base_Balancer_8020_ION_ETH", "BB8020", 18);
    optimismVelodrome5050IonOp = new MockERC20("Optimism_Velodrome_5050_ION_OP", "OV5050", 18);
    optimismBalancer8020IonEth = new MockERC20("Optimism_Balancer_8020_ION_ETH", "OB8020", 18);

    address[] memory whitelistedTokens = new address[](6);
    bool[] memory isWhitelistedTokens = new bool[](6);
    whitelistedTokens[0] = address(modeVelodrome5050IonMode);
    whitelistedTokens[1] = address(modeBalancer8020IonEth);
    whitelistedTokens[2] = address(baseAerodrome5050IonWstEth);
    whitelistedTokens[3] = address(baseBalancer8020IonEth);
    whitelistedTokens[4] = address(optimismVelodrome5050IonOp);
    whitelistedTokens[5] = address(optimismBalancer8020IonEth);
    for (uint i = 0; i < 6; i++) {
      isWhitelistedTokens[i] = true;
    }
    ve.whitelistTokens(whitelistedTokens, isWhitelistedTokens);

    ve.setLpTokenType(address(modeVelodrome5050IonMode), IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE);
    ve.setLpTokenType(address(modeBalancer8020IonEth), IveION.LpTokenType.Mode_Balancer_8020_ION_ETH);
    ve.setLpTokenType(address(baseAerodrome5050IonWstEth), IveION.LpTokenType.Base_Aerodrome_5050_ION_wstETH);
    ve.setLpTokenType(address(baseBalancer8020IonEth), IveION.LpTokenType.Base_Balancer_8020_ION_ETH);
    ve.setLpTokenType(address(optimismVelodrome5050IonOp), IveION.LpTokenType.Optimism_Velodrome_5050_ION_OP);
    ve.setLpTokenType(address(optimismBalancer8020IonEth), IveION.LpTokenType.Optimism_Balancer_8020_ION_ETH);

    ve.setTeam(address(this));
  }

  struct TestVars {
    address user;
    uint256 amount;
    address[] tokenAddresses;
    uint256[] tokenAmounts;
    uint256[] durations;
    uint256 tokenId;
    uint256 userBalanceAfterLock;
    uint256 veIONBalance;
    address lb_tokenAddress;
    int128 lb_amount;
    uint256 lb_end;
    bool lb_isPermanent;
    uint256 totalSupply;
    uint256 votingPower;
    uint256 currentEpoch;
    uint256 userEpoch;
    int128 userBias;
    int128 userSlope;
    uint256 userTs;
    uint256 userBlk;
    uint256 userPermanent;
    int128 globalBias;
    int128 globalSlope;
    uint256 globalTs;
    uint256 globalBlk;
    uint256 globalPermanentLockBalance;
    uint256 unlockTime;
    int128 slopeChange;
    uint256 firstTokenId;
    uint256 secondTokenId;
    uint256 firstTs;
    uint256 firstBlk;
    uint256 userEpoch2;
  }

  function testCreateLockVE() public fork(MODE_MAINNET) {
    TestVars memory vars;
    IveION.LpTokenType lpType = IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE;

    vars.user = address(0x1234);
    vars.amount = 1000 * 10 ** 18; // 1000 tokens
    modeVelodrome5050IonMode.mint(vars.user, vars.amount);

    vm.prank(vars.user);
    modeVelodrome5050IonMode.approve(address(ve), vars.amount);

    vars.tokenAddresses = new address[](1);
    vars.tokenAddresses[0] = address(modeVelodrome5050IonMode);

    vars.tokenAmounts = new uint256[](1);
    vars.tokenAmounts[0] = vars.amount;

    vars.durations = new uint256[](1);
    vars.durations[0] = 52 weeks; // 1 year

    vm.prank(vars.user);
    vars.tokenId = ve.createLock(vars.tokenAddresses, vars.tokenAmounts, vars.durations);

    vars.userBalanceAfterLock = modeVelodrome5050IonMode.balanceOf(vars.user);
    console.log("User's token balance after lock:", vars.userBalanceAfterLock);

    vars.veIONBalance = modeVelodrome5050IonMode.balanceOf(address(ve));
    console.log("veION contract token balance:", vars.veIONBalance);

    IveION.LockedBalance memory locked = ve.getUserLock(vars.tokenId, lpType);

    emit log_named_address("Token address", locked.tokenAddress);
    emit log_named_uint("Amount", uint256(int256(locked.amount)));
    emit log_named_uint("End time", locked.end);
    emit log("--------------------");

    assertEq(vars.tokenId, 1, "First tokenId should be 1");
    assertEq(ve.ownerOf(vars.tokenId), vars.user, "Lock should be created for the user");
    assertEq(ve.s_supply(lpType), vars.tokenAmounts[0], "supply should be token amount");
    assertEq(ve.s_epoch(lpType), 1, "epoch should be 1");

    uint256 epoch = ve.s_epoch(lpType);
    (vars.globalBias, vars.globalSlope, vars.globalTs, vars.globalBlk, vars.globalPermanentLockBalance) = ve
      .s_pointHistory(epoch, lpType);
    assertGt(vars.globalBias, 0, "Global point bias should be greater than 0");
    assertGt(vars.globalSlope, 0, "Global point slope should be greater than 0");
    assertEq(vars.globalTs, block.timestamp, "Global point timestamp should be current block timestamp");
    assertEq(vars.globalBlk, block.number, "Global point block number should be current block number");

    vars.userEpoch = ve.s_userPointEpoch(vars.tokenId, lpType);
    assertEq(vars.userEpoch, 1, "User point epoch should be 1");

    (vars.userBias, vars.userSlope, vars.userTs, vars.userBlk, vars.userPermanent) = ve.s_userPointHistory(
      vars.tokenId,
      vars.userEpoch,
      lpType
    );
    assertGt(vars.userBias, 0, "User point bias should be greater than 0");
    assertGt(vars.userSlope, 0, "User point slope should be greater than 0");
    assertEq(vars.userTs, block.timestamp, "User point timestamp should be current block timestamp");
    assertEq(vars.userBlk, block.number, "User point block number should be current block number");
    assertEq(vars.userPermanent, 0, "User point permanent lock should be 0");

    vars.unlockTime = ((block.timestamp + vars.durations[0]) / WEEK) * WEEK;
    vars.slopeChange = ve.s_slopeChanges(vars.unlockTime, lpType);
    assertLt(vars.slopeChange, 0, "Slope change should be negative");

    emit log_named_int("Global Point - bias", vars.globalBias);
    emit log_named_int("Global Point - slope", vars.globalSlope);
    emit log_named_uint("Global Point - timestamp", vars.globalTs);
    emit log_named_uint("Global Point - block", vars.globalBlk);
    emit log_named_uint("Global Point - permanent lock balance", vars.globalPermanentLockBalance);
    emit log_named_uint("User Point Epoch", vars.userEpoch);
    emit log_named_int("User Point - bias", vars.userBias);
    emit log_named_int("User Point - slope", vars.userSlope);
    emit log_named_uint("User Point - timestamp", vars.userTs);
    emit log_named_uint("User Point - block", vars.userBlk);
    emit log_named_uint("User Point - permanent", vars.userPermanent);
    emit log_named_int("Slope Change at unlock time", vars.slopeChange);
  }

  function testCreateLockMultipleVE() public fork(MODE_MAINNET) {
    TestVars memory vars;

    // Create a user
    vars.user = address(0x1234);

    // Mint ModeVelodrome tokens to the user
    vars.amount = 1000 * 10 ** 18; // 1000 tokens
    modeVelodrome5050IonMode.mint(vars.user, vars.amount);
    modeBalancer8020IonEth.mint(vars.user, vars.amount);
    baseAerodrome5050IonWstEth.mint(vars.user, vars.amount);
    baseBalancer8020IonEth.mint(vars.user, vars.amount);
    optimismVelodrome5050IonOp.mint(vars.user, vars.amount);
    optimismBalancer8020IonEth.mint(vars.user, vars.amount);

    // Approve veION contract to spend user's tokens
    vm.startPrank(vars.user);
    modeVelodrome5050IonMode.approve(address(ve), vars.amount);
    modeBalancer8020IonEth.approve(address(ve), vars.amount);
    baseAerodrome5050IonWstEth.approve(address(ve), vars.amount);
    baseBalancer8020IonEth.approve(address(ve), vars.amount);
    optimismVelodrome5050IonOp.approve(address(ve), vars.amount);
    optimismBalancer8020IonEth.approve(address(ve), vars.amount);
    vm.stopPrank();

    // Prepare parameters for createLock
    vars.tokenAddresses = new address[](6);
    vars.tokenAddresses[0] = address(modeVelodrome5050IonMode);
    vars.tokenAddresses[1] = address(modeBalancer8020IonEth);
    vars.tokenAddresses[2] = address(baseAerodrome5050IonWstEth);
    vars.tokenAddresses[3] = address(baseBalancer8020IonEth);
    vars.tokenAddresses[4] = address(optimismVelodrome5050IonOp);
    vars.tokenAddresses[5] = address(optimismBalancer8020IonEth);

    vars.tokenAmounts = new uint256[](6);
    vars.tokenAmounts[0] = vars.amount;
    vars.tokenAmounts[1] = vars.amount;
    vars.tokenAmounts[2] = vars.amount;
    vars.tokenAmounts[3] = vars.amount;
    vars.tokenAmounts[4] = vars.amount;
    vars.tokenAmounts[5] = vars.amount;

    vars.durations = new uint256[](6);
    vars.durations[0] = 52 weeks;
    vars.durations[1] = 52 weeks;
    vars.durations[2] = 52 weeks;
    vars.durations[3] = 52 weeks;
    vars.durations[4] = 52 weeks;
    vars.durations[5] = 52 weeks;

    // Create lock for the user
    vm.prank(vars.user);
    vars.tokenId = ve.createLock(vars.tokenAddresses, vars.tokenAmounts, vars.durations);

    // Assert the lock was created successfully
    assertEq(ve.ownerOf(vars.tokenId), vars.user, "Lock should be created for the user");

    // Display relevant state changes after creating a lock
    IveION.LpTokenType[6] memory lpTokenTypes = [
      IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE,
      IveION.LpTokenType.Mode_Balancer_8020_ION_ETH,
      IveION.LpTokenType.Base_Aerodrome_5050_ION_wstETH,
      IveION.LpTokenType.Base_Balancer_8020_ION_ETH,
      IveION.LpTokenType.Optimism_Velodrome_5050_ION_OP,
      IveION.LpTokenType.Optimism_Balancer_8020_ION_ETH
    ];

    for (uint i = 0; i < lpTokenTypes.length; i++) {
      IveION.LpTokenType lpType = lpTokenTypes[i];

      console.log("Testing for LP Token Type:", uint(lpType));

      // Test user point history
      vars.userEpoch = ve.s_userPointEpoch(vars.tokenId, lpType);
      assertEq(vars.userEpoch, 1, "User point epoch should be 1");

      (vars.userBias, vars.userSlope, vars.userTs, vars.userBlk, vars.userPermanent) = ve.s_userPointHistory(
        vars.tokenId,
        vars.userEpoch,
        lpType
      );
      assertGt(vars.userBias, 0, "User point bias should be greater than 0");
      assertGt(vars.userSlope, 0, "User point slope should be greater than 0");
      assertEq(vars.userTs, block.timestamp, "User point timestamp should be current block timestamp");
      assertEq(vars.userBlk, block.number, "User point block number should be current block number");
      assertEq(vars.userPermanent, 0, "User point permanent lock should be 0");

      // Test global point history
      vars.currentEpoch = ve.s_epoch(lpType);
      assertEq(vars.currentEpoch, 1, "Global epoch should be 1");

      (vars.globalBias, vars.globalSlope, vars.globalTs, vars.globalBlk, vars.globalPermanentLockBalance) = ve
        .s_pointHistory(vars.currentEpoch, lpType);
      assertGt(vars.globalBias, 0, "Global point bias should be greater than 0");
      assertGt(vars.globalSlope, 0, "Global point slope should be greater than 0");
      assertEq(vars.globalTs, block.timestamp, "Global point timestamp should be current block timestamp");
      assertEq(vars.globalBlk, block.number, "Global point block number should be current block number");
      assertEq(vars.globalPermanentLockBalance, 0, "Global permanent lock balance should be 0");

      // Test supply
      vars.totalSupply = ve.s_supply(lpType);
      assertEq(vars.totalSupply, vars.amount, "Supply should be equal to the locked amount");

      // Display results
      console.log("User Point History:");
      console.log("  Bias:", uint256(int256(vars.userBias)));
      console.log("  Slope:", uint256(int256(vars.userSlope)));
      console.log("  Timestamp:", vars.userTs);
      console.log("  Block:", vars.userBlk);
      console.log("  Permanent:", vars.userPermanent);

      console.log("Global Point History:");
      console.log("  Bias:", uint256(int256(vars.globalBias)));
      console.log("  Slope:", uint256(int256(vars.globalSlope)));
      console.log("  Timestamp:", vars.globalTs);
      console.log("  Block:", vars.globalBlk);
      console.log("  Permanent Lock Balance:", vars.globalPermanentLockBalance);

      console.log("User Epoch:", vars.userEpoch);
      console.log("Global Epoch:", vars.currentEpoch);
      console.log("Supply:", vars.totalSupply);
      console.log("--------------------");
    }
  }

  function testCreateMultipleLocksInSameWeek() public fork(MODE_MAINNET) {
    TestVars memory vars;
    IveION.LpTokenType lpType = IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE;

    vars.user = address(0x5678);
    vars.amount = 500 * 10 ** 18; // 500 tokens

    // Mint and approve tokens for the user
    modeVelodrome5050IonMode.mint(vars.user, vars.amount * 2); // Mint double the amount for two locks

    vm.prank(vars.user);
    modeVelodrome5050IonMode.approve(address(ve), vars.amount * 2);

    // First lock
    vars.tokenAddresses = new address[](1);
    vars.tokenAddresses[0] = address(modeVelodrome5050IonMode);

    vars.tokenAmounts = new uint256[](1);
    vars.tokenAmounts[0] = vars.amount;

    vars.durations = new uint256[](1);
    vars.durations[0] = 52 weeks; // 1 year

    vm.prank(vars.user);
    vars.firstTokenId = ve.createLock(vars.tokenAddresses, vars.tokenAmounts, vars.durations);

    console.log("lock interrupt");
    // Second lock within the same week
    // Wait a few days
    vars.firstTs = block.timestamp;
    vars.firstBlk = block.number;
    vm.warp(block.timestamp + 1 days);
    vm.prank(vars.user);
    vars.secondTokenId = ve.createLock(vars.tokenAddresses, vars.tokenAmounts, vars.durations);

    // Check balances and states after locks
    vars.userBalanceAfterLock = modeVelodrome5050IonMode.balanceOf(vars.user);
    emit log_named_uint("User's token balance after locks", vars.userBalanceAfterLock);

    vars.veIONBalance = modeVelodrome5050IonMode.balanceOf(address(ve));
    emit log_named_uint("veION contract token balance", vars.veIONBalance);

    // Verify first lock
    IveION.LockedBalance memory firstLocked = ve.getUserLock(vars.firstTokenId, lpType);
    assertEq(firstLocked.amount, int128(uint128(vars.amount)), "First lock amount should be correct");

    // Verify second lock
    IveION.LockedBalance memory secondLocked = ve.getUserLock(vars.secondTokenId, lpType);
    assertEq(secondLocked.amount, int128(uint128(vars.amount)), "Second lock amount should be correct");

    // Verify total supply
    vars.totalSupply = ve.s_supply(lpType);
    assertEq(vars.totalSupply, vars.amount * 2, "Total supply should be the sum of both locks");

    // Verify epochs
    uint256 epoch = ve.s_epoch(lpType);
    assertEq(epoch, 2, "Global epoch should be 2");

    // Verify global point history
    (vars.globalBias, vars.globalSlope, vars.globalTs, vars.globalBlk, vars.globalPermanentLockBalance) = ve
      .s_pointHistory(epoch, lpType);
    assertGt(vars.globalBias, 0, "Global point bias should be greater than 0");
    assertGt(vars.globalSlope, 0, "Global point slope should be greater than 0");
    assertEq(vars.globalTs, block.timestamp, "Global point timestamp should be current block timestamp");
    assertEq(vars.globalBlk, block.number, "Global point block number should be current block number");
    assertEq(vars.globalPermanentLockBalance, 0, "Global permanent lock balance should be 0");

    // Verify user point history for the first lock
    vars.userEpoch = ve.s_userPointEpoch(vars.firstTokenId, lpType);
    (vars.userBias, vars.userSlope, vars.userTs, vars.userBlk, vars.userPermanent) = ve.s_userPointHistory(
      vars.firstTokenId,
      vars.userEpoch,
      lpType
    );
    assertGt(vars.userBias, 0, "User point bias should be greater than 0");
    assertGt(vars.userSlope, 0, "User point slope should be greater than 0");
    assertEq(vars.userTs, vars.firstTs, "User point timestamp should be current block timestamp");
    assertEq(vars.userBlk, vars.firstBlk, "User point block number should be current block number");
    assertEq(vars.userPermanent, 0, "User point permanent lock should be 0");

    // Verify user point history for the second lock
    uint256 userEpoch2 = ve.s_userPointEpoch(vars.secondTokenId, lpType);
    vars.userEpoch = ve.s_userPointEpoch(vars.secondTokenId, lpType);
    (vars.userBias, vars.userSlope, vars.userTs, vars.userBlk, vars.userPermanent) = ve.s_userPointHistory(
      vars.secondTokenId,
      userEpoch2,
      lpType
    );
    assertGt(vars.userBias, 0, "User point bias should be greater than 0");
    assertGt(vars.userSlope, 0, "User point slope should be greater than 0");
    assertEq(vars.userTs, block.timestamp, "User point timestamp should be current block timestamp");
    assertEq(vars.userBlk, block.number, "User point block number should be current block number");
    assertEq(vars.userPermanent, 0, "User point permanent lock should be 0");

    // Verify slope changes
    vars.unlockTime = ((block.timestamp + vars.durations[0]) / WEEK) * WEEK;
    vars.slopeChange = ve.s_slopeChanges(vars.unlockTime, lpType);
    assertLt(vars.slopeChange, 0, "Slope change should be negative");

    // Display results
    emit log_named_uint("First Lock - Token ID", vars.firstTokenId);
    emit log_named_uint("Second Lock - Token ID", vars.secondTokenId);
    emit log_named_uint("Total Supply", vars.totalSupply);
    emit log_named_int("Global Point - Bias", vars.globalBias);
    emit log_named_int("Global Point - Slope", vars.globalSlope);
    emit log_named_uint("Global Point - Timestamp", vars.globalTs);
    emit log_named_uint("Global Point - Block", vars.globalBlk);
    emit log_named_uint("Global Point - Permanent Lock Balance", vars.globalPermanentLockBalance);
    emit log_named_int("User Point - Bias", vars.userBias);
    emit log_named_int("User Point - Slope", vars.userSlope);
    emit log_named_uint("User Point - Timestamp", vars.userTs);
    emit log_named_uint("User Point - Block", vars.userBlk);
    emit log_named_uint("User Point - Permanent", vars.userPermanent);
    emit log_named_uint("User Point Epoch", vars.userEpoch);
    emit log_named_int("Slope Change", vars.slopeChange);
    emit log("--------------------");
  }

  function testIncreaseLockAmount() public fork(MODE_MAINNET) {
    TestVars memory vars;
    IveION.LpTokenType lpType = IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE;

    // Create a user
    vars.user = address(0x5678);

    // Mint ModeVelodrome tokens to the user
    vars.amount = 1000 * 10 ** 18; // 1000 tokens
    modeVelodrome5050IonMode.mint(vars.user, vars.amount);

    // Approve veION contract to spend user's tokens
    vm.prank(vars.user);
    modeVelodrome5050IonMode.approve(address(ve), vars.amount);

    // Prepare parameters for createLock
    vars.tokenAddresses = new address[](1);
    vars.tokenAddresses[0] = address(modeVelodrome5050IonMode);

    vars.tokenAmounts = new uint256[](1);
    vars.tokenAmounts[0] = vars.amount;

    vars.durations = new uint256[](1);
    vars.durations[0] = 52 weeks; // 1 year

    // Create lock for the user
    vm.prank(vars.user);
    vars.tokenId = ve.createLock(vars.tokenAddresses, vars.tokenAmounts, vars.durations);

    // Assert the lock was created successfully
    assertEq(ve.ownerOf(vars.tokenId), vars.user, "Lock should be created for the user");

    // Mint additional tokens to the user for increasing the lock amount
    uint256 additionalAmount = 500 * 10 ** 18; // 500 tokens
    modeVelodrome5050IonMode.mint(vars.user, additionalAmount);

    // Approve veION contract to spend user's additional tokens
    vm.prank(vars.user);
    modeVelodrome5050IonMode.approve(address(ve), additionalAmount);

    // Increase the lock amount
    vm.prank(vars.user);
    ve.increaseAmount(address(modeVelodrome5050IonMode), vars.tokenId, additionalAmount);

    // Verify the lock amount has increased
    IveION.LockedBalance memory locked = ve.getUserLock(vars.tokenId, lpType);
    assertEq(uint256(int256(locked.amount)), vars.amount + additionalAmount, "Lock amount should be increased");

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
    IveION.LpTokenType lpType = IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE;

    // Create a user
    vars.user = address(0x5678);

    // Mint ModeVelodrome tokens to the user
    vars.amount = 1000 * 10 ** 18; // 1000 tokens
    modeVelodrome5050IonMode.mint(vars.user, vars.amount);

    // Approve veION contract to spend user's tokens
    vm.prank(vars.user);
    modeVelodrome5050IonMode.approve(address(ve), vars.amount);

    // Prepare parameters for createLock
    vars.tokenAddresses = new address[](1);
    vars.tokenAddresses[0] = address(modeVelodrome5050IonMode);

    vars.tokenAmounts = new uint256[](1);
    vars.tokenAmounts[0] = vars.amount;

    vars.durations = new uint256[](1);
    vars.durations[0] = 52 weeks; // 1 year

    // Create lock for the user
    vm.prank(vars.user);
    vars.tokenId = ve.createLock(vars.tokenAddresses, vars.tokenAmounts, vars.durations);

    // Assert the lock was created successfully
    assertEq(ve.ownerOf(vars.tokenId), vars.user, "Lock should be created for the user");

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

  function testWithdrawVE() public fork(MODE_MAINNET) {
    TestVars memory vars;
    IveION.LpTokenType lpType = IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE;

    // Create a user
    vars.user = address(0x5678);

    // Mint ModeVelodrome tokens to the user
    vars.amount = 1000 * 10 ** 18; // 1000 tokens
    modeVelodrome5050IonMode.mint(vars.user, vars.amount);

    // Approve veION contract to spend user's tokens
    vm.prank(vars.user);
    modeVelodrome5050IonMode.approve(address(ve), vars.amount);

    // Prepare parameters for createLock
    vars.tokenAddresses = new address[](1);
    vars.tokenAddresses[0] = address(modeVelodrome5050IonMode);

    vars.tokenAmounts = new uint256[](1);
    vars.tokenAmounts[0] = vars.amount;

    vars.durations = new uint256[](1);
    vars.durations[0] = 52 weeks; // 1 year

    // Create lock for the user
    vm.prank(vars.user);
    vars.tokenId = ve.createLock(vars.tokenAddresses, vars.tokenAmounts, vars.durations);

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

    // Verify the latest user point history for the lock
    vars.userEpoch = ve.s_userPointEpoch(vars.tokenId, lpType);
    (vars.userBias, vars.userSlope, vars.userTs, vars.userBlk, vars.userPermanent) = ve.s_userPointHistory(
      vars.tokenId,
      vars.userEpoch,
      lpType
    );
    assertEq(vars.userBias, 0, "User point bias should be zero after withdrawal");
    assertEq(vars.userSlope, 0, "User point slope should be zero after withdrawal");
    assertEq(vars.userTs, block.timestamp, "User point timestamp should be current block timestamp");
    assertEq(vars.userBlk, block.number, "User point block number should be current block number");
    assertEq(vars.userPermanent, 0, "User point permanent lock should be zero after withdrawal");

    // Verify the latest global point history
    uint256 epoch = ve.s_epoch(lpType);
    (vars.globalBias, vars.globalSlope, vars.globalTs, vars.globalBlk, vars.globalPermanentLockBalance) = ve
      .s_pointHistory(epoch, lpType);
    assertEq(vars.globalBias, 0, "Global point bias should be zero after withdrawal");
    assertEq(vars.globalSlope, 0, "Global point slope should be zero after withdrawal");
    assertEq(vars.globalTs, block.timestamp, "Global point timestamp should be current block timestamp");
    assertEq(vars.globalBlk, block.number, "Global point block number should be current block number");
    assertEq(vars.globalPermanentLockBalance, 0, "Global permanent lock balance should be zero after withdrawal");

    // Display results
    emit log_named_uint("Token ID", vars.tokenId);
    emit log_named_uint("User Balance After Withdraw", userBalanceAfterWithdraw);
    emit log_named_uint("Lock Amount After Withdraw", uint256(int256(locked.amount)));
    emit log_named_uint("Lock End Time After Withdraw", locked.end);
  }

  function testMergeLocks() public fork(MODE_MAINNET) {
    TestVars memory vars;
    IveION.LpTokenType lpType = IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE;

    // Create a user
    vars.user = address(0x5678);

    // Mint ModeVelodrome tokens to the user
    vars.amount = 1000 * 10 ** 18; // 1000 tokens
    modeVelodrome5050IonMode.mint(vars.user, vars.amount * 2);

    // Approve veION contract to spend user's tokens
    vm.prank(vars.user);
    modeVelodrome5050IonMode.approve(address(ve), vars.amount * 2);

    // Prepare parameters for createLock
    vars.tokenAddresses = new address[](1);
    vars.tokenAddresses[0] = address(modeVelodrome5050IonMode);

    vars.tokenAmounts = new uint256[](1);
    vars.tokenAmounts[0] = vars.amount;

    vars.durations = new uint256[](1);
    vars.durations[0] = 52 weeks; // 1 year

    // Create first lock for the user
    vm.prank(vars.user);
    vars.firstTokenId = ve.createLock(vars.tokenAddresses, vars.tokenAmounts, vars.durations);

    // Create second lock for the user
    vm.prank(vars.user);
    vars.secondTokenId = ve.createLock(vars.tokenAddresses, vars.tokenAmounts, vars.durations);

    // Merge the locks
    vm.prank(vars.user);
    ve.merge(address(modeVelodrome5050IonMode), vars.firstTokenId, vars.secondTokenId);

    // Verify the merged lock
    IveION.LockedBalance memory mergedLock = ve.getUserLock(vars.secondTokenId, lpType);
    assertEq(
      uint256(int256(mergedLock.amount)),
      vars.amount * 2,
      "Merged lock amount should be the sum of the original locks"
    );

    // Verify the first lock is burned
    IveION.LockedBalance memory burnedLock = ve.getUserLock(vars.firstTokenId, lpType);
    assertEq(uint256(int256(burnedLock.amount)), 0, "First lock amount should be zero after merge");
    assertEq(burnedLock.end, 0, "First lock end time should be zero after merge");
  }

  function testSplitLock() public fork(MODE_MAINNET) {
    TestVars memory vars;
    IveION.LpTokenType lpType = IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE;

    // Create a user
    vars.user = address(0x5678);

    ve.toggleSplit(vars.user, true);

    // Mint ModeVelodrome tokens to the user
    vars.amount = 1000 * 10 ** 18; // 1000 tokens
    modeVelodrome5050IonMode.mint(vars.user, vars.amount);

    // Approve veION contract to spend user's tokens
    vm.prank(vars.user);
    modeVelodrome5050IonMode.approve(address(ve), vars.amount);

    // Prepare parameters for createLock
    vars.tokenAddresses = new address[](1);
    vars.tokenAddresses[0] = address(modeVelodrome5050IonMode);

    vars.tokenAmounts = new uint256[](1);
    vars.tokenAmounts[0] = vars.amount;

    vars.durations = new uint256[](1);
    vars.durations[0] = 52 weeks; // 1 year

    // Create lock for the user
    vm.prank(vars.user);
    vars.tokenId = ve.createLock(vars.tokenAddresses, vars.tokenAmounts, vars.durations);

    // Split the lock
    uint256 splitAmount = vars.amount / 2;
    vm.prank(vars.user);
    (uint256 tokenId1, uint256 tokenId2) = ve.split(address(modeVelodrome5050IonMode), vars.tokenId, splitAmount);

    // Verify the split locks
    IveION.LockedBalance memory locked1 = ve.getUserLock(tokenId1, lpType);
    IveION.LockedBalance memory locked2 = ve.getUserLock(tokenId2, lpType);
    assertEq(uint256(int256(locked1.amount)), splitAmount, "First split lock amount should be half of the original");
    assertEq(uint256(int256(locked2.amount)), splitAmount, "Second split lock amount should be half of the original");
  }

  function testLockPermanent() public fork(MODE_MAINNET) {
    TestVars memory vars;
    IveION.LpTokenType lpType = IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE;

    // Create a user
    vars.user = address(0x5678);

    // Mint ModeVelodrome tokens to the user
    vars.amount = 1000 * 10 ** 18; // 1000 tokens
    modeVelodrome5050IonMode.mint(vars.user, vars.amount);

    // Approve veION contract to spend user's tokens
    vm.prank(vars.user);
    modeVelodrome5050IonMode.approve(address(ve), vars.amount);

    // Prepare parameters for createLock
    vars.tokenAddresses = new address[](1);
    vars.tokenAddresses[0] = address(modeVelodrome5050IonMode);

    vars.tokenAmounts = new uint256[](1);
    vars.tokenAmounts[0] = vars.amount;

    vars.durations = new uint256[](1);
    vars.durations[0] = 52 weeks; // 1 year

    // Create lock for the user
    vm.prank(vars.user);
    vars.tokenId = ve.createLock(vars.tokenAddresses, vars.tokenAmounts, vars.durations);

    // Lock the tokens permanently
    vm.prank(vars.user);
    ve.lockPermanent(address(modeVelodrome5050IonMode), vars.tokenId);

    // Verify the permanent lock
    IveION.LockedBalance memory locked = ve.getUserLock(vars.tokenId, lpType);
    assertEq(locked.isPermanent, true, "Lock should be permanent");
    assertEq(locked.end, 0, "Lock end time should be zero for permanent lock");

    // Verify the latest user point history for the lock
    vars.userEpoch = ve.s_userPointEpoch(vars.tokenId, lpType);
    (vars.userBias, vars.userSlope, vars.userTs, vars.userBlk, vars.userPermanent) = ve.s_userPointHistory(
      vars.tokenId,
      vars.userEpoch,
      lpType
    );
    assertEq(vars.userBias, 0, "User point bias should be zero for permanent lock");
    assertEq(vars.userSlope, 0, "User point slope should be zero for permanent lock");
    assertEq(vars.userTs, block.timestamp, "User point timestamp should be current block timestamp");
    assertEq(vars.userBlk, block.number, "User point block number should be current block number");
    assertEq(vars.userPermanent, uint256(int256(locked.amount)), "User point permanent lock should match lock amount");

    // Verify the latest global point history
    uint256 epoch = ve.s_epoch(lpType);
    (vars.globalBias, vars.globalSlope, vars.globalTs, vars.globalBlk, vars.globalPermanentLockBalance) = ve
      .s_pointHistory(epoch, lpType);
    assertEq(vars.globalBias, 0, "Global point bias should be zero for permanent lock");
    assertEq(vars.globalSlope, 0, "Global point slope should be zero for permanent lock");
    assertEq(vars.globalTs, block.timestamp, "Global point timestamp should be current block timestamp");
    assertEq(vars.globalBlk, block.number, "Global point block number should be current block number");
    assertEq(
      vars.globalPermanentLockBalance,
      uint256(int256(locked.amount)),
      "Global permanent lock balance should match lock amount"
    );
  }

  function testUnlockPermanent() public fork(MODE_MAINNET) {
    TestVars memory vars;
    IveION.LpTokenType lpType = IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE;

    // Create a user
    vars.user = address(0x5678);

    // Mint ModeVelodrome tokens to the user
    vars.amount = 1000 * 10 ** 18; // 1000 tokens
    modeVelodrome5050IonMode.mint(vars.user, vars.amount);

    // Approve veION contract to spend user's tokens
    vm.prank(vars.user);
    modeVelodrome5050IonMode.approve(address(ve), vars.amount);

    // Prepare parameters for createLock
    vars.tokenAddresses = new address[](1);
    vars.tokenAddresses[0] = address(modeVelodrome5050IonMode);

    vars.tokenAmounts = new uint256[](1);
    vars.tokenAmounts[0] = vars.amount;

    vars.durations = new uint256[](1);
    vars.durations[0] = 52 weeks; // 1 year

    // Create lock for the user
    vm.prank(vars.user);
    vars.tokenId = ve.createLock(vars.tokenAddresses, vars.tokenAmounts, vars.durations);

    // Lock the tokens permanently
    vm.prank(vars.user);
    ve.lockPermanent(address(modeVelodrome5050IonMode), vars.tokenId);

    // Unlock the permanent lock
    vm.prank(vars.user);
    ve.unlockPermanent(address(modeVelodrome5050IonMode), vars.tokenId);

    // Verify the lock is no longer permanent
    IveION.LockedBalance memory locked = ve.getUserLock(vars.tokenId, lpType);
    assertEq(locked.isPermanent, false, "Lock should no longer be permanent");
    assertGt(locked.end, block.timestamp, "Lock end time should be in the future");

    uint256 epoch = ve.s_epoch(lpType);

    // Display results
    emit log_named_uint("Token ID", vars.tokenId);
    emit log_named_uint("User Balance After Unlock", modeVelodrome5050IonMode.balanceOf(vars.user));
    emit log_named_uint("Lock Amount After Unlock", uint256(int256(locked.amount)));
    emit log_named_uint("Lock End Time After Unlock", locked.end);
    emit log_named_uint("User Point Epoch", vars.userEpoch);
    emit log_named_int("User Point - Bias", vars.userBias);
    emit log_named_int("User Point - Slope", vars.userSlope);
    emit log_named_uint("User Point - Timestamp", vars.userTs);
    emit log_named_uint("User Point - Block", vars.userBlk);
    emit log_named_uint("User Point - Permanent", vars.userPermanent);
    emit log_named_uint("Global Point Epoch", epoch);
    emit log_named_int("Global Point - Bias", vars.globalBias);
    emit log_named_int("Global Point - Slope", vars.globalSlope);
    emit log_named_uint("Global Point - Timestamp", vars.globalTs);
    emit log_named_uint("Global Point - Block", vars.globalBlk);
    emit log_named_uint("Global Point - Permanent Lock Balance", vars.globalPermanentLockBalance);
  }

  function testBoostOnLockCreationAndExtension() public fork(MODE_MAINNET) {
    TestVars memory vars;
    IveION.LpTokenType lpType = IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE;

    // Create a user
    vars.user = address(0x5678);

    // Mint ModeVelodrome tokens to the user
    vars.amount = 1000 * 10 ** 18; // 1000 tokens
    modeVelodrome5050IonMode.mint(vars.user, vars.amount);

    // Approve veION contract to spend user's tokens
    vm.prank(vars.user);
    modeVelodrome5050IonMode.approve(address(ve), vars.amount);

    // Prepare parameters for createLock
    vars.tokenAddresses = new address[](1);
    vars.tokenAddresses[0] = address(modeVelodrome5050IonMode);

    vars.tokenAmounts = new uint256[](1);
    vars.tokenAmounts[0] = vars.amount;

    vars.durations = new uint256[](1);
    vars.durations[0] = 54 weeks; // 1 year

    // Create lock for the user
    vm.prank(vars.user);
    vars.tokenId = ve.createLock(vars.tokenAddresses, vars.tokenAmounts, vars.durations);

    // Verify the boost after 1 year lock
    IveION.LockedBalance memory locked = ve.getUserLock(vars.tokenId, lpType);
    assertEq(locked.boost, 1.25 * 1 ether, "Boost should be 1.25 after 1 year lock");

    // Extend the lock for another year
    vars.durations[0] += 52 weeks; // 1 additional year
    vm.prank(vars.user);
    ve.increaseUnlockTime(address(modeVelodrome5050IonMode), vars.tokenId, vars.durations[0]);

    // Verify the boost after extending the lock to 2 years
    locked = ve.getUserLock(vars.tokenId, lpType);
    assertEq(locked.boost, 2 * 1 ether, "Boost should be 2 after extending lock to 2 years");

    // Display results
    emit log_named_uint("Token ID", vars.tokenId);
    emit log_named_uint("User Balance After Lock", modeVelodrome5050IonMode.balanceOf(vars.user));
    emit log_named_uint("Lock Amount", uint256(int256(locked.amount)));
    emit log_named_uint("Lock End Time", locked.end);
    emit log_named_uint("Lock Boost", locked.boost);
  }

  function testStakeStrategyVeloIonMode5050() public fork(MODE_MAINNET) {
    TestVars memory vars;
    IveION.LpTokenType lpType = IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE;
    IERC20 real5050IonModeVelo = IERC20(0x690A74d2eC0175a69C0962B309E03021C0b5002E);

    address[] memory whitelistedTokens = new address[](1);
    bool[] memory isWhitelistedTokens = new bool[](1);
    whitelistedTokens[0] = 0x690A74d2eC0175a69C0962B309E03021C0b5002E; // vAMMV2-ION/MODE
    isWhitelistedTokens[0] = true;
    ve.whitelistTokens(whitelistedTokens, isWhitelistedTokens);
    ve.setLpTokenType(address(real5050IonModeVelo), IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE);

    VeloIonModeStakingModeReward stakingStrategy = new VeloIonModeStakingModeReward();
    ve.setStakeStrategy(lpType, stakingStrategy, "");

    // Create a user
    vars.user = address(0x5678);

    uint256 _tokenAmount = real5050IonModeVelo.balanceOf(0x148F4e63611be189601f1F1555d4C79e8cEBddC8);

    vm.prank(0x148F4e63611be189601f1F1555d4C79e8cEBddC8);
    real5050IonModeVelo.transfer(vars.user, _tokenAmount);

    vm.prank(vars.user);
    real5050IonModeVelo.approve(address(ve), _tokenAmount);

    // Prepare parameters for createLock
    vars.tokenAddresses = new address[](1);
    vars.tokenAddresses[0] = address(real5050IonModeVelo);

    vars.tokenAmounts = new uint256[](1);
    vars.tokenAmounts[0] = _tokenAmount;

    vars.durations = new uint256[](1);
    vars.durations[0] = 52 weeks; // 1 year

    // Create lock for the user
    vm.prank(vars.user);
    vars.tokenId = ve.createLock(vars.tokenAddresses, vars.tokenAmounts, vars.durations);

    // Wait for a few days to simulate the passage of time
    vm.warp(block.timestamp + 3 days);

    // Check if the user is properly staked for the right amount and accruing rewards
    IStakingRewards stakingRewards = IStakingRewards(0x8EE410cC13948e7e684ebACb36b552e2c2A125fC);

    // Check the staked amount
    uint256 stakedAmount = stakingRewards.balanceOf(vars.user);
    emit log_named_uint("Staked Amount", stakedAmount);
    assertEq(stakedAmount, _tokenAmount, "Staked amount should match the transferred amount");

    // Check if the user is accruing rewards
    uint256 earnedRewards = stakingRewards.earned(vars.user);
    emit log_named_uint("Earned Rewards", earnedRewards);
    assertGt(earnedRewards, 0, "User should be accruing rewards");

    // Check the reward rate
    uint256 rewardRate = stakingRewards.rewardRate();
    emit log_named_uint("Reward Rate", rewardRate);
    assertGt(rewardRate, 0, "Reward rate should be greater than 0");

    // Check the last update time
    uint256 lastUpdateTime = stakingRewards.lastUpdateTime();
    emit log_named_uint("Last Update Time", lastUpdateTime);
    assertGt(lastUpdateTime, 0, "Last update time should be greater than 0");
  }
}
