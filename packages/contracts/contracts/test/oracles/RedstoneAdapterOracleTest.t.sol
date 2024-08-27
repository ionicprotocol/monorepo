// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

import { MasterPriceOracle } from "../../oracles/MasterPriceOracle.sol";
import { RedstoneAdapterPriceOracle } from "../../oracles/default/RedstoneAdapterPriceOracle.sol";

import { BaseTest } from "../config/BaseTest.t.sol";

contract RedstoneAdapterOracleTest is BaseTest {
  MasterPriceOracle public mpo;
  RedstoneAdapterPriceOracle public oracle;
  address public redstoneOracleAddress;
  address MODE_USDC = 0xd988097fb8612cc24eeC14542bC03424c656005f;
  address MODE_EZETH = 0x2416092f143378750bb29b79eD961ab195CcEea5;
  address MODE_WBTC = 0xcDd475325D6F564d27247D1DddBb0DAc6fA0a5CF;
  address MODE_WEETH = 0x028227c4dd1e5419d11Bb6fa6e661920c519D4F5;

  function afterForkSetUp() internal override {
    if (block.chainid == MODE_MAINNET) {
      redstoneOracleAddress = 0x7C1DAAE7BB0688C9bfE3A918A4224041c7177256;
    }

    oracle = new RedstoneAdapterPriceOracle(redstoneOracleAddress);
    mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));
  }

  function testPrintPricesMode() public fork(MODE_MAINNET) {
    emit log_named_uint("ezETH price (18 dec)", oracle.price(MODE_EZETH));
    emit log_named_uint("WBTC price (8 dec)", oracle.price(MODE_WBTC));
    emit log_named_uint("weETH price (18 dec)", oracle.price(MODE_WEETH));
  }

  function testPrintMpoPricesMode() public fork(MODE_MAINNET) {
    emit log_named_uint("weETH price (18 dec)", mpo.price(MODE_WEETH));
  }
}
