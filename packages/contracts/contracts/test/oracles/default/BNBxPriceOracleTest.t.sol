// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { BaseTest } from "../../config/BaseTest.t.sol";
import { BNBxPriceOracle } from "../../../oracles/default/BNBxPriceOracle.sol";

contract BNBxPriceOracleTest is BaseTest {
  BNBxPriceOracle private oracle;
  address BNBx = 0x1bdd3Cf7F79cfB8EdbB955f20ad99211551BA275;

  function afterForkSetUp() internal override {
    oracle = new BNBxPriceOracle();
    oracle.initialize();
  }

  function testBnbXOraclePrice() public forkAtBlock(BSC_MAINNET, 22332594) {
    uint256 priceBnbX = oracle.price(BNBx);
    assertGt(priceBnbX, 1e18);
    assertEq(priceBnbX, 1041708576933034575);
  }
}
