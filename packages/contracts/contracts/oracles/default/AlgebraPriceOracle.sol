// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { BasePriceOracle } from "../BasePriceOracle.sol";
import { ERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";
import { ConcentratedLiquidityBasePriceOracle } from "./ConcentratedLiquidityBasePriceOracle.sol";
import { IAlgebraPool } from "../../external/algebra/IAlgebraPool.sol";

import "../../external/uniswap/TickMath.sol";
import "../../external/uniswap/FullMath.sol";

/**
 * @title UniswapV3PriceOracle
 * @author Carlo Mazzaferro <carlo@midascapital.xyz> (https://github.com/carlomazzaferro)
 * @notice AlgebraPriceOracle is a price oracle for Algebra pairs.
 * @dev Implements the `PriceOracle` interface used by Ionic pools (and Compound v2).
 */
contract AlgebraPriceOracle is ConcentratedLiquidityBasePriceOracle {
  /**
   * @dev Fetches the price for a token from Algebra pools
   */
  function _price(address token) internal view override returns (uint256) {
    uint32[] memory secondsAgos = new uint32[](2);
    uint256 twapWindow = poolFeeds[token].twapWindow;
    address baseToken = poolFeeds[token].baseToken;

    secondsAgos[0] = uint32(twapWindow);
    secondsAgos[1] = 0;

    IAlgebraPool pool = IAlgebraPool(poolFeeds[token].poolAddress);
    (int56[] memory tickCumulatives, , , ) = pool.getTimepoints(secondsAgos);

    int24 tick = int24((tickCumulatives[1] - tickCumulatives[0]) / int56(int256(twapWindow)));
    uint160 sqrtPriceX96 = TickMath.getSqrtRatioAtTick(tick);

    uint256 tokenPrice = getPriceX96FromSqrtPriceX96(pool.token0(), token, sqrtPriceX96);
    return scalePrices(baseToken, token, tokenPrice);
  }
}
