// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { SolidlyPriceOracle } from "../../../oracles/default/SolidlyPriceOracle.sol";
import { SolidlyLpTokenPriceOracle } from "../../../oracles/default/SolidlyLpTokenPriceOracle.sol";
import { IPair } from "../../../external/solidly/IPair.sol";
import { MasterPriceOracle } from "../../../oracles/MasterPriceOracle.sol";
import { BaseTest } from "../../config/BaseTest.t.sol";

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";

struct PriceExpected {
  uint256 price;
  uint256 percentErrorAllowed;
}

contract SolidlyPriceOracleTest is BaseTest {
  SolidlyPriceOracle oracle;
  MasterPriceOracle mpo;
  address wtoken;
  address stable;

  function afterForkSetUp() internal override {
    // Not using the address provider yet -- config just added
    // TODO: use ap when deployment is done

    stable = ap.getAddress("stableToken"); // USDC
    wtoken = ap.getAddress("wtoken"); // WETH
    mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));
    oracle = new SolidlyPriceOracle();

    vm.prank(mpo.admin());
    oracle.initialize(wtoken, asArray(stable));
  }

  // Ankr Price: $0.034632 (fetched from block explorer)
  // BNB Price at block 26678077: $337.67 (fetched from block explorer)
  function testBscCustomAsset() public forkAtBlock(BSC_MAINNET, 26678077) {
    address ankr = 0xf307910A4c7bbc79691fD374889b36d8531B08e3;
    address ankrBNB = 0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827;

    address[] memory underlyings = new address[](1);
    SolidlyPriceOracle.AssetConfig[] memory configs = new SolidlyPriceOracle.AssetConfig[](1);

    underlyings[0] = ankr;
    // ANKR/ankrBNB
    configs[0] = SolidlyPriceOracle.AssetConfig(0x7ef540f672Cd643B79D2488344944499F7518b1f, ankrBNB);

    vm.prank(oracle.owner());
    oracle._setSupportedBaseTokens(asArray(stable, ankrBNB));

    uint256[] memory prices = getPriceFeed(underlyings, configs);
    // Assert price in $ is equal
    assertApproxEqRel((prices[0] * 33667) / 100, 0.03463e18, 1e17); // 0.1 % error
  }

  function testBscAssets() public fork(BSC_MAINNET) {
    address busd = 0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56;
    address usdt = 0x55d398326f99059fF775485246999027B3197955;
    address hay = 0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5;
    address bnbx = 0x1bdd3Cf7F79cfB8EdbB955f20ad99211551BA275;
    address eth = 0x2170Ed0880ac9A755fd29B2688956BD959F933F8;

    address[] memory underlyings = new address[](4);
    SolidlyPriceOracle.AssetConfig[] memory configs = new SolidlyPriceOracle.AssetConfig[](4);

    underlyings[0] = hay;
    underlyings[1] = bnbx;
    underlyings[2] = eth;
    underlyings[3] = usdt;

    // HAY/BUSD
    configs[0] = SolidlyPriceOracle.AssetConfig(0x93B32a8dfE10e9196403dd111974E325219aec24, busd);
    // BNBx/WBNB
    configs[1] = SolidlyPriceOracle.AssetConfig(0x6c83E45fE3Be4A9c12BB28cB5BA4cD210455fb55, wtoken);
    // ETH/WBNB
    configs[2] = SolidlyPriceOracle.AssetConfig(0x1d168C5b5DEa1c6dA0E9FD9bf4B7607e4e9D8EeC, wtoken);
    // USDT/BUSD
    configs[3] = SolidlyPriceOracle.AssetConfig(0x6321B57b6fdc14924be480c54e93294617E672aB, busd);

    PriceExpected[] memory expPrices = new PriceExpected[](4);

    expPrices[0] = PriceExpected({ price: mpo.price(hay), percentErrorAllowed: 1e18 }); // 1%
    expPrices[1] = PriceExpected({ price: mpo.price(bnbx), percentErrorAllowed: 1e18 }); // 1%
    expPrices[2] = PriceExpected({ price: mpo.price(eth), percentErrorAllowed: 1e17 }); // 0.1%
    expPrices[3] = PriceExpected({ price: mpo.price(usdt), percentErrorAllowed: 1e17 }); // 0.1%

    emit log_named_uint("USDC PRICE", mpo.price(stable));
    uint256[] memory prices = getPriceFeed(underlyings, configs);
    for (uint256 i = 0; i < prices.length; i++) {
      assertApproxEqRel(prices[i], expPrices[i].price, expPrices[i].percentErrorAllowed, "!Price Error");
    }
  }

  function testArbitrumAssets() public fork(ARBITRUM_ONE) {
    address wbtc = 0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f;
    address dai = 0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1;
    address usdt = 0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9;

    address[] memory underlyings = new address[](3);
    SolidlyPriceOracle.AssetConfig[] memory configs = new SolidlyPriceOracle.AssetConfig[](3);

    underlyings[0] = wbtc;
    underlyings[1] = dai;
    underlyings[2] = usdt;

    // WBTC/WETH (8/18 decimals)
    configs[0] = SolidlyPriceOracle.AssetConfig(0xd9D611c6943585bc0e18E51034AF8fa28778F7Da, wtoken);
    // DAI/USDC (18/6)
    configs[1] = SolidlyPriceOracle.AssetConfig(0x07d7F291e731A41D3F0EA4F1AE5b6d920ffb3Fe0, stable);
    // USDT/USDC (6/6)
    configs[2] = SolidlyPriceOracle.AssetConfig(0xC9dF93497B1852552F2200701cE58C236cC0378C, stable);

    PriceExpected[] memory expPrices = new PriceExpected[](3);

    expPrices[0] = PriceExpected({ price: mpo.price(wbtc), percentErrorAllowed: 1e18 }); // 1%
    expPrices[1] = PriceExpected({ price: mpo.price(dai), percentErrorAllowed: 1e18 }); // 1%
    expPrices[2] = PriceExpected({ price: mpo.price(usdt), percentErrorAllowed: 1e17 }); // 0.1%

    emit log_named_uint("USDC PRICE", mpo.price(stable));
    uint256[] memory prices = getPriceFeed(underlyings, configs);
    for (uint256 i = 0; i < prices.length; i++) {
      assertApproxEqRel(prices[i], expPrices[i].price, expPrices[i].percentErrorAllowed, "!Price Error");
    }
  }

  function testPolygonAssets() public fork(POLYGON_MAINNET) {
    address usdr = 0xb5DFABd7fF7F83BAB83995E72A52B97ABb7bcf63;
    address usdc = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174;

    address[] memory underlyings = new address[](1);
    SolidlyPriceOracle.AssetConfig[] memory configs = new SolidlyPriceOracle.AssetConfig[](1);

    underlyings[0] = usdr;

    // USDR/USDC (9/6), usinf Pearl Exchange
    configs[0] = SolidlyPriceOracle.AssetConfig(0xf6A72Bd46F53Cd5103812ea1f4B5CF38099aB797, stable);

    PriceExpected[] memory expPrices = new PriceExpected[](4);

    expPrices[0] = PriceExpected({ price: mpo.price(usdc), percentErrorAllowed: 1e17 }); // 0.1%

    emit log_named_uint("USDC PRICE", mpo.price(stable));
    uint256[] memory prices = getPriceFeed(underlyings, configs);
    for (uint256 i = 0; i < prices.length; i++) {
      assertApproxEqRel(prices[i], expPrices[i].price, expPrices[i].percentErrorAllowed, "!Price Error");
    }
  }

  function getPriceFeed(address[] memory underlyings, SolidlyPriceOracle.AssetConfig[] memory configs)
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

  function testSetUnsupportedBaseToken() public fork(ARBITRUM_ONE) {
    address dai = 0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1;
    address usdt = 0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9;

    address[] memory underlyings = new address[](1);
    SolidlyPriceOracle.AssetConfig[] memory configs = new SolidlyPriceOracle.AssetConfig[](1);

    underlyings[0] = dai;

    // DAI/USDT
    configs[0] = SolidlyPriceOracle.AssetConfig(0x15b9D20bcaa4f65d9004D2BEBAc4058445FD5285, usdt);

    // revert if underlying is not supported
    vm.startPrank(oracle.owner());
    vm.expectRevert(bytes("Underlying token must be supported"));
    oracle.setPoolFeeds(underlyings, configs);

    // add it successfully when suported
    oracle._setSupportedBaseTokens(asArray(usdt, stable));
    oracle.setPoolFeeds(underlyings, configs);
    vm.stopPrank();

    // check prices
    vm.prank(address(mpo));
    uint256 price = oracle.price(dai);
    assertApproxEqRel(price, mpo.price(dai), 1e17, "!Price Error");
  }
}
