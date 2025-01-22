// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { MockERC20 } from "solmate/test/utils/mocks/MockERC20.sol";
import "../config/BaseTest.t.sol";
import "../../veION/veION.sol";
import "../../veION/veIONFirstExtension.sol";
import "../../veION/veIONSecondExtension.sol";
import "../../veION/interfaces/IveION.sol";
// import "../../veION/interfaces/IveIONCore.sol";
import "../../veION/stake/IStakeStrategy.sol";
import "../../veION/stake/velo/VeloAeroStakingStrategy.sol";
import "../../veION/stake/IStakeStrategy.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { AddressesProvider } from "../../ionic/AddressesProvider.sol";
import "../../veION/stake/velo/VeloAeroStakingStrategy.sol";
import "../../veION/stake/velo/VeloAeroStakingWallet.sol";
import "../../veION/stake/velo/IVeloIonModeStaking.sol";
import "./harness/veIONHarness.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract veIONTest is BaseTest {
  using Strings for uint256;
  using Strings for bool;
  using Strings for address;

  address ve;
  address veFirstExtension;
  address veSecondExtension;
  MockERC20 modeVelodrome5050IonMode;
  MockERC20 modeBalancer8020IonEth;
  MockERC20 baseAerodrome5050IonWstEth;
  MockERC20 baseBalancer8020IonEth;
  MockERC20 optimismVelodrome5050IonOp;
  MockERC20 optimismBalancer8020IonEth;
  IveION.LpTokenType veloLpType;
  IveION.LpTokenType balancerLpType;
  VeloAeroStakingWallet veloStakingWalletImplementation;
  veIONHarness harness;

  address ionMode5050LP;
  address ionWeth5050lPAero;
  address wethAero5050LPAero;
  address veloGauge;
  VeloAeroStakingStrategy veloIonModeStakingStrategy;
  VeloAeroStakingStrategy veloWethUsdcStakingStrategy;
  address stakingWalletInstance;
  uint256 stakingWalletInstanceBalance;

  address wethUSDC5050LP;
  address wethUSDCGauge;

  // Base Fork Vars
  address baseUser;
  uint256 baseTokenIdSingleLp;

  uint256 internal constant MINT_AMT = 1000 ether;
  uint256 internal constant WEEK = 1 weeks;
  uint256 internal constant MAXTIME = 2 * 365 * 86400;
  uint256 internal constant MINTIME = 180 * 86400;
  uint256 internal constant EARLY_WITHDRAW_FEE = 0.8e18;
  uint256 internal constant MINIMUM_LOCK_AMOUNT = 10e18;
  uint256 internal constant REAL_LP_LOCK_AMOUNT = 10e18;

  function _setUp() internal virtual {
    ve = address(
      new TransparentUpgradeableProxy(
        address(new veION()),
        address(new ProxyAdmin()),
        abi.encodeWithSelector(veION.initialize.selector, address(ap))
      )
    );

    veFirstExtension = address(new veIONFirstExtension());
    veSecondExtension = address(new veIONSecondExtension());
    IveIONCore(ve).setExtensions(veFirstExtension, veSecondExtension);

    modeVelodrome5050IonMode = new MockERC20("Mode_Velodrome_5050_ION_MODE", "MV5050", 18);
    modeBalancer8020IonEth = new MockERC20("Mode_Balancer_8020_ION_ETH", "MB8020", 18);

    harness = new veIONHarness(MINTIME);

    address[] memory whitelistedTokens = new address[](2);
    bool[] memory isWhitelistedTokens = new bool[](2);

    whitelistedTokens[0] = address(modeVelodrome5050IonMode);
    whitelistedTokens[1] = address(modeBalancer8020IonEth);

    for (uint i = 0; i < 2; i++) {
      isWhitelistedTokens[i] = true;
    }
    IveION(ve).whitelistTokens(whitelistedTokens, isWhitelistedTokens);

    IveION(ve).setLpTokenType(address(modeVelodrome5050IonMode), IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE);
    IveION(ve).setLpTokenType(address(modeBalancer8020IonEth), IveION.LpTokenType.Mode_Balancer_8020_ION_ETH);

    veloLpType = IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE;
    balancerLpType = IveION.LpTokenType.Mode_Balancer_8020_ION_ETH;

    veloStakingWalletImplementation = new VeloAeroStakingWallet();

    IveION(ve).setMaxEarlyWithdrawFee(EARLY_WITHDRAW_FEE);
    IveION(ve).setMinimumLockDuration(MINTIME);
    IveION(ve).setMinimumLockAmount(address(modeVelodrome5050IonMode), MINIMUM_LOCK_AMOUNT);
    IveION(ve).setMinimumLockAmount(address(modeBalancer8020IonEth), MINIMUM_LOCK_AMOUNT);
  }

  function _afterForkSetUpMode() internal {
    ve = address(
      new TransparentUpgradeableProxy(
        address(new veION()),
        address(new ProxyAdmin()),
        abi.encodeWithSelector(veION.initialize.selector, address(ap))
      )
    );

    veFirstExtension = address(new veIONFirstExtension());
    veSecondExtension = address(new veIONSecondExtension());
    IveIONCore(ve).setExtensions(veFirstExtension, veSecondExtension);

    ionMode5050LP = 0x690A74d2eC0175a69C0962B309E03021C0b5002E;
    veloGauge = 0x8EE410cC13948e7e684ebACb36b552e2c2A125fC;

    wethUSDC5050LP = 0x283bA4E204DFcB6381BCBf2cb5d0e765A2B57bC2;
    wethUSDCGauge = 0x98d34C7b004688F35b67Aa30D4dF5E67113f6B3D;

    veloStakingWalletImplementation = new VeloAeroStakingWallet();

    veloIonModeStakingStrategy = VeloAeroStakingStrategy(
      address(
        new TransparentUpgradeableProxy(
          address(new VeloAeroStakingStrategy()),
          address(new ProxyAdmin()),
          abi.encodeWithSelector(
            VeloAeroStakingStrategy.initialize.selector,
            address(ve),
            ionMode5050LP,
            veloGauge,
            address(veloStakingWalletImplementation)
          )
        )
      )
    );

    veloWethUsdcStakingStrategy = VeloAeroStakingStrategy(
      address(
        new TransparentUpgradeableProxy(
          address(new VeloAeroStakingStrategy()),
          address(new ProxyAdmin()),
          abi.encodeWithSelector(
            VeloAeroStakingStrategy.initialize.selector,
            address(ve),
            wethUSDC5050LP,
            wethUSDCGauge,
            address(veloStakingWalletImplementation)
          )
        )
      )
    );

    address[] memory whitelistedTokens = new address[](2);
    bool[] memory isWhitelistedTokens = new bool[](2);
    whitelistedTokens[0] = ionMode5050LP;
    isWhitelistedTokens[0] = true;
    whitelistedTokens[1] = wethUSDC5050LP;
    isWhitelistedTokens[1] = true;

    IveION(ve).whitelistTokens(whitelistedTokens, isWhitelistedTokens);
    IveION(ve).setLpTokenType(ionMode5050LP, IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE);
    IveION(ve).setLpTokenType(wethUSDC5050LP, IveION.LpTokenType.Mode_Balancer_8020_ION_ETH);

    veloLpType = IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE;
    balancerLpType = IveION.LpTokenType.Mode_Balancer_8020_ION_ETH;

    IveION(ve).setStakeStrategy(veloLpType, IStakeStrategy(veloIonModeStakingStrategy));
    IveION(ve).setStakeStrategy(balancerLpType, IStakeStrategy(veloWethUsdcStakingStrategy));

    IveION(ve).setMaxEarlyWithdrawFee(EARLY_WITHDRAW_FEE);
    IveION(ve).setMinimumLockDuration(MINTIME);
    IveION(ve).setMinimumLockAmount(address(ionMode5050LP), MINIMUM_LOCK_AMOUNT);
    IveION(ve).setMinimumLockAmount(address(wethUSDC5050LP), MINIMUM_LOCK_AMOUNT);
  }

  function _afterForkSetUpBase() internal {
    baseUser = address(0x987);
    ve = address(
      new TransparentUpgradeableProxy(
        address(new veION()),
        address(new ProxyAdmin()),
        abi.encodeWithSelector(veION.initialize.selector, address(ap))
      )
    );

    veFirstExtension = address(new veIONFirstExtension());
    veSecondExtension = address(new veIONSecondExtension());
    IveIONCore(ve).setExtensions(veFirstExtension, veSecondExtension);

    harness = new veIONHarness(MINTIME);

    ionWeth5050lPAero = 0x0FAc819628a7F612AbAc1CaD939768058cc0170c;
    wethAero5050LPAero = 0x7f670f78B17dEC44d5Ef68a48740b6f8849cc2e6;

    address[] memory whitelistedTokens = new address[](2);
    bool[] memory isWhitelistedTokens = new bool[](2);
    whitelistedTokens[0] = ionWeth5050lPAero;
    isWhitelistedTokens[0] = true;
    whitelistedTokens[1] = wethAero5050LPAero;
    isWhitelistedTokens[1] = true;

    IveION(ve).whitelistTokens(whitelistedTokens, isWhitelistedTokens);
    IveION(ve).setLpTokenType(ionWeth5050lPAero, IveION.LpTokenType.Base_Aerodrome_5050_ION_wstETH);
    IveION(ve).setLpTokenType(wethAero5050LPAero, IveION.LpTokenType.Base_Balancer_8020_ION_ETH);

    IveION(ve).setMaxEarlyWithdrawFee(EARLY_WITHDRAW_FEE);
    IveION(ve).setMinimumLockDuration(MINTIME);
    IveION(ve).setMinimumLockAmount(address(ionWeth5050lPAero), MINIMUM_LOCK_AMOUNT);
    IveION(ve).setMinimumLockAmount(address(wethAero5050LPAero), MINIMUM_LOCK_AMOUNT);
  }

  function _lockSingleLPFork(address _user, uint256 _amount) internal returns (uint256) {
    address whale = 0x9b42e5F8c45222b2715F804968251c747c588fd7;
    vm.prank(whale);
    IERC20(ionWeth5050lPAero).transfer(_user, _amount);

    address[] memory tokenAddresses = new address[](1);
    uint256[] memory tokenAmounts = new uint256[](1);
    uint256[] memory durations = new uint256[](1);
    bool[] memory stakeUnderlying = new bool[](1);
    tokenAddresses[0] = address(ionWeth5050lPAero);
    tokenAmounts[0] = _amount;
    durations[0] = 52 weeks;
    stakeUnderlying[0] = false;

    vm.startPrank(_user);
    IERC20(ionWeth5050lPAero).approve(address(ve), _amount);
    uint256 tokenId = IveION(ve).createLock(tokenAddresses, tokenAmounts, durations, stakeUnderlying);
    vm.stopPrank();

    return tokenId;
  }

  function _lockMultiLpFork(address _user, uint256 _amountIonWeth, uint256 _amountWethAERO) internal returns (uint256) {
    address ionWethWhale = 0x9b42e5F8c45222b2715F804968251c747c588fd7;
    address wethAEROWhale = 0x96a24aB830D4ec8b1F6f04Ceac104F1A3b211a01;

    vm.prank(ionWethWhale);
    IERC20(ionWeth5050lPAero).transfer(_user, _amountIonWeth);
    vm.prank(wethAEROWhale);
    IERC20(wethAero5050LPAero).transfer(_user, _amountWethAERO);

    address[] memory tokenAddresses = new address[](2);
    uint256[] memory tokenAmounts = new uint256[](2);
    uint256[] memory durations = new uint256[](2);
    bool[] memory stakeUnderlying = new bool[](2);
    tokenAddresses[0] = address(ionWeth5050lPAero);
    tokenAmounts[0] = _amountIonWeth;
    durations[0] = 52 weeks;
    stakeUnderlying[0] = false;
    tokenAddresses[1] = address(wethAero5050LPAero);
    tokenAmounts[1] = _amountWethAERO;
    durations[1] = 52 weeks;
    stakeUnderlying[1] = false;

    vm.startPrank(_user);
    IERC20(ionWeth5050lPAero).approve(address(ve), _amountIonWeth);
    IERC20(wethAero5050LPAero).approve(address(ve), _amountWethAERO);
    uint256 tokenId = IveION(ve).createLock(tokenAddresses, tokenAmounts, durations, stakeUnderlying);
    vm.stopPrank();

    return tokenId;
  }

  function _createLockInternal(address user) internal returns (LockInfo memory) {
    TestVars memory vars;
    vars.user = user;
    vars.amount = MINT_AMT;
    modeVelodrome5050IonMode.mint(vars.user, vars.amount);

    vm.startPrank(vars.user);
    modeVelodrome5050IonMode.approve(address(ve), vars.amount);
    vm.stopPrank();

    vars.tokenAddresses = new address[](1);
    vars.tokenAddresses[0] = address(modeVelodrome5050IonMode);

    vars.tokenAmounts = new uint256[](1);
    vars.tokenAmounts[0] = vars.amount;

    vars.durations = new uint256[](1);
    vars.durations[0] = 52 weeks;

    vm.startPrank(vars.user);
    uint256 tokenId = IveION(ve).createLock(vars.tokenAddresses, vars.tokenAmounts, vars.durations, new bool[](1));
    vm.stopPrank();

    return LockInfo(tokenId, vars.tokenAddresses[0], vars.tokenAmounts[0], vars.durations[0]);
  }

  function _createLockMultipleInternal(address user) internal returns (LockInfoMultiple memory) {
    TestVars memory vars;
    vars.user = user;

    vars.amount = MINT_AMT;
    modeVelodrome5050IonMode.mint(vars.user, vars.amount);
    modeBalancer8020IonEth.mint(vars.user, vars.amount);

    vm.startPrank(vars.user);
    modeVelodrome5050IonMode.approve(address(ve), vars.amount);
    modeBalancer8020IonEth.approve(address(ve), vars.amount);
    vm.stopPrank();

    vars.tokenAddresses = new address[](2);
    vars.tokenAddresses[0] = address(modeVelodrome5050IonMode);
    vars.tokenAddresses[1] = address(modeBalancer8020IonEth);

    vars.tokenAmounts = new uint256[](2);
    vars.tokenAmounts[0] = vars.amount;
    vars.tokenAmounts[1] = vars.amount;

    vars.durations = new uint256[](2);
    vars.durations[0] = 52 weeks;
    vars.durations[1] = 52 weeks;

    vm.startPrank(vars.user);
    vars.tokenId = IveION(ve).createLock(vars.tokenAddresses, vars.tokenAmounts, vars.durations, new bool[](2));
    vm.stopPrank();

    return LockInfoMultiple(vars.tokenId, vars.tokenAddresses, vars.tokenAmounts, vars.durations);
  }

  function _createLockInternalRealLP(address _user, bool _stakeUnderlying) internal returns (LockInfo memory) {
    uint256 amountStaked = REAL_LP_LOCK_AMOUNT;
    address whale = 0x8ff8b21a0736738b25597D32d8f7cf658f39f157;
    vm.prank(whale);
    IERC20(ionMode5050LP).transfer(_user, amountStaked);

    address[] memory tokenAddresses = new address[](1);
    tokenAddresses[0] = address(ionMode5050LP);

    uint256[] memory tokenAmounts = new uint256[](1);
    tokenAmounts[0] = amountStaked;

    uint256[] memory durations = new uint256[](1);
    durations[0] = 52 weeks;

    bool[] memory stakeUnderlying = new bool[](1);
    stakeUnderlying[0] = _stakeUnderlying;

    vm.startPrank(_user);
    IERC20(ionMode5050LP).approve(address(ve), amountStaked);
    uint256 tokenId = IveION(ve).createLock(tokenAddresses, tokenAmounts, durations, stakeUnderlying);
    vm.stopPrank();

    return LockInfo(tokenId, tokenAddresses[0], tokenAmounts[0], durations[0]);
  }

  function _generateRandomAddress(uint256 seed) internal pure returns (address) {
    return address(uint160(uint256(keccak256(abi.encodePacked(seed)))));
  }

  function _logTokens(uint256[] memory tokenIds, address[] memory lpTokens) internal view {
    for (uint256 i = 0; i < tokenIds.length; i++) {
      for (uint256 j = 0; j < lpTokens.length; j++) {
        IveION.LockedBalance memory lock = IveION(ve).getUserLock(tokenIds[i], IveION(ve).s_lpType(lpTokens[j]));
        uint256 tokenId = i + 1;
        console.log(
          string(abi.encodePacked("Token ID ", tokenId.toString(), " Locked Token: ", lock.tokenAddress.toHexString()))
        );
        console.log(
          string(abi.encodePacked("Token ID ", tokenId.toString(), " Locked Amount: ", lock.amount.toString()))
        );
        console.log(
          string(
            abi.encodePacked(
              "Token ID ",
              tokenId.toString(),
              " Locked Delegate Amount: ",
              lock.delegateAmount.toString()
            )
          )
        );
        console.log(
          string(abi.encodePacked("Token ID ", tokenId.toString(), " Locked Start: ", lock.start.toString()))
        );
        console.log(string(abi.encodePacked("Token ID ", tokenId.toString(), " Locked End: ", lock.end.toString())));
        console.log(
          string(
            abi.encodePacked(
              "Token ID ",
              tokenId.toString(),
              " Locked IsPermanent: ",
              lock.isPermanent ? "true" : "false"
            )
          )
        );
        console.log(
          string(abi.encodePacked("Token ID ", tokenId.toString(), " Locked Boost: ", lock.boost.toString()))
        );
        console.log("--------------------------------------------------");
      }
      console.log("====================================================");
    }
  }

  function _logCumulativeAssetValues(address[] memory users, address[] memory lpTokens) internal view {
    console.log("-----------------------------------------------------------------");
    for (uint256 i = 0; i < users.length; i++) {
      address user = users[i];
      console.log("Cumulative Asset Values for User:", user);
      for (uint256 j = 0; j < lpTokens.length; j++) {
        console.log("Token:", lpTokens[j], "Value:", IveION(ve).s_userCumulativeAssetValues(user, lpTokens[j]));
      }
      console.log("====================================================");
    }
  }

  function _logUnderlyingStake(address[] memory users) internal view {
    console.log("-----------------------------------------------------------------");
    for (uint256 i = 0; i < users.length; i++) {
      address user = users[i];
      console.log("Underlying Stakes For:", user);
      address stakingWalletInstanceIonMode = veloIonModeStakingStrategy.userStakingWallet(user);
      uint256 stakedBalanceIonMode = veloIonModeStakingStrategy.balanceOf(stakingWalletInstanceIonMode);

      address stakingWalletInstanceWethUsdc = veloWethUsdcStakingStrategy.userStakingWallet(user);
      uint256 stakedBalanceWethUsdc = veloWethUsdcStakingStrategy.balanceOf(stakingWalletInstanceWethUsdc);

      console.log("Staked Balance Ion-Mode:", stakedBalanceIonMode);
      console.log("Staked Balance Weth-Usdc:", stakedBalanceWethUsdc);
      console.log("====================================================");
    }
  }
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

