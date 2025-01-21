// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.10;

import "../IRedemptionStrategy.sol";
import { SafeOwnable } from "../../ionic/SafeOwnable.sol";
import { AddressesProvider } from "../../ionic/AddressesProvider.sol";

import "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

abstract contract LiquidatorsRegistryStorage is SafeOwnable {
  AddressesProvider public ap;

  EnumerableSet.AddressSet internal redemptionStrategies;
  mapping(string => IRedemptionStrategy) public redemptionStrategiesByName;
  mapping(IERC20Upgradeable => mapping(IERC20Upgradeable => IRedemptionStrategy)) public redemptionStrategiesByTokens;
  mapping(IERC20Upgradeable => IERC20Upgradeable) public defaultOutputToken;
  mapping(IERC20Upgradeable => EnumerableSet.AddressSet) internal inputTokensByOutputToken;
  EnumerableSet.AddressSet internal outputTokensSet;

  mapping(IERC20Upgradeable => mapping(IERC20Upgradeable => uint256)) internal conversionSlippage;
  mapping(IERC20Upgradeable => mapping(IERC20Upgradeable => uint256)) internal conversionSlippageUpdated;

  mapping(IERC20Upgradeable => mapping(IERC20Upgradeable => uint24)) public uniswapV3Fees;
  mapping(IERC20Upgradeable => mapping(IERC20Upgradeable => address)) public customUniV3Router;

  mapping(IERC20Upgradeable => mapping(IERC20Upgradeable => IERC20Upgradeable[])) internal _optimalSwapPath;
  mapping(address => address) internal _wrappedToUnwrapped4626;
  mapping(address => mapping(address => int24)) internal _aeroCLTickSpacings;
  mapping(address => mapping(address => bool)) internal _aeroV2IsStable;
}
