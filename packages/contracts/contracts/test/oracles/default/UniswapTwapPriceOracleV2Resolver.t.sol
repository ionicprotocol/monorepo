// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { MasterPriceOracle } from "../../../oracles/MasterPriceOracle.sol";
import { UniswapTwapPriceOracleV2Root } from "../../../oracles/default/UniswapTwapPriceOracleV2Root.sol";
import { IUniswapV2Factory } from "../../../external/uniswap/IUniswapV2Factory.sol";
import { UniswapTwapPriceOracleV2Resolver } from "../../../oracles/default/UniswapTwapPriceOracleV2Resolver.sol";
import { IUniswapV2Pair } from "../../../external/uniswap/IUniswapV2Pair.sol";

import { BaseTest } from "../../config/BaseTest.t.sol";

contract UniswapTwapOracleV2ResolverTest is BaseTest {
  UniswapTwapPriceOracleV2Root twapPriceOracleRoot;
  UniswapTwapPriceOracleV2Resolver resolver;
  IUniswapV2Factory uniswapV2Factory;
  MasterPriceOracle mpo;

  struct Observation {
    uint32 timestamp;
    uint256 price0Cumulative;
    uint256 price1Cumulative;
  }

  function afterForkSetUp() internal override {
    uniswapV2Factory = IUniswapV2Factory(ap.getAddress("IUniswapV2Factory"));
    mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));
  }

  function getTokenTwapPrice(address tokenAddress) internal view returns (uint256) {
    // return the price denominated in W_NATIVE
    return mpo.price(tokenAddress);
  }
}
