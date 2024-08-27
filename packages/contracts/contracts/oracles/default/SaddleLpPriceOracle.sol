// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { EIP20Interface } from "../../compound/EIP20Interface.sol";

import "../../external/saddle/ISwap.sol";
import "../../ionic/SafeOwnableUpgradeable.sol";

import "../BasePriceOracle.sol";

/**
 * @title SaddleLpTokenPriceOracle
 * @author Carlo Mazzaferro <carlo@midascapital.xyz> (https://github.com/carlomazzaferro)
 * @notice SaddleLpPriceOracle is a price oracle for Saddle LP tokens (using the sender as a root oracle).
 * @dev Implements the `PriceOracle` interface used by Midas pools (and Compound v2).
 */
contract SaddleLpPriceOracle is SafeOwnableUpgradeable, BasePriceOracle {
  /**
   * @dev Maps Saddle LP token addresses to underlying token addresses.
   */
  mapping(address => address[]) public underlyingTokens;

  /**
   * @dev Maps Saddle LP token addresses to pool addresses.
   */
  mapping(address => address) public poolOf;

  /**
   * @dev Initializes an array of LP tokens and pools if desired.
   * @param _lpTokens Array of LP token addresses.
   * @param _pools Array of pool addresses.
   * @param _poolUnderlyings The underlying token addresses of a pool
   */
  function initialize(
    address[] memory _lpTokens,
    address[] memory _pools,
    address[][] memory _poolUnderlyings
  ) public initializer {
    require(
      _lpTokens.length == _pools.length && _lpTokens.length == _poolUnderlyings.length,
      "No LP tokens supplied or array lengths not equal."
    );

    __SafeOwnable_init(msg.sender);
    for (uint256 i = 0; i < _lpTokens.length; i++) {
      poolOf[_lpTokens[i]] = _pools[i];
      underlyingTokens[_lpTokens[i]] = _poolUnderlyings[i];
    }
  }

  /**
   * @notice Get the LP token price price for an underlying token address.
   * @param underlying The underlying token address for which to get the price (set to zero address for ETH).
   * @return Price denominated in ETH (scaled by 1e18).
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
    return (_price(underlying) * 1e18) / (10**uint256(EIP20Interface(underlying).decimals()));
  }

  /**
   * @dev Fetches the fair LP token/ETH price from Saddle, with 18 decimals of precision.
   * Source: https://github.com/AlphaFinanceLab/homora-v2/blob/master/contracts/oracle/CurveOracle.sol
   * @param lpToken The LP token contract address for price retrieval.
   */
  function _price(address lpToken) internal view returns (uint256) {
    address pool = poolOf[lpToken];
    require(pool != address(0), "LP token is not registered.");
    address[] memory tokens = underlyingTokens[lpToken];
    uint256 minPx = type(uint256).max;
    uint256 n = tokens.length;

    for (uint256 i = 0; i < n; i++) {
      address ulToken = tokens[i];
      uint256 tokenPx = BasePriceOracle(msg.sender).price(ulToken);
      if (tokenPx < minPx) minPx = tokenPx;
    }

    require(minPx != type(uint256).max, "No minimum underlying token price found.");
    return (minPx * ISwap(pool).getVirtualPrice()) / 1e18; // Use min underlying token prices
  }

  /**
   * @dev Register the pool given LP token address and set the pool info.
   * @param _lpToken LP token to find the corresponding pool.
   * @param _pool Pool address.
   * @param _underlyings Underlying addresses.
   */
  function registerPool(
    address _lpToken,
    address _pool,
    address[] memory _underlyings
  ) external onlyOwner {
    // require(pool == address(0), "This LP token is already registered.");
    poolOf[_lpToken] = _pool;
    underlyingTokens[_lpToken] = _underlyings;
  }

  /**
   * @dev getter for the underlying tokens
   * @param lpToken the LP token address.
   * @return _underlyings Underlying addresses.
   */
  function getUnderlyingTokens(address lpToken) public view returns (address[] memory) {
    return underlyingTokens[lpToken];
  }
}
