// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

import "../external/curve/ICurvePool.sol";
import { IERC4626 } from "../compound/IERC4626.sol";

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
      CurveV2LpTokenPriceOracleNoRegistry curveV2Oracle,
      address outputTokenAddress,
      address _unwrappedInput,
      address _unwrappedOutput
    ) = abi.decode(strategyData, (CurveV2LpTokenPriceOracleNoRegistry, address, address, address));

    if (_unwrappedOutput != address(0)) {
      outputToken = IERC20Upgradeable(_unwrappedOutput);
    } else {
      outputToken = IERC20Upgradeable(outputTokenAddress);
    }

    if (_unwrappedInput != address(0)) {
      inputToken.approve(address(inputToken), inputAmount);
      IERC4626(address(inputToken)).redeem(inputAmount, address(this), address(this));
      inputToken = IERC20Upgradeable(_unwrappedInput);
    }

    address inputTokenAddress = address(inputToken);

    ICurvePool curvePool;
    int128 i;
    int128 j;
    if (address(curveV2Oracle) != address(0)) {
      (curvePool, i, j) = curveV2Oracle.getPoolForSwap(inputTokenAddress, address(outputToken));
    }
    require(address(curvePool) != address(0), "!curve pool");

    inputToken.approve(address(curvePool), inputAmount);
    outputAmount = curvePool.exchange(i, j, inputAmount, 0);

    if (_unwrappedOutput != address(0)) {
      IERC20Upgradeable(_unwrappedOutput).approve(address(outputTokenAddress), outputAmount);
      IERC4626(outputTokenAddress).deposit(outputAmount, address(this));
      outputAmount = IERC4626(_unwrappedOutput).balanceOf(address(this));
      outputToken = IERC20Upgradeable(outputTokenAddress);
    }

    outputAmount = outputToken.balanceOf(address(this));
    return (outputToken, outputAmount);
  }

  function name() public pure virtual returns (string memory) {
    return "CurveSwapLiquidator";
  }
}
