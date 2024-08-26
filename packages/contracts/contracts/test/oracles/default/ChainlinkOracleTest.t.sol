// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { ChainlinkPriceOracleV2 } from "../../../oracles/default/ChainlinkPriceOracleV2.sol";
import { ICErc20 } from "../../../compound/CTokenInterfaces.sol";

import { BaseTest } from "../../config/BaseTest.t.sol";

contract ChainlinkOraclesTest is BaseTest {
  ChainlinkPriceOracleV2 oracle;

  address usdcPolygon = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174;
  address usdtPolygon = 0xc2132D05D31c914a87C6611C10748AEb04B58e8F;
  address usdcFeedPolygon = 0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7;
  address usdtFeedPolygon = 0x0A6513e40db6EB1b165753AD52E80663aeA50545;

  address jBRLBsc = 0x316622977073BBC3dF32E7d2A9B3c77596a0a603;
  address jBRLFeedBsc = 0x5cb1Cb3eA5FB46de1CE1D0F3BaDB3212e8d8eF48;
  address usdcBsc = 0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d;
  address usdtBsc = 0x55d398326f99059fF775485246999027B3197955;
  address usdtFeedBsc = 0xB97Ad0E74fa7d920791E90258A6E2085088b4320;
  address usdcFeedBsc = 0x51597f405303C4377E36123cBc172b13269EA163;
  ICErc20 usdcMarketBsc = ICErc20(0x8D5bE2768c335e88b71E4e913189AEE7104f01B4);
  ICErc20 usdtMarketBsc = ICErc20(0x1F73754c135d5B9fDE674806f43AeDfA2c7eaDb5);

  function afterForkSetUp() internal override {
    oracle = ChainlinkPriceOracleV2(ap.getAddress("ChainlinkPriceOracleV2"));
  }

  function setUpOracleFeed(address testedTokenAddress, address aggregatorAddress) internal {
    address[] memory underlyings = new address[](1);
    underlyings[0] = testedTokenAddress;
    address[] memory aggregators = new address[](1);
    aggregators[0] = aggregatorAddress;

    vm.prank(oracle.owner());
    oracle.setPriceFeeds(underlyings, aggregators, ChainlinkPriceOracleV2.FeedBaseCurrency.USD);
  }

  function testJBRLPrice() public fork(BSC_MAINNET) {
    setUpOracleFeed(jBRLBsc, jBRLFeedBsc);
    assert(oracle.price(jBRLBsc) > 0);
  }

  function testBSCChainlinkUSDCPrice() public fork(BSC_MAINNET) {
    setUpOracleFeed(usdcBsc, usdcFeedBsc);
    uint256 price = oracle.price(usdcBsc);
    uint256 underlyingPrice = oracle.getUnderlyingPrice(usdcMarketBsc);
    assertEq(price, underlyingPrice);
  }

  function testBSCChainlinkUSDTPrice() public fork(BSC_MAINNET) {
    setUpOracleFeed(usdtBsc, usdtFeedBsc);
    uint256 price = oracle.price(usdtBsc);
    uint256 underlyingPrice = oracle.getUnderlyingPrice(usdtMarketBsc);
    assertEq(price, underlyingPrice);
  }

  function testUsdcUsdtDeviationBsc() public fork(BSC_MAINNET) {
    setUpOracleFeed(usdtBsc, usdtFeedBsc);
    setUpOracleFeed(usdcBsc, usdcFeedBsc);

    uint256 usdtPrice = oracle.getUnderlyingPrice(usdtMarketBsc);
    uint256 usdcPrice = oracle.getUnderlyingPrice(usdcMarketBsc);

    assertApproxEqAbs(usdtPrice, usdcPrice, 1e16, "usd prices differ too much");
  }

  function testUsdcUsdtDeviationPolygon() public fork(POLYGON_MAINNET) {
    setUpOracleFeed(usdtPolygon, usdtFeedPolygon);
    setUpOracleFeed(usdcPolygon, usdcFeedPolygon);

    uint256 usdtPrice = oracle.price(usdtPolygon);
    uint256 usdcPrice = oracle.price(usdcPolygon);

    assertApproxEqAbs(usdtPrice, usdcPrice, 1e16, "usd prices differ too much");
  }
}
