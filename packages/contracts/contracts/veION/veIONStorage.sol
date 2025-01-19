// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

import { IAddressesProvider } from "./interfaces/IveIONCore.sol";
import { IStakeStrategy } from "./stake/IStakeStrategy.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { IveIONStructsEnumsErrorsEvents } from "./interfaces/IveIONStructsEnumsErrorsEvents.sol";

abstract contract veIONStorage is IveIONStructsEnumsErrorsEvents {
  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                                Constants                                  ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  /// @notice Represents the duration of one week in seconds.
  uint256 internal constant _WEEK = 1 weeks;
  /// @notice Represents the maximum lock time in seconds (2 years).
  uint256 internal constant _MAXTIME = 2 * 365 * 86400;
  /// @notice Precision used for calculations, set to 1e18.
  uint256 public constant PRECISION = 1e18;

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                             State Variables                               ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  /// @notice The current token ID counter.
  uint256 public s_tokenId;
  /// @notice The amount of limited boost available.
  uint256 public s_limitedBoost;
  /// @notice Indicates whether the limited boost is active.
  bool public s_limitedBoostActive;
  /// @notice Address of the veAERO contract.
  address public s_veAERO;
  /// @notice Address of the AeroVoting contract.
  address public s_aeroVoting;
  /// @notice Address of the Ionic Pool.
  address public s_ionicPool;
  /// @notice Address of the voter contract.
  address public s_voter;
  /// @notice The boost amount for AeroVoter.
  uint256 public s_aeroVoterBoost;
  /// @notice The minimum duration for locking.
  uint256 public s_minimumLockDuration;
  /// @notice The maximum fee for early withdrawal.
  uint256 public s_maxEarlyWithdrawFee;
  /// @notice The AddressesProvider contract used for address management.
  IAddressesProvider public ap;
  /// @notice The address of the logic contract for the veION first extension.
  address public veIONFirstExtension;

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                                Mappings                                   ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  /// @dev Maps LP token types to their minimum lock amounts.
  mapping(LpTokenType => uint256) public s_minimumLockAmount;
  /// @dev Maps token addresses to their whitelist status.
  mapping(address => bool) public s_whitelistedToken;
  /// @dev Maps token addresses to their corresponding LP token types.
  mapping(address => LpTokenType) public s_lpType;
  /// @dev Maps user addresses to their ability to split.
  mapping(address => bool) public s_canSplit;
  /// @dev Maps token IDs and LP token types to their locked balances.
  mapping(uint256 => mapping(LpTokenType => LockedBalance)) public s_locked;
  /// @dev Maps token IDs and LP token types to user epochs.
  mapping(uint256 => mapping(LpTokenType => uint256)) public s_userPointEpoch;
  /// @dev Maps token IDs and LP token types to user point history.
  mapping(uint256 => mapping(LpTokenType => UserPoint[1000000000])) public s_userPointHistory;
  /// @dev Maps token IDs to sets of locked asset addresses.
  mapping(uint256 => EnumerableSet.AddressSet) internal s_assetsLocked;
  /// @dev Maps token IDs to their voting status.
  mapping(uint256 => bool) public s_voted;
  /// @dev Maps LP token types to their total supply.
  mapping(LpTokenType => uint256) public s_supply;
  /// @dev Maps LP token types to their permanent lock balances.
  mapping(LpTokenType => uint256) public s_permanentLockBalance;
  /// @dev Maps LP token types to their underlying stake strategies.
  mapping(LpTokenType => IStakeStrategy) public s_stakeStrategy;
  /// @dev Maps token IDs and LP token addresses to their underlying stake amounts.
  mapping(uint256 => mapping(address => uint256)) public s_underlyingStake;
  /// @dev Maps LP token types to their protocol fees.
  mapping(LpTokenType => uint256) public s_protocolFees;
  /// @dev Maps LP token types to their distributed fees.
  mapping(LpTokenType => uint256) public s_distributedFees;
  /// @dev Maps delegators, delegatees, and LP token types to delegation amounts.
  mapping(uint256 => mapping(uint256 => mapping(LpTokenType => uint256))) public s_delegations;
  /// @dev Maps token IDs and LP token types to sets of delegatees.
  mapping(uint256 => mapping(LpTokenType => EnumerableSet.UintSet)) internal s_delegatees;
  /// @dev Maps token IDs and LP token types to sets of delegators.
  mapping(uint256 => mapping(LpTokenType => EnumerableSet.UintSet)) internal s_delegators;
  /// @dev Maps owner addresses to sets of token IDs they own.
  mapping(address => EnumerableSet.UintSet) internal s_ownerToTokenIds;
  /// @dev Maps user addresses and token addresses to cumulative asset values.
  mapping(address => mapping(address => uint256)) public s_userCumulativeAssetValues;
  /// @dev Maps token Id and lp onto delegator permissioning.
  mapping(uint256 => mapping(address => bool)) public s_delegatorsBlocked;

  uint256[50] private __gap;
}
