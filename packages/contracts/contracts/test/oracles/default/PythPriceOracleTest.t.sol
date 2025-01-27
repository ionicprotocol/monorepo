// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { PythPriceOracle } from "../../../oracles/default/PythPriceOracle.sol";
import { MasterPriceOracle } from "../../../oracles/MasterPriceOracle.sol";
import { BaseTest } from "../../config/BaseTest.t.sol";
import { IPyth } from "@pythnetwork/pyth-sdk-solidity/MockPyth.sol";
import { PythStructs } from "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
import { ERC20Upgradeable } from "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";
import { BasePriceOracle } from "../../../oracles/BasePriceOracle.sol";

contract PythPriceOracleTest is BaseTest {
  PythPriceOracle oracle;
  IPyth pythOracle;
  MasterPriceOracle mpo;

  address stable;
  address wtoken;
  address wbtc;

  address neonPyth = 0x7f2dB085eFC3560AFF33865dD727225d91B4f9A5;
  address lineaPyth = 0xA2aa501b19aff244D90cc15a4Cf739D2725B5729;
  address polygonPyth = 0xff1a0f4744e8582DF1aE09D5611b887B6a12925C;
  address zkevmPyth = 0xC5E56d6b40F3e3B5fbfa266bCd35C37426537c65;

  bytes32 ethUsdTokenPriceFeed = 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace;
  bytes32 btcUsdTokenPriceFeed = 0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43;
  bytes32 neonUsdTokenPriceFeed = 0xd82183dd487bef3208a227bb25d748930db58862c5121198e723ed0976eb92b7;
  bytes32 maticUsdTokenPriceFeed = 0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52;
  bytes32 usdcUsdTokenPriceFeed = 0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a;

  function afterForkSetUp() internal override {
    stable = ap.getAddress("stableToken");
    wtoken = ap.getAddress("wtoken");
    wbtc = ap.getAddress("wBTCToken");
    mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));
    oracle = new PythPriceOracle();

    // create an array of bytes to pass to the oracle
    bytes32[] memory feedIds = new bytes32[](2);
    feedIds[0] = usdcUsdTokenPriceFeed;
    feedIds[1] = btcUsdTokenPriceFeed;
    vm.startPrank(mpo.admin());

    if (block.chainid == NEON_MAINNET) {
      oracle.initialize(neonPyth, neonUsdTokenPriceFeed, stable);
    } else if (block.chainid == LINEA_MAINNET) {
      oracle.initialize(lineaPyth, ethUsdTokenPriceFeed, stable);
    } else if (block.chainid == POLYGON_MAINNET) {
      oracle.initialize(polygonPyth, maticUsdTokenPriceFeed, stable);
    } else if (block.chainid == ZKEVM_MAINNET) {
      oracle.initialize(zkevmPyth, ethUsdTokenPriceFeed, stable);
    } else {
      revert("Unsupported chain");
    }
    oracle.setPriceFeeds(asArray(stable, wbtc), feedIds);
    vm.stopPrank();
  }

  function testPolygonTokenPrice() public debuggingOnly fork(POLYGON_MAINNET) {
    PythStructs.Price memory pythPrice = IPyth(polygonPyth).getPriceUnsafe(maticUsdTokenPriceFeed);
    emit log_named_uint("price", uint256(uint64(pythPrice.price)));
    emit log_named_uint("updated", pythPrice.publishTime);
    emit log_named_uint("ts", block.timestamp);

    uint256 price = oracle.price(wbtc);
    uint256 priceMpo = mpo.price(wbtc);
    assertApproxEqRel(price, priceMpo, 1e16);
  }

  function testLineaTokenPrice() public debuggingOnly fork(LINEA_MAINNET) {
    PythStructs.Price memory pythPrice = IPyth(lineaPyth).getPriceUnsafe(btcUsdTokenPriceFeed);
    emit log_named_uint("price", uint256(uint64(pythPrice.price)));
    emit log_named_uint("updated", pythPrice.publishTime);
    emit log_named_uint("ts", block.timestamp);

    uint256 price = oracle.price(wbtc);
    uint256 priceMpo = mpo.price(wbtc);
    assertApproxEqRel(price, priceMpo, 1e17);
  }

  function testNeonTokenPrice() public debuggingOnly fork(NEON_MAINNET) {
    PythStructs.Price memory pythPriceNeon = IPyth(neonPyth).getPriceUnsafe(neonUsdTokenPriceFeed);
    emit log_named_uint("price", uint256(uint64(pythPriceNeon.price)));
    emit log_named_uint("updated", pythPriceNeon.publishTime);
    emit log_named_uint("ts", block.timestamp);
    PythStructs.Price memory pythPrice = IPyth(neonPyth).getPriceUnsafe(btcUsdTokenPriceFeed);
    emit log_named_uint("price", uint256(uint64(pythPrice.price)));
    emit log_named_uint("updated", pythPrice.publishTime);
    emit log_named_uint("ts", block.timestamp);

    uint256 price = oracle.price(wbtc);
    uint256 priceMpo = mpo.price(wbtc);
    assertApproxEqRel(price, priceMpo, 1e16);
  }

  function testZkEvmTokenPrice() public fork(ZKEVM_MAINNET) {
    PythStructs.Price memory pythPrice = IPyth(zkevmPyth).getPriceUnsafe(btcUsdTokenPriceFeed);
    emit log_named_uint("price", uint256(uint64(pythPrice.price)));
    emit log_named_uint("updated", pythPrice.publishTime);
    emit log_named_uint("ts", block.timestamp);

    uint256 price = oracle.price(wbtc);
    uint256 priceMpo = mpo.price(wbtc);
    assertApproxEqRel(price, priceMpo, 1e16);
  }
}
