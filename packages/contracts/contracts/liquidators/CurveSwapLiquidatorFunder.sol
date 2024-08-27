// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "./CurveSwapLiquidator.sol";
import "./IFundsConversionStrategy.sol";

import { IERC20MetadataUpgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/extensions/IERC20MetadataUpgradeable.sol";

contract CurveSwapLiquidatorFunder is CurveSwapLiquidator, IFundsConversionStrategy {
  function convert(
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    bytes memory strategyData
  ) external returns (IERC20Upgradeable outputToken, uint256 outputAmount) {
    return _convert(inputToken, inputAmount, strategyData);
  }

  function estimateInputAmount(uint256 outputAmount, bytes memory strategyData)
    external
    view
    returns (IERC20Upgradeable, uint256)
  {
    ICurvePool curvePool;
    int128 i;
    int128 j;
    {
      (
        CurveLpTokenPriceOracleNoRegistry curveV1Oracle,
        CurveV2LpTokenPriceOracleNoRegistry curveV2Oracle,
        address inputTokenAddress,
        address outputTokenAddress,

      ) = abi.decode(
          strategyData,
          (CurveLpTokenPriceOracleNoRegistry, CurveV2LpTokenPriceOracleNoRegistry, address, address, address)
        );

      if (address(curveV2Oracle) != address(0)) {
        (curvePool, i, j) = curveV2Oracle.getPoolForSwap(inputTokenAddress, outputTokenAddress);
      }
      if (address(curvePool) == address(0)) {
        (curvePool, i, j) = curveV1Oracle.getPoolForSwap(inputTokenAddress, outputTokenAddress);
      }
    }
    require(address(curvePool) != address(0), "!curve pool");

    IERC20MetadataUpgradeable inputMetadataToken = IERC20MetadataUpgradeable(curvePool.coins(uint256(int256(i))));
    uint256 inputAmountGuesstimate = guesstimateInputAmount(curvePool, i, j, inputMetadataToken, outputAmount);
    uint256 inputAmount = binSearch(
      curvePool,
      i,
      j,
      (70 * inputAmountGuesstimate) / 100,
      (130 * inputAmountGuesstimate) / 100,
      outputAmount
    );

    return (inputMetadataToken, inputAmount);
  }

  function guesstimateInputAmount(
    ICurvePool curvePool,
    int128 i,
    int128 j,
    IERC20MetadataUpgradeable inputMetadataToken,
    uint256 outputAmount
  ) internal view returns (uint256) {
    uint256 oneInputToken = 10**inputMetadataToken.decimals();
    uint256 outputTokensForOneInputToken = curvePool.get_dy(i, j, oneInputToken);
    // inputAmount / outputAmount = oneInputToken / outputTokensForOneInputToken
    uint256 inputAmount = (outputAmount * oneInputToken) / outputTokensForOneInputToken;
    return inputAmount;
  }

  function binSearch(
    ICurvePool curvePool,
    int128 i,
    int128 j,
    uint256 low,
    uint256 high,
    uint256 value
  ) internal view returns (uint256) {
    if (low >= high) return low;

    uint256 mid = (low + high) / 2;
    uint256 outputAmount = curvePool.get_dy(i, j, mid);
    if (outputAmount == 0) revert("output amount 0");
    // output can be up to 10% in excess
    if (outputAmount >= value && outputAmount <= (11 * value) / 10) return mid;
    else if (outputAmount > value) {
      return binSearch(curvePool, i, j, low, mid, value);
    } else {
      return binSearch(curvePool, i, j, mid, high, value);
    }
  }

  function name() public pure override(CurveSwapLiquidator, IRedemptionStrategy) returns (string memory) {
    return "CurveSwapLiquidatorFunder";
  }
}
