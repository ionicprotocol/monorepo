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
import { IveIONFirstExtension } from "./interfaces/IveIONFirstExtension.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { IAddressesProvider } from "./interfaces/IveIONCore.sol";
import { IStakeStrategy } from "./stake/IStakeStrategy.sol";

/**
 * @title veION Contract First Extensions
 * @notice This contract manages the veION framework, enabling the staking and management LP tokens for voting power.
 * @author Jourdan Dunkley <jourdan@ionic.money> (https://github.com/jourdanDunkley)
 */
contract veIONFirstExtension is
  Ownable2StepUpgradeable,
  ERC721Upgradeable,
  ReentrancyGuardUpgradeable,
  veIONStorage,
  IveIONFirstExtension
{
  using EnumerableSet for EnumerableSet.UintSet;
  using EnumerableSet for EnumerableSet.AddressSet;
  using SafeERC20 for IERC20;

  constructor() {
    _disableInitializers(); // Locks the implementation contract from being initialized
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                           External Functions                              ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /// @inheritdoc IveIONFirstExtension
  function withdraw(address _tokenAddress, uint256 _tokenId) external nonReentrant {
    address sender = _msgSender();
    LpTokenType _lpType = s_lpType[_tokenAddress];
    LockedBalance memory oldLocked = s_locked[_tokenId][_lpType];

    if (ownerOf(_tokenId) != _msgSender()) revert NotOwner();
    if (s_voted[_tokenId]) revert AlreadyVoted();
    if (oldLocked.isPermanent) revert PermanentLock();
    if (!s_whitelistedToken[_tokenAddress]) revert TokenNotWhitelisted();
    if (oldLocked.amount == 0 || !s_assetsLocked[_tokenId].contains(_tokenAddress)) revert NoLockFound();

    uint256 value = oldLocked.amount;
    s_userCumulativeAssetValues[sender][_tokenAddress] -= value;
    uint256 fee = 0;

    if (block.timestamp < oldLocked.end) {
      uint256 daysLocked = ((oldLocked.end - oldLocked.start) * 1e18) / 1 days;
      uint256 daysLeft = ((oldLocked.end - block.timestamp) * 1e18) / 1 days;
      uint256 timeFactor = (daysLeft * 1e18) / daysLocked;
      uint256 veLPLocked = s_supply[_lpType];
      uint256 LPInCirculation = IERC20(_tokenAddress).totalSupply();
      uint256 ratioFactor = 1e18 - (veLPLocked * 1e18) / LPInCirculation;
      fee = (timeFactor * ratioFactor * oldLocked.boost) / 1e36;
      if (fee > s_maxEarlyWithdrawFee) fee = s_maxEarlyWithdrawFee;
      fee = (value * fee) / 1e18;
      value -= fee;

      uint256 feeToDistribute = (fee * 75) / 100;
      uint256 feeToProtocol = fee - feeToDistribute;
      s_protocolFees[_lpType] += feeToProtocol;
      s_distributedFees[_lpType] += feeToDistribute;
    }

    s_locked[_tokenId][_lpType] = LockedBalance(address(0), 0, 0, 0, 0, false, 0);
    s_assetsLocked[_tokenId].remove(_tokenAddress);
    uint256 supplyBefore = s_supply[_lpType];

    uint256 amountStaked = s_underlyingStake[_tokenId][_tokenAddress];
    if (amountStaked != 0) {
      (IStakeStrategy _stakeStrategy, ) = _getStakeStrategy(_lpType);
      if (address(_stakeStrategy) != address(0)) {
        _handleTokenWithdrawStake(sender, address(this), _tokenId, _tokenAddress, amountStaked, _stakeStrategy);
      }
    }

    s_supply[_lpType] = supplyBefore - oldLocked.amount;
    _checkpoint(_tokenId, LockedBalance(address(0), 0, 0, 0, 0, false, 0), _lpType);

    // Check if all LP types for this token have zero balance
    bool shouldBurn = true;
    address[] memory lockedAssets = s_assetsLocked[_tokenId].values();
    uint256 lockedAssetsLength = lockedAssets.length;
    for (uint256 i = 0; i < lockedAssetsLength; i++) {
      LpTokenType assetLpType = s_lpType[lockedAssets[i]];
      if (s_locked[_tokenId][assetLpType].amount > 0) {
        shouldBurn = false;
        break;
      }
    }

    if (shouldBurn) _burn(_tokenId);

    IERC20(_tokenAddress).safeTransfer(sender, value);
    emit Withdraw(sender, _tokenId, value, block.timestamp);
    emit Supply(supplyBefore, supplyBefore - oldLocked.amount);
  }

  /// @inheritdoc IveIONFirstExtension
  function merge(uint256 _from, uint256 _to) external nonReentrant {
    if (_from == _to) revert SameNFT();
    if (s_voted[_from] || s_voted[_to]) revert AlreadyVoted();
    if (ownerOf(_from) != _msgSender()) revert NotOwner();
    if (ownerOf(_to) != _msgSender()) revert NotOwner();

    address[] memory assetsLocked = s_assetsLocked[_from].values();
    uint256 assetsLockedLength = assetsLocked.length;
    for (uint256 i = 0; i < assetsLockedLength; i++) {
      address asset = assetsLocked[i];
      LpTokenType lpType = s_lpType[asset];

      LockedBalance memory oldLockedTo = s_locked[_to][lpType];
      LockedBalance memory oldLockedFrom = s_locked[_from][lpType];

      if (oldLockedTo.end != 0 && oldLockedTo.end <= block.timestamp) revert LockExpired();
      if (oldLockedFrom.end != 0 && oldLockedFrom.end <= block.timestamp) revert LockExpired();
      if (oldLockedFrom.isPermanent) revert PermanentLock();
      if (oldLockedTo.isPermanent) revert PermanentLock();

      LockedBalance memory newLockedTo;

      newLockedTo.tokenAddress = asset;
      newLockedTo.amount = oldLockedTo.amount + oldLockedFrom.amount;
      newLockedTo.start = oldLockedTo.start < oldLockedFrom.start && oldLockedTo.start != 0
        ? oldLockedTo.start
        : oldLockedFrom.start;
      newLockedTo.end = oldLockedTo.end > oldLockedFrom.end ? oldLockedTo.end : oldLockedFrom.end;
      newLockedTo.boost = _calculateBoost(newLockedTo.end - newLockedTo.start);

      s_locked[_from][lpType] = LockedBalance(address(0), 0, 0, 0, 0, false, 0);
      _checkpoint(_from, LockedBalance(address(0), 0, 0, 0, 0, false, 0), lpType);
      s_locked[_to][lpType] = newLockedTo;
      _checkpoint(_to, newLockedTo, lpType);

      s_assetsLocked[_from].remove(asset);
      if (!s_assetsLocked[_to].contains(asset)) {
        s_assetsLocked[_to].add(asset);
      }

      if (s_underlyingStake[_from][asset] != 0) {
        s_underlyingStake[_to][asset] += s_underlyingStake[_from][asset];
        s_underlyingStake[_from][asset] = 0;
      }
    }
    _burn(_from);
    emit MergeCompleted(_from, _to, assetsLocked, assetsLocked.length);
  }

  /// @inheritdoc IveIONFirstExtension
  function split(
    address _tokenAddress,
    uint256 _from,
    uint256 _splitAmount
  ) external nonReentrant returns (uint256 _tokenId1, uint256 _tokenId2) {
    address ownerFrom = _ownerOf(_from);
    LpTokenType _lpType = s_lpType[_tokenAddress];
    LockedBalance memory oldLocked = s_locked[_from][_lpType];
    uint256 minimumLockAmount = s_minimumLockAmount[_lpType];

    if (s_voted[_from]) revert AlreadyVoted();
    if (!s_canSplit[ownerFrom] && !s_canSplit[address(0)]) revert SplitNotAllowed();
    if (ownerFrom != _msgSender()) revert NotOwner();
    if (oldLocked.end <= block.timestamp && !oldLocked.isPermanent) revert LockExpired();
    if (_splitAmount >= oldLocked.amount) revert AmountTooBig();
    if (_splitAmount < minimumLockAmount) revert SplitTooSmall();
    if (oldLocked.amount - _splitAmount < minimumLockAmount) revert NotEnoughRemainingAfterSplit();

    LockedBalance memory oldLockedTemp = oldLocked;

    oldLocked.amount -= _splitAmount;
    s_locked[_from][_lpType] = oldLocked;
    _checkpoint(_from, oldLocked, _lpType);

    LockedBalance memory splitLocked = oldLockedTemp;
    splitLocked.amount = _splitAmount;
    _tokenId2 = _createSplitVE(ownerFrom, splitLocked, _lpType, _tokenAddress);
    _tokenId1 = _from;

    if (s_underlyingStake[_from][_tokenAddress] != 0) {
      s_underlyingStake[_from][_tokenAddress] -= _splitAmount;
      s_underlyingStake[_tokenId2][_tokenAddress] = _splitAmount;
    }

    emit SplitCompleted(_from, _tokenId1, _tokenId2, _splitAmount, _tokenAddress);
  }

  /// @inheritdoc IveIONFirstExtension
  function claimEmissions(address _tokenAddress) external nonReentrant {
    LpTokenType _lpType = s_lpType[_tokenAddress];
    IStakeStrategy _stakeStrategy = s_stakeStrategy[_lpType];
    if (_stakeStrategy.userStakingWallet(_msgSender()) == address(0)) revert NoUnderlyingStake();
    _stakeStrategy.claim(_msgSender());
    emit EmissionsClaimed(_msgSender(), _tokenAddress);
  }

  /**
   * @notice Overrides the _burn function from ERC721 to include additional logic for bridging.
   * @param tokenId Token ID to burn.
   */
  function _burn(uint256 tokenId) internal override {
    super._burn(tokenId);
  }

  /**
   * @notice Hook that is called before any token transfer. This includes minting
   * and burning. It updates the ownership mappings and handles delegation and
   * staking logic when transferring tokens between addresses.
   *
   * @param from The address which previously owned the token.
   * @param to The address that will receive the token.
   * @param tokenId The ID of the token being transferred.
   */
  function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override {
    super._beforeTokenTransfer(from, to, tokenId);

    if (from != address(0)) s_ownerToTokenIds[from].remove(tokenId);
    if (to != address(0)) s_ownerToTokenIds[to].add(tokenId);

    if (from != address(0) && to != address(0)) {
      address[] memory assetsLocked = s_assetsLocked[tokenId].values();
      uint256 assetsLockedLength = assetsLocked.length;
      for (uint256 i = 0; i < assetsLockedLength; i++) {
        address asset = assetsLocked[i];
        LpTokenType _lpType = s_lpType[asset];

        uint256[] memory delegatees = s_delegatees[tokenId][_lpType].values();
        uint256[] memory amounts = new uint256[](delegatees.length);
        uint256 delegateesLength = delegatees.length;
        for (uint256 j = 0; j < delegateesLength; j++) {
          amounts[j] = type(uint256).max;
        }

        if (delegateesLength != 0) {
          removeDelegatees(tokenId, delegatees, asset, amounts);
        }

        uint256 amountStaked = s_underlyingStake[tokenId][asset];
        if (amountStaked != 0) {
          IStakeStrategy _stakeStrategy = s_stakeStrategy[_lpType];
          _stakeStrategy.transferStakingWallet(from, to, amountStaked);
        }

        LockedBalance memory lock = s_locked[tokenId][_lpType];
        s_userCumulativeAssetValues[from][asset] -= lock.amount;
        s_userCumulativeAssetValues[to][asset] += lock.amount;
      }
    }
  }

  /**
   * @dev Internal function to remove a delegation between two veNFTs.
   * @param fromTokenId ID of the veNFT from which delegation is being removed.
   * @param toTokenId ID of the veNFT to which delegation is being removed.
   * @param lpToken Address of the LP token associated with the delegation.
   * @param amount Amount of delegation to remove.
   */
  function _removeDelegation(uint256 fromTokenId, uint256 toTokenId, address lpToken, uint256 amount) internal {
    LpTokenType lpType = s_lpType[lpToken];
    LockedBalance memory fromLocked = s_locked[fromTokenId][lpType];
    LockedBalance memory toLocked = s_locked[toTokenId][lpType];

    if (ownerOf(fromTokenId) != _msgSender() && ownerOf(toTokenId) != _msgSender()) revert NotOwner();
    if (s_delegations[fromTokenId][toTokenId][lpType] == 0) revert NoDelegationBetweenTokens(fromTokenId, toTokenId);

    amount = amount > s_delegations[fromTokenId][toTokenId][lpType]
      ? s_delegations[fromTokenId][toTokenId][lpType]
      : amount;

    toLocked.delegateAmount -= amount;
    fromLocked.amount += amount;

    s_delegations[fromTokenId][toTokenId][lpType] -= amount;
    if (s_delegations[fromTokenId][toTokenId][lpType] == 0) {
      s_delegatees[fromTokenId][lpType].remove(toTokenId);
      s_delegators[toTokenId][lpType].remove(fromTokenId);
    }

    s_locked[toTokenId][lpType] = toLocked;
    s_locked[fromTokenId][lpType] = fromLocked;
    _checkpoint(toTokenId, s_locked[toTokenId][lpType], lpType);
    _checkpoint(fromTokenId, s_locked[fromTokenId][lpType], lpType);

    if (s_voted[toTokenId]) IVoter(s_voter).poke(toTokenId);
    if (s_voted[fromTokenId]) IVoter(s_voter).poke(fromTokenId);

    emit DelegationRemoved(fromTokenId, toTokenId, lpToken, amount);
  }

  /**
   * @notice Removes delegatees from a specific veNFT
   * @param fromTokenId ID of the veNFT from which delegatees are removed
   * @param toTokenIds Array of veNFT IDs that are delegatees to be removed
   * @param lpToken Address of the LP token associated with the delegation
   * @param amounts Array of amounts of voting power to remove from each delegatee
   */
  function removeDelegatees(
    uint256 fromTokenId,
    uint256[] memory toTokenIds,
    address lpToken,
    uint256[] memory amounts
  ) public nonReentrant {
    if (toTokenIds.length != amounts.length) revert ArrayMismatch();
    uint256 toTokenIdsLength = toTokenIds.length;
    for (uint256 i = 0; i < toTokenIdsLength; i++) {
      _removeDelegation(fromTokenId, toTokenIds[i], lpToken, amounts[i]);
    }
  }

  /// @inheritdoc IveIONFirstExtension
  function allowDelegators(uint256 _tokenId, address _tokenAddress, bool _blocked) external nonReentrant {
    if (ownerOf(_tokenId) != _msgSender()) revert NotOwner();
    s_delegatorsBlocked[_tokenId][_tokenAddress] = _blocked;
    emit DelegatorsBlocked(_tokenId, _tokenAddress, _blocked);
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                           Internal Functions                              ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /**
   * @notice Handles the withdrawal of staked tokens using a specified staking strategy.
   * @param _owner The address of the owner of the stake.
   * @param _withdrawTo The address to which the withdrawn tokens are sent.
   * @param _tokenId The ID of the token being withdrawn.
   * @param _tokenAddress The address of the token being withdrawn.
   * @param _tokenAmount The amount of tokens to withdraw.
   * @param _stakeStrategy The staking strategy to use for withdrawal.
   */
  function _handleTokenWithdrawStake(
    address _owner,
    address _withdrawTo,
    uint256 _tokenId,
    address _tokenAddress,
    uint256 _tokenAmount,
    IStakeStrategy _stakeStrategy
  ) internal {
    _stakeStrategy.claim(_owner);
    _stakeStrategy.withdraw(_owner, _withdrawTo, _tokenAmount);
    s_underlyingStake[_tokenId][_tokenAddress] -= _tokenAmount;
  }

  /**
   * @notice Updates the user point history and epoch for a given token and LP token type.
   * @param _tokenId The ID of the token.
   * @param _newLocked The new locked balance information.
   * @param _lpType The LP token type.
   */
  function _checkpoint(uint256 _tokenId, LockedBalance memory _newLocked, LpTokenType _lpType) internal {
    UserPoint memory uNew;
    uNew.permanent = _newLocked.isPermanent ? _newLocked.amount : 0;
    uNew.permanentDelegate = _newLocked.isPermanent ? _newLocked.delegateAmount : 0;

    if (_newLocked.end > block.timestamp && _newLocked.amount > 0) {
      uNew.slope = _newLocked.amount / _MAXTIME;
      uNew.bias = uNew.slope * (_newLocked.end - block.timestamp);
    }

    uNew.ts = block.timestamp;
    uNew.blk = block.number;
    uint256 userEpoch = s_userPointEpoch[_tokenId][_lpType];
    if (userEpoch != 0 && s_userPointHistory[_tokenId][_lpType][userEpoch].ts == block.timestamp) {
      s_userPointHistory[_tokenId][_lpType][userEpoch] = uNew;
    } else {
      s_userPointEpoch[_tokenId][_lpType] = ++userEpoch;
      s_userPointHistory[_tokenId][_lpType][userEpoch] = uNew;
    }
  }

  /**
   * @notice Calculates the boost for a given lock duration.
   * @param _duration The duration of the lock.
   * @return The calculated boost value.
   */
  function _calculateBoost(uint256 _duration) internal view returns (uint256) {
    uint256 minDuration = s_minimumLockDuration;
    uint256 maxDuration = _MAXTIME;
    uint256 minBoost = 1e18;
    uint256 maxBoost = 2e18;

    if (_duration <= minDuration) {
      return minBoost;
    } else if (_duration >= maxDuration) {
      return maxBoost;
    } else {
      return minBoost + ((_duration - minDuration) * (maxBoost - minBoost)) / (maxDuration - minDuration);
    }
  }

  /**
   * @notice Creates a new split veNFT with specified locked balance and LP token type.
   * @param _to The address to which the new veNFT is attributed.
   * @param _newLocked The locked balance information for the new veNFT.
   * @param _lpType The LP token type.
   * @param _tokenAddress The address of the token being locked.
   * @return _tokenId The ID of the newly created veNFT.
   */
  function _createSplitVE(
    address _to,
    LockedBalance memory _newLocked,
    LpTokenType _lpType,
    address _tokenAddress
  ) private returns (uint256 _tokenId) {
    _tokenId = ++s_tokenId;
    _safeMint(_to, _tokenId);
    s_locked[_tokenId][_lpType] = _newLocked;
    s_assetsLocked[_tokenId].add(_tokenAddress);
    _checkpoint(_tokenId, _newLocked, _lpType);
  }

  /**
   * @notice Retrieves the staking strategy and data for a given LP token type.
   * @param _lpType The LP token type.
   * @return _stakeStrategy The staking strategy for the LP token type.
   * @return _stakeData The staking data for the LP token type.
   */
  function _getStakeStrategy(
    LpTokenType _lpType
  ) internal view returns (IStakeStrategy _stakeStrategy, bytes memory _stakeData) {
    IStakeStrategy strategy = s_stakeStrategy[_lpType];
    return (strategy, "");
  }

  /**
   * @notice Calculates the total boost for a given token ID and LP token type.
   * @param _tokenId The ID of the token.
   * @param _lpType The LP token type.
   * @return The total boost value.
   */
  function _getTotalBoost(uint256 _tokenId, LpTokenType _lpType) internal view returns (uint256) {
    uint256 totalBoost = s_locked[_tokenId][_lpType].boost;
    if (s_limitedBoostActive) totalBoost += s_limitedBoost;
    if (s_veAERO == address(0)) return totalBoost;

    address _owner = ownerOf(_tokenId);
    IAeroVoter aeroVoter = IAeroVoter(s_aeroVoting);
    IAeroVotingEscrow veAERO = IAeroVotingEscrow(s_veAERO);
    uint256 _balance = veAERO.balanceOf(_owner);
    for (uint256 i = 0; i < _balance; i++) {
      uint256 veAeroTokenId = veAERO.ownerToNFTokenIdList(_owner, i);
      uint256 weightToVoteRatio = (aeroVoter.votes(veAeroTokenId, s_ionicPool) * 1e18) / aeroVoter.weights(s_ionicPool);
      totalBoost += (s_aeroVoterBoost * weightToVoteRatio) / 1e18;
    }

    return totalBoost;
  }

  /**
   * @notice Retrieves the ETH price of a given token.
   * @dev Uses the MasterPriceOracle to fetch the price.
   * @param _token The address of the token for which the ETH price is requested.
   * @return The ETH price of the specified token.
   */
  function _getEthPrice(address _token) internal view returns (uint256) {
    IMasterPriceOracle mpo = IMasterPriceOracle(ap.getAddress("MasterPriceOracle"));
    return mpo.price(_token);
  }

  // // ╔═══════════════════════════════════════════════════════════════════════════╗
  // // ║                           View Functions                                  ║
  // // ╚═══════════════════════════════════════════════════════════════════════════╝

  /// @inheritdoc IveIONFirstExtension
  function balanceOfNFT(
    uint256 _tokenId
  ) public view returns (address[] memory _assets, uint256[] memory _balances, uint256[] memory _boosts) {
    address[] memory assetsLocked = s_assetsLocked[_tokenId].values();

    _assets = new address[](assetsLocked.length);
    _balances = new uint256[](assetsLocked.length);
    _boosts = new uint256[](assetsLocked.length);
    uint256 assetsLockedLength = assetsLocked.length;
    for (uint256 i = 0; i < assetsLockedLength; i++) {
      address asset = assetsLocked[i];
      LpTokenType lpType = s_lpType[asset];
      LockedBalance memory lockedBalance = s_locked[_tokenId][lpType];
      _boosts[i] = _getTotalBoost(_tokenId, lpType);
      _assets[i] = asset;
      _balances[i] = BalanceLogicLibrary.balanceOfNFTAt(
        s_userPointEpoch,
        s_userPointHistory,
        lpType,
        _tokenId,
        block.timestamp,
        lockedBalance.isPermanent
      );
    }

    return (_assets, _balances, _boosts);
  }

  /// @inheritdoc IveIONFirstExtension
  function getTotalEthValueOfTokens(address _owner) external view returns (uint256 totalValue) {
    IVoter voter = IVoter(s_voter);
    address[] memory lpTokens = voter.getAllLpRewardTokens();
    uint256 lpTokensLength = lpTokens.length;
    for (uint256 i = 0; i < lpTokensLength; i++) {
      uint256 ethValue = (s_userCumulativeAssetValues[_owner][lpTokens[i]] * _getEthPrice(lpTokens[i])) / PRECISION;
      totalValue += ethValue;
    }
  }

  /**
   * @dev Fallback function that delegates calls to the address returned by `_implementation()`. Will run if no other
   * function in the contract matches the call data.
   */
  fallback() external {
    address impl = veIONSecondExtension;
    require(impl != address(0), "Implementation not set");

    assembly {
      calldatacopy(0, 0, calldatasize())

      let result := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)

      returndatacopy(0, 0, returndatasize())
      switch result
      case 0 {
        revert(0, returndatasize())
      }
      default {
        return(0, returndatasize())
      }
    }
  }
}
