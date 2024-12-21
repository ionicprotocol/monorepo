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
import { IHypernativeOracle } from "../external/hypernative/interfaces/IHypernativeOracle.sol";
import { AddressesProvider } from "../ionic/AddressesProvider.sol";
contract MockOraclePasses is IHypernativeOracle {
  function register(address account, bool isStrictMode) external pure {}

  function validateForbiddenAccountInteraction(address sender) external pure {}

  function validateForbiddenContextInteraction(address origin, address sender) external pure {}

  function validateBlacklistedAccountInteraction(address sender) external pure {}
}

contract MockOracleFails is IHypernativeOracle {
  error InteractionNotAllowed();
  function register(address account, bool isStrictMode) external pure {}

  function validateForbiddenAccountInteraction(address sender) external pure {
    revert InteractionNotAllowed();
  }

  function validateForbiddenContextInteraction(address origin, address sender) external pure {
    revert InteractionNotAllowed(); 
  }

  function validateBlacklistedAccountInteraction(address sender) external pure {
    revert InteractionNotAllowed();
  }
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

  function test_mint_failsForBlacklisted() public debuggingOnly forkAtBlock(BASE_MAINNET, 20538729) {
    CTokenFirstExtension asExt = CTokenFirstExtension(address(market));    
    // Set up the oracle
    vm.startPrank(admin);
    ap.setAddress("HYPERNATIVE_ORACLE", address(oracleFails));
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
    ap.setAddress("HYPERNATIVE_ORACLE", address(oraclePasses));

    vm.startPrank(user);
    market.mint(mintAmount);
    vm.stopPrank();

    // check balances
    assertGt(market.balanceOf(user), 0);
  }
}
