// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { ICurveV2Pool } from "../../../external/curve/ICurveV2Pool.sol";
import { CurveV2PriceOracle } from "../../../oracles/default/CurveV2PriceOracle.sol";
import { MasterPriceOracle } from "../../../oracles/MasterPriceOracle.sol";

import { BaseTest } from "../../config/BaseTest.t.sol";

contract CurveV2PriceOracleTest is BaseTest {
  CurveV2PriceOracle oracle;
  address busd;
  address wbtc;

  address Bnbx = 0x1bdd3Cf7F79cfB8EdbB955f20ad99211551BA275;
  address epsBnbxBnb_pool = 0xFD4afeAc39DA03a05f61844095A75c4fB7D766DA;
  address epsBusdBtc_pool = 0xeF8A7e653F18CFD4b92a0f5b644393A4C635f19f;

  address eusd = 0x97de57eC338AB5d51557DA3434828C5DbFaDA371; // 18 decimals
  address usdc = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; // 6 decimals
  uint256 usdcPriceEth = 0.00057716e18;
  address usdcEusdPool = 0x880F2fB3704f1875361DE6ee59629c6c6497a5E3;

  MasterPriceOracle mpo;

  function afterForkSetUp() internal override {
    address[] memory tokens;
    address[] memory pools;

    if (block.chainid == ETHEREUM_MAINNET) {
      tokens = new address[](1);
      tokens[0] = eusd;

      pools = new address[](1);
      pools[0] = usdcEusdPool;
    } else {
      mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));
      busd = ap.getAddress("bUSD");
      wbtc = ap.getAddress("wBTCToken");

      tokens = new address[](3);
      tokens[0] = Bnbx;
      tokens[1] = wbtc;
      tokens[2] = busd;

      pools = new address[](3);
      pools[0] = epsBnbxBnb_pool;
      pools[1] = epsBusdBtc_pool;
      pools[2] = epsBusdBtc_pool;
    }

    oracle = new CurveV2PriceOracle();
    oracle.initialize(tokens, pools);
  }

  function testCurveV2PriceOracleBNBxBNB() public fork(BSC_MAINNET) {
    vm.prank(address(mpo));
    uint256 bnbx_mpo_price = mpo.price(Bnbx);
    vm.startPrank(address(mpo));
    uint256 priceBnbx = oracle.price(Bnbx);
    assertApproxEqRel(bnbx_mpo_price, priceBnbx, 1e16); // 1%
    vm.stopPrank();
  }

  function testCurveV2PriceOracleWbtcBNB() public fork(BSC_MAINNET) {
    vm.prank(address(mpo));
    uint256 wbtc_mpo_price = mpo.price(wbtc);
    uint256 busd_mpo_price = mpo.price(busd);
    vm.startPrank(address(mpo));
    uint256 priceWbtc = oracle.price(wbtc);
    uint256 priceBusd = oracle.price(busd);
    assertApproxEqRel(wbtc_mpo_price, priceWbtc, 1e16); // 1%
    assertApproxEqRel(busd_mpo_price, priceBusd, 1e16); // 1%
    vm.stopPrank();
  }

  function testCurveV2PriceOracleEUsdUsdc() public fork(ETHEREUM_MAINNET) {
    // TODO use the MPO when deployed
    // testing the decimals scaling, eusd has 18, usdc has 6 decimals
    uint256 priceEusd = oracle.price(eusd);
    assertApproxEqRel(usdcPriceEth, priceEusd, 1e17); // 10%
  }

  function price(address asset) public view returns (uint256) {
    if (asset == usdc) return usdcPriceEth;
    else return 0;
  }
}
