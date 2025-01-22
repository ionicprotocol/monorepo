// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";

import { IProxy } from "../../external/api3/IProxy.sol";

import "../BasePriceOracle.sol";
import { SafeOwnableUpgradeable } from "../../ionic/SafeOwnableUpgradeable.sol";

/**
 * @title API3PriceOracle
 * @notice Returns prices from Api3.
 * @dev Implements `PriceOracle`.
 * @author Carlo Mazzaferro <carlo@ionic.money> (https://github.com/carlomazzaferro)
 */
contract API3PriceOracle is SafeOwnableUpgradeable, BasePriceOracle {
  /**
   * @notice Maps ERC20 token addresses to ETH-based Chainlink price feed contracts.
   */
  mapping(address => IProxy) public proxies;

  /**
   * @notice Chainlink NATIVE/USD price feed contracts.
   */
  address public NATIVE_TOKEN_USD_PRICE_FEED;

  /**
   * @notice The USD Token of the chain
   */
  address public USD_TOKEN;

  /**
   * @dev Constructor to set wtoken address and native token USD price feed address
   * @param _usdToken The Wrapped native asset address
   * @param nativeTokenUsd Will this oracle return prices denominated in USD or in the native token.
   */
  function initialize(address _usdToken, address nativeTokenUsd) public initializer {
    __SafeOwnable_init(msg.sender);
    USD_TOKEN = _usdToken;
    NATIVE_TOKEN_USD_PRICE_FEED = nativeTokenUsd;
  }

  /**
   * @dev Constructor to set wtoken address and native token USD price feed address
   * @param _usdToken The Wrapped native asset address
   * @param nativeTokenUsd Will this oracle return prices denominated in USD or in the native token.
   */
  function reinitialize(address _usdToken, address nativeTokenUsd) public onlyOwnerOrAdmin {
    USD_TOKEN = _usdToken;
    NATIVE_TOKEN_USD_PRICE_FEED = nativeTokenUsd;
  }

  /**
   * @dev Admin-only function to set price feeds.
   * @param underlyings Underlying token addresses for which to set price feeds.
   * @param feeds The Chainlink price feed contract addresses for each of `underlyings`.
   */
  function setPriceFeeds(address[] memory underlyings, address[] memory feeds) external onlyOwner {
    // Input validation
    require(
      underlyings.length > 0 && underlyings.length == feeds.length,
      "Lengths of both arrays must be equal and greater than 0."
    );

    // For each token/feed
    for (uint256 i = 0; i < underlyings.length; i++) {
      address underlying = underlyings[i];
      // Set feed and base currency
      proxies[underlying] = IProxy(feeds[i]);
    }
  }

  /**
   * @notice Internal function returning the price in of `underlying`.
   * @dev If the oracle got constructed with `nativeTokenUsd` = TRUE this will return a price denominated in USD otherwise in the native token
   */
  function _price(address underlying) internal view returns (uint256) {
    IProxy proxy = proxies[underlying];
    require(address(proxy) != address(0), "No API3 price feed found for this underlying ERC20 token.");

    uint256 nativeTokenUsdPrice;

    if (NATIVE_TOKEN_USD_PRICE_FEED == address(0)) {
      // get the USDX/USD price from the MPO
      uint256 usdNativeTokenPrice = BasePriceOracle(msg.sender).price(USD_TOKEN);
      nativeTokenUsdPrice = 1e36 / usdNativeTokenPrice; // 18 decimals
    } else {
      (int224 nativeTokenUsdPrice224, ) = IProxy(NATIVE_TOKEN_USD_PRICE_FEED).read();
      if (nativeTokenUsdPrice224 <= 0) {
        revert("API3PriceOracle: native token price <= 0");
      }
      nativeTokenUsdPrice = uint256(uint224(nativeTokenUsdPrice224));
    }
    (int224 tokenUsdPrice, ) = proxy.read();

    if (tokenUsdPrice <= 0) {
      revert("API3PriceOracle: token price <= 0");
    }

    return (uint256(uint224(tokenUsdPrice)) * 1e18) / nativeTokenUsdPrice;
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
