// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { IRedemptionStrategy } from "../IRedemptionStrategy.sol";
import { GammaLpTokenLiquidatorBase, GammaUniswapV3LpTokenLiquidatorBase, GammaLpTokenWrapperBase } from "./GammaLpTokenLiquidatorBase.sol";

import "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";

contract GammaUniswapV3LpTokenLiquidator is
  GammaLpTokenLiquidatorBase,
  GammaUniswapV3LpTokenLiquidatorBase,
  IRedemptionStrategy
{
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
  ) external returns (IERC20Upgradeable outputToken, uint256 outputAmount) {
    return _redeem(inputToken, inputAmount, strategyData);
  }

  function name() public pure returns (string memory) {
    return "GammaUniswapV3LpTokenLiquidator";
  }
}

contract GammaUniswapV3LpTokenWrapper is
  GammaLpTokenWrapperBase,
  GammaUniswapV3LpTokenLiquidatorBase,
  IRedemptionStrategy
{
  function redeem(
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    bytes memory strategyData
  ) external override returns (IERC20Upgradeable outputToken, uint256 outputAmount) {
    return _redeem(inputToken, inputAmount, strategyData);
  }

  function name() public pure returns (string memory) {
    return "GammaUniswapV3LpTokenWrapper";
  }
}
