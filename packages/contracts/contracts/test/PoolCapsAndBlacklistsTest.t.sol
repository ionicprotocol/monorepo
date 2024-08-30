// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "./config/MarketsTest.t.sol";
import { ICErc20 } from "../compound/CTokenInterfaces.sol";

contract PoolCapsAndBlacklistsTest is MarketsTest {
  Comptroller pool;
  ComptrollerFirstExtension asExtension;
  address borrower = 0x28C0208b7144B511C73586Bb07dE2100495e92f3; // ANKR account
  address otherSupplier = 0x2924973E3366690eA7aE3FCdcb2b4e136Cf7f8Cc; // Supplier of ankrBNBAnkrMkt
  ICErc20 ankrBNBAnkrMkt = ICErc20(0x71693C84486B37096192c9942852f542543639Bf);
  ICErc20 ankrBNBMkt = ICErc20(0xb2b01D6f953A28ba6C8f9E22986f5bDDb7653aEa);

  function afterForkSetUp() internal override {
    super.afterForkSetUp();

    // ankr pool
    pool = Comptroller(payable(0x1851e32F34565cb95754310b031C5a2Fc0a8a905));
    asExtension = ComptrollerFirstExtension(address(pool));
    _upgradeExistingPool(address(pool));

    _upgradeMarket(ankrBNBMkt);
    _upgradeMarket(ankrBNBAnkrMkt);

    // just some logging
    {
      uint256 borrowedAnkr = ankrBNBMkt.borrowBalanceCurrent(borrower);
      emit log_named_uint("ankrBnb borrow balance", borrowedAnkr);
      uint256 collateralAnkr = ankrBNBAnkrMkt.balanceOf(borrower);
      emit log_named_uint("ankrBnb collateral balance of ankrBNB-ANKR", collateralAnkr);

      uint256 borrowedOther = ankrBNBMkt.borrowBalanceCurrent(otherSupplier);
      emit log_named_uint("Other supplier borrower balance", borrowedOther);
      uint256 collateralOther = ankrBNBAnkrMkt.balanceOf(otherSupplier);
      emit log_named_uint("Other supplier collateral balance of ankrBNB-ANKR", collateralOther);

      emit log("");
      emit log("Before collateral caps");
      {
        (, , uint256 liq, uint256 sf) = pool.getAccountLiquidity(borrower);
        emit log_named_uint("Liq for account 1 before setting BC", liq); // 1366119859198693075092
        emit log_named_uint("Shortfall for account 1 before setting BC", sf); // 0
        emit log("");
        (, , uint256 liq1, uint256 sf1) = pool.getAccountLiquidity(otherSupplier);
        emit log_named_uint("Liq for account 2 before setting BC", liq1); // 24108891649595017
        emit log_named_uint("Shortfall for account 2 before setting BC", sf1); // 0

        assertGt(liq, 0, "expected positive liquidity");
        assertGt(liq1, 0, "expected positive liquidity");
        emit log("");
      }
    }
  }

  // TODO test with the latest block and contracts and/or without the FSL
  function testBorrowCapForCollateralWhitelist() public debuggingOnly forkAtBlock(BSC_MAINNET, 27827185) {
    emit log("");
    emit log("Borrow Caps Set");
    {
      vm.prank(pool.admin());
      asExtension._setBorrowCapForCollateral(address(ankrBNBMkt), address(ankrBNBAnkrMkt), 1);
      (, , uint256 liqAfter, uint256 sfAfter) = pool.getAccountLiquidity(borrower);
      emit log_named_uint("Liq for account 1 after setting BC", liqAfter);
      emit log_named_uint("Shortfall for account 1 after setting BC", sfAfter);
      (, , uint256 liq1After, uint256 sf1After) = pool.getAccountLiquidity(otherSupplier);
      emit log("");
      emit log_named_uint("Liq for account 2 after setting BC", liq1After);
      emit log_named_uint("Shortfall for account 2 after setting BC", sf1After);
      emit log("");

      assertGt(sfAfter, 0, "expected some shortfall for ankr");
      assertEq(liq1After, 24108891649595017, "expected liquidity for account 2 to decrease");
    }

    {
      vm.prank(pool.admin());
      asExtension._setBorrowCapForCollateralWhitelist(address(ankrBNBMkt), address(ankrBNBAnkrMkt), borrower, true);

      emit log("");
      (, , uint256 liqAfterWl, uint256 sfAfterWl) = pool.getAccountLiquidity(borrower);
      (, , uint256 liq1AfterWl, uint256 sf1AfterWl) = pool.getAccountLiquidity(otherSupplier);
      assertEq(sfAfterWl, 0, "expected shortfall to go back to 0");
      assertEq(liqAfterWl, 1366119859198693075092, "expected liq to go back to original");

      // expect liq for second (not whitelisted) account to stay reduced
      assertEq(liq1AfterWl, 24108891649595017, "expected liq to go back to prev value");
    }
  }

  function testBlacklistBorrowingAgainstCollateralWhitelist() public debuggingOnly fork(BSC_MAINNET) {
    (, , uint256 liquidityBefore, uint256 shortFallBefore) = pool.getHypotheticalAccountLiquidity(
      borrower,
      address(ankrBNBMkt),
      0,
      0,
      0
    );
    assertEq(shortFallBefore, 0, "should have no shortfall before");
    assertGt(liquidityBefore, 0, "should have positive liquidity before");

    vm.prank(pool.admin());
    asExtension._blacklistBorrowingAgainstCollateral(address(ankrBNBMkt), address(ankrBNBAnkrMkt), true);

    (, , uint256 liquidityAfterBlacklist, uint256 shortFallAfterBlacklist) = pool.getHypotheticalAccountLiquidity(
      borrower,
      address(ankrBNBMkt),
      0,
      0,
      0
    );
    assertGt(liquidityBefore - liquidityAfterBlacklist, 0, "should have lower liquidity after bl");

    vm.prank(pool.admin());
    asExtension._blacklistBorrowingAgainstCollateralWhitelist(
      address(ankrBNBMkt),
      address(ankrBNBAnkrMkt),
      borrower,
      true
    );

    (, , uint256 liquidityAfterWhitelist, uint256 shortFallWhitelist) = pool.getHypotheticalAccountLiquidity(
      borrower,
      address(ankrBNBMkt),
      0,
      0,
      0
    );
    assertEq(shortFallWhitelist, shortFallBefore, "should have the same sf after wl");
    assertEq(liquidityAfterWhitelist, liquidityBefore, "should have the same liquidity after wl");
  }

  function testSupplyCapWhitelist() public fork(BSC_MAINNET) {
    (, , uint256 liquidityBefore, uint256 shortFallBefore) = pool.getAccountLiquidity(borrower);
    assertEq(shortFallBefore, 0, "should have no shortfall before");
    assertGt(liquidityBefore, 0, "should have positive liquidity before");

    ICErc20[] memory markets = new ICErc20[](2);
    markets[0] = ankrBNBMkt;
    markets[1] = ankrBNBAnkrMkt;

    vm.startPrank(pool.admin());
    asExtension._setMarketSupplyCaps(markets, asArray(1, 1));
    asExtension._setMintPaused(ankrBNBMkt, false);
    asExtension._setMintPaused(ankrBNBAnkrMkt, false);
    vm.stopPrank();

    (, , uint256 liquidityAfterCap, uint256 shortFallAfterCap) = pool.getAccountLiquidity(borrower);
    assertEq(liquidityBefore, liquidityAfterCap, "should have the same liquidity after cap");
    assertEq(shortFallBefore, shortFallAfterCap, "should have the same shortfall after cap");

    vm.expectRevert("!supply cap");
    pool.mintAllowed(address(ankrBNBMkt), borrower, 2);

    vm.prank(pool.admin());
    asExtension._supplyCapWhitelist(address(ankrBNBMkt), borrower, true);

    require(pool.mintAllowed(address(ankrBNBMkt), borrower, 2) == 0, "mint not allowed after cap whitelist");
  }

  function testBorrowCapWhitelist() public fork(BSC_MAINNET) {
    (, , uint256 liquidityBefore, uint256 shortFallBefore) = pool.getAccountLiquidity(borrower);
    assertEq(shortFallBefore, 0, "should have no shortfall before");
    assertGt(liquidityBefore, 0, "should have positive liquidity before");

    ICErc20[] memory markets = new ICErc20[](2);
    markets[0] = ankrBNBMkt;
    markets[1] = ankrBNBAnkrMkt;

    vm.prank(pool.admin());
    asExtension._setMarketBorrowCaps(markets, asArray(1, 1));

    (, , uint256 liquidityAfterCap, uint256 shortFallAfterCap) = pool.getAccountLiquidity(borrower);
    assertEq(liquidityBefore, liquidityAfterCap, "should have the same liquidity after cap");
    assertEq(shortFallBefore, shortFallAfterCap, "should have the same shortfall after cap");

    vm.expectRevert("!borrow:cap");
    pool.borrowAllowed(address(ankrBNBMkt), borrower, 2);

    vm.prank(pool.admin());
    asExtension._borrowCapWhitelist(address(ankrBNBMkt), borrower, true);

    require(pool.borrowAllowed(address(ankrBNBMkt), borrower, 2) == 0, "borrow not allowed after cap whitelist");
  }

  function testSupplyCapValue() public debuggingOnly forkAtBlock(BSC_MAINNET, 27827185) {
    (, , uint256 liquidityBefore, uint256 shortFallBefore) = pool.getAccountLiquidity(borrower);
    assertEq(shortFallBefore, 0, "should have no shortfall before");
    assertGt(liquidityBefore, 0, "should have positive liquidity before");

    ICErc20[] memory markets = new ICErc20[](2);
    markets[0] = ankrBNBMkt;
    markets[1] = ankrBNBAnkrMkt;

    vm.prank(pool.admin());
    asExtension._setMarketSupplyCaps(markets, asArray(1, 1));

    {
      (, , uint256 liquidityAfterCap, uint256 shortFallAfterCap) = pool.getAccountLiquidity(borrower);
      assertEq(liquidityAfterCap, 0, "should have no liquidity after");
      assertGt(shortFallAfterCap, 0, "should have positive shortfall after");
    }

    vm.prank(pool.admin());
    asExtension._supplyCapWhitelist(address(markets[0]), borrower, true);
    vm.prank(pool.admin());
    asExtension._supplyCapWhitelist(address(markets[1]), borrower, true);

    {
      (, , uint256 liquidityAfterCap, uint256 shortFallAfterCap) = pool.getAccountLiquidity(borrower);
      assertEq(liquidityAfterCap, liquidityBefore, "liquidity after whitelist should match before");
      assertEq(shortFallAfterCap, shortFallBefore, "shortfall after whitelist should match before");
    }
  }
}
