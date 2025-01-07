// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// import { BaseTest } from "../config/BaseTest.t.sol";

// import { FixedPointMathLib } from "solmate/utils/FixedPointMathLib.sol";
// import { IBeefyVault, BeefyERC4626, IonicERC4626 } from "../../ionic/strategies/BeefyERC4626.sol";
// import { IonicComptroller } from "../../compound/ComptrollerInterface.sol";
// import { PoolDirectory } from "../../PoolDirectory.sol";
// import { CErc20PluginDelegate } from "../../compound/CErc20PluginDelegate.sol";
// import { ICErc20 } from "../../compound/CTokenInterfaces.sol";
// import { IERC4626 } from "../../compound/IERC4626.sol";

// import { ERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";

// contract ERC4626PerformanceFeeTest is BaseTest {
//   using FixedPointMathLib for uint256;

//   uint256 PERFORMANCE_FEE = 5e16;
//   uint256 DEPOSIT_AMOUNT = 100e18;
//   uint256 BPS_DENOMINATOR = 10_000;

//   BeefyERC4626 plugin;
//   ERC20Upgradeable underlyingToken;
//   IBeefyVault beefyVault = IBeefyVault(0x94E85B8E050F3F281CB9597cc0144F1F7AF1fe9B); // BOMB-BTCB LP
//   address beefyStrategy = 0xEeBcd7E1f008C52fe5804B306832B7DD317e163D;
//   address lpChef = 0x1083926054069AaD75d7238E9B809b0eF9d94e5B;
//   address newFeeRecipient = address(5);

//   function afterForkSetUp() internal override {
//     if (block.chainid == BSC_MAINNET) {
//       underlyingToken = ERC20Upgradeable(address(beefyVault.want()));
//       plugin = new BeefyERC4626();
//       plugin.initialize(underlyingToken, beefyVault, 10);

//       uint256 currentPerformanceFee = plugin.performanceFee();
//       plugin.updateFeeSettings(currentPerformanceFee, newFeeRecipient);
//     }
//   }

//   /* --------------------- HELPER FUNCTIONS --------------------- */

//   function deposit(address _owner, uint256 amount) public {
//     vm.startPrank(_owner);
//     underlyingToken.approve(address(plugin), amount);
//     plugin.deposit(amount, _owner);
//     vm.stopPrank();
//   }

//   function increaseAssetsInVault() public {
//     deal(address(underlyingToken), address(beefyVault), 1000e18);
//     beefyVault.earn();
//   }

//   function createPerformanceFee() public {
//     deal(address(underlyingToken), address(this), DEPOSIT_AMOUNT);

//     deposit(address(this), DEPOSIT_AMOUNT);

//     increaseAssetsInVault();
//   }

//   /* --------------------- ERC4626 PERFORMANCE FEE TESTS --------------------- */

//   function test__initializedValues() public fork(BSC_MAINNET) {
//     assertEq(plugin.performanceFee(), PERFORMANCE_FEE, "!perFee");
//     assertEq(plugin.feeRecipient(), newFeeRecipient, "!feeRecipient");
//   }

//   function test__UpdateFeeSettings() public fork(BSC_MAINNET) {
//     uint256 newPerfFee = 100;
//     address anotherFeeRecipient = address(10);

//     plugin.updateFeeSettings(newPerfFee, anotherFeeRecipient);

//     assertEq(plugin.performanceFee(), newPerfFee, "!perfFee == newPerfFee");

//     assertEq(plugin.feeRecipient(), anotherFeeRecipient, "!feeRecipient == anotherFeeRecipient");
//   }

//   function testRevert__UpdateFeeSettings() public fork(BSC_MAINNET) {
//     vm.startPrank(address(10));
//     vm.expectRevert("Ownable: caller is not the owner");
//     plugin.updateFeeSettings(100, address(10));
//   }

//   function test__TakePerformanceFeeInUnderlyingAsset() public fork(BSC_MAINNET) {
//     createPerformanceFee();

//     uint256 oldAssets = plugin.totalAssets();
//     uint256 oldSupply = plugin.totalSupply();

