// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { KyberSwapPriceOracle } from "../../../oracles/default/KyberSwapPriceOracle.sol";
import { ConcentratedLiquidityBasePriceOracle } from "../../../oracles/default/ConcentratedLiquidityBasePriceOracle.sol";
import { IPool } from "../../../external/kyber/IPool.sol";
import { IPoolOracle } from "../../../external/kyber/IPoolOracle.sol";
import { MasterPriceOracle } from "../../../oracles/MasterPriceOracle.sol";
import { BaseTest } from "../../config/BaseTest.t.sol";

import { BasePriceOracle } from "../../../oracles/BasePriceOracle.sol";
import { ERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";
import { ConcentratedLiquidityBasePriceOracle } from "../../../oracles/default/ConcentratedLiquidityBasePriceOracle.sol";

import "../../../external/uniswap/TickMath.sol";
import "../../../external/uniswap/FullMath.sol";

contract KyberSwapPriceOracleTest is BaseTest {
  KyberSwapPriceOracle oracle;
  MasterPriceOracle mpo;
  address wtoken;
  address wbtc;
  address stable;

  function afterForkSetUp() internal override {
    stable = 0x176211869cA2b568f2A7D4EE941E073a821EE1ff; // ap.getAddress("stableToken");

    wtoken = ap.getAddress("wtoken"); // WETH
    wbtc = ap.getAddress("wBTCToken"); // WBTC
    mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));
    oracle = new KyberSwapPriceOracle();

    vm.prank(mpo.admin());
    oracle.initialize(wtoken, asArray(stable));
  }

  function getPriceX96FromSqrtPriceX96(
    address token0,
    address priceToken,
    uint160 sqrtPriceX96
  ) public pure returns (uint256 price_) {
    price_ = FullMath.mulDiv(sqrtPriceX96, sqrtPriceX96, uint256(2**(96 * 2)) / 1e18);
    if (token0 != priceToken) price_ = 1e36 / price_;
  }

  function testLineaAssets() public debuggingOnly forkAtBlock(LINEA_MAINNET, 173370) {
    address axlUsdc = 0xEB466342C4d449BC9f53A865D5Cb90586f405215;
    address dai = 0x4AF15ec2A0BD43Db75dd04E62FAA3B8EF36b00d5;

    address[] memory underlyings = new address[](3);
    ConcentratedLiquidityBasePriceOracle.AssetConfig[]
      memory configs = new ConcentratedLiquidityBasePriceOracle.AssetConfig[](3);

    underlyings[0] = stable; // (6 decimals)
    underlyings[1] = axlUsdc; // (6 decimals)
    underlyings[2] = dai; // (6 decimals)

    // 6 / 18
    IPool usdcWethPool = IPool(0x4b21d64Cf83e56860F1739452817E4c0fa1D399D);
    // 6 / 6
    IPool axlUsdcUsdcPool = IPool(0xFbEdC4eBEB2951fF96A636c934FCE35117847c9d);
    // 18 / 6
    IPool daiUsdcPool = IPool(0xB6E91bA27bB6C3b2ADC31884459D3653F9293e33);

    // WETH-USDC
    configs[0] = ConcentratedLiquidityBasePriceOracle.AssetConfig(address(usdcWethPool), 1200, wtoken);
    // USDC-axlUSDC
    configs[1] = ConcentratedLiquidityBasePriceOracle.AssetConfig(address(axlUsdcUsdcPool), 1200, stable);
    // DAI-USDC
    configs[2] = ConcentratedLiquidityBasePriceOracle.AssetConfig(address(daiUsdcPool), 1200, stable);

    uint256 priceUsdc = mpo.price(stable);
    uint256[] memory expPrices = new uint256[](3);

    expPrices[0] = priceUsdc;
    expPrices[1] = priceUsdc;
    expPrices[2] = priceUsdc;

    uint256[] memory prices = getPriceFeed(underlyings, configs);

    assertApproxEqRel(prices[0], expPrices[0], 1e17, "!Price Error");
    assertApproxEqRel(prices[1], expPrices[1], 1e17, "!Price Error");
    assertApproxEqRel(prices[2], expPrices[2], 1e17, "!Price Error");
  }

  function getPriceFeed(address[] memory underlyings, ConcentratedLiquidityBasePriceOracle.AssetConfig[] memory configs)
    internal
    returns (uint256[] memory price)
  {
    vm.prank(oracle.owner());
    oracle.setPoolFeeds(underlyings, configs);
    vm.roll(1);

    price = new uint256[](underlyings.length);
    for (uint256 i = 0; i < underlyings.length; i++) {
      vm.prank(address(mpo));
      price[i] = oracle.price(underlyings[i]);
    }
    return price;
  }
}
