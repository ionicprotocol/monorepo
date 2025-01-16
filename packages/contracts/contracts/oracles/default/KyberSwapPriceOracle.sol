// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { IPool } from "../../external/kyber/IPool.sol";
import { IPoolOracle } from "../../external/kyber/IPoolOracle.sol";
import { ICErc20 } from "../../compound/CTokenInterfaces.sol";
import { ERC20Upgradeable } from "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";
import { BasePriceOracle } from "../BasePriceOracle.sol";
import { ConcentratedLiquidityBasePriceOracle } from "./ConcentratedLiquidityBasePriceOracle.sol";

import "../../external/uniswap/TickMath.sol";
import "../../external/uniswap/FullMath.sol";
import "../../ionic/SafeOwnableUpgradeable.sol";

/**
 * @title KyberSwapPriceOracle
 * @author Carlo Mazzaferro <carlo@midascapital.xyz> (https://github.com/carlomazzaferro)
 * @notice KyberSwapPriceOracle is a price oracle for Kybet-style pairs.
 * @dev Implements the `BasePriceOracle` interface used by Ionic pools (and Compound v2).
 */

contract KyberSwapPriceOracle is ConcentratedLiquidityBasePriceOracle {
  /**
   * @dev Fetches the price for a token from Algebra pools.
   */

  function _price(address token) internal view override returns (uint256) {
    uint32[] memory secondsAgos = new uint32[](2);
    uint256 twapWindow = poolFeeds[token].twapWindow;
    address baseToken = poolFeeds[token].baseToken;

    secondsAgos[0] = 0;
    secondsAgos[1] = uint32(twapWindow);

    IPool pool = IPool(poolFeeds[token].poolAddress);
    IPoolOracle poolOracle = IPoolOracle(pool.poolOracle());

    int56[] memory tickCumulatives = poolOracle.observeFromPool(address(pool), secondsAgos);

    int24 tick = int24((tickCumulatives[1] - tickCumulatives[0]) / int56(int256(twapWindow)));
    uint160 sqrtPriceX96 = TickMath.getSqrtRatioAtTick(tick);

    uint256 baseTokenDecimals = uint256(ERC20Upgradeable(baseToken).decimals());
    uint256 tokenDecimals = uint256(ERC20Upgradeable(token).decimals());

    uint256 tokenPrice = getPriceX96FromSqrtPriceX96(baseToken, token, sqrtPriceX96);
    uint256 tokenPriceScaled;

    if (baseTokenDecimals > tokenDecimals) {
      tokenPriceScaled = tokenPrice / (10 ** (baseTokenDecimals - tokenDecimals));
    } else if (baseTokenDecimals < tokenDecimals) {
      tokenPriceScaled = tokenPrice / (10 ** (tokenDecimals - baseTokenDecimals));
    } else {
      tokenPriceScaled = tokenPrice;
    }

    uint256 baseNativePrice = BasePriceOracle(msg.sender).price(baseToken);
    return (tokenPriceScaled * baseNativePrice) / 1e18;
  }
}
