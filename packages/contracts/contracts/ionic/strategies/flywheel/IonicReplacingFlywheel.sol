// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.10;

import "./IonicFlywheel.sol";

import { IFlywheelRewards } from "./rewards/IFlywheelRewards.sol";
import { IFlywheelBooster } from "./IFlywheelBooster.sol";

contract IonicReplacingFlywheel is IonicFlywheel {
  IonicFlywheelCore public flywheelToReplace;
  mapping(address => bool) private rewardsTransferred;

  function reinitialize(IonicFlywheelCore _flywheelToReplace) public onlyOwner {
    flywheelToReplace = _flywheelToReplace;
  }

  function rewardsAccrued(address user) public override returns (uint256) {
    if (address(flywheelToReplace) != address(0)) {
      if (_rewardsAccrued[user] == 0 && !rewardsTransferred[user]) {
        uint256 oldStateRewardsAccrued = flywheelToReplace.rewardsAccrued(user);
        if (oldStateRewardsAccrued != 0) {
          rewardsTransferred[user] = true;
          _rewardsAccrued[user] = oldStateRewardsAccrued;
        }
      }
    }
    return _rewardsAccrued[user];
  }

  function strategyState(ERC20 strategy) public override returns (uint224, uint32) {
    if (address(flywheelToReplace) != address(0)) {
      RewardsState memory newStateStrategyState = _strategyState[strategy];
      if (newStateStrategyState.index == 0) {
        (uint224 index, uint32 ts) = flywheelToReplace.strategyState(strategy);
        if (index != 0) {
          _strategyState[strategy] = RewardsState(index, ts);
        }
      }
    }
    return (_strategyState[strategy].index, _strategyState[strategy].lastUpdatedTimestamp);
  }

  function userIndex(ERC20 strategy, address user) public override returns (uint224) {
    if (address(flywheelToReplace) != address(0)) {
      if (_userIndex[strategy][user] == 0) {
        uint224 oldStateUserIndex = flywheelToReplace.userIndex(strategy, user);
        if (oldStateUserIndex != 0) {
          _userIndex[strategy][user] = oldStateUserIndex;
        }
      }
    }
    return _userIndex[strategy][user];
  }

  function addInitializedStrategy(ERC20 strategy) public onlyOwner {
    (uint224 index, ) = strategyState(strategy);
    if (index > 0) {
      ERC20[] memory strategies = this.getAllStrategies();
      for (uint8 i = 0; i < strategies.length; i++) {
        require(address(strategy) != address(strategies[i]), "!added");
      }

      allStrategies.push(strategy);
      emit AddStrategy(address(strategy));
    }
  }
}
