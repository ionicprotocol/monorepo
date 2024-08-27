// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { PoolDirectory } from "../PoolDirectory.sol";

import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

import { BaseTest } from "./config/BaseTest.t.sol";

contract PoolDirectoryTest is BaseTest {
  PoolDirectory fpd;

  function afterForkSetUp() internal override {
    address fpdAddress = ap.getAddress("PoolDirectory");
    fpd = PoolDirectory(fpdAddress);

    // upgrade to the current changes impl
    {
      PoolDirectory newImpl = new PoolDirectory();
      TransparentUpgradeableProxy proxy = TransparentUpgradeableProxy(payable(fpdAddress));
      bytes32 bytesAtSlot = vm.load(address(proxy), _ADMIN_SLOT);
      address admin = address(uint160(uint256(bytesAtSlot)));
      vm.prank(admin);
      proxy.upgradeTo(address(newImpl));
    }
  }

  function testDeprecatePool() public fork(BSC_MAINNET) {
    _testDeprecatePool();
  }

  function _testDeprecatePool() internal {
    PoolDirectory.Pool[] memory allPools = fpd.getAllPools();

    PoolDirectory.Pool memory poolToDeprecate;

    // BOMB pool https://app.midascapital.xyz/56/pool/0
    uint256 index = 0;

    poolToDeprecate = allPools[index];

    vm.prank(fpd.owner());
    fpd._deprecatePool(index);

    (, PoolDirectory.Pool[] memory allPoolsAfter) = fpd.getActivePools();

    bool poolStillThere = false;
    for (uint256 i = 0; i < allPoolsAfter.length; i++) {
      if (allPoolsAfter[i].comptroller == poolToDeprecate.comptroller) {
        poolStillThere = true;
        break;
      }
    }

    assertTrue(!poolStillThere, "deprecated pool is still there");
  }
}
