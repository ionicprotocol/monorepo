// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

import "../external/curve/ICurvePool.sol";
import "../oracles/default/CurveLpTokenPriceOracleNoRegistry.sol";

import { WETH } from "solmate/tokens/WETH.sol";

import "./IRedemptionStrategy.sol";

/**
 * @title CurveLpTokenLiquidatorNoRegistry
 * @notice Redeems seized Curve LP token collateral for underlying tokens for use as a step in a liquidation.
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 */
contract CurveLpTokenLiquidatorNoRegistry is IRedemptionStrategy {
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
    // TODO get the curvePool from the strategyData instead of the _oracle
    (address outputTokenAddress, address payable wtoken, address _oracle) = abi.decode(
      strategyData,
      (address, address, address)
    );
    // the oracle contains the pool registry
    CurveLpTokenPriceOracleNoRegistry oracle = CurveLpTokenPriceOracleNoRegistry(_oracle);

    // Remove liquidity from Curve pool in the form of one coin only (and store output as new collateral)
    ICurvePool curvePool = ICurvePool(oracle.poolOf(address(inputToken)));

    uint8 outputIndex = type(uint8).max;

    uint8 j = 0;
    while (outputIndex == type(uint8).max) {
      try curvePool.coins(uint256(j)) returns (address coin) {
        if (coin == outputTokenAddress) outputIndex = j;
      } catch {
        break;
      }
      j++;
    }

    curvePool.remove_liquidity_one_coin(inputAmount, int128(int8(outputIndex)), 1);

    // better safe than sorry
    if (outputTokenAddress == address(0) || outputTokenAddress == 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE) {
      WETH(wtoken).deposit{ value: address(this).balance }();
      outputToken = IERC20Upgradeable(wtoken);
    } else {
      outputToken = IERC20Upgradeable(outputTokenAddress);
    }
    outputAmount = outputToken.balanceOf(address(this));

    return (outputToken, outputAmount);
  }

  function name() public pure returns (string memory) {
    return "CurveLpTokenLiquidatorNoRegistry";
  }
}

contract CurveLpTokenWrapper is IRedemptionStrategy {
  function redeem(
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    bytes memory strategyData
  ) external returns (IERC20Upgradeable outputToken, uint256 outputAmount) {
    (ICurvePool curvePool, address _outputTokenAddress) = abi.decode(strategyData, (ICurvePool, address));
    outputToken = IERC20Upgradeable(_outputTokenAddress);

    uint8 inputIndex = type(uint8).max;

    uint8 j = 0;
    while (inputIndex == type(uint8).max) {
      try curvePool.coins(uint256(j)) returns (address coin) {
        if (coin == address(inputToken)) inputIndex = j;
      } catch {
        break;
      }
      j++;
    }

    inputToken.approve(address(curvePool), inputAmount);
    uint256[2] memory amounts;
    amounts[inputIndex] = inputAmount;
    curvePool.add_liquidity(amounts, 1);

    outputAmount = outputToken.balanceOf(address(this));
  }

  function name() public pure returns (string memory) {
    return "CurveLpTokenWrapper";
  }
}
