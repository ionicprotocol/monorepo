// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

import "../../external/compound/IPriceOracle.sol";
import "../../external/compound/ICToken.sol";
import "../../external/compound/ICErc20.sol";

import "../../external/chainlink/AggregatorV3Interface.sol";

import "../BasePriceOracle.sol";

/**
 * @title FixedEurPriceOracle
 * @notice Returns fixed prices of 1 EUR in terms of Native Token for all tokens (expected to be used under a `MasterPriceOracle`).
 * @dev Implements `PriceOracle` and `BasePriceOracle`.
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 */
contract FixedEurPriceOracle is IPriceOracle, BasePriceOracle {
  /**
   * @notice The maximum number of seconds elapsed since the round was last updated before the price is considered stale. If set to 0, no limit is enforced.
   */
  uint256 public maxSecondsBeforePriceIsStale;

  /**
   * @notice Chainlink NATIVE/USD price feed contracts.
   */
  AggregatorV3Interface public immutable NATIVE_TOKEN_USD_PRICE_FEED;

  /**
   * @notice Chainlink EUR/USD price feed contracts.
   */
  AggregatorV3Interface public immutable EUR_USD_PRICE_FEED;

  /**
   * @dev Constructor to set `maxSecondsBeforePriceIsStale`.
   */
  constructor(
    uint256 _maxSecondsBeforePriceIsStale,
    address nativeTokenUsdPriceFeed,
    address eurUsdPriceFeed
  ) {
    maxSecondsBeforePriceIsStale = _maxSecondsBeforePriceIsStale;
    NATIVE_TOKEN_USD_PRICE_FEED = AggregatorV3Interface(nativeTokenUsdPriceFeed);
    EUR_USD_PRICE_FEED = AggregatorV3Interface(eurUsdPriceFeed);
  }

  /**
   * @dev Internal function returning the price in NATIVE of `underlying`.
   */
  function _price(address underlying) internal view returns (uint256) {
    // Get NATIVE/USD price from Chainlink

    (, int256 nativeUsdPrice, , uint256 updatedAt, ) = NATIVE_TOKEN_USD_PRICE_FEED.latestRoundData();
    if (maxSecondsBeforePriceIsStale > 0)
      require(block.timestamp <= updatedAt + maxSecondsBeforePriceIsStale, "NATIVE/USD Chainlink price is stale.");
    if (nativeUsdPrice <= 0) return 0;

    // Get EUR/USD price from Chainlink
    int256 eurUsdPrice;
    (, eurUsdPrice, , updatedAt, ) = EUR_USD_PRICE_FEED.latestRoundData();
    if (maxSecondsBeforePriceIsStale > 0)
      require(block.timestamp <= updatedAt + maxSecondsBeforePriceIsStale, "EUR/USD Chainlink price is stale.");
    if (eurUsdPrice <= 0) return 0;

    // Return EUR/NATIVE price = EUR/USD price / NATIVE/USD price
    return (uint256(eurUsdPrice) * 1e18) / uint256(nativeUsdPrice);
  }

  /**
   * @dev Returns the price in NATIVE of `underlying` (implements `BasePriceOracle`).
   */
  function price(address underlying) external view override returns (uint256) {
    return _price(underlying);
  }

  /**
   * @notice Returns the price in NATIVE of the token underlying `cToken`.
   * @dev Implements the `PriceOracle` interface for Fuse pools (and Compound v2).
   * @return Price in NATIVE of the token underlying `cToken`, scaled by `10 ** (36 - underlyingDecimals)`.
   */
  function getUnderlyingPrice(ICToken cToken) external view override returns (uint256) {
    // Get underlying token address
    address underlying = ICErc20(address(cToken)).underlying();

    // Format and return price
    // Comptroller needs prices to be scaled by 1e(36 - decimals)
    // Since `_price` returns prices scaled by 18 decimals, we must scale them by 1e(36 - 18 - decimals)
    return (_price(underlying) * 1e18) / (10**uint256(ERC20Upgradeable(underlying).decimals()));
  }
}