struct AeroBoostVars {
  uint256 aeroVoterBoost;
  address aeroVotingAddress;
  address ionicPoolAddress;
  address veAEROAddress;
  address AERO;
  uint256 lockAmount;
  address aeroWhale;
  uint256 veAeroTokenId;
  address[] poolVote;
  uint256[] weights;
}

interface IveAERO {
  /// @notice Deposit `_value` tokens for `msg.sender` and lock for `_lockDuration`
  /// @param _value Amount to deposit
  /// @param _lockDuration Number of seconds to lock tokens for (rounded down to nearest week)
  /// @return TokenId of created veNFT
  function createLock(uint256 _value, uint256 _lockDuration) external returns (uint256);
}

interface IAEROVoter {
  /// @notice Called by users to vote for pools. Votes distributed proportionally based on weights.
  ///         Can only vote or deposit into a managed NFT once per epoch.
  ///         Can only vote for gauges that have not been killed.
  /// @dev Weights are distributed proportional to the sum of the weights in the array.
  ///      Throws if length of _poolVote and _weights do not match.
  /// @param _tokenId     Id of veNFT you are voting with.
  /// @param _poolVote    Array of pools you are voting for.
  /// @param _weights     Weights of pools.
  function vote(uint256 _tokenId, address[] calldata _poolVote, uint256[] calldata _weights) external;

  /// @notice Returns the number of votes for a given veNFT token ID and pool address.
  /// @param _tokenId The ID of the veNFT.
  /// @param _pool The address of the pool.
  /// @return The number of votes for the given token ID and pool.
  function votes(uint256 _tokenId, address _pool) external view returns (uint256);
}
