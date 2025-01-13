// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { ERC721Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC721/ERC721Upgradeable.sol";
import { Ownable2StepUpgradeable } from "openzeppelin-contracts-upgradeable/contracts/access/Ownable2StepUpgradeable.sol";
import { IveION, IAeroVotingEscrow, IAeroVoter } from "./interfaces/IveION.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IStakeStrategy } from "./stake/IStakeStrategy.sol";
import { BalanceLogicLibrary } from "./libraries/BalanceLogicLibrary.sol";
import { AddressesProvider } from "../ionic/AddressesProvider.sol";
import { MasterPriceOracle } from "../oracles/MasterPriceOracle.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { IVoter } from "./interfaces/IVoter.sol";
import { ReentrancyGuardUpgradeable } from "openzeppelin-contracts-upgradeable/contracts/security/ReentrancyGuardUpgradeable.sol";

/**
 * @title veION Contract
 * @notice This contract manages the veION framework, enabling the staking and management LP tokens for voting power.
 * @author Jourdan Dunkley <jourdan@ionic.money> (https://github.com/jourdanDunkley)
 */
contract veION is Ownable2StepUpgradeable, ERC721Upgradeable, ReentrancyGuardUpgradeable, IveION {
  using EnumerableSet for EnumerableSet.UintSet;
  using EnumerableSet for EnumerableSet.AddressSet;
  using SafeERC20 for IERC20;

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                                Constants                                  ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  /// @notice Represents the duration of one week in seconds.
  uint256 internal constant WEEK = 1 weeks;
  /// @notice Represents the maximum lock time in seconds (2 years).
  uint256 internal constant MAXTIME = 2 * 365 * 86400;
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
  AddressesProvider public ap;

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

  constructor() {
    _disableInitializers(); // Locks the implementation contract from being initialized
  }

  /**
   * @notice Initializes the veION contract with the given AddressesProvider.
   * @dev This function is called only once during the contract deployment.
   * It initializes the Ownable, ERC721, and ReentrancyGuard modules.
   * @param _ap The AddressesProvider contract used for address management.
   */
  function initialize(AddressesProvider _ap) public initializer {
    __Ownable2Step_init();
    __ERC721_init("veION", "veION");
    __ReentrancyGuard_init();
    ap = _ap;
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                           External Functions                              ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /// @inheritdoc IveION
  function createLockFor(
    address[] memory _tokenAddress,
    uint256[] memory _tokenAmount,
    uint256[] memory _duration,
    bool[] memory _stakeUnderlying,
    address _to
  ) external override nonReentrant returns (uint256) {
    return _createLock(_tokenAddress, _tokenAmount, _duration, _stakeUnderlying, _to);
  }

  /// @inheritdoc IveION
  function createLock(
    address[] calldata _tokenAddress,
    uint256[] calldata _tokenAmount,
    uint256[] calldata _duration,
    bool[] memory _stakeUnderlying
  ) external override nonReentrant returns (uint256) {
    return _createLock(_tokenAddress, _tokenAmount, _duration, _stakeUnderlying, msg.sender);
  }

  /// @inheritdoc IveION
  function increaseAmount(
    address _tokenAddress,
    uint256 _tokenId,
    uint256 _tokenAmount,
    bool _stakeUnderlying
  ) external nonReentrant {
    LpTokenType _lpType = s_lpType[_tokenAddress];
    LockedBalance memory oldLocked = s_locked[_tokenId][_lpType];

    if (ownerOf(_tokenId) != _msgSender()) revert NotOwner();
    if (_tokenAmount == 0) revert ZeroAmount();
    if (oldLocked.amount == 0) revert NoLockFound();
    if (oldLocked.end <= block.timestamp && !oldLocked.isPermanent) revert LockExpired();

    if (oldLocked.isPermanent) s_permanentLockBalance[_lpType] += _tokenAmount;

    _depositFor(
      _tokenAddress,
      _tokenId,
      _tokenAmount,
      0,
      _stakeUnderlying,
      oldLocked,
      DepositType.INCREASE_LOCK_AMOUNT,
      _lpType,
      _msgSender()
    );
  }

  /// @inheritdoc IveION
  function lockAdditionalAsset(
    address _tokenAddress,
    uint256 _tokenAmount,
    uint256 _tokenId,
    uint256 _duration,
    bool _stakeUnderlying
  ) external nonReentrant {
    LpTokenType lpType = s_lpType[_tokenAddress];
    LockedBalance storage lockedBalance = s_locked[_tokenId][lpType];
    uint256 unlockTime = ((block.timestamp + _duration) / WEEK) * WEEK;

    if (ownerOf(_tokenId) != _msgSender()) revert NotOwner();
    if (_tokenAmount == 0) revert ZeroAmount();
    if (s_voted[_tokenId]) revert AlreadyVoted();
    if (!s_assetsLocked[_tokenId].add(_tokenAddress)) revert DuplicateAsset();
    if (_tokenAmount < s_minimumLockAmount[lpType]) revert MinimumNotMet();
    if (unlockTime > block.timestamp + MAXTIME) revert LockDurationTooLong();
    if (_duration < s_minimumLockDuration) revert LockDurationTooShort();

    if (lockedBalance.isPermanent) s_permanentLockBalance[lpType] += _tokenAmount;

    _depositFor(
      _tokenAddress,
      _tokenId,
      _tokenAmount,
      unlockTime,
      _stakeUnderlying,
      lockedBalance,
      DepositType.LOCK_ADDITIONAL,
      lpType,
      _msgSender()
    );
  }

  /// @inheritdoc IveION
  function increaseUnlockTime(address _tokenAddress, uint256 _tokenId, uint256 _lockDuration) external nonReentrant {
    LpTokenType _lpType = s_lpType[_tokenAddress];
    LockedBalance memory oldLocked = s_locked[_tokenId][_lpType];
    uint256 unlockTime = ((block.timestamp + _lockDuration) / WEEK) * WEEK; // Locktime is rounded down to weeks

    if (ownerOf(_tokenId) != _msgSender()) revert NotOwner();
    if (oldLocked.isPermanent) revert PermanentLock();
    if (oldLocked.end <= block.timestamp) revert LockExpired();
    if (oldLocked.amount <= 0) revert NoLockFound();
    if (unlockTime <= oldLocked.end) revert LockDurationNotInFuture();
    if (unlockTime > block.timestamp + MAXTIME) revert LockDurationTooLong();

    _depositFor(
      _tokenAddress,
      _tokenId,
      0,
      unlockTime,
      false,
      oldLocked,
      DepositType.INCREASE_UNLOCK_TIME,
      _lpType,
      _msgSender()
    );
  }

  /// @inheritdoc IveION
  function withdraw(address _tokenAddress, uint256 _tokenId) external override nonReentrant {
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
    for (uint256 i = 0; i < lockedAssets.length; i++) {
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

  /// @inheritdoc IveION
  function merge(uint256 _from, uint256 _to) external nonReentrant {
    if (_from == _to) revert SameNFT();
    if (s_voted[_from] || s_voted[_to]) revert AlreadyVoted();
    if (ownerOf(_from) != _msgSender()) revert NotOwner();
    if (ownerOf(_to) != _msgSender()) revert NotOwner();

    address[] memory assetsLocked = s_assetsLocked[_from].values();

    for (uint256 i = 0; i < assetsLocked.length; i++) {
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

  /// @inheritdoc IveION
  function split(
    address _tokenAddress,
    uint256 _from,
    uint256 _splitAmount
  ) external nonReentrant returns (uint256 _tokenId1, uint256 _tokenId2) {
    address owner = _ownerOf(_from);
    LpTokenType _lpType = s_lpType[_tokenAddress];
    LockedBalance memory oldLocked = s_locked[_from][_lpType];
    uint256 minimumLockAmount = s_minimumLockAmount[_lpType];

    if (s_voted[_from]) revert AlreadyVoted();
    if (!s_canSplit[owner] && !s_canSplit[address(0)]) revert SplitNotAllowed();
    if (ownerOf(_from) != _msgSender()) revert NotOwner();
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
    _tokenId2 = _createSplitVE(owner, splitLocked, _lpType, _tokenAddress);
    _tokenId1 = _from;

    if (s_underlyingStake[_from][_tokenAddress] != 0) {
      s_underlyingStake[_from][_tokenAddress] -= _splitAmount;
      s_underlyingStake[_tokenId2][_tokenAddress] = _splitAmount;
    }

    emit SplitCompleted(_from, _tokenId1, _tokenId2, _splitAmount, _tokenAddress);
  }

  /// @inheritdoc IveION
  function toggleSplit(address _account, bool _isAllowed) external onlyOwner {
    s_canSplit[_account] = _isAllowed;
    emit SplitToggle(_account, _isAllowed);
  }

  /// @inheritdoc IveION
  function lockPermanent(address _tokenAddress, uint256 _tokenId) external nonReentrant {
    LpTokenType _lpType = s_lpType[_tokenAddress];
    LockedBalance memory _newLocked = s_locked[_tokenId][_lpType];
    if (ownerOf(_tokenId) != _msgSender()) revert NotOwner();
    if (_newLocked.isPermanent) revert PermanentLock();
    if (_newLocked.end <= block.timestamp) revert LockExpired();
    if (_newLocked.amount <= 0) revert NoLockFound();

    s_permanentLockBalance[_lpType] += _newLocked.amount;
    _newLocked.end = 0;
    _newLocked.isPermanent = true;
    _newLocked.boost = _calculateBoost(MAXTIME);

    s_locked[_tokenId][_lpType] = _newLocked;
    _checkpoint(_tokenId, _newLocked, _lpType);

    emit PermanentLockCreated(_tokenAddress, _tokenId, _newLocked.amount);
  }

  /// @inheritdoc IveION
  function unlockPermanent(address _tokenAddress, uint256 _tokenId) external nonReentrant {
    LpTokenType _lpType = s_lpType[_tokenAddress];
    LockedBalance memory _newLocked = s_locked[_tokenId][_lpType];
    if (ownerOf(_tokenId) != _msgSender()) revert NotOwner();
    if (!_newLocked.isPermanent) revert NotPermanentLock();
    if (s_delegatees[_tokenId][_lpType].length() != 0) revert TokenHasDelegatees();
    if (s_delegators[_tokenId][_lpType].length() != 0) revert TokenHasDelegators();

    s_permanentLockBalance[_lpType] -= _newLocked.amount;
    _newLocked.end = ((block.timestamp + MAXTIME) / WEEK) * WEEK;
    _newLocked.isPermanent = false;

    s_locked[_tokenId][_lpType] = _newLocked;
    _checkpoint(_tokenId, _newLocked, _lpType);

    emit PermanentLockRemoved(_tokenAddress, _tokenId, _newLocked.amount);
  }

  /// @inheritdoc IveION
  function delegate(uint256 fromTokenId, uint256 toTokenId, address lpToken, uint256 amount) external nonReentrant {
    LpTokenType lpType = s_lpType[lpToken];
    LockedBalance memory fromLocked = s_locked[fromTokenId][lpType];
    LockedBalance memory toLocked = s_locked[toTokenId][lpType];

    if (ownerOf(fromTokenId) != _msgSender()) revert NotOwner();
    if (amount > fromLocked.amount) revert AmountTooBig();
    if (!fromLocked.isPermanent) revert NotPermanentLock();
    if (!toLocked.isPermanent) revert NotPermanentLock();
    if (s_delegatorsBlocked[toTokenId][lpToken]) revert NotAcceptingDelegators();

    fromLocked.amount -= amount;
    toLocked.delegateAmount += amount;

    if (s_delegations[fromTokenId][toTokenId][lpType] == 0) {
      s_delegatees[fromTokenId][lpType].add(toTokenId);
      s_delegators[toTokenId][lpType].add(fromTokenId);
    }

    s_delegations[fromTokenId][toTokenId][lpType] += amount;

    s_locked[fromTokenId][lpType] = fromLocked;
    s_locked[toTokenId][lpType] = toLocked;
    _checkpoint(fromTokenId, s_locked[fromTokenId][lpType], lpType);
    _checkpoint(toTokenId, s_locked[toTokenId][lpType], lpType);

    if (s_voted[toTokenId]) IVoter(s_voter).poke(toTokenId);
    if (s_voted[fromTokenId]) IVoter(s_voter).poke(fromTokenId);

    emit Delegated(fromTokenId, toTokenId, lpToken, amount);
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

  /// @inheritdoc IveION
  function removeDelegatees(
    uint256 fromTokenId,
    uint256[] memory toTokenIds,
    address lpToken,
    uint256[] memory amounts
  ) public nonReentrant {
    if (toTokenIds.length != amounts.length) revert ArrayMismatch();
    for (uint256 i = 0; i < toTokenIds.length; i++) {
      _removeDelegation(fromTokenId, toTokenIds[i], lpToken, amounts[i]);
    }
  }

  /// @inheritdoc IveION
  function removeDelegators(
    uint256[] memory fromTokenIds,
    uint256 toTokenId,
    address lpToken,
    uint256[] memory amounts
  ) external nonReentrant {
    if (fromTokenIds.length != amounts.length) revert ArrayMismatch();
    for (uint256 i = 0; i < fromTokenIds.length; i++) {
      _removeDelegation(fromTokenIds[i], toTokenId, lpToken, amounts[i]);
    }
  }

  /// @inheritdoc IveION
  function claimEmissions(address _tokenAddress) external nonReentrant {
    LpTokenType _lpType = s_lpType[_tokenAddress];
    IStakeStrategy _stakeStrategy = s_stakeStrategy[_lpType];
    if (_stakeStrategy.userStakingWallet(msg.sender) == address(0)) revert NoUnderlyingStake();
    _stakeStrategy.claim(msg.sender);
    emit EmissionsClaimed(msg.sender, _tokenAddress);
  }

  function allowDelegators(uint256 _tokenId, address _tokenAddress, bool _blocked) external nonReentrant {
    if (ownerOf(_tokenId) != _msgSender()) revert NotOwner();
    s_delegatorsBlocked[_tokenId][_tokenAddress] = _blocked;
    emit DelegatorsBlocked(_tokenId, _tokenAddress, _blocked);
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
      for (uint256 i = 0; i < assetsLocked.length; i++) {
        address asset = assetsLocked[i];
        LpTokenType _lpType = s_lpType[asset];

        uint256[] memory delegatees = s_delegatees[tokenId][_lpType].values();
        uint256[] memory amounts = new uint256[](delegatees.length);
        for (uint256 j = 0; j < delegatees.length; j++) {
          amounts[j] = type(uint256).max;
        }

        if (delegatees.length != 0) {
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

  /// @inheritdoc IveION
  function whitelistTokens(address[] memory _tokens, bool[] memory _isWhitelisted) external onlyOwner {
    require(_tokens.length == _isWhitelisted.length, "Unequal Arrays");
    for (uint256 i; i < _tokens.length; i++) s_whitelistedToken[_tokens[i]] = _isWhitelisted[i];
    emit TokensWhitelisted(_tokens, _isWhitelisted);
  }

  /// @inheritdoc IveION
  function voting(uint256 _tokenId, bool _voting) external {
    if (_msgSender() != s_voter) revert NotVoter();
    s_voted[_tokenId] = _voting;
    emit Voted(_tokenId, _voting);
  }

  /// @inheritdoc IveION
  function withdrawProtocolFees(address _tokenAddress, address _recipient) external onlyOwner {
    LpTokenType lpType = s_lpType[_tokenAddress];
    uint256 protocolFees = s_protocolFees[lpType];
    require(protocolFees > 0, "No protocol fees available");
    s_protocolFees[lpType] = 0;
    IERC20(_tokenAddress).safeTransfer(_recipient, protocolFees);
    emit ProtocolFeesWithdrawn(_tokenAddress, _recipient, protocolFees);
  }

  /// @inheritdoc IveION
  function withdrawDistributedFees(address _tokenAddress, address _recipient) external onlyOwner {
    LpTokenType lpType = s_lpType[_tokenAddress];
    uint256 distributedFees = s_distributedFees[lpType];
    require(distributedFees > 0, "No distributed fees available");
    s_distributedFees[lpType] = 0;
    IERC20(_tokenAddress).safeTransfer(_recipient, distributedFees);
    emit DistributedFeesWithdrawn(_tokenAddress, _recipient, distributedFees);
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                           Internal Functions                              ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  struct DepositVars {
    uint256 supplyBefore;
    uint256 totalLockTime;
    LockedBalance newLocked;
    address from;
  }

  /**
   * @notice Deposits tokens for a specific veNFT, updating its locked balance and boost.
   * @dev This function handles the deposit logic for veNFTs, including updating the locked balance,
   *      calculating the boost based on the lock duration, and transferring tokens.
   * @param _tokenAddress The address of the token to deposit.
   * @param _tokenId The ID of the veNFT to deposit tokens for.
   * @param _tokenAmount The amount of tokens to deposit.
   * @param _unlockTime The time at which the lock will expire.
   * @param _stakeUnderlying A boolean indicating whether to stake the underlying tokens.
   * @param _oldLocked The previous locked balance of the veNFT.
   * @param _depositType The type of deposit being made.
   * @param _lpType The LP token type associated with the deposit.
   * @param _to The address to which the veNFT is assigned.
   */
  function _depositFor(
    address _tokenAddress,
    uint256 _tokenId,
    uint256 _tokenAmount,
    uint256 _unlockTime,
    bool _stakeUnderlying,
    LockedBalance memory _oldLocked,
    DepositType _depositType,
    LpTokenType _lpType,
    address _to
  ) internal {
    if (!s_whitelistedToken[_tokenAddress]) revert TokenNotWhitelisted();

    DepositVars memory vars;
    vars.supplyBefore = s_supply[_lpType];
    s_supply[_lpType] = vars.supplyBefore + _tokenAmount;

    (
      vars.newLocked.tokenAddress,
      vars.newLocked.amount,
      vars.newLocked.start,
      vars.newLocked.end,
      vars.newLocked.isPermanent,
      vars.newLocked.boost
    ) = (
      _oldLocked.tokenAddress,
      _oldLocked.amount,
      _oldLocked.start,
      _oldLocked.end,
      _oldLocked.isPermanent,
      _oldLocked.boost
    );

    vars.newLocked.tokenAddress = _tokenAddress;
    vars.newLocked.amount += _tokenAmount;
    if (_unlockTime != 0) {
      if (vars.newLocked.start == 0) vars.newLocked.start = block.timestamp;
      vars.newLocked.end = _unlockTime;
      vars.totalLockTime = vars.newLocked.end - vars.newLocked.start;
      vars.newLocked.boost = _calculateBoost(vars.totalLockTime);
    }
    s_locked[_tokenId][_lpType] = vars.newLocked;

    _checkpoint(_tokenId, vars.newLocked, _lpType);

    vars.from = _msgSender();
    if (_tokenAmount != 0) {
      s_userCumulativeAssetValues[ownerOf(_tokenId)][_tokenAddress] += _tokenAmount;
      IERC20(_tokenAddress).safeTransferFrom(vars.from, address(this), _tokenAmount);
      (IStakeStrategy _stakeStrategy, bytes memory _stakeData) = _getStakeStrategy(_lpType);
      if (address(_stakeStrategy) != address(0) && _stakeUnderlying) {
        _handleTokenStake(_to, _tokenId, _tokenAddress, _tokenAmount, _stakeStrategy, _stakeData);
      }
    }

    emit Deposit(_to, _tokenId, _depositType, _tokenAmount, vars.newLocked.end, block.timestamp);
    emit Supply(vars.supplyBefore, s_supply[_lpType]);
  }

  /**
   * @notice Handles the staking of tokens using a specified staking strategy.
   * @param _to The address to which the stake is attributed.
   * @param _tokenId The ID of the token being staked.
   * @param _tokenAddress The address of the token being staked.
   * @param _tokenAmount The amount of tokens to stake.
   * @param _stakeStrategy The staking strategy to use.
   * @param _stakeData Additional data required for staking.
   */
  function _handleTokenStake(
    address _to,
    uint256 _tokenId,
    address _tokenAddress,
    uint256 _tokenAmount,
    IStakeStrategy _stakeStrategy,
    bytes memory _stakeData
  ) internal {
    IERC20(_tokenAddress).approve(address(_stakeStrategy), _tokenAmount);
    _stakeStrategy.stake(_to, _tokenAmount, _stakeData);
    s_underlyingStake[_tokenId][_tokenAddress] += _tokenAmount;
  }

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
      uNew.slope = _newLocked.amount / MAXTIME;
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
   * @notice Creates a lock for multiple tokens with specified durations and staking options.
   * @param _tokenAddress Array of token addresses to lock.
   * @param _tokenAmount Array of token amounts to lock.
   * @param _duration Array of durations for each lock.
   * @param _stakeUnderlying Array of booleans indicating whether to stake the underlying tokens.
   * @param _to The address to which the lock is attributed.
   * @return The ID of the newly created lock.
   */
  function _createLock(
    address[] memory _tokenAddress,
    uint256[] memory _tokenAmount,
    uint256[] memory _duration,
    bool[] memory _stakeUnderlying,
    address _to
  ) internal returns (uint256) {
    uint256 _tokenId = ++s_tokenId;
    uint256 _length = _tokenAddress.length;
    _safeMint(_to, _tokenId);

    if (
      _tokenAddress.length != _tokenAmount.length ||
      _tokenAmount.length != _duration.length ||
      _duration.length != _stakeUnderlying.length
    ) {
      revert ArrayMismatch();
    }

    for (uint i = 0; i < _length; i++) {
      LpTokenType _lpType = s_lpType[_tokenAddress[i]];
      uint256 unlockTime = ((block.timestamp + _duration[i]) / WEEK) * WEEK;

      if (!s_assetsLocked[_tokenId].add(_tokenAddress[i])) revert DuplicateAsset();
      if (_tokenAmount[i] == 0) revert ZeroAmount();
      if (_duration[i] < s_minimumLockDuration) revert LockDurationTooShort();
      if (unlockTime > block.timestamp + MAXTIME) revert LockDurationTooLong();
      if (_tokenAmount[i] < s_minimumLockAmount[_lpType]) revert MinimumNotMet();

      _depositFor(
        _tokenAddress[i],
        _tokenId,
        _tokenAmount[i],
        unlockTime,
        _stakeUnderlying[i],
        s_locked[_tokenId][_lpType],
        DepositType.CREATE_LOCK_TYPE,
        _lpType,
        _to
      );
    }
    return _tokenId;
  }

  /**
   * @notice Calculates the boost for a given lock duration.
   * @param _duration The duration of the lock.
   * @return The calculated boost value.
   */
  function _calculateBoost(uint256 _duration) internal view returns (uint256) {
    uint256 minDuration = s_minimumLockDuration;
    uint256 maxDuration = MAXTIME;
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

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                           Setter Functions                                ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /// @inheritdoc IveION
  function toggleLimitedBoost(bool _isBoosted) external onlyOwner {
    s_limitedBoostActive = _isBoosted;
    emit LimitedBoostToggled(_isBoosted);
  }

  /// @inheritdoc IveION
  function setLimitedTimeBoost(uint256 _boostAmount) external onlyOwner {
    require(_boostAmount > 0, "Boost amount must be greater than zero");
    s_limitedBoost = _boostAmount;
    emit LimitedTimeBoostSet(_boostAmount);
  }

  /// @inheritdoc IveION
  function setVoter(address _voter) external onlyOwner {
    require(address(_voter) != address(0), "Invalid address");
    s_voter = _voter;
    emit VoterSet(_voter);
  }

  /// @inheritdoc IveION
  function setMinimumLockAmount(address _tokenAddress, uint256 _minimumAmount) external onlyOwner {
    require(_minimumAmount > 0, "Minimum amount must be greater than zero");
    LpTokenType lpType = s_lpType[_tokenAddress];
    s_minimumLockAmount[lpType] = _minimumAmount;
    emit MinimumLockAmountSet(_tokenAddress, _minimumAmount);
  }

  /// @inheritdoc IveION
  function setMinimumLockDuration(uint256 _minimumLockDuration) external onlyOwner {
    require(_minimumLockDuration > 0, "Minimum lock duration must be greater than zero");
    s_minimumLockDuration = _minimumLockDuration;
    emit MinimumLockDurationSet(_minimumLockDuration);
  }

  /// @inheritdoc IveION
  function setIonicPool(address _ionicPool) external onlyOwner {
    require(address(_ionicPool) != address(0), "Invalid address");
    s_ionicPool = _ionicPool;
    emit IonicPoolSet(_ionicPool);
  }

  /// @inheritdoc IveION
  function setAeroVoting(address _aeroVoting) external onlyOwner {
    require(address(_aeroVoting) != address(0), "Invalid address");
    s_aeroVoting = _aeroVoting;
    emit AeroVotingSet(_aeroVoting);
  }

  /// @inheritdoc IveION
  function setAeroVoterBoost(uint256 _aeroVoterBoost) external onlyOwner {
    require(_aeroVoterBoost > 0, "Aero Boost amount must be greater than zero");
    s_aeroVoterBoost = _aeroVoterBoost;
    emit AeroVoterBoostSet(_aeroVoterBoost);
  }

  /// @inheritdoc IveION
  function setMaxEarlyWithdrawFee(uint256 _maxEarlyWithdrawFee) external onlyOwner {
    require(_maxEarlyWithdrawFee > 0, "Max early withdraw fee must be greater than zero");
    s_maxEarlyWithdrawFee = _maxEarlyWithdrawFee;
    emit MaxEarlyWithdrawFeeSet(_maxEarlyWithdrawFee);
  }

  /// @inheritdoc IveION
  function setLpTokenType(address _token, LpTokenType _type) external onlyOwner {
    require(_token != address(0), "Invalid token address");
    s_lpType[_token] = _type;
    emit LpTokenTypeSet(_token, _type);
  }

  /// @inheritdoc IveION
  function setStakeStrategy(LpTokenType _lpType, IStakeStrategy _strategy) external onlyOwner {
    require(address(_strategy) != address(0), "Invalid strategy address");
    s_stakeStrategy[_lpType] = IStakeStrategy(_strategy);
    emit StakeStrategySet(_lpType, address(_strategy));
  }

  /// @inheritdoc IveION
  function setVeAERO(address _veAERO) external onlyOwner {
    require(_veAERO != address(0), "Invalid veAERO address");
    s_veAERO = _veAERO;
    emit VeAEROSet(_veAERO);
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                           View Functions                                  ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /// @inheritdoc IveION
  function balanceOfNFT(
    uint256 _tokenId
  ) public view returns (address[] memory _assets, uint256[] memory _balances, uint256[] memory _boosts) {
    address[] memory assetsLocked = s_assetsLocked[_tokenId].values();

    _assets = new address[](assetsLocked.length);
    _balances = new uint256[](assetsLocked.length);
    _boosts = new uint256[](assetsLocked.length);

    for (uint256 i = 0; i < assetsLocked.length; i++) {
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

  /// @inheritdoc IveION
  function getUserLock(uint256 _tokenId, LpTokenType _lpType) external view returns (LockedBalance memory) {
    return s_locked[_tokenId][_lpType];
  }

  /// @inheritdoc IveION
  function getOwnedTokenIds(address _owner) external view returns (uint256[] memory) {
    return s_ownerToTokenIds[_owner].values();
  }

  /// @inheritdoc IveION
  function getTotalEthValueOfTokens(address _owner) external view returns (uint256 totalValue) {
    IVoter voter = IVoter(s_voter);
    address[] memory lpTokens = voter.getAllLpRewardTokens();
    for (uint256 i = 0; i < lpTokens.length; i++) {
      uint256 ethValue = (s_userCumulativeAssetValues[_owner][lpTokens[i]] * _getEthPrice(lpTokens[i])) / PRECISION;
      totalValue += ethValue;
    }
  }

  /**
   * @notice Retrieves the ETH price of a given token.
   * @dev Uses the MasterPriceOracle to fetch the price.
   * @param _token The address of the token for which the ETH price is requested.
   * @return The ETH price of the specified token.
   */
  function _getEthPrice(address _token) internal view returns (uint256) {
    MasterPriceOracle mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));
    return mpo.price(_token);
  }

  /// @inheritdoc IveION
  function getAssetsLocked(uint256 _tokenId) external view returns (address[] memory) {
    return s_assetsLocked[_tokenId].values();
  }

  /// @inheritdoc IveION
  function getDelegatees(uint256 _tokenId, LpTokenType _lpType) external view returns (uint256[] memory) {
    return s_delegatees[_tokenId][_lpType].values();
  }

  /// @inheritdoc IveION
  function getDelegators(uint256 _tokenId, LpTokenType _lpType) external view returns (uint256[] memory) {
    return s_delegators[_tokenId][_lpType].values();
  }

  /// @inheritdoc IveION
  function getUserPoint(
    uint256 _tokenId,
    LpTokenType _lpType,
    uint256 _epoch
  ) external view returns (UserPoint memory) {
    return s_userPointHistory[_tokenId][_lpType][_epoch];
  }
}
