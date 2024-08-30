// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { ICurveV2Pool } from "../../../external/curve/ICurveV2Pool.sol";
import { CurveV2LpTokenPriceOracleNoRegistry } from "../../../oracles/default/CurveV2LpTokenPriceOracleNoRegistry.sol";
import { MasterPriceOracle } from "../../../oracles/MasterPriceOracle.sol";
import { ICErc20 } from "../../../compound/CTokenInterfaces.sol";

import { BaseTest } from "../../config/BaseTest.t.sol";

contract CurveLpTokenPriceOracleNoRegistryTest is BaseTest {
  CurveV2LpTokenPriceOracleNoRegistry oracle;
  address busd;
  address epsJCHFBUSD_lp = 0x5887cEa5e2bb7dD36F0C06Da47A8Df918c289A29;
  address epsJCHFBUSD_pool = 0xBcA6E25937B0F7E0FD8130076b6B218F595E32e2;
  ICErc20 epsJCHFBUSD_c = ICErc20(0x1F0452D6a8bb9EAbC53Fa6809Fa0a060Dd531267);

  address epsBnbxBnb_lp = 0xFD4afeAc39DA03a05f61844095A75c4fB7D766DA;
  address epsBnbxBnb_pool = 0xFD4afeAc39DA03a05f61844095A75c4fB7D766DA;
  ICErc20 epsBnbxBnb_c = ICErc20(0xD96643Ba2Bf96e73509C4bb73c0cb259dAf34de1);
  MasterPriceOracle mpo;

  function afterForkSetUp() internal override {
    mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));
    busd = ap.getAddress("bUSD");

    address[] memory lpTokens = new address[](2);
    lpTokens[0] = epsJCHFBUSD_lp;
    lpTokens[1] = epsBnbxBnb_lp;

    address[] memory pools = new address[](2);
    pools[0] = epsJCHFBUSD_pool;
    pools[1] = epsBnbxBnb_pool;

    address[] memory baseTokens = new address[](2);
    baseTokens[0] = busd;
    baseTokens[1] = address(0);

    oracle = new CurveV2LpTokenPriceOracleNoRegistry();
    oracle.initialize(lpTokens, pools);
  }

  function testCurveV2LpTokenPriceOracleCHFBUSD() public forkAtBlock(BSC_MAINNET, 21675481) {
    ICurveV2Pool pool = ICurveV2Pool(epsJCHFBUSD_pool);
    vm.prank(address(mpo));
    uint256 lp_price = (pool.lp_price() * mpo.price(busd)) / 10**18;
    vm.startPrank(address(mpo));
    uint256 price = oracle.price(epsJCHFBUSD_lp);
    uint256 ulPrice = oracle.getUnderlyingPrice(epsJCHFBUSD_c);
    assertEq(price, ulPrice);
    assertEq(price, lp_price);
    assertEq(price, 7319017681980243);
    vm.stopPrank();
  }

  function testCurveV2LpTokenPriceOracleBNBXBNB() public forkAtBlock(BSC_MAINNET, 24036448) {
    ICurveV2Pool pool = ICurveV2Pool(epsBnbxBnb_pool);
    vm.startPrank(address(mpo));
    // coins(0) is BNBx
    uint256 lp_price = (pool.lp_price() * mpo.price(0x1bdd3Cf7F79cfB8EdbB955f20ad99211551BA275)) / 10**18;
    uint256 price = oracle.price(epsBnbxBnb_lp);

    // TODO: add these when the oracle is added
    // uint256 ulPrice = oracle.getUnderlyingPrice(epsBnbxBnb_c);
    // assertEq(price, ulPrice);
    assertEq(price, lp_price);
    assertEq(price, 2058628564849750905);
    vm.stopPrank();
  }
}
