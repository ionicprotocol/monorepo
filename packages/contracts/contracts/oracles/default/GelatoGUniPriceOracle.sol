// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";

import "../../external/gelato/GUniPool.sol";

import "../BasePriceOracle.sol";

/**
 * @title GelatoGUniPriceOracle
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 * @notice GelatoGUniPriceOracle is a price oracle for Gelato G-UNI wrapped Uniswap V3 LP tokens.
 * @dev Implements the `PriceOracle` interface used by Ionic pools (and Compound v2).
 */
contract GelatoGUniPriceOracle is BasePriceOracle {
  /**
   * @dev The Wrapped native asset address.
   */
  address public immutable WTOKEN;

  /**
   * @dev Constructor to set admin and canAdminOverwrite, wtoken address and native token USD price feed address
   */
  constructor(address wtoken) {
    WTOKEN = wtoken;
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
   * @dev Implements the `PriceOracle` interface for Ionic pools (and Compound v2).
   * @return Price in ETH of the token underlying `cToken`, scaled by `10 ** (36 - underlyingDecimals)`.
   */
  function getUnderlyingPrice(ICErc20 cToken) external view override returns (uint256) {
    address underlying = cToken.underlying();
    // Comptroller needs prices to be scaled by 1e(36 - decimals)
    // Since `_price` returns prices scaled by 18 decimals, we must scale them by 1e(36 - 18 - decimals)
    return (_price(underlying) * 1e18) / (10 ** uint256(ERC20Upgradeable(underlying).decimals()));
  }

  /**
   * @dev Fetches the fair LP token/ETH price from Uniswap, with 18 decimals of precision.
   */
  function _price(address token) internal view virtual returns (uint256) {
    // Get G-UNI pool and underlying tokens
    GUniPool pool = GUniPool(token);
    address token0 = pool.token0();
    address token1 = pool.token1();

    // Get underlying token prices
    uint256 p0 = token0 == WTOKEN ? 1e18 : BasePriceOracle(msg.sender).price(token0);
    require(p0 > 0, "Failed to retrieve price for G-UNI underlying token0.");
    uint256 p1 = token1 == WTOKEN ? 1e18 : BasePriceOracle(msg.sender).price(token1);
    require(p1 > 0, "Failed to retrieve price for G-UNI underlying token1.");

    // Get conversion factors
    uint256 dec0 = uint256(ERC20Upgradeable(token0).decimals());
    require(dec0 <= 18, "G-UNI underlying token0 decimals greater than 18.");
    uint256 to18Dec0 = 10 ** (18 - dec0);
    uint256 dec1 = uint256(ERC20Upgradeable(token1).decimals());
    require(dec1 <= 18, "G-UNI underlying token1 decimals greater than 18.");
    uint256 to18Dec1 = 10 ** (18 - dec1);

    // Get square root of underlying token prices
    // token1/token0
    // = (p0 / 10^dec0) / (p1 / 10^dec1)
    // = (p0 * 10^dec1) / (p1 * 10^dec0)
    // [From Uniswap's definition] sqrtPriceX96
    // = sqrt(token1/token0) * 2^96
    // = sqrt((p0 * 10^dec1) / (p1 * 10^dec0)) * 2^96
    // = sqrt((p0 * 10^dec1) / (p1 * 10^dec0)) * 2^48 * 2^48
    // = sqrt((p0 * 10^dec1 * 2^96) / (p1 * 10^dec0)) * 2^48
    uint160 sqrtPriceX96 = toUint160(sqrt((p0 * (10 ** dec1) * (1 << 96)) / (p1 * (10 ** dec0))) << 48);

    // Get balances of the tokens in the pool given fair underlying token prices
    (uint256 r0, uint256 r1) = pool.getUnderlyingBalancesAtPrice(sqrtPriceX96);
    require(r0 > 0 || r1 > 0, "G-UNI underlying token balances not both greater than 0.");

    // Add the total value of each token together and divide by the totalSupply to get the unit price
    return (p0 * r0 * to18Dec0 + p1 * r1 * to18Dec1) / ERC20Upgradeable(token).totalSupply();
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

  /**
   * @dev Converts uint256 to uint160.
   */
  function toUint160(uint256 x) internal pure returns (uint160 z) {
    require((z = uint160(x)) == x, "Overflow when converting uint256 into uint160.");
  }
}
