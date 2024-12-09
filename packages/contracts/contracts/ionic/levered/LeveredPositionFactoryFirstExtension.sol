// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.10;

import "../../ionic/DiamondExtension.sol";
import { LeveredPositionFactoryStorage } from "./LeveredPositionFactoryStorage.sol";
import { ILeveredPositionFactoryFirstExtension } from "./ILeveredPositionFactory.sol";
import { ICErc20 } from "../../compound/CTokenInterfaces.sol";
import { IRedemptionStrategy } from "../../liquidators/IRedemptionStrategy.sol";
import { LeveredPosition } from "./LeveredPosition.sol";
import { IComptroller, IPriceOracle } from "../../external/compound/IComptroller.sol";
import { ILiquidatorsRegistry } from "../../liquidators/registry/ILiquidatorsRegistry.sol";
import { AuthoritiesRegistry } from "../AuthoritiesRegistry.sol";
import { PoolRolesAuthority } from "../PoolRolesAuthority.sol";

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract LeveredPositionFactoryFirstExtension is
  LeveredPositionFactoryStorage,
  DiamondExtension,
  ILeveredPositionFactoryFirstExtension
{
  using SafeERC20Upgradeable for IERC20Upgradeable;
  using EnumerableSet for EnumerableSet.AddressSet;

  error PairNotWhitelisted();
  error NoSuchPosition();
  error PositionNotClosed();

  function _getExtensionFunctions() external pure override returns (bytes4[] memory) {
    uint8 fnsCount = 11;
    bytes4[] memory functionSelectors = new bytes4[](fnsCount);
    functionSelectors[--fnsCount] = this.removeClosedPosition.selector;
    functionSelectors[--fnsCount] = this.closeAndRemoveUserPosition.selector;
    functionSelectors[--fnsCount] = this.getMinBorrowNative.selector;
    functionSelectors[--fnsCount] = this.getRedemptionStrategies.selector;
    functionSelectors[--fnsCount] = this.getBorrowableMarketsByCollateral.selector;
    functionSelectors[--fnsCount] = this.getWhitelistedCollateralMarkets.selector;
    functionSelectors[--fnsCount] = this.getAccountsWithOpenPositions.selector;
    functionSelectors[--fnsCount] = this.getPositionsByAccount.selector;
    functionSelectors[--fnsCount] = this.getPositionsExtension.selector;
    functionSelectors[--fnsCount] = this._setPositionsExtension.selector;
    functionSelectors[--fnsCount] = this.whitelistedSwapRouters.selector;

    require(fnsCount == 0, "use the correct array length");
    return functionSelectors;
  }

  /*----------------------------------------------------------------
                          Mutable Functions
  ----------------------------------------------------------------*/

  // @return true if removed, otherwise false
  function removeClosedPosition(address closedPosition) external returns (bool) {
    return _removeClosedPosition(closedPosition, msg.sender);
  }

  function closeAndRemoveUserPosition(
    LeveredPosition position,
    address aggregatorTarget,
    bytes memory aggregatorData,
    uint256 assumedSlippage
  ) external onlyOwner returns (bool) {
    address positionOwner = position.positionOwner();
    position.closePosition(positionOwner, aggregatorTarget, aggregatorData, assumedSlippage);
    return _removeClosedPosition(address(position), positionOwner);
  }

  function _removeClosedPosition(address closedPosition, address positionOwner) internal returns (bool removed) {
    EnumerableSet.AddressSet storage userPositions = positionsByAccount[positionOwner];
    if (!userPositions.contains(closedPosition)) revert NoSuchPosition();
    if (!LeveredPosition(closedPosition).isPositionClosed()) revert PositionNotClosed();

    removed = userPositions.remove(closedPosition);
    if (userPositions.length() == 0) accountsWithOpenPositions.remove(positionOwner);
  }

  function _setPositionsExtension(bytes4 msgSig, address extension) external onlyOwner {
    _positionsExtensions[msgSig] = extension;
  }

  /*----------------------------------------------------------------
                            View Functions
  ----------------------------------------------------------------*/

  function getMinBorrowNative() external view returns (uint256) {
    return feeDistributor.minBorrowEth();
  }

  function getRedemptionStrategies(
    IERC20Upgradeable inputToken,
    IERC20Upgradeable outputToken
  ) external view returns (IRedemptionStrategy[] memory strategies, bytes[] memory strategiesData) {
    return liquidatorsRegistry.getRedemptionStrategies(inputToken, outputToken);
  }

  function getPositionsByAccount(
    address account
  ) external view returns (address[] memory positions, bool[] memory closed) {
    positions = positionsByAccount[account].values();
    closed = new bool[](positions.length);
    for (uint256 i = 0; i < positions.length; i++) {
      closed[i] = LeveredPosition(positions[i]).isPositionClosed();
    }
  }

  function getAccountsWithOpenPositions() external view returns (address[] memory) {
    return accountsWithOpenPositions.values();
  }

  function getWhitelistedCollateralMarkets() external view returns (address[] memory) {
    return collateralMarkets.values();
  }

  function getBorrowableMarketsByCollateral(ICErc20 _collateralMarket) external view returns (address[] memory) {
    return borrowableMarketsByCollateral[_collateralMarket].values();
  }

  function getPositionsExtension(bytes4 msgSig) external view returns (address) {
    return _positionsExtensions[msgSig];
  }

  function whitelistedSwapRouters(address swapRouter) external view returns (bool) {
    return _whitelistedSwapRouters[swapRouter];
  }
}
