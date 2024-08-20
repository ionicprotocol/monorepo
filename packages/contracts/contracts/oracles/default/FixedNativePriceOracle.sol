// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";

import "../BasePriceOracle.sol";

/**
 * @title FixedEthPriceOracle
 * @notice Returns fixed prices of 1 denominated in the chain's native token for all tokens (expected to be used under a `MasterPriceOracle`).
 * @dev Implements `PriceOracle` and `BasePriceOracle`.
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 */
contract FixedNativePriceOracle is BasePriceOracle {
  /**
   * @dev Returns the price in native token of `underlying` (implements `BasePriceOracle`).
   */
  function price(address underlying) external view override returns (uint256) {
    return 1e18;
  }

  /**
   * @notice Returns the price in native token of the token underlying `cToken`.
   * @dev Implements the `PriceOracle` interface for Ionic pools (and Compound v2).
   * @return Price in native token of the token underlying `cToken`, scaled by `10 ** (36 - underlyingDecimals)`.
   */
  function getUnderlyingPrice(ICErc20 cToken) external view override returns (uint256) {
    return 1e18;
  }
}
