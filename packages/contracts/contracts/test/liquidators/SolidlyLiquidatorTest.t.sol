// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { BaseTest } from "../config/BaseTest.t.sol";
import { MasterPriceOracle } from "../../oracles/MasterPriceOracle.sol";
import "../../liquidators/SolidlySwapLiquidator.sol";

contract SolidlyLiquidatorTest is BaseTest {
  SolidlySwapLiquidator public liquidator;
  MasterPriceOracle public mpo;
  address stableToken;
  address solidlySwapRouter;
  address hayAddress = 0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5;
  address ankrAddress = 0xf307910A4c7bbc79691fD374889b36d8531B08e3;
  address ankrBnbAddress = 0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827;
  uint256 inputAmount = 1e18;

  function afterForkSetUp() internal override {
    liquidator = new SolidlySwapLiquidator();
    mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));
    stableToken = ap.getAddress("stableToken");

    if (block.chainid == BSC_MAINNET) {
      solidlySwapRouter = 0xd4ae6eCA985340Dd434D38F470aCCce4DC78D109;
    } else if (block.chainid == POLYGON_MAINNET) {
      solidlySwapRouter = 0x06374F57991CDc836E5A318569A910FE6456D230;
    }
  }

  function testSolidlyHayBusd() public fork(BSC_MAINNET) {
    address hayWhale = 0x1fa71DF4b344ffa5755726Ea7a9a56fbbEe0D38b;

    IERC20Upgradeable hay = IERC20Upgradeable(hayAddress);
    vm.prank(hayWhale);
    hay.transfer(address(liquidator), 1e18);

    (IERC20Upgradeable outputToken, uint256 outputAmount) = liquidator.redeem(
      hay,
      inputAmount,
      abi.encode(solidlySwapRouter, stableToken, true)
    );

    assertEq(address(outputToken), stableToken, "!busd output");
    assertApproxEqRel(inputAmount, outputAmount, 8e16, "!busd amount");
  }

  function testSolidlyAnkrHay() public fork(BSC_MAINNET) {
    address ankrWhale = 0x146eE71e057e6B10eFB93AEdf631Fde6CbAED5E2;

    IERC20Upgradeable ankr = IERC20Upgradeable(ankrAddress);
    vm.prank(ankrWhale);
    ankr.transfer(address(liquidator), 1e18);

    (IERC20Upgradeable outputToken, uint256 outputAmount) = liquidator.redeem(
      ankr,
      inputAmount,
      abi.encode(solidlySwapRouter, hayAddress, false)
    );

    uint256 outputValue = mpo.price(hayAddress) * outputAmount;
    uint256 inputValue = mpo.price(ankrAddress) * inputAmount;

    assertEq(address(outputToken), hayAddress, "!hay output");
    assertApproxEqRel(outputValue, inputValue, 9e16, "!hay amount");
  }

  function testSolidlyAnkrAnkrBNB() public fork(BSC_MAINNET) {
    address ankrWhale = 0x146eE71e057e6B10eFB93AEdf631Fde6CbAED5E2;

    IERC20Upgradeable ankr = IERC20Upgradeable(ankrAddress);
    vm.prank(ankrWhale);
    ankr.transfer(address(liquidator), 1e18);

    (IERC20Upgradeable outputToken, uint256 outputAmount) = liquidator.redeem(
      ankr,
      inputAmount,
      abi.encode(solidlySwapRouter, ankrBnbAddress, false)
    );

    uint256 outputValue = mpo.price(ankrBnbAddress) * outputAmount;
    uint256 inputValue = mpo.price(ankrAddress) * inputAmount;

    assertEq(address(outputToken), ankrBnbAddress, "!ankrBNB output");
    assertApproxEqRel(outputValue, inputValue, 8e16, "!ankrBNB amount");
  }

  function testSolidlyHayAnkrBNB() public fork(BSC_MAINNET) {
    address hayWhale = 0x1fa71DF4b344ffa5755726Ea7a9a56fbbEe0D38b;

    IERC20Upgradeable hay = IERC20Upgradeable(hayAddress);
    vm.prank(hayWhale);
    hay.transfer(address(liquidator), 1e18);

    (IERC20Upgradeable outputToken, uint256 outputAmount) = liquidator.redeem(
      hay,
      inputAmount,
      abi.encode(solidlySwapRouter, ankrBnbAddress, false)
    );

    uint256 outputValue = mpo.price(ankrBnbAddress) * outputAmount;
    uint256 inputValue = mpo.price(hayAddress) * inputAmount;

    assertEq(address(outputToken), ankrBnbAddress, "!ankrBNB output");
    assertApproxEqRel(outputValue, inputValue, 8e16, "!ankrBNB amount");
  }

  function testSolidlyDaiUsdrLp() public fork(POLYGON_MAINNET) {
    address daiUsdrLpAddress = 0x6ab291A9BB3C20F0017f2E93A6d1196842D09bF4;
    address daiUsdrLpWhale = 0x5E21386E8E0e6C77Abd1E08e21e9D41e760D3747;
    address usdrAddress = 0xb5DFABd7fF7F83BAB83995E72A52B97ABb7bcf63;

    IERC20Upgradeable daiUsdrLp = IERC20Upgradeable(daiUsdrLpAddress);
    vm.prank(daiUsdrLpWhale);
    daiUsdrLp.transfer(address(liquidator), 1e18);

    (IERC20Upgradeable outputToken, uint256 outputAmount) = liquidator.redeem(
      daiUsdrLp,
      inputAmount,
      abi.encode(solidlySwapRouter, usdrAddress, false)
    );

    uint256 outputValue = mpo.price(usdrAddress) * outputAmount;
    uint256 inputValue = mpo.price(daiUsdrLpAddress) * inputAmount;

    assertEq(address(outputToken), usdrAddress, "!usdr output");
    assertApproxEqRel(outputValue, inputValue, 8e16, "!in value != out value");
  }
}
