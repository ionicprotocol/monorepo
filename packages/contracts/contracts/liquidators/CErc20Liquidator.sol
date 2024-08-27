// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

import "../external/compound/ICErc20.sol";

import "./IRedemptionStrategy.sol";

/**
 * @title CErc20Liquidator
 * @notice Redeems seized Compound/Cream/Ionic CErc20 cTokens for underlying tokens for use as a step in a liquidation.
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 */
contract CErc20Liquidator is IRedemptionStrategy {
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
    // Redeem cErc20 for underlying ERC20 token (and store output as new collateral)
    ICErc20Compound cErc20 = ICErc20Compound(address(inputToken));
    uint256 redeemResult = cErc20.redeem(inputAmount);
    require(redeemResult == 0, "Error calling redeeming seized cErc20: error code not equal to 0");
    outputToken = IERC20Upgradeable(cErc20.underlying());
    outputAmount = outputToken.balanceOf(address(this));
  }

  function name() public pure returns (string memory) {
    return "CErc20Liquidator";
  }
}
