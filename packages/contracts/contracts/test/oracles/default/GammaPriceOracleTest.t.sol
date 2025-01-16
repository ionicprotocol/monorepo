// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { BaseTest } from "../../config/BaseTest.t.sol";
import { GammaPoolAlgebraPriceOracle } from "../../../oracles/default/GammaPoolPriceOracle.sol";
import { GammaPoolUniswapV3PriceOracle } from "../../../oracles/default/GammaPoolPriceOracle.sol";
import { MasterPriceOracle } from "../../../oracles/MasterPriceOracle.sol";

import "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";

import { LiquidityAmounts } from "../../../external/uniswap/LiquidityAmounts.sol";
import { IUniswapV3Pool } from "../../../external/uniswap/IUniswapV3Pool.sol";

import { IHypervisor } from "../../../external/gamma/IHypervisor.sol";

contract GammaPoolPriceOracleTest is BaseTest {
  GammaPoolAlgebraPriceOracle private aOracle;
  GammaPoolUniswapV3PriceOracle private uOracle;
  MasterPriceOracle mpo;
  address wtoken;
  address stable;

  function afterForkSetUp() internal override {
    stable = ap.getAddress("stableToken");
    wtoken = ap.getAddress("wtoken");
    mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));
    aOracle = new GammaPoolAlgebraPriceOracle();
    uOracle = new GammaPoolUniswapV3PriceOracle();
    vm.prank(mpo.admin());
    aOracle.initialize(wtoken);
    uOracle.initialize(wtoken);
  }

  function testPriceGammaAlgebraNow() public fork(POLYGON_MAINNET) {
    {
      uint256 withdrawAmount = 1e18;
      address DAI_GNS_QS_GAMMA_VAULT = 0x7aE7FB44c92B4d41abB6E28494f46a2EB3c2a690; // QS aDAI-GNS (Narrow)
      address DAI_GNS_QS_GAMMA_WHALE = 0x20ec0d06F447d550fC6edee42121bc8C1817b97D; // QS Masterchef

      vm.prank(address(mpo));
      uint256 price_DAI_GNS = aOracle.price(DAI_GNS_QS_GAMMA_VAULT);

      uint256 expectedPrice = priceAtWithdraw(DAI_GNS_QS_GAMMA_WHALE, DAI_GNS_QS_GAMMA_VAULT, withdrawAmount);
      assertApproxEqRel(price_DAI_GNS, expectedPrice, 1e16, "!aDAI-GNS price");
    }

    {
      uint256 withdrawAmount = 1e6;
      address DAI_USDT_QS_GAMMA_VAULT = 0x45A3A657b834699f5cC902e796c547F826703b79;
      address DAI_USDT_QS_WHALE = 0x20ec0d06F447d550fC6edee42121bc8C1817b97D; // QS Masterchef

      vm.prank(address(mpo));
      uint256 price_DAI_USDT = aOracle.price(DAI_USDT_QS_GAMMA_VAULT) / (1e18 / withdrawAmount);

      uint256 expectedPrice = priceAtWithdraw(DAI_USDT_QS_WHALE, DAI_USDT_QS_GAMMA_VAULT, withdrawAmount);
      assertApproxEqRel(price_DAI_USDT, expectedPrice, 1e16, "!aDAI-USDT price");
    }

    {
      uint256 withdrawAmount = 1e6;
      address WETH_USDT_QS_GAMMA_VAULT = 0x5928f9f61902b139e1c40cBa59077516734ff09f; // QS aWETH-USDT (Narrow)
      address WETH_USDT_QS_WHALE = 0x20ec0d06F447d550fC6edee42121bc8C1817b97D; // QS Masterchef

      vm.prank(address(mpo));
      uint256 price_WETH_USDT = aOracle.price(WETH_USDT_QS_GAMMA_VAULT) / (1e18 / withdrawAmount);

      uint256 expectedPrice = priceAtWithdraw(WETH_USDT_QS_WHALE, WETH_USDT_QS_GAMMA_VAULT, withdrawAmount);
      assertApproxEqRel(price_WETH_USDT, expectedPrice, 10e16, "!aWETH-USDT price");
    }
  }

  function testPriceGammaUniV3Now() public fork(POLYGON_MAINNET) {
    uint256 withdrawAmount = 1e18;
    {
      address USDC_CASH_RETRO_GAMMA_VAULT = 0x64e14623CA543b540d0bA80477977f7c2c00a7Ea;
      address USDC_CASH_RETRO_WHALE = 0x38e481367E0c50f4166AD2A1C9fde0E3c662CFBa;

      vm.prank(address(mpo));
      uint256 price_USDC_CASH = uOracle.price(USDC_CASH_RETRO_GAMMA_VAULT);

      uint256 expectedPrice = priceAtWithdraw(USDC_CASH_RETRO_WHALE, USDC_CASH_RETRO_GAMMA_VAULT, withdrawAmount);
      assertApproxEqRel(price_USDC_CASH, expectedPrice, 1e16, "!aUSDC-CASH price");
    }

    {
      address USDC_WETH_RETRO_GAMMA_VAULT = 0xe058e1FfFF9B13d3FCd4803FDb55d1Cc2fe07DDC;
      address USDC_WETH_RETRO_WHALE = 0x38e481367E0c50f4166AD2A1C9fde0E3c662CFBa;

      vm.prank(address(mpo));
      uint256 price_USDC_WETH = uOracle.price(USDC_WETH_RETRO_GAMMA_VAULT);

      uint256 expectedPrice = priceAtWithdraw(USDC_WETH_RETRO_WHALE, USDC_WETH_RETRO_GAMMA_VAULT, withdrawAmount);
      assertApproxEqRel(price_USDC_WETH, expectedPrice, 5e16, "!aUSDC_WETH price");
    }

    {
      address WMATIC_MATICX_RETRO_GAMMA_VAULT = 0x2589469b7A72802CE02484f053CB6df869eB2689;
      address WMATIC_MATICX_RETRO_WHALE = 0xcFB07d195DB81da622E94BDB3171392756775914;

      vm.prank(address(mpo));
      uint256 price_WMATIC_MATICX = uOracle.price(WMATIC_MATICX_RETRO_GAMMA_VAULT);

      uint256 expectedPrice = priceAtWithdraw(
        WMATIC_MATICX_RETRO_WHALE,
        WMATIC_MATICX_RETRO_GAMMA_VAULT,
        withdrawAmount
      );

      assertApproxEqRel(price_WMATIC_MATICX, expectedPrice, 1e16, "!aWMATIC_MATICX price");
    }

    {
      address WBTC_WETH_RETRO_GAMMA_VAULT = 0x336536F5bB478D8624dDcE0942fdeF5C92bC4662;
      address WBTC_WETH_RETRO_GAMMA_WHALE = 0x38e481367E0c50f4166AD2A1C9fde0E3c662CFBa;

      vm.prank(address(mpo));
      uint256 price_WBTC_WETH = uOracle.price(WBTC_WETH_RETRO_GAMMA_VAULT);

      uint256 expectedPrice = priceAtWithdraw(WBTC_WETH_RETRO_GAMMA_WHALE, WBTC_WETH_RETRO_GAMMA_VAULT, withdrawAmount);
      assertApproxEqRel(price_WBTC_WETH, expectedPrice, 5e16, "!aWBTC_WETH price");
    }
  }

  function priceAtWithdraw(address whale, address vaultAddress, uint256 withdrawAmount) internal returns (uint256) {
    address emptyAddress = address(900202020);
    IHypervisor vault = IHypervisor(vaultAddress);
    ERC20Upgradeable token0 = ERC20Upgradeable(vault.token0());
    ERC20Upgradeable token1 = ERC20Upgradeable(vault.token1());

    uint256 balance0Before = token0.balanceOf(emptyAddress);
    uint256 balance1Before = token1.balanceOf(emptyAddress);

    uint256[4] memory minAmounts;
    vm.prank(whale);
    vault.withdraw(withdrawAmount, emptyAddress, whale, minAmounts);

    uint256 balance0After = token0.balanceOf(emptyAddress);
    uint256 balance1After = token1.balanceOf(emptyAddress);

    uint256 price0 = mpo.price(address(token0));
    uint256 price1 = mpo.price(address(token1));

    uint256 balance0Diff = (balance0After - balance0Before) * 10 ** (18 - uint256(token0.decimals()));
    uint256 balance1Diff = (balance1After - balance1Before) * 10 ** (18 - uint256(token1.decimals()));

    return (balance0Diff * price0 + balance1Diff * price1) / 1e18;
  }
}
