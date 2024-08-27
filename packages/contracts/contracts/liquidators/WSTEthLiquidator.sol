// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

import "../external/lido/IWstETH.sol";

import "./IRedemptionStrategy.sol";

/**
 * @title WSTEthLiquidator
 * @notice Redeems wstETH for underlying stETH for use as a step in a liquidation.
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 */
contract WSTEthLiquidator is IRedemptionStrategy {
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
    // Unwrap wstETH (and store output stETH as new collateral)
    IWstETH token = IWstETH(address(inputToken));
    token.unwrap(inputAmount);
    outputToken = IERC20Upgradeable(token.stETH());
    outputAmount = inputAmount;
  }

  function name() public pure returns (string memory) {
    return "WSTEthLiquidator";
  }
}
