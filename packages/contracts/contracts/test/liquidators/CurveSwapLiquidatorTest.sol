// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { IERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import { ICurvePool } from "../../external/curve/ICurvePool.sol";
import { CurveSwapLiquidatorFunder } from "../../liquidators/CurveSwapLiquidatorFunder.sol";

import { CurveLpTokenPriceOracleNoRegistry } from "../../oracles/default/CurveLpTokenPriceOracleNoRegistry.sol";
import { CurveV2LpTokenPriceOracleNoRegistry } from "../../oracles/default/CurveV2LpTokenPriceOracleNoRegistry.sol";

import { BaseTest } from "../config/BaseTest.t.sol";

contract CurveSwapLiquidatorTest is BaseTest {
  CurveSwapLiquidatorFunder private csl;
  address private maiAddress = 0x3F56e0c36d275367b8C502090EDF38289b3dEa0d;
  address private val3EPSAddress = 0x5b5bD8913D766D005859CE002533D4838B0Ebbb5;

  address private lpTokenMai3EPS = 0x80D00D2c8d920a9253c3D65BA901250a55011b37;
  address private poolAddress = 0x68354c6E8Bbd020F9dE81EAf57ea5424ba9ef322;

  CurveLpTokenPriceOracleNoRegistry curveV1Oracle;
  CurveV2LpTokenPriceOracleNoRegistry curveV2Oracle;

  function afterForkSetUp() internal override {
    csl = new CurveSwapLiquidatorFunder();
    curveV1Oracle = CurveLpTokenPriceOracleNoRegistry(ap.getAddress("CurveLpTokenPriceOracleNoRegistry"));
    curveV2Oracle = CurveV2LpTokenPriceOracleNoRegistry(ap.getAddress("CurveV2LpTokenPriceOracleNoRegistry"));

    if (address(curveV1Oracle) == address(0)) {
      address[][] memory _poolUnderlyings = new address[][](1);
      _poolUnderlyings[0] = asArray(maiAddress, val3EPSAddress);
      curveV1Oracle = new CurveLpTokenPriceOracleNoRegistry();
      curveV1Oracle.initialize(asArray(lpTokenMai3EPS), asArray(poolAddress), _poolUnderlyings);
    }
  }

  // Curve pools need to be configured in the CurveV1 or CurveV2 oracles
  // We have not deployed CurveV2 oracle yet
  function testSwapCurveV1UsdtUsdc() public debuggingOnly fork(ARBITRUM_ONE) {
    address usdtAddress = 0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9;
    address usdcAddress = 0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8;
    address usdtWhale = 0xB38e8c17e38363aF6EbdCb3dAE12e0243582891D; // binance

    IERC20Upgradeable inputToken = IERC20Upgradeable(usdtAddress);
    uint256 inputAmount = 150e6;

    bytes memory data = abi.encode(curveV1Oracle, curveV2Oracle, usdtAddress, usdcAddress, ap.getAddress("wtoken"));

    vm.prank(usdtWhale);
    inputToken.transfer(address(csl), inputAmount);

    (IERC20Upgradeable outputToken, uint256 outputAmount) = csl.redeem(inputToken, inputAmount, data);

    assertEq(address(outputToken), usdcAddress, "output token does not match");
    assertApproxEqAbs(outputAmount, inputAmount, 1e5, "output amount does not match");
  }

  function testSwapCurveV2EspBnbxBnb() public fork(BSC_MAINNET) {
    address bnbxAddress = 0x1bdd3Cf7F79cfB8EdbB955f20ad99211551BA275;
    address wbnb = ap.getAddress("wtoken");
    address bnbxWhale = 0x4eE98B27eeF58844E460922eC9Da7C05D32F284A;

    IERC20Upgradeable inputToken = IERC20Upgradeable(bnbxAddress);
    uint256 inputAmount = 3e18;

    bytes memory data = abi.encode(curveV1Oracle, curveV2Oracle, bnbxAddress, wbnb, wbnb);

    vm.prank(bnbxWhale);
    inputToken.transfer(address(csl), inputAmount);

    (IERC20Upgradeable outputToken, uint256 outputAmount) = csl.redeem(inputToken, inputAmount, data);

    assertEq(address(outputToken), wbnb, "output token does not match");
    assertApproxEqRel(outputAmount, inputAmount, 8e16, "output amount does not match");
  }

  function testRedeemMAI() public fork(BSC_MAINNET) {
    ICurvePool curvePool = ICurvePool(poolAddress);

    assertEq(maiAddress, curvePool.coins(0), "coin 0 must be MAI");
    assertEq(val3EPSAddress, curvePool.coins(1), "coin 1 must be val3EPS");

    uint256 inputAmount = 1e10;

    uint256 maiForVal3EPS = curvePool.get_dy(0, 1, inputAmount);
    emit log_uint(maiForVal3EPS);

    dealMai(address(csl), inputAmount);

    bytes memory data = abi.encode(curveV1Oracle, address(0), maiAddress, val3EPSAddress, ap.getAddress("wtoken"));
    (IERC20Upgradeable shouldBeVal3EPS, uint256 outputAmount) = csl.redeem(
      IERC20Upgradeable(maiAddress),
      inputAmount,
      data
    );
    assertEq(address(shouldBeVal3EPS), val3EPSAddress, "output token does not match");

    assertEq(maiForVal3EPS, outputAmount, "output amount does not match");
  }

  function testEstimateInputAmount() public fork(BSC_MAINNET) {
    ICurvePool curvePool = ICurvePool(poolAddress);

    assertEq(maiAddress, curvePool.coins(0), "coin 0 must be MAI");
    assertEq(val3EPSAddress, curvePool.coins(1), "coin 1 must be val3EPS");

    bytes memory data = abi.encode(curveV1Oracle, address(0), maiAddress, val3EPSAddress, ap.getAddress("wtoken"));

    (IERC20Upgradeable inputToken, uint256 inputAmount) = csl.estimateInputAmount(2e10, data);

    emit log("input");
    emit log_uint(inputAmount);
    emit log_address(address(inputToken));
    uint256 shouldBeAround2e10 = curvePool.get_dy(1, 0, inputAmount);
    emit log("should be around 2e10");
    emit log_uint(shouldBeAround2e10);
    assertTrue(shouldBeAround2e10 >= 20e9 && shouldBeAround2e10 <= 23e9, "rough estimate didn't work");
  }

  function dealMai(address to, uint256 amount) internal {
    address whale = 0xc412eCccaa35621cFCbAdA4ce203e3Ef78c4114a; // anyswap
    vm.prank(whale);
    IERC20Upgradeable(maiAddress).transfer(to, amount);
  }
}
