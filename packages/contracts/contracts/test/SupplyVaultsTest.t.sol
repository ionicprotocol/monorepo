// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";

import "../ionic/vault/OptimizedVaultsRegistry.sol";
import { ILeveredPositionFactory } from "../ionic/levered/ILeveredPositionFactory.sol";
import { FlywheelStaticRewards } from "../ionic/strategies/flywheel/rewards/FlywheelStaticRewards.sol";
import { IonicFlywheelDynamicRewards } from "../ionic/strategies/flywheel/rewards/IonicFlywheelDynamicRewards.sol";
import { IonicFlywheelSupplyBooster } from "../ionic/strategies/flywheel/IonicFlywheelSupplyBooster.sol";
import { IFlywheelRewards } from "../ionic/strategies/flywheel/rewards/IFlywheelRewards.sol";
import { CErc20RewardsDelegate } from "../compound/CErc20RewardsDelegate.sol";

import "./config/BaseTest.t.sol";

contract SupplyVaultsTest is BaseTest {
  OptimizedVaultsRegistry registry;
  uint256 depositAmount = 1e17;
  OptimizedAPRVaultBase vault;
  uint64[] lenderSharesHint = new uint64[](2);
  AdapterConfig[10] adapters;

  uint256 blocksPerYear;
  address wethWhale = 0x7380511493DD4c2f1dD75E9CCe5bD52C787D4B51;
  address ionWhale = 0x0D0707963952f2fBA59dD06f2b425ace40b492Fe;

  ICErc20 wethNativeMarket = ICErc20(0xDb8eE6D1114021A94A045956BBeeCF35d13a30F2);
  ICErc20 wethMainMarket = ICErc20(0x71ef7EDa2Be775E5A7aa8afD02C45F059833e9d2);
  ERC20 ionToken = ERC20(0x18470019bF0E94611f15852F7e93cf5D65BC34CA);

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

  function afterForkSetUp() internal virtual override {
    super.afterForkSetUp();

    lenderSharesHint[0] = 0.5e17;
    lenderSharesHint[1] = 9.5e17;

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
    registry.initialize(IonicFlywheelLensRouter(ap.getAddress("IonicFlywheelLensRouter")));
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
    console.log("wethNativeMarketApr %e", wethNativeMarketApr);

    CompoundMarketERC4626 wethMainMarketAdapter = new CompoundMarketERC4626();
    {
      TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(address(wethMainMarketAdapter), address(dpa), "");
      wethMainMarketAdapter = CompoundMarketERC4626(address(proxy));
      vm.label(address(wethMainMarketAdapter), "wethMainMarketAdapter");
    }
    wethMainMarketAdapter.initialize(wethMainMarket, blocksPerYear, registry);
    uint256 wethMainMarketApr = wethMainMarketAdapter.apr();
    console.log("wethMainMarketApr %e", wethMainMarketApr);

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

  function upgradeIflr() internal {
    IonicFlywheelLensRouter upgradedIflr = new IonicFlywheelLensRouter(PoolDirectory(ap.getAddress("PoolDirectory")));
    vm.prank(ap.owner());
    ap.setAddress("IonicFlywheelLensRouter", address(upgradedIflr));

    IonicFlywheel newFwImpl = new IonicFlywheel();
    IonicFlywheelSupplyBooster marketSupplyBooster = new IonicFlywheelSupplyBooster();

    uint256 ionWhaleStartingBalance = ionToken.balanceOf(ionWhale);

    ProxyAdmin proxyAdmin;

    uint8 fwCounter = 0;
    // replace all flywheels
    PoolDirectory.Pool[] memory pools = upgradedIflr.fpd().getAllPools();
    for (uint8 i = 0; i < pools.length; i++) {
      IonicComptroller pool = IonicComptroller(pools[i].comptroller);
      address[] memory flywheels = pool.getAccruingFlywheels();
      for (uint8 j = 0; j < flywheels.length; j++) {
        if (flywheels[j] == 0x2DC3f7B18e8F62F7fE7819596D15E521EEf3b1ec) {
          proxyAdmin = ProxyAdmin(0xd122669FeF7e62Aa5Df85e945b68dd0B02A42343);
        }
        else if (flywheels[j] == 0xcC11Fc7048db155F691Cc20Ac9958Fc465fa0062) {
          proxyAdmin = ProxyAdmin(0x4De2d8ef97D19def01f236b7a12e5Fb39c087b56);
        }
        else if (flywheels[j] == 0x6AfCca37CC93DB6bed729d20ADF203290d465df5 || flywheels[j] == 0x4E854cde138495a3eB9CFe48e50F12dC352cD834) {
          proxyAdmin = ProxyAdmin(0xaF9cc7599DEFd86226e0f3A6810c4976E4a10f83);
        }
        else {
          proxyAdmin = dpa;
        }

        IonicFlywheel flywheel = IonicFlywheel(flywheels[j]);
        try flywheel.getRewardsPerSecondPerToken(ERC20(address(wethMainMarket))) {
          // don't upgrade already upgraded fws
          console.log("ALREADY UPGRADED");
        } catch {
          // upgrade if the getRewardsPerSecondPerToken fn is missing
          {
            TransparentUpgradeableProxy proxy = TransparentUpgradeableProxy(payable(flywheels[j]));
            vm.prank(proxyAdmin.owner());
            proxyAdmin.upgrade(proxy, address(newFwImpl));

            // all strategies that are ionic markets must use the supply or
            // borrow booster in order to show the correct APR
            if (address(flywheel.flywheelBooster()) == address(0)) {
              vm.prank(flywheel.owner());
              flywheel.setBooster(marketSupplyBooster);
            }
          }

          FlywheelStaticRewards flywheelRewards = FlywheelStaticRewards(address(flywheel.flywheelRewards()));

          IFlywheelRewards newRewards;
          try flywheelRewards.owner() returns (address) {
            (uint224 rewardsPerSecond, uint32 rewardsEndTimestamp) = flywheelRewards.rewardsInfo(ionToken);
            if (rewardsPerSecond != 0) {
              newRewards = new FlywheelStaticRewards(
                flywheelRewards.flywheel(), flywheelRewards.owner(), flywheelRewards.authority()
              );

              //            emit log_named_uint("rewardsEndTimestamp", rewardsEndTimestamp);
              require(rewardsEndTimestamp > vm.getBlockTimestamp(), "rewards ended");
            }
          } catch {
            // if failing, the rewards contract is for dynamic rewards
            IonicFlywheelDynamicRewards currentRewards = IonicFlywheelDynamicRewards(address(flywheel.flywheelRewards()));

            newRewards = new IonicFlywheelDynamicRewards(
              currentRewards.flywheel(), currentRewards.rewardsCycleLength()
            );
          }

          if (address(newRewards) != address(0)) {
            vm.label(address(newRewards), string.concat("NewRewards", Strings.toString(++fwCounter)));
            vm.prank(flywheel.owner());
            flywheel.setFlywheelRewards(newRewards);
          }

          ERC20[] memory fwStrategies = flywheel.getAllStrategies();
          for (uint8 k = 0; k < fwStrategies.length; k++) {
            IonicComptroller marketPool = ICErc20(address(fwStrategies[k])).comptroller();
            if (address(marketPool) != address(pool)) {
              //                emit log("");
              //                emit log_named_address("INCTVZD MARKET", address(fwStrategies[k]));
              //                emit log_named_address("MARKET    POOL", address(marketPool));
              //                emit log_named_address("CURRENT   POOL", address(pool));
              //                emit log("");
            } else {
              vm.prank(marketPool.admin());
              CErc20RewardsDelegate(address(fwStrategies[k])).approve(address(ionToken), address(newRewards));
              flywheel.accrue(fwStrategies[k], address(0));
            }
          }
        }
      }
    }
  }

  function setUpVault() internal {
    // make sure there is enough liquidity in the testing markets
    addLiquidity();

    upgradeIflr();

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

  function testVaultAprFromRewards() public debuggingOnly fork(MODE_MAINNET) {
    OptimizedAPRVaultSecondExtension asSecondExtension = vault.asSecondExtension();
    asSecondExtension.pullAccruedVaultRewards();
    uint256 aprBefore = asSecondExtension.estimatedAPR();

    (CompoundMarketERC4626 adapter1, uint64 allocation1) = vault.adapters(0);
    (CompoundMarketERC4626 adapter2, uint64 allocation2) = vault.adapters(1);

    uint256 rewardsAprBefore1 = adapter1.rewardsApr();
    uint256 rewardsAprBefore2 = adapter2.rewardsApr();
    console.log("0 REWARDS Apr %e", rewardsAprBefore1);
    console.log("1 REWARDS Apr %e", rewardsAprBefore2);
    console.log("aprBefore %e", aprBefore);

    //vm.warp(vm.getBlockTimestamp() + 2592001);

    IonicComptroller pool = wethMainMarket.comptroller();
    uint256 rewardsAmountFor1PercentApr;
    {
      // total supply = 8340714736106176115889
      //   fwRewardsAmountFor1PercentAprIncrease 8.3961226709852889815644e22
      uint256 wethMarketBorrowedAssets = wethMainMarket.totalBorrows();
      //wethMarketBorrowedAssets = (wethMarketBorrowedAssets * wethMainMarket.exchangeRateCurrent()) / 1e18;
      //console.log("wethMarketBorrowedAssets %e", wethMarketBorrowedAssets);
      uint256 wethPrice = pool.oracle().getUnderlyingPrice(wethMainMarket);
      uint256 rewardsValueFor1PercentApr = ((wethMarketBorrowedAssets * wethPrice) / 1e18) / 100;
      console.log("rewardsValueFor1PercentApr for 1 year %e", rewardsValueFor1PercentApr);
      uint256 ionPrice = pool.oracle().price(address(ionToken));
      rewardsAmountFor1PercentApr = (rewardsValueFor1PercentApr * 1e18) / ionPrice;
      console.log("rewardsAmountFor1PercentApr for 1 year %e", rewardsAmountFor1PercentApr);
    }

    // find the ION flywheel and add as much rewards
    // as 1% of the value of the weth main market
    {
      address[] memory flywheels = pool.getAccruingFlywheels();
      for (uint8 j = 0; j < flywheels.length; j++) {
        IonicFlywheel flywheel = IonicFlywheel(flywheels[j]);
        ERC20 rewardToken = flywheel.rewardToken();
        if (rewardToken == ionToken) {
          IonicFlywheelDynamicRewards flywheelRewards = IonicFlywheelDynamicRewards(address(flywheel.flywheelRewards()));
          (, , uint192 cycleRewards) = flywheelRewards.rewardsCycle(ERC20(address(wethMainMarket)));
          // move to the next rewards cycle
          vm.warp(vm.getBlockTimestamp() + flywheelRewards.rewardsCycleLength() + 1);

          // adjust the reward amount proportionally to the flywheel specific cycle length
          uint256 fwRewardsAmountFor1PercentAprIncrease = (rewardsAmountFor1PercentApr * flywheelRewards.rewardsCycleLength()) / 365.25 days;
          //console.log("fwRewardsAmountFor1PercentAprIncrease %e", fwRewardsAmountFor1PercentAprIncrease);
          // add as much as the last cycle rewards + more rewards for +1% APR
          fwRewardsAmountFor1PercentAprIncrease = cycleRewards + fwRewardsAmountFor1PercentAprIncrease;
          vm.prank(ionWhale);
          ionToken.transfer(address(wethMainMarket), fwRewardsAmountFor1PercentAprIncrease);

          // pull and account for the just transferred rewards in the market
          flywheel.accrue(ERC20(address(wethMainMarket)), address(0));

          // done adding rewards for the APR increase
          break;
        }
      }
    }

    uint256 aprAfter = asSecondExtension.estimatedAPR();
    {
      uint256 rewardsAprAfter1 = adapter1.rewardsApr();
      uint256 rewardsAprAfter2 = adapter2.rewardsApr();
      console.log("0 REWARDS Apr %e", rewardsAprAfter1);
      console.log("1 REWARDS Apr %e", rewardsAprAfter2);
      console.log("aprAfter %e", aprAfter);
      console.log("aprAfter - aprBefore %e", aprAfter - aprBefore);
      console.log("rewardsAprAfter - rewardsAprBefore %e", rewardsAprAfter2 - rewardsAprBefore2);
    }

    // APR after should be approx adapter2.allocation * adapter2AprIncrease
    uint256 expectedAprIncrease = (uint256(allocation2) * 0.01e18) / 1e18;
    console.log("expectedAprIncrease %e", expectedAprIncrease);

    assertApproxEqRel(expectedAprIncrease, aprAfter - aprBefore, 5e15);
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
    vm.warp(vm.getBlockTimestamp() + 365.25 days);
    vm.roll(vm.getBlockNumber() + blocksPerYear);

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
    vm.warp(vm.getBlockTimestamp() + 365.25 days);
    vm.roll(vm.getBlockNumber() + blocksPerYear);

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
    vm.warp(vm.getBlockTimestamp() + 365.25 days);
    vm.roll(vm.getBlockNumber() + blocksPerYear);

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
    vm.warp(vm.getBlockTimestamp() + 365.25 days);
    vm.roll(vm.getBlockNumber() + blocksPerYear);

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

    vm.warp(vm.getBlockTimestamp() + 3.01 days);
    secondExt.changeAdapters();
  }

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

  // TODO test claiming the rewards for multiple vaults
  function testVaultAccrueRewards() public fork(MODE_MAINNET) {
    address someDeployer = ap.owner();
    IonicFlywheel flywheelLogic = new IonicFlywheel();

    // set up the registry, the vault and the adapter
    vm.startPrank(someDeployer);
    {
      // deploy the adapter
      CompoundMarketERC4626 marketAdapter = new CompoundMarketERC4626();
      {
        TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(
          address(marketAdapter),
          address(dpa),
          ""
        );
        marketAdapter = CompoundMarketERC4626(address(proxy));
        vm.label(address(marketAdapter), "marketAdapter");
      }
      marketAdapter.initialize(wethNativeMarket, blocksPerYear, registry);

      AdapterConfig[10] memory _adapters;
      _adapters[0].adapter = marketAdapter;
      _adapters[0].allocation = 1e18;

      bytes memory params = abi.encode(
        weth,
        _adapters,
        1,
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

      vault.asFirstExtension().addRewardToken(IERC20(address(ionToken)));
    }
    vm.stopPrank();

    vm.prank(registry.owner());
    registry.addVault(address(vault));

    uint256 whaleStartingOpBalance = ionToken.balanceOf(wethWhale);

    // deposit some funds
    vm.startPrank(wethWhale);
    weth.approve(address(vault), type(uint256).max);
    // accruing for the first time internally with _afterTokenTransfer
    vault.asSecondExtension().deposit(depositAmount);
    vm.stopPrank();

    {
      // advance time to move away from the first cycle,
      // because the first cycle is initialized with 0 rewards
      vm.warp(vm.getBlockTimestamp() + 25 hours);
      vm.roll(vm.getBlockNumber() + 1000);
    }

    // pull from the adapters the rewards for the new cycle
    vault.asSecondExtension().pullAccruedVaultRewards();

    OptimizedAPRVaultFirstExtension vaultFirstExt = vault.asFirstExtension();
    {
      // TODO figure out why these accrue calls are necessary
      IonicFlywheel flywheelION = vaultFirstExt.flywheelForRewardToken(IERC20(address(ionToken)));
      flywheelION.accrue(ERC20(address(vault)), wethWhale);

      // advance time in the same cycle in order to accrue some rewards for it
      vm.warp(vm.getBlockTimestamp() + 10 hours);
      vm.roll(vm.getBlockNumber() + 1000);
    }

    // harvest does nothing when the APR remains the same
    //uint64[] memory array = new uint64[](1);
    //array[0] = 1e18;
    //vault.harvest(array);

    // accrue and claim
    vm.prank(wethWhale);
    vaultFirstExt.claimRewards();

    // check if any rewards were claimed
    uint256 finalWhaleBalance = ionToken.balanceOf(wethWhale);
    assertGt(finalWhaleBalance, whaleStartingOpBalance, "!received ION");

    console.log("rewards claimed %e", finalWhaleBalance - whaleStartingOpBalance);
  }
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
