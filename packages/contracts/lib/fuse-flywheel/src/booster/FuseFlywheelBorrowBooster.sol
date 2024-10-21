// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.10;

import "flywheel/interfaces/IFlywheelBooster.sol";
import "../external/CToken.sol";

contract FuseFlywheelBorrowBooster is IFlywheelBooster {
    string public constant BOOSTER_TYPE = "FuseFlywheelBorrowBooster";

    /**
      @notice calculate the boosted supply of a strategy.
      @param strategy the strategy to calculate boosted supply of
      @return the boosted supply
     */
    function boostedTotalSupply(ERC20 strategy)
        external
        view
        returns (uint256)
    {
        return CToken(address(strategy)).totalBorrows();
    }

    /**
      @notice calculate the boosted balance of a user in a given strategy.
      @param strategy the strategy to calculate boosted balance of
      @param user the user to calculate boosted balance of
      @return the boosted balance
     */
    function boostedBalanceOf(ERC20 strategy, address user)
        external
        view
        returns (uint256)
    {
        return CToken(address(strategy)).borrowBalanceStored(user);
    }
}
