// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.10;

import "../../ionic/DiamondExtension.sol";
import { LeveredPositionFactoryStorage } from "./LeveredPositionFactoryStorage.sol";
import { ILeveredPositionFactoryFirstExtension } from "./ILeveredPositionFactory.sol";
import { ICErc20 } from "../../compound/CTokenInterfaces.sol";
import { IRedemptionStrategy } from "../../liquidators/IRedemptionStrategy.sol";
import { LeveredPosition } from "./LeveredPosition.sol";
import { LeveredPositionWithAggregatorSwaps } from "./LeveredPositionWithAggregatorSwaps.sol";
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

  error NoSuchPosition();
  error PositionNotClosed();

  function _getExtensionFunctions() external pure override returns (bytes4[] memory) {
    uint8 fnsCount = 15;
    bytes4[] memory functionSelectors = new bytes4[](fnsCount);
    functionSelectors[--fnsCount] = this.removeClosedPosition.selector;
    functionSelectors[--fnsCount] = bytes4(keccak256(bytes("closeAndRemoveUserPosition(address,address,bytes,uint256)")));
    functionSelectors[--fnsCount] = bytes4(keccak256(bytes("closeAndRemoveUserPosition(address)")));
    functionSelectors[--fnsCount] = this.getMinBorrowNative.selector;
    functionSelectors[--fnsCount] = this.getRedemptionStrategies.selector;
    functionSelectors[--fnsCount] = this.getBorrowableMarketsByCollateral.selector;
    functionSelectors[--fnsCount] = this.getWhitelistedCollateralMarkets.selector;
    functionSelectors[--fnsCount] = this.getAccountsWithOpenPositions.selector;
    functionSelectors[--fnsCount] = this.getPositionsByAccount.selector;
    functionSelectors[--fnsCount] = this.getPositionsExtension.selector;
    functionSelectors[--fnsCount] = this._setPositionsExtension.selector;
    functionSelectors[--fnsCount] = this.getAllWhitelistedSwapRouters.selector;
    functionSelectors[--fnsCount] = this.isSwapRoutersWhitelisted.selector;
    functionSelectors[--fnsCount] = this._setWhitelistedSwapRouters.selector;
    functionSelectors[--fnsCount] = this.calculateAdjustmentAmountDeltas.selector;

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
    LeveredPositionWithAggregatorSwaps position,
    address aggregatorTarget,
    bytes memory aggregatorData
  ) external onlyOwner returns (bool) {
    address positionOwner = position.positionOwner();
    (uint256 supplyDelta, uint256 borrowsDelta) = position.getAdjustmentAmountDeltas(1e18);
    position.closePosition(positionOwner, supplyDelta, borrowsDelta, aggregatorTarget, aggregatorData);
    return _removeClosedPosition(address(position), positionOwner);
  }

  function closeAndRemoveUserPosition(LeveredPosition position) external onlyOwner returns (bool) {
    address positionOwner = position.positionOwner();
    position.closePosition(positionOwner);
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

  function _setWhitelistedSwapRouters(address[] memory newSet) external onlyOwner {
    address[] memory currentSet = _whitelistedSwapRouters.values();
    for (uint256 i = 0; i < currentSet.length; i++) {
      _whitelistedSwapRouters.remove(currentSet[i]);
    }

    for (uint256 i = 0; i < newSet.length; i++) {
      _whitelistedSwapRouters.add(newSet[i]);
    }
  }

  /*----------------------------------------------------------------
                            View Functions
  ----------------------------------------------------------------*/

  function calculateAdjustmentAmountDeltas(
    uint256 targetRatio,
    uint256 collateralAssetPrice,
    uint256 borrowedAssetPrice,
    uint256 expectedSlippage,
    uint256 positionSupplyAmount,
    uint256 debtAmount
  ) external pure returns (uint256 supplyDelta, uint256 borrowsDelta) {
    uint256 slippageFactor = (1e18 * (10000 + expectedSlippage)) / 10000;

    uint256 valueDeltaAbs;
    bool ratioIncreases;
    {
      // s = supply value before
      // b = borrow value before
      // r = target ratio after
      // c = borrow value coefficient to account for the slippage
      uint256 s = (collateralAssetPrice * positionSupplyAmount) / 1e18;
      uint256 b = (borrowedAssetPrice * debtAmount) / 1e18;
      uint256 r = targetRatio;
      uint256 r1 = r - 1e18;
      uint256 c = slippageFactor;

      ratioIncreases = (s * 1e18) / (s - b) < targetRatio;

      if (ratioIncreases) {
        // some math magic here
        // x = supplyValueDelta
        // https://www.wolframalpha.com/input?i2d=true&i=r%3D%5C%2840%29Divide%5B%5C%2840%29s%2Bx%5C%2841%29%2C%5C%2840%29s%2Bx-b-c*x%5C%2841%29%5D+%5C%2841%29+solve+for+x

        valueDeltaAbs = (((r1 * s) - (b * r)) * 1e18) / ((c * r) - (1e18 * r1));
      } else {
        // some math magic here
        // x = borrowsValueDelta
        // https://www.wolframalpha.com/input?i2d=true&i=Divide%5B%5C%2840%29s+-+c*x%5C%2841%29%2C%5C%2840%29s+-+c*x+-+%5C%2840%29b+-+x%5C%2841%29%5C%2841%29%5D+%3Dr%5C%2844%29++solve+for+x

        valueDeltaAbs = (((b * r) - (r1 * s)) * 1e18) / ((1e18 * r) - (c * r1));
      }
    }


    // round up when dividing in order to redeem enough (otherwise calcs could be exploited)
    supplyDelta = divRoundUp(valueDeltaAbs, collateralAssetPrice);
    borrowsDelta = (valueDeltaAbs * 1e18) / borrowedAssetPrice;

    if (ratioIncreases) {
      // will swap the borrowed, stables to borrow = c * x
      borrowsDelta = (borrowsDelta * slippageFactor) / 1e18;
    } else {
      // will swap the redeemed, amount to redeem = c * x
      supplyDelta = (supplyDelta * slippageFactor) / 1e18;
    }
  }

  function divRoundUp(uint256 x, uint256 y) internal pure returns (uint256 res) {
    res = (x * 1e18) / y;
    if (x % y != 0) res += 1;
  }

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

  function isSwapRoutersWhitelisted(address swapRouter) external view returns (bool) {
    return _whitelistedSwapRouters.contains(swapRouter);
  }

  function getAllWhitelistedSwapRouters() external view returns (address[] memory) {
    return _whitelistedSwapRouters.values();
  }
}
