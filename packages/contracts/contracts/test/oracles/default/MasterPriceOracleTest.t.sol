// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { BaseTest } from "../../config/BaseTest.t.sol";
import { MasterPriceOracle } from "../../../oracles/MasterPriceOracle.sol";
import { BasePriceOracle } from "../../../oracles/BasePriceOracle.sol";
import { ICErc20 } from "../../../compound/CTokenInterfaces.sol";
import { SimplePriceOracle } from "../../../oracles/default/SimplePriceOracle.sol";
import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import { MockRevertPriceOracle } from "../../../oracles/1337/MockRevertPriceOracle.sol";

contract MasterPriceOracleTest is BaseTest {
  MasterPriceOracle mpo;
  SimplePriceOracle mainOracle;
  SimplePriceOracle fallbackOracle;
  MockRevertPriceOracle revertingOracle;
  ICErc20 mockCToken;
  address someAdminAccount = address(94949);
  address ezETH = 0x2416092f143378750bb29b79eD961ab195CcEea5;
  address ionezETH = 0x59e710215d45F584f44c0FEe83DA6d43D762D857;

  function afterForkSetUp() internal override {
    MasterPriceOracle newMpo = new MasterPriceOracle();
    SimplePriceOracle defaultOracle = new SimplePriceOracle();

    address[] memory underlyings = new address[](0);
    BasePriceOracle[] memory oracles = new BasePriceOracle[](0);

    vm.prank(someAdminAccount);
    newMpo.initialize(underlyings, oracles, defaultOracle, someAdminAccount, true, address(0));

    mpo = newMpo;

    SimplePriceOracle impl = new SimplePriceOracle();
    vm.prank(address(someAdminAccount));
    TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(
      address(impl),
      address(dpa),
      abi.encodePacked(impl.initialize.selector)
    );
    mainOracle = SimplePriceOracle(address(proxy));

    SimplePriceOracle fallbackImpl = new SimplePriceOracle();
    vm.prank(address(someAdminAccount));
    TransparentUpgradeableProxy fallbackProxy = new TransparentUpgradeableProxy(
      address(fallbackImpl),
      address(dpa),
      abi.encodePacked(impl.initialize.selector)
    );
    fallbackOracle = SimplePriceOracle(address(fallbackProxy));

    vm.startPrank(someAdminAccount);
    mainOracle.setDirectPrice(ezETH, 2000);
    fallbackOracle.setDirectPrice(ezETH, 2000);
    vm.stopPrank();

    address[] memory tokens = new address[](1);
    tokens[0] = ezETH;

    BasePriceOracle[] memory oraclesToAdd = new BasePriceOracle[](1);
    oraclesToAdd[0] = BasePriceOracle(mainOracle);
    BasePriceOracle[] memory fallbackOraclesToAdd = new BasePriceOracle[](1);
    fallbackOraclesToAdd[0] = BasePriceOracle(fallbackOracle);

    vm.startPrank(someAdminAccount);
    mpo.add(tokens, oraclesToAdd);
    mpo.addFallbacks(tokens, fallbackOraclesToAdd);
    vm.stopPrank();

    revertingOracle = new MockRevertPriceOracle();
  }

  function testGetUnderlyingPrice() public fork(MODE_MAINNET) {
    vm.prank(someAdminAccount);
    uint256 price = mpo.getUnderlyingPrice(ICErc20(ionezETH));
    assertEq(price, 2000, "Price should match the mock price");
  }

  function testGetUnderlyingPriceWhenZero() public fork(MODE_MAINNET) {
    vm.prank(someAdminAccount);
    mainOracle.setDirectPrice(ezETH, 0);
    uint256 price = mpo.getUnderlyingPrice(ICErc20(ionezETH));
    assertEq(price, 2000, "Price should match the mock price");
  }

  function testGetUnderlyingPriceWhenZeroAddressOracle() public fork(MODE_MAINNET) {
    address[] memory tokens = new address[](1);
    tokens[0] = ezETH;

    BasePriceOracle[] memory oraclesToAdd = new BasePriceOracle[](1);
    oraclesToAdd[0] = BasePriceOracle(0x0000000000000000000000000000000000000000);

    vm.prank(someAdminAccount);
    mpo.add(tokens, oraclesToAdd);

    uint256 price = mpo.getUnderlyingPrice(ICErc20(ionezETH));
    assertEq(price, 2000, "Price should match the mock price");
  }

  function testGetUnderlyingPriceWhenOracleReverts() public fork(MODE_MAINNET) {
    address[] memory tokens = new address[](1);
    tokens[0] = ezETH;

    BasePriceOracle[] memory oraclesToAdd = new BasePriceOracle[](1);
    oraclesToAdd[0] = BasePriceOracle(revertingOracle);

    vm.prank(someAdminAccount);
    mpo.add(tokens, oraclesToAdd);

    uint256 price = mpo.getUnderlyingPrice(ICErc20(ionezETH));
    assertEq(price, 2000, "Price should match the mock price");
  }

  function testPrice() public fork(MODE_MAINNET) {
    vm.prank(someAdminAccount);
    uint256 price = mpo.price(ezETH);
    assertEq(price, 2000, "Price should match the mock price");
  }

  function testPriceWhenZero() public fork(MODE_MAINNET) {
    vm.prank(someAdminAccount);
    mainOracle.setDirectPrice(ezETH, 0);
    uint256 price = mpo.price(ezETH);
    assertEq(price, 2000, "Price should match the mock price");
  }

  function testPriceWhenZeroAddressOracle() public fork(MODE_MAINNET) {
    address[] memory tokens = new address[](1);
    tokens[0] = ezETH;

    BasePriceOracle[] memory oraclesToAdd = new BasePriceOracle[](1);
    oraclesToAdd[0] = BasePriceOracle(0x0000000000000000000000000000000000000000);

    vm.prank(someAdminAccount);
    mpo.add(tokens, oraclesToAdd);

    uint256 price = mpo.price(ezETH);
    assertEq(price, 2000, "Price should match the mock price");
  }

  function testPriceWhenOracleReverts() public fork(MODE_MAINNET) {
    address[] memory tokens = new address[](1);
    tokens[0] = ezETH;

    BasePriceOracle[] memory oraclesToAdd = new BasePriceOracle[](1);
    oraclesToAdd[0] = BasePriceOracle(revertingOracle);

    vm.prank(someAdminAccount);
    mpo.add(tokens, oraclesToAdd);

    uint256 price = mpo.price(ezETH);
    assertEq(price, 2000, "Price should match the mock price");
  }
}
