// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { FixedPointMathLib } from "solmate/utils/FixedPointMathLib.sol";
import { IFundsConversionStrategy } from "./IFundsConversionStrategy.sol";
import { IRedemptionStrategy } from "./IRedemptionStrategy.sol";
import "./UniswapV3Liquidator.sol";

import { Quoter } from "../external/uniswap/quoter/Quoter.sol";

contract UniswapV3LiquidatorFunder is UniswapV3Liquidator, IFundsConversionStrategy {
  using FixedPointMathLib for uint256;

  function convert(
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    bytes memory strategyData
  ) external override returns (IERC20Upgradeable outputToken, uint256 outputAmount) {
    return _convert(inputToken, inputAmount, strategyData);
  }

  /**
   * @dev Estimates the needed input amount of the input token for the conversion to return the desired output amount.
   * @param outputAmount the desired output amount
   * @param strategyData the input token
   */
  function estimateInputAmount(uint256 outputAmount, bytes memory strategyData)
    external
    view
    returns (IERC20Upgradeable inputToken, uint256 inputAmount)
  {
    (address _inputToken, address _outputToken, uint24 fee, , Quoter quoter) = abi.decode(
      strategyData,
      (address, address, uint24, IV3SwapRouter, Quoter)
    );

    inputAmount = quoter.estimateMinSwapUniswapV3(_inputToken, _outputToken, outputAmount, fee);
    inputToken = IERC20Upgradeable(_inputToken);
  }

  function name() public pure override(UniswapV3Liquidator, IRedemptionStrategy) returns (string memory) {
    return "UniswapV3LiquidatorFunder";
  }
}
