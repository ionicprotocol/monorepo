// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { ICErc20 } from "./CTokenInterfaces.sol";

abstract contract PriceOracle {
  /// @notice Indicator that this is a PriceOracle contract (for inspection)
  bool public constant isPriceOracle = true;

  /**
   * @notice Get the underlying price of a cToken asset
   * @param cToken The cToken to get the underlying price of
   * @return The underlying asset price mantissa (scaled by 1e18).
   *  Zero means the price is unavailable.
   */
  function getUnderlyingPrice(ICErc20 cToken) external view virtual returns (uint256);
}
