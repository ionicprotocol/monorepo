// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { BaseTest } from "../../config/BaseTest.t.sol";
import { UmbrellaPriceOracle } from "../../../oracles/default/UmbrellaPriceOracle.sol";
import { IRegistry } from "../../../external/umbrella/IRegistry.sol";
import { MasterPriceOracle } from "../../../oracles/MasterPriceOracle.sol";
import { BasePriceOracle } from "../../../oracles/BasePriceOracle.sol";

contract UmbrellaPriceOracleTest is BaseTest {
  UmbrellaPriceOracle private oracle;
  IRegistry public registry;
  MasterPriceOracle mpo;
  address stableToken;
  address otherToken;
  address wbtc;
  address wtoken;

  function afterForkSetUp() internal override {
    mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));
    stableToken = ap.getAddress("stableToken");
    wbtc = ap.getAddress("wBTCToken");
    wtoken = ap.getAddress("wtoken");
    oracle = new UmbrellaPriceOracle();

    if (block.chainid == LINEA_MAINNET) {
      registry = IRegistry(0x1B17DBB40fbED8735E7fE8C9eB02C20984fAdfD6);
    } else if (block.chainid == POLYGON_MAINNET) {
      registry = IRegistry(0x455acbbC2c15c086978083968a69B2e7E4d38d34);
    } else {
      revert("Unsupported chain");
    }
  }

  function setUpLinea() public {
    vm.prank(mpo.admin());
    oracle.initialize("ETH-USD", registry);

    address[] memory underlyings = new address[](3);
    string[] memory feeds = new string[](3);

    // USDT
    otherToken = 0x1990BC6dfe2ef605Bfc08f5A23564dB75642Ad73;

    underlyings[0] = stableToken;
    underlyings[1] = otherToken;
    underlyings[2] = wbtc;

    feeds[0] = "USDC-USD";
    feeds[1] = "USDT-USD";
    feeds[2] = "WBTC-USD";

    vm.prank(oracle.owner());
    oracle.setPriceFeeds(underlyings, feeds);

    BasePriceOracle[] memory oracles = new BasePriceOracle[](3);
    oracles[0] = oracle;
    oracles[1] = oracle;
    oracles[2] = oracle;

    vm.prank(mpo.admin());
    mpo.add(underlyings, oracles);
  }

  function testUmbrellaPriceOracleLinea() public fork(LINEA_MAINNET) {
    setUpLinea();
    vm.startPrank(address(mpo));
    uint256 upoUsdcPrice = oracle.price(stableToken);
    uint256 upoUsdtPrice = oracle.price(otherToken);
    uint256 upoWbtcPrice = oracle.price(wbtc);
    uint256 mpoWethPrice = mpo.price(wtoken);
    vm.stopPrank();

    assertApproxEqRel(upoUsdcPrice, upoUsdtPrice, 1e16);
    assertGt(upoWbtcPrice, mpoWethPrice);
    assertGt(mpoWethPrice, upoUsdcPrice);
  }
}
