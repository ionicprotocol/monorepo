// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// import { BaseTest } from "../config/BaseTest.t.sol";

// import { FixedPointMathLib } from "solmate/utils/FixedPointMathLib.sol";
// import { IonicERC4626, DotDotLpERC4626, ILpDepositor } from "../../ionic/strategies/DotDotLpERC4626.sol";
// import { ERC20 } from "solmate/tokens/ERC20.sol";
// import { IonicFlywheelCore } from "../../ionic/strategies/flywheel/IonicFlywheelCore.sol";
// import { ComptrollerFirstExtension } from "../../compound/ComptrollerFirstExtension.sol";
// import { PoolDirectory } from "../../PoolDirectory.sol";

// import { FlywheelCore, IFlywheelRewards } from "flywheel-v2/FlywheelCore.sol";
// import { FuseFlywheelDynamicRewards } from "fuse-flywheel/rewards/FuseFlywheelDynamicRewards.sol";
// import { IFlywheelBooster } from "flywheel-v2/interfaces/IFlywheelBooster.sol";
// import { Authority } from "solmate/auth/Auth.sol";

// import { ERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";
// import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

// struct RewardsCycle {
//   uint32 start;
//   uint32 end;
//   uint192 reward;
// }

// contract FlywheelPerformanceFeeTest is BaseTest {
//   using FixedPointMathLib for uint256;

//   uint256 PERFORMANCE_FEE = 10e16;
//   uint256 DEPOSIT_AMOUNT = 100e18;
//   uint256 BPS_DENOMINATOR = 10_000;

//   address feeRecipient = address(16);
//   IonicERC4626 plugin;
//   ERC20Upgradeable underlyingToken = ERC20Upgradeable(0x1B6E11c5DB9B15DE87714eA9934a6c52371CfEA9);

//   address whale = 0x0BC3a8239B0a63E945Ea1bd6722Ba747b9557e56;

//   ILpDepositor lpDepositor = ILpDepositor(0x8189F0afdBf8fE6a9e13c69bA35528ac6abeB1af);
//   ERC20 depositShare = ERC20(0xEFF5b0E496dC7C26fFaA014cEa0d2Baa83DB11c4);

//   ERC20 dddToken = ERC20(0x84c97300a190676a19D1E13115629A11f8482Bd1);
//   address flywheelOwner = address(1338);
//   IonicFlywheelCore dddFlywheel;
//   FuseFlywheelDynamicRewards dddRewards;

//   ERC20 epxToken = ERC20(0xAf41054C1487b0e5E2B9250C0332eCBCe6CE9d71);
//   IonicFlywheelCore epxFlywheel;

//   uint256 rewardAmount = 1000e18;
//   ERC20 marketKey;
//   address marketAddress;

//   ERC20Upgradeable[] rewardsToken;

//   function afterForkSetUp() internal override {
//     vm.startPrank(flywheelOwner);
//     IonicFlywheelCore impl = new IonicFlywheelCore();
//     TransparentUpgradeableProxy proxyDdd = new TransparentUpgradeableProxy(address(impl), address(dpa), "");
//     dddFlywheel = IonicFlywheelCore(address(proxyDdd));
//     dddFlywheel.initialize(dddToken, IFlywheelRewards(address(0)), IFlywheelBooster(address(0)), flywheelOwner);
//     dddRewards = new FuseFlywheelDynamicRewards(FlywheelCore(address(dddFlywheel)), 1);
//     dddFlywheel.setFlywheelRewards(dddRewards);

//     TransparentUpgradeableProxy proxyEpx = new TransparentUpgradeableProxy(address(impl), address(dpa), "");
//     epxFlywheel = IonicFlywheelCore(address(proxyEpx));
//     epxFlywheel.initialize(epxToken, IFlywheelRewards(address(0)), IFlywheelBooster(address(0)), address(this));

//     ERC20 dddFlywheelRewardToken = FlywheelCore(address(dddFlywheel)).rewardToken();
//     rewardsToken.push(ERC20Upgradeable(address(dddFlywheelRewardToken)));
//     ERC20 epxFlywheelRewardToken = FlywheelCore(address(epxFlywheel)).rewardToken();
//     rewardsToken.push(ERC20Upgradeable(address(epxFlywheelRewardToken)));

//     DotDotLpERC4626 dotDotLpERC4626 = new DotDotLpERC4626();
//     dotDotLpERC4626.initialize(
//       underlyingToken,
//       FlywheelCore(address(dddFlywheel)),
//       FlywheelCore(address(epxFlywheel)),
//       ILpDepositor(address(lpDepositor)),
//       address(flywheelOwner),
//       rewardsToken
//     );

//     plugin = dotDotLpERC4626;
//     marketAddress = address(plugin);
//     marketKey = ERC20(address(plugin));

//     dddFlywheel.addStrategyForRewards(marketKey);
//     DotDotLpERC4626(address(plugin)).setRewardDestination(marketAddress);
//     vm.stopPrank();

//     vm.prank(marketAddress);
//     dddToken.approve(address(dddRewards), type(uint256).max);
//   }

