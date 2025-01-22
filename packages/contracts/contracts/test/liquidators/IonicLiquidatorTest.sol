// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { IERC20Upgradeable } from "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin-contracts-upgradeable/contracts/access/OwnableUpgradeable.sol";

import { IonicLiquidator, ILiquidator } from "../../IonicLiquidator.sol";
import { IonicUniV3Liquidator } from "../../IonicUniV3Liquidator.sol";
import { ICurvePool } from "../../external/curve/ICurvePool.sol";
import { CurveSwapLiquidatorFunder } from "../../liquidators/CurveSwapLiquidatorFunder.sol";
import { UniswapV3LiquidatorFunder } from "../../liquidators/UniswapV3LiquidatorFunder.sol";
import { IonicComptroller } from "../../compound/ComptrollerInterface.sol";
import { IRedemptionStrategy } from "../../liquidators/IRedemptionStrategy.sol";
import { IFundsConversionStrategy } from "../../liquidators/IFundsConversionStrategy.sol";
import { ICErc20 } from "../../compound/CTokenInterfaces.sol";
import { IUniswapV2Pair } from "../../external/uniswap/IUniswapV2Pair.sol";
import { ILiquidatorsRegistry } from "../../liquidators/registry/ILiquidatorsRegistry.sol";
import "../../external/uniswap/quoter/interfaces/IUniswapV3Quoter.sol";
import { AuthoritiesRegistry } from "../../ionic/AuthoritiesRegistry.sol";
import { LiquidatorsRegistrySecondExtension } from "../../liquidators/registry/LiquidatorsRegistrySecondExtension.sol";
import "../../liquidators/registry/LiquidatorsRegistryExtension.sol";
import { Unitroller } from "../../compound/Unitroller.sol";
import { BasePriceOracle } from "../../oracles/BasePriceOracle.sol";

import { BaseTest } from "../config/BaseTest.t.sol";
import { UpgradesBaseTest } from "../UpgradesBaseTest.sol";
import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import { ProxyAdmin } from "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
import { PoolLens } from "../../PoolLens.sol";

contract MockRedemptionStrategy is IRedemptionStrategy {
  function redeem(IERC20Upgradeable, uint256, bytes memory) external returns (IERC20Upgradeable, uint256) {
    return (IERC20Upgradeable(address(0)), 1);
  }

  function name() public pure returns (string memory) {
    return "MockRedemptionStrategy";
  }
}

