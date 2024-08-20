// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";

import { IPair } from "../../external/solidly/IPair.sol";
import { BasePriceOracle } from "../BasePriceOracle.sol";
import { UniswapLikeLpTokenPriceOracle } from "./UniswapLikeLpTokenPriceOracle.sol";

/**
 * @title SolidlyLpTokenPriceOracle
 * @author Carlo Mazzaferro, David Lucid <david@rari.capital> (https://github.com/davidlucid)
 * @notice SolidlyLpTokenPriceOracle is a price oracle for Solidly LP tokens.
 * @dev Implements the `PriceOracle` interface used by Ionic pools (and Compound v2).
 */
contract SolidlyLpTokenPriceOracle is UniswapLikeLpTokenPriceOracle {
  /**
   * @dev Fetches the fair LP token/ETH price from Uniswap, with 18 decimals of precision.
   */
  constructor(address _wtoken) UniswapLikeLpTokenPriceOracle(_wtoken) {}

  // Same implementation as UniswapLpTokenPriceOracle
  function _priceVolatile(address token) internal view virtual returns (uint256) {
    IPair pair = IPair(token);
    uint256 t_s = pair.totalSupply();
    if (t_s == 0) return 0;
    (uint256 r0, uint256 r1, ) = pair.getReserves();

    r0 = r0 * 10**(18 - uint256(ERC20Upgradeable(pair.token0()).decimals()));
    r1 = r1 * 10**(18 - uint256(ERC20Upgradeable(pair.token1()).decimals()));

    address x = pair.token0();
    address y = pair.token1();

    // Get fair price of non-WETH token (underlying the pair) in terms of ETH
    uint256 P_x = x == wtoken ? 1e18 : BasePriceOracle(msg.sender).price(x);
    uint256 P_y = y == wtoken ? 1e18 : BasePriceOracle(msg.sender).price(y);

    // Implementation from https://github.com/AlphaFinanceLab/homora-v2/blob/e643392d582c81f6695136971cff4b685dcd2859/contracts/oracle/UniswapV2Oracle.sol#L18
    uint256 sqrtK = (sqrt(r0 * r1) * (2**112)) / t_s;
    return (((sqrtK * 2 * sqrt(P_x)) / (2**56)) * sqrt(P_y)) / (2**56);
  }

  // Derivation: [...]
  function _priceStable(address token) internal view virtual returns (uint256) {
    IPair pair = IPair(token);
    uint256 t_s = pair.totalSupply();

    if (t_s == 0) return 0;
    (uint256 r0, uint256 r1, ) = pair.getReserves();

    r0 = r0 * 10**(18 - uint256(ERC20Upgradeable(pair.token0()).decimals()));
    r1 = r1 * 10**(18 - uint256(ERC20Upgradeable(pair.token1()).decimals()));

    // Get fair price of non-WETH token (underlying the pair) in terms of ETH
    uint256 P_x = pair.token0() == wtoken ? 1e18 : BasePriceOracle(msg.sender).price(pair.token0());
    uint256 P_y = pair.token1() == wtoken ? 1e18 : BasePriceOracle(msg.sender).price(pair.token1());

    uint256 sqrt4K = _sqrt4k(r0, r1, t_s);

    uint256 denomFirstTerm = (P_x**2) * P_y + P_y**3;
    uint256 denomSecondTerm = (P_y**2) * P_x + P_x**3;

    // scale numerator up by sqrt(sqrt(10**16)) = 10**4 to avoid rounding errors
    uint256 firstTerm = (P_x * sqrt(sqrt((10**16 * P_x**3) / denomFirstTerm))) / 10**4;
    uint256 secondTerm = (P_y * sqrt(sqrt((10**16 * P_y**3) / denomSecondTerm))) / 10**4;

    return (sqrt4K * (firstTerm + secondTerm)) / 1e18;
  }

  function _sqrt4k(
    uint256 r0,
    uint256 r1,
    uint256 t_s
  ) public pure returns (uint256) {
    // sqrt4K = sqrt(sqrt((r0**3) * r1 + (r0**3) * r1)) / t_s;
    uint256 r03r1 = ((((r0**2 / 10**18) * r0) / 10**18) * r1);
    uint256 r13r0 = ((((r1**2 / 10**18) * r1) / 10**18) * r0);
    uint256 sqrtK = 10**18 * sqrt(r03r1 + r13r0);
    return (sqrt(sqrtK) * 1e18) / t_s;
  }

  function _price(address token) internal view virtual override returns (uint256) {
    IPair pair = IPair(token);

    if (pair.stable()) {
      return _priceStable(token);
    } else {
      return _priceVolatile(token);
    }
  }
}
