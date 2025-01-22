// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";

import "../../external/chainlink/AggregatorV3Interface.sol";

import "../BasePriceOracle.sol";
import { SafeOwnableUpgradeable } from "../../ionic/SafeOwnableUpgradeable.sol";

/**
 * @title ChainlinkPriceOracleV2
 * @notice Returns prices from Chainlink.
 * @dev Implements `PriceOracle`.
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 */
contract ChainlinkPriceOracleV2 is SafeOwnableUpgradeable, BasePriceOracle {
  /**
   * @notice Maps ERC20 token addresses to ETH-based Chainlink price feed contracts.
   */
  mapping(address => AggregatorV3Interface) public priceFeeds;

  /**
   * @notice Maps ERC20 token addresses to enums indicating the base currency of the feed.
   */
  mapping(address => FeedBaseCurrency) public feedBaseCurrencies;

  /**
   * @notice Enum indicating the base currency of a Chainlink price feed.
   * @dev ETH is interchangeable with the nativeToken of the current chain.
   */
  enum FeedBaseCurrency {
    ETH,
    USD
  }

  /**
   * @notice Chainlink NATIVE/USD price feed contracts.
   */
  address public NATIVE_TOKEN_USD_PRICE_FEED;

  /**
   * @notice The USD Token of the chain
   */
  address public USD_TOKEN;

  /**
   * @dev Constructor to set admin and canAdminOverwrite, wtoken address and native token USD price feed address
   * @param _usdToken The Wrapped native asset address
   * @param nativeTokenUsd Will this oracle return prices denominated in USD or in the native token.
   */
  function initialize(address _usdToken, address nativeTokenUsd) public initializer {
    __SafeOwnable_init(msg.sender);
    USD_TOKEN = _usdToken;
    NATIVE_TOKEN_USD_PRICE_FEED = nativeTokenUsd;
  }

  /**
   * @dev Admin-only function to set price feeds.
   * @param underlyings Underlying token addresses for which to set price feeds.
   * @param feeds The Chainlink price feed contract addresses for each of `underlyings`.
   * @param baseCurrency The currency in which `feeds` are based.
   */
  function setPriceFeeds(
    address[] memory underlyings,
    address[] memory feeds,
    FeedBaseCurrency baseCurrency
  ) external onlyOwner {
    // Input validation
    require(
      underlyings.length > 0 && underlyings.length == feeds.length,
      "Lengths of both arrays must be equal and greater than 0."
    );

    // For each token/feed
    for (uint256 i = 0; i < underlyings.length; i++) {
      address underlying = underlyings[i];
      // Set feed and base currency
      priceFeeds[underlying] = AggregatorV3Interface(feeds[i]);
      feedBaseCurrencies[underlying] = baseCurrency;
    }
  }

  /**
   * @notice Internal function returning the price in of `underlying`.
   * @dev If the oracle got constructed with `nativeTokenUsd` = TRUE this will return a price denominated in USD otherwise in the native token
   */
  function _price(address underlying) internal view returns (uint256) {
    // Get token/ETH price from Chainlink
    AggregatorV3Interface feed = priceFeeds[underlying];
    require(address(feed) != address(0), "No Chainlink price feed found for this underlying ERC20 token.");
    FeedBaseCurrency baseCurrency = feedBaseCurrencies[underlying];

    if (baseCurrency == FeedBaseCurrency.ETH) {
      (, int256 tokenEthPrice, , , ) = feed.latestRoundData();
      return tokenEthPrice >= 0 ? (uint256(tokenEthPrice) * 1e18) / (10 ** uint256(feed.decimals())) : 0;
    } else if (baseCurrency == FeedBaseCurrency.USD) {
      int256 nativeTokenUsdPrice;
      uint8 usdPriceDecimals;

      if (NATIVE_TOKEN_USD_PRICE_FEED == address(0)) {
        uint256 usdNativeTokenPrice = BasePriceOracle(msg.sender).price(USD_TOKEN);
        nativeTokenUsdPrice = int256(1e36 / usdNativeTokenPrice); // 18 decimals
        usdPriceDecimals = 18;
      } else {
        (, nativeTokenUsdPrice, , , ) = AggregatorV3Interface(NATIVE_TOKEN_USD_PRICE_FEED).latestRoundData();
        if (nativeTokenUsdPrice <= 0) return 0;
        usdPriceDecimals = AggregatorV3Interface(NATIVE_TOKEN_USD_PRICE_FEED).decimals();
      }
      (, int256 tokenUsdPrice, , , ) = feed.latestRoundData();

      return
        tokenUsdPrice >= 0
          ? ((uint256(tokenUsdPrice) * 1e18 * (10 ** uint256(usdPriceDecimals))) / (10 ** uint256(feed.decimals()))) /
            uint256(nativeTokenUsdPrice)
          : 0;
    } else {
      revert("unknown base currency");
    }
  }

  /**
   * @notice Returns the price in of `underlying` either in USD or the native token (implements `BasePriceOracle`).
   * @dev If the oracle got constructed with `nativeTokenUsd` = TRUE this will return a price denominated in USD otherwise in the native token
   */
  function price(address underlying) external view override returns (uint256) {
    return _price(underlying);
  }

  /**
   * @notice Returns the price in ETH of the token underlying `cToken`.
   * @dev Implements the `PriceOracle` interface for Ionic pools (and Compound v2).
   * @return Price in ETH of the token underlying `cToken`, scaled by `10 ** (36 - underlyingDecimals)`.
   */
  function getUnderlyingPrice(ICErc20 cToken) external view override returns (uint256) {
    // Get underlying token address
    address underlying = cToken.underlying();

    uint256 oraclePrice = _price(underlying);

    uint256 underlyingDecimals = uint256(ERC20Upgradeable(underlying).decimals());
    return
      underlyingDecimals <= 18
        ? uint256(oraclePrice) * (10 ** (18 - underlyingDecimals))
        : uint256(oraclePrice) / (10 ** (underlyingDecimals - 18));
  }
}