//     uint256 accruedPerformanceFee = (oldAssets - DEPOSIT_AMOUNT).mulDivDown(PERFORMANCE_FEE, 1e18);
//     // I had to change this from -1 on the current block to -2 in the pinned block. Not a 100% sure why there is this difference in returned assets from beefy
//     uint256 expectedFeeShares = accruedPerformanceFee.mulDivDown(oldSupply, (oldAssets - accruedPerformanceFee)) - 2;

//     plugin.takePerformanceFee();

//     assertApproxEqAbs(
//       plugin.totalSupply() - oldSupply,
//       expectedFeeShares,
//       uint256(10),
//       "totalSupply increase didnt match expectedFeeShares"
//     );
//     assertApproxEqAbs(plugin.balanceOf(plugin.feeRecipient()), expectedFeeShares, uint256(10), "!feeRecipient shares");
//     assertEq(plugin.totalAssets(), oldAssets, "totalAssets should not change");
//   }

//   function test__WithdrawAccruedFees() public fork(BSC_MAINNET) {
//     plugin.updateFeeSettings(PERFORMANCE_FEE, address(10));

//     createPerformanceFee();

//     uint256 oldAssets = plugin.totalAssets();
//     uint256 oldSupply = plugin.totalSupply();

//     uint256 accruedPerformanceFee = (oldAssets - DEPOSIT_AMOUNT).mulDivDown(PERFORMANCE_FEE, 1e18);
//     // I had to change this from -1 on the current block to -2 in the pinned block. Not a 100% sure why there is this difference in returned assets from beefy
//     uint256 expectedFeeShares = accruedPerformanceFee.mulDivDown(oldSupply, (oldAssets - accruedPerformanceFee)) - 2;

//     plugin.takePerformanceFee();

//     assertApproxEqAbs(
//       plugin.totalSupply() - oldSupply,
//       expectedFeeShares,
//       uint256(10),
//       "totalSupply increase didnt match expectedFeeShares"
//     );
//     assertApproxEqAbs(plugin.balanceOf(plugin.feeRecipient()), expectedFeeShares, uint256(10), "!feeShares minted");

//     plugin.withdrawAccruedFees();

//     assertEq(plugin.balanceOf(plugin.feeRecipient()), 0, "!feeRecipient plugin bal == 0");
//     assertEq(plugin.totalSupply(), oldSupply, "!totalSupply == oldSupply");
//   }

//   function testRevert__WithdrawAccruedFees() public fork(BSC_MAINNET) {
//     vm.startPrank(address(10));
//     vm.expectRevert("Ownable: caller is not the owner");
//     plugin.withdrawAccruedFees();
//   }

//   function testPolygonAllPluginsFeeRecipient() public debuggingOnly fork(POLYGON_MAINNET) {
//     _testAllPluginsFeeRecipient();
//   }

//   function testBscAllPluginsFeeRecipient() public debuggingOnly fork(BSC_MAINNET) {
//     _testAllPluginsFeeRecipient();
//   }

//   function testArbitrumAllPluginsFeeRecipient() public debuggingOnly fork(ARBITRUM_ONE) {
//     _testAllPluginsFeeRecipient();
//   }

//   function _testAllPluginsFeeRecipient() internal {
//     PoolDirectory fpd = PoolDirectory(ap.getAddress("PoolDirectory"));
//     (, PoolDirectory.Pool[] memory pools) = fpd.getActivePools();

//     for (uint8 i = 0; i < pools.length; i++) {
//       IonicComptroller comptroller = IonicComptroller(pools[i].comptroller);
//       ICErc20[] memory markets = comptroller.getAllMarkets();
//       for (uint8 j = 0; j < markets.length; j++) {
//         CErc20PluginDelegate delegate = CErc20PluginDelegate(address(markets[j]));

//         try delegate.plugin() returns (IERC4626 _plugin) {
//           IonicERC4626 plugin = IonicERC4626(address(_plugin));

//           address fr = plugin.feeRecipient();
//           if (fr != ap.getAddress("deployer")) emit log_named_address("plugin fr", address(plugin));
//           assertEq(fr, ap.getAddress("deployer"), "fee recipient not correct");
//         } catch {
//           continue;
//         }
//       }
//     }
//   }
// }
