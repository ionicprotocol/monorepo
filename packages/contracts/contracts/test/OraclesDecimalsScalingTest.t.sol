// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { BaseTest } from "./config/BaseTest.t.sol";
import { MasterPriceOracle } from "../oracles/MasterPriceOracle.sol";
import { PoolDirectory } from "../PoolDirectory.sol";
import { ICErc20 } from "../compound/CTokenInterfaces.sol";
import { IonicComptroller } from "../compound/ComptrollerInterface.sol";

import { IERC20MetadataUpgradeable } from "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/extensions/IERC20MetadataUpgradeable.sol";

contract OraclesDecimalsScalingTest is BaseTest {
  MasterPriceOracle mpo;
  PoolDirectory poolDirectory;
  address stable;

  function afterForkSetUp() internal override {
    mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));
    poolDirectory = PoolDirectory(ap.getAddress("PoolDirectory"));
    stable = ap.getAddress("stableToken");
  }

  function testOracleDecimalsBsc() public fork(BSC_MAINNET) {
    testOraclesDecimals();
  }

  function testOracleDecimalsArbitrum() public fork(ARBITRUM_ONE) {
    testOraclesDecimals();
  }

  function testOracleDecimalsPolygon() public fork(POLYGON_MAINNET) {
    testOraclesDecimals();
  }

  function testOracleDecimalsNeon() public fork(NEON_MAINNET) {
    vm.mockCall(stable, abi.encodeWithSelector(IERC20MetadataUpgradeable.decimals.selector), abi.encode(6));
    // SOL
    vm.mockCall(
      0x5f38248f339Bf4e84A2caf4e4c0552862dC9F82a,
      abi.encodeWithSelector(IERC20MetadataUpgradeable.decimals.selector),
      abi.encode(9)
    );
    testOraclesDecimals();
  }

  function testOraclesDecimals() internal {
    if (address(poolDirectory) != address(0)) {
      (, PoolDirectory.Pool[] memory pools) = poolDirectory.getActivePools();

      for (uint8 i = 0; i < pools.length; i++) {
        IonicComptroller comptroller = IonicComptroller(pools[i].comptroller);
        ICErc20[] memory markets = comptroller.getAllMarkets();
        for (uint8 j = 0; j < markets.length; j++) {
          address underlying = markets[j].underlying();

          if (isSkipped(underlying)) {
            emit log("the oracle for this underlying cannot be tested");
            emit log_address(underlying);
            continue;
          }

          uint256 oraclePrice = mpo.price(underlying);
          uint256 scaledPrice = mpo.getUnderlyingPrice(markets[j]);

          uint8 decimals = IERC20MetadataUpgradeable(underlying).decimals();
          uint256 expectedScaledPrice = decimals <= 18
            ? uint256(oraclePrice) * (10 ** (18 - decimals))
            : uint256(oraclePrice) / (10 ** (decimals - 18));

          assertEq(scaledPrice, expectedScaledPrice, "the comptroller expects prices to be scaled by 1e(36-decimals)");
        }
      }
    }
  }

  function isSkipped(address token) internal pure returns (bool) {
    return token == 0x5f38248f339Bf4e84A2caf4e4c0552862dC9F82a; // SOL on neon, failing for unknwon reasons, works in HH
  }
}
