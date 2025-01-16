// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { IERC20Upgradeable } from "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import { SaddleLpTokenLiquidator } from "../../liquidators/SaddleLpTokenLiquidator.sol";
import { SaddleLpPriceOracle } from "../../oracles/default/SaddleLpPriceOracle.sol";
import { MasterPriceOracle } from "../../oracles/MasterPriceOracle.sol";
import { ISwap } from "../../external/saddle/ISwap.sol";

import { BaseTest } from "../config/BaseTest.t.sol";

contract SaddleLpTokenLiquidatorTest is BaseTest {
  MasterPriceOracle mpo;
  address stable;
  SaddleLpTokenLiquidator private liquidator;
  SaddleLpPriceOracle oracle;
  address fraxUsdc_lp = 0x896935B02D3cBEb152192774e4F1991bb1D2ED3f;
  address frax = 0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F;

  function afterForkSetUp() internal override {
    liquidator = new SaddleLpTokenLiquidator();
    oracle = new SaddleLpPriceOracle();
    mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));
    stable = ap.getAddress("stableToken");

    address[] memory uls = new address[](2);
    uls[0] = stable;
    uls[1] = frax;

    address[][] memory underlyings = new address[][](1);
    underlyings[0] = uls;

    vm.prank(mpo.admin());
    oracle.initialize(asArray(fraxUsdc_lp), asArray(0x401AFbc31ad2A3Bc0eD8960d63eFcDEA749b4849), underlyings);
  }

  function testSaddleLpTokenLiquidator() public fork(ARBITRUM_ONE) {
    IERC20Upgradeable lpToken = IERC20Upgradeable(fraxUsdc_lp);
    address lpTokenWhale = 0xa5bD85ed9fA27ba23BfB702989e7218E44fd4706; // metaswap
    uint8 outputTokenIndex = 0;
    address poolAddr = oracle.poolOf(address(lpToken));
    ISwap pool = ISwap(poolAddr);
    address outputTokenAddr = pool.getToken(0);
    bytes memory data = abi.encode(outputTokenAddr, address(oracle), ap.getAddress("wtoken"));
    uint256 amount = 1e18;

    IERC20Upgradeable outputToken = IERC20Upgradeable(outputTokenAddr);

    vm.prank(lpTokenWhale);
    lpToken.transfer(address(liquidator), 1e18);

    vm.prank(address(liquidator));
    lpToken.approve(poolAddr, 1e18);
    vm.expectRevert(bytes("Pausable: paused"));
    liquidator.redeem(lpToken, amount, data);
    // assertGt(outputToken.balanceOf(address(liquidator)), 0, "!redeem output");
  }
}
