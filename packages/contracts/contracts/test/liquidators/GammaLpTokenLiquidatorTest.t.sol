// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { BaseTest } from "../config/BaseTest.t.sol";
import { GammaAlgebraLpTokenLiquidator, GammaAlgebraLpTokenWrapper } from "../../liquidators/gamma/GammaAlgebraLpTokenLiquidator.sol";
import { GammaUniswapV3LpTokenLiquidator, GammaUniswapV3LpTokenWrapper } from "../../liquidators/gamma/GammaUniswapV3LpTokenLiquidator.sol";
import { IHypervisor } from "../../external/gamma/IHypervisor.sol";

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

contract GammaLpTokenLiquidatorTest is BaseTest {
  GammaAlgebraLpTokenLiquidator public aLiquidator;
  GammaUniswapV3LpTokenLiquidator public uLiquidator;
  GammaAlgebraLpTokenWrapper aWrapper;
  GammaUniswapV3LpTokenWrapper uWrapper;

  address uniV3SwapRouter;
  address algebraSwapRouter;
  address uniProxyAlgebra;
  address uniProxyUni;
  address wtoken;

  function afterForkSetUp() internal override {
    aLiquidator = new GammaAlgebraLpTokenLiquidator();
    uLiquidator = new GammaUniswapV3LpTokenLiquidator();
    aWrapper = new GammaAlgebraLpTokenWrapper();
    uWrapper = new GammaUniswapV3LpTokenWrapper();
    wtoken = ap.getAddress("wtoken");
    if (block.chainid == POLYGON_MAINNET) {
      uniProxyAlgebra = 0xA42d55074869491D60Ac05490376B74cF19B00e6;
      uniProxyUni = 0xDC8eE75f52FABF057ae43Bb4B85C55315b57186c;
      uniV3SwapRouter = 0x1891783cb3497Fdad1F25C933225243c2c7c4102; // Retro
      algebraSwapRouter = 0xf5b509bB0909a69B1c207E495f687a596C168E12; // QS
    }
  }

  function testGammaUniswapV3LpTokenLiquidator() public fork(POLYGON_MAINNET) {
    uint256 withdrawAmount = 1e18;

    address WMATIC_WETH_RETRO_GAMMA_VAULT = 0xe7806B5ba13d4B2Ab3EaB3061cB31d4a4F3390Aa;
    address WMATIC_WETH_RETRO_WHALE = 0xcb7c356b9287DeC7d36923238F53e6C955bfE778;

    IHypervisor vault = IHypervisor(WMATIC_WETH_RETRO_GAMMA_VAULT);
    vm.prank(WMATIC_WETH_RETRO_WHALE);
    vault.transfer(address(uLiquidator), withdrawAmount);

    address outputTokenAddress = ap.getAddress("wtoken"); // WMATIC
    bytes memory strategyData = abi.encode(outputTokenAddress, uniV3SwapRouter);
    (, uint256 outputAmount) = uLiquidator.redeem(vault, withdrawAmount, strategyData);

    emit log_named_uint("wmatic redeemed", outputAmount);
    assertGt(outputAmount, 0, "!failed to withdraw and swap");
  }

  function testGammaAlgebraLpTokenLiquidator() public fork(POLYGON_MAINNET) {
    uint256 withdrawAmount = 1e18;
    address DAI_GNS_QS_GAMMA_VAULT = 0x7aE7FB44c92B4d41abB6E28494f46a2EB3c2a690;
    address DAI_GNS_QS_WHALE = 0x20ec0d06F447d550fC6edee42121bc8C1817b97D;

    IHypervisor vault = IHypervisor(DAI_GNS_QS_GAMMA_VAULT);
    vm.prank(DAI_GNS_QS_WHALE);
    vault.transfer(address(aLiquidator), withdrawAmount);

    address outputTokenAddress = ap.getAddress("wtoken"); // WMATIC
    bytes memory strategyData = abi.encode(outputTokenAddress, algebraSwapRouter);
    (, uint256 outputAmount) = aLiquidator.redeem(vault, withdrawAmount, strategyData);

    emit log_named_uint("wbnb redeemed", outputAmount);
    assertGt(outputAmount, 0, "!failed to withdraw and swap");
  }

  function testGammaLpTokenWrapperWmatic() public fork(POLYGON_MAINNET) {
    address WMATIC_WETH_QS_GAMMA_VAULT = 0x02203f2351E7aC6aB5051205172D3f772db7D814;
    IHypervisor vault = IHypervisor(WMATIC_WETH_QS_GAMMA_VAULT);
    address wtokenWhale = 0x6d80113e533a2C0fe82EaBD35f1875DcEA89Ea97;
    address wethAddress = 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619;

    vm.prank(wtokenWhale);
    IERC20Upgradeable(wtoken).transfer(address(aWrapper), 1e18);

    (IERC20Upgradeable outputToken, uint256 outputAmount) = aWrapper.redeem(
      IERC20Upgradeable(wtoken),
      1e18,
      abi.encode(algebraSwapRouter, uniProxyAlgebra, vault)
    );

    emit log_named_uint("lp tokens minted", outputAmount);

    assertGt(outputToken.balanceOf(address(aWrapper)), 0, "!wrapped");
    assertEq(IERC20Upgradeable(wtoken).balanceOf(address(aWrapper)), 0, "!unused wtoken");
    assertEq(IERC20Upgradeable(wethAddress).balanceOf(address(aWrapper)), 0, "!unused usdt");
  }

  function testGammaLpTokenWrapperUsdt() public fork(POLYGON_MAINNET) {
    address ETH_USDT_QS_GAMMA_VAULT = 0x5928f9f61902b139e1c40cBa59077516734ff09f; // Wide
    IHypervisor vault = IHypervisor(ETH_USDT_QS_GAMMA_VAULT);
    address usdtAddress = 0xc2132D05D31c914a87C6611C10748AEb04B58e8F;
    address usdtWhale = 0x0639556F03714A74a5fEEaF5736a4A64fF70D206;
    IERC20Upgradeable usdt = IERC20Upgradeable(usdtAddress);

    vm.prank(usdtWhale);
    usdt.transfer(address(aWrapper), 1e6);

    (IERC20Upgradeable outputToken, uint256 outputAmount) = aWrapper.redeem(
      usdt,
      1e6,
      abi.encode(algebraSwapRouter, uniProxyAlgebra, vault)
    );

    emit log_named_uint("lp tokens minted", outputAmount);

    assertGt(outputToken.balanceOf(address(aWrapper)), 0, "!wrapped");
    assertEq(IERC20Upgradeable(wtoken).balanceOf(address(aWrapper)), 0, "!unused wtoken");
    assertEq(usdt.balanceOf(address(aWrapper)), 0, "!unused usdt");
  }

  function testGammaUniV3LpTokenWrapper() public fork(POLYGON_MAINNET) {
    address USDC_CASH_GAMMA_VAULT = 0x64e14623CA543b540d0bA80477977f7c2c00a7Ea;
    IHypervisor vault = IHypervisor(USDC_CASH_GAMMA_VAULT);
    address usdcAddress = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174;
    address usdcWhale = 0xe7804c37c13166fF0b37F5aE0BB07A3aEbb6e245;
    IERC20Upgradeable usdc = IERC20Upgradeable(usdcAddress);

    vm.prank(usdcWhale);
    usdc.transfer(address(uWrapper), 1e6);

    (IERC20Upgradeable outputToken, uint256 outputAmount) = uWrapper.redeem(
      usdc,
      1e6,
      abi.encode(uniV3SwapRouter, uniProxyUni, vault)
    );

    emit log_named_uint("lp tokens minted", outputAmount);

    assertGt(outputToken.balanceOf(address(uWrapper)), 0, "!wrapped");
    assertEq(IERC20Upgradeable(wtoken).balanceOf(address(uWrapper)), 0, "!unused wtoken");
    assertEq(usdc.balanceOf(address(uWrapper)), 0, "!unused usdc");
  }

  function testUsdcWethGammaUniV3LpTokenWrapper() public debuggingOnly fork(POLYGON_MAINNET) {
    address USDC_WETH_RETRO_GAMMA_VAULT = 0xe058e1FfFF9B13d3FCd4803FDb55d1Cc2fe07DDC;
    address usdcAddress = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174;
    address usdcWhale = 0xe7804c37c13166fF0b37F5aE0BB07A3aEbb6e245;
    IERC20Upgradeable usdc = IERC20Upgradeable(usdcAddress);

    vm.prank(usdcWhale);
    usdc.transfer(address(uWrapper), 9601.830212e6);

    (IERC20Upgradeable outputToken, uint256 outputAmount) = uWrapper.redeem(
      usdc,
      9601.830212e6,
      abi.encode(uniV3SwapRouter, uniProxyUni, USDC_WETH_RETRO_GAMMA_VAULT)
    );

    emit log_named_uint("lp tokens minted", outputAmount);

    assertGt(outputToken.balanceOf(address(uWrapper)), 0, "!wrapped");
    assertEq(IERC20Upgradeable(wtoken).balanceOf(address(uWrapper)), 0, "!unused wtoken");
    assertEq(usdc.balanceOf(address(uWrapper)), 0, "!unused usdc");
  }
}
