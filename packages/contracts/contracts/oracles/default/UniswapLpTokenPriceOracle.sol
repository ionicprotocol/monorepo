// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";

import "../../external/uniswap/IUniswapV2Pair.sol";

import "../BasePriceOracle.sol";
import { UniswapLikeLpTokenPriceOracle } from "./UniswapLikeLpTokenPriceOracle.sol";

/**
 * @title UniswapLpTokenPriceOracle
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 * @notice UniswapLpTokenPriceOracle is a price oracle for Uniswap (and SushiSwap) LP tokens.
 * @dev Implements the `PriceOracle` interface used by Ionic pools (and Compound v2).
 */
contract UniswapLpTokenPriceOracle is UniswapLikeLpTokenPriceOracle {
  /**
   * @dev Fetches the fair LP token/ETH price from Uniswap, with 18 decimals of precision.
   */
  constructor(address _wtoken) UniswapLikeLpTokenPriceOracle(_wtoken) {}

  function _price(address token) internal view virtual override returns (uint256) {
    IUniswapV2Pair pair = IUniswapV2Pair(token);
    uint256 totalSupply = pair.totalSupply();
    if (totalSupply == 0) return 0;
    (uint256 r0, uint256 r1, ) = pair.getReserves();

    r0 = r0 * 10**(18 - uint256(ERC20Upgradeable(pair.token0()).decimals()));
    r1 = r1 * 10**(18 - uint256(ERC20Upgradeable(pair.token1()).decimals()));

    address token0 = pair.token0();
    address token1 = pair.token1();

    // Get fair price of non-WETH token (underlying the pair) in terms of ETH
    uint256 token0FairPrice = token0 == wtoken ? 1e18 : BasePriceOracle(msg.sender).price(token0);
    uint256 token1FairPrice = token1 == wtoken ? 1e18 : BasePriceOracle(msg.sender).price(token1);

    // Implementation from https://github.com/AlphaFinanceLab/homora-v2/blob/e643392d582c81f6695136971cff4b685dcd2859/contracts/oracle/UniswapV2Oracle.sol#L18
    uint256 sqrtK = (sqrt(r0 * r1) * (2**112)) / totalSupply;
    return (((sqrtK * 2 * sqrt(token0FairPrice)) / (2**56)) * sqrt(token1FairPrice)) / (2**56);
  }
}
