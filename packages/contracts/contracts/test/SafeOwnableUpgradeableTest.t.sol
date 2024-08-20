// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { BaseTest } from "./config/BaseTest.t.sol";

import { SafeOwnableUpgradeable } from "../ionic/SafeOwnableUpgradeable.sol";
import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

contract SomeOwnable is SafeOwnableUpgradeable {
  function initialize() public initializer {
    __SafeOwnable_init(msg.sender);
  }
}

contract SafeOwnableUpgradeableTest is BaseTest {
  function testSafeOwnableUpgradeable() public {
    SomeOwnable someOwnable = new SomeOwnable();
    // deploy as a proxy/implementation
    {
      TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(
        address(someOwnable),
        address(dpa),
        abi.encodeWithSelector(someOwnable.initialize.selector)
      );
      someOwnable = SomeOwnable(address(proxy));
    }

    address joe = address(1234);

    address initOwner = someOwnable.owner();
    assertEq(initOwner, address(this), "owner init value");

    someOwnable._setPendingOwner(joe);

    address currentOwner = someOwnable.owner();
    assertEq(currentOwner, address(this), "owner should not change yet");

    vm.prank(joe);
    someOwnable._acceptOwner();

    address ownerAfter = someOwnable.owner();

    assertEq(ownerAfter, joe, "ownership transfer failed");
  }
}
