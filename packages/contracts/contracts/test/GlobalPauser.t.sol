// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { ERC20 } from "solmate/tokens/ERC20.sol";
import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

import "./config/BaseTest.t.sol";
import { IonicComptroller } from "../compound/ComptrollerInterface.sol";
import { IComptroller } from "../external/compound/IComptroller.sol";
import { GlobalPauser } from "../GlobalPauser.sol";
import { PoolDirectory } from "../PoolDirectory.sol";
import { ICErc20 } from "../compound/CTokenInterfaces.sol";

import "forge-std/console.sol";

contract GlobalPauserTest is BaseTest {
  address public poolDirectory = 0x39C353Cf9041CcF467A04d0e78B63d961E81458a;
  address public pauseGuardian = 0xD9677b0eeafdCe6BF322d9774Bb65B1f42cF0404;
  address public multisig = 0x8Fba84867Ba458E7c6E2c024D2DE3d0b5C3ea1C2;
  GlobalPauser public pauser; // = GlobalPauser(0xe646D8Be18e545244C5E79F121202f75FA3880c8);

  function afterForkSetUp() internal override {
    super.afterForkSetUp();
    pauser = new GlobalPauser(poolDirectory);
    pauser.setPauseGuardian(pauseGuardian, true);
    (, PoolDirectory.Pool[] memory pools) = PoolDirectory(poolDirectory).getActivePools();
    for (uint256 i = 0; i < pools.length; i++) {
      vm.prank(IonicComptroller(pools[i].comptroller).admin());
      IonicComptroller(pools[i].comptroller)._setPauseGuardian(address(pauser));
    }
  }

  function testPauseNotGuardian(address sender) public debuggingOnly forkAtBlock(MODE_MAINNET, 9269895) {
    vm.assume(sender != pauseGuardian);
    vm.expectRevert(bytes("!guardian"));
    pauser.pauseAll();
  }

  function testPauseAll() public debuggingOnly forkAtBlock(MODE_MAINNET, 9269895) {
    (, PoolDirectory.Pool[] memory pools) = PoolDirectory(poolDirectory).getActivePools();
    for (uint256 i = 0; i < pools.length; i++) {
      ICErc20[] memory markets = IonicComptroller(pools[i].comptroller).getAllMarkets();
      for (uint256 j = 0; j < markets.length; j++) {
        bool isPaused = IonicComptroller(pools[i].comptroller).borrowGuardianPaused(address(markets[j]));
        assertEq(isPaused, false);
        isPaused = IonicComptroller(pools[i].comptroller).mintGuardianPaused(address(markets[j]));
        assertEq(isPaused, false);
      }
    }
    vm.prank(pauseGuardian);
    pauser.pauseAll();
    for (uint256 i = 0; i < pools.length; i++) {
      ICErc20[] memory markets = IonicComptroller(pools[i].comptroller).getAllMarkets();
      for (uint256 j = 0; j < markets.length; j++) {
        bool isPaused = IonicComptroller(pools[i].comptroller).borrowGuardianPaused(address(markets[j]));
        assertEq(isPaused, true);
        isPaused = IonicComptroller(pools[i].comptroller).mintGuardianPaused(address(markets[j]));
        assertEq(isPaused, true);
      }
    }
  }
}
