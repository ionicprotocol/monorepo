// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { IERC20Upgradeable } from "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import { IERC20MetadataUpgradeable } from "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/extensions/IERC20MetadataUpgradeable.sol";
import { FixedPointMathLib } from "solmate/utils/FixedPointMathLib.sol";
import { IFundsConversionStrategy } from "./IFundsConversionStrategy.sol";
import { ISynthereumLiquidityPool } from "../external/jarvis/ISynthereumLiquidityPool.sol";

contract JarvisLiquidatorFunder is IFundsConversionStrategy {
  using FixedPointMathLib for uint256;

  /**
   * @dev Redeems `inputToken` for `outputToken` where `inputAmount` < `outputAmount`
   * @param inputToken Address of the token
   * @param inputAmount input amount
   * @param strategyData context specific data like input token, pool address and tx expiratio period
   */
  function redeem(
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    bytes memory strategyData
  ) external override returns (IERC20Upgradeable outputToken, uint256 outputAmount) {
    return _convert(inputToken, inputAmount, strategyData);
  }

  function convert(
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
    (, address poolAddress, ) = abi.decode(strategyData, (address, address, uint256));
    ISynthereumLiquidityPool pool = ISynthereumLiquidityPool(poolAddress);

    // approve so the pool can pull out the input tokens
    inputToken.approve(address(pool), inputAmount);

    IERC20Upgradeable collateralToken = pool.collateralToken();
    IERC20Upgradeable syntheticToken = pool.syntheticToken();

    if (inputToken == syntheticToken) {
      outputToken = collateralToken;

      uint256 shutdownPrice = 0;
      // TODO figure out why this method was removed and what to use instead
      try pool.emergencyShutdownPrice() returns (uint256 price) {
        shutdownPrice = price;
      } catch {}

      if (shutdownPrice > 0) {
        // emergency shutdowns cannot be reverted, so this corner case must be covered
        (, uint256 collateralSettled) = pool.settleEmergencyShutdown();
        outputAmount = collateralSettled;
        // outputToken = collateralToken;
      } else {
        // redeem the underlying BUSD
        // fetch the estimated redeemable collateral in BUSD, less the fee paid
        (uint256 redeemableCollateralAmount, ) = pool.getRedeemTradeInfo(inputAmount);

        (uint256 collateralAmountReceived, ) = pool.redeem(
          ISynthereumLiquidityPool.RedeemParams(inputAmount, redeemableCollateralAmount, block.timestamp, address(this))
        );

        outputAmount = collateralAmountReceived;
      }
    } else if (inputToken == collateralToken) {
      outputToken = syntheticToken;

      // mint jBRL from the supplied bUSD
      (uint256 synthTokensReceived, ) = pool.getMintTradeInfo(inputAmount);

      (uint256 syntheticTokensMinted, ) = pool.mint(
        ISynthereumLiquidityPool.MintParams(synthTokensReceived, inputAmount, block.timestamp, address(this))
      );

      outputAmount = syntheticTokensMinted;
    } else {
      revert("unknown input token");
    }
  }

  /**
   * @dev Estimates the needed input amount of the input token for the conversion to return the desired output amount.
   * @param outputAmount the desired output amount
   * @param strategyData the input token
   */
  function estimateInputAmount(
    uint256 outputAmount,
    bytes memory strategyData
  ) external view returns (IERC20Upgradeable inputToken, uint256 inputAmount) {
    (address inputTokenAddress, address poolAddress, ) = abi.decode(strategyData, (address, address, uint256));

    inputToken = IERC20Upgradeable(inputTokenAddress);

    uint8 decimals = 18;
    try IERC20MetadataUpgradeable(inputTokenAddress).decimals() returns (uint8 dec) {
      decimals = dec;
    } catch {}
    uint256 ONE = 10 ** decimals;

    ISynthereumLiquidityPool pool = ISynthereumLiquidityPool(poolAddress);
    if (inputToken == pool.syntheticToken()) {
      // collateralAmountReceived / ONE = outputAmount / inputAmount
      // => inputAmount = (ONE * outputAmount) / collateralAmountReceived
      (uint256 collateralAmountReceived, ) = ISynthereumLiquidityPool(poolAddress).getRedeemTradeInfo(ONE);
      inputAmount = ONE.mulDivUp(outputAmount, collateralAmountReceived);
    } else if (inputToken == pool.collateralToken()) {
      // synthTokensReceived / ONE = outputAmount / inputAmount
      // => inputAmount = (ONE * outputAmount) / synthTokensReceived
      (uint256 synthTokensReceived, ) = ISynthereumLiquidityPool(poolAddress).getMintTradeInfo(ONE);
      inputAmount = ONE.mulDivUp(outputAmount, synthTokensReceived);
    } else {
      revert("unknown input token");
    }
  }

  function name() public pure returns (string memory) {
    return "JarvisLiquidatorFunder";
  }
}
