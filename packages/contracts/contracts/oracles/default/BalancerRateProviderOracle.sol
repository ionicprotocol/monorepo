// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { EIP20Interface } from "../../compound/EIP20Interface.sol";
import { ERC20Upgradeable } from "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";
import { IRateProvider } from "../../external/balancer/IRateProvider.sol";

import { SafeOwnableUpgradeable } from "../../ionic/SafeOwnableUpgradeable.sol";
import { BasePriceOracle, ICErc20 } from "../BasePriceOracle.sol";

/**
 * @title BalancerRateProviderOracle
 * @author Carlo Mazzaferro <carlo@midascapital.xyz> (https://github.com/carlomazzaferro)
 * @notice BalancerRateProviderOracle is a price oracle for tokens that have a Balancer rate provider.
 * @dev Implements the `PriceOracle` interface used by Midas pools (and Compound v2).
 */

contract BalancerRateProviderOracle is SafeOwnableUpgradeable, BasePriceOracle {
  /**
   * @dev Maps underlying token addresses to rate providers.
   */
  mapping(address => IRateProvider) public rateProviders;

  /**
   * @dev Maps underlying token addresses to base token.
   */
  mapping(address => address) public baseTokens;

  address[] public underlyings;

  function initialize(
    address[] memory _rateProviders,
    address[] memory _baseTokens,
    address[] memory _underlyings
  ) public initializer {
    __SafeOwnable_init(msg.sender);
    require(
      _rateProviders.length == _baseTokens.length && _baseTokens.length == _underlyings.length,
      "Array lengths not equal."
    );
    underlyings = _underlyings;
    // set the other variables
    for (uint256 i = 0; i < _rateProviders.length; i++) {
      rateProviders[_underlyings[i]] = IRateProvider(_rateProviders[i]);
      baseTokens[_underlyings[i]] = _baseTokens[i];
    }
  }

  function getUnderlyingPrice(ICErc20 cToken) external view override returns (uint256) {
    // Get underlying token address
    address underlying = cToken.underlying();
    // check if the underlying is supported
    return (_price(underlying) * 1e18) / (10 ** uint256(EIP20Interface(underlying).decimals()));
  }

  function price(address underlying) external view override returns (uint256) {
    return _price(underlying);
  }

  function _price(address underlying) internal view returns (uint256) {
    // throw if not supported
    require(baseTokens[underlying] != address(0), "Unsupported underlying");

    // Rate is always 1e18 based
    // ER = TOKEN/BASE
    uint256 exchangeRate = rateProviders[underlying].getRate();

    // get the base token price, denomimated in NATIVE (1e18)
    // BP = BASE/NATIVE
    uint256 baseTokenPrice = BasePriceOracle(msg.sender).price(baseTokens[underlying]);

    // ER * BP = TOKEN/NATIVE
    return (exchangeRate * baseTokenPrice) / 1e18;
  }

  function getAllUnderlyings() public view returns (address[] memory) {
    return underlyings;
  }

  /**
   * @dev Register the pool given underlying, base token and rate provider addresses.
   * @param _rateProvider Rate provider address for the underlying token.
   * @param _baseToken Base token for the underlying token.
   * @param _underlying Underlying token for which to add an oracle.
   */
  function registerToken(address _rateProvider, address _baseToken, address _underlying) external onlyOwner {
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
    baseTokens[_underlying] = _baseToken;
    rateProviders[_underlying] = IRateProvider(_rateProvider);
  }
}
