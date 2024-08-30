// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import { BaseTest } from "./config/BaseTest.t.sol";
import { SafeOwnableUpgradeable } from "../ionic/SafeOwnableUpgradeable.sol";
import { MasterPriceOracle } from "../oracles/MasterPriceOracle.sol";
import { PoolDirectory } from "../PoolDirectory.sol";
import { IonicComptroller } from "../compound/ComptrollerInterface.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

contract ProtocolAdminTest is BaseTest {
  address public expectedAdmin;

  function afterForkSetUp() internal virtual override {}

  function _checkIfAdmin(address addr, string memory contractName) internal {
    emit log("");
    emit log(contractName);
    assertEq(addr, expectedAdmin, "not the same admin address");
  }

  function _checkSafeOwnableAdmin(string memory contractName) internal {
    SafeOwnableUpgradeable ownable = SafeOwnableUpgradeable(ap.getAddress(contractName));
    if (address(ownable) != address(0)) {
      _checkIfAdmin(ownable.owner(), contractName);
    }
  }

  function _checkOwnableAdmin(string memory contractName) internal {
    Ownable ownable = Ownable(ap.getAddress(contractName));
    if (address(ownable) != address(0)) {
      _checkIfAdmin(ownable.owner(), contractName);
    }
  }

  function testModeProtocolAdmin() public debuggingOnly fork(MODE_MAINNET) {
    expectedAdmin = 0x8Fba84867Ba458E7c6E2c024D2DE3d0b5C3ea1C2; // gnosis safe multisig contract
    _testProtocolAdmin();
  }

  function _testProtocolAdmin() internal {
    //expectedAdmin = ap.owner();
    // safe ownable
    _checkSafeOwnableAdmin("FeeDistributor");
    _checkSafeOwnableAdmin("PoolDirectory");
    _checkSafeOwnableAdmin("OptimizedVaultsRegistry");
    _checkSafeOwnableAdmin("AnkrCertificateTokenPriceOracle");
    _checkSafeOwnableAdmin("BalancerLpLinearPoolPriceOracle");
    _checkSafeOwnableAdmin("BalancerLpStablePoolPriceOracle");
    _checkSafeOwnableAdmin("BalancerLpTokenPriceOracle");
    _checkSafeOwnableAdmin("BalancerLpTokenPriceOracleNTokens");
    _checkSafeOwnableAdmin("BalancerRateProviderOracle");
    _checkSafeOwnableAdmin("BNBxPriceOracle");
    _checkSafeOwnableAdmin("CurveLpTokenPriceOracleNoRegistry");
    _checkSafeOwnableAdmin("CurveV2LpTokenPriceOracleNoRegistry");
    _checkSafeOwnableAdmin("CurveV2PriceOracle");
    _checkSafeOwnableAdmin("ERC4626Oracle");
    _checkSafeOwnableAdmin("GammaPoolUniswapV3PriceOracle");
    _checkSafeOwnableAdmin("GammaPoolAlgebraPriceOracle");
    _checkSafeOwnableAdmin("PythPriceOracle");
    _checkSafeOwnableAdmin("SimplePriceOracle");
    _checkSafeOwnableAdmin("SolidlyPriceOracle");
    _checkSafeOwnableAdmin("StkBNBPriceOracle");
    _checkSafeOwnableAdmin("WSTEthPriceOracle");
    _checkSafeOwnableAdmin("NativeUSDPriceOracle");

    // ownable 2 step
    _checkSafeOwnableAdmin("LiquidatorsRegistry");
    _checkSafeOwnableAdmin("LeveredPositionFactory");
    _checkSafeOwnableAdmin("OptimizedAPRVault");

    _checkOwnableAdmin("DefaultProxyAdmin");
    _checkOwnableAdmin("DiaPriceOracle");
    _checkOwnableAdmin("PoolDirectory");

    assertEq(MasterPriceOracle(ap.getAddress("MasterPriceOracle")).admin(), expectedAdmin, "mpo admin incorrect");

    // check all the pool admins and the flywheels owners
    PoolDirectory poolDir = PoolDirectory(ap.getAddress("PoolDirectory"));
    PoolDirectory.Pool[] memory pools = poolDir.getAllPools();
    for (uint256 i = 0; i < pools.length; i++) {
      IonicComptroller pool = IonicComptroller(pools[i].comptroller);
      assertEq(pool.admin(), expectedAdmin, "pool admin does not match");

      address[] memory flywheels = pool.getRewardsDistributors();
      for (uint256 j = 0; j < flywheels.length; j++) {
        assertEq(Ownable(flywheels[j]).owner(), expectedAdmin, "flywheel owner not the admin");
      }
    }
  }
}
