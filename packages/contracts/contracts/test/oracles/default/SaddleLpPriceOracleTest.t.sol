// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { ISwap } from "../../../external/saddle/ISwap.sol";
import { SaddleLpPriceOracle } from "../../../oracles/default/SaddleLpPriceOracle.sol";
import { MasterPriceOracle } from "../../../oracles/MasterPriceOracle.sol";
import { ICErc20 } from "../../../compound/CTokenInterfaces.sol";

import { BaseTest } from "../../config/BaseTest.t.sol";

contract SaddleLpPriceOracleTest is BaseTest {
  SaddleLpPriceOracle oracle;
  address usdc = 0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8;
  address frax = 0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F;
  address fraxUsdc_lp = 0x896935B02D3cBEb152192774e4F1991bb1D2ED3f;
  address fraxUsdc_pool = 0x401AFbc31ad2A3Bc0eD8960d63eFcDEA749b4849;
  // TODO: add test once this is deployed
  // ICErc20 fraxUsdc_c = ICErc20(0x);
  MasterPriceOracle mpo;

  function afterForkSetUp() internal override {
    mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));

    address[] memory lpTokens = new address[](1);
    lpTokens[0] = fraxUsdc_lp;
    address[] memory pools = new address[](1);
    pools[0] = fraxUsdc_pool;
    address[][] memory underlyings = new address[][](1);
    underlyings[0] = new address[](2);
    underlyings[0][0] = usdc;
    underlyings[0][1] = frax;

    vm.startPrank(mpo.admin());
    oracle = new SaddleLpPriceOracle();
    oracle.initialize(lpTokens, pools, underlyings);
    vm.stopPrank();
  }

  function testSaddleLpTokenPriceOracle() public debuggingOnly forkAtBlock(ARBITRUM_ONE, 44898730) {
    vm.prank(address(mpo));
    uint256 price = oracle.price(fraxUsdc_lp);
    assertEq(price, 785240575939374);
  }
}
