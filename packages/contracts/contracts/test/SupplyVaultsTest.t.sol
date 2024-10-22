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
    //    vm.startPrank(wbnbWhale);
    //    wbnb.approve(wethNativeMarketAddress, depositAmount * 10);
    //    wethNativeMarket.mint(depositAmount * 10);
    //    wbnb.approve(wethMainMarketAddress, depositAmount * 10);
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

}
