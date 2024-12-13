// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import { BaseTest } from "./config/BaseTest.t.sol";

import { IonicFlywheel } from "../ionic/strategies/flywheel/IonicFlywheel.sol";
import { Comptroller } from "../compound/Comptroller.sol";
import { IonicComptroller } from "../compound/ComptrollerInterface.sol";
import { PoolDirectory } from "../PoolDirectory.sol";
import { FeeDistributor } from "../FeeDistributor.sol";
import { Unitroller } from "../compound/Unitroller.sol";
import { ICErc20 } from "../compound/CTokenInterfaces.sol";
import { ComptrollerErrorReporter } from "../compound/ErrorReporter.sol";
import { DiamondExtension } from "../ionic/DiamondExtension.sol";

import { IFlywheelBooster } from "../ionic/strategies/flywheel/IFlywheelBooster.sol";
import { IFlywheelRewards } from "../ionic/strategies/flywheel/rewards/IFlywheelRewards.sol";
import { ERC20 } from "solmate/tokens/ERC20.sol";
import { MockERC20 } from "solmate/test/utils/mocks/MockERC20.sol";
import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

contract ComptrollerTest is BaseTest {
  IonicComptroller internal comptroller;
  IonicFlywheel internal flywheel;
  address internal nonOwner = address(0x2222);

  event Failure(uint256 error, uint256 info, uint256 detail);

  function setUp() public {
    {
      Unitroller proxy = new Unitroller(payable(address(this)));
      proxy._registerExtension(new Comptroller(), DiamondExtension(address(0)));
      comptroller = IonicComptroller(address(proxy));
    }
    {
      ERC20 rewardToken = new MockERC20("RewardToken", "RT", 18);
      IonicFlywheel impl = new IonicFlywheel();
      TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(address(impl), address(dpa), "");
      flywheel = IonicFlywheel(address(proxy));
      flywheel.initialize(rewardToken, IFlywheelRewards(address(2)), IFlywheelBooster(address(3)), address(this));
    }
  }

  function test__setFlywheel() external {
    vm.prank(comptroller.admin());
    comptroller._addRewardsDistributor(address(flywheel));
    assertEq(comptroller.rewardsDistributors(0), address(flywheel));
  }

  function test__setFlywheelRevertsIfNonOwner() external {
    vm.startPrank(nonOwner);
    vm.expectRevert("!admin");
    comptroller._addRewardsDistributor(address(flywheel));
  }

  function testBscInflationProtection() public debuggingOnly fork(BSC_MAINNET) {
    _testInflationProtection();
  }

  function testPolygonInflationProtection() public debuggingOnly fork(POLYGON_MAINNET) {
    _testInflationProtection();
  }

  function testModeInflationProtection() public debuggingOnly fork(MODE_MAINNET) {
    _testInflationProtection();
  }

  function _testInflationProtection() internal {
    PoolDirectory fpd = PoolDirectory(ap.getAddress("PoolDirectory"));
    PoolDirectory.Pool[] memory pools = fpd.getAllPools();
    for (uint256 i = 0; i < pools.length; i++) {
      IonicComptroller pool = IonicComptroller(pools[i].comptroller);
      ICErc20[] memory markets = pool.getAllMarkets();
      for (uint256 j = 0; j < markets.length; j++) {
        ICErc20 market = markets[j];
        uint256 totalSupply = market.totalSupply();
        if (totalSupply > 0) {
          if (totalSupply < 1000) {
            emit log_named_address("low ts market", address(markets[j]));
            emit log_named_uint("ts", totalSupply);
          } else {
            assertEq(
              pool.redeemAllowed(address(markets[j]), address(0), totalSupply - 980),
              uint256(ComptrollerErrorReporter.Error.REJECTION),
              "low ts not rejected"
            );
          }
        }
      }
    }
  }
}
