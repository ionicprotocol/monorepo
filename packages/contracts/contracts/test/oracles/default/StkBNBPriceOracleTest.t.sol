// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { BaseTest } from "../../config/BaseTest.t.sol";
import { StkBNBPriceOracle } from "../../../oracles/default/StkBNBPriceOracle.sol";

contract StkBNBPriceOracleTest is BaseTest {
  StkBNBPriceOracle private oracle;
  address stkBnb = 0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16;

  function afterForkSetUp() internal override {
    oracle = new StkBNBPriceOracle();
    oracle.initialize();
  }

  function testStkBnbOraclePrice() public forkAtBlock(BSC_MAINNET, 21952914) {
    uint256 priceStkBnb = oracle.price(stkBnb);

    assertGt(priceStkBnb, 1e18);
    assertEq(priceStkBnb, 1006482474298479702);
  }
}
