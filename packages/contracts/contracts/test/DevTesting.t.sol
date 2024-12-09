// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { ERC20 } from "solmate/tokens/ERC20.sol";
import { IERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

import "./config/BaseTest.t.sol";
import { IonicComptroller } from "../compound/ComptrollerInterface.sol";
import { ComptrollerFirstExtension } from "../compound/ComptrollerFirstExtension.sol";
import { CErc20PluginRewardsDelegate } from "../compound/CErc20PluginRewardsDelegate.sol";
import { Unitroller } from "../compound/Unitroller.sol";
import { DiamondExtension, DiamondBase } from "../ionic/DiamondExtension.sol";
import { ICErc20 } from "../compound/CTokenInterfaces.sol";
import { ISwapRouter } from "../external/uniswap/ISwapRouter.sol";
import { RedstoneAdapterPriceOracle } from "../oracles/default/RedstoneAdapterPriceOracle.sol";
import { RedstoneAdapterPriceOracleWrsETH } from "../oracles/default/RedstoneAdapterPriceOracleWrsETH.sol";
import { RedstoneAdapterPriceOracleWeETH } from "../oracles/default/RedstoneAdapterPriceOracleWeETH.sol";
import { MasterPriceOracle, BasePriceOracle } from "../oracles/MasterPriceOracle.sol";
import { PoolLens } from "../PoolLens.sol";
import { PoolLensSecondary } from "../PoolLensSecondary.sol";
import { JumpRateModel } from "../compound/JumpRateModel.sol";
import { LeveredPositionsLens } from "../ionic/levered/LeveredPositionsLens.sol";
import { ILiquidatorsRegistry } from "../liquidators/registry/ILiquidatorsRegistry.sol";
import { ILeveredPositionFactory } from "../ionic/levered/ILeveredPositionFactory.sol";
import { LeveredPositionFactoryFirstExtension } from "../ionic/levered/LeveredPositionFactoryFirstExtension.sol";
import { LeveredPositionFactorySecondExtension } from "../ionic/levered/LeveredPositionFactorySecondExtension.sol";
import { LeveredPositionFactory } from "../ionic/levered/LeveredPositionFactory.sol";
import { LeveredPositionStorage } from "../ionic/levered/LeveredPositionStorage.sol";
import { LeveredPosition } from "../ionic/levered/LeveredPosition.sol";
import { IonicFlywheelLensRouter, IonicComptroller, ICErc20, ERC20, IPriceOracle_IFLR } from "../ionic/strategies/flywheel/IonicFlywheelLensRouter.sol";
import { PoolDirectory } from "../PoolDirectory.sol";
import { AlgebraSwapLiquidator } from "../liquidators/AlgebraSwapLiquidator.sol";
import { AerodromeV2Liquidator } from "../liquidators/AerodromeV2Liquidator.sol";
import { AerodromeCLLiquidator } from "../liquidators/AerodromeCLLiquidator.sol";
import { CurveSwapLiquidator } from "../liquidators/CurveSwapLiquidator.sol";
import { CurveV2LpTokenPriceOracleNoRegistry } from "../oracles/default/CurveV2LpTokenPriceOracleNoRegistry.sol";
import { IRouter_Aerodrome } from "../external/aerodrome/IAerodromeRouter.sol";
import { VelodromeV2Liquidator } from "../liquidators/VelodromeV2Liquidator.sol";
import { IRouter_Velodrome } from "../external/velodrome/IVelodromeRouter.sol";
import { IonicUniV3Liquidator } from "../IonicUniV3Liquidator.sol";
import "forge-std/console.sol";

struct HealthFactorVars {
  uint256 usdcSupplied;
  uint256 wethSupplied;
  uint256 ezEthSuppled;
  uint256 stoneSupplied;
  uint256 wbtcSupplied;
  uint256 weEthSupplied;
  uint256 merlinBTCSupplied;
  uint256 usdcBorrowed;
  uint256 wethBorrowed;
  uint256 ezEthBorrowed;
  uint256 stoneBorrowed;
  uint256 wbtcBorrowed;
  uint256 weEthBorrowed;
  uint256 merlinBTCBorrowed;
  ICErc20 testCToken;
  address testUnderlying;
  uint256 amountBorrow;
}

contract DevTesting is BaseTest {
  IonicComptroller pool = IonicComptroller(0xFB3323E24743Caf4ADD0fDCCFB268565c0685556);
  PoolLensSecondary lens2 = PoolLensSecondary(0x7Ea7BB80F3bBEE9b52e6Ed3775bA06C9C80D4154);
  PoolLens lens = PoolLens(0x70BB19a56BfAEc65aE861E6275A90163AbDF36a6);
  LeveredPositionsLens levPosLens;

  address deployer = 0x1155b614971f16758C92c4890eD338C9e3ede6b7;
  address multisig = 0x8Fba84867Ba458E7c6E2c024D2DE3d0b5C3ea1C2;

  ICErc20 wethMarket;
  ICErc20 usdcMarket;
  ICErc20 usdtMarket;
  ICErc20 wbtcMarket;
  ICErc20 ezEthMarket;
  ICErc20 stoneMarket;
  ICErc20 weEthMarket;
  ICErc20 merlinBTCMarket;

  // mode mainnet assets
  address WETH = 0x4200000000000000000000000000000000000006;
  address USDC = 0xd988097fb8612cc24eeC14542bC03424c656005f;
  address USDT = 0xf0F161fDA2712DB8b566946122a5af183995e2eD;
  address WBTC = 0xcDd475325D6F564d27247D1DddBb0DAc6fA0a5CF;
  address UNI = 0x3e7eF8f50246f725885102E8238CBba33F276747;
  address SNX = 0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3;
  address LINK = 0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb;
  address DAI = 0xE7798f023fC62146e8Aa1b36Da45fb70855a77Ea;
  address BAL = 0xD08a2917653d4E460893203471f0000826fb4034;
  address AAVE = 0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2;
  address weETH = 0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A;
  address merlinBTC = 0x59889b7021243dB5B1e065385F918316cD90D46c;
  IERC20Upgradeable wsuperOETH = IERC20Upgradeable(0x7FcD174E80f264448ebeE8c88a7C4476AAF58Ea6);
  IERC20Upgradeable superOETH = IERC20Upgradeable(0xDBFeFD2e8460a6Ee4955A68582F85708BAEA60A3);

  function afterForkSetUp() internal override {
    super.afterForkSetUp();

    if (block.chainid == MODE_MAINNET) {
      wethMarket = ICErc20(0x71ef7EDa2Be775E5A7aa8afD02C45F059833e9d2);
      usdcMarket = ICErc20(0x2BE717340023C9e14C1Bb12cb3ecBcfd3c3fB038);
      usdtMarket = ICErc20(0x94812F2eEa03A49869f95e1b5868C6f3206ee3D3);
      wbtcMarket = ICErc20(0xd70254C3baD29504789714A7c69d60Ec1127375C);
      ezEthMarket = ICErc20(0x59e710215d45F584f44c0FEe83DA6d43D762D857);
      stoneMarket = ICErc20(0x959FA710CCBb22c7Ce1e59Da82A247e686629310);
      weEthMarket = ICErc20(0xA0D844742B4abbbc43d8931a6Edb00C56325aA18);
      merlinBTCMarket = ICErc20(0x19F245782b1258cf3e11Eda25784A378cC18c108);
      ICErc20[] memory markets = pool.getAllMarkets();
      wethMarket = markets[0];
      usdcMarket = markets[1];
    } else {}
    levPosLens = LeveredPositionsLens(ap.getAddress("LeveredPositionsLens"));
  }

  function testModePoolBorrowers() public debuggingOnly fork(MODE_MAINNET) {
    emit log_named_array("borrowers", pool.getAllBorrowers());
  }

  function testModeLiquidationShortfall() public debuggingOnly fork(MODE_MAINNET) {
    (uint256 err, uint256 collateralValue, uint256 liquidity, uint256 shortfall) = pool.getAccountLiquidity(
      0xa75F9C8246f7269279bE4c969e7Bc6Eb619cC204
    );

    emit log_named_uint("err", err);
    emit log_named_uint("collateralValue", collateralValue);
    emit log_named_uint("liquidity", liquidity);
    emit log_named_uint("shortfall", shortfall);
  }

  function testModeHealthFactor() public debuggingOnly fork(MODE_MAINNET) {
    address rahul = 0x5A9e792143bf2708b4765C144451dCa54f559a19;

    uint256 wethSupplied = wethMarket.balanceOfUnderlying(rahul);
    uint256 usdcSupplied = usdcMarket.balanceOfUnderlying(rahul);
    uint256 usdtSupplied = usdtMarket.balanceOfUnderlying(rahul);
    uint256 wbtcSupplied = wbtcMarket.balanceOfUnderlying(rahul);
    // emit log_named_uint("wethSupplied", wethSupplied);
    emit log_named_uint("usdcSupplied", usdcSupplied);
    emit log_named_uint("usdtSupplied", usdtSupplied);
    emit log_named_uint("wbtcSupplied", wbtcSupplied);
    emit log_named_uint("value of wethSupplied", wethSupplied * pool.oracle().getUnderlyingPrice(wethMarket));
    emit log_named_uint("value of usdcSupplied", usdcSupplied * pool.oracle().getUnderlyingPrice(usdcMarket));
    emit log_named_uint("value of usdtSupplied", usdtSupplied * pool.oracle().getUnderlyingPrice(usdtMarket));
    emit log_named_uint("value of wbtcSupplied", wbtcSupplied * pool.oracle().getUnderlyingPrice(wbtcMarket));

    PoolLens newImpl = new PoolLens();
    //    TransparentUpgradeableProxy proxy = TransparentUpgradeableProxy(payable(address(lens)));
    //    vm.prank(dpa.owner());
    //    proxy.upgradeTo(address(newImpl));

    uint256 hf = newImpl.getHealthFactor(rahul, pool);

    emit log_named_uint("hf", hf);
  }

  function testNetAprMode() public debuggingOnly forkAtBlock(MODE_MAINNET, 8479829) {
    address user = 0x30D5047e839f079bDE1Ab16b34668f57391DacB3;
    int256 blocks = 30 * 24 * 365 * 60;
    IonicFlywheelLensRouter lensRouter = new IonicFlywheelLensRouter(
      PoolDirectory(0x39C353Cf9041CcF467A04d0e78B63d961E81458a)
    );
    int256 apr = lensRouter.getUserNetApr(user, blocks);

    emit log_named_int("apr", apr);
  }

  function testModeUsdcBorrowCaps() public debuggingOnly fork(MODE_MAINNET) {
    _testModeBorrowCaps(usdcMarket);
  }

  function testHypotheticalPosition() public debuggingOnly forkAtBlock(MODE_MAINNET, 8028296) {
    HealthFactorVars memory vars;

    address wolfy = 0x7d922bf0975424b3371074f54cC784AF738Dac0D;
    address usdcWhale = 0x70FF197c32E922700d3ff2483D250c645979855d;
    address wbtcWhale = 0xBD8CCf3ebE4CC2D57962cdC2756B143ce0135a6B;
    address wethWhale = 0xD746A2a6048C5D3AFF5766a8c4A0C8cFD2311745;

    address whale = wbtcWhale;
    vars.testCToken = wethMarket;
    vars.testUnderlying = WETH;
    vars.amountBorrow = 1e18 / 2;

    address[] memory cTokens = new address[](1);

    vm.startPrank(usdcWhale);
    ERC20(USDC).transfer(wolfy, ERC20(USDC).balanceOf(usdcWhale));
    vm.stopPrank();

    vm.startPrank(wbtcWhale);
    ERC20(WBTC).transfer(wolfy, ERC20(WBTC).balanceOf(wbtcWhale));
    vm.stopPrank();

    vm.startPrank(wethWhale);
    ERC20(WETH).transfer(wolfy, ERC20(WETH).balanceOf(wethWhale));
    vm.stopPrank();

    // emit log_named_uint("USDC balance", ERC20(USDC).balanceOf(wolfy));
    // emit log_named_uint("WBTC balance", ERC20(WBTC).balanceOf(wolfy));
    // emit log_named_uint("WETH balance", ERC20(WETH).balanceOf(wolfy));

    vm.startPrank(wolfy);

    ERC20(USDC).approve(address(usdcMarket), ERC20(USDC).balanceOf(wolfy));
    usdcMarket.mint(ERC20(USDC).balanceOf(wolfy));
    cTokens[0] = address(usdcMarket);
    pool.enterMarkets(cTokens);

    ERC20(WBTC).approve(address(wbtcMarket), ERC20(WBTC).balanceOf(wolfy));
    wbtcMarket.mint(ERC20(WBTC).balanceOf(wolfy));
    cTokens[0] = address(wbtcMarket);
    pool.enterMarkets(cTokens);

    ERC20(WETH).approve(address(wethMarket), ERC20(WETH).balanceOf(wolfy));
    wethMarket.mint(ERC20(WETH).balanceOf(wolfy));
    cTokens[0] = address(wethMarket);
    pool.enterMarkets(cTokens);

    wethMarket.borrow(1e18);

    vm.stopPrank();

    vars.usdcSupplied = usdcMarket.balanceOfUnderlying(wolfy);
    vars.wethSupplied = wethMarket.balanceOfUnderlying(wolfy);
    vars.ezEthSuppled = ezEthMarket.balanceOfUnderlying(wolfy);
    vars.stoneSupplied = stoneMarket.balanceOfUnderlying(wolfy);
    vars.wbtcSupplied = wbtcMarket.balanceOfUnderlying(wolfy);
    vars.weEthSupplied = weEthMarket.balanceOfUnderlying(wolfy);
    vars.merlinBTCSupplied = merlinBTCMarket.balanceOfUnderlying(wolfy);

    vars.usdcBorrowed = usdcMarket.borrowBalanceCurrent(wolfy);
    vars.wethBorrowed = wethMarket.borrowBalanceCurrent(wolfy);
    vars.ezEthBorrowed = ezEthMarket.borrowBalanceCurrent(wolfy);
    vars.stoneBorrowed = stoneMarket.borrowBalanceCurrent(wolfy);
    vars.wbtcBorrowed = wbtcMarket.borrowBalanceCurrent(wolfy);
    vars.weEthBorrowed = weEthMarket.borrowBalanceCurrent(wolfy);
    vars.merlinBTCBorrowed = merlinBTCMarket.borrowBalanceCurrent(wolfy);

    emit log_named_uint("usdcSupplied", vars.usdcSupplied);
    emit log_named_uint("wethSupplied", vars.wethSupplied);
    emit log_named_uint("ezEthSupplied", vars.ezEthSuppled);
    emit log_named_uint("stoneSupplied", vars.stoneSupplied);
    emit log_named_uint("wbtcSupplied", vars.wbtcSupplied);
    emit log_named_uint("weEthSupplied", vars.weEthSupplied);
    emit log_named_uint("merlinBTCSupplied", vars.merlinBTCSupplied);

    emit log_named_uint("-------------------------------------------------", 0);
    emit log_named_uint("usdcBorrowed", vars.usdcBorrowed);
    emit log_named_uint("wethBorrowed", vars.wethBorrowed);
    emit log_named_uint("ezEthBorrowed", vars.ezEthBorrowed);
    emit log_named_uint("stoneBorrowed", vars.stoneBorrowed);
    emit log_named_uint("wbtcBorrowed", vars.wbtcBorrowed);
    emit log_named_uint("weEthBorrowed", vars.weEthBorrowed);
    emit log_named_uint("merlinBTCBorrowed", vars.merlinBTCBorrowed);

    // emit log_named_uint("value of usdcSupplied", vars.usdcSupplied * pool.oracle().getUnderlyingPrice(usdcMarket));
    // emit log_named_uint("value of wethSupplied", vars.wethSupplied * pool.oracle().getUnderlyingPrice(wethMarket));
    // emit log_named_uint("value of ezEthSupplied", vars.ezEthSuppled * pool.oracle().getUnderlyingPrice(ezEthMarket));
    // emit log_named_uint("value of stoneSupplied", vars.stoneSupplied * pool.oracle().getUnderlyingPrice(stoneMarket));
    // emit log_named_uint("value of wbtcSupplied", vars.wbtcSupplied * pool.oracle().getUnderlyingPrice(wbtcMarket));

    // emit log_named_uint("value of usdcBorrowed", vars.usdcBorrowed * pool.oracle().getUnderlyingPrice(usdcMarket));
    // emit log_named_uint("value of wethBorrowed", vars.wethBorrowed * pool.oracle().getUnderlyingPrice(wethMarket));
    // emit log_named_uint("value of ezEthBorrowed", vars.ezEthBorrowed * pool.oracle().getUnderlyingPrice(ezEthMarket));
    // emit log_named_uint("value of stoneBorrowed", vars.stoneBorrowed * pool.oracle().getUnderlyingPrice(stoneMarket));
    // emit log_named_uint("value of wbtcBorrowed", vars.wbtcBorrowed * pool.oracle().getUnderlyingPrice(wbtcMarket));

    vm.startPrank(whale);
    ERC20(vars.testUnderlying).transfer(wolfy, ERC20(vars.testUnderlying).balanceOf(whale));
    vm.stopPrank();

    uint256 hf = lens.getHealthFactor(wolfy, pool);
    uint256 hypothetical = lens.getHealthFactorHypothetical(
      pool,
      wolfy,
      address(vars.testCToken),
      0,
      0,
      vars.amountBorrow
    );

    (uint256 err, uint256 collateralValue, uint256 liquidity, uint256 shortfall) = pool.getAccountLiquidity(wolfy);

    emit log_named_uint("-------------------------------------------------", 0);
    emit log_named_uint("Collateral Value Before", collateralValue);
    emit log_named_uint("Liquidity Before", liquidity);
    emit log_named_uint("hf before", hf);
    emit log_named_uint("hypothetical hf", hypothetical);

    vm.startPrank(wolfy);
    ERC20(vars.testUnderlying).approve(address(vars.testCToken), vars.amountBorrow);
    vars.testCToken.repayBorrow(vars.amountBorrow);
    vm.stopPrank();

    uint256 hfAfter = lens.getHealthFactor(wolfy, pool);
    (err, collateralValue, liquidity, shortfall) = pool.getAccountLiquidity(wolfy);

    emit log_named_uint("-------------------------------------------------", 0);
    emit log_named_uint("Collateral Value After", collateralValue);
    emit log_named_uint("Liquidity After", liquidity);
    emit log_named_uint("hf after", hfAfter);
    emit log_named_uint("user balance after", ERC20(vars.testUnderlying).balanceOf(wolfy));
    emit log_named_uint("new borrow balance after repay", vars.testCToken.borrowBalanceCurrent(wolfy));
  }

  function testModeUsdtBorrowCaps() public debuggingOnly fork(MODE_MAINNET) {
    _testModeBorrowCaps(usdtMarket);
  }

  function testModeWethBorrowCaps() public debuggingOnly fork(MODE_MAINNET) {
    _testModeBorrowCaps(wethMarket);
    wethMarket.accrueInterest();
    _testModeBorrowCaps(wethMarket);
  }

  function _testModeBorrowCaps(ICErc20 market) internal {
    uint256 borrowCapUsdc = pool.borrowCaps(address(market));
    uint256 totalBorrowsCurrent = market.totalBorrowsCurrent();

    uint256 wethBorrowAmount = 154753148031252;
    console.log("borrowCapUsdc %e", borrowCapUsdc);
    console.log("totalBorrowsCurrent %e", totalBorrowsCurrent);
    console.log("new totalBorrowsCurrent %e", totalBorrowsCurrent + wethBorrowAmount);
  }

  function testMarketMember() public debuggingOnly fork(MODE_MAINNET) {
    address rahul = 0x5A9e792143bf2708b4765C144451dCa54f559a19;
    ICErc20[] memory markets = pool.getAllMarkets();

    for (uint256 i = 0; i < markets.length; i++) {
      if (pool.checkMembership(rahul, markets[i])) {
        emit log("is a member");
      } else {
        emit log("NOT a member");
      }
    }
  }

  function testGetCashError() public debuggingOnly fork(MODE_MAINNET) {
    ICErc20 market = ICErc20(0x49950319aBE7CE5c3A6C90698381b45989C99b46);
    market.getCash();
  }

  function testWrsEthBalanceOfError() public debuggingOnly fork(MODE_MAINNET) {
    address wrsEthMarketAddress = 0x49950319aBE7CE5c3A6C90698381b45989C99b46;
    ERC20 wrsEth = ERC20(0xe7903B1F75C534Dd8159b313d92cDCfbC62cB3Cd);
    wrsEth.balanceOf(0x1155b614971f16758C92c4890eD338C9e3ede6b7);
  }

  function testModeRepay() public debuggingOnly fork(MODE_MAINNET) {
    address user = 0x1A3C4E9B49e4fc595fB7e5f723159bA73a9426e7;
    ICErc20 market = usdcMarket;
    ERC20 asset = ERC20(market.underlying());

    uint256 borrowBalance = market.borrowBalanceCurrent(user);
    emit log_named_uint("borrowBalance", borrowBalance);

    vm.startPrank(user);
    asset.approve(address(market), borrowBalance);
    uint256 err = market.repayBorrow(borrowBalance / 2);

    emit log_named_uint("error", err);
  }

  function testAssetsPrices() public debuggingOnly fork(MODE_MAINNET) {
    MasterPriceOracle mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));

    emit log_named_uint("WETH price", mpo.price(WETH));
    emit log_named_uint("USDC price", mpo.price(USDC));
    emit log_named_uint("USDT price", mpo.price(USDT));
    emit log_named_uint("UNI price", mpo.price(UNI));
    emit log_named_uint("SNX price", mpo.price(SNX));
    emit log_named_uint("LINK price", mpo.price(LINK));
    emit log_named_uint("DAI price", mpo.price(DAI));
    emit log_named_uint("BAL price", mpo.price(BAL));
    emit log_named_uint("AAVE price", mpo.price(AAVE));
    emit log_named_uint("WBTC price", mpo.price(WBTC));
  }

  function testDeployedMarkets() public debuggingOnly fork(MODE_MAINNET) {
    ICErc20[] memory markets = pool.getAllMarkets();

    for (uint8 i = 0; i < markets.length; i++) {
      emit log_named_address("market", address(markets[i]));
      emit log(markets[i].symbol());
      emit log(markets[i].name());
    }
  }

  function testDisableCollateralUsdc() public debuggingOnly fork(MODE_MAINNET) {
    address user = 0xF70CBE91fB1b1AfdeB3C45Fb8CDD2E1249b5b75E;
    address usdcMarketAddr = 0x2BE717340023C9e14C1Bb12cb3ecBcfd3c3fB038;

    vm.startPrank(user);

    uint256 borrowed = ICErc20(usdcMarketAddr).borrowBalanceCurrent(user);

    emit log_named_uint("borrowed", borrowed);

    pool.exitMarket(usdcMarketAddr);
  }

  function testBorrowRateAtRatio() public debuggingOnly fork(MODE_MAINNET) {
    uint256 rate = levPosLens.getBorrowRateAtRatio(wethMarket, ezEthMarket, 9988992945501686, 2e18);
    emit log_named_uint("borrow rate at ratio", rate);
  }

  function testAssetAsCollateralCap() public debuggingOnly fork(MODE_MAINNET) {
    address MODE_EZETH = 0x2416092f143378750bb29b79eD961ab195CcEea5;
    address ezEthWhale = 0x2344F131B07E6AFd943b0901C55898573F0d1561;

    vm.startPrank(multisig);
    uint256 errCode = pool._deployMarket(
      1, //delegateType
      abi.encode(
        MODE_EZETH,
        address(pool),
        ap.getAddress("FeeDistributor"),
        0x21a455cEd9C79BC523D4E340c2B97521F4217817, // irm - jump rate model on mode
        "Ionic Renzo Restaked ETH",
        "ionezETH",
        0.10e18,
        0.10e18
      ),
      "",
      0.70e18
    );
    vm.stopPrank();
    require(errCode == 0, "error deploying market");

    ICErc20[] memory markets = pool.getAllMarkets();
    ICErc20 ezEthMarket = markets[markets.length - 1];

    //    uint256 cap = pool.getAssetAsCollateralValueCap(ezEthMarket, usdcMarket, false, deployer);
    uint256 cap = pool.supplyCaps(address(ezEthMarket));
    require(cap == 0, "non-zero cap");

    vm.startPrank(ezEthWhale);
    ERC20(MODE_EZETH).approve(address(ezEthMarket), 1e36);
    errCode = ezEthMarket.mint(1e18);
    require(errCode == 0, "should be unable to supply");
  }

  function testNewStoneMarketCapped() public debuggingOnly fork(MODE_MAINNET) {
    address MODE_STONE = 0x80137510979822322193FC997d400D5A6C747bf7;
    address stoneWhale = 0x76486cbED5216C82d26Ee60113E48E06C189541A;

    address redstoneOracleAddress = 0x63A1531a06F0Ac597a0DfA5A516a37073c3E1e0a;
    RedstoneAdapterPriceOracle oracle = RedstoneAdapterPriceOracle(redstoneOracleAddress);
    MasterPriceOracle mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));

    BasePriceOracle[] memory oracles = new BasePriceOracle[](1);
    oracles[0] = oracle;
    vm.prank(mpo.admin());
    mpo.add(asArray(MODE_STONE), oracles);

    vm.startPrank(multisig);
    uint256 errCode = pool._deployMarket(
      1, //delegateType
      abi.encode(
        MODE_STONE,
        address(pool),
        ap.getAddress("FeeDistributor"),
        0x21a455cEd9C79BC523D4E340c2B97521F4217817, // irm - jump rate model on mode
        "Ionic StakeStone Ether",
        "ionSTONE",
        0.10e18,
        0.10e18
      ),
      "",
      0.70e18
    );
    vm.stopPrank();
    require(errCode == 0, "error deploying market");

    ICErc20[] memory markets = pool.getAllMarkets();
    ICErc20 stoneMarket = markets[markets.length - 1];

    //    uint256 cap = pool.getAssetAsCollateralValueCap(stoneMarket, usdcMarket, false, deployer);
    uint256 cap = pool.supplyCaps(address(stoneMarket));
    require(cap == 0, "non-zero cap");

    vm.startPrank(stoneWhale);
    ERC20(MODE_STONE).approve(address(stoneMarket), 1e36);
    vm.expectRevert("not authorized");
    errCode = stoneMarket.mint(1e18);
    //require(errCode != 0, "should be unable to supply");
  }

  function testRegisterSFS() public debuggingOnly fork(MODE_MAINNET) {
    emit log_named_address("pool admin", pool.admin());

    vm.startPrank(multisig);
    pool.registerInSFS();

    ICErc20[] memory markets = pool.getAllMarkets();

    for (uint8 i = 0; i < markets.length; i++) {
      markets[i].registerInSFS();
    }
  }

  function upgradePool() internal {
    ComptrollerFirstExtension newComptrollerExtension = new ComptrollerFirstExtension();

    Unitroller asUnitroller = Unitroller(payable(address(pool)));

    // upgrade to the new comptroller extension
    vm.startPrank(asUnitroller.admin());
    asUnitroller._registerExtension(newComptrollerExtension, DiamondExtension(asUnitroller._listExtensions()[1]));

    //asUnitroller._upgrade();
    vm.stopPrank();
  }

  function testModeBorrowRate() public fork(MODE_MAINNET) {
    //ICErc20[] memory markets = pool.getAllMarkets();

    IonicComptroller pool = ezEthMarket.comptroller();
    vm.prank(pool.admin());
    ezEthMarket._setInterestRateModel(JumpRateModel(0x413aD59b80b1632988d478115a466bdF9B26743a));

    JumpRateModel discRateModel = JumpRateModel(ezEthMarket.interestRateModel());

    uint256 borrows = 200e18;
    uint256 cash = 5000e18 - borrows;
    uint256 reserves = 1e18;
    uint256 rate = discRateModel.getBorrowRate(cash, borrows, reserves);

    emit log_named_uint("rate per year %e", rate * discRateModel.blocksPerYear());
  }

  function testModeFetchBorrowers() public fork(MODE_MAINNET) {
    //    address[] memory borrowers = pool.getAllBorrowers();
    //    emit log_named_uint("borrowers.len", borrowers.length);

    //upgradePool();

    (uint256 totalPages, address[] memory borrowersPage) = pool.getPaginatedBorrowers(1, 0);

    emit log_named_uint("total pages with 300 size (default)", totalPages);

    (totalPages, borrowersPage) = pool.getPaginatedBorrowers(totalPages - 1, 50);
    emit log_named_array("last page of 300 borrowers", borrowersPage);

    (totalPages, borrowersPage) = pool.getPaginatedBorrowers(1, 50);
    emit log_named_uint("total pages with 50 size", totalPages);
    emit log_named_array("page of 50 borrowers", borrowersPage);

    //    for (uint256 i = 0; i < borrowers.length; i++) {
    //      (
    //        uint256 error,
    //        uint256 collateralValue,
    //        uint256 liquidity,
    //        uint256 shortfall
    //      ) = pool.getAccountLiquidity(borrowers[i]);
    //
    //      emit log("");
    //      emit log_named_address("user", borrowers[i]);
    //      emit log_named_uint("collateralValue", collateralValue);
    //      if (liquidity > 0) emit log_named_uint("liquidity", liquidity);
    //      if (shortfall > 0) emit log_named_uint("SHORTFALL", shortfall);
    //    }
  }

  function testModeAccountLiquidity() public debuggingOnly fork(MODE_MAINNET) {
    _testAccountLiquidity(0x0C387030a5D3AcDcde1A8DDaF26df31BbC1CE763);
  }

  function _testAccountLiquidity(address borrower) internal {
    (uint256 error, uint256 collateralValue, uint256 liquidity, uint256 shortfall) = pool.getAccountLiquidity(borrower);

    emit log("");
    emit log_named_address("user", borrower);
    emit log_named_uint("collateralValue", collateralValue);
    if (liquidity > 0) emit log_named_uint("liquidity", liquidity);
    if (shortfall > 0) emit log_named_uint("SHORTFALL", shortfall);
  }

  function testModeDeployMarket() public debuggingOnly fork(MODE_MAINNET) {
    address MODE_WEETH = 0x028227c4dd1e5419d11Bb6fa6e661920c519D4F5;
    address weEthWhale = 0x6e55a90772B92f17f87Be04F9562f3faafd0cc38;

    vm.startPrank(pool.admin());
    uint256 errCode = pool._deployMarket(
      1, //delegateType
      abi.encode(
        MODE_WEETH,
        address(pool),
        ap.getAddress("FeeDistributor"),
        0x21a455cEd9C79BC523D4E340c2B97521F4217817, // irm - jump rate model on mode
        "Ionic Wrapped eETH",
        "ionweETH",
        0.10e18,
        0.10e18
      ),
      "",
      0.70e18
    );
    vm.stopPrank();
    require(errCode == 0, "error deploying market");

    ICErc20[] memory markets = pool.getAllMarkets();
    ICErc20 weEthMarket = markets[markets.length - 1];

    //    uint256 cap = pool.getAssetAsCollateralValueCap(weEthMarket, usdcMarket, false, deployer);
    uint256 cap = pool.supplyCaps(address(weEthMarket));
    require(cap == 0, "non-zero cap");

    vm.startPrank(weEthWhale);
    ERC20(MODE_WEETH).approve(address(weEthMarket), 1e36);
    errCode = weEthMarket.mint(0.01e18);
    require(errCode == 0, "should be unable to supply");
  }

  function testModeWrsETH() public debuggingOnly forkAtBlock(MODE_MAINNET, 6635923) {
    address wrsEth = 0x4186BFC76E2E237523CBC30FD220FE055156b41F;
    RedstoneAdapterPriceOracleWrsETH oracle = new RedstoneAdapterPriceOracleWrsETH(
      0x7C1DAAE7BB0688C9bfE3A918A4224041c7177256
    );
    MasterPriceOracle mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));

    BasePriceOracle[] memory oracles = new BasePriceOracle[](1);
    oracles[0] = oracle;
    vm.prank(multisig);
    mpo.add(asArray(wrsEth), oracles);

    uint256 price = mpo.price(wrsEth);
    emit log_named_uint("price of wrsEth", price);
  }

  function testModeWeETH() public debuggingOnly forkAtBlock(MODE_MAINNET, 6861468) {
    address weEth = 0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A;
    RedstoneAdapterPriceOracleWeETH oracle = new RedstoneAdapterPriceOracleWeETH(
      0x7C1DAAE7BB0688C9bfE3A918A4224041c7177256
    );
    MasterPriceOracle mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));

    BasePriceOracle[] memory oracles = new BasePriceOracle[](1);
    oracles[0] = oracle;
    vm.prank(multisig);
    mpo.add(asArray(weEth), oracles);

    uint256 price = mpo.price(weEth);
    emit log_named_uint("price of weEth", price);
    assertEq(price, 1036212437077011599);
  }

  function testPERLiquidation() public debuggingOnly forkAtBlock(MODE_MAINNET, 10255413) {
    vm.prank(0x5Cc070844E98F4ceC5f2fBE1592fB1ed73aB7b48);
    _functionCall(
      0xa12c1E460c06B1745EFcbfC9A1f666a8749B0e3A,
      hex"20b72325000000000000000000000000f28570694a6c9cd0494955966ae75af61abf5a0700000000000000000000000000000000000000000000000001bc1214ed792fbb0000000000000000000000004341620757bee7eb4553912fafc963e59c949147000000000000000000000000c53edeafb6d502daec5a7015d67936cea0cd0f520000000000000000000000000000000000000000000000000000000000000000",
      "error in call"
    );
  }

  function testCtokenUpgrade() public debuggingOnly forkAtBlock(MODE_MAINNET, 10255413) {
    CErc20PluginRewardsDelegate newImpl = new CErc20PluginRewardsDelegate();
    TransparentUpgradeableProxy proxy = TransparentUpgradeableProxy(payable(address(wethMarket)));

    (uint256[] memory poolIds, PoolDirectory.Pool[] memory pools) = PoolDirectory(
      0x39C353Cf9041CcF467A04d0e78B63d961E81458a
    ).getActivePools();

    emit log_named_uint("First Pool ID", poolIds[0]);
    emit log_named_uint("First Pool ID", poolIds[1]);
    emit log_named_string("First Pool Address", pools[0].name);
    emit log_named_string("First Pool Address", pools[0].name);
    emit log_named_address("First Pool Address", pools[0].creator);
    emit log_named_address("First Pool Address", pools[1].creator);
    emit log_named_address("First Pool Address", pools[0].comptroller);
    emit log_named_address("First Pool Address", pools[1].comptroller);
    //bytes32 bytesAtSlot = vm.load(address(proxy), 0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103);
    //address admin = address(uint160(uint256(bytesAtSlot)));
    //vm.prank(admin);
    //proxy.upgradeTo(address(newImpl));

    //vm.prank(dpa.owner());
    //proxy.upgradeTo(address(newImpl));
  }

  function testAerodromeV2Liquidator() public debuggingOnly forkAtBlock(BASE_MAINNET, 19968360) {
    AerodromeV2Liquidator liquidator = new AerodromeV2Liquidator();
    IERC20Upgradeable hyUSD = IERC20Upgradeable(0xCc7FF230365bD730eE4B352cC2492CEdAC49383e);
    IERC20Upgradeable eUSD = IERC20Upgradeable(0xCfA3Ef56d303AE4fAabA0592388F19d7C3399FB4);
    IERC20Upgradeable usdc = IERC20Upgradeable(0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913);
    address hyusdWhale = 0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb;
    address usdcWhale = 0xaac391f166f33CdaEfaa4AfA6616A3BEA66B694d;
    address eusdWhale = 0xEE8Bd6594E046d72D592ac0e278E3CA179b8f189;
    address aerodromeV2Router = 0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43;

    vm.startPrank(eusdWhale);
    eUSD.transfer(address(liquidator), 1000 ether);
    IRouter_Aerodrome.Route[] memory path = new IRouter_Aerodrome.Route[](1);
    path[0] = IRouter_Aerodrome.Route({
      from: address(eUSD),
      to: address(usdc),
      stable: true,
      factory: 0x420DD381b31aEf6683db6B902084cB0FFECe40Da
    });
    liquidator.redeem(eUSD, 1000 ether, abi.encode(aerodromeV2Router, path));
    emit log_named_uint("usdc received", usdc.balanceOf(address(liquidator)));
    vm.stopPrank();
  }

  function testAerodromeCLLiquidator() public debuggingOnly forkAtBlock(BASE_MAINNET, 19968360) {
    AerodromeCLLiquidator liquidator = new AerodromeCLLiquidator();
    IERC20Upgradeable weth = IERC20Upgradeable(0x4200000000000000000000000000000000000006);
    address superOETHWhale = 0xF1010eE787Ee588766b441d7cC397b40DdFB17a3;
    address aerodromeCLRouter = 0xBE6D8f0d05cC4be24d5167a3eF062215bE6D18a5;

    vm.startPrank(superOETHWhale);
    superOETH.transfer(address(liquidator), 1 ether);
    liquidator.redeem(superOETH, 1 ether, abi.encode(address(superOETH), address(weth), int24(1), aerodromeCLRouter));
    emit log_named_uint("weth received", weth.balanceOf(address(liquidator)));
    vm.stopPrank();
  }

  function testAerodromeCLLiquidatorWrap() public debuggingOnly forkAtBlock(BASE_MAINNET, 20203998) {
    IERC20Upgradeable weth = IERC20Upgradeable(0x4200000000000000000000000000000000000006);
    address wethWhale = 0x751b77C43643a63362Ab024d466fcC1d75354295;
    address aerodromeCLRouter = 0xBE6D8f0d05cC4be24d5167a3eF062215bE6D18a5;

    AerodromeCLLiquidator liquidator = AerodromeCLLiquidator(0xb50De36105F6053006306553AB54e77224818B9B);

    vm.startPrank(wethWhale);
    weth.transfer(address(liquidator), 1 ether);
    liquidator.redeem(
      weth,
      1 ether,
      abi.encode(address(weth), address(wsuperOETH), aerodromeCLRouter, address(0), address(superOETH), 1)
    );
    emit log_named_uint("wsuperOETH received", wsuperOETH.balanceOf(address(liquidator)));
    vm.stopPrank();
  }

  function testAerodromeCLLiquidatorUnwrap() public debuggingOnly forkAtBlock(BASE_MAINNET, 19968360) {
    IERC20Upgradeable weth = IERC20Upgradeable(0x4200000000000000000000000000000000000006);
    address wsuperOethWhale = 0x0EEaCD4c475040463389d15EAd034d1291b008b1;
    address aerodromeCLRouter = 0xBE6D8f0d05cC4be24d5167a3eF062215bE6D18a5;

    AerodromeCLLiquidator liquidator = new AerodromeCLLiquidator();

    vm.startPrank(wsuperOethWhale);
    wsuperOETH.transfer(address(liquidator), 1 ether);
    liquidator.redeem(
      wsuperOETH,
      1 ether,
      abi.encode(address(wsuperOETH), address(weth), aerodromeCLRouter, address(superOETH), address(0), 1)
    );
    emit log_named_uint("weth received", weth.balanceOf(address(liquidator)));
    vm.stopPrank();
  }

  function testCurveSwapLiquidatorUSDCtowUSDM() public debuggingOnly forkAtBlock(BASE_MAINNET, 20237792) {
    address _pool = 0x63Eb7846642630456707C3efBb50A03c79B89D81;
    address usdc = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address usdm = 0x59D9356E565Ab3A36dD77763Fc0d87fEaf85508C;
    address wUSDM = 0x57F5E098CaD7A3D1Eed53991D4d66C45C9AF7812;
    address usdcWhale = 0x134575ff75F9882ca905EE1D78C9340C091d6056;
    CurveV2LpTokenPriceOracleNoRegistry oracle = new CurveV2LpTokenPriceOracleNoRegistry();
    CurveSwapLiquidator liquidator = new CurveSwapLiquidator();
    vm.prank(oracle.owner());
    oracle.registerPool(_pool, _pool);
    vm.prank(usdcWhale);
    IERC20Upgradeable(usdc).transfer(address(liquidator), 100e6);
    liquidator.redeem(IERC20Upgradeable(usdc), 100e6, abi.encode(oracle, wUSDM, address(0), usdm));
    emit log_named_uint("wUSDM received", IERC20Upgradeable(wUSDM).balanceOf(address(liquidator)));
  }

  function testCurveSwapLiquidatorwUSDMtoUSDC() public debuggingOnly forkAtBlock(BASE_MAINNET, 20237792) {
    address _pool = 0x63Eb7846642630456707C3efBb50A03c79B89D81;
    address usdc = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address usdm = 0x59D9356E565Ab3A36dD77763Fc0d87fEaf85508C;
    address wUSDM = 0x57F5E098CaD7A3D1Eed53991D4d66C45C9AF7812;
    address wusdmWhale = 0x9b8b04B6f82cD5e1dae58cA3614d445F93DeFc5c;
    CurveV2LpTokenPriceOracleNoRegistry oracle = new CurveV2LpTokenPriceOracleNoRegistry();
    CurveSwapLiquidator liquidator = new CurveSwapLiquidator();
    vm.prank(oracle.owner());
    oracle.registerPool(_pool, _pool);

    vm.startPrank(wusdmWhale);
    IERC20Upgradeable(wUSDM).transfer(address(liquidator), 30 ether);
    liquidator.redeem(IERC20Upgradeable(wUSDM), 30 ether, abi.encode(oracle, usdc, usdm, address(0)));
    emit log_named_uint("usdc received", IERC20Upgradeable(usdc).balanceOf(address(liquidator)));
  }

  function testKimLiquidator() public debuggingOnly forkAtBlock(MODE_MAINNET, 13579406) {
    address weth = 0x4200000000000000000000000000000000000006;
    address usdc = 0xd988097fb8612cc24eeC14542bC03424c656005f;
    address kimRouter = 0xAc48FcF1049668B285f3dC72483DF5Ae2162f7e8;
    address wethWhale = 0xe9b14a1Be94E70900EDdF1E22A4cB8c56aC9e10a;
    AlgebraSwapLiquidator liquidator = AlgebraSwapLiquidator(0x5cA3fd2c285C4138185Ef1BdA7573D415020F3C8);
    vm.startPrank(wethWhale);
    IERC20Upgradeable(weth).transfer(address(liquidator), 2018770577362160);
    liquidator.redeem(IERC20Upgradeable(weth), 2018770577362160, abi.encode(usdc, kimRouter));
    emit log_named_uint("usdc received", IERC20Upgradeable(usdc).balanceOf(address(liquidator)));
  }

  function testVelodromeV2Liquidator_mode_usdcToWeth() public debuggingOnly forkAtBlock(MODE_MAINNET, 13881743) {
    VelodromeV2Liquidator liquidator = new VelodromeV2Liquidator();
    IERC20Upgradeable usdc = IERC20Upgradeable(0xd988097fb8612cc24eeC14542bC03424c656005f);
    IERC20Upgradeable weth = IERC20Upgradeable(0x4200000000000000000000000000000000000006);
    address usdcWhale = 0xFd1D36995d76c0F75bbe4637C84C06E4A68bBB3a;

    address veloRouter = 0x3a63171DD9BebF4D07BC782FECC7eb0b890C2A45;

    vm.startPrank(usdcWhale);
    usdc.transfer(address(liquidator), 1000 * 10e6);
    IRouter_Velodrome.Route[] memory path = new IRouter_Velodrome.Route[](1);
    path[0] = IRouter_Velodrome.Route({ from: address(usdc), to: address(weth), stable: false });
    liquidator.redeem(usdc, 1000 * 10e6, abi.encode(veloRouter, path));
    emit log_named_uint("weth received", weth.balanceOf(address(liquidator)));
    vm.stopPrank();
  }

  function testVelodromeV2Liquidator_mode_wethToUSDC() public debuggingOnly forkAtBlock(MODE_MAINNET, 13881743) {
    VelodromeV2Liquidator liquidator = new VelodromeV2Liquidator();
    IERC20Upgradeable weth = IERC20Upgradeable(0x4200000000000000000000000000000000000006);
    IERC20Upgradeable usdc = IERC20Upgradeable(0xd988097fb8612cc24eeC14542bC03424c656005f);
    address wethWhale = 0xe9b14a1Be94E70900EDdF1E22A4cB8c56aC9e10a;

    address veloRouter = 0x3a63171DD9BebF4D07BC782FECC7eb0b890C2A45;

    vm.startPrank(wethWhale);
    weth.transfer(address(liquidator), 1 ether);
    IRouter_Velodrome.Route[] memory path = new IRouter_Velodrome.Route[](1);
    path[0] = IRouter_Velodrome.Route({ from: address(weth), to: address(usdc), stable: false });

    liquidator.redeem(weth, 1 ether, abi.encode(veloRouter, path));
    emit log_named_uint("usdc received", usdc.balanceOf(address(liquidator)));
    vm.stopPrank();
  }

  function test_liquidateWithAggregator() public debuggingOnly forkAtBlock(MODE_MAINNET, 15435970) {
    IonicUniV3Liquidator liquidator = IonicUniV3Liquidator(payable(0x50F13EC4B68c9522260d3ccd4F19826679B3Ce5C));
    emit log_named_address("liquidator", address(liquidator));
    address cErc20 = 0xA0D844742B4abbbc43d8931a6Edb00C56325aA18; // weEth
    address cTokenCollateral = 0x2BE717340023C9e14C1Bb12cb3ecBcfd3c3fB038; // usdc
    uint256 repayAmount = 843900759317990;
    address borrower = 0x1Bec4f239F1Ec11FD8DC7B31A8fea7A5bA5a9Aa4;
    address aggregatorTarget = 0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE; // lifi
    // 0xd988097fb8612cc24eeC14542bC03424c656005f usdc
    // 0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A weeth
    bytes memory aggregatorData = vm.parseBytes(
      "0x4666fc800d27477c9a16fe2929353656c1222839791dbe26e815e7533f731ea9a6b919bb00000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000010000000000000000000000000050f13ec4b68c9522260d3ccd4f19826679b3ce5c0000000000000000000000000000000000000000000000000002ff85fb26dbe8000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000000086c6966692d617069000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a307830303030303030303030303030303030303030303030303030303030303030303030303030303030000000000000000000000000000000000000000000000000000000000000000000007e15eb462cdc67cf92af1f7102465a8f8c7848740000000000000000000000007e15eb462cdc67cf92af1f7102465a8f8c784874000000000000000000000000d988097fb8612cc24eec14542bc03424c656005f00000000000000000000000004c0599ae5a44757c0af6f9ec3b93da8976c150a000000000000000000000000000000000000000000000000000000000027891800000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000f283bd37f90001d988097fb8612cc24eec14542bc03424c656005f000104c0599ae5a44757c0af6f9ec3b93da8976c150a0327891807030361590977620147ae00019b57dca972db5d8866c630554acdbdfe58b2659c000000011231deb6f5749ef6ce6943a275a1d3e7486f4eae59725ade04010205000601020203000205000100010400ff0000000000000000000000000053e85d00f2c6578a1205b842255ab9df9d05374425ba258e510faca5ab7ff941a1584bdd2174c94dd988097fb8612cc24eec14542bc03424c656005f4200000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000"
    );

    emit log_named_uint(
      "before collateral",
      IERC20Upgradeable(ICErc20(cTokenCollateral).underlying()).balanceOf(address(this))
    );
    emit log_named_uint("before borrow", IERC20Upgradeable(ICErc20(cErc20).underlying()).balanceOf(address(this)));

    vm.startPrank(0x1155b614971f16758C92c4890eD338C9e3ede6b7);
    liquidator.safeLiquidateWithAggregator(
      borrower,
      repayAmount,
      ICErc20(cErc20),
      ICErc20(cTokenCollateral),
      aggregatorTarget,
      aggregatorData
    );
    vm.stopPrank();

    emit log_named_uint(
      "profit collateral",
      IERC20Upgradeable(ICErc20(cTokenCollateral).underlying()).balanceOf(address(this))
    );
    emit log_named_uint("profit borrow", IERC20Upgradeable(ICErc20(cErc20).underlying()).balanceOf(address(this)));
  }

  function upgradeFactory(ILeveredPositionFactory factory) internal {
    LeveredPositionFactoryFirstExtension newExt1 = new LeveredPositionFactoryFirstExtension();
    LeveredPositionFactorySecondExtension newExt2 = new LeveredPositionFactorySecondExtension();

    vm.startPrank(factory.owner());
    DiamondBase asBase = DiamondBase(address(factory));
    address[] memory oldExts = asBase._listExtensions();

    if (oldExts.length == 1) {
      asBase._registerExtension(newExt1, DiamondExtension(oldExts[0]));
      asBase._registerExtension(newExt2, DiamondExtension(address(0)));
    } else if (oldExts.length == 2) {
      asBase._registerExtension(newExt1, DiamondExtension(oldExts[0]));
      asBase._registerExtension(newExt2, DiamondExtension(oldExts[1]));
    }
    vm.stopPrank();
  }

  function test_leveredPosition_aggregator() public debuggingOnly forkAtBlock(BASE_MAINNET, 23251823) {
    address USER = 0x1155b614971f16758C92c4890eD338C9e3ede6b7;
    ILeveredPositionFactory factory = ILeveredPositionFactory(ap.getAddress("LeveredPositionFactory"));
    upgradeFactory(factory);

    ICErc20 collateralAsset = ICErc20(0x84341B650598002d427570298564d6701733c805); // weEth
    ICErc20 stableAsset = ICErc20(0x49420311B518f3d0c94e897592014de53831cfA3); // weth
    vm.startPrank(USER);
    IERC20Upgradeable fundingAsset = IERC20Upgradeable(collateralAsset.underlying());
    LeveredPosition position = factory.createPosition(collateralAsset, stableAsset);
    emit log_named_address("position", address(position));
    fundingAsset.approve(address(position), type(uint256).max);
    position.fundPosition(
      fundingAsset,
      0.03 ether,
      address(0),
      abi.encode(address(0))
    );
    (uint256 supplyDelta, uint256 borrowDelta) = position.getSupplyAmountDelta(2 ether);
    emit log_named_uint("supplyDelta", supplyDelta);
    emit log_named_uint("borrowDelta", borrowDelta);

    address aggregatorTarget = 0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE;
    bytes memory aggregatorData = hex"4666fc80ddffa5afc347e458f2a79169fdd926c8080f864ee743d9da68bec9471aeef95a00000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000100000000000000000000000000d2a6330d610d9d0a13c0c0ac437906000838eb8500000000000000000000000000000000000000000000000000554a9fe78263a3000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000000086c6966692d617069000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a30783030303030303030303030303030303030303030303030303030303030303030303030303030303000000000000000000000000000000000000000000000000000000000000000000000f2614a233c7c3e7f08b1f887ba133a13f1eb2c55000000000000000000000000f2614a233c7c3e7f08b1f887ba133a13f1eb2c55000000000000000000000000420000000000000000000000000000000000000600000000000000000000000004c0599ae5a44757c0af6f9ec3b93da8976c150a0000000000000000000000000000000000000000000000000067C2EC2D07866100000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000001442646478b00000000000000000000000042000000000000000000000000000000000000060000000000000000000000000000000000000000000000000067C2EC2D07866100000000000000000000000004c0599ae5a44757c0af6f9ec3b93da8976c150a00000000000000000000000000000000000000000000000000554a9fe78263a20000000000000000000000001231deb6f5749ef6ce6943a275a1d3e7486f4eae00000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000004202420000000000000000000000000000000000000601ffff01302976a386fbb375033be3ac1e4112f76cf42ef7001231deb6f5749ef6ce6943a275a1d3e7486f4eae00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
    position.adjustLeverageRatio(2 ether, aggregatorTarget, aggregatorData, 100);
    
    vm.stopPrank();
  }

  function _functionCall(
    address target,
    bytes memory data,
    string memory errorMessage
  ) internal returns (bytes memory) {
    (bool success, bytes memory returndata) = target.call(data);

    if (!success) {
      // Look for revert reason and bubble it up if present
      if (returndata.length > 0) {
        // The easiest way to bubble the revert reason is using memory via assembly

        // solhint-disable-next-line no-inline-assembly
        assembly {
          let returndata_size := mload(returndata)
          revert(add(32, returndata), returndata_size)
        }
      } else {
        revert(errorMessage);
      }
    }

    return returndata;
  }

  function testRawCall() public debuggingOnly forkAtBlock(BASE_MAINNET, 20569373) {
    address caller = 0xC13110d04f22ed464Cb72A620fF8163585358Ff9;
    address target = 0x180272dDf5767C771b3a8d37A2DC6cA507aaa1d9;

    ILeveredPositionFactory factory = ILeveredPositionFactory(ap.getAddress("LeveredPositionFactory"));
    ILiquidatorsRegistry registry = factory.liquidatorsRegistry();

    AerodromeCLLiquidator aerodomeClLiquidator = new AerodromeCLLiquidator();

    IERC20Upgradeable inputToken = IERC20Upgradeable(WETH);
    IERC20Upgradeable outputToken = wsuperOETH;
    vm.startPrank(registry.owner());
    registry._setRedemptionStrategy(aerodomeClLiquidator, inputToken, outputToken);
    registry._setRedemptionStrategy(aerodomeClLiquidator, outputToken, inputToken);
    vm.stopPrank();

    bytes memory data = hex"c393d0e3";
    vm.prank(caller);
    _functionCall(target, data, "raw call failed");

    uint256 superOETHBalance = superOETH.balanceOf(target);
    emit log_named_uint("balance of levered position", superOETHBalance);
  }
}
