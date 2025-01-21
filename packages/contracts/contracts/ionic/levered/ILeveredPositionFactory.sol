// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { IRedemptionStrategy } from "../../liquidators/IRedemptionStrategy.sol";
import { ICErc20 } from "../../compound/CTokenInterfaces.sol";
import { LeveredPosition } from "./LeveredPosition.sol";
import { IFeeDistributor } from "../../compound/IFeeDistributor.sol";
import { ILiquidatorsRegistry } from "../../liquidators/registry/ILiquidatorsRegistry.sol";

import "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

interface ILeveredPositionFactoryStorage {
  function feeDistributor() external view returns (IFeeDistributor);

  function liquidatorsRegistry() external view returns (ILiquidatorsRegistry);

  function blocksPerYear() external view returns (uint256);

  function owner() external view returns (address);
}

interface ILeveredPositionFactoryBase {
  function _setLiquidatorsRegistry(ILiquidatorsRegistry _liquidatorsRegistry) external;

  function _setPairWhitelisted(ICErc20 _collateralMarket, ICErc20 _stableMarket, bool _whitelisted) external;
}

interface ILeveredPositionFactoryFirstExtension {
  function getRedemptionStrategies(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) external view returns (IRedemptionStrategy[] memory strategies, bytes[] memory strategiesData);

  function getMinBorrowNative() external view returns (uint256);

  function removeClosedPosition(address closedPosition) external returns (bool removed);

  function closeAndRemoveUserPosition(LeveredPosition position) external returns (bool);

  function getPositionsByAccount(address account) external view returns (address[] memory, bool[] memory);

  function getAccountsWithOpenPositions() external view returns (address[] memory);

  function getWhitelistedCollateralMarkets() external view returns (address[] memory);

  function getBorrowableMarketsByCollateral(ICErc20 _collateralMarket) external view returns (address[] memory);

  function getPositionsExtension(bytes4 msgSig) external view returns (address);

  function _setPositionsExtension(bytes4 msgSig, address extension) external;
}

interface ILeveredPositionFactorySecondExtension {
  function createPosition(ICErc20 _collateralMarket, ICErc20 _stableMarket) external returns (LeveredPosition);

  function createAndFundPosition(
    ICErc20 _collateralMarket,
    ICErc20 _stableMarket,
    IERC20Upgradeable _fundingAsset,
    uint256 _fundingAmount
  ) external returns (LeveredPosition);

  function createAndFundPositionAtRatio(
    ICErc20 _collateralMarket,
    ICErc20 _stableMarket,
    IERC20Upgradeable _fundingAsset,
    uint256 _fundingAmount,
    uint256 _leverageRatio
  ) external returns (LeveredPosition);
}

interface ILeveredPositionFactoryExtension is
  ILeveredPositionFactoryFirstExtension,
  ILeveredPositionFactorySecondExtension
{}

interface ILeveredPositionFactory is
  ILeveredPositionFactoryStorage,
  ILeveredPositionFactoryBase,
  ILeveredPositionFactoryExtension
{}
