// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

import "../external/stakedao/Sanctuary.sol";

import "./IRedemptionStrategy.sol";

/**
 * @title StakedSdtLiquidator
 * @notice Redeems Staked SDT (xSDT) for underlying SUSHI for use as a step in a liquidation.
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 */
contract StakedSdtLiquidator is IRedemptionStrategy {
  /**
   * @notice Redeems custom collateral `token` for an underlying token.
   * @param inputToken The input wrapped token to be redeemed for an underlying token.
   * @param inputAmount The amount of the input wrapped token to be redeemed for an underlying token.
   * @param strategyData The ABI-encoded data to be used in the redemption strategy logic.
   * @return outputToken The underlying ERC20 token outputted.
   * @return outputAmount The quantity of underlying tokens outputted.
   */
  function redeem(
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    bytes memory strategyData
  ) external override returns (IERC20Upgradeable outputToken, uint256 outputAmount) {
    // Unstake xSDT (and store output SDT as new collateral)
    Sanctuary sanctuary = Sanctuary(address(inputToken));
    sanctuary.leave(inputAmount);
    outputToken = IERC20Upgradeable(sanctuary.sdt());
    outputAmount = outputToken.balanceOf(address(this));
  }
}
