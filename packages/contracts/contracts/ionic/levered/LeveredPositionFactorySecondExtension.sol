// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.10;

import "../../ionic/DiamondExtension.sol";
import { LeveredPositionFactoryStorage } from "./LeveredPositionFactoryStorage.sol";
import { ILeveredPositionFactorySecondExtension } from "./ILeveredPositionFactory.sol";
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

contract LeveredPositionFactorySecondExtension is
  LeveredPositionFactoryStorage,
  DiamondExtension,
  ILeveredPositionFactorySecondExtension
{
  using SafeERC20Upgradeable for IERC20Upgradeable;
  using EnumerableSet for EnumerableSet.AddressSet;

  error PairNotWhitelisted();

  function _getExtensionFunctions() external pure override returns (bytes4[] memory) {
    uint8 fnsCount = 3;
    bytes4[] memory functionSelectors = new bytes4[](fnsCount);
    functionSelectors[--fnsCount] = this.createPosition.selector;
    functionSelectors[--fnsCount] = this.createAndFundPosition.selector;
    functionSelectors[--fnsCount] = this.createAndFundPositionAtRatio.selector;
    require(fnsCount == 0, "use the correct array length");
    return functionSelectors;
  }

  /*----------------------------------------------------------------
                          Mutable Functions
  ----------------------------------------------------------------*/

  function createPosition(ICErc20 _collateralMarket, ICErc20 _stableMarket) public returns (LeveredPosition) {
    if (!borrowableMarketsByCollateral[_collateralMarket].contains(address(_stableMarket))) revert PairNotWhitelisted();

    LeveredPosition position = new LeveredPosition(msg.sender, _collateralMarket, _stableMarket);

    accountsWithOpenPositions.add(msg.sender);
    positionsByAccount[msg.sender].add(address(position));

    AuthoritiesRegistry authoritiesRegistry = feeDistributor.authoritiesRegistry();
    address poolAddress = address(_collateralMarket.comptroller());
    PoolRolesAuthority poolAuth = authoritiesRegistry.poolsAuthorities(poolAddress);
    if (address(poolAuth) != address(0)) {
      authoritiesRegistry.setUserRole(poolAddress, address(position), poolAuth.LEVERED_POSITION_ROLE(), true);
    }

    return position;
  }

  function createAndFundPosition(
    ICErc20 _collateralMarket,
    ICErc20 _stableMarket,
    IERC20Upgradeable _fundingAsset,
    uint256 _fundingAmount
  ) public returns (LeveredPosition) {
    LeveredPosition position = createPosition(_collateralMarket, _stableMarket);
    _fundingAsset.safeTransferFrom(msg.sender, address(this), _fundingAmount);
    _fundingAsset.approve(address(position), _fundingAmount);
    position.fundPosition(_fundingAsset, _fundingAmount);
    return position;
  }

  function createAndFundPositionAtRatio(
    ICErc20 _collateralMarket,
    ICErc20 _stableMarket,
    IERC20Upgradeable _fundingAsset,
    uint256 _fundingAmount,
    uint256 _leverageRatio
  ) external returns (LeveredPosition) {
    LeveredPosition position = createAndFundPosition(_collateralMarket, _stableMarket, _fundingAsset, _fundingAmount);
    if (_leverageRatio > 1e18) {
      position.adjustLeverageRatio(_leverageRatio);
    }
    return position;
  }
}
