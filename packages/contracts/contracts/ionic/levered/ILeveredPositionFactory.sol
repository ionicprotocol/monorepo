// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { IRedemptionStrategy } from "../../liquidators/IRedemptionStrategy.sol";
import { ICErc20 } from "../../compound/CTokenInterfaces.sol";
import { LeveredPosition } from "./LeveredPosition.sol";
import { LeveredPositionWithAggregatorSwaps } from "./LeveredPositionWithAggregatorSwaps.sol";
import { IFeeDistributor } from "../../compound/IFeeDistributor.sol";
import { ILiquidatorsRegistry } from "../../liquidators/registry/ILiquidatorsRegistry.sol";

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

interface ILeveredPositionFactoryStorage {
  function feeDistributor() external view returns (IFeeDistributor);

  function liquidatorsRegistry() external view returns (ILiquidatorsRegistry);

  function blocksPerYear() external view returns (uint256);

  function owner() external view returns (address);
}

interface ILeveredPositionFactoryBase {
  function _setLiquidatorsRegistry(ILiquidatorsRegistry _liquidatorsRegistry) external;

  function _setPairWhitelisted(
    ICErc20 _collateralMarket,
    ICErc20 _stableMarket,
    bool _whitelisted
  ) external;
}

interface ILeveredPositionFactoryFirstExtension {
  function getRedemptionStrategies(IERC20Upgradeable inputToken, IERC20Upgradeable outputToken)
    external
    view
    returns (IRedemptionStrategy[] memory strategies, bytes[] memory strategiesData);

  function getMinBorrowNative() external view returns (uint256);

  function removeClosedPosition(address closedPosition) external returns (bool removed);

  function closeAndRemoveUserPosition(
    LeveredPositionWithAggregatorSwaps position,
    address aggregatorTarget,
    bytes memory aggregatorData,
    uint256 expectedSlippage
  ) external returns (bool);

  function closeAndRemoveUserPosition(LeveredPosition position) external returns (bool);

  function getPositionsByAccount(address account) external view returns (address[] memory, bool[] memory);

  function getAccountsWithOpenPositions() external view returns (address[] memory);

  function getWhitelistedCollateralMarkets() external view returns (address[] memory);

  function getBorrowableMarketsByCollateral(ICErc20 _collateralMarket) external view returns (address[] memory);

  function getPositionsExtension(bytes4 msgSig) external view returns (address);

  function getAllWhitelistedSwapRouters() external view returns (address[] memory);

  function isSwapRoutersWhitelisted(address swapRouter) external view returns (bool);

  function _setPositionsExtension(bytes4 msgSig, address extension) external;

  function _setWhitelistedSwapRouters(address[] memory newSet) external;

  function calculateAdjustmentAmountDeltas(
    uint256 targetRatio,
    uint256 collateralAssetPrice,
    uint256 borrowedAssetPrice,
    uint256 expectedSlippage,
    uint256 positionSupplyAmount,
    uint256 debtAmount
  ) external pure returns (uint256 supplyDelta, uint256 borrowsDelta);
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

  function createPositionWithAggregatorSwaps(
    ICErc20 _collateralMarket,
    ICErc20 _stableMarket,
    address _aggregatorTarget,
    bytes memory _aggregatorData
  ) external returns (LeveredPositionWithAggregatorSwaps);

  function createAndFundPositionWithAggregatorSwaps(
    ICErc20 _collateralMarket,
    ICErc20 _stableMarket,
    IERC20Upgradeable _fundingAsset,
    uint256 _fundingAmount,
    address aggregatorTarget,
    bytes memory aggregatorData
  ) external returns (LeveredPositionWithAggregatorSwaps);

  function createAndFundPositionWithAggregatorSwapsAtRatio(
    ICErc20 _collateralMarket,
    ICErc20 _stableMarket,
    IERC20Upgradeable _fundingAsset,
    uint256 _fundingAmount,
    uint256 _leverageRatio,
    address _fundingAssetSwapAggregatorTarget,
    bytes memory _fundingAssetSwapAggregatorData,
    address _adjustLeverageRatioAggregatorTarget,
    bytes memory _adjustLeverageRatioAggregatorData,
    uint256 _expectedSlippage
  ) external returns (LeveredPositionWithAggregatorSwaps);
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
