// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";

import "../../external/balancer/IBalancerPool.sol";
import "../../external/balancer/IBalancerVault.sol";
import "../../external/balancer/BNum.sol";
import "../../ionic/SafeOwnableUpgradeable.sol";

import "../BasePriceOracle.sol";

import { MasterPriceOracle } from "../MasterPriceOracle.sol";

/**
 * @title BalancerLpTokenPriceOracle
 * @author Carlo Mazzaferro <carlo@midascapital.xyz> (https://github.com/carlomazzaferro)
 * @notice BalancerLpTokenPriceOracle is a price oracle for Balancer LP tokens.
 * @dev Implements the `PriceOracle` interface used by Midas pools (and Compound v2).
 */
contract BalancerLpTokenPriceOracle is SafeOwnableUpgradeable, BasePriceOracle, BNum {
  /**
   * @notice MasterPriceOracle for backup for USD price.
   */
  MasterPriceOracle public masterPriceOracle;

  function initialize(MasterPriceOracle _masterPriceOracle) public initializer {
    __SafeOwnable_init(msg.sender);
    masterPriceOracle = _masterPriceOracle;
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
    return (_price(underlying) * 1e18) / (10**uint256(ERC20Upgradeable(underlying).decimals()));
  }

  /**
   * @dev Fetches the fair LP token/ETH price from Balancer, with 18 decimals of precision.
   * Source: https://github.com/AlphaFinanceLab/homora-v2/blob/master/contracts/oracle/BalancerPairOracle.sol
   */
  function _price(address underlying) internal view virtual returns (uint256) {
    IBalancerPool pool = IBalancerPool(underlying);
    bytes32 poolId = pool.getPoolId();
    IBalancerVault vault = pool.getVault();
    (IERC20Upgradeable[] memory tokens, uint256[] memory balances, ) = vault.getPoolTokens(poolId);

    require(tokens.length == 2, "Oracle suitable only for Balancer Pools of 2 tokens");

    address tokenA = address(tokens[0]);
    address tokenB = address(tokens[1]);

    uint256[] memory weights = pool.getNormalizedWeights();

    uint256 pxA = masterPriceOracle.price(tokenA);
    uint256 pxB = masterPriceOracle.price(tokenB);

    uint8 decimalsA = ERC20Upgradeable(tokenA).decimals();
    uint8 decimalsB = ERC20Upgradeable(tokenB).decimals();

    if (decimalsA < 18) pxA = pxA * (10**(18 - uint256(decimalsA)));
    if (decimalsA > 18) pxA = pxA / (10**(uint256(decimalsA) - 18));
    if (decimalsB < 18) pxB = pxB * (10**(18 - uint256(decimalsB)));
    if (decimalsB > 18) pxB = pxB / (10**(uint256(decimalsB) - 18));
    (uint256 fairResA, uint256 fairResB) = computeFairReserves(
      balances[0],
      balances[1],
      weights[0],
      weights[1],
      pxA,
      pxB
    );
    // use fairReserveA and fairReserveB to compute LP token price
    // LP price = (fairResA * pxA + fairResB * pxB) / totalLPSupply
    return ((fairResA * pxA) + (fairResB * pxB)) / pool.totalSupply();
  }

  /// @dev Return fair reserve amounts given spot reserves, weights, and fair prices.
  /// @param resA Reserve of the first asset
  /// @param resB Reserve of the second asset
  /// @param wA Weight of the first asset
  /// @param wB Weight of the second asset
  /// @param pxA Fair price of the first asset
  /// @param pxB Fair price of the second asset
  function computeFairReserves(
    uint256 resA,
    uint256 resB,
    uint256 wA,
    uint256 wB,
    uint256 pxA,
    uint256 pxB
  ) internal pure returns (uint256 fairResA, uint256 fairResB) {
    // NOTE: wA + wB = 1 (normalize weights)
    // constant product = resA^wA * resB^wB
    // constraints:
    // - fairResA^wA * fairResB^wB = constant product
    // - fairResA * pxA / wA = fairResB * pxB / wB
    // Solving equations:
    // --> fairResA^wA * (fairResA * (pxA * wB) / (wA * pxB))^wB = constant product
    // --> fairResA / r1^wB = constant product
    // --> fairResA = resA^wA * resB^wB * r1^wB
    // --> fairResA = resA * (resB/resA)^wB * r1^wB = resA * (r1/r0)^wB
    uint256 r0 = bdiv(resA, resB);
    uint256 r1 = bdiv(bmul(wA, pxB), bmul(wB, pxA));
    // fairResA = resA * (r1 / r0) ^ wB
    // fairResB = resB * (r0 / r1) ^ wA
    if (r0 > r1) {
      uint256 ratio = bdiv(r1, r0);
      fairResA = bmul(resA, bpow(ratio, wB));
      fairResB = bdiv(resB, bpow(ratio, wA));
    } else {
      uint256 ratio = bdiv(r0, r1);
      fairResA = bdiv(resA, bpow(ratio, wB));
      fairResB = bmul(resB, bpow(ratio, wA));
    }
  }
}
