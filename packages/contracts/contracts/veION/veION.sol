// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

import { ERC721Upgradeable } from "@openzeppelin-contracts-upgradeable/contracts/token/ERC721/ERC721Upgradeable.sol";
import { Ownable2StepUpgradeable } from "@openzeppelin-contracts-upgradeable/contracts/access/Ownable2StepUpgradeable.sol";
import { IveIONCore, IMasterPriceOracle, IAeroVotingEscrow, IAeroVoter } from "./interfaces/IveIONCore.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IVoter } from "./interfaces/IVoter.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin-contracts-upgradeable/contracts/security/ReentrancyGuardUpgradeable.sol";
import { veIONStorage } from "./veIONStorage.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { IAddressesProvider } from "./interfaces/IveIONCore.sol";
import { IStakeStrategy } from "./stake/IStakeStrategy.sol";

/**
 * @title veION Contract
 * @notice This contract manages the veION framework, enabling the staking and management LP tokens for voting power.
 * @author Jourdan Dunkley <jourdan@ionic.money> (https://github.com/jourdanDunkley)
 */
contract veION is Ownable2StepUpgradeable, ERC721Upgradeable, ReentrancyGuardUpgradeable, veIONStorage, IveIONCore {
  using EnumerableSet for EnumerableSet.UintSet;
  using EnumerableSet for EnumerableSet.AddressSet;
  using SafeERC20 for IERC20;

  constructor() {
    _disableInitializers(); // Locks the implementation contract from being initialized
  }

  /**
   * @notice Initializes the veION contract with the given AddressesProvider.
   * @dev This function is called only once during the contract deployment.
   * It initializes the Ownable, ERC721, and ReentrancyGuard modules.
   * @param _ap The AddressesProvider contract used for address management.
   */
  function initialize(IAddressesProvider _ap) public initializer {
    __Ownable2Step_init();
    __ERC721_init("veION", "veION");
    __ReentrancyGuard_init();
    ap = _ap;
    emit Initialized(address(_ap));
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                           External Functions                              ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /// @inheritdoc IveIONCore
  function createLockFor(
    address[] calldata _tokenAddress,
    uint256[] calldata _tokenAmount,
    uint256[] calldata _duration,
    bool[] memory _stakeUnderlying,
    address _to
  ) external override nonReentrant returns (uint256) {
    return _createLock(_tokenAddress, _tokenAmount, _duration, _stakeUnderlying, _to);
  }

  /// @inheritdoc IveIONCore
  function createLock(
    address[] calldata _tokenAddress,
    uint256[] calldata _tokenAmount,
    uint256[] calldata _duration,
    bool[] memory _stakeUnderlying
  ) external override nonReentrant returns (uint256) {
    return _createLock(_tokenAddress, _tokenAmount, _duration, _stakeUnderlying, _msgSender());
  }

  /// @inheritdoc IveIONCore
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

  /// @inheritdoc IveIONCore
  function lockAdditionalAsset(
    address _tokenAddress,
    uint256 _tokenAmount,
    uint256 _tokenId,
    uint256 _duration,
    bool _stakeUnderlying
  ) external nonReentrant {
    LpTokenType lpType = s_lpType[_tokenAddress];
    LockedBalance storage lockedBalance = s_locked[_tokenId][lpType];
    uint256 unlockTime = ((block.timestamp + _duration) / _WEEK) * _WEEK;

    if (ownerOf(_tokenId) != _msgSender()) revert NotOwner();
    if (_tokenAmount == 0) revert ZeroAmount();
    if (s_voted[_tokenId]) revert AlreadyVoted();
    if (!s_assetsLocked[_tokenId].add(_tokenAddress)) revert DuplicateAsset();
    if (_tokenAmount < s_minimumLockAmount[lpType]) revert MinimumNotMet();
    if (unlockTime > block.timestamp + _MAXTIME) revert LockDurationTooLong();
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

  /// @inheritdoc IveIONCore
  function increaseUnlockTime(address _tokenAddress, uint256 _tokenId, uint256 _lockDuration) external nonReentrant {
    LpTokenType _lpType = s_lpType[_tokenAddress];
    LockedBalance memory oldLocked = s_locked[_tokenId][_lpType];
    uint256 unlockTime = ((block.timestamp + _lockDuration) / _WEEK) * _WEEK; // Locktime is rounded down to weeks

    if (ownerOf(_tokenId) != _msgSender()) revert NotOwner();
    if (oldLocked.isPermanent) revert PermanentLock();
    if (oldLocked.end <= block.timestamp) revert LockExpired();
    if (oldLocked.amount <= 0) revert NoLockFound();
    if (unlockTime <= oldLocked.end) revert LockDurationNotInFuture();
    if (unlockTime > block.timestamp + _MAXTIME) revert LockDurationTooLong();

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

  /// @inheritdoc IveIONCore
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

  /// @inheritdoc IveIONCore
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

  /// @inheritdoc IveIONCore
  function removeDelegators(
    uint256[] memory fromTokenIds,
    uint256 toTokenId,
    address lpToken,
    uint256[] memory amounts
  ) external nonReentrant {
    if (fromTokenIds.length != amounts.length) revert ArrayMismatch();
    uint256 fromTokenIdsLength = fromTokenIds.length;
    for (uint256 i = 0; i < fromTokenIdsLength; i++) {
      _removeDelegation(fromTokenIds[i], toTokenId, lpToken, amounts[i]);
    }
  }

  /// @inheritdoc IveIONCore
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
    _newLocked.boost = _calculateBoost(_MAXTIME);

    s_locked[_tokenId][_lpType] = _newLocked;
    _checkpoint(_tokenId, _newLocked, _lpType);

    emit PermanentLockCreated(_tokenAddress, _tokenId, _newLocked.amount);
  }

  /// @inheritdoc IveIONCore
  function unlockPermanent(address _tokenAddress, uint256 _tokenId) external nonReentrant {
    LpTokenType _lpType = s_lpType[_tokenAddress];
    LockedBalance memory _newLocked = s_locked[_tokenId][_lpType];
    if (ownerOf(_tokenId) != _msgSender()) revert NotOwner();
    if (!_newLocked.isPermanent) revert NotPermanentLock();
    if (s_delegatees[_tokenId][_lpType].length() != 0) revert TokenHasDelegatees();
    if (s_delegators[_tokenId][_lpType].length() != 0) revert TokenHasDelegators();

    s_permanentLockBalance[_lpType] -= _newLocked.amount;
    _newLocked.end = ((block.timestamp + _MAXTIME) / _WEEK) * _WEEK;
    _newLocked.isPermanent = false;

    s_locked[_tokenId][_lpType] = _newLocked;
    _checkpoint(_tokenId, _newLocked, _lpType);

    emit PermanentLockRemoved(_tokenAddress, _tokenId, _newLocked.amount);
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

  /// @inheritdoc IveIONCore
  function voting(uint256 _tokenId, bool _voting) external {
    if (_msgSender() != s_voter) revert NotVoter();
    s_voted[_tokenId] = _voting;
    emit Voted(_tokenId, _voting);
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

    for (uint256 i = 0; i < _length; i++) {
      LpTokenType _lpType = s_lpType[_tokenAddress[i]];
      uint256 unlockTime = ((block.timestamp + _duration[i]) / _WEEK) * _WEEK;

      if (!s_assetsLocked[_tokenId].add(_tokenAddress[i])) revert DuplicateAsset();
      if (_tokenAmount[i] == 0) revert ZeroAmount();
      if (_duration[i] < s_minimumLockDuration) revert LockDurationTooShort();
      if (unlockTime > block.timestamp + _MAXTIME) revert LockDurationTooLong();
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

  /// @inheritdoc IveIONCore
  function setExtensions(address _veIONFirstExtension, address _veIONSecondExtension) external onlyOwner {
    require(_veIONFirstExtension != address(0), "Invalid implementation address");
    veIONFirstExtension = _veIONFirstExtension;
    veIONSecondExtension = _veIONSecondExtension;
    emit ExtensionsSet(_veIONFirstExtension, _veIONSecondExtension);
  }

  /**
   * @dev Fallback function that delegates calls to the address returned by `_implementation()`. Will run if no other
   * function in the contract matches the call data.
   */
  fallback() external {
    address impl = veIONFirstExtension;
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
