// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "../../external/compound/IPriceOracle.sol";
import "../../external/compound/ICErc20.sol";

import "../../external/yearn/IVault.sol";

import "../BasePriceOracle.sol";

/**
 * @title YVaultV1PriceOracle
 * @notice Returns prices for V1 yVaults (using the sender as a root oracle).
 * @dev Implements the `PriceOracle` interface.
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 */
contract YVaultV1PriceOracle is IPriceOracle {
  /**
   * @notice Returns the price in ETH of the token underlying `cToken`.
   * @dev Implements the `PriceOracle` interface for Fuse pools (and Compound v2).
   * @return Price in ETH of the token underlying `cToken`, scaled by `10 ** (36 - underlyingDecimals)`.
   */
  function getUnderlyingPrice(ICToken cToken) external view override returns (uint256) {
    // Get price of token underlying yVault
    IVault yVault = IVault(ICErc20(address(cToken)).underlying());
    address underlyingToken = yVault.token();
    uint256 underlyingPrice = underlyingToken == 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
      ? 1e18
      : BasePriceOracle(msg.sender).price(underlyingToken);

    // yVault/ETH = yVault/token * token/ETH
    // Return value = yVault/ETH scaled by 1e(36 - yVault decimals)
    // `getPricePerFullShare` = yVault/token scaled by 1e18
    // `underlyingPrice` = token/ETH scaled by 1e18
    // Return value = `pricePerShare` * `underlyingPrice` / 1e(yVault decimals)
    uint256 baseUnit = 10**uint256(yVault.decimals());
    return (yVault.getPricePerFullShare() * underlyingPrice) / baseUnit; // getPricePerFullShare is scaled by 1e18
  }
}
