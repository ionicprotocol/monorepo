// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "../../external/compound/IPriceOracle.sol";
import "../../external/compound/ICToken.sol";
import "../../external/compound/ICErc20.sol";

import "../../external/alpha/Bank.sol";

/**
 * @title AlphaHomoraV1PriceOracle
 * @notice Returns prices the Alpha Homora V1 ibETH ERC20 token.
 * @dev Implements the `PriceOracle` interface.
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 */
contract AlphaHomoraV1PriceOracle is IPriceOracle {
  /**
   * @dev Alpha Homora ibETH token contract object.
   */
  Bank public constant IBETH = Bank(0x67B66C99D3Eb37Fa76Aa3Ed1ff33E8e39F0b9c7A);

  /**
   * @notice Returns the price in ETH of the token underlying `cToken`.
   * @dev Implements the `PriceOracle` interface for Fuse pools (and Compound v2).
   * @return Price in ETH of the token underlying `cToken`, scaled by `10 ** (36 - underlyingDecimals)`.
   */
  function getUnderlyingPrice(ICToken cToken) external view override returns (uint256) {
    require(ICErc20(address(cToken)).underlying() == address(IBETH));
    return (IBETH.totalETH() * 1e18) / IBETH.totalSupply();
  }
}
