// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";

import "../../external/sushi/SushiBar.sol";

import "../BasePriceOracle.sol";

/**
 * @title SushiBarPriceOracle
 * @notice Returns prices for SushiBar (xSUSHI).
 * @dev Implements `PriceOracle` and `BasePriceOracle`.
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 */
contract SushiBarPriceOracle is BasePriceOracle {
  /**
   * @notice Fetches the token/ETH price, with 18 decimals of precision.
   * @param underlying The underlying token address for which to get the price.
   * @return Price denominated in ETH (scaled by 1e18)
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
    address underlying = cToken.underlying();
    // Comptroller needs prices to be scaled by 1e(36 - decimals)
    // Since `_price` returns prices scaled by 18 decimals, we must scale them by 1e(36 - 18 - decimals)
    return (_price(underlying) * 1e18) / (10**uint256(ERC20Upgradeable(underlying).decimals()));
  }

  /**
   * @notice Fetches the token/ETH price, with 18 decimals of precision.
   */
  function _price(address token) internal view returns (uint256) {
    SushiBar sushiBar = SushiBar(token);
    IERC20Upgradeable sushi = sushiBar.sushi();
    uint256 sushiEthPrice = BasePriceOracle(msg.sender).price(address(sushi));
    return (sushi.balanceOf(token) * sushiEthPrice) / sushiBar.totalSupply();
  }
}
