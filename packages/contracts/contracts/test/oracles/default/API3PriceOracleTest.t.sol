// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { BaseTest } from "../../config/BaseTest.t.sol";
import { API3PriceOracle } from "../../../oracles/default/API3PriceOracle.sol";
import { IProxy } from "../../../external/api3/IProxy.sol";
import { MasterPriceOracle } from "../../../oracles/MasterPriceOracle.sol";
import { BasePriceOracle } from "../../../oracles/BasePriceOracle.sol";

contract API3PriceOracleTest is BaseTest {
  API3PriceOracle private oracle;
  MasterPriceOracle mpo;
  address stableToken;
  address otherToken;
  address anotherToken;
  address wbtc;
  address wtoken;
  address NATIVE_TOKEN_USD_PRICE_FEED;

  function afterForkSetUp() internal override {
    mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));
    stableToken = ap.getAddress("stableToken");
    wbtc = ap.getAddress("wBTCToken");
    wtoken = ap.getAddress("wtoken");
    oracle = new API3PriceOracle();
    if (block.chainid == ZKEVM_MAINNET) {
      // ETH-USD
      NATIVE_TOKEN_USD_PRICE_FEED = 0x26690F9f17FdC26D419371315bc17950a0FC90eD;
    } else {
      revert("Unsupported chain");
    }
  }

  function setUpZkEvm() public {
    vm.prank(mpo.admin());
    oracle.initialize(stableToken, NATIVE_TOKEN_USD_PRICE_FEED);

    address[] memory underlyings = new address[](4);
    address[] memory proxies = new address[](4);

    // USDT
    otherToken = 0x1E4a5963aBFD975d8c9021ce480b42188849D41d;
    // WMATIC
    anotherToken = 0xa2036f0538221a77A3937F1379699f44945018d0;

    underlyings[0] = stableToken;
    underlyings[1] = otherToken;
    underlyings[2] = anotherToken;
    underlyings[3] = wbtc;

    proxies[0] = 0x8DF7d919Fe9e866259BB4D135922c5Bd96AF6A27;
    proxies[1] = 0xF63Fa6EA00678F435Ae3e845541EBb2Db0a1e8fF;
    proxies[2] = 0xF63Fa6EA00678F435Ae3e845541EBb2Db0a1e8fF;
    proxies[3] = 0xe5Cf15fED24942E656dBF75165aF1851C89F21B5;

    vm.prank(oracle.owner());
    oracle.setPriceFeeds(underlyings, proxies);

    BasePriceOracle[] memory oracles = new BasePriceOracle[](4);
    oracles[0] = oracle;
    oracles[1] = oracle;
    oracles[2] = oracle;
    oracles[3] = oracle;

    vm.prank(mpo.admin());
    mpo.add(underlyings, oracles);
  }

  function testAPI3PriceOracleZkEvm() public fork(ZKEVM_MAINNET) {
    setUpZkEvm();
    vm.startPrank(address(mpo));
    uint256 api3UsdcPrice = oracle.price(stableToken);
    uint256 api3UsdtPrice = oracle.price(otherToken);
    uint256 api3WmaticPrice = oracle.price(anotherToken);
    uint256 api3WbtcPrice = oracle.price(wbtc);
    uint256 mpoWethPrice = mpo.price(wtoken);
    vm.stopPrank();

    assertApproxEqRel(api3UsdcPrice, api3UsdtPrice, 1e16);

    assertGt(api3UsdcPrice, api3WmaticPrice);
    assertGt(api3WbtcPrice, mpoWethPrice);
    assertGt(mpoWethPrice, api3UsdcPrice);
  }
}
