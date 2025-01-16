// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { IERC20Upgradeable } from "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import { CurveLpTokenLiquidatorNoRegistry, CurveLpTokenWrapper } from "../../liquidators/CurveLpTokenLiquidatorNoRegistry.sol";
import { CurveLpTokenPriceOracleNoRegistry } from "../../oracles/default/CurveLpTokenPriceOracleNoRegistry.sol";
import { CurveV2LpTokenPriceOracleNoRegistry } from "../../oracles/default/CurveV2LpTokenPriceOracleNoRegistry.sol";

import { BaseTest } from "../config/BaseTest.t.sol";

contract CurveLpTokenLiquidatorNoRegistryTest is BaseTest {
  CurveLpTokenLiquidatorNoRegistry private liquidator;

  IERC20Upgradeable twobrl = IERC20Upgradeable(0x1B6E11c5DB9B15DE87714eA9934a6c52371CfEA9);
  IERC20Upgradeable lpToken3Eps = IERC20Upgradeable(0xaF4dE8E872131AE328Ce21D909C74705d3Aaf452);

  address pool3Eps = 0x160CAed03795365F3A589f10C379FfA7d75d4E76;
  address pool2Brl = 0xad51e40D8f255dba1Ad08501D6B1a6ACb7C188f3;

  CurveLpTokenPriceOracleNoRegistry curveV1Oracle;
  CurveV2LpTokenPriceOracleNoRegistry curveV2Oracle;

  IERC20Upgradeable bUSD;
  address wtoken;

  function afterForkSetUp() internal override {
    wtoken = ap.getAddress("wtoken");
    liquidator = new CurveLpTokenLiquidatorNoRegistry();
    bUSD = IERC20Upgradeable(ap.getAddress("bUSD"));
    curveV1Oracle = CurveLpTokenPriceOracleNoRegistry(ap.getAddress("CurveLpTokenPriceOracleNoRegistry"));
    curveV2Oracle = CurveV2LpTokenPriceOracleNoRegistry(ap.getAddress("CurveV2LpTokenPriceOracleNoRegistry"));
  }

  function testRedeemToken() public fork(BSC_MAINNET) {
    address lpTokenWhale = 0x8D7408C2b3154F9f97fc6dd24cd36143908d1E52;
    vm.prank(lpTokenWhale);
    lpToken3Eps.transfer(address(liquidator), 1234);

    bytes memory data = abi.encode(bUSD, wtoken, curveV1Oracle);
    (IERC20Upgradeable outputToken, uint256 outputAmount) = liquidator.redeem(lpToken3Eps, 1234, data);

    assertEq(address(outputToken), address(bUSD), "!outputToken");
    assertGt(outputAmount, 0, "!outputAmount>0");
    assertEq(outputToken.balanceOf(address(liquidator)), outputAmount, "!outputAmount");
  }

  function testRedeem2Brl() public fork(BSC_MAINNET) {
    address jbrl = 0x316622977073BBC3dF32E7d2A9B3c77596a0a603;
    address whale2brl = 0x6219b46d6a5B5BfB4Ec433a9F96DB3BF4076AEE1;
    vm.prank(whale2brl);
    twobrl.transfer(address(liquidator), 123456);

    address poolOf2Brl = curveV1Oracle.poolOf(address(twobrl)); // 0xad51e40D8f255dba1Ad08501D6B1a6ACb7C188f3

    require(poolOf2Brl != address(0), "could not find the pool for 2brl");

    bytes memory data = abi.encode(jbrl, wtoken, curveV1Oracle);
    (IERC20Upgradeable outputToken, uint256 outputAmount) = liquidator.redeem(twobrl, 123456, data);
    assertEq(address(outputToken), jbrl);
    assertGt(outputAmount, 0);
    assertEq(outputToken.balanceOf(address(liquidator)), outputAmount);
  }

  address maiAddress = 0xa3Fa99A148fA48D14Ed51d610c367C61876997F1;
  address whaleMai = 0xC63c477465a792537D291ADb32Ed15c0095E106B;
  address whaleMai3Crv = 0x96c62EC93c552b60d2a7F0801313A29E4B8feecE;
  address mai3Crv = 0x447646e84498552e62eCF097Cc305eaBFFF09308;
  IERC20Upgradeable mai3CrvToken = IERC20Upgradeable(mai3Crv);

  // Not set up / deployed
  // function testRedeemMai3Crv() public fork(POLYGON_MAINNET) {
  //   vm.prank(whaleMai3Crv);
  //   mai3Crv.transfer(address(liquidator), 1.23456e18);

  //   bytes memory data = abi.encode(maiAddress, wtoken, curveV1Oracle);
  //   (IERC20Upgradeable outputToken, uint256 outputAmount) = liquidator.redeem(mai3Crv, 1.23456e18, data);
  //   assertEq(address(outputToken), maiAddress);
  //   assertGt(outputAmount, 0);
  //   assertEq(outputToken.balanceOf(address(liquidator)), outputAmount);
  // }

  function testCurveLpTokenWrapper() public fork(POLYGON_MAINNET) {
    IERC20Upgradeable mai = IERC20Upgradeable(maiAddress);
    CurveLpTokenWrapper wrapper = new CurveLpTokenWrapper();
    vm.prank(whaleMai);
    mai.transfer(address(wrapper), 1e18);

    wrapper.redeem(mai, 1e18, abi.encode(mai3Crv, mai3Crv));

    assertGt(mai3CrvToken.balanceOf(address(wrapper)), 0, "!wrapped");
    assertEq(mai.balanceOf(address(wrapper)), 0, "!unused mai");
  }

  function test3CrvWrapMai3Crv() public fork(POLYGON_MAINNET) {
    address threeCrvWhale = 0x7117de93b352AE048925323F3fCb1Cd4b4d52eC4;
    address threeCrvAddress = 0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171;

    IERC20Upgradeable threeCrv = IERC20Upgradeable(threeCrvAddress);

    CurveLpTokenWrapper wrapper = new CurveLpTokenWrapper();
    vm.prank(threeCrvWhale);
    threeCrv.transfer(address(wrapper), 1e18);

    wrapper.redeem(threeCrv, 1e18, abi.encode(mai3Crv, mai3Crv)); // pool = token

    assertGt(mai3CrvToken.balanceOf(address(wrapper)), 0, "!wrapped");
    assertEq(threeCrv.balanceOf(address(wrapper)), 0, "!unused 3Crv");
  }
}
