// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { ERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";

import { MasterPriceOracle } from "../MasterPriceOracle.sol";
import { BasePriceOracle, ICErc20 } from "../BasePriceOracle.sol";
import { IPyth } from "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import { PythStructs } from "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
import { SafeOwnableUpgradeable } from "../../ionic/SafeOwnableUpgradeable.sol";

/**
 * @title PythPriceOracle
 * @notice Returns prices from Pyth.
 * @dev Implements `PriceOracle`.
 * @author Rahul Sethuram <rahul@midascapital.xyz> (https://github.com/rhlsthrm)
 */
contract PythPriceOracleDmBTC is BasePriceOracle, SafeOwnableUpgradeable {
  /**
   * @notice Maps ERC20 token addresses to Pyth price IDs.
   */
  mapping(address => bytes32) public priceFeedIds;

  /**
   * @notice DIA NATIVE/USD price feed contracts.
   */
  bytes32 public NATIVE_TOKEN_USD_FEED;

  /**
   * @notice MasterPriceOracle for backup for USD price.
   */
  address public USD_TOKEN; // token to use as USD price (i.e. USDC)

  /**
   * @dev Constructor to set admin and canAdminOverwrite, wtoken address and native token USD price feed address
   */

  IPyth public PYTH;

  address public DMBTC;

  function initialize(
    address pythAddress,
    bytes32 nativeTokenUsdFeed,
    address usdToken,
    address dmBTC
  ) public initializer {
    __SafeOwnable_init(msg.sender);
    NATIVE_TOKEN_USD_FEED = nativeTokenUsdFeed;
    USD_TOKEN = usdToken;
    PYTH = IPyth(pythAddress);
    DMBTC = dmBTC;
  }

  function reinitialize(
    address pythAddress,
    bytes32 nativeTokenUsdFeed,
    address usdToken,
    address dmBTC
  ) public onlyOwnerOrAdmin {
    NATIVE_TOKEN_USD_FEED = nativeTokenUsdFeed;
    USD_TOKEN = usdToken;
    PYTH = IPyth(pythAddress);
    DMBTC = dmBTC;
  }

  /**
   * @dev Admin-only function to set price feeds.
   * @param underlyings Underlying token addresses for which to set price feeds.
   * @param feedIds The Pyth Network feed IDs`.
   */
  function setPriceFeeds(address[] memory underlyings, bytes32[] memory feedIds) external onlyOwner {
    // Input validation
    require(
      underlyings.length > 0 && underlyings.length == feedIds.length,
      "Lengths of both arrays must be equal and greater than 0."
    );

    // For each token/feed
    for (uint256 i = 0; i < underlyings.length; i++) {
      address underlying = underlyings[i];
      // Set feed and base currency
      priceFeedIds[underlying] = feedIds[i];
    }
  }

  /**
   * @dev Internal function returning the price in ETH of `underlying`.
   * Assumes price feeds are 8 decimals (TODO: doublecheck)
   */
  function _price(address underlying) internal view returns (uint256) {
    // Get token/native price from Oracle
    bytes32 feed = priceFeedIds[underlying];
    require(feed != "", "No oracle price feed found for this underlying ERC20 token.");
    uint256 normalizedPrice;
    if (NATIVE_TOKEN_USD_FEED == "") {
      // Get price from MasterPriceOracle
      uint256 usdNativeTokenPrice = BasePriceOracle(msg.sender).price(USD_TOKEN);
      uint256 nativeTokenUsdPrice = 1e36 / usdNativeTokenPrice; // 18 decimals -- TODO: doublecheck
      PythStructs.Price memory tokenUsdPrice = PYTH.getPriceUnsafe(feed); // 8 decimals ---  TODO: doublecheck
      normalizedPrice = tokenUsdPrice.price >= 0 ? (uint256(uint64(tokenUsdPrice.price)) * 1e28) / uint256(nativeTokenUsdPrice) : 0;
    } else {
      uint128 nativeTokenUsdPrice = uint128(uint64(PYTH.getPriceUnsafe(NATIVE_TOKEN_USD_FEED).price));
      if (nativeTokenUsdPrice <= 0) return 0;
      uint128 tokenUsdPrice = uint128(uint64(PYTH.getPriceUnsafe(feed).price));
      normalizedPrice = tokenUsdPrice >= 0 ? (uint256(tokenUsdPrice) * 1e18) / uint256(nativeTokenUsdPrice) : 0;
    }
    if (underlying == DMBTC) {
      return normalizedPrice / 100000;
    }
    return normalizedPrice;
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
