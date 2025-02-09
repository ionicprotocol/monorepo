// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.10;

import { Auth, Authority } from "solmate/auth/Auth.sol";
import { BaseFlywheelRewards } from "./BaseFlywheelRewards.sol";
import { SafeTransferLib, ERC20 } from "solmate/utils/SafeTransferLib.sol";
import { IonicFlywheelCore } from "../IonicFlywheelCore.sol";

/**
 * @title FlywheelInstantRewards
 * @author Jourdan DUnkley <jourdan@ionic.money> (https://github.com/jourdanDunkley)
 * @notice This contract handles the instant reward distribution for strategies.
 * It allows setting and transferring rewards for specific strategies.
 */
contract FlywheelInstantRewards is Auth, BaseFlywheelRewards {
  using SafeTransferLib for ERC20;

  event RewardsSet(ERC20 indexed strategy, uint256 amount);

  /// @notice Mapping to store the reward amount for each strategy.
  mapping(ERC20 => uint256) rewardAmount;
  /// @notice Mapping to track if a strategy has new rewards to be distributed.
  mapping(ERC20 => bool) rewardsNew;

  /**
   * @notice Constructor to initialize the FlywheelInstantRewards contract.
   * @param _flywheel The flywheel core contract.
   * @param _owner The owner of the contract.
   * @param _authority The authority contract for authentication.
   */
  constructor(
    IonicFlywheelCore _flywheel,
    address _owner,
    Authority _authority
  ) Auth(_owner, _authority) BaseFlywheelRewards(_flywheel) {}

  /**
   * @notice Set the reward amount for a specific strategy.
   * @param _amount The amount of rewards to be set for the strategy.
   * @param _strategy The strategy for which the rewards are being set.
   * @dev Requires authentication to execute.
   */
  function setRewards(ERC20 _strategy, uint256 _amount) external requiresAuth {
    rewardAmount[_strategy] = _amount;
    rewardsNew[_strategy] = true;
    rewardToken.safeTransferFrom(msg.sender, address(this), _amount);
    emit RewardsSet(_strategy, _amount);
  }

  /**
   * @notice Calculate and transfer accrued rewards to the flywheel core.
   * @param strategy The strategy to accrue rewards for.
   * @return amount The amount of tokens accrued and transferred.
   * @dev This function can only be called by the flywheel core.
   */
  function getAccruedRewards(
    ERC20 strategy,
    uint32 /* lastUpdatedTimestamp */
  ) external override onlyFlywheel returns (uint256 amount) {
    if (rewardsNew[strategy]) {
      amount = rewardAmount[strategy];
      rewardsNew[strategy] = false;
    } else {
      amount = 0;
    }
  }
}
