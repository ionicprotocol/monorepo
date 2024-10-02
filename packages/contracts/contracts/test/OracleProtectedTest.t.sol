// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import { IERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

import { UpgradesBaseTest } from "./UpgradesBaseTest.sol";
import { CErc20Delegate } from "../compound/CErc20Delegate.sol";
import { ICErc20 } from "../compound/CTokenInterfaces.sol";
import { Comptroller } from "../compound/Comptroller.sol";
import { CTokenFirstExtension, DiamondExtension } from "../compound/CTokenFirstExtension.sol";
import { ComptrollerFirstExtension } from "../compound/ComptrollerFirstExtension.sol";
import { IonicComptroller } from "../compound/ComptrollerInterface.sol";
import { FeeDistributor } from "../FeeDistributor.sol";
import { PoolDirectory } from "../PoolDirectory.sol";
import { CErc20Delegate } from "../compound/CErc20Delegate.sol";
import { InterestRateModel } from "../compound/InterestRateModel.sol";
import { IHypernativeOracle } from "../compound/CTokenOracleProtected.sol";

contract MockOraclePasses is IHypernativeOracle {
  function isBlacklistedContext(address _account, address _origin) external pure returns (bool) {
    return false;
  }
  function isTimeExceeded(address _account) external pure returns (bool) {
    return true;
  }
  function isBlacklistedAccount(address _account) external pure returns (bool) {
    return false;
  }
  function register(address _account) external {}
  function registerStrict(address _account) external {}
}

contract MockOracleFails is IHypernativeOracle {
  function isBlacklistedContext(address _account, address _origin) external pure returns (bool) {
    return true;
  }

  function isTimeExceeded(address _account) external pure returns (bool) {
    return true;
  }

  function isBlacklistedAccount(address _account) external pure returns (bool) {
    return false;
  }
  function register(address _account) external {}
  function registerStrict(address _account) external {}
}

contract OracleProtectedTest is UpgradesBaseTest {
  error InteractionNotAllowed();
  ICErc20 market = ICErc20(0x49420311B518f3d0c94e897592014de53831cfA3);
  address admin = 0x1155b614971f16758C92c4890eD338C9e3ede6b7;
  IHypernativeOracle oraclePasses;
  IHypernativeOracle oracleFails;
  function afterForkSetUp() internal override {
    super.afterForkSetUp();
    _upgradeMarketWithExtension(market);
    oraclePasses = new MockOraclePasses();
    oracleFails = new MockOracleFails();
  }
  // fork before the accrue interest refactoring
  function test_setOracle_failsForNonAdmin(address user) public debuggingOnly forkAtBlock(BASE_MAINNET, 20538729) {
    vm.assume(user != admin);
    CTokenFirstExtension asExt = CTokenFirstExtension(address(market));
    vm.prank(user);
    vm.expectRevert(bytes("!admin"));
    asExt.setOracle(address(oraclePasses));
  }

  function test_setOracle_worksForAdmin() public debuggingOnly forkAtBlock(BASE_MAINNET, 20538729) {
    CTokenFirstExtension asExt = CTokenFirstExtension(address(market));
    vm.prank(admin);
    asExt.setOracle(address(oraclePasses));
    assertEq(asExt.hypernativeOracle(), address(oraclePasses));
  }

  function test_setIsStrictMode_worksForAdmin() public debuggingOnly forkAtBlock(BASE_MAINNET, 20538729) {
    CTokenFirstExtension asExt = CTokenFirstExtension(address(market));
    vm.prank(admin);
    asExt.setIsStrictMode(true);
    assertTrue(asExt.hypernativeOracleIsStrictMode());
  }

  function test_mint_failsForBlacklisted() public debuggingOnly forkAtBlock(BASE_MAINNET, 20538729) {
    CTokenFirstExtension asExt = CTokenFirstExtension(address(market));    
    // Set up the oracle
    vm.startPrank(admin);
    asExt.setOracle(address(oracleFails));
    vm.stopPrank();
    
    // Try to mint
    address user = address(0x1234);
    uint256 mintAmount = 1e18;
    deal(asExt.underlying(), user, mintAmount);
    
    vm.startPrank(user);
    ICErc20(asExt.underlying()).approve(address(asExt), mintAmount);
    
    vm.expectRevert(InteractionNotAllowed.selector);
    market.mint(mintAmount);
    vm.stopPrank();

    // Set up the oracle to pass
    vm.prank(admin);
    asExt.setOracle(address(oraclePasses));

    vm.startPrank(user);
    market.mint(mintAmount);
    vm.stopPrank();

    // check balances
    assertGt(market.balanceOf(user), 0);
  }
}
