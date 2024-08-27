// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "./helpers/WithPool.sol";

import { ERC20 } from "solmate/tokens/ERC20.sol";
import { MockERC20 } from "solmate/test/utils/mocks/MockERC20.sol";
import { MasterPriceOracle } from "../oracles/MasterPriceOracle.sol";
import { PoolLensSecondary } from "../PoolLensSecondary.sol";
import { ICErc20 } from "../compound/CTokenInterfaces.sol";

contract MockAsset is MockERC20 {
  constructor() MockERC20("test", "test", 8) {}

  function deposit() external payable {}
}

contract MaxBorrowTest is WithPool {
  address usdcWhale = 0x625E7708f30cA75bfd92586e17077590C60eb4cD;
  address daiWhale = 0x06959153B974D0D5fDfd87D561db6d8d4FA0bb0B;

  struct LiquidationData {
    address[] cTokens;
    ICErc20[] allMarkets;
    MockAsset usdc;
    MockAsset dai;
  }

  function afterForkSetUp() internal override {
    super.setUpWithPool(
      MasterPriceOracle(ap.getAddress("MasterPriceOracle")),
      ERC20Upgradeable(ap.getAddress("wtoken"))
    );

    if (block.chainid == POLYGON_MAINNET) {
      vm.prank(0x369582d2010B6eD950B571F4101e3bB9b554876F); // SAND/WMATIC
      MockERC20(address(underlyingToken)).transfer(address(this), 100e18);
      setUpPool("polygon-test", false, 0.1e18, 1.1e18);
    } else if (block.chainid == BSC_MAINNET) {
      deal(address(underlyingToken), address(this), 100e18);
      setUpPool("bsc-test", false, 0.1e18, 1.1e18);
    }
  }

  // TODO redeploy to polygon to fix
  function testMaxBorrow() public fork(POLYGON_MAINNET) {
    PoolLensSecondary poolLensSecondary = new PoolLensSecondary();
    poolLensSecondary.initialize(poolDirectory);

    LiquidationData memory vars;
    vm.roll(1);
    vars.usdc = MockAsset(0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174);
    vars.dai = MockAsset(0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063);

    deployCErc20Delegate(address(vars.usdc), "USDC", "usdc", 0.9e18);
    deployCErc20Delegate(address(vars.dai), "DAI", "dai", 0.9e18);

    vars.allMarkets = comptroller.getAllMarkets();

    CErc20Delegate cToken = CErc20Delegate(address(vars.allMarkets[0]));

    CErc20Delegate cDaiToken = CErc20Delegate(address(vars.allMarkets[1]));

    vars.cTokens = new address[](1);

    address accountOne = address(1);
    PoolRolesAuthority pra = ionicAdmin.authoritiesRegistry().poolsAuthorities(address(comptroller));

    vm.startPrank(pra.owner());
    pra.setUserRole(accountOne, pra.BORROWER_ROLE(), true);
    vm.stopPrank();

    vm.prank(usdcWhale);
    MockERC20(address(vars.usdc)).transfer(accountOne, 10000e6);

    vm.prank(daiWhale);
    MockERC20(address(vars.dai)).transfer(accountOne, 10000e18);

    // Account One Supply
    {
      emit log("Account One Supply");
      vm.startPrank(accountOne);
      vars.usdc.approve(address(cToken), 1e36);
      cToken.mint(1e6);
      vars.cTokens[0] = address(cToken);
      comptroller.enterMarkets(vars.cTokens);

      vars.dai.approve(address(cDaiToken), 1e36);
      cDaiToken.mint(1e18);
      vars.cTokens[0] = address(cDaiToken);
      comptroller.enterMarkets(vars.cTokens);

      vm.stopPrank();
      assertEq(cToken.totalSupply(), 1e6 * 5);
      assertEq(cDaiToken.totalSupply(), 1e18 * 5);

      uint256 maxBorrow = poolLensSecondary.getMaxBorrow(accountOne, ICErc20(address(cToken)));
      uint256 maxDaiBorrow = poolLensSecondary.getMaxBorrow(accountOne, ICErc20(address(cDaiToken)));
      assertApproxEqAbs((maxBorrow * 1e18) / 10**cToken.decimals(), maxDaiBorrow, uint256(1e16), "!max borrow");
    }

    // borrow cap for collateral test
    {
      vm.prank(comptroller.admin());
      comptroller._setBorrowCapForCollateral(address(cToken), address(cDaiToken), 0.5e6);
    }

    uint256 maxBorrowAfterBorrowCap = poolLensSecondary.getMaxBorrow(accountOne, ICErc20(address(cToken)));
    assertApproxEqAbs(maxBorrowAfterBorrowCap, 0.5e6, uint256(1e5), "!max borrow");

    // blacklist
    {
      vm.prank(comptroller.admin());
      comptroller._blacklistBorrowingAgainstCollateral(address(cToken), address(cDaiToken), true);
    }

    uint256 maxBorrowAfterBlacklist = poolLensSecondary.getMaxBorrow(accountOne, ICErc20(address(cToken)));
    assertEq(maxBorrowAfterBlacklist, 0, "!blacklist");
  }

  // TODO test with the latest block and contracts and/or without the FSL
  function testBorrowCapPerCollateral() public debuggingOnly forkAtBlock(BSC_MAINNET, 23761190) {
    address payable jFiatPoolAddress = payable(0x31d76A64Bc8BbEffb601fac5884372DEF910F044);

    address poolAddress = jFiatPoolAddress;
    Comptroller pool = Comptroller(poolAddress);

    ComptrollerFirstExtension asExtension = ComptrollerFirstExtension(poolAddress);
    address[] memory borrowers = asExtension.getAllBorrowers();
    address someBorrower = borrowers[1];

    ICErc20[] memory markets = asExtension.getAllMarkets();
    for (uint256 i = 0; i < markets.length; i++) {
      ICErc20 market = markets[i];
      uint256 borrowed = market.borrowBalanceCurrent(someBorrower);
      if (borrowed > 0) {
        emit log("borrower has borrowed");
        emit log_uint(borrowed);
        emit log("from market");
        emit log_address(address(market));
        emit log_uint(i);
        emit log("");
      }

      uint256 collateral = market.balanceOf(someBorrower);
      if (collateral > 0) {
        emit log("has collateral");
        emit log_uint(collateral);
        emit log("in market");
        emit log_address(address(market));
        emit log_uint(i);
        emit log("");
      }
    }

    ICErc20 marketToBorrow = markets[0];
    ICErc20 cappedCollateralMarket = markets[6];
    uint256 borrowAmount = marketToBorrow.borrowBalanceCurrent(someBorrower);

    {
      (uint256 errBefore, , uint256 liquidityBefore, uint256 shortfallBefore) = pool.getHypotheticalAccountLiquidity(
        someBorrower,
        address(marketToBorrow),
        0,
        borrowAmount,
        0
      );
      emit log("errBefore");
      emit log_uint(errBefore);
      emit log("liquidityBefore");
      emit log_uint(liquidityBefore);
      emit log("shortfallBefore");
      emit log_uint(shortfallBefore);

      assertGt(liquidityBefore, 0, "expected positive liquidity");
    }

    vm.prank(pool.admin());
    asExtension._setBorrowCapForCollateral(address(marketToBorrow), address(cappedCollateralMarket), 1);
    emit log("");

    (uint256 errAfter, , uint256 liquidityAfter, uint256 shortfallAfter) = pool.getHypotheticalAccountLiquidity(
      someBorrower,
      address(marketToBorrow),
      0,
      borrowAmount,
      0
    );
    emit log("errAfter");
    emit log_uint(errAfter);
    emit log("liquidityAfter");
    emit log_uint(liquidityAfter);
    emit log("shortfallAfter");
    emit log_uint(shortfallAfter);

    assertGt(shortfallAfter, 0, "expected some shortfall");
  }
}
