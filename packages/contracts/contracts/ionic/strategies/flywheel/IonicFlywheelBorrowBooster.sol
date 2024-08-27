// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.10;

import { ICErc20 } from "../../../compound/CTokenInterfaces.sol";
import "./IIonicFlywheelBorrowBooster.sol";

contract IonicFlywheelBorrowBooster is IIonicFlywheelBorrowBooster {
  string public constant BOOSTER_TYPE = "FlywheelBorrowBooster";

  /**
      @notice calculate the boosted supply of a strategy.
      @param strategy the strategy to calculate boosted supply of
      @return the boosted supply
     */
  function boostedTotalSupply(ICErc20 strategy) external view returns (uint256) {
    return strategy.totalBorrows();
  }

  /**
      @notice calculate the boosted balance of a user in a given strategy.
      @param strategy the strategy to calculate boosted balance of
      @param user the user to calculate boosted balance of
      @return the boosted balance
     */
  function boostedBalanceOf(ICErc20 strategy, address user) external view returns (uint256) {
    return strategy.borrowBalanceCurrent(user);
  }
}
