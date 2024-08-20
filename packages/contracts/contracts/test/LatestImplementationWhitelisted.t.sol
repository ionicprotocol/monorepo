pragma solidity ^0.8.0;

import { CErc20 } from "../compound/CToken.sol";
import { IonicComptroller } from "../compound/ComptrollerInterface.sol";
import { CErc20Delegate } from "../compound/CErc20Delegate.sol";
import { CErc20PluginDelegate } from "../compound/CErc20PluginDelegate.sol";
import { FeeDistributor } from "../FeeDistributor.sol";
import { PoolDirectory } from "../PoolDirectory.sol";
import { ICErc20 } from "../compound/CTokenInterfaces.sol";
import { IERC4626 } from "../compound/IERC4626.sol";

import { BaseTest } from "./config/BaseTest.t.sol";

contract LatestImplementationWhitelisted is BaseTest {
  FeeDistributor ionicAdmin;
  PoolDirectory poolDirectory;

  address[] poolsImplementationsSet;
  address[] marketsImplementationsSet;
  address[] pluginsSet;

  function testBscImplementations() public fork(BSC_MAINNET) {
    testPoolImplementations();
    testMarketImplementations();
    testPluginImplementations();
  }

  function testPolygonImplementations() public fork(POLYGON_MAINNET) {
    testPoolImplementations();
    testMarketImplementations();
    testPluginImplementations();
  }

  function afterForkSetUp() internal override {
    poolDirectory = PoolDirectory(ap.getAddress("PoolDirectory"));
    ionicAdmin = FeeDistributor(payable(ap.getAddress("FeeDistributor")));
  }

  function testPoolImplementations() internal {
    (, PoolDirectory.Pool[] memory pools) = poolDirectory.getActivePools();

    for (uint8 i = 0; i < pools.length; i++) {
      IonicComptroller comptroller = IonicComptroller(payable(pools[i].comptroller));
      address implementation = comptroller.comptrollerImplementation();

      bool added = false;
      for (uint8 k = 0; k < poolsImplementationsSet.length; k++) {
        if (poolsImplementationsSet[k] == implementation) {
          added = true;
        }
      }

      if (!added) poolsImplementationsSet.push(implementation);
    }

    emit log("listing the set");
    for (uint8 k = 0; k < poolsImplementationsSet.length; k++) {
      emit log_address(poolsImplementationsSet[k]);

      address latestImpl = ionicAdmin.latestComptrollerImplementation(poolsImplementationsSet[k]);
      assertTrue(poolsImplementationsSet[k] == latestImpl, "some pool is not upgraded the latest impl");
    }
  }

  function testMarketImplementations() internal {
    (, PoolDirectory.Pool[] memory pools) = poolDirectory.getActivePools();

    for (uint8 i = 0; i < pools.length; i++) {
      IonicComptroller comptroller = IonicComptroller(payable(pools[i].comptroller));
      ICErc20[] memory markets = comptroller.getAllMarkets();
      for (uint8 j = 0; j < markets.length; j++) {
        ICErc20 market = markets[j];
        address implementation = market.implementation();

        bool added = false;
        for (uint8 k = 0; k < marketsImplementationsSet.length; k++) {
          if (marketsImplementationsSet[k] == implementation) {
            added = true;
          }
        }

        if (!added) marketsImplementationsSet.push(implementation);
      }
    }

    emit log("listing the set");
    for (uint8 k = 0; k < marketsImplementationsSet.length; k++) {
      emit log_address(marketsImplementationsSet[k]);
      (address latestCErc20Delegate, bytes memory becomeImplementationData) = ionicAdmin.latestCErc20Delegate(
        CErc20Delegate(marketsImplementationsSet[k]).delegateType()
      );

      assertTrue(marketsImplementationsSet[k] == latestCErc20Delegate, "some markets need to be upgraded");
    }
  }

  function testPluginImplementations() internal {
    (, PoolDirectory.Pool[] memory pools) = poolDirectory.getActivePools();

    for (uint8 i = 0; i < pools.length; i++) {
      IonicComptroller comptroller = IonicComptroller(payable(pools[i].comptroller));
      ICErc20[] memory markets = comptroller.getAllMarkets();
      for (uint8 j = 0; j < markets.length; j++) {
        CErc20PluginDelegate delegate = CErc20PluginDelegate(address(markets[j]));

        address plugin;
        try delegate.plugin() returns (IERC4626 _plugin) {
          plugin = address(_plugin);
        } catch {
          continue;
        }

        bool added = false;
        for (uint8 k = 0; k < pluginsSet.length; k++) {
          if (pluginsSet[k] == plugin) {
            added = true;
          }
        }

        if (!added) pluginsSet.push(plugin);
      }
    }

    emit log("listing the set");
    for (uint8 k = 0; k < pluginsSet.length; k++) {
      address latestPluginImpl = ionicAdmin.latestPluginImplementation(pluginsSet[k]);

      emit log_address(pluginsSet[k]);

      assertTrue(pluginsSet[k] == latestPluginImpl, "some plugin is not upgraded to the latest impl");
    }
  }
}
