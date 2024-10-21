// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.10;

import { ERC20 } from "solmate/tokens/ERC20.sol";
import { IonicFlywheelCore } from "./IonicFlywheelCore.sol";
import "./IIonicFlywheel.sol";

contract IonicFlywheel is IonicFlywheelCore, IIonicFlywheel {
  bool public constant isRewardsDistributor = true;
  bool public constant isFlywheel = true;

  function flywheelPreSupplierAction(address market, address supplier) external {
    _updateBlacklistBalances(ERC20(market), supplier);
    accrue(ERC20(market), supplier);
  }

  function flywheelPreBorrowerAction(address market, address borrower) external {}

  function flywheelPreTransferAction(address market, address src, address dst) external {
    _updateBlacklistBalances(ERC20(market), src);
    _updateBlacklistBalances(ERC20(market), dst);
    accrue(ERC20(market), src, dst);
  }

  function compAccrued(address user) external view returns (uint256) {
    return _rewardsAccrued[user];
  }

  function addMarketForRewards(ERC20 strategy) external onlyOwner {
    _addStrategyForRewards(strategy);
  }

  // TODO remove
  function marketState(ERC20 strategy) external view returns (uint224, uint32) {
    return (_strategyState[strategy].index, _strategyState[strategy].lastUpdatedTimestamp);
  }
}
