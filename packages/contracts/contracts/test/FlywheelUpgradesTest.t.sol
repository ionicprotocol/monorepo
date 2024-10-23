// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

// import { BaseTest } from "./config/BaseTest.t.sol";

// import { PoolDirectory } from "../PoolDirectory.sol";
// import { IonicComptroller } from "../compound/ComptrollerInterface.sol";
// import { IonicFlywheelCore } from "../ionic/strategies/flywheel/IonicFlywheelCore.sol";
// import { IonicReplacingFlywheel } from "../ionic/strategies/flywheel/IonicReplacingFlywheel.sol";
// import { ReplacingFlywheelDynamicRewards } from "../ionic/strategies/flywheel/rewards/ReplacingFlywheelDynamicRewards.sol";
// import { IonicFlywheelLensRouter } from "../ionic/strategies/flywheel/IonicFlywheelLensRouter.sol";
// import { CErc20PluginRewardsDelegate } from "../compound/CErc20PluginRewardsDelegate.sol";
// import { ComptrollerFirstExtension } from "../compound/ComptrollerFirstExtension.sol";
// import { ICErc20 } from "../compound/CTokenInterfaces.sol";
// import { Comptroller } from "../compound/Comptroller.sol";
// import { FlywheelCore } from "../ionic/strategies/flywheel/FlywheelCore.sol";
// import { IFlywheelRewards } from "../ionic/strategies/flywheel/rewards/IFlywheelRewards.sol";
// import { FlywheelDynamicRewards } from "../ionic/strategies/flywheel/rewards/FlywheelDynamicRewards.sol";

// import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
// import { ERC20 } from "solmate/tokens/ERC20.sol";

// contract FlywheelUpgradesTest is BaseTest {
//   PoolDirectory internal fpd;

//   function afterForkSetUp() internal override {
//     fpd = PoolDirectory(ap.getAddress("PoolDirectory"));
//   }

//   function testFlywheelUpgradeBsc() public fork(BSC_MAINNET) {
//     _testFlywheelUpgrade();
//   }

//   function testFlywheelUpgradePolygon() public fork(POLYGON_MAINNET) {
//     _testFlywheelUpgrade();
//   }

//   function _testFlywheelUpgrade() internal {
//     IonicFlywheelCore newImpl = new IonicFlywheelCore();

//     (, PoolDirectory.Pool[] memory pools) = fpd.getActivePools();

//     for (uint8 i = 0; i < pools.length; i++) {
//       IonicComptroller pool = IonicComptroller(pools[i].comptroller);

//       ICErc20[] memory markets = pool.getAllMarkets();

//       address[] memory flywheels = pool.getRewardsDistributors();
//       if (flywheels.length > 0) {
//         emit log("");
//         emit log_named_address("pool", address(pool));
//       }
//       for (uint8 j = 0; j < flywheels.length; j++) {
//         IonicFlywheelCore flywheel = IonicFlywheelCore(flywheels[j]);

//         // upgrade
//         TransparentUpgradeableProxy proxy = TransparentUpgradeableProxy(payable(flywheels[j]));
//         bytes32 bytesAtSlot = vm.load(address(proxy), _ADMIN_SLOT);
//         address admin = address(uint160(uint256(bytesAtSlot)));

//         if (admin != address(0)) {
//           //vm.prank(admin);
//           //proxy.upgradeTo(address(newImpl));
//           //emit log_named_address("upgradable flywheel", address(flywheel));

//           bool anyStrategyHasPositiveIndex = false;

//           for (uint8 k = 0; k < markets.length; k++) {
//             ERC20 strategy = ERC20(address(markets[k]));
//             (uint224 index, uint32 ts) = flywheel.strategyState(strategy);
//             if (index > 0) {
//               anyStrategyHasPositiveIndex = true;
//               break;
//             }
//           }

//           if (!anyStrategyHasPositiveIndex) {
//             emit log_named_address("all zero index strategies flywheel", address(flywheel));
//             //assertTrue(anyStrategyHasPositiveIndex, "!flywheel has no strategies added or is broken");
//           }
//         } else {
//           emit log_named_address("not upgradable flywheel", address(flywheel));
//           assertTrue(false, "flywheel proxy admin 0");
//         }
//       }
//     }
//   }

//   function testPolygonFlywheelAllowance() public fork(POLYGON_MAINNET) {
//     _testAllPoolsMarketsAllowance();
//   }

//   function testBscFlywheelAllowance() public fork(BSC_MAINNET) {
//     _testAllPoolsMarketsAllowance();
//   }

//   function _testAllPoolsMarketsAllowance() internal {
//     (, PoolDirectory.Pool[] memory pools) = fpd.getActivePools();

//     for (uint8 i = 0; i < pools.length; i++) {
//       _testMarketsAllowance(pools[i].comptroller);
//     }
//   }

//   function _testMarketsAllowance(address poolAddress) internal {
//     ComptrollerFirstExtension poolExt = ComptrollerFirstExtension(poolAddress);
//     address[] memory fws = poolExt.getRewardsDistributors();

//     ICErc20[] memory markets = poolExt.getAllMarkets();

//     for (uint8 j = 0; j < markets.length; j++) {
//       string memory contractType = CErc20PluginRewardsDelegate(address(markets[j])).contractType();
//       // check it only for dynamic rewards flywheels
//       if (compareStrings(contractType, "CErc20PluginRewardsDelegate")) {
//         for (uint8 i = 0; i < fws.length; i++) {
//           ERC20 asStrategy = ERC20(address(markets[j]));
//           IonicFlywheelCore flywheel = IonicFlywheelCore(fws[i]);
//           (uint224 index, ) = flywheel.strategyState(asStrategy);
//           ERC20 rewToken = flywheel.rewardToken();
//           address rewardsContractAddress = address(flywheel.flywheelRewards());
//           if (index > 0) {
//             uint256 allowance = rewToken.allowance(address(asStrategy), rewardsContractAddress);
//             if (allowance == 0) {
//               assertGt(allowance, 0, "!approved");
//               emit log_named_address("flywheel rewards", rewardsContractAddress);
//               emit log_named_address("strategy", address(asStrategy));
//               emit log_named_address("rwtoken", address(rewToken));
//               break;
//             }
//           }
//         }
//       }
//     }
//   }
// }
