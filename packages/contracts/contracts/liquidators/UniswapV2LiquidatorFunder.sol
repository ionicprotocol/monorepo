// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { UniswapV2Liquidator } from "./UniswapV2Liquidator.sol";
import "./IFundsConversionStrategy.sol";
import "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import "../external/uniswap/IUniswapV2Router02.sol";

contract UniswapV2LiquidatorFunder is UniswapV2Liquidator, IFundsConversionStrategy {
  function convert(
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    bytes memory strategyData
  ) external override returns (IERC20Upgradeable outputToken, uint256 outputAmount) {
    return _convert(inputToken, inputAmount, strategyData);
  }

  function estimateInputAmount(
    uint256 outputAmount,
    bytes memory strategyData
  ) external view returns (IERC20Upgradeable inputToken, uint256 inputAmount) {
    (IUniswapV2Router02 uniswapV2Router, address[] memory swapPath) = abi.decode(
      strategyData,
      (IUniswapV2Router02, address[])
    );
    require(swapPath.length >= 2, "Invalid UniswapLiquidator swap path.");

    uint256[] memory amounts = uniswapV2Router.getAmountsIn(outputAmount, swapPath);

    inputAmount = amounts[0];
    inputToken = IERC20Upgradeable(swapPath[0]);
  }

  function name() public pure override(UniswapV2Liquidator, IRedemptionStrategy) returns (string memory) {
    return "UniswapV2LiquidatorFunder";
  }
}
