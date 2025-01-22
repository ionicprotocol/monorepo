// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

import { ERC721Upgradeable } from "@openzeppelin-contracts-upgradeable/contracts/token/ERC721/ERC721Upgradeable.sol";
import { Ownable2StepUpgradeable } from "@openzeppelin-contracts-upgradeable/contracts/access/Ownable2StepUpgradeable.sol";
import { IMasterPriceOracle, IAeroVotingEscrow, IAeroVoter } from "./interfaces/IveIONCore.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IVoter } from "./interfaces/IVoter.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin-contracts-upgradeable/contracts/security/ReentrancyGuardUpgradeable.sol";
import { veIONStorage } from "./veIONStorage.sol";
import { BalanceLogicLibrary } from "./libraries/BalanceLogicLibrary.sol";
import { IveIONSecondExtension } from "./interfaces/IveIONSecondExtension.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { IAddressesProvider } from "./interfaces/IveIONCore.sol";
import { IStakeStrategy } from "./stake/IStakeStrategy.sol";

/**
 * @title veION Contract
 * @notice This contract manages the veION framework, enabling the staking and management LP tokens for voting power.
 * @author Jourdan Dunkley <jourdan@ionic.money> (https://github.com/jourdanDunkley)
 */
contract veIONSecondExtension is
  Ownable2StepUpgradeable,
  ERC721Upgradeable,
  ReentrancyGuardUpgradeable,
  veIONStorage,
  IveIONSecondExtension
{
  using EnumerableSet for EnumerableSet.UintSet;
  using EnumerableSet for EnumerableSet.AddressSet;
  using SafeERC20 for IERC20;

  /// @inheritdoc IveIONSecondExtension
  function whitelistTokens(address[] memory _tokens, bool[] memory _isWhitelisted) external onlyOwner {
    require(_tokens.length == _isWhitelisted.length, "Unequal Arrays");
    for (uint256 i; i < _tokens.length; i++) s_whitelistedToken[_tokens[i]] = _isWhitelisted[i];
    emit TokensWhitelisted(_tokens, _isWhitelisted);
  }

  /// @inheritdoc IveIONSecondExtension
  function withdrawProtocolFees(address _tokenAddress, address _recipient) external onlyOwner {
    LpTokenType lpType = s_lpType[_tokenAddress];
    uint256 protocolFees = s_protocolFees[lpType];
    require(protocolFees > 0, "No protocol fees available");
    s_protocolFees[lpType] = 0;
    IERC20(_tokenAddress).safeTransfer(_recipient, protocolFees);
    emit ProtocolFeesWithdrawn(_tokenAddress, _recipient, protocolFees);
  }

  /// @inheritdoc IveIONSecondExtension
  function withdrawDistributedFees(address _tokenAddress, address _recipient) external onlyOwner {
    LpTokenType lpType = s_lpType[_tokenAddress];
    uint256 distributedFees = s_distributedFees[lpType];
    require(distributedFees > 0, "No distributed fees available");
    s_distributedFees[lpType] = 0;
    IERC20(_tokenAddress).safeTransfer(_recipient, distributedFees);
    emit DistributedFeesWithdrawn(_tokenAddress, _recipient, distributedFees);
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                           Setter Functions                                ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /// @inheritdoc IveIONSecondExtension
  function toggleSplit(address _account, bool _isAllowed) external onlyOwner {
    s_canSplit[_account] = _isAllowed;
    emit SplitToggle(_account, _isAllowed);
  }

  /// @inheritdoc IveIONSecondExtension
  function toggleLimitedBoost(bool _isBoosted) external onlyOwner {
    s_limitedBoostActive = _isBoosted;
    emit LimitedBoostToggled(_isBoosted);
  }

  /// @inheritdoc IveIONSecondExtension
  function setLimitedTimeBoost(uint256 _boostAmount) external onlyOwner {
    if (_boostAmount <= 0) revert BoostAmountMustBeGreaterThanZero();
    s_limitedBoost = _boostAmount;
    emit LimitedTimeBoostSet(_boostAmount);
  }

  /// @inheritdoc IveIONSecondExtension
  function setVoter(address _voter) external onlyOwner {
    if (address(_voter) == address(0)) revert InvalidAddress();
    s_voter = _voter;
    emit VoterSet(_voter);
  }

  /// @inheritdoc IveIONSecondExtension
  function setMinimumLockAmount(address _tokenAddress, uint256 _minimumAmount) external onlyOwner {
    if (_minimumAmount <= 0) revert MinimumAmountMustBeGreaterThanZero();
    LpTokenType lpType = s_lpType[_tokenAddress];
    s_minimumLockAmount[lpType] = _minimumAmount;
    emit MinimumLockAmountSet(_tokenAddress, _minimumAmount);
  }

  /// @inheritdoc IveIONSecondExtension
  function setMinimumLockDuration(uint256 _minimumLockDuration) external onlyOwner {
    if (_minimumLockDuration <= 0) revert MinimumLockDurationMustBeGreaterThanZero();
    s_minimumLockDuration = _minimumLockDuration;
    emit MinimumLockDurationSet(_minimumLockDuration);
  }

  /// @inheritdoc IveIONSecondExtension
  function setIonicPool(address _ionicPool) external onlyOwner {
    if (address(_ionicPool) == address(0)) revert InvalidAddress();
    s_ionicPool = _ionicPool;
    emit IonicPoolSet(_ionicPool);
  }

  /// @inheritdoc IveIONSecondExtension
  function setAeroVoting(address _aeroVoting) external onlyOwner {
    if (address(_aeroVoting) == address(0)) revert InvalidAddress();
    s_aeroVoting = _aeroVoting;
    emit AeroVotingSet(_aeroVoting);
  }

  /// @inheritdoc IveIONSecondExtension
  function setAeroVoterBoost(uint256 _aeroVoterBoost) external onlyOwner {
    if (_aeroVoterBoost <= 0) revert AeroBoostAmountMustBeGreaterThanZero();
    s_aeroVoterBoost = _aeroVoterBoost;
    emit AeroVoterBoostSet(_aeroVoterBoost);
  }

  /// @inheritdoc IveIONSecondExtension
  function setMaxEarlyWithdrawFee(uint256 _maxEarlyWithdrawFee) external onlyOwner {
    if (_maxEarlyWithdrawFee <= 0) revert MaxEarlyWithdrawFeeMustBeGreaterThanZero();
    s_maxEarlyWithdrawFee = _maxEarlyWithdrawFee;
    emit MaxEarlyWithdrawFeeSet(_maxEarlyWithdrawFee);
  }

  /// @inheritdoc IveIONSecondExtension
  function setLpTokenType(address _token, LpTokenType _type) external onlyOwner {
    if (_token == address(0)) revert InvalidTokenAddress();
    s_lpType[_token] = _type;
    emit LpTokenTypeSet(_token, _type);
  }

  /// @inheritdoc IveIONSecondExtension
  function setStakeStrategy(LpTokenType _lpType, IStakeStrategy _strategy) external onlyOwner {
    if (address(_strategy) == address(0)) revert InvalidStrategyAddress();
    s_stakeStrategy[_lpType] = IStakeStrategy(_strategy);
    emit StakeStrategySet(_lpType, address(_strategy));
  }

  /// @inheritdoc IveIONSecondExtension
  function setVeAERO(address _veAERO) external onlyOwner {
    if (_veAERO == address(0)) revert InvalidVeAEROAddress();
    s_veAERO = _veAERO;
    emit VeAEROSet(_veAERO);
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                           View Functions                                  ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /// @inheritdoc IveIONSecondExtension
  function getUserLock(uint256 _tokenId, LpTokenType _lpType) external view returns (LockedBalance memory) {
    return s_locked[_tokenId][_lpType];
  }

  /// @inheritdoc IveIONSecondExtension
  function getOwnedTokenIds(address _owner) external view returns (uint256[] memory) {
    return s_ownerToTokenIds[_owner].values();
  }

  /// @inheritdoc IveIONSecondExtension
  function getAssetsLocked(uint256 _tokenId) external view returns (address[] memory) {
    return s_assetsLocked[_tokenId].values();
  }

  /// @inheritdoc IveIONSecondExtension
  function getDelegatees(uint256 _tokenId, LpTokenType _lpType) external view returns (uint256[] memory) {
    return s_delegatees[_tokenId][_lpType].values();
  }

  /// @inheritdoc IveIONSecondExtension
  function getDelegators(uint256 _tokenId, LpTokenType _lpType) external view returns (uint256[] memory) {
    return s_delegators[_tokenId][_lpType].values();
  }

  /// @inheritdoc IveIONSecondExtension
  function getUserPoint(
    uint256 _tokenId,
    LpTokenType _lpType,
    uint256 _epoch
  ) external view returns (UserPoint memory) {
    return s_userPointHistory[_tokenId][_lpType][_epoch];
  }
}
