// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";

import "../external/uniswap/ISwapRouter.sol";

import "./IRedemptionStrategy.sol";

/**
 * @title UniswapV3Liquidator
 * @notice Exchanges seized token collateral for underlying tokens via a Uniswap V3 router for use as a step in a liquidation.
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 */
contract UniswapV3Liquidator is IRedemptionStrategy {
  using SafeERC20Upgradeable for IERC20Upgradeable;

  /**
   * @dev Internal function to approve unlimited tokens of `erc20Contract` to `to`.
   */
  function safeApprove(
    IERC20Upgradeable token,
    address to,
    uint256 minAmount
  ) private {
    uint256 allowance = token.allowance(address(this), to);

    if (allowance < minAmount) {
      if (allowance > 0) token.safeApprove(to, 0);
      token.safeApprove(to, type(uint256).max);
    }
  }

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
    // Get Uniswap router, output token, and fee
    (ISwapRouter swapRouter, address _outputToken, uint24 fee) = abi.decode(
      strategyData,
      (ISwapRouter, address, uint24)
    );

    // Swap underlying tokens
    safeApprove(inputToken, address(swapRouter), inputAmount);
    outputAmount = swapRouter.exactInputSingle(
      ISwapRouter.ExactInputSingleParams(
        address(inputToken),
        _outputToken,
        fee,
        address(this),
        block.timestamp,
        inputAmount,
        0,
        0
      )
    );
    outputToken = IERC20Upgradeable(_outputToken);
  }
}
