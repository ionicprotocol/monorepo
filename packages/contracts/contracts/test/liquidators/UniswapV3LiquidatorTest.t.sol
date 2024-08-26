// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { IERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

import { IonicUniV3Liquidator, IUniswapV3Pool, ILiquidator } from "../../IonicUniV3Liquidator.sol";
import "../../external/uniswap/quoter/interfaces/IUniswapV3Quoter.sol";
import { IRedemptionStrategy } from "../../liquidators/IRedemptionStrategy.sol";
import { ILiquidatorsRegistry } from "../../liquidators/registry/ILiquidatorsRegistry.sol";
import { IUniswapV2Router02 } from "../../external/uniswap/IUniswapV2Router02.sol";
import { IUniswapV3Factory } from "../../external/uniswap/IUniswapV3Factory.sol";
import { UniswapV2LiquidatorFunder } from "../../liquidators/UniswapV2LiquidatorFunder.sol";
import { UniswapV3LiquidatorFunder } from "../../liquidators/UniswapV3LiquidatorFunder.sol";
import { KimUniV2Liquidator } from "../../liquidators/KimUniV2Liquidator.sol";

import { IFundsConversionStrategy } from "../../liquidators/IFundsConversionStrategy.sol";
import { ICErc20 } from "../../compound/CTokenInterfaces.sol";
import { IonicComptroller } from "../../compound/ComptrollerInterface.sol";
import { AuthoritiesRegistry } from "../../ionic/AuthoritiesRegistry.sol";
import { PoolRolesAuthority } from "../../ionic/PoolRolesAuthority.sol";

import { BaseTest } from "../config/BaseTest.t.sol";
import "./IonicLiquidatorTest.sol";

contract UniswapV3LiquidatorTest is IonicLiquidatorTest {
  function testPolygonUniV3LiquidatorLiquidate() public fork(POLYGON_MAINNET) {
    IonicUniV3Liquidator _liquidator = new IonicUniV3Liquidator();
    _liquidator.initialize(ap.getAddress("wtoken"), address(quoter));
    liquidator = _liquidator;
    _testLiquidatorLiquidate(uniV3PooForFlash);
  }

  function testModeUniV3LiquidatorLiquidate() public debuggingOnly fork(MODE_MAINNET) {
    IonicUniV3Liquidator _liquidator = new IonicUniV3Liquidator();
    _liquidator.initialize(ap.getAddress("wtoken"), address(quoter));
    liquidator = _liquidator;

    IonicComptroller pool = IonicComptroller(poolAddress);
    {
      ICErc20[] memory markets = pool.getAllMarkets();

      ICErc20 usdcMarket = markets[usdcMarketIndex];
      IERC20Upgradeable usdc = IERC20Upgradeable(usdcMarket.underlying());
      ICErc20 wethMarket = markets[wethMarketIndex];
      IERC20Upgradeable weth = IERC20Upgradeable(wethMarket.underlying());
      {
        emit log_named_address("usdc market", address(usdcMarket));
        emit log_named_address("weth market", address(wethMarket));
        emit log_named_address("usdc underlying", usdcMarket.underlying());
        emit log_named_address("weth underlying", wethMarket.underlying());
        vm.startPrank(liquidatorsRegistry.owner());
        IRedemptionStrategy strategy = new UniswapV3LiquidatorFunder();
        liquidatorsRegistry._setRedemptionStrategy(strategy, weth, usdc);
        vm.stopPrank();
        vm.prank(OwnableUpgradeable(address(liquidator)).owner());
        liquidator._whitelistRedemptionStrategy(strategy, true);
      }
    }

    _testLiquidatorLiquidate(uniV3PooForFlash);
  }

  function testModeKimUniV2Liquidator() public fork(MODE_MAINNET) {
    IonicLiquidator _liquidator = new IonicLiquidator();
    _liquidator.initialize(ap.getAddress("wtoken"), ap.getAddress("IUniswapV2Router02"), 30);
    liquidator = _liquidator;
    liquidator.setPoolLens(0x70BB19a56BfAEc65aE861E6275A90163AbDF36a6);
    liquidator.setHealthFactorThreshold(1e18);

    IonicComptroller pool = IonicComptroller(poolAddress);
    {
      ICErc20[] memory markets = pool.getAllMarkets();

      ICErc20 usdcMarket = markets[usdcMarketIndex];
      IERC20Upgradeable usdc = IERC20Upgradeable(usdcMarket.underlying());
      ICErc20 wethMarket = markets[wethMarketIndex];
      IERC20Upgradeable weth = IERC20Upgradeable(wethMarket.underlying());
      {
        emit log_named_address("usdc market", address(usdcMarket));
        emit log_named_address("weth market", address(wethMarket));
        emit log_named_address("usdc underlying", usdcMarket.underlying());
        emit log_named_address("weth underlying", wethMarket.underlying());
        vm.startPrank(liquidatorsRegistry.owner());
        IRedemptionStrategy strategy = KimUniV2Liquidator(0x6aC17D406a820fa464fFdc0940FCa7E60b3b36B7);
        liquidatorsRegistry._setRedemptionStrategy(strategy, weth, usdc);
        vm.stopPrank();
        liquidator._whitelistRedemptionStrategy(strategy, true);
      }
    }

    _testLiquidatorLiquidate(uniV3PooForFlash);
  }

  function testUniV3PoolForFee() public debuggingOnly fork(MODE_MAINNET) {
    address wethAddr = 0x4200000000000000000000000000000000000006;
    address usdcAddr = 0xd988097fb8612cc24eeC14542bC03424c656005f;
    IERC20Upgradeable usdc = IERC20Upgradeable(usdcAddr);
    IERC20Upgradeable weth = IERC20Upgradeable(wethAddr);

    IUniswapV2Router02 kimRouter = IUniswapV2Router02(0x5D61c537393cf21893BE619E36fC94cd73C77DD3);
    address factoryAddress;
    //factory = kimRouter.factory();
    factoryAddress = 0xC33Ce0058004d44E7e1F366E5797A578fDF38584;
    IUniswapV3Factory factory = IUniswapV3Factory(factoryAddress);
    address pool;

    uint256 feeConfig = liquidatorsRegistry.uniswapV3Fees(usdc, weth);
    emit log_named_uint("feeConfig", feeConfig);

    if (feeConfig == 0) {
      pool = factory.getPool(wethAddr, usdcAddr, uint24(feeConfig));
      emit log_named_address("Pool at fee 0", pool);
    }

    pool = factory.getPool(wethAddr, usdcAddr, 500);
    emit log_named_address("Pool at fee 500", pool);
  }
}
