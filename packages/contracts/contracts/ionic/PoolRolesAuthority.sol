// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { IonicComptroller, ComptrollerInterface } from "../compound/ComptrollerInterface.sol";
import { ICErc20, CTokenSecondExtensionInterface, CTokenFirstExtensionInterface } from "../compound/CTokenInterfaces.sol";

import { RolesAuthority, Authority } from "solmate/auth/authorities/RolesAuthority.sol";

import "openzeppelin-contracts-upgradeable/contracts/proxy/utils/Initializable.sol";

contract PoolRolesAuthority is RolesAuthority, Initializable {
  constructor() RolesAuthority(address(0), Authority(address(0))) {
    _disableInitializers();
  }

  function initialize(address _owner) public initializer {
    owner = _owner;
    authority = this;
  }

  // up to 256 roles
  uint8 public constant REGISTRY_ROLE = 0;
  uint8 public constant SUPPLIER_ROLE = 1;
  uint8 public constant BORROWER_ROLE = 2;
  uint8 public constant LIQUIDATOR_ROLE = 3;
  uint8 public constant LEVERED_POSITION_ROLE = 4;

  function configureRegistryCapabilities() external requiresAuth {
    setRoleCapability(REGISTRY_ROLE, address(this), PoolRolesAuthority.configureRegistryCapabilities.selector, true);
    setRoleCapability(
      REGISTRY_ROLE,
      address(this),
      PoolRolesAuthority.configurePoolSupplierCapabilities.selector,
      true
    );
    setRoleCapability(
      REGISTRY_ROLE,
      address(this),
      PoolRolesAuthority.configurePoolBorrowerCapabilities.selector,
      true
    );
    setRoleCapability(
      REGISTRY_ROLE,
      address(this),
      PoolRolesAuthority.configureClosedPoolLiquidatorCapabilities.selector,
      true
    );
    setRoleCapability(
      REGISTRY_ROLE,
      address(this),
      PoolRolesAuthority.configureOpenPoolLiquidatorCapabilities.selector,
      true
    );
    setRoleCapability(
      REGISTRY_ROLE,
      address(this),
      PoolRolesAuthority.configureLeveredPositionCapabilities.selector,
      true
    );
    setRoleCapability(REGISTRY_ROLE, address(this), RolesAuthority.setUserRole.selector, true);
  }

  function openPoolSupplierCapabilities(IonicComptroller pool) external requiresAuth {
    _setPublicPoolSupplierCapabilities(pool, true);
  }

  function closePoolSupplierCapabilities(IonicComptroller pool) external requiresAuth {
    _setPublicPoolSupplierCapabilities(pool, false);
  }

  function _setPublicPoolSupplierCapabilities(IonicComptroller pool, bool setPublic) internal {
    setPublicCapability(address(pool), pool.enterMarkets.selector, setPublic);
    setPublicCapability(address(pool), pool.exitMarket.selector, setPublic);
    ICErc20[] memory allMarkets = pool.getAllMarkets();
    for (uint256 i = 0; i < allMarkets.length; i++) {
      bytes4[] memory selectors = getSupplierMarketSelectors();
      for (uint256 j = 0; j < selectors.length; j++) {
        setPublicCapability(address(allMarkets[i]), selectors[j], setPublic);
      }
    }
  }

  function configurePoolSupplierCapabilities(IonicComptroller pool) external requiresAuth {
    _configurePoolSupplierCapabilities(pool, SUPPLIER_ROLE);
  }

  function getSupplierMarketSelectors() internal pure returns (bytes4[] memory selectors) {
    uint8 fnsCount = 6;
    selectors = new bytes4[](fnsCount);
    selectors[--fnsCount] = CTokenSecondExtensionInterface.mint.selector;
    selectors[--fnsCount] = CTokenSecondExtensionInterface.redeem.selector;
    selectors[--fnsCount] = CTokenSecondExtensionInterface.redeemUnderlying.selector;
    selectors[--fnsCount] = CTokenFirstExtensionInterface.transfer.selector;
    selectors[--fnsCount] = CTokenFirstExtensionInterface.transferFrom.selector;
    selectors[--fnsCount] = CTokenFirstExtensionInterface.approve.selector;

    require(fnsCount == 0, "use the correct array length");
    return selectors;
  }

  function _configurePoolSupplierCapabilities(IonicComptroller pool, uint8 role) internal {
    setRoleCapability(role, address(pool), pool.enterMarkets.selector, true);
    setRoleCapability(role, address(pool), pool.exitMarket.selector, true);
    ICErc20[] memory allMarkets = pool.getAllMarkets();
    for (uint256 i = 0; i < allMarkets.length; i++) {
      bytes4[] memory selectors = getSupplierMarketSelectors();
      for (uint256 j = 0; j < selectors.length; j++) {
        setRoleCapability(role, address(allMarkets[i]), selectors[j], true);
      }
    }
  }

  function openPoolBorrowerCapabilities(IonicComptroller pool) external requiresAuth {
    _setPublicPoolBorrowerCapabilities(pool, true);
  }

  function closePoolBorrowerCapabilities(IonicComptroller pool) external requiresAuth {
    _setPublicPoolBorrowerCapabilities(pool, false);
  }

  function _setPublicPoolBorrowerCapabilities(IonicComptroller pool, bool setPublic) internal {
    ICErc20[] memory allMarkets = pool.getAllMarkets();
    for (uint256 i = 0; i < allMarkets.length; i++) {
      setPublicCapability(address(allMarkets[i]), allMarkets[i].borrow.selector, setPublic);
      setPublicCapability(address(allMarkets[i]), allMarkets[i].repayBorrow.selector, setPublic);
      setPublicCapability(address(allMarkets[i]), allMarkets[i].repayBorrowBehalf.selector, setPublic);
      setPublicCapability(address(allMarkets[i]), allMarkets[i].flash.selector, setPublic);
    }
  }

  function configurePoolBorrowerCapabilities(IonicComptroller pool) external requiresAuth {
    // borrowers have the SUPPLIER_ROLE capabilities by default
    _configurePoolSupplierCapabilities(pool, BORROWER_ROLE);
    ICErc20[] memory allMarkets = pool.getAllMarkets();
    for (uint256 i = 0; i < allMarkets.length; i++) {
      setRoleCapability(BORROWER_ROLE, address(allMarkets[i]), allMarkets[i].borrow.selector, true);
      setRoleCapability(BORROWER_ROLE, address(allMarkets[i]), allMarkets[i].repayBorrow.selector, true);
      setRoleCapability(BORROWER_ROLE, address(allMarkets[i]), allMarkets[i].repayBorrowBehalf.selector, true);
      setRoleCapability(BORROWER_ROLE, address(allMarkets[i]), allMarkets[i].flash.selector, true);
    }
  }

  function configureClosedPoolLiquidatorCapabilities(IonicComptroller pool) external requiresAuth {
    ICErc20[] memory allMarkets = pool.getAllMarkets();
    for (uint256 i = 0; i < allMarkets.length; i++) {
      setPublicCapability(address(allMarkets[i]), allMarkets[i].liquidateBorrow.selector, false);
      setRoleCapability(LIQUIDATOR_ROLE, address(allMarkets[i]), allMarkets[i].liquidateBorrow.selector, true);
      setRoleCapability(LIQUIDATOR_ROLE, address(allMarkets[i]), allMarkets[i].redeem.selector, true);
    }
  }

  function configureOpenPoolLiquidatorCapabilities(IonicComptroller pool) external requiresAuth {
    ICErc20[] memory allMarkets = pool.getAllMarkets();
    for (uint256 i = 0; i < allMarkets.length; i++) {
      setPublicCapability(address(allMarkets[i]), allMarkets[i].liquidateBorrow.selector, true);
      // TODO this leaves redeeming open for everyone
      setPublicCapability(address(allMarkets[i]), allMarkets[i].redeem.selector, true);
    }
  }

  function configureLeveredPositionCapabilities(IonicComptroller pool) external requiresAuth {
    setRoleCapability(LEVERED_POSITION_ROLE, address(pool), pool.enterMarkets.selector, true);
    setRoleCapability(LEVERED_POSITION_ROLE, address(pool), pool.exitMarket.selector, true);
    ICErc20[] memory allMarkets = pool.getAllMarkets();
    for (uint256 i = 0; i < allMarkets.length; i++) {
      setRoleCapability(LEVERED_POSITION_ROLE, address(allMarkets[i]), allMarkets[i].mint.selector, true);
      setRoleCapability(LEVERED_POSITION_ROLE, address(allMarkets[i]), allMarkets[i].redeem.selector, true);
      setRoleCapability(LEVERED_POSITION_ROLE, address(allMarkets[i]), allMarkets[i].redeemUnderlying.selector, true);

      setRoleCapability(LEVERED_POSITION_ROLE, address(allMarkets[i]), allMarkets[i].borrow.selector, true);
      setRoleCapability(LEVERED_POSITION_ROLE, address(allMarkets[i]), allMarkets[i].repayBorrow.selector, true);
      setRoleCapability(LEVERED_POSITION_ROLE, address(allMarkets[i]), allMarkets[i].flash.selector, true);
    }
  }
}
