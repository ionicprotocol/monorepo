// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "../../external/compound/IPriceOracle.sol";
import "../../external/compound/ICToken.sol";
import "../../external/compound/ICErc20.sol";

import "../BasePriceOracle.sol";
import "../MasterPriceOracle.sol";
import "../default/ChainlinkPriceOracleV2.sol";

/**
 * @title PreferredPriceOracle
 * @notice Returns prices from MasterPriceOracle, ChainlinkPriceOracleV2, or prices from a tertiary oracle (in order of preference).
 * @dev Implements `PriceOracle` and `BasePriceOracle`.
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 */
contract PreferredPriceOracle is IPriceOracle, BasePriceOracle {
  /**
   * @dev The primary `MasterPriceOracle`.
   */
  MasterPriceOracle public masterOracle;

  /**
   * @dev The secondary `ChainlinkPriceOracleV2`.
   */
  ChainlinkPriceOracleV2 public chainlinkOracleV2;

  /**
   * @dev The tertiary `PriceOracle`.
   */
  IPriceOracle public tertiaryOracle;

  /**
   * @dev The Wrapped native asset address.
   */
  address public wtoken;

  /**
   * @dev Constructor to set the primary `MasterPriceOracle`, the secondary `ChainlinkPriceOracleV2`, and the tertiary `PriceOracle`.
   */
  constructor(
    MasterPriceOracle _masterOracle,
    ChainlinkPriceOracleV2 _chainlinkOracleV2,
    IPriceOracle _tertiaryOracle,
    address _wtoken
  ) {
    require(address(_masterOracle) != address(0), "MasterPriceOracle not set.");
    require(address(_chainlinkOracleV2) != address(0), "ChainlinkPriceOracleV2 not set.");
    require(address(_tertiaryOracle) != address(0), "Tertiary price oracle not set.");
    masterOracle = _masterOracle;
    chainlinkOracleV2 = _chainlinkOracleV2;
    tertiaryOracle = _tertiaryOracle;
    wtoken = _wtoken;
  }

  /**
   * @notice Fetches the token/ETH price, with 18 decimals of precision.
   * @param underlying The underlying token address for which to get the price.
   * @return Price denominated in ETH (scaled by 1e18)
   */
  function price(address underlying) external view override returns (uint256) {
    // Return 1e18 for wtoken
    if (underlying == wtoken) return 1e18;

    // Try to get MasterPriceOracle price
    if (address(masterOracle.oracles(underlying)) != address(0)) return masterOracle.price(underlying);

    // Try to get ChainlinkPriceOracleV2 price
    if (address(chainlinkOracleV2.priceFeeds(underlying)) != address(0)) return chainlinkOracleV2.price(underlying);

    // Otherwise, get price from tertiary oracle
    return BasePriceOracle(address(tertiaryOracle)).price(underlying);
  }

  /**
   * @notice Returns the price in ETH of the token underlying `cToken`.
   * @dev Implements the `PriceOracle` interface for Fuse pools (and Compound v2).
   * @return Price in ETH of the token underlying `cToken`, scaled by `10 ** (36 - underlyingDecimals)`.
   */
  function getUnderlyingPrice(ICToken cToken) external view override returns (uint256) {
    // Return 1e18 for ETH
    if (cToken.isCEther()) return 1e18;

    // Get underlying ERC20 token address
    address underlying = address(ICErc20(address(cToken)).underlying());

    // Return 1e18 for wtoken
    if (underlying == wtoken) return 1e18;

    // Try to get MasterPriceOracle price
    if (address(masterOracle.oracles(underlying)) != address(0)) return masterOracle.getUnderlyingPrice(cToken);

    // Try to get ChainlinkPriceOracleV2 price
    if (address(chainlinkOracleV2.priceFeeds(underlying)) != address(0))
      return chainlinkOracleV2.getUnderlyingPrice(cToken);

    // Otherwise, get price from tertiary oracle
    return tertiaryOracle.getUnderlyingPrice(cToken);
  }
}
