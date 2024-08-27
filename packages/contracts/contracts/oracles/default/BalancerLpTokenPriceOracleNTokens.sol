// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";
import { IERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

import "../../external/balancer/IBalancerPool.sol";
import "../../external/balancer/IBalancerVault.sol";
import "../../external/balancer/BNum.sol";
import "../../ionic/SafeOwnableUpgradeable.sol";

import "../BasePriceOracle.sol";

import { MasterPriceOracle } from "../MasterPriceOracle.sol";

/**
 * @title BalancerLpTokenPriceOracleNTokens
 * @author Carlo Mazzaferro <carlo@midascapital.xyz> (https://github.com/carlomazzaferro)
 * @notice BalancerLpTokenPriceOracle is a price oracle for Balancer LP tokens.
 * @dev Implements the `PriceOracle` interface used by Midas pools (and Compound v2).
        This implementation generalises the BalancerLpTokenPriceOracle to allow for >= 2 tokens.
 */
contract BalancerLpTokenPriceOracleNTokens is SafeOwnableUpgradeable, BasePriceOracle, BNum {
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
   */
  function _price(address underlying) internal view virtual returns (uint256) {
    IBalancerPool pool = IBalancerPool(underlying);
    bytes32 poolId = pool.getPoolId();
    IBalancerVault vault = IBalancerVault(address(pool.getVault()));
    (IERC20Upgradeable[] memory tokens, uint256[] memory reserves, ) = vault.getPoolTokens(poolId);

    uint256 nTokens = tokens.length;
    uint256[] memory weights = pool.getNormalizedWeights();

    require(nTokens == weights.length, "nTokens != nWeights");

    uint256[] memory prices = new uint256[](nTokens);

    for (uint256 i = 0; i < nTokens; i++) {
      uint256 tokenPrice = masterPriceOracle.price(address(tokens[i]));
      uint256 decimals = ERC20Upgradeable(address(tokens[i])).decimals();
      if (decimals < 18) {
        reserves[i] = reserves[i] * (10**(18 - decimals));
      } else if (decimals > 18) {
        reserves[i] = reserves[i] / (10**(decimals - 18));
      } else {
        reserves[i] = reserves[i];
      }
      prices[i] = tokenPrice;
    }

    uint256[] memory fairRes = computeFairReserves(reserves, weights, prices);
    // use fairReserveA and fairReserveB to compute LP token price
    // LP price = (fairRes[i] * px[i] + ... +  fairRes[n] * px[n]) / totalLPSupply
    uint256 fairResSum = 0;
    for (uint256 i = 0; i < fairRes.length; i++) {
      fairResSum = fairResSum + (fairRes[i] * prices[i]);
    }

    return fairResSum / pool.totalSupply();
  }

  /// @dev Return fair reserve amounts given spot reserves, weights, and fair prices.
  /// @param reserves Reserves of the assets
  /// @param weights Weights of the assets
  /// @param prices Fair prices of the assets
  function computeFairReserves(
    uint256[] memory reserves,
    uint256[] memory weights,
    uint256[] memory prices
  ) internal pure returns (uint256[] memory fairReserves) {
    // NOTE: wA + ... + wN = 1 (normalize weights)
    // K = resA^wA * resB^wB
    // constraints:
    // - fairResA^wA * .. * fairResN^wN = K
    // - fairResA * pxA / wA = ... =  fairResN * pxN / wN
    // define:
    // - r0_AB = resA / resB ... r0_AN = resA / resN
    // - r1_AB = (Wa / Pa) * (Pb / Wb) ... r1_AN = (Wa / Pa) * (Pn / Wn)

    // Solving equations:
    // --> fairResA^wA * (fairResA * (pxA * wB) / (wA * pxB))^wB * ... * (fairResA * (pxA * wN) / (wA * pxN))^wN = K
    // --> fairResA^(wA + ... + wN) * (r1_AB)^-wB * ... * (r1_AN)^-wN = K
    // --> fairResA = resA^wA * ... * resN^wN * (r1_AB)^wB * ... * (r1_AN)^wN
    // --> fairResA = resA * ((resB * r1_AB ) / resA)^wB * ... * ((resN * r1_AN ) / resA)^wN
    // --> fairResA = resA * (r1_AB / r0_AB)^wB * ... * (r1_AN / r1_AN)^wN

    // Generalising:
    // --> fairResB = (r1_BA / r0_BA)^wA * resB * ... * (r1_BN / r1_BN)^wN
    // ...
    // --> fairResN = (r1_NA / r0_NA)^wA * ... * (r1_N(N-1) / r1_N(N-1))^w(N-1) * resN

    uint256[] memory fairReservesArray = new uint256[](reserves.length);

    for (uint256 i = 0; i < reserves.length; i++) {
      uint256[] memory r0array = new uint256[](reserves.length);
      uint256[] memory r1array = new uint256[](reserves.length);
      for (uint256 j = 0; j < reserves.length; j++) {
        if (i == j) {
          r0array[j] = 1;
          r1array[j] = 1;
        } else {
          r0array[j] = bdiv(reserves[i], reserves[j]);
          r1array[j] = bdiv(bmul(weights[i], prices[j]), bmul(weights[j], prices[i]));
        }
      }
      uint256 init = reserves[i];
      for (uint256 k = 0; k < r0array.length; k++) {
        uint256 r0 = r0array[k];
        uint256 r1 = r1array[k];

        if (r0 > r1) {
          uint256 ratio = bdiv(r1, r0);
          init = bmul(init, bpow(ratio, weights[k]));
        } else {
          uint256 ratio = bdiv(r0, r1);
          init = bmul(init, bpow(ratio, weights[k]));
        }
      }
      fairReservesArray[i] = init;
    }
    return fairReservesArray;
  }
}