contract IonicLiquidatorTest is UpgradesBaseTest {
  ILiquidator liquidator;
  address uniswapRouter;
  address swapRouter;
  IUniswapV3Quoter quoter;
  address usdcWhale;
  address wethWhale;
  address poolAddress;
  address uniV3PooForFlash;
  uint256 usdcMarketIndex;
  uint256 wethMarketIndex;

  AuthoritiesRegistry authRegistry;
  ILiquidatorsRegistry liquidatorsRegistry;

  function afterForkSetUp() internal override {
    super.afterForkSetUp();

    if (block.chainid == BSC_MAINNET) {
      uniswapRouter = 0x10ED43C718714eb63d5aA57B78B54704E256024E;
    } else if (block.chainid == POLYGON_MAINNET) {
      uniswapRouter = 0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff;
      swapRouter = 0xE592427A0AEce92De3Edee1F18E0157C05861564;
      quoter = IUniswapV3Quoter(0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6);
      usdcWhale = 0x625E7708f30cA75bfd92586e17077590C60eb4cD; // aave reserve
      wethWhale = 0x1eED63EfBA5f81D95bfe37d82C8E736b974F477b;
      poolAddress = 0x22A705DEC988410A959B8b17C8c23E33c121580b; // Retro stables pool
      uniV3PooForFlash = 0xA374094527e1673A86dE625aa59517c5dE346d32; // usdc-wmatic
      usdcMarketIndex = 3;
      wethMarketIndex = 5;
    } else if (block.chainid == MODE_MAINNET) {
      uniswapRouter = 0x5D61c537393cf21893BE619E36fC94cd73C77DD3; // kim router
      //      uniswapRouter = 0xC9Adff795f46105E53be9bbf14221b1C9919EE25; // sup router
      //      swapRouter = 0xC9Adff795f46105E53be9bbf14221b1C9919EE25; // sup router
      swapRouter = 0x5D61c537393cf21893BE619E36fC94cd73C77DD3; // kim router
      //quoter = IUniswapV3Quoter(0x7Fd569b2021850fbA53887dd07736010aCBFc787); // other sup quoter?
      quoter = IUniswapV3Quoter(0x5E6AEbab1AD525f5336Bd12E6847b851531F72ba); // sup quoter
      usdcWhale = 0x34b83A3759ba4c9F99c339604181bf6bBdED4C79; // vault
      wethWhale = 0xF4C85269240C1D447309fA602A90ac23F1CB0Dc0;
      poolAddress = 0xFB3323E24743Caf4ADD0fDCCFB268565c0685556;
      //uniV3PooForFlash = 0x293f2B2c17f8cEa4db346D87Ef5712C9dd0491EF; // kim weth-usdc pool
      uniV3PooForFlash = 0x047CF4b081ee80d2928cb2ce3F3C4964e26eB0B9; // kim usdt-usdc pool
      //      uniV3PooForFlash = 0xf2e9C024F1C0B7a2a4ea11243C2D86A7b38DD72f; // sup univ2 0x34a1E3Db82f669f8cF88135422AfD80e4f70701A
      usdcMarketIndex = 1;
      wethMarketIndex = 0;
      // weth 0x4200000000000000000000000000000000000006
      // usdc 0xd988097fb8612cc24eeC14542bC03424c656005f
    }

    //    vm.prank(ap.owner());
    //    ap.setAddress("IUniswapV2Router02", uniswapRouter);
    vm.prank(ap.owner());
    ap.setAddress("UNISWAP_V3_ROUTER", uniswapRouter);

    authRegistry = AuthoritiesRegistry(ap.getAddress("AuthoritiesRegistry"));
    liquidatorsRegistry = ILiquidatorsRegistry(ap.getAddress("LiquidatorsRegistry"));
    liquidator = IonicLiquidator(payable(ap.getAddress("IonicLiquidator")));
  }

  function upgradeRegistry() internal {
    DiamondBase asBase = DiamondBase(address(liquidatorsRegistry));
    address[] memory exts = asBase._listExtensions();
    LiquidatorsRegistryExtension newExt1 = new LiquidatorsRegistryExtension();
    LiquidatorsRegistrySecondExtension newExt2 = new LiquidatorsRegistrySecondExtension();
    vm.prank(SafeOwnable(address(liquidatorsRegistry)).owner());
    asBase._registerExtension(newExt1, DiamondExtension(exts[0]));
    vm.prank(SafeOwnable(address(liquidatorsRegistry)).owner());
    asBase._registerExtension(newExt2, DiamondExtension(exts[1]));
  }

  function testBsc() public fork(BSC_MAINNET) {
    testUpgrade();
  }

  function testPolygon() public fork(POLYGON_MAINNET) {
    testUpgrade();
  }

  function testUpgrade() internal {
    // in case these slots start to get used, please redeploy the FSL
    // with a larger storage gap to protect the owner variable of OwnableUpgradeable
    // from being overwritten by the IonicLiquidator storage
    for (uint256 i = 40; i < 51; i++) {
      address atSloti = address(uint160(uint256(vm.load(address(liquidator), bytes32(i)))));
      assertEq(
        atSloti,
        address(0),
        "replace the FSL proxy/storage contract with a new one before the owner variable is overwritten"
      );
    }
  }

  function testSpecificLiquidation() public debuggingOnly fork(MODE_MAINNET) {
    address borrower = 0x5834a3AAFA83A53822B313994Bb554d8E8c215dF;
    address debtMarketAddr = 0x71ef7EDa2Be775E5A7aa8afD02C45F059833e9d2;
    address collateralMarketAddr = 0x94812F2eEa03A49869f95e1b5868C6f3206ee3D3;

    liquidator = ILiquidator(payable(ap.getAddress("IonicUniV3Liquidator")));

    ILiquidator.LiquidateToTokensWithFlashSwapVars memory vars;
    vars.borrower = borrower;
    vars.cErc20 = ICErc20(debtMarketAddr);
    vars.cTokenCollateral = ICErc20(collateralMarketAddr);
    vars.repayAmount = 0x408c7a4d7c4092;
    vars.flashSwapContract = 0x468cC91dF6F669CaE6cdCE766995Bd7874052FBc;
    vars.minProfitAmount = 0;
    vars.redemptionStrategies = new IRedemptionStrategy[](1);
    vars.strategyData = new bytes[](1);
    vars.debtFundingStrategies = new IFundsConversionStrategy[](0);
    vars.debtFundingStrategiesData = new bytes[](0);

    vars.redemptionStrategies[0] = IFundsConversionStrategy(0x5cA3fd2c285C4138185Ef1BdA7573D415020F3C8);
    vars.strategyData[
      0
    ] = hex"0000000000000000000000004200000000000000000000000000000000000006000000000000000000000000ac48fcf1049668b285f3dc72483df5ae2162f7e8";

    liquidator.safeLiquidateToTokensWithFlashLoan(vars);
  }

  function testWithdrawalLiquidator() public debuggingOnly fork(MODE_MAINNET) {
    TransparentUpgradeableProxy proxyV3 = TransparentUpgradeableProxy(payable(ap.getAddress("IonicUniV3Liquidator")));
    IonicUniV3Liquidator implV3 = new IonicUniV3Liquidator();
    IonicUniV3Liquidator liquidatorV3 = IonicUniV3Liquidator(payable(ap.getAddress("IonicUniV3Liquidator")));
    ProxyAdmin proxyAdmin = ProxyAdmin(ap.getAddress("DefaultProxyAdmin"));

    vm.startPrank(proxyAdmin.owner());
    proxyAdmin.upgrade(proxyV3, address(implV3));
    vm.stopPrank();

    vm.prank(0x4200000000000000000000000000000000000016);
    (bool success, ) = address(liquidatorV3).call{ value: 1 ether }("");
    require(success, "transfer of funds failed");

    uint256 beforeBalance = liquidatorV3.owner().balance;

    vm.prank(liquidatorV3.owner());
    liquidatorV3.withdrawAll();

    emit log_named_uint("balance of liquidator", liquidatorV3.owner().balance);

    assertEq(liquidatorV3.owner().balance, beforeBalance + 1 ether);
    assertEq(address(liquidatorV3).balance, 0);
  }

  function testLiquidateAfterUpgradeLiquidator() public debuggingOnly forkAtBlock(MODE_MAINNET, 9382006) {
    // upgrade IonicLiquidator
    TransparentUpgradeableProxy proxyV3 = TransparentUpgradeableProxy(payable(ap.getAddress("IonicUniV3Liquidator")));
    IonicUniV3Liquidator implV3 = new IonicUniV3Liquidator();
    IonicUniV3Liquidator liquidatorV3 = IonicUniV3Liquidator(payable(ap.getAddress("IonicUniV3Liquidator")));
    PoolLens lens = PoolLens(0x70BB19a56BfAEc65aE861E6275A90163AbDF36a6);

    ProxyAdmin proxyAdmin = ProxyAdmin(ap.getAddress("DefaultProxyAdmin"));

    vm.startPrank(proxyAdmin.owner());
    proxyAdmin.upgrade(proxyV3, address(implV3));
    vm.stopPrank();

    vm.startPrank(0x1155b614971f16758C92c4890eD338C9e3ede6b7);
    liquidatorV3.setPoolLens(address(lens));
    liquidatorV3.setHealthFactorThreshold(1e18);
    vm.stopPrank();

    IonicComptroller pool = IonicComptroller(0xFB3323E24743Caf4ADD0fDCCFB268565c0685556);
    (, , uint256 liquidity, uint256 shortfall) = pool.getAccountLiquidity(0x92eA6902C5023CC632e3Fd84dE7CcA6b98FE853d);
    emit log_named_uint("liquidity", liquidity);
    emit log_named_uint("shortfall", shortfall);

    uint256 healthFactor = lens.getHealthFactor(0x92eA6902C5023CC632e3Fd84dE7CcA6b98FE853d, pool);
    emit log_named_uint("hf before", healthFactor);

    ILiquidator.LiquidateToTokensWithFlashSwapVars memory vars = ILiquidator.LiquidateToTokensWithFlashSwapVars({
      borrower: 0x92eA6902C5023CC632e3Fd84dE7CcA6b98FE853d,
      repayAmount: 1134537086250983,
      cErc20: ICErc20(0x71ef7EDa2Be775E5A7aa8afD02C45F059833e9d2),
      cTokenCollateral: ICErc20(0x71ef7EDa2Be775E5A7aa8afD02C45F059833e9d2),
      flashSwapContract: 0x468cC91dF6F669CaE6cdCE766995Bd7874052FBc,
      minProfitAmount: 0,
      redemptionStrategies: new IRedemptionStrategy[](0),
      strategyData: new bytes[](0),
      debtFundingStrategies: new IFundsConversionStrategy[](0),
      debtFundingStrategiesData: new bytes[](0)
    });
    liquidatorV3.safeLiquidateToTokensWithFlashLoan(vars);

    uint256 healthFactorAfter = lens.getHealthFactor(0x92eA6902C5023CC632e3Fd84dE7CcA6b98FE853d, pool);
    emit log_named_uint("hf after", healthFactorAfter);
  }

  function testLiquidateAfterUpgradeLiquidatorExpressRelay() public debuggingOnly forkAtBlock(MODE_MAINNET, 9382006) {
    // upgrade IonicLiquidator
    TransparentUpgradeableProxy proxyV3 = TransparentUpgradeableProxy(payable(ap.getAddress("IonicUniV3Liquidator")));
    IonicUniV3Liquidator implV3 = new IonicUniV3Liquidator();
    IonicUniV3Liquidator liquidatorV3 = IonicUniV3Liquidator(payable(ap.getAddress("IonicUniV3Liquidator")));
    PoolLens lens = PoolLens(0x70BB19a56BfAEc65aE861E6275A90163AbDF36a6);
    address expressRelay = makeAddr("expressRelay");

    ProxyAdmin proxyAdmin = ProxyAdmin(ap.getAddress("DefaultProxyAdmin"));

    vm.startPrank(proxyAdmin.owner());
    proxyAdmin.upgrade(proxyV3, address(implV3));
    vm.stopPrank();

    vm.startPrank(0x1155b614971f16758C92c4890eD338C9e3ede6b7);
    liquidatorV3.setPoolLens(address(lens));
    liquidatorV3.setHealthFactorThreshold(95e16);
    liquidatorV3.setExpressRelay(expressRelay);
    vm.stopPrank();

    IonicComptroller pool = IonicComptroller(0xFB3323E24743Caf4ADD0fDCCFB268565c0685556);
    (, , uint256 liquidity, uint256 shortfall) = pool.getAccountLiquidity(0x92eA6902C5023CC632e3Fd84dE7CcA6b98FE853d);
    emit log_named_uint("liquidity", liquidity);
    emit log_named_uint("shortfall", shortfall);

    uint256 healthFactor = lens.getHealthFactor(0x92eA6902C5023CC632e3Fd84dE7CcA6b98FE853d, pool);
    emit log_named_uint("hf before", healthFactor);

    address borrower = address(0x92eA6902C5023CC632e3Fd84dE7CcA6b98FE853d);

    ILiquidator.LiquidateToTokensWithFlashSwapVars memory vars = ILiquidator.LiquidateToTokensWithFlashSwapVars({
      borrower: borrower,
      repayAmount: 1134537086250983,
      cErc20: ICErc20(0x71ef7EDa2Be775E5A7aa8afD02C45F059833e9d2),
      cTokenCollateral: ICErc20(0x71ef7EDa2Be775E5A7aa8afD02C45F059833e9d2),
      flashSwapContract: 0x468cC91dF6F669CaE6cdCE766995Bd7874052FBc,
      minProfitAmount: 0,
      redemptionStrategies: new IRedemptionStrategy[](0),
      strategyData: new bytes[](0),
      debtFundingStrategies: new IFundsConversionStrategy[](0),
      debtFundingStrategiesData: new bytes[](0)
    });

    vm.mockCall(
      expressRelay,
      abi.encodeWithSelector(
        bytes4(keccak256("isPermissioned(address,bytes)")),
        address(liquidatorV3),
        abi.encode(borrower)
      ),
      abi.encode(false)
    );
    vm.expectRevert("invalid liquidation");
    liquidatorV3.safeLiquidateToTokensWithFlashLoan(vars);

    vm.mockCall(
      expressRelay,
      abi.encodeWithSelector(
        bytes4(keccak256("isPermissioned(address,bytes)")),
        address(liquidatorV3),
        abi.encode(borrower)
      ),
      abi.encode(true)
    );
    liquidatorV3.safeLiquidateToTokensWithFlashLoan(vars);

    uint256 healthFactorAfter = lens.getHealthFactor(0x92eA6902C5023CC632e3Fd84dE7CcA6b98FE853d, pool);
    emit log_named_uint("hf after", healthFactorAfter);
  }

  // TODO test with marginal shortfall for liquidation penalty errors
  function _testLiquidatorLiquidate(address contractForFlashSwap) internal {
    IonicComptroller pool = IonicComptroller(poolAddress);
    //    _upgradePoolWithExtension(Unitroller(payable(poolAddress)));
    //upgradeRegistry();

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
      vm.prank(pool.admin());
      pool._setBorrowCapForCollateral(address(usdcMarket), address(wethMarket), 1e36);
    }

    {
      vm.prank(pool.admin());
      pool._borrowCapWhitelist(0x2BE717340023C9e14C1Bb12cb3ecBcfd3c3fB038, address(this), true);
    }

    {
      vm.prank(wethWhale);
      weth.transfer(address(this), 0.1e18);

      weth.approve(address(wethMarket), 1e36);
      require(wethMarket.mint(0.1e18) == 0, "mint weth failed");
      pool.enterMarkets(asArray(address(usdcMarket), address(wethMarket)));
    }

    {
      vm.startPrank(usdcWhale);
      usdc.approve(address(usdcMarket), 2e36);
      require(usdcMarket.mint(70e6) == 0, "mint usdc failed");
      vm.stopPrank();
    }

    {
      require(usdcMarket.borrow(50e6) == 0, "borrow usdc failed");

      // the collateral prices change
      BasePriceOracle mpo = pool.oracle();
      uint256 priceCollateral = mpo.getUnderlyingPrice(wethMarket);
      vm.mockCall(
        address(mpo),
        abi.encodeWithSelector(mpo.getUnderlyingPrice.selector, wethMarket),
        abi.encode(priceCollateral / 10)
      );
    }

    (IRedemptionStrategy[] memory strategies, bytes[] memory strategiesData) = liquidatorsRegistry
      .getRedemptionStrategies(weth, usdc);

    uint256 seizedAmount = liquidator.safeLiquidateToTokensWithFlashLoan(
      ILiquidator.LiquidateToTokensWithFlashSwapVars({
        borrower: address(this),
        repayAmount: 10e6,
        cErc20: usdcMarket,
        cTokenCollateral: wethMarket,
        flashSwapContract: contractForFlashSwap,
        minProfitAmount: 6,
        redemptionStrategies: strategies,
        strategyData: strategiesData,
        debtFundingStrategies: new IFundsConversionStrategy[](0),
        debtFundingStrategiesData: new bytes[](0)
      })
    );

    emit log_named_uint("seized amount", seizedAmount);
    require(seizedAmount > 0, "didn't seize any assets");
  }
}
