// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/utils/SafeERC20Upgradeable.sol";

import "../external/balancer/IBalancerPool.sol";
import "../external/uniswap/IUniswapV2Router02.sol";

import "./IRedemptionStrategy.sol";

/**
 * @title BalancerPoolTokenLiquidator
 * @notice Exchanges seized Balancer Pool Token (BPT) collateral for underlying tokens for use as a step in a liquidation.
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 */
contract BalancerPoolTokenLiquidator is IRedemptionStrategy {
  using SafeERC20Upgradeable for IERC20Upgradeable;

  /**
   * @dev Internal function to approve unlimited tokens of `erc20Contract` to `to`.
     */
  function safeApprove(IERC20Upgradeable token, address to, uint256 minAmount) private {
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
  function redeem(IERC20Upgradeable inputToken, uint256 inputAmount, bytes memory strategyData)
  external
  override
  returns (IERC20Upgradeable outputToken, uint256 outputAmount) {
    // Exit Balancer pool
    IBalancerPool balancerPool = IBalancerPool(address(inputToken));
    address[] memory tokens = balancerPool.getFinalTokens();
    uint256[] memory minAmountsOut = new uint256[](tokens.length);
    balancerPool.exitPool(inputAmount, minAmountsOut);

    // Swap underlying tokens
    (IUniswapV2Router02 uniswapV2Router, address[][] memory swapPaths) = abi.decode(strategyData, (IUniswapV2Router02, address[][]));
    require(swapPaths.length == tokens.length, "Swap paths array length must match the number of underlying tokens in the Balancer pool.");
    for (uint256 i = 1; i < swapPaths.length; i++)
      require((swapPaths[0].length > 0 ? swapPaths[0][swapPaths[0].length - 1] : tokens[0]) == (swapPaths[i].length > 0 ? swapPaths[i][swapPaths[i].length - 1] : tokens[i]), "All underlying token swap paths must output the same token.");

    for (uint256 i = 0; i < swapPaths.length; i++) if (swapPaths[i].length > 0 && swapPaths[i][swapPaths[i].length - 1] != tokens[i]) {
      uint256 swapAmountIn = IERC20Upgradeable(tokens[i]).balanceOf(address(this));
      safeApprove(IERC20Upgradeable(tokens[i]), address(uniswapV2Router), swapAmountIn);
      uniswapV2Router.swapExactTokensForTokens(swapAmountIn, 0, swapPaths[i], address(this), block.timestamp);
    }

    // Get new collateral
    outputToken = IERC20Upgradeable(swapPaths[0].length > 0 ? swapPaths[0][swapPaths[0].length - 1] : tokens[0]);
    outputAmount = outputToken.balanceOf(address(this));
  }

  function name() public pure returns (string memory) {
    return "BalancerPoolTokenLiquidator";
  }
}
