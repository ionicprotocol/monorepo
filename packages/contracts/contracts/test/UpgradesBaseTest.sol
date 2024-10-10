// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import { FeeDistributor } from "../FeeDistributor.sol";
import { Comptroller } from "../compound/Comptroller.sol";
import { DiamondExtension } from "../ionic/DiamondExtension.sol";
import { ComptrollerFirstExtension } from "../compound/ComptrollerFirstExtension.sol";
import { CTokenFirstExtension } from "../compound/CTokenFirstExtension.sol";
import { Unitroller } from "../compound/Unitroller.sol";
import { CErc20Delegate } from "../compound/CErc20Delegate.sol";
import { CErc20PluginDelegate } from "../compound/CErc20PluginDelegate.sol";
import { CErc20PluginRewardsDelegate } from "../compound/CErc20PluginRewardsDelegate.sol";
import { CErc20RewardsDelegate } from "../compound/CErc20RewardsDelegate.sol";
import { ICErc20 } from "../compound/CTokenInterfaces.sol";

import { BaseTest } from "./config/BaseTest.t.sol";

import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

abstract contract UpgradesBaseTest is BaseTest {
  FeeDistributor internal ffd;
  ComptrollerFirstExtension internal poolExt;
  CTokenFirstExtension internal marketExt;

  function afterForkSetUp() internal virtual override {
    ffd = FeeDistributor(payable(ap.getAddress("FeeDistributor")));
    poolExt = new ComptrollerFirstExtension();
    marketExt = new CTokenFirstExtension();
  }

  function _upgradePoolWithExtension(Unitroller asUnitroller) internal {
    address oldComptrollerImplementation = asUnitroller.comptrollerImplementation();

    // instantiate the new implementation
    Comptroller newComptrollerImplementation = new Comptroller();
    vm.startPrank(ffd.owner());
    address comptrollerImplementationAddress = address(newComptrollerImplementation);
    ffd._setLatestComptrollerImplementation(address(0), comptrollerImplementationAddress);
    // add the extension to the auto upgrade config
    DiamondExtension[] memory extensions = new DiamondExtension[](2);
    extensions[0] = poolExt;
    extensions[1] = newComptrollerImplementation;
    ffd._setComptrollerExtensions(comptrollerImplementationAddress, extensions);
    vm.stopPrank();

    // upgrade to the new comptroller
    vm.startPrank(asUnitroller.admin());
    asUnitroller._registerExtension(
      DiamondExtension(comptrollerImplementationAddress),
      DiamondExtension(asUnitroller.comptrollerImplementation())
    );
    asUnitroller._upgrade();
    vm.stopPrank();
  }

  function _upgradeMarketWithExtension(ICErc20 market) internal {
    address implBefore = market.implementation();

    // instantiate the new implementation
    CErc20Delegate newImpl;
    bytes memory becomeImplData = "";
    if (compareStrings("CErc20Delegate", market.contractType())) {
      newImpl = new CErc20Delegate();
    } else if (compareStrings("CErc20PluginDelegate", market.contractType())) {
      newImpl = new CErc20PluginDelegate();
      becomeImplData = abi.encode(address(0));
    } else if (compareStrings("CErc20RewardsDelegate", market.contractType())) {
      newImpl = new CErc20RewardsDelegate();
      becomeImplData = abi.encode(address(0));
    } else {
      newImpl = new CErc20PluginRewardsDelegate();
      becomeImplData = abi.encode(address(0));
    }

    // set the new delegate as the latest
    vm.startPrank(ffd.owner());
    ffd._setLatestCErc20Delegate(newImpl.delegateType(), address(newImpl), abi.encode(address(0)));

    // add the extension to the auto upgrade config
    DiamondExtension[] memory cErc20DelegateExtensions = new DiamondExtension[](2);
    cErc20DelegateExtensions[0] = marketExt;
    cErc20DelegateExtensions[1] = newImpl;
    ffd._setCErc20DelegateExtensions(address(newImpl), cErc20DelegateExtensions);
    vm.stopPrank();

    // upgrade to the new delegate
    vm.prank(address(ffd));
    market._setImplementationSafe(address(newImpl), becomeImplData);
  }
}
