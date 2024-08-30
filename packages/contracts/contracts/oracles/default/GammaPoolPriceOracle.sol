// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";

import "../../ionic/SafeOwnableUpgradeable.sol";
import "../BasePriceOracle.sol";
import { LiquidityAmounts } from "../../external/uniswap/LiquidityAmounts.sol";
import { TickMath } from "../../external/uniswap/TickMath.sol";
import { IUniswapV3Pool } from "../../external/uniswap/IUniswapV3Pool.sol";
import { IAlgebraPool } from "../../external/algebra/IAlgebraPool.sol";
import { IHypervisor } from "../../external/gamma/IHypervisor.sol";
import { BasePriceOracle } from "../BasePriceOracle.sol";

/**
 * @title GammaPoolBasePriceOracle
 * @author Carlo Mazzaferro <carlo.mazzaferro@gmail.com> (https://github.com/carlomazzaferro)
 * @notice GammaPoolBasePriceOracle is a base price oracle for Gamma wrapped LP tokens.
 * @dev Implements the `PriceOracle` interface used by Ionic pools (and Compound v2).
 */

abstract contract GammaPoolBasePriceOracle is BasePriceOracle, SafeOwnableUpgradeable {
  /**
   * @dev The Wrapped native asset address.
   */
  address public WTOKEN;

  /**
   * @dev Constructor to set admin and canAdminOverwrite, wtoken address and native token USD price feed address
   */

  function initialize(address _wtoken) public initializer {
    __SafeOwnable_init(msg.sender);
    WTOKEN = _wtoken;
  }

  /**
   * @dev Fetches the price for a token from Uniswap v3
   */
  function _price(address token) internal view virtual returns (uint256);

  /**
   * @notice Get the token price price for an underlying token address.
   * @param underlying The underlying token address for which to get the price (set to zero address for WTOKEN)
   * @return Price denominated in NATIVE (scaled by 1e18)
   */
  function price(address underlying) external view returns (uint256) {
    return _price(underlying);
  }

  /**
   * @notice Returns the price in NATIVE of the token underlying `cToken`.
   * @dev Implements the `BasePriceOracle` interface for Ionic pools (and Compound v2).
   * @return Price in NATIVE of the token underlying `cToken`, scaled by `10 ** (36 - underlyingDecimals)`.
   */
  function getUnderlyingPrice(ICErc20 cToken) public view override returns (uint256) {
    address underlying = cToken.underlying();
    // Comptroller needs prices to be scaled by 1e(36 - decimals)
    // Since `_price` returns prices scaled by 18 decimals, we must scale them by 1e(36 - 18 - decimals)
    return (_price(underlying) * 1e18) / (10**uint256(ERC20Upgradeable(underlying).decimals()));
  }

  /**
   * @dev Fast square root function.
   * Implementation from: https://github.com/Uniswap/uniswap-lib/commit/99f3f28770640ba1bb1ff460ac7c5292fb8291a0
   * Original implementation: https://github.com/abdk-consulting/abdk-libraries-solidity/blob/master/ABDKMath64x64.sol#L687
   */
  function sqrt(uint256 x) internal pure returns (uint256) {
    if (x == 0) return 0;
    uint256 xx = x;
    uint256 r = 1;

    if (xx >= 0x100000000000000000000000000000000) {
      xx >>= 128;
      r <<= 64;
    }
    if (xx >= 0x10000000000000000) {
      xx >>= 64;
      r <<= 32;
    }
    if (xx >= 0x100000000) {
      xx >>= 32;
      r <<= 16;
    }
    if (xx >= 0x10000) {
      xx >>= 16;
      r <<= 8;
    }
    if (xx >= 0x100) {
      xx >>= 8;
      r <<= 4;
    }
    if (xx >= 0x10) {
      xx >>= 4;
      r <<= 2;
    }
    if (xx >= 0x8) {
      r <<= 1;
    }

    r = (r + x / r) >> 1;
    r = (r + x / r) >> 1;
    r = (r + x / r) >> 1;
    r = (r + x / r) >> 1;
    r = (r + x / r) >> 1;
    r = (r + x / r) >> 1;
    r = (r + x / r) >> 1; // Seven iterations should be enough
    uint256 r1 = x / r;
    return (r < r1 ? r : r1);
  }

  /**
   * @dev Converts uint256 to uint160.
   */
  function toUint160(uint256 x) internal pure returns (uint160 z) {
    require((z = uint160(x)) == x, "Overflow when converting uint256 into uint160.");
  }

  function _amountsForLiquidityAtPrice(
    int24 tickLower,
    int24 tickUpper,
    uint128 liquidity,
    uint160 sqrtRatioX96
  ) internal pure returns (uint256, uint256) {
    return
      LiquidityAmounts.getAmountsForLiquidity(
        sqrtRatioX96,
        TickMath.getSqrtRatioAtTick(tickLower),
        TickMath.getSqrtRatioAtTick(tickUpper),
        liquidity
      );
  }

  function _getTotalAmountsAtPrice(
    uint160 sqrtRatioX96,
    int24 limitLower,
    int24 limitUpper,
    int24 baseLower,
    int24 baseUpper,
    address token,
    address pool
  ) internal view returns (uint256 total0, uint256 total1) {
    (uint256 base0, uint256 base1) = _getPositionAtPrice(baseLower, baseUpper, sqrtRatioX96, token, pool);
    (uint256 limit0, uint256 limit1) = _getPositionAtPrice(limitLower, limitUpper, sqrtRatioX96, token, pool);
    return (base0 + limit0, base1 + limit1);
  }

  function _position(
    address pool,
    address token,
    int24 lowerTick,
    int24 upperTick
  )
    internal
    view
    virtual
    returns (
      uint128 liquidity,
      uint128 tokensOwed0,
      uint128 tokensOwed1
    );

  function _getPositionAtPrice(
    int24 tickLower,
    int24 tickUpper,
    uint160 sqrtRatioX96,
    address token,
    address pool
  ) public view returns (uint256 amount0, uint256 amount1) {
    (uint128 positionLiquidity, uint128 tokensOwed0, uint128 tokensOwed1) = _position(
      pool,
      token,
      tickLower,
      tickUpper
    );
    (amount0, amount1) = _amountsForLiquidityAtPrice(tickLower, tickUpper, positionLiquidity, sqrtRatioX96);
    amount0 = amount0 + uint256(tokensOwed0);
    amount1 = amount1 + uint256(tokensOwed1);
  }
}

