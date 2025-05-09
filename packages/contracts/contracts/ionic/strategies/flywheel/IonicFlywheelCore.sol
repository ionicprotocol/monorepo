// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.10;

import { ERC20 } from "solmate/tokens/ERC20.sol";
import { SafeTransferLib } from "solmate/utils/SafeTransferLib.sol";
import { SafeCastLib } from "solmate/utils/SafeCastLib.sol";

import { IFlywheelRewards } from "./rewards/IFlywheelRewards.sol";
import { IFlywheelBooster } from "./IFlywheelBooster.sol";
import { IEmissionsManager } from "../../../IEmissionsManager.sol";
import { Ownable2StepUpgradeable } from "@openzeppelin-contracts-upgradeable/contracts/access/Ownable2StepUpgradeable.sol";

contract IonicFlywheelCore is Ownable2StepUpgradeable {
  using SafeTransferLib for ERC20;
  using SafeCastLib for uint256;

  /// @notice How much rewardsToken will be send to treasury
  uint256 public performanceFee;

  /// @notice Address that gets rewardsToken accrued by performanceFee
  address public feeRecipient;

  /// @notice The token to reward
  ERC20 public rewardToken;

  /// @notice append-only list of strategies added
  ERC20[] public allStrategies;

  /// @notice the rewards contract for managing streams
  IFlywheelRewards public flywheelRewards;

  /// @notice optional booster module for calculating virtual balances on strategies
  IFlywheelBooster public flywheelBooster;

  IEmissionsManager public emissionsManager;

  /// @notice The accrued but not yet transferred rewards for each user
  mapping(address => uint256) internal _rewardsAccrued;

  /// @notice The strategy index and last updated per strategy
  mapping(ERC20 => RewardsState) internal _strategyState;

  /// @notice user index per strategy
  mapping(ERC20 => mapping(address => uint224)) internal _userIndex;

  /// @notice user blacklisted supply per strategy
  mapping(ERC20 => mapping(address => uint256)) public userBlacklistedSupply;

  /// @notice blacklisted supply per strategy
  mapping(ERC20 => uint256) public blacklistedSupply;

  modifier onlyEmissionsManager() {
    require(address(emissionsManager) == msg.sender, "!emissionsManager");
    _;
  }

  constructor() {
    _disableInitializers(); // Locks the implementation contract from being initialized
  }

  function initialize(
    ERC20 _rewardToken,
    IFlywheelRewards _flywheelRewards,
    IFlywheelBooster _flywheelBooster,
    address _owner
  ) public initializer {
    __Ownable2Step_init();

    rewardToken = _rewardToken;
    flywheelRewards = _flywheelRewards;
    flywheelBooster = _flywheelBooster;

    performanceFee = 10e16; // 10%
    feeRecipient = _owner;
  }

  /*----------------------------------------------------------------
                        ACCRUE/CLAIM LOGIC
    ----------------------------------------------------------------*/

  /** 
      @notice Emitted when a user's rewards accrue to a given strategy.
      @param strategy the updated rewards strategy
      @param user the user of the rewards
      @param rewardsDelta how many new rewards accrued to the user
      @param rewardsIndex the market index for rewards per token accrued
    */
  event AccrueRewards(ERC20 indexed strategy, address indexed user, uint256 rewardsDelta, uint256 rewardsIndex);

  /** 
      @notice Emitted when a user claims accrued rewards.
      @param user the user of the rewards
      @param amount the amount of rewards claimed
    */
  event ClaimRewards(address indexed user, uint256 amount);

  /** 
      @notice accrue rewards for a single user on a strategy
      @param strategy the strategy to accrue a user's rewards on
      @param user the user to be accrued
      @return the cumulative amount of rewards accrued to user (including prior)
    */
  function accrue(ERC20 strategy, address user) public returns (uint256) {
    (uint224 index, uint32 ts) = strategyState(strategy);
    RewardsState memory state = RewardsState(index, ts);

    if (state.index == 0) return 0;

    state = accrueStrategy(strategy, state);
    return accrueUser(strategy, user, state);
  }

  /** 
      @notice accrue rewards for a two users on a strategy
      @param strategy the strategy to accrue a user's rewards on
      @param user the first user to be accrued
      @param user the second user to be accrued
      @return the cumulative amount of rewards accrued to the first user (including prior)
      @return the cumulative amount of rewards accrued to the second user (including prior)
    */
  function accrue(ERC20 strategy, address user, address secondUser) public returns (uint256, uint256) {
    (uint224 index, uint32 ts) = strategyState(strategy);
    RewardsState memory state = RewardsState(index, ts);

    if (state.index == 0) return (0, 0);

    state = accrueStrategy(strategy, state);
    return (accrueUser(strategy, user, state), accrueUser(strategy, secondUser, state));
  }

  /** 
      @notice claim rewards for a given user
      @param user the user claiming rewards
      @dev this function is public, and all rewards transfer to the user
    */
  function claimRewards(address user) external {
    require(!emissionsManager.isUserBlacklisted(user), "blacklisted");
    require(!emissionsManager.isUserBlacklistable(user), "blacklistable");
    uint256 accrued = rewardsAccrued(user);

    if (accrued != 0) {
      _rewardsAccrued[user] = 0;

      rewardToken.safeTransferFrom(address(flywheelRewards), user, accrued);

      emit ClaimRewards(user, accrued);
    }
  }

  /** 
      @notice take rewards for a given user
      @param user the user claiming rewards
      @param receiver the address that receives the rewards
      @dev this function is public, and all rewards transfer to the receiver
    */
  function takeRewardsFromUser(address user, address receiver) external onlyEmissionsManager {
    uint256 accrued = rewardsAccrued(user);

    if (accrued != 0) {
      _rewardsAccrued[user] = 0;

      rewardToken.safeTransferFrom(address(flywheelRewards), receiver, accrued);

      emit ClaimRewards(user, accrued);
    }
  }

  /** 
      @notice set user balances to zero
      @param strategy strategy to whitelist user for
      @param user the user to be whitelisted
      @dev this function is public, and all user and strategy blacklisted supplies are reset
    */
  function whitelistUser(ERC20 strategy, address user) external onlyEmissionsManager {
    blacklistedSupply[strategy] -= userBlacklistedSupply[strategy][user];
    userBlacklistedSupply[strategy][user] = 0;
    (uint224 index, uint32 ts) = strategyState(strategy);
    RewardsState memory state = RewardsState(index, ts);
    state = accrueStrategy(strategy, state);
    _userIndex[strategy][user] = state.index;
  }

  /** 
      @notice update user blacklisted balances
      @param strategy strategy to update blacklisted balances
      @param user the user to be blacklisted
      @dev this function is public
    */
  function updateBlacklistBalances(ERC20 strategy, address user) external onlyEmissionsManager {
    _updateBlacklistBalances(strategy, user);
  }

  /** 
      @notice update user blacklisted balances
      @param strategy strategy to update blacklisted balances
      @param user the user to be blacklisted
      @dev this function is private
    */
  function _updateBlacklistBalances(ERC20 strategy, address user) internal {
    if (emissionsManager.isUserBlacklisted(user)) {
      uint256 _oldUserBlacklistedSupply = userBlacklistedSupply[strategy][user];
      uint256 supplierTokens = address(flywheelBooster) != address(0)
        ? flywheelBooster.boostedBalanceOf(ERC20(strategy), user)
        : ERC20(strategy).balanceOf(user);

      if (supplierTokens >= _oldUserBlacklistedSupply) {
        blacklistedSupply[strategy] += supplierTokens - _oldUserBlacklistedSupply;
        userBlacklistedSupply[strategy][user] = supplierTokens;
      } else {
        blacklistedSupply[strategy] -= _oldUserBlacklistedSupply - supplierTokens;
        userBlacklistedSupply[strategy][user] = supplierTokens;
      }
    }
  }
  /*----------------------------------------------------------------
                          ADMIN LOGIC
    ----------------------------------------------------------------*/

  /** 
      @notice Emitted when a new strategy is added to flywheel by the admin
      @param newStrategy the new added strategy
    */
  event AddStrategy(address indexed newStrategy);

  /// @notice initialize a new strategy
  function setEmissionsManager(IEmissionsManager _emissionsManager) external onlyOwner {
    emissionsManager = _emissionsManager;
  }

  /// @notice initialize a new strategy
  function addStrategyForRewards(ERC20 strategy) external onlyOwner {
    _addStrategyForRewards(strategy);
  }

  function _addStrategyForRewards(ERC20 strategy) internal {
    (uint224 index, ) = strategyState(strategy);
    require(index == 0, "strategy");
    _strategyState[strategy] = RewardsState({
      index: (10 ** rewardToken.decimals()).safeCastTo224(),
      lastUpdatedTimestamp: block.timestamp.safeCastTo32()
    });

    allStrategies.push(strategy);
    emit AddStrategy(address(strategy));
  }

  function getAllStrategies() external view returns (ERC20[] memory) {
    return allStrategies;
  }

  /** 
      @notice Emitted when the rewards module changes
      @param newFlywheelRewards the new rewards module
    */
  event FlywheelRewardsUpdate(address indexed newFlywheelRewards);

  /// @notice swap out the flywheel rewards contract
  function setFlywheelRewards(IFlywheelRewards newFlywheelRewards) external onlyOwner {
    if (address(flywheelRewards) != address(0)) {
      uint256 oldRewardBalance = rewardToken.balanceOf(address(flywheelRewards));
      if (oldRewardBalance > 0) {
        rewardToken.safeTransferFrom(address(flywheelRewards), address(newFlywheelRewards), oldRewardBalance);
      }
    }

    flywheelRewards = newFlywheelRewards;

    emit FlywheelRewardsUpdate(address(newFlywheelRewards));
  }

  /** 
      @notice Emitted when the booster module changes
      @param newBooster the new booster module
    */
  event FlywheelBoosterUpdate(address indexed newBooster);

  /// @notice swap out the flywheel booster contract
  function setBooster(IFlywheelBooster newBooster) external onlyOwner {
    flywheelBooster = newBooster;

    emit FlywheelBoosterUpdate(address(newBooster));
  }

  event UpdatedFeeSettings(
    uint256 oldPerformanceFee,
    uint256 newPerformanceFee,
    address oldFeeRecipient,
    address newFeeRecipient
  );

  /**
   * @notice Update performanceFee and/or feeRecipient
   * @dev Claim rewards first from the previous feeRecipient before changing it
   */
  function updateFeeSettings(uint256 _performanceFee, address _feeRecipient) external onlyOwner {
    _updateFeeSettings(_performanceFee, _feeRecipient);
  }

  function _updateFeeSettings(uint256 _performanceFee, address _feeRecipient) internal {
    emit UpdatedFeeSettings(performanceFee, _performanceFee, feeRecipient, _feeRecipient);

    if (feeRecipient != _feeRecipient) {
      _rewardsAccrued[_feeRecipient] += rewardsAccrued(feeRecipient);
      _rewardsAccrued[feeRecipient] = 0;
    }
    performanceFee = _performanceFee;
    feeRecipient = _feeRecipient;
  }

  /*----------------------------------------------------------------
                    INTERNAL ACCOUNTING LOGIC
    ----------------------------------------------------------------*/

  struct RewardsState {
    /// @notice The strategy's last updated index
    uint224 index;
    /// @notice The timestamp the index was last updated at
    uint32 lastUpdatedTimestamp;
  }

  /// @notice accumulate global rewards on a strategy
  function accrueStrategy(
    ERC20 strategy,
    RewardsState memory state
  ) private returns (RewardsState memory rewardsState) {
    // calculate accrued rewards through module
    uint256 strategyRewardsAccrued = flywheelRewards.getAccruedRewards(strategy, state.lastUpdatedTimestamp);

    rewardsState = state;

    if (strategyRewardsAccrued > 0) {
      // use the booster or token supply to calculate reward index denominator
      uint256 supplyTokens = address(flywheelBooster) != address(0)
        ? flywheelBooster.boostedTotalSupply(strategy) - blacklistedSupply[strategy]
        : strategy.totalSupply() - blacklistedSupply[strategy];

      // 100% = 100e16
      uint256 accruedFees = (strategyRewardsAccrued * performanceFee) / uint224(100e16);

      _rewardsAccrued[feeRecipient] += accruedFees;
      strategyRewardsAccrued -= accruedFees;

      uint224 deltaIndex;

      if (supplyTokens != 0)
        deltaIndex = ((strategyRewardsAccrued * (10 ** strategy.decimals())) / supplyTokens).safeCastTo224();

      // accumulate rewards per token onto the index, multiplied by fixed-point factor
      rewardsState = RewardsState({
        index: state.index + deltaIndex,
        lastUpdatedTimestamp: block.timestamp.safeCastTo32()
      });
      _strategyState[strategy] = rewardsState;
    }
  }

  /// @notice accumulate rewards on a strategy for a specific user
  function accrueUser(ERC20 strategy, address user, RewardsState memory state) private returns (uint256) {
    // load indices
    uint224 strategyIndex = state.index;
    uint224 supplierIndex = userIndex(strategy, user);

    // sync user index to global
    _userIndex[strategy][user] = strategyIndex;

    // if user hasn't yet accrued rewards, grant them interest from the strategy beginning if they have a balance
    // zero balances will have no effect other than syncing to global index
    if (supplierIndex == 0) {
      supplierIndex = (10 ** rewardToken.decimals()).safeCastTo224();
    }

    uint224 deltaIndex = strategyIndex - supplierIndex;
    // use the booster or token balance to calculate reward balance multiplier
    uint256 supplierTokens = address(flywheelBooster) != address(0)
      ? flywheelBooster.boostedBalanceOf(strategy, user) - userBlacklistedSupply[strategy][user]
      : strategy.balanceOf(user) - userBlacklistedSupply[strategy][user];

    // accumulate rewards by multiplying user tokens by rewardsPerToken index and adding on unclaimed
    uint256 supplierDelta = (deltaIndex * supplierTokens) / (10 ** strategy.decimals());
    uint256 supplierAccrued = rewardsAccrued(user) + supplierDelta;

    _rewardsAccrued[user] = supplierAccrued;

    emit AccrueRewards(strategy, user, supplierDelta, strategyIndex);

    return supplierAccrued;
  }

  function rewardsAccrued(address user) public virtual returns (uint256) {
    return _rewardsAccrued[user];
  }

  function userIndex(ERC20 strategy, address user) public virtual returns (uint224) {
    return _userIndex[strategy][user];
  }

  function strategyState(ERC20 strategy) public virtual returns (uint224 index, uint32 lastUpdatedTimestamp) {
    return (_strategyState[strategy].index, _strategyState[strategy].lastUpdatedTimestamp);
  }
}
