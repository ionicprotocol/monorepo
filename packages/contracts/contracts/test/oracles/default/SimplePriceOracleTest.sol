// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { BaseTest } from "../../config/BaseTest.t.sol";
import { MasterPriceOracle } from "../../../oracles/MasterPriceOracle.sol";
import { SimplePriceOracle } from "../../../oracles/default/SimplePriceOracle.sol";
import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

contract SimplePriceOracleTest is BaseTest {
  SimplePriceOracle oracle;
  MasterPriceOracle mpo;
  address someAdminAccount = address(94949);

  function afterForkSetUp() internal override {
    mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));
    SimplePriceOracle impl = new SimplePriceOracle();

    vm.prank(someAdminAccount);
    TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(
      address(impl),
      address(dpa),
      abi.encodePacked(impl.initialize.selector)
    );
    oracle = SimplePriceOracle(address(proxy));
  }

  function testSimplePO() public fork(BSC_MAINNET) {
    vm.expectRevert("Ownable: caller is not the owner");
    oracle.setDirectPrice(address(1), 1);

    vm.prank(someAdminAccount);
    oracle.setDirectPrice(address(1), 1);
  }
}
