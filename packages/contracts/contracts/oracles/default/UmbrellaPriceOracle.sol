// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { ERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";

import { IUmbrellaFeeds } from "../../external/umbrella/IUmbrellaFeeds.sol";
import { IRegistry } from "../../external/umbrella/IRegistry.sol";
import { MasterPriceOracle } from "../MasterPriceOracle.sol";
import { BasePriceOracle, ICErc20 } from "../BasePriceOracle.sol";
import { SafeOwnableUpgradeable } from "../../ionic/SafeOwnableUpgradeable.sol";

/**
 * @title UmbrellaPriceOracle
 * @notice Returns prices from Umbrella Network.
 * @dev Implements `PriceOracle`.
 * @author Carlo Mazzaferro <carlo@midascapital.xyz> (https://github.com/carlomazzaferro)
 */
contract UmbrellaPriceOracle is SafeOwnableUpgradeable, BasePriceOracle {
  /**
   * @notice Maps ERC20 token addresses to ETH-based Flux price feed contracts.
   */
  mapping(address => string) public priceFeeds;

  /**
   * @notice Umbrella's NATIVE/USD price feed contracts.
   */
  string public NATIVE_TOKEN_USD_KEY;

  /**
   * @notice IUmbrellaFeeds address
   */

  IUmbrellaFeeds public UMBRELLA_FEEDS_ADDRESS;

  /**
   * @dev Constructor to set admin and canAdminOverwrite, wtoken address and native token USD price feed address
   */
  function initialize(string memory nativeTokenUsd, IRegistry registry) public initializer {
    __SafeOwnable_init(msg.sender);
    NATIVE_TOKEN_USD_KEY = nativeTokenUsd;
    address umbrellaFeeds = registry.getAddressByString("UmbrellaFeeds");
    require(umbrellaFeeds != address(0), "UmbrellaFeeds address not found");
    UMBRELLA_FEEDS_ADDRESS = IUmbrellaFeeds(umbrellaFeeds);
  }

  function reinitialize(string memory nativeTokenUsd, IRegistry registry) public onlyOwnerOrAdmin {
    NATIVE_TOKEN_USD_KEY = nativeTokenUsd;
    address umbrellaFeeds = registry.getAddressByString("UmbrellaFeeds");
    require(umbrellaFeeds != address(0), "UmbrellaFeeds address not found");
    UMBRELLA_FEEDS_ADDRESS = IUmbrellaFeeds(umbrellaFeeds);
  }

  /**
   * @dev Admin-only function to set price feeds.
   * @param underlyings Underlying token addresses for which to set price feeds.
   * @param feeds The Oracle price feed contract addresses for each of `underlyings`.
   */
  function setPriceFeeds(address[] memory underlyings, string[] memory feeds) external onlyOwner {
    // Input validation
    require(
      underlyings.length > 0 && underlyings.length == feeds.length,
      "Lengths of both arrays must be equal and greater than 0."
    );

    // For each token/feed
    for (uint256 i = 0; i < underlyings.length; i++) {
      address underlying = underlyings[i];
      // Set feed and base currency
      priceFeeds[underlying] = feeds[i];
    }
  }

  /**
   * @dev Internal function returning the price in ETH of `underlying`.
   * Assumes price feeds are 8 decimals!
   * https://docs.fluxprotocol.org/docs/live-data-feeds/fpo-live-networks-and-pairs#mainnet-2
   */
  function _price(address underlying) internal view returns (uint256) {
    // Get token/ETH price from feed
    string memory feed = priceFeeds[underlying];
    require(bytes(feed).length != 0, "No Umbrella price feed found for this underlying ERC20 token.");

    // Get the NATIVE/USD price feed from Native Price Feed
    // 8 decimals are used
    IUmbrellaFeeds.PriceData memory nativeTokenUsdPriceData = UMBRELLA_FEEDS_ADDRESS.getPriceDataByName(
      NATIVE_TOKEN_USD_KEY
    );
    uint256 nativeTokenUsdPrice = uint256(nativeTokenUsdPriceData.price);

    if (nativeTokenUsdPriceData.price == 0) return 0;
    // 8 decimals are used
    IUmbrellaFeeds.PriceData memory priceData = UMBRELLA_FEEDS_ADDRESS.getPriceDataByName(feed);
    // Umbrella price feed is 8 decimals:
    return (uint256(priceData.price) * 1e18) / uint256(nativeTokenUsdPrice);
  }

  /**
   * @dev Returns the price in ETH of `underlying` (implements `BasePriceOracle`).
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

    // Get price
    uint256 oraclePrice = _price(underlying);

    // Format and return price
    uint256 underlyingDecimals = uint256(ERC20Upgradeable(underlying).decimals());
    return
      underlyingDecimals <= 18
        ? uint256(oraclePrice) * (10**(18 - underlyingDecimals))
        : uint256(oraclePrice) / (10**(underlyingDecimals - 18));
  }
}
