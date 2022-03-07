// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "../../external/compound/IPriceOracle.sol";
import "../../external/compound/ICToken.sol";
import "../../external/compound/ICErc20.sol";

import "../../external/curve/ICurveRegistry.sol";
import "../../external/curve/ICurvePool.sol";

import "../BasePriceOracle.sol";

/**
 * @title CurveLpTokenPriceOracle
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 * @notice CurveLpTokenPriceOracle is a price oracle for Curve LP tokens (using the sender as a root oracle).
 * @dev Implements the `PriceOracle` interface used by Fuse pools (and Compound v2).
 */
contract CurveLpTokenPriceOracleNoRegistry is IPriceOracle, BasePriceOracle, OwnableUpgradeable {
  /**
   * @dev Maps Curve LP token addresses to underlying token addresses.
   */
  mapping(address => address[]) public underlyingTokens;

  /**
   * @dev Maps Curve LP token addresses to pool addresses.
   */
  mapping(address => address) public poolOf;

  /**
   * @dev Initializes an array of LP tokens and pools if desired.
   * @param _lpTokens Array of LP token addresses.
   * @param _pools Array of pool addresses.
   */
  function initialize(
    address[] memory _lpTokens,
    address[] memory _pools,
    address[][] memory _poolUnderlyings
  ) public initializer {
    __Ownable_init();
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
   * @dev Implements the `PriceOracle` interface for Fuse pools (and Compound v2).
   * @return Price in ETH of the token underlying `cToken`, scaled by `10 ** (36 - underlyingDecimals)`.
   */
  function getUnderlyingPrice(ICToken cToken) external view override returns (uint256) {
    address underlying = ICErc20(address(cToken)).underlying();
    // Comptroller needs prices to be scaled by 1e(36 - decimals)
    // Since `_price` returns prices scaled by 18 decimals, we must scale them by 1e(36 - 18 - decimals)
    return (_price(underlying) * 1e18) / (10**uint256(ERC20Upgradeable(underlying).decimals()));
  }

  /**
   * @dev Fetches the fair LP token/ETH price from Curve, with 18 decimals of precision.
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
    return (minPx * ICurvePool(pool).get_virtual_price()) / 1e18; // Use min underlying token prices
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
    address pool = poolOf[_lpToken];
    require(pool == address(0), "This LP token is already registered.");
    poolOf[_lpToken] = _pool;
    underlyingTokens[_lpToken] = _underlyings;
  }
}
