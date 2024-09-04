// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;
import { MockERC20 } from "solmate/test/utils/mocks/MockERC20.sol";
import "../config/BaseTest.t.sol";
import "../../veION/veION.sol";
import "../../veION/IveION.sol";

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

    // Display token balance of user after lock
    vars.userBalanceAfterLock = modeVelodrome5050IonMode.balanceOf(vars.user);
    console.log("User's token balance after lock:", vars.userBalanceAfterLock);

    // Display token balance of veION contract
    vars.veIONBalance = modeVelodrome5050IonMode.balanceOf(address(ve));
    console.log("veION contract token balance:", vars.veIONBalance);

    // Get and display locks for each LP token type
    IveION.LpTokenType[6] memory lpTokenTypes = [
      IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE,
      IveION.LpTokenType.Mode_Balancer_8020_ION_ETH,
      IveION.LpTokenType.Base_Aerodrome_5050_ION_wstETH,
      IveION.LpTokenType.Base_Balancer_8020_ION_ETH,
      IveION.LpTokenType.Optimism_Velodrome_5050_ION_OP,
      IveION.LpTokenType.Optimism_Balancer_8020_ION_ETH
    ];

    for (uint i = 0; i < lpTokenTypes.length; i++) {
      IveION.LockedBalance memory locked = ve.getUserLock(vars.tokenId, lpTokenTypes[i]);

      console.log("Lock for LP Token Type:", uint(lpTokenTypes[i]));
      console.log("Token address:", locked.tokenAddress);
      console.log("Amount:", uint256(int256(locked.amount)));
      console.log("End time:", locked.end);
      console.log("--------------------");
    }
  }
}
