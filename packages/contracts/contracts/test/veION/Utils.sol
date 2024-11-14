// SPDX-License-Identifier: MIT
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
import "./Utils.sol";

contract veIONTest is BaseTest {
  veION ve;
  MockERC20 modeVelodrome5050IonMode;
  MockERC20 modeBalancer8020IonEth;
  MockERC20 baseAerodrome5050IonWstEth;
  MockERC20 baseBalancer8020IonEth;
  MockERC20 optimismVelodrome5050IonOp;
  MockERC20 optimismBalancer8020IonEth;
  IveION.LpTokenType veloLpType;
  IveION.LpTokenType balancerLpType;
  VelodromeStakingWallet veloStakingWalletImplementation;

  uint256 internal constant MINT_AMT = 1000 ether;
  uint256 internal constant WEEK = 1 weeks;
  uint256 internal constant MAXTIME = 2 * 365 * 86400;
  uint256 internal constant MINTIME = 180 * 86400;
  uint256 internal constant EARLY_WITHDRAW_FEE = 0.8e18;
  uint256 internal constant MINIMUM_LOCK_AMOUNT = 10e18;

  function _setUp() internal {
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

    veloStakingWalletImplementation = new VelodromeStakingWallet();

    ve.setMaxEarlyWithdrawFee(EARLY_WITHDRAW_FEE);
    ve.setMinimumLockDuration(MINTIME);
    ve.setMinimumLockAmount(address(modeVelodrome5050IonMode), MINIMUM_LOCK_AMOUNT);
    ve.setMinimumLockAmount(address(modeBalancer8020IonEth), MINIMUM_LOCK_AMOUNT);
  }

  function afterForkSetUp() internal virtual override {
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

    veloStakingWalletImplementation = new VelodromeStakingWallet();

    ve.setMaxEarlyWithdrawFee(EARLY_WITHDRAW_FEE);
    ve.setMinimumLockDuration(MINTIME);
    ve.setMinimumLockAmount(address(modeVelodrome5050IonMode), MINIMUM_LOCK_AMOUNT);
    ve.setMinimumLockAmount(address(modeBalancer8020IonEth), MINIMUM_LOCK_AMOUNT);
  }

  // Function: _createLockMultipleInternal
  // Tokens Locked:
  //   1. "Mode_Velodrome_5050_ION_MODE" - 1000 tokens
  // Lock Duration: 52 weeks for each token
  function _createLockInternal(address user) internal returns (LockInfo memory) {
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

    return LockInfo(tokenId, vars.tokenAddresses[0], vars.tokenAmounts[0], vars.durations[0]);
  }

  // Function: _createLockMultipleInternal
  // Tokens Locked:
  //   1. "Mode_Velodrome_5050_ION_MODE" - 1000 tokens
  //   2. "Mode_Balancer_8020_ION_ETH" - 1000 tokens
  // Lock Duration: 52 weeks for each token
  function _createLockMultipleInternal(address user) internal returns (LockInfoMultiple memory) {
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

    return LockInfoMultiple(vars.tokenId, vars.tokenAddresses, vars.tokenAmounts, vars.durations);
  }

  // function _createLockInternalRealLP(address user) internal returns (LockInfo memory) {
  //   uint256 amountStaked = 10 ether;
  //   vm.prank(0x8034857f8A467624BaF973de28026CEB9A2fF5F1);
  //   IERC20(ionMode5050LP).transfer(user, amountStaked);

  //   address[] memory tokenAddresses = new address[](1);
  //   tokenAddresses[0] = address(ionMode5050LP);

  //   uint256[] memory tokenAmounts = new uint256[](1);
  //   tokenAmounts[0] = amountStaked;

  //   uint256[] memory durations = new uint256[](1);
  //   durations[0] = 52 weeks;

  //   bool[] memory stakeUnderlying = new bool[](1);
  //   stakeUnderlying[0] = true;

  //   vm.startPrank(user);
  //   IERC20(ionMode5050LP).approve(address(ve), amountStaked);
  //   ve.createLock(tokenAddresses, tokenAmounts, durations, stakeUnderlying);
  //   vm.stopPrank();
  // }
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
  uint256 lockedBalance_amount;
  uint256 delegated_lockedBalance_amount;
  uint256 lockedBalance_start;
  uint256 lockedBalance_end;
  bool lockedBalance_isPermanent;
  uint256 lockedBalance_boost;
  uint256 userPoint_bias;
  uint256 userPoint_slope;
  uint256 userPoint_ts;
  uint256 userPoint_blk;
  uint256 userPoint_permanent;
  uint256 userPoint_permanentDelegate;
  int128 globalPoint_bias;
  int128 globalPoint_slope;
  uint256 globalPoint_ts;
  uint256 globalPoint_blk;
  uint256 globalPoint_permanentLockBalance;
  uint256[] ownerTokenIds;
  address[] assetsLocked;
  uint256 tokenId_test;
  address lockedBalance_tokenAddress_test;
  uint256 lockedBalance_amount_test;
  uint256 lockedBalance_duration_test;
  uint256 lockedBalance_end_test;
}

struct LockInfo {
  uint256 tokenId;
  address tokenAddress;
  uint256 tokenAmount;
  uint256 duration;
}

struct LockInfoMultiple {
  uint256 tokenId;
  address[] tokenAddresses;
  uint256[] tokenAmounts;
  uint256[] durations;
}
