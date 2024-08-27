// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { EIP20Interface } from "../../compound/EIP20Interface.sol";

import "../../external/curve/ICurveV2Pool.sol";

import "../../ionic/SafeOwnableUpgradeable.sol";
import "../BasePriceOracle.sol";

/**
 * @title CurveLpTokenPriceOracle
 * @author Carlo Mazzaferro <carlo@midascapital.xyz> (https://github.com/carlomazzaferro)
 * @notice CurveLpTokenPriceOracleNoRegistry is a price oracle for Curve V2 LP tokens (using the sender as a root oracle).
 * @dev Implements the `PriceOracle` interface used by Midas pools (and Compound v2).
 */
contract CurveV2PriceOracle is SafeOwnableUpgradeable, BasePriceOracle {
  /**
   * @dev Maps Curve LP token addresses to pool addresses.
   */
  mapping(address => address) public poolFor;

  address[] public tokens;

  /**
   * @dev Initializes an array of tokens and pools if desired.
   * @param _tokens Array of token addresses.
   * @param _pools Array of pool addresses.
   */
  function initialize(address[] memory _tokens, address[] memory _pools) public initializer {
    require(_tokens.length == _pools.length, "No LP tokens supplied or array lengths not equal.");
    __SafeOwnable_init(msg.sender);

    for (uint256 i = 0; i < _pools.length; i++) {
      try ICurvePool(_pools[i]).coins(2) returns (address) {
        revert("!only two token pools");
      } catch {
        // ignore error
      }

      poolFor[_tokens[i]] = _pools[i];
    }
  }

  function getAllSupportedTokens() public view returns (address[] memory) {
    return tokens;
  }

  function getPoolForSwap(address inputToken, address outputToken)
    public
    view
    returns (
      ICurvePool,
      int128,
      int128
    )
  {
    for (uint256 i = 0; i < tokens.length; i++) {
      ICurvePool pool = ICurvePool(poolFor[tokens[i]]);
      int128 inputIndex = -1;
      int128 outputIndex = -1;
      int128 j = 0;
      while (true) {
        try pool.coins(uint256(uint128(j))) returns (address coin) {
          if (coin == inputToken) inputIndex = j;
          else if (coin == outputToken) outputIndex = j;
          j++;
        } catch {
          break;
        }

        if (outputIndex > -1 && inputIndex > -1) {
          return (pool, inputIndex, outputIndex);
        }
      }
    }

    return (ICurvePool(address(0)), int128(0), int128(0));
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
   * @dev Fetches the fair LP token price from Curve, with 18 decimals of precision.
   * @param token The LP token contract address for price retrieval.
   */
  function _price(address token) internal view returns (uint256) {
    address pool = poolFor[token];
    require(address(pool) != address(0), "Token is not registered.");

    address baseToken;
    // Returns always coin(1) / coin(0)  [ e.g. USDC (1) / eUSDC (1) ]
    uint256 exchangeRate = ICurveV2Pool(pool).price_oracle();

    if (ICurvePool(pool).coins(0) == token) {
      baseToken = ICurvePool(pool).coins(1);
      // USDC / ETH
      uint256 baseTokenPrice = BasePriceOracle(msg.sender).price(baseToken);
      // USDC / ETH * eUSDC / USDC = eUSDC / ETH
      return (baseTokenPrice * 10**18) / exchangeRate;
    } else {
      // if coin(1) is eUSDC, exchangeRate is USDC / eUSDC
      baseToken = ICurvePool(pool).coins(0);
      // USDC / ETH
      uint256 baseTokenPrice = BasePriceOracle(msg.sender).price(baseToken);
      // (USDC / ETH) *  (1 / (USDC / eUSDC)) = eUSDC / ETH
      return (baseTokenPrice * exchangeRate) / 10**18;
    }
  }

  /**
   * @dev Register the pool given token address and set the pool info.
   * @param _token token to find the corresponding pool.
   * @param _pool Pool address.
   */
  function registerPool(address _token, address _pool) external onlyOwner {
    try ICurvePool(_pool).coins(2) returns (address) {
      revert("!only two token pools");
    } catch {
      // ignore error
    }

    address pool = poolFor[_token];
    require(pool == address(0), "This LP token is already registered.");
    poolFor[_token] = _pool;

    bool skip = false;
    for (uint256 j = 0; j < tokens.length; j++) {
      if (tokens[j] == _token) {
        skip = true;
        break;
      }
    }
    if (!skip) tokens.push(_token);
  }
}