/**
 * @title GammaPoolAlgebraPriceOracle
 * @author Carlo Mazzaferro <carlo.mazzaferro@gmail.com> (https://github.com/carlomazzaferro)
 * @notice GammaPoolAlgebraPriceOracle is a price oracle for Gelato Gamma wrapped Algebra LP tokens.
 * @dev Implements the `PriceOracle` interface used by Ionic pools (and Compound v2).
 */

contract GammaPoolAlgebraPriceOracle is GammaPoolBasePriceOracle {
  /**
   * @dev Fetches the fair LP token/ETH price from Uniswap, with 18 decimals of precision.
   */
  function _price(address token) internal view override returns (uint256) {
    // Get Gamma pool and underlying tokens
    IHypervisor pool = IHypervisor(token);
    ERC20Upgradeable token0 = ERC20Upgradeable(pool.token0());
    ERC20Upgradeable token1 = ERC20Upgradeable(pool.token1());

    // Get underlying token prices
    uint256 p0 = BasePriceOracle(msg.sender).price(address(token0)); // * 10**uint256(18 - token0.decimals());
    uint256 p1 = BasePriceOracle(msg.sender).price(address(token1)); // * 10**uint256(18 - token1.decimals());

    uint160 sqrtPriceX96 = toUint160(
      sqrt((p0 * (10**token0.decimals()) * (1 << 96)) / (p1 * (10**token1.decimals()))) << 48
    );

    // Get balances of the tokens in the pool given fair underlying token prices
    (uint256 basePlusLimit0, uint256 basePlusLimit1) = _getTotalAmountsAtPrice(
      sqrtPriceX96,
      pool.limitLower(),
      pool.limitUpper(),
      pool.baseLower(),
      pool.baseUpper(),
      token,
      pool.pool()
    );

    uint256 r0 = token0.balanceOf(address(token)) + basePlusLimit0;
    uint256 r1 = token1.balanceOf(address(token)) + basePlusLimit1;

    r0 = r0 * 10**(18 - uint256(token0.decimals()));
    r1 = r1 * 10**(18 - uint256(token1.decimals()));

    require(r0 > 0 || r1 > 0, "Gamma underlying token balances not both greater than 0.");

    // Add the total value of each token together and divide by the totalSupply to get the unit price
    return (p0 * r0 + p1 * r1) / ERC20Upgradeable(token).totalSupply();
  }

  function _position(
    address pool,
    address token,
    int24 lowerTick,
    int24 upperTick
  )
    internal
    view
    override
    returns (
      uint128 liquidity,
      uint128 tokensOwed0,
      uint128 tokensOwed1
    )
  {
    bytes32 positionKey;
    assembly {
      positionKey := or(shl(24, or(shl(24, token), and(lowerTick, 0xFFFFFF))), and(upperTick, 0xFFFFFF))
    }
    (liquidity, , , , tokensOwed0, tokensOwed1) = IAlgebraPool(pool).positions(positionKey);
  }
}

