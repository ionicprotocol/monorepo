// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

import "../stake/IStakeStrategy.sol";
import "./IveIONCore.sol";
import "./IveIONFirstExtension.sol";
import "./IveIONSecondExtension.sol";

/// @title IveION Interface
/// @notice Interface for veION contract
interface IveION is IveIONStructsEnumsErrorsEvents, IveIONCore, IveIONFirstExtension, IveIONSecondExtension {
  // Constants
  function PRECISION() external view returns (uint256);

  // State Variables
  function s_tokenId() external view returns (uint256);
  function s_limitedBoost() external view returns (uint256);
  function s_limitedBoostActive() external view returns (bool);
  function s_veAERO() external view returns (address);
  function s_aeroVoting() external view returns (address);
  function s_ionicPool() external view returns (address);
  function s_voter() external view returns (address);
  function s_aeroVoterBoost() external view returns (uint256);
  function s_minimumLockDuration() external view returns (uint256);
  function s_maxEarlyWithdrawFee() external view returns (uint256);
  function ap() external view returns (address);
  function implementation() external view returns (address);

  // Mappings
  function s_minimumLockAmount(LpTokenType lpTokenType) external view returns (uint256);
  function s_whitelistedToken(address token) external view returns (bool);
  function s_lpType(address token) external view returns (LpTokenType);
  function s_canSplit(address user) external view returns (bool);
  function s_locked(uint256 tokenId, LpTokenType lpTokenType) external view returns (LockedBalance memory);
  function s_userPointEpoch(uint256 tokenId, LpTokenType lpTokenType) external view returns (uint256);
  function s_userPointHistory(
    uint256 tokenId,
    LpTokenType lpTokenType,
    uint256 epoch
  ) external view returns (UserPoint memory);
  function s_voted(uint256 tokenId) external view returns (bool);
  function s_supply(LpTokenType lpTokenType) external view returns (uint256);
  function s_permanentLockBalance(LpTokenType lpTokenType) external view returns (uint256);
  function s_stakeStrategy(LpTokenType lpTokenType) external view returns (address);
  function s_underlyingStake(uint256 tokenId, address token) external view returns (uint256);
  function s_protocolFees(LpTokenType lpTokenType) external view returns (uint256);
  function s_distributedFees(LpTokenType lpTokenType) external view returns (uint256);
  function s_delegations(
    uint256 delegatorTokenId,
    uint256 delegateeTokenId,
    LpTokenType lpTokenType
  ) external view returns (uint256);
  function s_userCumulativeAssetValues(address user, address token) external view returns (uint256);
  function s_delegatorsBlocked(uint256 tokenId, address token) external view returns (bool);

  // Openzeppelin functions
  function transferFrom(address from, address to, uint256 tokenId) external;
  function ownerOf(uint256 tokenId) external returns (address);
  function owner() external returns (address);
  function balanceOf(address owner) external returns (uint256);
}
