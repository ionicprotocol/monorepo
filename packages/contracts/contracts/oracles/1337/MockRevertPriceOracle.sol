// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "../BasePriceOracle.sol";

/**
 * @title MockRevertPriceOracle
 * @notice Mocks a failing price oracle. Used for testing purposes only
 * @author Jourdan Dunkley <dunkley.jourdan@gmail.com> (https://github.com/jourdanDunkley)
 */
contract MockRevertPriceOracle is BasePriceOracle {
  constructor() {}

  /**
   * @dev Returns the price in ETH of `underlying` (implements `BasePriceOracle`).
   */
  function price(address underlying) external view override returns (uint256) {
    revert("MockPriceOracle: price function is failing.");
  }

  /**
   * @notice Returns the price in ETH of the token underlying `cToken`.
   * @dev Implements the `PriceOracle` interface for Ionic pools (and Compound v2).
   * @return Price in ETH of the token underlying `cToken`, scaled by `10 ** (36 - underlyingDecimals)`.
   */
  function getUnderlyingPrice(ICErc20 cToken) external view override returns (uint256) {
    revert("MockPriceOracle: getUnderlyingPrice function is failing.");
  }
}
