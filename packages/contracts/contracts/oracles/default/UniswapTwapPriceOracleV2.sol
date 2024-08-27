// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/proxy/utils/Initializable.sol";
import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";

import "../BasePriceOracle.sol";
import "./UniswapTwapPriceOracleV2Root.sol";

/**
 * @title UniswapTwapPriceOracleV2
 * @notice Stores cumulative prices and returns TWAPs for assets on Uniswap V2 pairs.
 * @dev Implements `PriceOracle` and `BasePriceOracle`.
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 */
contract UniswapTwapPriceOracleV2 is Initializable, BasePriceOracle {
  /**
   * @dev wtoken token contract address.
   */
  address public wtoken;

  /**
   * @dev UniswapTwapPriceOracleV2Root contract address.
   */
  UniswapTwapPriceOracleV2Root public rootOracle;

  /**
   * @dev UniswapV2Factory contract address.
   */
  address public uniswapV2Factory;

  /**
   * @dev The token on which to base TWAPs (its price must be available via `msg.sender`).
   */
  address public baseToken;

  /**
   * @dev Initalize that sets the UniswapTwapPriceOracleV2Root, UniswapV2Factory, and base token.
   * @param _rootOracle Sets `UniswapTwapPriceOracleV2Root`
   * @param _uniswapV2Factory Sets `UniswapV2Factory`
   * @param _baseToken The token on which to base TWAPs (its price must be available via `msg.sender`).
   * @param _wtoken The Wrapped native asset address
   */
  function initialize(
    address _rootOracle,
    address _uniswapV2Factory,
    address _baseToken,
    address _wtoken
  ) external initializer {
    require(_rootOracle != address(0), "UniswapTwapPriceOracleV2Root not defined.");
    require(_uniswapV2Factory != address(0), "UniswapV2Factory not defined.");
    rootOracle = UniswapTwapPriceOracleV2Root(_rootOracle);
    uniswapV2Factory = _uniswapV2Factory;
    wtoken = _wtoken;
    baseToken = _baseToken == address(0) ? address(wtoken) : _baseToken;
  }

  /**
   * @notice Returns the price in ETH of the token underlying `cToken`.
   * @dev Implements the `PriceOracle` interface for Ionic pools (and Compound v2).
   * @return Price in ETH of the token underlying `cToken`, scaled by `10 ** (36 - underlyingDecimals)`.
   */
  function getUnderlyingPrice(ICErc20 cToken) external view override returns (uint256) {
    // Get underlying ERC20 token address
    address underlying = cToken.underlying();

    // Get price, format, and return
    uint256 baseUnit = 10**uint256(ERC20Upgradeable(underlying).decimals());
    return (_price(underlying) * 1e18) / baseUnit;
  }

  /**
   * @dev Internal function returning the price in ETH of `underlying`.
   */
  function _price(address underlying) internal view returns (uint256) {
    // Return 1e18 for wtoken
    if (underlying == wtoken) return 1e18;

    // Return root oracle ERC20/ETH TWAP
    uint256 twap = rootOracle.price(underlying, baseToken, uniswapV2Factory);
    return
      baseToken == address(wtoken)
        ? twap
        : (twap * BasePriceOracle(msg.sender).price(baseToken)) / (10**uint256(ERC20Upgradeable(baseToken).decimals()));
  }

  /**
   * @dev Returns the price in ETH of `underlying` (implements `BasePriceOracle`).
   */
  function price(address underlying) external view override returns (uint256) {
    return _price(underlying);
  }
}
