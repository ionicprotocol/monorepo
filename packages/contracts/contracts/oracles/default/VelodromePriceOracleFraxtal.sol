// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "../BasePriceOracle.sol";

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface Prices_Fraxtal {
  function getRate(address srcToken, address dstToken, bool useSrcWrappers) external view returns (uint256 weightedRate);
}

contract VelodromePriceOracleFraxtal is BasePriceOracle {
  Prices_Fraxtal immutable prices;

  constructor(address _prices) {
    prices = Prices_Fraxtal(_prices);
  }
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
    return (_price(underlying));
  }

  /**
   * @notice Fetches the token/ETH price, with 18 decimals of precision.
   */
  function _price(address token) internal view returns (uint256) {
    return prices.getRate(token, 0xFC00000000000000000000000000000000000006, false);
  }
}
