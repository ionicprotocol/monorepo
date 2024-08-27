// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/utils/SafeERC20Upgradeable.sol";

import "../external/uniswap/IUniswapV2Router02.sol";

import "./IRedemptionStrategy.sol";

abstract contract BaseUniswapV2Liquidator is IRedemptionStrategy {
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
    // Get Uniswap router and path
    (IUniswapV2Router02 uniswapV2Router, address[] memory swapPath) = abi.decode(
      strategyData,
      (IUniswapV2Router02, address[])
    );
    require(swapPath.length >= 2 && swapPath[0] == address(inputToken), "Invalid UniswapLiquidator swap path.");

    // Swap underlying tokens
    inputToken.approve(address(uniswapV2Router), inputAmount);

    // call the relevant fn depending on the uni v2 fork specifics
    _swap(uniswapV2Router, inputAmount, swapPath);

    // Get new collateral
    outputToken = IERC20Upgradeable(swapPath[swapPath.length - 1]);
    outputAmount = outputToken.balanceOf(address(this));
  }

  function _swap(
    IUniswapV2Router02 uniswapV2Router,
    uint256 inputAmount,
    address[] memory swapPath
  ) internal virtual;
}
