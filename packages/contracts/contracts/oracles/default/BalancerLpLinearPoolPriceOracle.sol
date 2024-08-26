// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { IERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import { ERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";

import { IBalancerLinearPool } from "../../external/balancer/IBalancerLinearPool.sol";
import { IBalancerVault } from "../../external/balancer/IBalancerVault.sol";
import { SafeOwnableUpgradeable } from "../../ionic/SafeOwnableUpgradeable.sol";

import { BasePriceOracle, ICErc20 } from "../BasePriceOracle.sol";

import { MasterPriceOracle } from "../MasterPriceOracle.sol";

/**
 * @title BalancerLpLinearPoolPriceOracle
 * @author Carlo Mazzaferro <carlo@midascapital.xyz> (https://github.com/carlomazzaferro)
 * @notice BalancerLpLinearPoolPriceOracle is a price oracle for Balancer LP tokens.
 * @dev Implements the `PriceOracle` interface used by Midas pools (and Compound v2).
 */

contract BalancerLpLinearPoolPriceOracle is SafeOwnableUpgradeable, BasePriceOracle {
  address[] public underlyings;
  bytes32 internal constant REENTRANCY_ERROR_HASH = keccak256(abi.encodeWithSignature("Error(string)", "BAL#400"));

  function initialize(address[] memory _underlyings) public initializer {
    __SafeOwnable_init(msg.sender);
    underlyings = _underlyings;
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
    IBalancerLinearPool pool = IBalancerLinearPool(underlying);
    IBalancerVault vault = pool.getVault();
    address mainToken = pool.getMainToken();

    // read-only re-entracy protection - this call is always unsuccessful
    (, bytes memory revertData) = address(vault).staticcall{ gas: 5000 }(
      abi.encodeWithSelector(vault.manageUserBalance.selector, new address[](0))
    );
    require(keccak256(revertData) != REENTRANCY_ERROR_HASH, "Balancer vault view reentrancy");

    // Returns the BLP Token / Main Token rate (1e18)
    uint256 rate = pool.getRate();

    // get main token's price (1e18)
    uint256 baseTokenPrice = BasePriceOracle(msg.sender).price(mainToken);
    return (rate * baseTokenPrice) / 1e18;
  }

  /**
   * @dev Register the an underlying.
   * @param _underlying Underlying token for which to add an oracle.
   */
  function registerToken(address _underlying) external onlyOwner {
    bool skip = false;
    for (uint256 j = 0; j < underlyings.length; j++) {
      if (underlyings[j] == _underlying) {
        skip = true;
        break;
      }
    }
    if (!skip) {
      underlyings.push(_underlying);
    }
  }

  function getAllUnderlyings() external view returns (address[] memory) {
    return underlyings;
  }
}
