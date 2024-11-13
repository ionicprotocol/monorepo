// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { ERC721Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC721/ERC721Upgradeable.sol";
import { Ownable2StepUpgradeable } from "openzeppelin-contracts-upgradeable/contracts/access/Ownable2StepUpgradeable.sol";
import { IveION } from "./interfaces/IveION.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IStakeStrategy } from "./stake/IStakeStrategy.sol";
import { BalanceLogicLibrary } from "./libraries/BalanceLogicLibrary.sol";
import { AddressesProvider } from "../ionic/AddressesProvider.sol";
import { MasterPriceOracle } from "../oracles/MasterPriceOracle.sol";
import { SafeCast } from "@openzeppelin/contracts/utils/math/SafeCast.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { IVoter } from "./interfaces/IVoter.sol";

contract veION is Ownable2StepUpgradeable, ERC721Upgradeable, IveION {
  using EnumerableSet for EnumerableSet.UintSet;
  using EnumerableSet for EnumerableSet.AddressSet;
  using SafeERC20 for IERC20;
  using SafeCast for uint256;
  using SafeCast for int256;

  // Constants
  uint256 internal constant WEEK = 1 weeks;
  uint256 internal constant MAXTIME = 2 * 365 * 86400;
  uint256 public constant PRECISION = 1e18;

  // State Variables
  uint256 public s_tokenId;
  uint256 public s_limitedBoost;
  bool public s_limitedBoostActive;
  address public s_veAERO;
  address public s_aeroVoting;
  address public s_ionicPool;
  address public s_voter;
  uint256 public s_aeroVoterBoost;
  uint256 public s_minimumLockDuration;
  uint256 public s_maxEarlyWithdrawFee;
  AddressesProvider public ap;

  // Mappings
  mapping(LpTokenType => uint256) public s_minimumLockAmount;
  mapping(address => bool) public s_whitelistedToken;
  mapping(address => LpTokenType) public s_lpType;
  mapping(address => bool) public s_canSplit;
  mapping(uint256 => mapping(LpTokenType => LockedBalance)) public s_locked; // tokenid => lpType => LockedBalance
  mapping(uint256 => mapping(LpTokenType => uint256)) public s_userPointEpoch; // tokenid => lpType => user epoch
  mapping(uint256 => mapping(LpTokenType => UserPoint[1000000000])) public s_userPointHistory; // tokenid => lptype => user epoch => UserPoint
  mapping(uint256 => EnumerableSet.AddressSet) internal s_assetsLocked; // tokenid => array of assets locked
  mapping(uint256 => bool) public s_voted;
  mapping(LpTokenType => uint256) public s_supply;
  mapping(LpTokenType => uint256) public s_permanentLockBalance;
  mapping(LpTokenType => IStakeStrategy) public s_stakeStrategy;
  mapping(uint256 => mapping(address => uint256)) public s_underlyingStake;
  mapping(LpTokenType => uint256) public s_protocolFees;
  mapping(LpTokenType => uint256) public s_distributedFees;
  mapping(uint256 => mapping(uint256 => mapping(LpTokenType => uint256))) public s_delegations;
  mapping(uint256 => mapping(LpTokenType => EnumerableSet.UintSet)) internal s_delegatees;
  mapping(uint256 => mapping(LpTokenType => EnumerableSet.UintSet)) internal s_delegators;
  mapping(address => EnumerableSet.UintSet) internal s_ownerToTokenIds; // owner => list of token IDs
  mapping(address => mapping(address => uint256)) public s_userCumulativeAssetValues;

  function initialize(AddressesProvider _ap) public initializer {
    __Ownable2Step_init();
    __ERC721_init("veION", "veION");
    ap = _ap;
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                           External Functions                              ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  function createLockFor(
    address[] memory _tokenAddress,
    uint256[] memory _tokenAmount,
    uint256[] memory _duration,
    bool[] memory _stakeUnderlying,
    address _to
  ) external override returns (uint256) {
    return _createLock(_tokenAddress, _tokenAmount, _duration, _stakeUnderlying, _to);
  }

  function createLock(
    address[] calldata _tokenAddress,
    uint256[] calldata _tokenAmount,
    uint256[] calldata _duration,
    bool[] memory _stakeUnderlying
  ) external override returns (uint256) {
    return _createLock(_tokenAddress, _tokenAmount, _duration, _stakeUnderlying, msg.sender);
  }

  function increaseAmount(
    address _tokenAddress,
    uint256 _tokenId,
    uint256 _tokenAmount,
    bool _stakeUnderlying
  ) external {
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

  function lockAdditionalAsset(
    address _tokenAddress,
    uint256 _tokenAmount,
    uint256 _tokenId,
    uint256 _duration,
    bool _stakeUnderlying
  ) external {
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

  function increaseUnlockTime(address _tokenAddress, uint256 _tokenId, uint256 _lockDuration) external {
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

  /**
   * @notice Withdraws underlying assets from the veNFT. If the unlock time has not passed, a penalty fee is applied.
   * @dev Assumes LP tokens use 18 decimals. If non-18-decimal tokens are intended for support, the fee calculation
   *      will require adjustments to account for varying decimal places.
   * @param _tokenAddress Address of the token to withdraw.
   * @param _tokenId Token ID of the veNFT to withdraw from.
   */
  function withdraw(address _tokenAddress, uint256 _tokenId) external override {
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

      // Distribute fee
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
    IERC20(_tokenAddress).safeTransfer(sender, value);

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

    emit Withdraw(sender, _tokenId, value, block.timestamp);
    emit Supply(supplyBefore, supplyBefore - oldLocked.amount);
  }

  struct MergeVars {
    address sender;
    uint256 lengthOfAssets;
    address[] assetsLocked;
    address asset;
    LpTokenType lpType;
    LockedBalance oldLockedTo;
    LockedBalance oldLockedFrom;
    uint256 end;
    uint256 start;
    uint256 boost;
    LockedBalance newLockedTo;
  }

  function merge(uint256 _from, uint256 _to) external {
    MergeVars memory vars;
    vars.sender = _msgSender();
    if (_from == _to) revert SameNFT();
    if (s_voted[_from]) revert AlreadyVoted();
    if (ownerOf(_from) != _msgSender()) revert NotOwner();
    if (ownerOf(_to) != _msgSender()) revert NotOwner();

    vars.assetsLocked = s_assetsLocked[_from].values();

    for (uint256 i = 0; i < vars.assetsLocked.length; i++) {
      vars.asset = vars.assetsLocked[i];
      vars.lpType = s_lpType[vars.asset];

      vars.oldLockedTo = s_locked[_to][vars.lpType];
      vars.oldLockedFrom = s_locked[_from][vars.lpType];

      if (vars.oldLockedTo.end != 0 && vars.oldLockedTo.end <= block.timestamp) revert LockExpired();
      if (vars.oldLockedFrom.end != 0 && vars.oldLockedFrom.end <= block.timestamp) revert LockExpired();
      if (vars.oldLockedFrom.isPermanent) revert PermanentLock();
      if (vars.oldLockedTo.isPermanent) revert PermanentLock();

      vars.newLockedTo.tokenAddress = vars.asset;
      vars.newLockedTo.amount = vars.oldLockedTo.amount + vars.oldLockedFrom.amount;
      vars.newLockedTo.start = vars.oldLockedTo.start < vars.oldLockedFrom.start && vars.oldLockedTo.start != 0
        ? vars.oldLockedTo.start
        : vars.oldLockedFrom.start;
      vars.newLockedTo.end = vars.oldLockedTo.end > vars.oldLockedFrom.end
        ? vars.oldLockedTo.end
        : vars.oldLockedFrom.end;
      vars.newLockedTo.boost = _calculateBoost(vars.newLockedTo.end - vars.newLockedTo.start);

      s_locked[_from][vars.lpType] = LockedBalance(address(0), 0, 0, 0, 0, false, 0);
      _checkpoint(_from, LockedBalance(address(0), 0, 0, 0, 0, false, 0), vars.lpType);
      s_locked[_to][vars.lpType] = vars.newLockedTo;
      _checkpoint(_to, vars.newLockedTo, vars.lpType);

      if (!s_assetsLocked[_to].contains(vars.asset)) {
        s_assetsLocked[_to].add(vars.asset);
      }
    }
    _burn(_from);
    emit MergeCompleted(_from, _to, vars.assetsLocked, vars.assetsLocked.length);
  }

  function split(
    address _tokenAddress,
    uint256 _from,
    uint256 _splitAmount
  ) external returns (uint256 _tokenId1, uint256 _tokenId2) {
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

    emit SplitCompleted(_from, _tokenId1, _tokenId2, _splitAmount, _tokenAddress);
  }

  function toggleSplit(address _account, bool _isAllowed) external onlyOwner {
    s_canSplit[_account] = _isAllowed;
    emit SplitToggle(_account, _isAllowed);
  }

  function lockPermanent(address _tokenAddress, uint256 _tokenId) external {
    if (ownerOf(_tokenId) != _msgSender()) revert NotOwner();
    LpTokenType _lpType = s_lpType[_tokenAddress];
    LockedBalance memory _newLocked = s_locked[_tokenId][_lpType];
    if (_newLocked.isPermanent) revert PermanentLock();
    if (_newLocked.end <= block.timestamp) revert LockExpired();
    if (_newLocked.amount <= 0) revert NoLockFound();

    s_permanentLockBalance[_lpType] += _newLocked.amount;
    _newLocked.end = 0;
    _newLocked.isPermanent = true;
    _newLocked.boost = _calculateBoost(MAXTIME);
    _checkpoint(_tokenId, _newLocked, _lpType);
    s_locked[_tokenId][_lpType] = _newLocked;
  }

  function unlockPermanent(address _tokenAddress, uint256 _tokenId) external {
    if (ownerOf(_tokenId) != _msgSender()) revert NotOwner();
    LpTokenType _lpType = s_lpType[_tokenAddress];
    LockedBalance memory _newLocked = s_locked[_tokenId][_lpType];
    if (!_newLocked.isPermanent) revert NotPermanentLock();
    if (s_delegatees[_tokenId][_lpType].length() != 0) revert TokenHasDelegatees();
    if (s_delegators[_tokenId][_lpType].length() != 0) revert TokenHasDelegators();

    s_permanentLockBalance[_lpType] -= _newLocked.amount;
    _newLocked.end = ((block.timestamp + MAXTIME) / WEEK) * WEEK;
    _newLocked.isPermanent = false;
    _checkpoint(_tokenId, _newLocked, _lpType);
    s_locked[_tokenId][_lpType] = _newLocked;
  }

  function delegate(uint256 fromTokenId, uint256 toTokenId, address lpToken, uint256 amount) external {
    // Ensure the caller is the owner or approved for the fromTokenId
    if (ownerOf(fromTokenId) != _msgSender()) revert NotOwner();

    // Retrieve the locked balance for the fromTokenId
    LpTokenType lpType = s_lpType[lpToken];
    LockedBalance memory fromLocked = s_locked[fromTokenId][lpType];

    // Ensure the lock is permanent
    if (!fromLocked.isPermanent) revert NotPermanentLock();

    // Ensure the amount to delegate is not greater than the available amount
    if (amount > uint256(int256(fromLocked.amount))) revert AmountTooBig();

    // Retrieve the locked balance for the toTokenId
    LockedBalance memory toLocked = s_locked[toTokenId][lpType];

    if (!toLocked.isPermanent) revert NotPermanentLock();

    // Transfer the voting power
    toLocked.delegateAmount += amount;
    fromLocked.amount -= amount;

    // Update the locked balances
    s_locked[fromTokenId][lpType] = fromLocked;
    s_locked[toTokenId][lpType] = toLocked;

    if (s_delegations[fromTokenId][toTokenId][lpType] == 0) {
      s_delegatees[fromTokenId][lpType].add(toTokenId);
      s_delegators[toTokenId][lpType].add(fromTokenId);
    }

    s_delegations[fromTokenId][toTokenId][lpType] += amount;

    // Update checkpoints for both token IDs
    _checkpoint(fromTokenId, s_locked[fromTokenId][lpType], lpType);
    _checkpoint(toTokenId, s_locked[toTokenId][lpType], lpType);

    emit Delegated(fromTokenId, toTokenId, lpToken, amount);
  }

  function _removeDelegation(uint256 fromTokenId, uint256 toTokenId, address lpToken, uint256 amount) internal {
    // Ensure the caller is the owner or approved for the fromTokenId
    if (ownerOf(fromTokenId) != _msgSender() && ownerOf(toTokenId) != _msgSender()) revert NotOwner();

    LpTokenType lpType = s_lpType[lpToken];
    LockedBalance memory fromLocked = s_locked[fromTokenId][lpType];
    LockedBalance memory toLocked = s_locked[toTokenId][lpType];

    amount = amount > s_delegations[fromTokenId][toTokenId][lpType]
      ? s_delegations[fromTokenId][toTokenId][lpType]
      : amount;
    // Transfer the voting power back
    toLocked.delegateAmount -= amount;
    fromLocked.amount += amount;

    // Update the delegation record
    s_delegations[fromTokenId][toTokenId][lpType] -= amount;
    if (s_delegations[fromTokenId][toTokenId][lpType] == 0) {
      s_delegatees[fromTokenId][lpType].remove(toTokenId);
      s_delegators[toTokenId][lpType].remove(fromTokenId);
    }

    s_locked[toTokenId][lpType] = toLocked;
    _checkpoint(toTokenId, s_locked[toTokenId][lpType], lpType);
    s_locked[fromTokenId][lpType] = fromLocked;
    _checkpoint(fromTokenId, s_locked[fromTokenId][lpType], lpType);

    emit DelegationRemoved(fromTokenId, toTokenId, lpToken, amount);
  }

  function removeDelegatees(
    uint256 fromTokenId,
    uint256[] memory toTokenIds,
    address lpToken,
    uint256[] memory amounts
  ) public {
    require(toTokenIds.length == amounts.length, "Mismatched array lengths");
    for (uint256 i = 0; i < toTokenIds.length; i++) {
      _removeDelegation(fromTokenId, toTokenIds[i], lpToken, amounts[i]);
    }
  }

  function removeDelegators(
    uint256[] memory fromTokenIds,
    uint256 toTokenId,
    address lpToken,
    uint256[] memory amounts
  ) public {
    require(fromTokenIds.length == amounts.length, "Mismatched array lengths");
    for (uint256 i = 0; i < fromTokenIds.length; i++) {
      _removeDelegation(fromTokenIds[i], toTokenId, lpToken, amounts[i]);
    }
  }

  function claimEmissions(address _tokenAddress) external {
    LpTokenType _lpType = s_lpType[_tokenAddress];
    IStakeStrategy _stakeStrategy = s_stakeStrategy[_lpType];
    _stakeStrategy.claim(msg.sender);
    emit EmissionsClaimed(msg.sender, _tokenAddress);
  }

  /**
   * @dev Overrides the _mint function from ERC721 to include additional logic for bridging.
   * @param to Address to mint to.
   * @param tokenId Token ID to mint.
   */
  function _mint(address to, uint256 tokenId) internal override {
    super._mint(to, tokenId);
  }

  /**
   * @dev Overrides the _burn function from ERC721 to include additional logic for bridging.
   * @param tokenId Token ID to burn.
   */
  function _burn(uint256 tokenId) internal override {
    address owner = ownerOf(tokenId);
    super._burn(tokenId);
    s_ownerToTokenIds[owner].remove(tokenId);
  }

  function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override {
    super._beforeTokenTransfer(from, to, tokenId);

    if (from != address(0)) {
      s_ownerToTokenIds[from].remove(tokenId);
    }
    if (to != address(0)) {
      s_ownerToTokenIds[to].add(tokenId);

      uint256 lengthOfAssets = s_assetsLocked[tokenId].length();
      address[] memory assetsLocked = s_assetsLocked[tokenId].values();

      for (uint256 i = 0; i < lengthOfAssets; i++) {
        address asset = assetsLocked[i];
        LpTokenType lpType = s_lpType[asset];
        uint256[] memory delegatees = s_delegatees[tokenId][lpType].values();
        uint256[] memory maxAmounts = new uint256[](delegatees.length);
        for (uint256 j = 0; j < maxAmounts.length; j++) {
          maxAmounts[j] = type(uint256).max;
        }
        removeDelegatees(tokenId, delegatees, asset, maxAmounts);
      }
    }
  }

  function whitelistTokens(address[] memory _tokens, bool[] memory _isWhitelisted) external onlyOwner {
    require(_tokens.length == _isWhitelisted.length, "Unequal Arrays");
    for (uint256 i; i < _tokens.length; i++) s_whitelistedToken[_tokens[i]] = _isWhitelisted[i];
    emit TokensWhitelisted(_tokens, _isWhitelisted);
  }

  /**
   * @notice Sets the LP token type for a given token address
   * @param _token Address of the token
   * @param _type LP token type to be set
   */
  function setLpTokenType(address _token, LpTokenType _type) external onlyOwner {
    require(_token != address(0), "Invalid token address");
    s_lpType[_token] = _type;
    emit LpTokenTypeSet(_token, _type);
  }

  /**
   * @notice Sets the strategy for a given LP token type
   * @param _lpType LP token type to set the strategy for
   * @param _strategy Address of the strategy contract
   */
  function setStakeStrategy(LpTokenType _lpType, IStakeStrategy _strategy) external onlyOwner {
    require(address(_strategy) != address(0), "Invalid strategy address");
    s_stakeStrategy[_lpType] = IStakeStrategy(_strategy);
    emit StakeStrategySet(_lpType, address(_strategy));
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

  function _createLock(
    address[] memory _tokenAddress,
    uint256[] memory _tokenAmount,
    uint256[] memory _duration,
    bool[] memory _stakeUnderlying,
    address _to
  ) internal returns (uint256) {
    uint256 _tokenId = ++s_tokenId;
    uint256 _length = _tokenAddress.length;
    _mint(_to, _tokenId);

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

  function _createSplitVE(
    address _to,
    LockedBalance memory _newLocked,
    LpTokenType _lpType,
    address _tokenAddress
  ) private returns (uint256 _tokenId) {
    _tokenId = ++s_tokenId;
    s_locked[_tokenId][_lpType] = _newLocked;
    s_assetsLocked[_tokenId].add(_tokenAddress);
    _checkpoint(_tokenId, _newLocked, _lpType);
    _mint(_to, _tokenId);
  }

  function _getStakeStrategy(
    LpTokenType _lpType
  ) internal view returns (IStakeStrategy _stakeStrategy, bytes memory _stakeData) {
    IStakeStrategy strategy = s_stakeStrategy[_lpType];
    return (strategy, "");
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                           View Functions                                  ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  function getUserLock(uint256 _tokenId, LpTokenType _lpType) external view returns (LockedBalance memory) {
    return s_locked[_tokenId][_lpType];
  }

  function isApprovedOrOwner(address _spender, uint256 _tokenId) external view returns (bool) {
    return _isApprovedOrOwner(_spender, _tokenId);
  }

  /// @inheritdoc IveION
  function voting(uint256 _tokenId, bool _voting) external {
    if (_msgSender() != s_voter) revert NotVoter();
    s_voted[_tokenId] = _voting;
  }

  /// @inheritdoc IveION
  function balanceOfNFT(
    uint256 _tokenId
  ) public view returns (address[] memory _assets, uint256[] memory _balances, uint256[] memory _boosts) {
    uint256 lengthOfAssets = s_assetsLocked[_tokenId].length();
    address[] memory assetsLocked = s_assetsLocked[_tokenId].values();

    _assets = new address[](lengthOfAssets);
    _balances = new uint256[](lengthOfAssets);

    for (uint256 i = 0; i < lengthOfAssets; i++) {
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

  function _getTotalBoost(uint256 _tokenId, LpTokenType _lpType) internal view returns (uint256) {
    uint256 totalBoost = s_locked[_tokenId][_lpType].boost;
    if (s_limitedBoostActive) {
      totalBoost += s_limitedBoost;
    }
    address _owner = ownerOf(_tokenId);
    if (s_veAERO == address(0)) return totalBoost;

    uint256 _balance = IAeroVotingEscrow(s_veAERO).balanceOf(_owner);
    for (uint256 i = 0; i < _balance; i++) {
      uint256 tokenId = IAeroVotingEscrow(s_veAERO).ownerToNFTokenIdList(_owner, i);
      address[] memory poolVotes = IAeroVoter(s_aeroVoting).poolVote(tokenId);
      for (uint256 j = 0; j < poolVotes.length; j++) {
        if (poolVotes[j] == s_ionicPool) {
          IAeroVoter aeroVoter = IAeroVoter(s_aeroVoting);
          uint256 weightToVoteRatio = (aeroVoter.votes(_tokenId, s_ionicPool) * 1e18) / aeroVoter.weights(s_ionicPool);
          totalBoost += (s_aeroVoterBoost * weightToVoteRatio) / 1e18;
          break;
        }
      }
    }

    return totalBoost;
  }

  function toggleLimitedBoost(bool _isBoosted) external onlyOwner {
    s_limitedBoostActive = _isBoosted;
    emit LimitedBoostToggled(_isBoosted);
  }

  function setLimitedTimeBoost(uint256 _boostAmount) external onlyOwner {
    s_limitedBoost = _boostAmount;
    emit LimitedTimeBoostSet(_boostAmount);
  }

  function setVoter(address _voter) external onlyOwner {
    s_voter = _voter;
    emit VoterSet(_voter);
  }

  function setMinimumLockAmount(address _tokenAddress, uint256 _minimumAmount) external onlyOwner {
    require(_minimumAmount > 0, "Minimum amount must be greater than zero");
    LpTokenType lpType = s_lpType[_tokenAddress];
    s_minimumLockAmount[lpType] = _minimumAmount;
    emit MinimumLockAmountSet(_tokenAddress, _minimumAmount);
  }

  function setMinimumLockDuration(uint256 _minimumLockDuration) external onlyOwner {
    require(_minimumLockDuration > 0, "Minimum lock duration must be greater than zero");
    s_minimumLockDuration = _minimumLockDuration;
    emit MinimumLockDurationSet(_minimumLockDuration);
  }

  function setIonicPool(address _ionicPool) external onlyOwner {
    s_ionicPool = _ionicPool;
    emit IonicPoolSet(_ionicPool);
  }

  function setAeroVoting(address _aeroVoting) external onlyOwner {
    s_aeroVoting = _aeroVoting;
    emit AeroVotingSet(_aeroVoting);
  }

  function setAeroVoterBoost(uint256 _aeroVoterBoost) external onlyOwner {
    s_aeroVoterBoost = _aeroVoterBoost;
    emit AeroVoterBoostSet(_aeroVoterBoost);
  }

  function setMaxEarlyWithdrawFee(uint256 _maxEarlyWithdrawFee) external onlyOwner {
    require(_maxEarlyWithdrawFee > 0, "Max early withdraw fee must be greater than zero");
    s_maxEarlyWithdrawFee = _maxEarlyWithdrawFee;
    emit MaxEarlyWithdrawFeeSet(_maxEarlyWithdrawFee);
  }

  function getOwnedTokenIds(address _owner) external view returns (uint256[] memory) {
    return s_ownerToTokenIds[_owner].values();
  }

  function getTotalEthValueOfTokens(address _owner) external view returns (uint256 totalValue) {
    IVoter voter = IVoter(s_voter);
    address[] memory lpTokens = voter.getAllLpRewardTokens();
    for (uint256 i = 0; i < lpTokens.length; i++) {
      uint256 ethValue = (s_userCumulativeAssetValues[_owner][lpTokens[i]] * getEthPrice(lpTokens[i])) / PRECISION;
      totalValue += ethValue;
    }
  }

  function getEthPrice(address _token) internal view returns (uint256) {
    MasterPriceOracle mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));
    return mpo.price(_token);
  }

  function getAssetsLocked(uint256 _tokenId) external view returns (address[] memory) {
    return s_assetsLocked[_tokenId].values();
  }

  function getDelegatees(uint256 _tokenId, LpTokenType _lpType) external view returns (uint256[] memory) {
    return s_delegatees[_tokenId][_lpType].values();
  }

  function getDelegators(uint256 _tokenId, LpTokenType _lpType) external view returns (uint256[] memory) {
    return s_delegators[_tokenId][_lpType].values();
  }

  function getUserPoint(
    uint256 _tokenId,
    LpTokenType _lpType,
    uint256 _epoch
  ) external view returns (UserPoint memory) {
    return s_userPointHistory[_tokenId][_lpType][_epoch];
  }

  function withdrawProtocolFees(address _tokenAddress, address _recipient) external onlyOwner {
    LpTokenType lpType = s_lpType[_tokenAddress];
    uint256 protocolFees = s_protocolFees[lpType];
    require(protocolFees > 0, "No protocol fees available");
    s_protocolFees[lpType] = 0;
    IERC20(_tokenAddress).safeTransfer(_recipient, protocolFees);
    emit ProtocolFeesWithdrawn(_tokenAddress, _recipient, protocolFees);
  }

  function withdrawDistributedFees(address _tokenAddress, address _recipient) external onlyOwner {
    LpTokenType lpType = s_lpType[_tokenAddress];
    uint256 distributedFees = s_distributedFees[lpType];
    require(distributedFees > 0, "No distributed fees available");
    s_distributedFees[lpType] = 0;
    IERC20(_tokenAddress).safeTransfer(_recipient, distributedFees);
    emit DistributedFeesWithdrawn(_tokenAddress, _recipient, distributedFees);
  }
}

interface IAeroVotingEscrow {
  function balanceOf(address _owner) external view returns (uint256);

  function ownerToNFTokenIdList(address _owner, uint256 _index) external view returns (uint256);
}

interface IAeroVoter {
  function poolVote(uint256 tokenId) external view returns (address[] memory);

  function weights(address pool) external view returns (uint256);

  function votes(uint256 tokenId, address pool) external view returns (uint256);
}
