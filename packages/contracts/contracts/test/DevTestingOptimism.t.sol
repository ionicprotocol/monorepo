// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { ERC20 } from "solmate/tokens/ERC20.sol";
import { IERC20Upgradeable } from "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

import "./config/BaseTest.t.sol";
import { IonicComptroller } from "../compound/ComptrollerInterface.sol";
import { ICErc20 } from "../compound/CTokenInterfaces.sol";
import { PoolLens } from "../PoolLens.sol";
import { PoolLensSecondary } from "../PoolLensSecondary.sol";
import { PoolDirectory } from "../PoolDirectory.sol";
import { ILiquidator } from "../ILiquidator.sol";
import { IonicUniV3Liquidator } from "../IonicUniV3Liquidator.sol";
import { AddressesProvider } from "../ionic/AddressesProvider.sol";

import "forge-std/console.sol";

interface IAddressesProviderGetter {
  function ap() external view returns (address);
}

contract DevTestingOptimism is BaseTest {
  struct LiquidationData {
    ICErc20 collateralCToken;
    ICErc20 debtCToken;
    uint256 maxRepayAmount;
    uint256 healthFactor;
    uint256 healthFactorThreshold;
  }

  struct LiquidationTestData {
    ICErc20 debtCToken;
    ICErc20 collateralCToken;
    uint256 borrowBalance;
    uint256 repayAmount;
    uint256 collateralFactorMantissa;
    uint256 closeFactorMantissa;
    uint256 collateralBalance;
    address wethToken;
  }
  function testOptimismUserPosition() public debuggingOnly {
    // Create Optimism fork
    uint256 optimismFork = vm.createFork("https://optimism-rpc.publicnode.com");
    vm.selectFork(optimismFork);

    // Initialize contracts
    PoolLens lens = PoolLens(0x9c9CB0C521b05b368A11BC3B2AB6adb870D05f87);
    PoolDirectory poolDirectory = PoolDirectory(0xBbDcA7858ac2417b06636F7BA35e7d9EA39402ea);

    // User address to analyze
    address user = 0xe2bEebb3A14E56aE649c2C70BE0d56155f83447f;

    emit log("=================================================================");
    emit log_named_address("User Assets on Optimism", user);
    emit log("=================================================================");

    // Get all active pools
    (, PoolDirectory.Pool[] memory activePools) = poolDirectory.getActivePools();

    // Iterate through each pool
    for (uint256 j = 0; j < activePools.length; j++) {
      IonicComptroller comptroller = IonicComptroller(activePools[j].comptroller);

      // Get user's assets in this pool
      PoolLens.PoolAsset[] memory assets = lens.getPoolAssetsByUser(comptroller, user);

      // Check if user has any position in this pool
      bool hasPosition = false;
      for (uint256 i = 0; i < assets.length; i++) {
        if (assets[i].supplyBalance > 0 || assets[i].borrowBalance > 0) {
          hasPosition = true;
          break;
        }
      }

      // Only display pools where user has positions
      if (hasPosition) {
        emit log("-----------------------------------------------------------------");
        emit log_named_string("Pool", activePools[j].name);
        emit log_named_address("Comptroller", address(comptroller));
        emit log("-----------------------------------------------------------------");

        // Display each asset
        for (uint256 i = 0; i < assets.length; i++) {
          if (assets[i].supplyBalance > 0 || assets[i].borrowBalance > 0) {
            emit log_named_string("Asset", assets[i].underlyingName);
            emit log_named_string("Symbol", assets[i].underlyingSymbol);
            emit log_named_address("cToken", assets[i].cToken);
            emit log_named_address("Underlying", assets[i].underlyingToken);

            if (assets[i].supplyBalance > 0) {
              emit log_named_uint("Supplied", assets[i].supplyBalance);
            }

            if (assets[i].borrowBalance > 0) {
              emit log_named_uint("Borrowed", assets[i].borrowBalance);
            }

            emit log_named_uint("Price (ETH)", assets[i].underlyingPrice);
          }
        }
        emit log("");
      }
    }

    emit log("Analysis complete!");
  }

  function testOptimismLiquidation() public debuggingOnly {
    // Create Optimism fork
    uint256 optimismFork = vm.createFork("https://optimism-rpc.publicnode.com");
    vm.selectFork(optimismFork);

    // Initialize contracts
    PoolLens lens = PoolLens(0x9c9CB0C521b05b368A11BC3B2AB6adb870D05f87);
    PoolDirectory poolDirectory = PoolDirectory(0xBbDcA7858ac2417b06636F7BA35e7d9EA39402ea);
    IonicUniV3Liquidator liquidator = IonicUniV3Liquidator(payable(0x3647Db1e9d33aD2BfBD1afCD1DA41fa0F2c17c20));

    // User address to liquidate (has WETH for approvals)
    address user = 0xe2bEebb3A14E56aE649c2C70BE0d56155f83447f;
    // User with WETH for token approvals
    address wethUser = 0x07aE8551Be970cB1cCa11Dd7a11F47Ae82e70E67;

    emit log("=================================================================");
    emit log_named_address("Liquidating User on Optimism", user);
    emit log("=================================================================");

    // Get all active pools
    (, PoolDirectory.Pool[] memory activePools) = poolDirectory.getActivePools();

    // Find user's positions and attempt liquidation
    for (uint256 j = 0; j < activePools.length; j++) {
      IonicComptroller comptroller = IonicComptroller(activePools[j].comptroller);

      // Get user's assets in this pool
      PoolLens.PoolAsset[] memory assets = lens.getPoolAssetsByUser(comptroller, user);

      // Check if user has any position in this pool
      bool hasPosition = false;
      for (uint256 i = 0; i < assets.length; i++) {
        if (assets[i].supplyBalance > 0 || assets[i].borrowBalance > 0) {
          hasPosition = true;
          break;
        }
      }

      // Only process pools where user has positions
      if (hasPosition) {
        emit log("-----------------------------------------------------------------");
        emit log_named_string("Pool", activePools[j].name);
        emit log_named_address("Comptroller", address(comptroller));
        emit log("-----------------------------------------------------------------");

        // Initialize liquidation test data struct
        LiquidationTestData memory testData;
        testData.debtCToken = ICErc20(0x53b1D15b24d93330b2fD359C798dE7183255e7f2); // WETH cToken
        testData.collateralCToken = ICErc20(0x50549be7e21C3dc0Db03c3AbAb83e1a78d07e6e0); // USDC cToken

        // Get current borrow balance and use a smaller amount
        testData.borrowBalance = testData.debtCToken.borrowBalanceCurrent(user);
        testData.repayAmount = testData.borrowBalance / 10; // Try 10% instead of 50%

        emit log_named_uint("Current Borrow Balance", testData.borrowBalance);
        emit log_named_uint("Repay Amount (10%)", testData.repayAmount);

        // Check liquidation parameters
        (, testData.collateralFactorMantissa) = comptroller.markets(address(testData.collateralCToken));
        testData.closeFactorMantissa = comptroller.liquidationIncentiveMantissa();

        emit log_named_uint("Collateral Factor", testData.collateralFactorMantissa);
        emit log_named_uint("Liquidation Incentive", testData.closeFactorMantissa);

        // Get collateral balance
        testData.collateralBalance = testData.collateralCToken.balanceOfUnderlying(user);
        emit log_named_uint("Collateral Balance", testData.collateralBalance);

        // Get WETH token address
        testData.wethToken = testData.debtCToken.underlying();

        // Prank as WETH user to approve and perform liquidation
        vm.startPrank(wethUser);

        // Approve the liquidator to spend WETH
        IERC20Upgradeable(testData.wethToken).approve(address(liquidator), testData.repayAmount);

        // Call liquidation
        try
          liquidator.safeLiquidate(
            user, // borrower
            testData.repayAmount, // repayAmount
            testData.debtCToken, // cErc20 (WETH)
            testData.collateralCToken, // cTokenCollateral (USDC)
            0 // minOutputAmount
          )
        returns (uint256 seizedAmount) {
          emit log_named_uint("Liquidation successful! Seized amount", seizedAmount);
        } catch Error(string memory reason) {
          emit log_named_string("Liquidation failed", reason);
        } catch {
          emit log("Liquidation failed with unknown error");
        }

        vm.stopPrank();
        emit log("");
      }
    }

    emit log("Liquidation analysis complete!");
  }

  function testOptimismAllMarketsAP() public debuggingOnly {
    // Create Optimism fork
    uint256 optimismFork = vm.createFork("https://optimism-rpc.publicnode.com");
    vm.selectFork(optimismFork);

    // Initialize contracts
    PoolDirectory poolDirectory = PoolDirectory(0xBbDcA7858ac2417b06636F7BA35e7d9EA39402ea);

    emit log("=================================================================");
    emit log("All Markets AP (AddressesProvider) Values on Optimism");
    emit log("=================================================================");

    // Get all active pools
    (, PoolDirectory.Pool[] memory activePools) = poolDirectory.getActivePools();
    emit log_named_uint("Total Active Pools", activePools.length);

    // Iterate through each pool
    for (uint256 j = 0; j < activePools.length; j++) {
      IonicComptroller comptroller = IonicComptroller(activePools[j].comptroller);

      emit log("-----------------------------------------------------------------");
      emit log_named_string("Pool", activePools[j].name);
      emit log_named_address("Comptroller", address(comptroller));

      // Get all markets in this pool
      ICErc20[] memory markets = comptroller.getAllMarkets();
      emit log_named_uint("Total Markets in Pool", markets.length);

      // Iterate through each market
      for (uint256 i = 0; i < markets.length; i++) {
        ICErc20 cToken = markets[i];

        try IAddressesProviderGetter(address(cToken)).ap() returns (address apAddress) {
          emit log_named_string("Market", cToken.symbol());
          emit log_named_address("cToken Address", address(cToken));
          emit log_named_address("AP (AddressesProvider)", apAddress);
        } catch {
          emit log_named_string("Market", cToken.symbol());
          emit log_named_address("cToken Address", address(cToken));
          emit log("Failed to get AP address");
        }
      }
      emit log("");
    }

    emit log("AP analysis complete!");
  }
}
