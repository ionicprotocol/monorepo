// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import { ProxyAdmin } from "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

import "../ionic/strategies/flywheel/IonicFlywheel.sol";

import "./config/BaseTest.t.sol";

contract SecondDevTesting is BaseTest {
  address flywheelProxy = 0x1A118B250ED0Ba690f03877AC46519A4b66f1D44;

  function test_upgradeFlywheel() public debuggingOnly fork(MODE_MAINNET) {
    IonicFlywheel flywheelLogic = new IonicFlywheel();

    TransparentUpgradeableProxy proxy = TransparentUpgradeableProxy(payable(flywheelProxy));

    dpa = ProxyAdmin(0xaF9cc7599DEFd86226e0f3A6810c4976E4a10f83);

    address dpaOwner = dpa.owner();
    vm.prank(dpaOwner);
    dpa.upgrade(proxy, address(flywheelLogic));
  }

  function test_proxyAdmin() public debuggingOnly fork(MODE_MAINNET) {
    TransparentUpgradeableProxy proxy = TransparentUpgradeableProxy(payable(0xa80ff99c82d55dFE893867E25C5c77276DFb23C5));
    bytes32 bytesAtSlot = vm.load(address(proxy), _ADMIN_SLOT);
    address admin = address(uint160(uint256(bytesAtSlot)));
    emit log_named_address("admin from slot", admin);
  }
}
