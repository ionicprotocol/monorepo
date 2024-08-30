// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { BaseTest } from "./BaseTest.t.sol";
import { FeeDistributor } from "../../FeeDistributor.sol";
import { CErc20Delegate } from "../../compound/CErc20Delegate.sol";
import { CErc20PluginDelegate } from "../../compound/CErc20PluginDelegate.sol";
import { CErc20RewardsDelegate } from "../../compound/CErc20RewardsDelegate.sol";
import { CErc20PluginRewardsDelegate } from "../../compound/CErc20PluginRewardsDelegate.sol";
import { DiamondExtension } from "../../ionic/DiamondExtension.sol";
import { CTokenFirstExtension } from "../../compound/CTokenFirstExtension.sol";
import { Comptroller } from "../../compound/Comptroller.sol";
import { Unitroller } from "../../compound/Unitroller.sol";
import { ComptrollerFirstExtension } from "../../compound/ComptrollerFirstExtension.sol";
import { AuthoritiesRegistry } from "../../ionic/AuthoritiesRegistry.sol";
import { ICErc20 } from "../../compound/CTokenInterfaces.sol";

import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

contract MarketsTest is BaseTest {
  FeeDistributor internal ffd;

  CErc20Delegate internal cErc20Delegate;
  CErc20PluginDelegate internal cErc20PluginDelegate;
  CErc20RewardsDelegate internal cErc20RewardsDelegate;
  CErc20PluginRewardsDelegate internal cErc20PluginRewardsDelegate;
  CTokenFirstExtension internal newCTokenExtension;

  address payable internal latestComptrollerImplementation;
  ComptrollerFirstExtension internal comptrollerExtension;

  function afterForkSetUp() internal virtual override {
    ffd = FeeDistributor(payable(ap.getAddress("FeeDistributor")));
    upgradeFfd();
    cErc20Delegate = new CErc20Delegate();
    cErc20PluginDelegate = new CErc20PluginDelegate();
    cErc20RewardsDelegate = new CErc20RewardsDelegate();
    cErc20PluginRewardsDelegate = new CErc20PluginRewardsDelegate();
    newCTokenExtension = new CTokenFirstExtension();

    comptrollerExtension = new ComptrollerFirstExtension();
    Comptroller newComptrollerImplementation = new Comptroller();
    latestComptrollerImplementation = payable(address(newComptrollerImplementation));
  }

  function upgradeFfd() internal {
    {
      FeeDistributor newImpl = new FeeDistributor();
      TransparentUpgradeableProxy proxy = TransparentUpgradeableProxy(payable(address(ffd)));
      bytes32 bytesAtSlot = vm.load(address(proxy), 0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103);
      address admin = address(uint160(uint256(bytesAtSlot)));
      vm.prank(admin);
      proxy.upgradeTo(address(newImpl));
    }

    if (address(ffd.authoritiesRegistry()) == address(0)) {
      AuthoritiesRegistry impl = new AuthoritiesRegistry();
      TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(address(impl), address(1), "");
      AuthoritiesRegistry newAr = AuthoritiesRegistry(address(proxy));
      newAr.initialize(address(321));
      vm.prank(ffd.owner());
      ffd.reinitialize(newAr);
    }
  }

  function _prepareCTokenUpgrade(ICErc20 market) internal returns (address) {
    address implBefore = market.implementation();
    //emit log("implementation before");
    //emit log_address(implBefore);

    CErc20Delegate newImpl;
    if (market.delegateType() == 1) {
      newImpl = cErc20Delegate;
    } else if (market.delegateType() == 2) {
      newImpl = cErc20PluginDelegate;
    } else if (market.delegateType() == 3) {
      newImpl = cErc20RewardsDelegate;
    } else {
      newImpl = cErc20PluginRewardsDelegate;
    }

    // set the new ctoken delegate as the latest
    uint8 delegateType = market.delegateType();
    vm.prank(ffd.owner());
    ffd._setLatestCErc20Delegate(delegateType, address(newImpl), abi.encode(address(0)));

    // add the extension to the auto upgrade config
    DiamondExtension[] memory cErc20DelegateExtensions = new DiamondExtension[](2);
    cErc20DelegateExtensions[0] = DiamondExtension(newImpl);
    cErc20DelegateExtensions[1] = newCTokenExtension;
    vm.prank(ffd.owner());
    ffd._setCErc20DelegateExtensions(address(newImpl), cErc20DelegateExtensions);

    return address(newImpl);
  }

  function _upgradeMarket(ICErc20 market) internal {
    address newDelegate = _prepareCTokenUpgrade(market);

    bytes memory becomeImplData = (address(newDelegate) == address(cErc20Delegate))
      ? bytes("")
      : abi.encode(address(0));
    vm.prank(market.ionicAdmin());
    market._setImplementationSafe(newDelegate, becomeImplData);
  }

  function _prepareComptrollerUpgrade(address oldCompImpl) internal {
    vm.startPrank(ffd.owner());
    ffd._setLatestComptrollerImplementation(oldCompImpl, latestComptrollerImplementation);
    DiamondExtension[] memory extensions = new DiamondExtension[](2);
    extensions[0] = comptrollerExtension;
    extensions[1] = Comptroller(latestComptrollerImplementation);
    ffd._setComptrollerExtensions(latestComptrollerImplementation, extensions);
    vm.stopPrank();
  }

  function _upgradeExistingPool(address poolAddress) internal {
    Unitroller asUnitroller = Unitroller(payable(poolAddress));
    // change the implementation to the new that can add extensions
    address oldComptrollerImplementation = asUnitroller.comptrollerImplementation();

    _prepareComptrollerUpgrade(oldComptrollerImplementation);

    // upgrade to the new comptroller
    vm.startPrank(asUnitroller.admin());
    asUnitroller._upgrade();
    vm.stopPrank();
  }
}
