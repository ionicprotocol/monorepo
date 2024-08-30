// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/utils/SafeERC20Upgradeable.sol";

import "../external/uniswap/IUniswapV2Router02.sol";
import "../external/uniswap/IUniswapV2Pair.sol";

import "../external/gelato/GUniPool.sol";

import "./IRedemptionStrategy.sol";

/**
 * @title GelatoGUniLiquidator
 * @notice Exchanges seized GelatoGUni token collateral for underlying tokens for use as a step in a liquidation.
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 */
contract GelatoGUniLiquidator is IRedemptionStrategy {
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
    // Exit GUni pool
    GUniPool pool = GUniPool(address(inputToken));
    address token0 = pool.token0();
    address token1 = pool.token1();
    (uint256 amount0, uint256 amount1, ) = pool.burn(inputAmount, address(this));

    // Swap underlying tokens
    (IUniswapV2Router02 uniswapV2Router, address[] memory swapToken0Path, address[] memory swapToken1Path) = abi.decode(
      strategyData,
      (IUniswapV2Router02, address[], address[])
    );
    require(
      (swapToken0Path.length > 0 ? swapToken0Path[swapToken0Path.length - 1] : token0) ==
        (swapToken1Path.length > 0 ? swapToken1Path[swapToken1Path.length - 1] : token1),
      "Output of token0 swap path must equal output of token1 swap path."
    );

    if (swapToken0Path.length > 0 && swapToken0Path[swapToken0Path.length - 1] != token0) {
      safeApprove(IERC20Upgradeable(token0), address(uniswapV2Router), amount0);
      uniswapV2Router.swapExactTokensForTokens(amount0, 0, swapToken0Path, address(this), block.timestamp);
    }

    if (swapToken1Path.length > 0 && swapToken1Path[swapToken1Path.length - 1] != token1) {
      safeApprove(IERC20Upgradeable(token1), address(uniswapV2Router), amount1);
      uniswapV2Router.swapExactTokensForTokens(amount1, 0, swapToken1Path, address(this), block.timestamp);
    }

    // Get new collateral
    outputToken = IERC20Upgradeable(swapToken0Path.length > 0 ? swapToken0Path[swapToken0Path.length - 1] : token0);
    outputAmount = outputToken.balanceOf(address(this));
  }

  function name() public pure returns (string memory) {
    return "GelatoGUniLiquidator";
  }
}