contract GammaPoolUniswapV3PriceOracle is GammaPoolBasePriceOracle {
  /**
   * @dev Fetches the fair LP token/ETH price from Uniswap, with 18 decimals of precision.
   */
  function _price(address token) internal view override returns (uint256) {
    // Get Gamma pool and underlying tokens
    IHypervisor pool = IHypervisor(token);
    ERC20Upgradeable token0 = ERC20Upgradeable(pool.token0());
    ERC20Upgradeable token1 = ERC20Upgradeable(pool.token1());

    // Get underlying token prices
    uint256 p0 = BasePriceOracle(msg.sender).price(address(token0)); // * 10**uint256(18 - token0.decimals());
    uint256 p1 = BasePriceOracle(msg.sender).price(address(token1)); // * 10**uint256(18 - token1.decimals());

    uint160 sqrtPriceX96 = toUint160(
      sqrt((p0 * (10**token0.decimals()) * (1 << 96)) / (p1 * (10**token1.decimals()))) << 48
    );

    // Get balances of the tokens in the pool given fair underlying token prices
    (uint256 basePlusLimit0, uint256 basePlusLimit1) = _getTotalAmountsAtPrice(
      sqrtPriceX96,
      pool.limitLower(),
      pool.limitUpper(),
      pool.baseLower(),
      pool.baseUpper(),
      token,
      pool.pool()
    );

    uint256 r0 = token0.balanceOf(address(token)) + basePlusLimit0;
    uint256 r1 = token1.balanceOf(address(token)) + basePlusLimit1;

    r0 = r0 * 10**(18 - uint256(token0.decimals()));
    r1 = r1 * 10**(18 - uint256(token1.decimals()));

    require(r0 > 0 || r1 > 0, "Gamma underlying token balances not both greater than 0.");

    // Add the total value of each token together and divide by the totalSupply to get the unit price
    return (p0 * r0 + p1 * r1) / ERC20Upgradeable(token).totalSupply();
  }

  // see: https://polygonscan.com/address/0xe058e1ffff9b13d3fcd4803fdb55d1cc2fe07ddc#code
  function _position(
    address pool,
    address token,
    int24 lowerTick,
    int24 upperTick
  )
    internal
    view
    override
    returns (
      uint128 liquidity,
      uint128 tokensOwed0,
      uint128 tokensOwed1
    )
  {
    bytes32 positionKey = keccak256(abi.encodePacked(token, lowerTick, upperTick));
    (liquidity, , , tokensOwed0, tokensOwed1) = IUniswapV3Pool(pool).positions(positionKey);
  }
}
