// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;

interface GUniPool {
  function token0() external view returns (address);

  function token1() external view returns (address);

  /// @notice compute total underlying holdings of the G-UNI token supply
  /// includes current liquidity invested in uniswap position, current fees earned
  /// and any uninvested leftover (but does not include manager or gelato fees accrued)
  /// @return amount0Current current total underlying balance of token0
  /// @return amount1Current current total underlying balance of token1
  function getUnderlyingBalancesAtPrice(uint160 sqrtRatioX96)
    external
    view
    returns (uint256 amount0Current, uint256 amount1Current);

  /// @notice burn G-UNI tokens (fractional shares of a Uniswap V3 position) and receive tokens
  /// @param burnAmount The number of G-UNI tokens to burn
  /// @param receiver The account to receive the underlying amounts of token0 and token1
  /// @return amount0 amount of token0 transferred to receiver for burning `burnAmount`
  /// @return amount1 amount of token1 transferred to receiver for burning `burnAmount`
  /// @return liquidityBurned amount of liquidity removed from the underlying Uniswap V3 position
  // solhint-disable-next-line function-max-lines
  function burn(uint256 burnAmount, address receiver)
    external
    returns (
      uint256 amount0,
      uint256 amount1,
      uint128 liquidityBurned
    );
}
