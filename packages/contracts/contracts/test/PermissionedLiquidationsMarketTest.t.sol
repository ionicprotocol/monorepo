// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { MarketsTest } from "./config/MarketsTest.t.sol";

import { DiamondExtension, DiamondBase } from "../ionic/DiamondExtension.sol";
import { ComptrollerFirstExtension } from "../compound/ComptrollerFirstExtension.sol";
import { PoolDirectory } from "../PoolDirectory.sol";
import { Comptroller } from "../compound/Comptroller.sol";
import { ICErc20 } from "../compound/CTokenInterfaces.sol";
import { CErc20Delegate } from "../compound/CErc20Delegate.sol";
import { CErc20PluginDelegate } from "../compound/CErc20PluginDelegate.sol";
import { CErc20Delegator } from "../compound/CErc20Delegator.sol";
import { FeeDistributor } from "../FeeDistributor.sol";
import { CTokenFirstExtension } from "../compound/CTokenFirstExtension.sol";
import { ComptrollerV3Storage } from "../compound/ComptrollerStorage.sol";
import { IonicComptroller } from "../compound/ComptrollerInterface.sol";
import { ILiquidator } from "../ILiquidator.sol";

import { IERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/extensions/IERC20MetadataUpgradeable.sol";
import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import { PoolLens } from "../PoolLens.sol";
import { AddressesProvider } from "../ionic/AddressesProvider.sol";
import { IonicUniV3Liquidator } from "../IonicUniV3Liquidator.sol";
import { ERC20 } from "solmate/tokens/ERC20.sol";
import { IRedemptionStrategy } from "../liquidators/IRedemptionStrategy.sol";
import { IFundsConversionStrategy } from "../liquidators/IFundsConversionStrategy.sol";

contract PermissionedLiquidationsMarketTest is MarketsTest {
  ICErc20 wethMarket;
  ICErc20 usdtMarket;

  ICErc20 wethNativeMarket;
  ICErc20 usdcNativeMarket;
  ICErc20 usdtNativeMarket;
  ICErc20 modeNativeMarket;

  IonicComptroller pool;
  PoolLens lens;
  address borrower;
  address liquidator;
  IonicUniV3Liquidator uniV3liquidator;

  function afterForkSetUp() internal virtual override {
    super.afterForkSetUp();

    wethMarket = ICErc20(0x71ef7EDa2Be775E5A7aa8afD02C45F059833e9d2);
    usdtMarket = ICErc20(0x94812F2eEa03A49869f95e1b5868C6f3206ee3D3);

    wethNativeMarket = ICErc20(0xDb8eE6D1114021A94A045956BBeeCF35d13a30F2);
    usdcNativeMarket = ICErc20(0xc53edEafb6D502DAEC5A7015D67936CEa0cD0F52);
    usdtNativeMarket = ICErc20(0x3120B4907851cc9D780eef9aF88ae4d5360175Fd);
    modeNativeMarket = ICErc20(0x4341620757Bee7EB4553912FaFC963e59C949147);

    pool = IonicComptroller(0xFB3323E24743Caf4ADD0fDCCFB268565c0685556);
    lens = PoolLens(0x70BB19a56BfAEc65aE861E6275A90163AbDF36a6);
    ffd = FeeDistributor(payable(ap.getAddress("FeeDistributor")));
    borrower = 0xcE6cEFa163468F730206688665516952bcf83B74;
    liquidator = 0xE000008459b74a91e306a47C808061DFA372000E;
    uniV3liquidator = IonicUniV3Liquidator(payable(ap.getAddress("IonicUniV3Liquidator")));

    vm.prank(ap.owner());
    ap.setAddress("PoolLens", address(lens));
  }

  function testLiquidateNoThreshold() public debuggingOnly forkAtBlock(MODE_MAINNET, 10455052) {
    _upgradeMarket(wethMarket);
    _upgradeMarket(usdtMarket);

    vm.prank(usdtMarket.ionicAdmin());
    CTokenFirstExtension(address(usdtMarket))._setAddressesProvider(0xb0033576a9E444Dd801d5B69e1b63DBC459A6115);

    address targetContract = 0x927ae5509688eA6B992ba41Ecd1d49a6e7d69109;
    bytes
      memory data = hex"a9059cbb00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000003a000000000000000000000000000000000000000000000000000000000000002dd0b94812f2eea03a49869f95e1b5868c6f3206ee3d3002417bfdfbc000000000000000000000000ce6cefa163468f730206688665516952bcf83b740001000000000000000000000000000000000000000000000000000000006d3171ea02000000000000000000000000000000000000000000000000000000003698b8f5f0f161fda2712db8b566946122a5af183995e2ed02b702ce183b4e1faa574834715e5d4a6378d0eed3092be717340023c9e14c1bb12cb3ecbcfd3c3fb038000004a6afed9507f0f161fda2712db8b566946122a5af183995e2ed06000000000000000000000000000000000000000000000000000000003698b8f50109f0f161fda2712db8b566946122a5af183995e2ed000044095ea7b300000000000000000000000094812f2eea03a49869f95e1b5868c6f3206ee3d3000000000000000000000000000000000000000000000000000000000000000009f0f161fda2712db8b566946122a5af183995e2ed000044095ea7b300000000000000000000000094812f2eea03a49869f95e1b5868c6f3206ee3d3000000000000000000000000000000000000000000000000000000003698b8f50a94812f2eea03a49869f95e1b5868c6f3206ee3d3000024f5e3c462000000000000000000000000ce6cefa163468f730206688665516952bcf83b74002000000000000000000000000071ef7eda2be775e5a7aa8afd02c45f059833e9d20771ef7eda2be775e5a7aa8afd02c45f059833e9d20a71ef7eda2be775e5a7aa8afd02c45f059833e9d2000004db006a7500000742000000000000000000000000000000000000060100468cc91df6f669cae6cdce766995bd7874052fbc0000000000000000000000000000000000000000000000000000000000000000010107d988097fb8612cc24eec14542bc03424c656005f0100ee8291dd97611a064a7db0e8c9252d851674e20100000000000000000000000000000000000000000000000000000000000000000101000000000000000000000000000000000000000000000000000000000000000000009a07f0f161fda2712db8b566946122a5af183995e2ed0100a1c6800788482ba0eeb85f47322bb789986ee2f30000000000000000000000000000000000000000000000000000000000000000000107d988097fb8612cc24eec14542bc03424c656005f0100468cc91df6f669cae6cdce766995bd7874052fbc00000000000000000000000000000000000000000000000000000000000000000001000000000000";

    vm.startPrank(liquidator);
    (bool success, bytes memory returnData) = targetContract.call(data);
    require(success, "Transaction failed");
    vm.stopPrank();
  }

  function testLiquidateThresholdActive() public debuggingOnly forkAtBlock(MODE_MAINNET, 10455052) {
    vm.prank(uniV3liquidator.owner());
    uniV3liquidator.setHealthFactorThreshold(.98 * 1e18);

    _upgradeMarket(wethMarket);
    _upgradeMarket(usdtMarket);

    vm.prank(usdtMarket.ionicAdmin());
    CTokenFirstExtension(address(usdtMarket))._setAddressesProvider(0xb0033576a9E444Dd801d5B69e1b63DBC459A6115);

    address targetContract = 0x927ae5509688eA6B992ba41Ecd1d49a6e7d69109;
    bytes
      memory data = hex"a9059cbb00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000003a000000000000000000000000000000000000000000000000000000000000002dd0b94812f2eea03a49869f95e1b5868c6f3206ee3d3002417bfdfbc000000000000000000000000ce6cefa163468f730206688665516952bcf83b740001000000000000000000000000000000000000000000000000000000006d3171ea02000000000000000000000000000000000000000000000000000000003698b8f5f0f161fda2712db8b566946122a5af183995e2ed02b702ce183b4e1faa574834715e5d4a6378d0eed3092be717340023c9e14c1bb12cb3ecbcfd3c3fb038000004a6afed9507f0f161fda2712db8b566946122a5af183995e2ed06000000000000000000000000000000000000000000000000000000003698b8f50109f0f161fda2712db8b566946122a5af183995e2ed000044095ea7b300000000000000000000000094812f2eea03a49869f95e1b5868c6f3206ee3d3000000000000000000000000000000000000000000000000000000000000000009f0f161fda2712db8b566946122a5af183995e2ed000044095ea7b300000000000000000000000094812f2eea03a49869f95e1b5868c6f3206ee3d3000000000000000000000000000000000000000000000000000000003698b8f50a94812f2eea03a49869f95e1b5868c6f3206ee3d3000024f5e3c462000000000000000000000000ce6cefa163468f730206688665516952bcf83b74002000000000000000000000000071ef7eda2be775e5a7aa8afd02c45f059833e9d20771ef7eda2be775e5a7aa8afd02c45f059833e9d20a71ef7eda2be775e5a7aa8afd02c45f059833e9d2000004db006a7500000742000000000000000000000000000000000000060100468cc91df6f669cae6cdce766995bd7874052fbc0000000000000000000000000000000000000000000000000000000000000000010107d988097fb8612cc24eec14542bc03424c656005f0100ee8291dd97611a064a7db0e8c9252d851674e20100000000000000000000000000000000000000000000000000000000000000000101000000000000000000000000000000000000000000000000000000000000000000009a07f0f161fda2712db8b566946122a5af183995e2ed0100a1c6800788482ba0eeb85f47322bb789986ee2f30000000000000000000000000000000000000000000000000000000000000000000107d988097fb8612cc24eec14542bc03424c656005f0100468cc91df6f669cae6cdce766995bd7874052fbc00000000000000000000000000000000000000000000000000000000000000000001000000000000";

    vm.startPrank(liquidator);
    vm.expectRevert("Health factor not low enough for non-permissioned liquidations");
    (bool success, bytes memory returnData) = targetContract.call(data);
    vm.stopPrank();
  }

  function testLiquidateHealthFactorLowerThanThreshold() public debuggingOnly forkAtBlock(MODE_MAINNET, 10455052) {
    vm.prank(uniV3liquidator.owner());
    uniV3liquidator.setHealthFactorThreshold(.98 * 1e18);

    _upgradeMarket(wethMarket);
    _upgradeMarket(usdtMarket);

    vm.prank(usdtMarket.ionicAdmin());
    CTokenFirstExtension(address(usdtMarket))._setAddressesProvider(0xb0033576a9E444Dd801d5B69e1b63DBC459A6115);

    // fast forward until position unhealthy enough
    vm.roll(block.number + 10000000);

    address targetContract = 0x927ae5509688eA6B992ba41Ecd1d49a6e7d69109;
    bytes
      memory data = hex"a9059cbb00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000003a000000000000000000000000000000000000000000000000000000000000002dd0b94812f2eea03a49869f95e1b5868c6f3206ee3d3002417bfdfbc000000000000000000000000ce6cefa163468f730206688665516952bcf83b740001000000000000000000000000000000000000000000000000000000006d3171ea02000000000000000000000000000000000000000000000000000000003698b8f5f0f161fda2712db8b566946122a5af183995e2ed02b702ce183b4e1faa574834715e5d4a6378d0eed3092be717340023c9e14c1bb12cb3ecbcfd3c3fb038000004a6afed9507f0f161fda2712db8b566946122a5af183995e2ed06000000000000000000000000000000000000000000000000000000003698b8f50109f0f161fda2712db8b566946122a5af183995e2ed000044095ea7b300000000000000000000000094812f2eea03a49869f95e1b5868c6f3206ee3d3000000000000000000000000000000000000000000000000000000000000000009f0f161fda2712db8b566946122a5af183995e2ed000044095ea7b300000000000000000000000094812f2eea03a49869f95e1b5868c6f3206ee3d3000000000000000000000000000000000000000000000000000000003698b8f50a94812f2eea03a49869f95e1b5868c6f3206ee3d3000024f5e3c462000000000000000000000000ce6cefa163468f730206688665516952bcf83b74002000000000000000000000000071ef7eda2be775e5a7aa8afd02c45f059833e9d20771ef7eda2be775e5a7aa8afd02c45f059833e9d20a71ef7eda2be775e5a7aa8afd02c45f059833e9d2000004db006a7500000742000000000000000000000000000000000000060100468cc91df6f669cae6cdce766995bd7874052fbc0000000000000000000000000000000000000000000000000000000000000000010107d988097fb8612cc24eec14542bc03424c656005f0100ee8291dd97611a064a7db0e8c9252d851674e20100000000000000000000000000000000000000000000000000000000000000000101000000000000000000000000000000000000000000000000000000000000000000009a07f0f161fda2712db8b566946122a5af183995e2ed0100a1c6800788482ba0eeb85f47322bb789986ee2f30000000000000000000000000000000000000000000000000000000000000000000107d988097fb8612cc24eec14542bc03424c656005f0100468cc91df6f669cae6cdce766995bd7874052fbc00000000000000000000000000000000000000000000000000000000000000000001000000000000";

    vm.startPrank(liquidator);
    (bool success, bytes memory returnData) = targetContract.call(data);
    require(success, "Transaction failed");
    vm.stopPrank();
  }

  function testLiquidateFromPythShouldRevert() public debuggingOnly forkAtBlock(MODE_MAINNET, 10352583) {
    vm.prank(uniV3liquidator.owner());
    uniV3liquidator.setHealthFactorThreshold(.98 * 1e18);

    _upgradeMarket(wethMarket);
    _upgradeMarket(usdtMarket);

    vm.prank(wethMarket.ionicAdmin());
    CTokenFirstExtension(address(wethMarket))._setAddressesProvider(0xb0033576a9E444Dd801d5B69e1b63DBC459A6115);

    emit log_named_uint("hf", lens.getHealthFactor(0x0Ff7F5043DD39186c2DF04F81cfa95672B8A3994, pool));

    address targetContract = 0xa12c1E460c06B1745EFcbfC9A1f666a8749B0e3A;
    bytes
      memory data = hex"55e9e8fe00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000ff7f5043dd39186c2df04f81cfa95672b8a39940000000000000000000000000000000000000000000000000002fb8c3841c79600000000000000000000000071ef7eda2be775e5a7aa8afd02c45f059833e9d200000000000000000000000071ef7eda2be775e5a7aa8afd02c45f059833e9d2000000000000000000000000468cc91df6f669cae6cdce766995bd7874052fbc000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

    vm.startPrank(0x1110DECC92083fbcae218a8478F75B2Ad1b9AEe6);
    vm.expectRevert("invalid liquidation");
    (bool success, bytes memory returnData) = targetContract.call(data);
    require(success, "Transaction failed");
    vm.stopPrank();
  }

  function testLiquidateFromPyth() public debuggingOnly forkAtBlock(MODE_MAINNET, 10352583) {
    vm.prank(uniV3liquidator.owner());
    uniV3liquidator.setHealthFactorThreshold(.98 * 1e18);

    _upgradeMarket(wethMarket);
    _upgradeMarket(usdtMarket);

    vm.prank(wethMarket.ionicAdmin());
    CTokenFirstExtension(address(wethMarket))._setAddressesProvider(0xb0033576a9E444Dd801d5B69e1b63DBC459A6115);

    emit log_named_uint("hf", lens.getHealthFactor(0x0Ff7F5043DD39186c2DF04F81cfa95672B8A3994, pool));

    address targetContract = 0xa12c1E460c06B1745EFcbfC9A1f666a8749B0e3A;
    bytes
      memory data = hex"55e9e8fe00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000ff7f5043dd39186c2df04f81cfa95672b8a39940000000000000000000000000000000000000000000000000002fb8c3841c79600000000000000000000000071ef7eda2be775e5a7aa8afd02c45f059833e9d200000000000000000000000071ef7eda2be775e5a7aa8afd02c45f059833e9d2000000000000000000000000468cc91df6f669cae6cdce766995bd7874052fbc000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

    vm.mockCall(
      address(uniV3liquidator.expressRelay()),
      abi.encodeWithSelector(
        bytes4(keccak256("isPermissioned(address,bytes)")),
        address(uniV3liquidator),
        abi.encode(0x1110DECC92083fbcae218a8478F75B2Ad1b9AEe6)
      ),
      abi.encode(false)
    );

    vm.startPrank(0x1110DECC92083fbcae218a8478F75B2Ad1b9AEe6);
    vm.expectRevert("invalid liquidation");
    (bool success, bytes memory returnData) = targetContract.call(data);
    require(success, "Transaction failed");
    vm.stopPrank();
  }

  function testPostUpgradeLiquidate() public debuggingOnly fork(MODE_MAINNET) {
    address borrower = 0xE10B38bbe359656066b3c4648DfEa7018711c35f;
    PoolLens.PoolAsset[] memory assets = lens.getPoolAssetsByUser(pool, borrower);

    for (uint i; i < assets.length; i++) {
      emit log_named_string("Asset Named", assets[i].underlyingName);
      emit log_named_uint("Supply Balance", assets[i].supplyBalance);
      emit log_named_uint("Borrow Balance", assets[i].borrowBalance);
      emit log_named_uint("Liquidity", assets[i].liquidity);
      emit log("----------------------------------------------------");
    }

    emit log_named_uint("HF", lens.getHealthFactor(borrower, pool));

    // vm.startPrank(0x344d9C4f488bb5519D390304457D64034618145C);

    // ERC20(0xd988097fb8612cc24eeC14542bC03424c656005f).approve(address(uniV3liquidator), 4000);

    // // ILiquidator.LiquidateToTokensWithFlashSwapVars memory vars = ILiquidator.LiquidateToTokensWithFlashSwapVars({
    // //   borrower: borrower,
    // //   repayAmount: 4000,
    // //   cErc20: ICErc20(0x2BE717340023C9e14C1Bb12cb3ecBcfd3c3fB038),
    // //   cTokenCollateral: wethMarket,
    // //   flashSwapContract: 0x468cC91dF6F669CaE6cdCE766995Bd7874052FBc,
    // //   minProfitAmount: 0,
    // //   redemptionStrategies: new IRedemptionStrategy[](0),
    // //   strategyData: new bytes[](0),
    // //   debtFundingStrategies: new IFundsConversionStrategy[](0),
    // //   debtFundingStrategiesData: new bytes[](0)
    // // });
    // // uniV3liquidator.safeLiquidateToTokensWithFlashLoan(vars);

    // uniV3liquidator.safeLiquidate(borrower, 4000, ICErc20(0x2BE717340023C9e14C1Bb12cb3ecBcfd3c3fB038), wethMarket, 0);

    // vm.stopPrank();

    // emit log_named_uint("HF", lens.getHealthFactor(borrower, pool));
  }

  function testUpgradeNativeMarket() public debuggingOnly fork(MODE_MAINNET) {
    _upgradeMarket(wethNativeMarket);
    _upgradeMarket(usdcNativeMarket);
    _upgradeMarket(usdtNativeMarket);
    _upgradeMarket(modeNativeMarket);
    _upgradeMarket(wethMarket);
    _upgradeMarket(usdtMarket);
  }

  struct CErc20StorageStruct {
    address ionicAdmin;
    string name;
    string symbol;
    uint8 decimals;
    address comptroller;
    address interestRateModel;
    uint256 adminFeeMantissa;
    uint256 ionicFeeMantissa;
    uint256 reserveFactorMantissa;
    uint256 accrualBlockNumber;
    uint256 borrowIndex;
    uint256 totalBorrows;
    uint256 totalReserves;
    uint256 totalAdminFees;
    uint256 totalIonicFees;
    uint256 totalSupply;
    uint256 protocolSeizeShareMantissa;
    uint256 feeSeizeShareMantissa;
    address underlying;
    address ap;
    uint256 cash;
    uint256 totalBorrowsCurrent;
    uint256 balanceOfUnderlying;
    uint256 borrowBalanceCurrent;
    uint256 supplyRatePerBlock;
    uint256 borrowRatePerBlock;
    uint256 exchangeRateCurrent;
    uint256 totalUnderlyingSupplied;
    uint256 allowance;
    uint256 balanceOf;
  }

  function testStorageLayoutSafe() public debuggingOnly forkAtBlock(MODE_MAINNET, 10352583) {
    // Capture storage layout before upgrade
    CErc20StorageStruct memory storageDataBefore;
    CErc20StorageStruct memory storageDataAfter;

    address owner = 0xbF86588d7e20502f1b250561da775343Dfdb3250; // Use a valid spender address as needed

    storageDataBefore.ionicAdmin = wethMarket.ionicAdmin();
    storageDataBefore.name = wethMarket.name();
    storageDataBefore.symbol = wethMarket.symbol();
    storageDataBefore.decimals = wethMarket.decimals();
    storageDataBefore.comptroller = address(wethMarket.comptroller());
    storageDataBefore.interestRateModel = address(wethMarket.interestRateModel());
    storageDataBefore.adminFeeMantissa = wethMarket.adminFeeMantissa();
    storageDataBefore.ionicFeeMantissa = wethMarket.ionicFeeMantissa();
    storageDataBefore.reserveFactorMantissa = wethMarket.reserveFactorMantissa();
    storageDataBefore.accrualBlockNumber = wethMarket.accrualBlockNumber();
    storageDataBefore.borrowIndex = wethMarket.borrowIndex();
    storageDataBefore.totalBorrows = wethMarket.totalBorrows();
    storageDataBefore.totalReserves = wethMarket.totalReserves();
    storageDataBefore.totalAdminFees = wethMarket.totalAdminFees();
    storageDataBefore.totalIonicFees = wethMarket.totalIonicFees();
    storageDataBefore.totalSupply = wethMarket.totalSupply();
    storageDataBefore.underlying = wethMarket.underlying();
    storageDataBefore.cash = wethMarket.getCash();
    storageDataBefore.totalBorrowsCurrent = wethMarket.totalBorrowsCurrent();
    storageDataBefore.balanceOfUnderlying = wethMarket.balanceOfUnderlying(owner);
    storageDataBefore.borrowBalanceCurrent = wethMarket.borrowBalanceCurrent(owner);
    storageDataBefore.supplyRatePerBlock = wethMarket.supplyRatePerBlock();
    storageDataBefore.borrowRatePerBlock = wethMarket.borrowRatePerBlock();
    storageDataBefore.exchangeRateCurrent = wethMarket.exchangeRateCurrent();
    storageDataBefore.totalUnderlyingSupplied = wethMarket.getTotalUnderlyingSupplied();
    storageDataBefore.balanceOf = wethMarket.balanceOf(owner);
    storageDataBefore.protocolSeizeShareMantissa = wethMarket.protocolSeizeShareMantissa();
    storageDataBefore.feeSeizeShareMantissa = wethMarket.feeSeizeShareMantissa();

    // Upgrade the market
    _upgradeMarket(wethMarket);

    vm.prank(wethMarket.ionicAdmin());
    CTokenFirstExtension(address(wethMarket))._setAddressesProvider(0xb0033576a9E444Dd801d5B69e1b63DBC459A6115);

    storageDataAfter.ionicAdmin = wethMarket.ionicAdmin();
    storageDataAfter.name = wethMarket.name();
    storageDataAfter.symbol = wethMarket.symbol();
    storageDataAfter.decimals = wethMarket.decimals();
    storageDataAfter.comptroller = address(wethMarket.comptroller());
    storageDataAfter.interestRateModel = address(wethMarket.interestRateModel());
    storageDataAfter.adminFeeMantissa = wethMarket.adminFeeMantissa();
    storageDataAfter.ionicFeeMantissa = wethMarket.ionicFeeMantissa();
    storageDataAfter.reserveFactorMantissa = wethMarket.reserveFactorMantissa();
    storageDataAfter.accrualBlockNumber = wethMarket.accrualBlockNumber();
    storageDataAfter.borrowIndex = wethMarket.borrowIndex();
    storageDataAfter.totalBorrows = wethMarket.totalBorrows();
    storageDataAfter.totalReserves = wethMarket.totalReserves();
    storageDataAfter.totalAdminFees = wethMarket.totalAdminFees();
    storageDataAfter.totalIonicFees = wethMarket.totalIonicFees();
    storageDataAfter.totalSupply = wethMarket.totalSupply();
    storageDataAfter.underlying = wethMarket.underlying();
    storageDataAfter.cash = wethMarket.getCash();
    storageDataAfter.totalBorrowsCurrent = wethMarket.totalBorrowsCurrent();
    storageDataAfter.balanceOfUnderlying = wethMarket.balanceOfUnderlying(owner);
    storageDataAfter.borrowBalanceCurrent = wethMarket.borrowBalanceCurrent(owner);
    storageDataAfter.supplyRatePerBlock = wethMarket.supplyRatePerBlock();
    storageDataAfter.borrowRatePerBlock = wethMarket.borrowRatePerBlock();
    storageDataAfter.exchangeRateCurrent = wethMarket.exchangeRateCurrent();
    storageDataAfter.totalUnderlyingSupplied = wethMarket.getTotalUnderlyingSupplied();
    storageDataAfter.balanceOf = wethMarket.balanceOf(owner);
    storageDataAfter.protocolSeizeShareMantissa = wethMarket.protocolSeizeShareMantissa();
    storageDataAfter.feeSeizeShareMantissa = wethMarket.feeSeizeShareMantissa();

    emit log_named_address("Storage ionicAdmin (before)", storageDataBefore.ionicAdmin);
    emit log_named_address("Storage ionicAdmin (after)", storageDataAfter.ionicAdmin);

    emit log_named_string("Storage name (before)", storageDataBefore.name);
    emit log_named_string("Storage name (after)", storageDataAfter.name);

    emit log_named_string("Storage symbol (before)", storageDataBefore.symbol);
    emit log_named_string("Storage symbol (after)", storageDataAfter.symbol);

    emit log_named_uint("Storage decimals (before)", storageDataBefore.decimals);
    emit log_named_uint("Storage decimals (after)", storageDataAfter.decimals);

    emit log_named_address("Storage comptroller (before)", storageDataBefore.comptroller);
    emit log_named_address("Storage comptroller (after)", storageDataAfter.comptroller);

    emit log_named_address("Storage interestRateModel (before)", storageDataBefore.interestRateModel);
    emit log_named_address("Storage interestRateModel (after)", storageDataAfter.interestRateModel);

    emit log_named_uint("Storage adminFeeMantissa (before)", storageDataBefore.adminFeeMantissa);
    emit log_named_uint("Storage adminFeeMantissa (after)", storageDataAfter.adminFeeMantissa);

    emit log_named_uint("Storage ionicFeeMantissa (before)", storageDataBefore.ionicFeeMantissa);
    emit log_named_uint("Storage ionicFeeMantissa (after)", storageDataAfter.ionicFeeMantissa);

    emit log_named_uint("Storage reserveFactorMantissa (before)", storageDataBefore.reserveFactorMantissa);
    emit log_named_uint("Storage reserveFactorMantissa (after)", storageDataAfter.reserveFactorMantissa);

    emit log_named_uint("Storage accrualBlockNumber (before)", storageDataBefore.accrualBlockNumber);
    emit log_named_uint("Storage accrualBlockNumber (after)", storageDataAfter.accrualBlockNumber);

    emit log_named_uint("Storage borrowIndex (before)", storageDataBefore.borrowIndex);
    emit log_named_uint("Storage borrowIndex (after)", storageDataAfter.borrowIndex);

    emit log_named_uint("Storage totalBorrows (before)", storageDataBefore.totalBorrows);
    emit log_named_uint("Storage totalBorrows (after)", storageDataAfter.totalBorrows);

    emit log_named_uint("Storage totalReserves (before)", storageDataBefore.totalReserves);
    emit log_named_uint("Storage totalReserves (after)", storageDataAfter.totalReserves);

    emit log_named_uint("Storage totalAdminFees (before)", storageDataBefore.totalAdminFees);
    emit log_named_uint("Storage totalAdminFees (after)", storageDataAfter.totalAdminFees);

    emit log_named_uint("Storage totalIonicFees (before)", storageDataBefore.totalIonicFees);
    emit log_named_uint("Storage totalIonicFees (after)", storageDataAfter.totalIonicFees);

    emit log_named_uint("Storage totalSupply (before)", storageDataBefore.totalSupply);
    emit log_named_uint("Storage totalSupply (after)", storageDataAfter.totalSupply);

    emit log_named_uint("Storage protocolSeizeShareMantissa (before)", storageDataBefore.protocolSeizeShareMantissa);
    emit log_named_uint("Storage protocolSeizeShareMantissa (after)", storageDataAfter.protocolSeizeShareMantissa);

    emit log_named_uint("Storage feeSeizeShareMantissa (before)", storageDataBefore.feeSeizeShareMantissa);
    emit log_named_uint("Storage feeSeizeShareMantissa (after)", storageDataAfter.feeSeizeShareMantissa);

    emit log_named_address("Storage underlying (before)", storageDataBefore.underlying);
    emit log_named_address("Storage underlying (after)", storageDataAfter.underlying);

    emit log_named_uint("Storage cash (before)", storageDataBefore.cash);
    emit log_named_uint("Storage cash (after)", storageDataAfter.cash);

    emit log_named_uint("Storage totalBorrowsCurrent (before)", storageDataBefore.totalBorrowsCurrent);
    emit log_named_uint("Storage totalBorrowsCurrent (after)", storageDataAfter.totalBorrowsCurrent);

    emit log_named_uint("Storage balanceOfUnderlying (before)", storageDataBefore.balanceOfUnderlying);
    emit log_named_uint("Storage balanceOfUnderlying (after)", storageDataAfter.balanceOfUnderlying);

    emit log_named_uint("Storage borrowBalanceCurrent (before)", storageDataBefore.borrowBalanceCurrent);
    emit log_named_uint("Storage borrowBalanceCurrent (after)", storageDataAfter.borrowBalanceCurrent);

    emit log_named_uint("Storage supplyRatePerBlock (before)", storageDataBefore.supplyRatePerBlock);
    emit log_named_uint("Storage supplyRatePerBlock (after)", storageDataAfter.supplyRatePerBlock);

    emit log_named_uint("Storage borrowRatePerBlock (before)", storageDataBefore.borrowRatePerBlock);
    emit log_named_uint("Storage borrowRatePerBlock (after)", storageDataAfter.borrowRatePerBlock);

    emit log_named_uint("Storage exchangeRateCurrent (before)", storageDataBefore.exchangeRateCurrent);
    emit log_named_uint("Storage exchangeRateCurrent (after)", storageDataAfter.exchangeRateCurrent);

    emit log_named_uint("Storage totalUnderlyingSupplied (before)", storageDataBefore.totalUnderlyingSupplied);
    emit log_named_uint("Storage totalUnderlyingSupplied (after)", storageDataAfter.totalUnderlyingSupplied);

    emit log_named_uint("Storage allowance (before)", storageDataBefore.allowance);
    emit log_named_uint("Storage allowance (after)", storageDataAfter.allowance);

    emit log_named_uint("Storage balanceOf (before)", storageDataBefore.balanceOf);
    emit log_named_uint("Storage balanceOf (after)", storageDataAfter.balanceOf);

    emit log_named_address("Storage ap (before)", storageDataBefore.ap);
    emit log_named_address("Storage ap (after)", storageDataAfter.ap);

    assertEq(storageDataBefore.ionicAdmin, storageDataAfter.ionicAdmin, "Mismatch in ionicAdmin");
    assertEq(storageDataBefore.name, storageDataAfter.name, "Mismatch in name");
    assertEq(storageDataBefore.symbol, storageDataAfter.symbol, "Mismatch in symbol");
    assertEq(storageDataBefore.decimals, storageDataAfter.decimals, "Mismatch in decimals");
    assertEq(storageDataBefore.comptroller, storageDataAfter.comptroller, "Mismatch in comptroller");
    assertEq(storageDataBefore.interestRateModel, storageDataAfter.interestRateModel, "Mismatch in interestRateModel");
    assertEq(storageDataBefore.adminFeeMantissa, storageDataAfter.adminFeeMantissa, "Mismatch in adminFeeMantissa");
    assertEq(storageDataBefore.ionicFeeMantissa, storageDataAfter.ionicFeeMantissa, "Mismatch in ionicFeeMantissa");
    assertEq(
      storageDataBefore.reserveFactorMantissa,
      storageDataAfter.reserveFactorMantissa,
      "Mismatch in reserveFactorMantissa"
    );
    assertEq(
      storageDataBefore.accrualBlockNumber,
      storageDataAfter.accrualBlockNumber,
      "Mismatch in accrualBlockNumber"
    );
    assertEq(storageDataBefore.borrowIndex, storageDataAfter.borrowIndex, "Mismatch in borrowIndex");
    assertEq(storageDataBefore.totalBorrows, storageDataAfter.totalBorrows, "Mismatch in totalBorrows");
    assertEq(storageDataBefore.totalReserves, storageDataAfter.totalReserves, "Mismatch in totalReserves");
    assertEq(storageDataBefore.totalAdminFees, storageDataAfter.totalAdminFees, "Mismatch in totalAdminFees");
    assertEq(storageDataBefore.totalIonicFees, storageDataAfter.totalIonicFees, "Mismatch in totalIonicFees");
    assertEq(storageDataBefore.totalSupply, storageDataAfter.totalSupply, "Mismatch in totalSupply");
    assertEq(storageDataBefore.underlying, storageDataAfter.underlying, "Mismatch in underlying");
    assertEq(storageDataBefore.cash, storageDataAfter.cash, "Mismatch in cash");
    assertEq(
      storageDataBefore.totalBorrowsCurrent,
      storageDataAfter.totalBorrowsCurrent,
      "Mismatch in totalBorrowsCurrent"
    );
    assertEq(
      storageDataBefore.balanceOfUnderlying,
      storageDataAfter.balanceOfUnderlying,
      "Mismatch in balanceOfUnderlying"
    );
    assertEq(
      storageDataBefore.borrowBalanceCurrent,
      storageDataAfter.borrowBalanceCurrent,
      "Mismatch in borrowBalanceCurrent"
    );
    assertEq(
      storageDataBefore.supplyRatePerBlock,
      storageDataAfter.supplyRatePerBlock,
      "Mismatch in supplyRatePerBlock"
    );
    assertEq(
      storageDataBefore.borrowRatePerBlock,
      storageDataAfter.borrowRatePerBlock,
      "Mismatch in borrowRatePerBlock"
    );
    assertEq(
      storageDataBefore.exchangeRateCurrent,
      storageDataAfter.exchangeRateCurrent,
      "Mismatch in exchangeRateCurrent"
    );
    assertEq(
      storageDataBefore.totalUnderlyingSupplied,
      storageDataAfter.totalUnderlyingSupplied,
      "Mismatch in totalUnderlyingSupplied"
    );
    assertEq(storageDataBefore.balanceOf, storageDataAfter.balanceOf, "Mismatch in balanceOf");
    assertEq(
      storageDataBefore.protocolSeizeShareMantissa,
      storageDataAfter.protocolSeizeShareMantissa,
      "Mismatch in protocolSeizeShareMantissa"
    );
    assertEq(
      storageDataBefore.feeSeizeShareMantissa,
      storageDataAfter.feeSeizeShareMantissa,
      "Mismatch in feeSeizeShareMantissa"
    );
  }

  function testCurrentMarkets() public debuggingOnly forkAtBlock(MODE_MAINNET, 10785800) {
    address[] memory ionAddresses = new address[](10);

    _upgradeMarket(wethMarket);

    ionAddresses[0] = 0x71ef7EDa2Be775E5A7aa8afD02C45F059833e9d2;
    ionAddresses[1] = 0x2BE717340023C9e14C1Bb12cb3ecBcfd3c3fB038;
    ionAddresses[2] = 0x94812F2eEa03A49869f95e1b5868C6f3206ee3D3;
    ionAddresses[3] = 0xd70254C3baD29504789714A7c69d60Ec1127375C;
    ionAddresses[4] = 0x59e710215d45F584f44c0FEe83DA6d43D762D857;
    ionAddresses[5] = 0x959FA710CCBb22c7Ce1e59Da82A247e686629310;
    ionAddresses[6] = 0x49950319aBE7CE5c3A6C90698381b45989C99b46;
    ionAddresses[7] = 0xA0D844742B4abbbc43d8931a6Edb00C56325aA18;
    ionAddresses[8] = 0x9a9072302B775FfBd3Db79a7766E75Cf82bcaC0A;
    ionAddresses[9] = 0x19F245782b1258cf3e11Eda25784A378cC18c108;

    address ap;
    for (uint i = 0; i < ionAddresses.length; i++) {
      // ap = address(CTokenFirstExtension(ionAddresses[i]).ap());
      ap = address(CTokenFirstExtension(address(wethMarket)).ap());
      emit log_named_address("ap", ap);
    }
  }
}
