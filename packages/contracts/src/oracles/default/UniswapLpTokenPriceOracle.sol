// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

import "../../external/compound/IPriceOracle.sol";
import "../../external/compound/ICToken.sol";
import "../../external/compound/ICErc20.sol";

import "../../external/uniswap/IUniswapV2Pair.sol";

import "../BasePriceOracle.sol";

/**
 * @title UniswapLpTokenPriceOracle
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 * @notice UniswapLpTokenPriceOracle is a price oracle for Uniswap (and SushiSwap) LP tokens.
 * @dev Implements the `PriceOracle` interface used by Fuse pools (and Compound v2).
 */
contract UniswapLpTokenPriceOracle is IPriceOracle {
  /**
   * @dev wtoken contract address.
   */
  address public immutable wtoken;

  /**
   * @dev Constructor to set admin and canAdminOverwrite, wtoken address and native token USD price feed address
   */
  constructor(address _wtoken) {
    wtoken = _wtoken;
  }

  /**
   * @notice Get the LP token price price for an underlying token address.
   * @param underlying The underlying token address for which to get the price (set to zero address for ETH)
   * @return Price denominated in ETH (scaled by 1e18)
   */
  function price(address underlying) external view returns (uint256) {
    return _price(underlying);
  }

  /**
   * @notice Returns the price in ETH of the token underlying `cToken`.
   * @dev Implements the `PriceOracle` interface for Fuse pools (and Compound v2).
   * @return Price in ETH of the token underlying `cToken`, scaled by `10 ** (36 - underlyingDecimals)`.
   */
  function getUnderlyingPrice(ICToken cToken) external view override returns (uint256) {
    address underlying = ICErc20(address(cToken)).underlying();
    // Comptroller needs prices to be scaled by 1e(36 - decimals)
    // Since `_price` returns prices scaled by 18 decimals, we must scale them by 1e(36 - 18 - decimals)
    return (_price(underlying) * 1e18) / (10**uint256(ERC20Upgradeable(underlying).decimals()));
  }

  /**
   * @dev Fetches the fair LP token/ETH price from Uniswap, with 18 decimals of precision.
   */
  function _price(address token) internal view virtual returns (uint256) {
    IUniswapV2Pair pair = IUniswapV2Pair(token);
    uint256 totalSupply = pair.totalSupply();
    if (totalSupply == 0) return 0;
    (uint256 reserve0, uint256 reserve1, ) = pair.getReserves();
    address token0 = pair.token0();
    address token1 = pair.token1();

    // Get fair price of non-WETH token (underlying the pair) in terms of ETH
    uint256 token0FairPrice = token0 == wtoken
      ? 1e18
      : (BasePriceOracle(msg.sender).price(token0) * 1e18) / (10**uint256(ERC20Upgradeable(token0).decimals()));
    uint256 token1FairPrice = token1 == wtoken
      ? 1e18
      : (BasePriceOracle(msg.sender).price(token1) * 1e18) / (10**uint256(ERC20Upgradeable(token1).decimals()));

    // Implementation from https://github.com/AlphaFinanceLab/homora-v2/blob/e643392d582c81f6695136971cff4b685dcd2859/contracts/oracle/UniswapV2Oracle.sol#L18
    uint256 sqrtK = (sqrt(reserve0 * reserve1) * (2**112)) / totalSupply;
    return (((sqrtK * 2 * sqrt(token0FairPrice)) / (2**56)) * sqrt(token1FairPrice)) / (2**56);
  }

  /**
   * @dev Fast square root function.
   * Implementation from: https://github.com/Uniswap/uniswap-lib/commit/99f3f28770640ba1bb1ff460ac7c5292fb8291a0
   * Original implementation: https://github.com/abdk-consulting/abdk-libraries-solidity/blob/master/ABDKMath64x64.sol#L687
   */
  function sqrt(uint256 x) internal pure returns (uint256) {
    if (x == 0) return 0;
    uint256 xx = x;
    uint256 r = 1;

    if (xx >= 0x100000000000000000000000000000000) {
      xx >>= 128;
      r <<= 64;
    }
    if (xx >= 0x10000000000000000) {
      xx >>= 64;
      r <<= 32;
    }
    if (xx >= 0x100000000) {
      xx >>= 32;
      r <<= 16;
    }
    if (xx >= 0x10000) {
      xx >>= 16;
      r <<= 8;
    }
    if (xx >= 0x100) {
      xx >>= 8;
      r <<= 4;
    }
    if (xx >= 0x10) {
      xx >>= 4;
      r <<= 2;
    }
    if (xx >= 0x8) {
      r <<= 1;
    }

    r = (r + x / r) >> 1;
    r = (r + x / r) >> 1;
    r = (r + x / r) >> 1;
    r = (r + x / r) >> 1;
    r = (r + x / r) >> 1;
    r = (r + x / r) >> 1;
    r = (r + x / r) >> 1; // Seven iterations should be enough
    uint256 r1 = x / r;
    return (r < r1 ? r : r1);
  }
}
