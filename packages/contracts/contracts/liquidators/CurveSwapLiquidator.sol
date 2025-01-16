// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

import "../external/curve/ICurvePool.sol";

import { WETH } from "solmate/tokens/WETH.sol";

import "./IRedemptionStrategy.sol";

import "../oracles/default/CurveV2LpTokenPriceOracleNoRegistry.sol";
import "../oracles/default/CurveLpTokenPriceOracleNoRegistry.sol";

/**
 * @title CurveSwapLiquidator
 * @notice Swaps seized token collateral via Curve as a step in a liquidation.
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 */
contract CurveSwapLiquidator is IRedemptionStrategy {
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
  ) external override returns (IERC20Upgradeable, uint256) {
    return _convert(inputToken, inputAmount, strategyData);
  }

  function _convert(
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    bytes memory strategyData
  ) internal returns (IERC20Upgradeable outputToken, uint256 outputAmount) {
    (
      CurveLpTokenPriceOracleNoRegistry curveV1Oracle,
      CurveV2LpTokenPriceOracleNoRegistry curveV2Oracle,
      ,
      address outputTokenAddress,
      address payable wtoken
    ) = abi.decode(
        strategyData,
        (CurveLpTokenPriceOracleNoRegistry, CurveV2LpTokenPriceOracleNoRegistry, address, address, address)
      );

    address inputTokenAddress = address(inputToken);

    ICurvePool curvePool;
    int128 i;
    int128 j;
    if (address(curveV2Oracle) != address(0)) {
      (curvePool, i, j) = curveV2Oracle.getPoolForSwap(inputTokenAddress, outputTokenAddress);
    }
    if (address(curvePool) == address(0)) {
      (curvePool, i, j) = curveV1Oracle.getPoolForSwap(inputTokenAddress, outputTokenAddress);
    }
    require(address(curvePool) != address(0), "!curve pool");

    inputToken.approve(address(curvePool), inputAmount);
    curvePool.exchange(i, j, inputAmount, 0);

    // Convert to W_NATIVE if ETH
    if (outputTokenAddress == address(0) || outputTokenAddress == 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE) {
      WETH(wtoken).deposit{ value: outputAmount }();
      outputToken = IERC20Upgradeable(wtoken);
    } else {
      outputToken = IERC20Upgradeable(outputTokenAddress);
    }
    outputAmount = outputToken.balanceOf(address(this));

    return (outputToken, outputAmount);
  }

  function name() public pure virtual returns (string memory) {
    return "CurveSwapLiquidator";
  }
}