//   /* --------------------- HELPER FUNCTIONS --------------------- */

//   function deposit(address _owner, uint256 amount) internal {
//     vm.startPrank(_owner);
//     underlyingToken.approve(address(plugin), amount);
//     plugin.deposit(amount, _owner);
//     vm.stopPrank();
//   }

//   function createPerformanceFee() internal {
//     deal(address(underlyingToken), address(this), DEPOSIT_AMOUNT);

//     deposit(address(this), DEPOSIT_AMOUNT);

//     // Create rewards
//     deal(address(dddToken), marketAddress, rewardAmount);

//     dddFlywheel.accrue(marketKey, address(this));

//     vm.warp(block.timestamp + 150);
//     vm.roll(10);

//     dddFlywheel.accrue(marketKey, address(this));
//   }

//   /* --------------------- FLYWHEEL PERFORMANCE FEE TESTS --------------------- */

//   function test__initializedValues() public fork(BSC_MAINNET) {
//     assertEq(dddFlywheel.performanceFee(), PERFORMANCE_FEE, "!perFee");
//     assertEq(dddFlywheel.feeRecipient(), flywheelOwner, "!feeRecipient");
//   }

//   function test__UpdateFeeSettings() public fork(BSC_MAINNET) {
//     uint256 newPerfFee = 100;
//     address newFeeRecipient = feeRecipient;

//     vm.prank(flywheelOwner);
//     dddFlywheel.updateFeeSettings(newPerfFee, newFeeRecipient);

//     assertEq(dddFlywheel.performanceFee(), newPerfFee, "!perfFee == newPerfFee");
//     assertEq(dddFlywheel.feeRecipient(), newFeeRecipient, "!feeRecipient == newFeeRecipient");
//   }

//   function testRevert__UpdateFeeSettings() public fork(BSC_MAINNET) {
//     vm.prank(feeRecipient);
//     vm.expectRevert("Ownable: caller is not the owner");
//     dddFlywheel.updateFeeSettings(100, feeRecipient);
//   }

//   function test__TakePerformanceFeeInUnderlyingAsset() public fork(BSC_MAINNET) {
//     createPerformanceFee();

//     uint256 expectedPerformanceFee = (rewardAmount * dddFlywheel.performanceFee()) / 1e18;

//     assertEq(
//       dddFlywheel.rewardsAccrued(dddFlywheel.feeRecipient()),
//       expectedPerformanceFee,
//       "rewards accrued of the feeRecipient dont match expectedPerformanceFee"
//     );
//     // Proxy call for checking the global rewards accrued. (address(this) is the only depositor so they should receive all other rewards)
//     assertEq(
//       dddFlywheel.rewardsAccrued(address(this)),
//       rewardAmount - expectedPerformanceFee,
//       "the rewardsState gets updated correctly"
//     );
//   }

//   function test__WithdrawAccruedFees() public fork(BSC_MAINNET) {
//     vm.prank(flywheelOwner);
//     dddFlywheel.updateFeeSettings(PERFORMANCE_FEE, feeRecipient);

//     createPerformanceFee();

//     uint256 expectedPerformanceFee = (rewardAmount * dddFlywheel.performanceFee()) / 1e18;

//     dddFlywheel.claimRewards(feeRecipient);

//     assertEq(dddToken.balanceOf(feeRecipient), expectedPerformanceFee, "feeRecipient didnt receive their fees");
//     assertEq(
//       dddToken.balanceOf(address(dddRewards)),
//       rewardAmount - expectedPerformanceFee,
//       "the rewardsModule didnt properly send the fees"
//     );
//     assertEq(dddFlywheel.rewardsAccrued(feeRecipient), 0, "feeRecipient rewardsAccrued should be 0");
//   }

//   function testPolygonAllFlywheelsFeeRecipient() public debuggingOnly fork(POLYGON_MAINNET) {
//     _testAllFlywheelsFeeRecipient();
//   }

//   function testBscAllFlywheelsFeeRecipient() public debuggingOnly fork(BSC_MAINNET) {
//     _testAllFlywheelsFeeRecipient();
//   }

//   function testArbitrumAllFlywheelsFeeRecipient() public debuggingOnly fork(ARBITRUM_ONE) {
//     _testAllFlywheelsFeeRecipient();
//   }

//   function _testAllFlywheelsFeeRecipient() internal {
//     PoolDirectory fpd = PoolDirectory(ap.getAddress("PoolDirectory"));
//     (, PoolDirectory.Pool[] memory pools) = fpd.getActivePools();

//     for (uint8 i = 0; i < pools.length; i++) {
//       ComptrollerFirstExtension poolExt = ComptrollerFirstExtension(pools[i].comptroller);
//       address[] memory fws = poolExt.getRewardsDistributors();
//       for (uint256 j = 0; j < fws.length; j++) {
//         address fr = IonicFlywheelCore(fws[j]).feeRecipient();
//         if (fr != ap.getAddress("deployer")) emit log_named_address("flywheel fr", fws[j]);
//         assertEq(fr, ap.getAddress("deployer"), "fee recipient not correct");
//       }
//     }
//   }
// }
