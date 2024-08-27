// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { BaseTest } from "../../config/BaseTest.t.sol";
import { WSTEthPriceOracle } from "../../../oracles/default/WSTEthPriceOracle.sol";

contract WSTEthPriceOracleTest is BaseTest {
  WSTEthPriceOracle private oracle;
  address wstETH = 0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0;
  address mpo = 0xdD8d4e09Acb39C2B4DE9A84384389B79850f3271;

  function afterForkSetUp() internal override {
    oracle = new WSTEthPriceOracle();
    oracle.initialize();
  }

  function testWstEthOraclePrice() public forkAtBlock(ETHEREUM_MAINNET, 17469681) {
    vm.prank(mpo);
    uint256 priceWstEth = oracle.price(wstETH);

    assertGt(priceWstEth, 1e18);
    assertEq(priceWstEth, 1006482474298479702);
  }
}
