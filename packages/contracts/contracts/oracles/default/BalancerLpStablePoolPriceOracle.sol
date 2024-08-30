// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { IERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import { ERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";

import { IBalancerStablePool } from "../../external/balancer/IBalancerStablePool.sol";
import { IBalancerVault } from "../../external/balancer/IBalancerVault.sol";
import { SafeOwnableUpgradeable } from "../../ionic/SafeOwnableUpgradeable.sol";
import { BasePriceOracle, ICErc20 } from "../BasePriceOracle.sol";
import { MasterPriceOracle } from "../MasterPriceOracle.sol";

/**
 * @title BalancerLpStablePoolPriceOracle
 * @author Carlo Mazzaferro <carlo@midascapital.xyz> (https://github.com/carlomazzaferro)
 * @notice BalancerLpStablePoolPriceOracle is a price oracle for Balancer LP tokens.
 * @dev Implements the `PriceOracle` interface used by Midas pools (and Compound v2).
 */

contract BalancerLpStablePoolPriceOracle is SafeOwnableUpgradeable, BasePriceOracle {
  bytes32 internal constant REENTRANCY_ERROR_HASH = keccak256(abi.encodeWithSignature("Error(string)", "BAL#400"));

  function initialize() public initializer {
    __SafeOwnable_init(msg.sender);
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
    IBalancerStablePool pool = IBalancerStablePool(underlying);
    IBalancerVault vault = pool.getVault();

    // read-only re-entrancy protection - this call is always unsuccessful but we need to make sure
    // it didn't fail due to a re-entrancy attack
    (, bytes memory revertData) = address(vault).staticcall{ gas: 50000 }(
      abi.encodeWithSelector(vault.manageUserBalance.selector, new address[](0))
    );
    require(keccak256(revertData) != REENTRANCY_ERROR_HASH, "Balancer vault view reentrancy");

    bytes32 poolId = pool.getPoolId();
    (IERC20Upgradeable[] memory tokens, , ) = vault.getPoolTokens(poolId);
    uint256 bptIndex = pool.getBptIndex();

    uint256 minPrice = type(uint256).max;

    for (uint256 i = 0; i < tokens.length; i++) {
      if (i == bptIndex) {
        continue;
      }
      // Get the price of each of the base tokens in ETH
      // This also includes the price of the nested LP tokens, if they are e.g. LinearPools
      // The only requirement is that the nested LP tokens have a price oracle registered
      // See BalancerLpLinearPoolPriceOracle.sol for an example, as well as the relevant tests
      uint256 marketTokenPrice = BasePriceOracle(msg.sender).price(address(tokens[i]));
      uint256 depositTokenPrice = pool.getTokenRate(address(tokens[i]));
      uint256 finalPrice = (marketTokenPrice * 1e18) / depositTokenPrice;
      if (finalPrice < minPrice) {
        minPrice = finalPrice;
      }
    }
    // Multiply the value of each of the base tokens' share in ETH by the rate of the pool
    // pool.getRate() is the rate of the pool, scaled by 1e18
    return (minPrice * pool.getRate()) / 1e18;
  }
}
