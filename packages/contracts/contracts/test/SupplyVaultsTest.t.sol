// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "../ionic/vault/OptimizedVaultsRegistry.sol";
import { ILeveredPositionFactory } from "../ionic/levered/ILeveredPositionFactory.sol";

import "./config/BaseTest.t.sol";

contract SupplyVaultsTest is BaseTest {
  OptimizedVaultsRegistry registry;
  uint256 depositAmount = 1e17;
  OptimizedAPRVaultBase vault;
  uint64[] lenderSharesHint = new uint64[](2);
  AdapterConfig[10] adapters;

  uint256 blocksPerYear;
  address wethWhale = 0x7380511493DD4c2f1dD75E9CCe5bD52C787D4B51;

  ICErc20 wethNativeMarket = ICErc20(0xDb8eE6D1114021A94A045956BBeeCF35d13a30F2);
  ICErc20 wethMainMarket = ICErc20(0x71ef7EDa2Be775E5A7aa8afD02C45F059833e9d2);

  ERC20 weth;

  // available markets to test with
  // NATIVE POOL
  // - USDT 0x3120B4907851cc9D780eef9aF88ae4d5360175Fd
  // - USDC 0xc53edEafb6D502DAEC5A7015D67936CEa0cD0F52
  // - MODE 0x4341620757Bee7EB4553912FaFC963e59C949147
  // - WETH 0xDb8eE6D1114021A94A045956BBeeCF35d13a30F2
  // MAIN POOL
  // - USDT 0x94812F2eEa03A49869f95e1b5868C6f3206ee3D3
  // - USDC 0x2BE717340023C9e14C1Bb12cb3ecBcfd3c3fB038
  // - MODE n/a
  // - WETH 0x71ef7EDa2Be775E5A7aa8afD02C45F059833e9d2

  function afterForkSetUp() internal override {
    super.afterForkSetUp();

    weth = ERC20(wethMainMarket.underlying());

    ILeveredPositionFactory factory = ILeveredPositionFactory(ap.getAddress("LeveredPositionFactory"));
    blocksPerYear = factory.blocksPerYear();

    setUpVault();
  }

  function addLiquidity() internal {
    //    vm.startPrank(wethWhale);
    //    weth.approve(wethNativeMarketAddress, depositAmount * 10);
    //    wethNativeMarket.mint(depositAmount * 10);
    //    weth.approve(wethMainMarketAddress, depositAmount * 10);
    //    wethMainMarket.mint(depositAmount * 10);
    //    vm.stopPrank();
  }

  function deployVaultRegistry() internal {
    registry = new OptimizedVaultsRegistry();
    {
      TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(address(registry), address(dpa), "");
      registry = OptimizedVaultsRegistry(address(proxy));
    }
    registry.initialize();
  }

  function deployAdapters() internal {
    CompoundMarketERC4626 wethNativeMarketAdapter = new CompoundMarketERC4626();
    {
      TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(address(wethNativeMarketAdapter), address(dpa), "");
      wethNativeMarketAdapter = CompoundMarketERC4626(address(proxy));
      vm.label(address(wethNativeMarketAdapter), "wethNativeMarketAdapter");
    }
    wethNativeMarketAdapter.initialize(
      wethNativeMarket,
      blocksPerYear,
      registry
    );
    uint256 wethNativeMarketApr = wethNativeMarketAdapter.apr();
    emit log_named_uint("wethNativeMarketApr", wethNativeMarketApr);

    CompoundMarketERC4626 wethMainMarketAdapter = new CompoundMarketERC4626();
    {
      TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(address(wethMainMarketAdapter), address(dpa), "");
      wethMainMarketAdapter = CompoundMarketERC4626(address(proxy));
      vm.label(address(wethMainMarketAdapter), "wethMainMarketAdapter");
    }
    wethMainMarketAdapter.initialize(wethMainMarket, blocksPerYear, registry);
    uint256 wethMainMarketApr = wethMainMarketAdapter.apr();
    emit log_named_uint("wethMainMarketApr", wethMainMarketApr);

    adapters[0].adapter = wethNativeMarketAdapter;
    adapters[0].allocation = 1e17;
    adapters[1].adapter = wethMainMarketAdapter;
    adapters[1].allocation = 9e17;
  }

  function deployVault() internal {
    IonicFlywheel flywheelLogic = new IonicFlywheel();
    bytes memory params = abi.encode(
      IERC20Metadata(address(weth)),
      adapters,
      2, // adapters count
      VaultFees(0, 0, 0, 0),
      address(this),
      type(uint256).max,
      address(registry),
      address(flywheelLogic)
    );

    OptimizedAPRVaultExtension[] memory exts = new OptimizedAPRVaultExtension[](2);
    exts[0] = new OptimizedAPRVaultFirstExtension();
    exts[1] = new OptimizedAPRVaultSecondExtension();
    vault = new OptimizedAPRVaultBase();
    vm.label(address(vault), "vault");
    vault.initialize(exts, params);

    registry.addVault(address(vault));
  }

  function depositAssets() internal {
    vm.startPrank(wethWhale);
    weth.approve(address(vault), type(uint256).max);
    vault.asSecondExtension().deposit(depositAmount);
    vm.stopPrank();
  }

  function setUpVault() internal {
    // make sure there is enough liquidity in the testing markets
    addLiquidity();

    deployVaultRegistry();

    deployAdapters();

    deployVault();

    depositAssets();
  }

  function testVaultEmergencyShutdown() public fork(MODE_MAINNET) {
    OptimizedAPRVaultSecondExtension asSecondExtension = vault.asSecondExtension();
    registry.setEmergencyExit();

    assertTrue(vault.emergencyExit(), "!emergency set");
    assertEq(asSecondExtension.lentTotalAssets(), 0, "!still lending");
    assertGt(asSecondExtension.estimatedTotalAssets(), 0, "!emergency withdrawn");

    asSecondExtension.harvest(lenderSharesHint);
  }

  function testVaultOptimization() public fork(MODE_MAINNET) {
    OptimizedAPRVaultSecondExtension asSecondExtension = vault.asSecondExtension();
    uint256 estimatedAprHint;
    {
      int256[] memory lenderAdjustedAmounts;
      if (lenderSharesHint.length != 0)
        (estimatedAprHint, lenderAdjustedAmounts) = asSecondExtension.estimatedAPR(lenderSharesHint);

      emit log_named_int("lenderAdjustedAmounts0", lenderAdjustedAmounts[0]);
      emit log_named_int("lenderAdjustedAmounts1", lenderAdjustedAmounts[1]);
      emit log_named_uint("hint", estimatedAprHint);
    }

    // log before
    uint256 aprBefore = asSecondExtension.estimatedAPR();
    {
      emit log_named_uint("aprBefore", aprBefore);

      if (estimatedAprHint > aprBefore) {
        emit log("harvest will rebalance");
      } else {
        emit log("harvest will NOT rebalance");
      }
    }

    // harvest
    {
      uint256 maxRedeemBefore = asSecondExtension.maxRedeem(wethWhale);
      emit log_named_uint("maxRedeemBefore", maxRedeemBefore);

      asSecondExtension.harvest(lenderSharesHint);

      uint256 maxRedeemAfter = asSecondExtension.maxRedeem(wethWhale);
      emit log_named_uint("maxRedeemAfter", maxRedeemAfter);
    }

    // check if the APR improved as a result of the hinted better allocations
    {
      uint256 aprAfter = asSecondExtension.estimatedAPR();
      emit log_named_uint("aprAfter", aprAfter);

      if (estimatedAprHint > aprBefore) {
        assertGt(aprAfter, aprBefore, "!harvest didn't optimize the allocations");
      }
    }
  }

  function testVaultPreviewMint(uint256 assets) public fork(MODE_MAINNET) {
    OptimizedAPRVaultSecondExtension asSecondExtension = vault.asSecondExtension();
    vm.assume(assets >= 10 * asSecondExtension.adaptersCount() && assets < type(uint128).max);

    // previewDeposit should return the maximum shares that are minted for the assets input
    uint256 maxShares = asSecondExtension.previewDeposit(assets);
    // previewMint should return the minimum assets required for the shares input
    uint256 shouldBeMoreThanAvailableAssets = asSecondExtension.previewMint(maxShares + 1);
    // minting a share more should require more assets than the available
    assertGt(shouldBeMoreThanAvailableAssets, assets, "!not gt than available assets");
  }

  function testVaultPreviewRedeem() public fork(MODE_MAINNET) {
    _testVaultPreviewRedeem(2222e12);
  }

  function _testVaultPreviewRedeem(uint256 assets) internal {
    vm.assume(assets < type(uint128).max);
    OptimizedAPRVaultSecondExtension asSecondExtension = vault.asSecondExtension();

    // previewWithdraw should return the maximum shares that are burned for the assets input
    uint256 maxShares = asSecondExtension.previewWithdraw(assets);
    uint256 sameAssets = asSecondExtension.previewRedeem(maxShares);
    uint256 shouldBeMoreThanRequestedAssets = asSecondExtension.previewRedeem(maxShares + 1);
    assertGt(shouldBeMoreThanRequestedAssets, assets, "!not gt than requested assets");

    if (assets > 100) assertEq(sameAssets, assets, "!same");
  }

  function testOptVaultMint(uint256 mintAmount_) public fork(MODE_MAINNET) {
    OptimizedAPRVaultSecondExtension asSecondExtension = vault.asSecondExtension();
    asSecondExtension.harvest(lenderSharesHint);

    // advance time with a year
    vm.warp(block.timestamp + 365.25 days);
    vm.roll(block.number + blocksPerYear);

    // test the shares before and after calling mint
    {
      uint256 vaultSharesBefore = asSecondExtension.balanceOf(wethWhale);
      uint256 whaleAssets = weth.balanceOf(wethWhale);
      // preview deposit should return the max shares possible for the supplied amount of assets
      uint256 maxShares = asSecondExtension.previewDeposit(whaleAssets);

      // call mint
      bool shouldRevert = true;
      vm.startPrank(wethWhale);
      {
        weth.approve(address(asSecondExtension), whaleAssets);
        if (asSecondExtension.previewMint(mintAmount_) == 0) vm.expectRevert("too little shares");
        else if (mintAmount_ > maxShares) vm.expectRevert("!insufficient balance");
        else shouldRevert = false;

        asSecondExtension.mint(mintAmount_);
      }
      vm.stopPrank();

      if (!shouldRevert) {
        uint256 vaultSharesAfter = asSecondExtension.balanceOf(wethWhale);
        assertEq(vaultSharesAfter - vaultSharesBefore, mintAmount_, "!depositor did not mint the correct shares");
      }
    }
  }

  function testOptVaultDeposit(uint256 depositAmount_) public fork(MODE_MAINNET) {
    OptimizedAPRVaultSecondExtension asSecondExtension = vault.asSecondExtension();
    vm.assume(depositAmount_ >= 10 * asSecondExtension.adaptersCount() && depositAmount_ < type(uint128).max);

    asSecondExtension.harvest(lenderSharesHint);

    // advance time with a year
    vm.warp(block.timestamp + 365.25 days);
    vm.roll(block.number + blocksPerYear);

    // test the shares before and after calling deposit
    {
      uint256 vaultSharesBefore = asSecondExtension.balanceOf(wethWhale);
      uint256 whaleAssets = weth.balanceOf(wethWhale);
      uint256 expectedVaultSharesMinted = asSecondExtension.previewDeposit(depositAmount_);

      // call deposit
      bool shouldRevert = true;
      vm.startPrank(wethWhale);
      {
        weth.approve(address(asSecondExtension), whaleAssets);
        if (depositAmount_ > whaleAssets) vm.expectRevert("!insufficient balance");
        else if (expectedVaultSharesMinted == 0) vm.expectRevert("too little assets");
        else shouldRevert = false;

        asSecondExtension.deposit(depositAmount_);
      }
      vm.stopPrank();

      if (!shouldRevert) {
        uint256 vaultSharesAfter = asSecondExtension.balanceOf(wethWhale);
        assertEq(
          vaultSharesAfter - vaultSharesBefore,
          expectedVaultSharesMinted,
          "!depositor did not receive the expected minted shares"
        );
      }
    }
  }

  function testOptVaultWithdraw(uint256 withdrawAmount_) public fork(MODE_MAINNET) {
    vm.assume(withdrawAmount_ < type(uint128).max);

    OptimizedAPRVaultSecondExtension asSecondExtension = vault.asSecondExtension();
    asSecondExtension.harvest(lenderSharesHint);

    // deposit some assets to test a wider range of withdrawable amounts
    vm.startPrank(wethWhale);
    uint256 whaleAssets = weth.balanceOf(wethWhale);
    weth.approve(address(asSecondExtension), whaleAssets);
    asSecondExtension.deposit(whaleAssets / 2);
    vm.stopPrank();

    // advance time with a year
    vm.warp(block.timestamp + 365.25 days);
    vm.roll(block.number + blocksPerYear);

    // test the balance before and after calling withdraw
    {
      uint256 wethBalanceBefore = weth.balanceOf(wethWhale);

      uint256 maxWithdrawWhale = asSecondExtension.maxWithdraw(wethWhale);

      // call withdraw
      bool shouldRevert = true;
      vm.startPrank(wethWhale);
      {
        if (withdrawAmount_ > maxWithdrawWhale) vm.expectRevert("ERC20: burn amount exceeds balance");
        else if (withdrawAmount_ == 0) vm.expectRevert("too little assets");
        else shouldRevert = false;

        asSecondExtension.withdraw(withdrawAmount_);
      }
      vm.stopPrank();

      if (!shouldRevert) {
        uint256 wethBalanceAfter = weth.balanceOf(wethWhale);
        assertEq(
          wethBalanceAfter - wethBalanceBefore,
          withdrawAmount_,
          "!depositor did not receive the requested withdraw amount"
        );
      }
    }
  }

  function testOptVaultRedeem(uint256 redeemAmount_) public fork(MODE_MAINNET) {
    vm.assume(redeemAmount_ < type(uint128).max);

    OptimizedAPRVaultSecondExtension asSecondExtension = vault.asSecondExtension();
    asSecondExtension.harvest(lenderSharesHint);

    // deposit some assets to test a wider range of redeemable amounts
    vm.startPrank(wethWhale);
    uint256 whaleAssets = weth.balanceOf(wethWhale);
    weth.approve(address(asSecondExtension), whaleAssets);
    asSecondExtension.deposit(whaleAssets / 2);
    vm.stopPrank();

    // advance time with a year
    vm.warp(block.timestamp + 365.25 days);
    vm.roll(block.number + blocksPerYear);

    // test the balance before and after calling redeem
    {
      uint256 vaultSharesBefore = asSecondExtension.balanceOf(wethWhale);

      uint256 maxRedeemWhale = asSecondExtension.maxRedeem(wethWhale);

      uint256 assetsToReceive = asSecondExtension.previewRedeem(redeemAmount_);

      // call redeem
      bool shouldRevert = true;
      vm.startPrank(wethWhale);
      {
        if (assetsToReceive == 0) vm.expectRevert("too little shares");
        else if (redeemAmount_ > maxRedeemWhale) vm.expectRevert("ERC20: burn amount exceeds balance");
        else shouldRevert = false;

        asSecondExtension.redeem(redeemAmount_);
      }
      vm.stopPrank();

      if (!shouldRevert) {
        uint256 vaultSharesAfter = asSecondExtension.balanceOf(wethWhale);
        assertEq(vaultSharesBefore - vaultSharesAfter, redeemAmount_, "!depositor did not redeem the requested shares");
      }
    }
  }

  function testDirectAdaptersDeposit() public fork(MODE_MAINNET) {
    vm.startPrank(wethWhale);
    weth.approve(address(adapters[0].adapter), 10);
    vm.expectRevert("!caller not a vault");
    adapters[0].adapter.deposit(10, wethWhale);
  }

  error NotPassedQuitPeriod();

  function testChangeAdapters() public fork(MODE_MAINNET) {
    CompoundMarketERC4626 wethNativeAdapter = new CompoundMarketERC4626();
    {
      TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(address(wethNativeAdapter), address(dpa), "");
      wethNativeAdapter = CompoundMarketERC4626(address(proxy));
      vm.label(address(wethNativeAdapter), "wethNativeAdapter");
    }
    wethNativeAdapter.initialize(wethNativeMarket, blocksPerYear, registry);
    adapters[2].adapter = wethNativeAdapter;

    adapters[0].allocation = 8e17;
    adapters[1].allocation = 1e17;
    adapters[2].allocation = 1e17;

    OptimizedAPRVaultFirstExtension firstExt = vault.asFirstExtension();
    OptimizedAPRVaultSecondExtension secondExt = vault.asSecondExtension();
    firstExt.proposeAdapters(adapters, 3);
    vm.expectRevert(NotPassedQuitPeriod.selector);
    secondExt.changeAdapters();

    vm.warp(block.timestamp + 3.01 days);
    secondExt.changeAdapters();
  }

//  function testVaultAccrueRewards() public fork(MODE_MAINNET) {
//    IERC20Metadata ddd = IERC20Metadata(dddAddress);
//    IERC20Metadata epx = IERC20Metadata(epxAddress);
//    address someDeployer = address(321);
//
//    // set up the registry, the vault and the adapter
//    {
//      // upgrade to enable the aprAfterDeposit fn for the vault
//      _upgradeMarket(CErc20Delegate(twoBrlMarketAddress));
//
//      vm.startPrank(someDeployer);
//      deployVaultRegistry();
//
//      // deploy the adapter
//      CompoundMarketERC4626 twoBrlMarketAdapter = new CompoundMarketERC4626();
//      {
//        TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(
//          address(twoBrlMarketAdapter),
//          address(dpa),
//          ""
//        );
//        twoBrlMarketAdapter = CompoundMarketERC4626(address(proxy));
//        vm.label(address(twoBrlMarketAdapter), "twoBrlMarketAdapter");
//      }
//      twoBrlMarketAdapter.initialize(ICErc20(twoBrlMarketAddress), blocksPerYear, registry);
//
//      AdapterConfig[10] memory _adapters;
//      _adapters[0].adapter = twoBrlMarketAdapter;
//      _adapters[0].allocation = 1e18;
//
//      MidasFlywheel flywheelLogic = new MidasFlywheel();
//
//      bytes memory params = abi.encode(
//        twoBrl,
//        _adapters,
//        1,
//        VaultFees(0, 0, 0, 0),
//        address(this),
//        type(uint256).max,
//        address(registry),
//        address(flywheelLogic)
//      );
//
//      OptimizedAPRVaultExtension[] memory exts = new OptimizedAPRVaultExtension[](2);
//      exts[0] = new OptimizedAPRVaultFirstExtension();
//      exts[1] = new OptimizedAPRVaultSecondExtension();
//      vault = new OptimizedAPRVaultBase();
//      vm.label(address(vault), "vault");
//      vault.initialize(exts, params);
//
//      vault.asFirstExtension().addRewardToken(ddd);
//      vault.asFirstExtension().addRewardToken(epx);
//
//      registry.addVault(address(vault));
//    }
//    vm.stopPrank();
//
//    // deposit some funds
//    vm.startPrank(twoBrlWhale);
//    twoBrl.approve(address(vault), type(uint256).max);
//    // accruing for the first time internally with _afterTokenTransfer
//    vault.asSecondExtension().deposit(depositAmount);
//    vm.stopPrank();
//
//    {
//      // advance time to move away from the first cycle,
//      // because the first cycle is initialized with 0 rewards
//      vm.warp(block.timestamp + 25 hours);
//      vm.roll(block.number + 1000);
//    }
//
//    // pull from the adapters the rewards for the new cycle
//    vault.asSecondExtension().pullAccruedVaultRewards();
//
//    OptimizedAPRVaultFirstExtension vaultFirstExt = vault.asFirstExtension();
//    {
//      // TODO figure out why these accrue calls are necessary
//      MidasFlywheel flywheelDDD = vaultFirstExt.flywheelForRewardToken(ddd);
//      MidasFlywheel flywheelEPX = vaultFirstExt.flywheelForRewardToken(epx);
//      flywheelDDD.accrue(ERC20(address(vault)), twoBrlWhale);
//      flywheelEPX.accrue(ERC20(address(vault)), twoBrlWhale);
//
//      // advance time in the same cycle in order to accrue some rewards for it
//      vm.warp(block.timestamp + 10 hours);
//      vm.roll(block.number + 1000);
//    }
//
//    // harvest does nothing when the APR remains the same
//    //uint64[] memory array = new uint64[](1);
//    //array[0] = 1e18;
//    //vault.harvest(array);
//
//    // accrue and claim
//    vm.prank(twoBrlWhale);
//    vaultFirstExt.claimRewards();
//
//    // check if any rewards were claimed
//    assertGt(ddd.balanceOf(twoBrlWhale), 0, "!received DDD");
//    assertGt(epx.balanceOf(twoBrlWhale), 0, "!received EPX");
//  }

  function testUpgradeOptVault() public fork(MODE_MAINNET) {
    OptimizedAPRVaultExtension[] memory exts = new OptimizedAPRVaultExtension[](2);
    exts[0] = new TestingFirstExtension();
    exts[1] = new TestingSecondExtension();
    registry.setLatestVaultExtensions(address(vault), exts);

    vault.upgradeVault();

    address[] memory currentExtensions = vault._listExtensions();

    for (uint256 i; i < exts.length; i++) {
      assertEq(address(exts[i]), currentExtensions[i], "!matching");
    }
  }

  function testLensFn() public debuggingOnly fork(BSC_CHAPEL) {
    registry = OptimizedVaultsRegistry(0x353195Bdd4917e1Bdabc9809Dc3E8528b3421FF5);
    registry.getVaultsData();
  }

  // TODO test claiming the rewards for multiple vaults
}

contract TestingFirstExtension is OptimizedAPRVaultExtension {
  function _getExtensionFunctions() external pure virtual override returns (bytes4[] memory) {
    uint8 fnsCount = 1;
    bytes4[] memory functionSelectors = new bytes4[](fnsCount);
    functionSelectors[--fnsCount] = this.dummy1.selector;

    require(fnsCount == 0, "use the correct array length");
    return functionSelectors;
  }

  function dummy1() public {}
}

contract TestingSecondExtension is OptimizedAPRVaultExtension {
  function _getExtensionFunctions() external pure virtual override returns (bytes4[] memory) {
    uint8 fnsCount = 1;
    bytes4[] memory functionSelectors = new bytes4[](fnsCount);
    functionSelectors[--fnsCount] = this.dummy2.selector;

    require(fnsCount == 0, "use the correct array length");
    return functionSelectors;
  }

  function dummy2() public {}
}
