// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { IRedemptionStrategy } from "../../liquidators/IRedemptionStrategy.sol";
import { BalancerLpTokenLiquidator } from "../../liquidators/BalancerLpTokenLiquidator.sol";
import { BalancerSwapLiquidator } from "../../liquidators/BalancerSwapLiquidator.sol";

import { ICErc20Compound as ICErc20 } from "../../external/compound/ICErc20.sol";
import "../../external/balancer/IBalancerPool.sol";
import "../../external/balancer/IBalancerVault.sol";

import { IERC20Upgradeable } from "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

import { BaseTest } from "../config/BaseTest.t.sol";

contract BalancerLpTokenLiquidatorTest is BaseTest {
  BalancerLpTokenLiquidator private lpTokenLiquidator;
  BalancerSwapLiquidator private swapLiquidator;
  address stable;
  address wtoken;

  function afterForkSetUp() internal override {
    lpTokenLiquidator = new BalancerLpTokenLiquidator();
    swapLiquidator = new BalancerSwapLiquidator();
    stable = ap.getAddress("stableToken");
    wtoken = ap.getAddress("wtoken");
  }

  function testRedeemLpToken(address whaleAddress, address inputTokenAddress, address outputTokenAddress) internal {
    return testBalancerLpTokenLiquidator(lpTokenLiquidator, 1e18, whaleAddress, inputTokenAddress, outputTokenAddress);
  }

  function testBalancerLpTokenLiquidator(
    IRedemptionStrategy liquidator,
    uint256 amount,
    address whaleAddress,
    address inputTokenAddress,
    address outputTokenAddress
  ) internal {
    IERC20Upgradeable inputToken = IERC20Upgradeable(inputTokenAddress);
    IERC20Upgradeable outputToken = IERC20Upgradeable(outputTokenAddress);

    vm.prank(whaleAddress);
    inputToken.transfer(address(liquidator), amount);

    uint256 balanceBefore = outputToken.balanceOf(address(liquidator));

    bytes memory data = abi.encode(address(outputToken));
    liquidator.redeem(inputToken, amount, data);

    uint256 balanceAfter = outputToken.balanceOf(address(liquidator));

    assertGt(balanceAfter - balanceBefore, 0, "!redeem input token");
  }

  function testBalancerSwapLiquidator(
    uint256 amount,
    address whaleAddress,
    address inputTokenAddress,
    address outputTokenAddress,
    address pool
  ) internal {
    IERC20Upgradeable inputToken = IERC20Upgradeable(inputTokenAddress);
    IERC20Upgradeable outputToken = IERC20Upgradeable(outputTokenAddress);

    vm.prank(whaleAddress);
    inputToken.transfer(address(swapLiquidator), amount);

    uint256 balanceBefore = outputToken.balanceOf(address(swapLiquidator));

    bytes memory data = abi.encode(outputTokenAddress, pool);
    swapLiquidator.redeem(inputToken, amount, data);

    uint256 balanceAfter = outputToken.balanceOf(address(swapLiquidator));

    assertGt(balanceAfter - balanceBefore, 0, "!swap input token");
  }

  function testMimoParBalancerLpLiquidatorRedeem() public fork(POLYGON_MAINNET) {
    address lpToken = 0x82d7f08026e21c7713CfAd1071df7C8271B17Eae; //MIMO-PAR 8020
    address lpTokenWhale = 0xbB60ADbe38B4e6ab7fb0f9546C2C1b665B86af11;
    address outputTokenAddress = 0xE2Aa7db6dA1dAE97C5f5C6914d285fBfCC32A128; // PAR

    testRedeemLpToken(lpTokenWhale, lpToken, outputTokenAddress);
  }

  function testWmaticStmaticLPLiquidatorRedeem() public fork(POLYGON_MAINNET) {
    address lpToken = 0x8159462d255C1D24915CB51ec361F700174cD994; // stMATIC-WMATIC stable
    address lpTokenWhale = 0xBA12222222228d8Ba445958a75a0704d566BF2C8; // Balancer V2
    address outputTokenAddress = 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270; // WMATIC

    testRedeemLpToken(lpTokenWhale, lpToken, outputTokenAddress);
  }

  function testWmaticMaticXLPLiquidatorRedeem() public fork(POLYGON_MAINNET) {
    address lpToken = 0xC17636e36398602dd37Bb5d1B3a9008c7629005f; // WMATIC-MaticX stable
    address lpTokenWhale = 0x48534d027f8962692122dB440714fFE88Ab1fA85;
    address outputTokenAddress = 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270; // WMATIC

    testRedeemLpToken(lpTokenWhale, lpToken, outputTokenAddress);
  }

  function testJbrlBrzLiquidatorRedeem() public fork(POLYGON_MAINNET) {
    address lpToken = 0xE22483774bd8611bE2Ad2F4194078DaC9159F4bA; // jBRL-BRZ stable
    address lpTokenWhale = 0xBA12222222228d8Ba445958a75a0704d566BF2C8; // Balancer V2
    address outputTokenAddress = 0xf2f77FE7b8e66571E0fca7104c4d670BF1C8d722; // jBRL

    testRedeemLpToken(lpTokenWhale, lpToken, outputTokenAddress);
  }

  function testBoostedAaveRedeem() public fork(POLYGON_MAINNET) {
    address inputToken = 0x48e6B98ef6329f8f0A30eBB8c7C960330d648085; // bb-am-USD
    address lpTokenWhale = 0xBA12222222228d8Ba445958a75a0704d566BF2C8; // Balancer V2
    address outputTokenAddress = 0xF93579002DBE8046c43FEfE86ec78b1112247BB8; // linear aaver usdc
    testRedeemLpToken(lpTokenWhale, inputToken, outputTokenAddress);
  }

  function testWmaticStmaticLiquidatorRedeem() public fork(POLYGON_MAINNET) {
    address inputToken = 0x8159462d255C1D24915CB51ec361F700174cD994; // Balancer stMATIC Stable Pool
    address lpTokenWhale = 0xBA12222222228d8Ba445958a75a0704d566BF2C8; // Balancer Gauge
    address outputTokenAddress = wtoken;
    testRedeemLpToken(lpTokenWhale, inputToken, outputTokenAddress);
  }

  function testBoostedAaaveWmaticMaticXRedeem() public fork(POLYGON_MAINNET) {
    address inputToken = 0xE78b25c06dB117fdF8F98583CDaaa6c92B79E917; // Balancer MaticX Boosted Aave WMATIC StablePool
    address lpTokenWhale = 0xBA12222222228d8Ba445958a75a0704d566BF2C8; // Balancer Gauge
    address outputTokenAddress = 0xE4885Ed2818Cc9E840A25f94F9b2A28169D1AEA7; // aave-linear-wmatic
    testRedeemLpToken(lpTokenWhale, inputToken, outputTokenAddress);
  }

  function testLinearAaaveWmaticRedeem() public fork(POLYGON_MAINNET) {
    uint256 amount = 1e18;
    address inputToken = 0xE4885Ed2818Cc9E840A25f94F9b2A28169D1AEA7; // aave-linear-wmatic
    address lpTokenWhale = 0xBA12222222228d8Ba445958a75a0704d566BF2C8; // Balancer Gauge
    address outputTokenAddress = wtoken;
    address pool = inputToken; // use own for swap
    testBalancerSwapLiquidator(amount, lpTokenWhale, inputToken, outputTokenAddress, pool);
  }

  function testLinearAaveUsdcRedeem() public fork(POLYGON_MAINNET) {
    uint256 amount = 1e18;
    address inputToken = 0xF93579002DBE8046c43FEfE86ec78b1112247BB8; // bb-am-USD
    address lpTokenWhale = 0xBA12222222228d8Ba445958a75a0704d566BF2C8; // Balancer Gauge
    address outputTokenAddress = stable; // usdc
    address pool = inputToken; // use own for swap
    testBalancerSwapLiquidator(amount, lpTokenWhale, inputToken, outputTokenAddress, pool);
  }

  function testSwapWmaticStMatic() public fork(POLYGON_MAINNET) {
    uint256 amount = 1000e18;
    address pool = 0x8159462d255C1D24915CB51ec361F700174cD994; // wmatic-stmatic
    address inputToken = 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270; // wmatic
    address inputTokenWhale = 0x6d80113e533a2C0fe82EaBD35f1875DcEA89Ea97; // aave wmatic
    address outputToken = 0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4; // stmatic

    testBalancerSwapLiquidator(amount, inputTokenWhale, inputToken, outputToken, pool);
  }
}
