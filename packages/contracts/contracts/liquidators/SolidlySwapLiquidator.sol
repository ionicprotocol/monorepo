// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/utils/SafeERC20Upgradeable.sol";

import { IRouter } from "../external/solidly/IRouter.sol";

import "./IRedemptionStrategy.sol";

/**
 * @title SolidlySwapLiquidator
 * @notice Exchanges seized token collateral for underlying tokens via a Solidly router for use as a step in a liquidation.
 */
contract SolidlySwapLiquidator is IRedemptionStrategy {
  using SafeERC20Upgradeable for IERC20Upgradeable;

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
    return _convert(inputToken, inputAmount, strategyData);
  }

  function _convert(
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    bytes memory strategyData
  ) internal returns (IERC20Upgradeable outputToken, uint256 outputAmount) {
    // Get Solidly router and path
    (IRouter solidlyRouter, address tokenTo, bool stable) = abi.decode(strategyData, (IRouter, address, bool));

    // Swap underlying tokens
    inputToken.approve(address(solidlyRouter), inputAmount);
    solidlyRouter.swapExactTokensForTokensSimple(
      inputAmount,
      0,
      address(inputToken),
      tokenTo,
      stable,
      address(this),
      block.timestamp
    );

    // Get new collateral
    outputToken = IERC20Upgradeable(tokenTo);
    outputAmount = outputToken.balanceOf(address(this));
  }

  function name() public pure returns (string memory) {
    return "SolidlySwapLiquidator";
  }
}
