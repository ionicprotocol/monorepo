// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.10;

import { SafeOwnable } from "../../ionic/SafeOwnable.sol";
import { IFeeDistributor } from "../../compound/IFeeDistributor.sol";
import { ILiquidatorsRegistry } from "../../liquidators/registry/ILiquidatorsRegistry.sol";
import { ICErc20 } from "../../compound/CTokenInterfaces.sol";

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

abstract contract LeveredPositionFactoryStorage is SafeOwnable {
  EnumerableSet.AddressSet internal accountsWithOpenPositions;
  mapping(address => EnumerableSet.AddressSet) internal positionsByAccount;
  EnumerableSet.AddressSet internal collateralMarkets;
  mapping(ICErc20 => EnumerableSet.AddressSet) internal borrowableMarketsByCollateral;

  mapping(IERC20Upgradeable => mapping(IERC20Upgradeable => uint256)) private __unused;

  IFeeDistributor public feeDistributor;
  ILiquidatorsRegistry public liquidatorsRegistry;
  uint256 public blocksPerYear;

  mapping(bytes4 => address) internal _positionsExtensions;
  EnumerableSet.AddressSet internal _whitelistedSwapRouters;
}
