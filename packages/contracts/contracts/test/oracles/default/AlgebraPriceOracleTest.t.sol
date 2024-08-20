// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { AlgebraPriceOracle } from "../../../oracles/default/AlgebraPriceOracle.sol";
import { ConcentratedLiquidityBasePriceOracle } from "../../../oracles/default/ConcentratedLiquidityBasePriceOracle.sol";
import { IAlgebraPool } from "../../../external/algebra/IAlgebraPool.sol";
import { MasterPriceOracle } from "../../../oracles/MasterPriceOracle.sol";
import { BaseTest } from "../../config/BaseTest.t.sol";

contract AlgebraPriceOracleTest is BaseTest {
  AlgebraPriceOracle oracle;
  MasterPriceOracle mpo;
  address wtoken;
  address wbtc;
  address stable;

  function afterForkSetUp() internal override {
    stable = ap.getAddress("stableToken");
    wtoken = ap.getAddress("wtoken"); // WETH
    wbtc = ap.getAddress("wBTCToken"); // WBTC
    mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));
    oracle = new AlgebraPriceOracle();

    vm.prank(mpo.admin());
    oracle.initialize(wtoken, asArray(stable));
  }

  function testBscAssets() public forkAtBlock(BSC_MAINNET, 27513712) {
    address thena = 0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11; // THE (18 decimals)
    address usdt = 0x55d398326f99059fF775485246999027B3197955; // USDT (18 decimals)

    address[] memory underlyings = new address[](2);
    ConcentratedLiquidityBasePriceOracle.AssetConfig[]
      memory configs = new ConcentratedLiquidityBasePriceOracle.AssetConfig[](2);

    underlyings[0] = thena;
    underlyings[1] = usdt;

    // THE-WBNB
    configs[0] = ConcentratedLiquidityBasePriceOracle.AssetConfig(
      0x51Bd5e6d3da9064D59BcaA5A76776560aB42cEb8,
      10 minutes,
      wtoken
    );
    // USDT-USDC
    configs[1] = ConcentratedLiquidityBasePriceOracle.AssetConfig(
      0x1b9a1120a17617D8eC4dC80B921A9A1C50Caef7d,
      10 minutes,
      stable
    );

    uint256[] memory expPrices = new uint256[](2);
    expPrices[0] = 1279780177402873; // == 0,001279 BNB -> $0,418 / $326 = 0,0012822   (20/04/2023)
    expPrices[1] = mpo.price(usdt);

    uint256[] memory prices = getPriceFeed(underlyings, configs);

    assertEq(prices[0], expPrices[0], "!Price Error");
    assertApproxEqRel(prices[1], expPrices[1], 1e17, "!Price Error");
  }

  function testPolygonAssets() public forkAtBlock(POLYGON_MAINNET, 46013460) {
    address maticX = 0xfa68FB4628DFF1028CFEc22b4162FCcd0d45efb6;
    address dai = 0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063;
    address[] memory underlyings = new address[](3);
    ConcentratedLiquidityBasePriceOracle.AssetConfig[]
      memory configs = new ConcentratedLiquidityBasePriceOracle.AssetConfig[](3);

    // 18 / 18
    underlyings[0] = maticX; // MaticX (18 decimals)
    // 8 / 6
    underlyings[1] = wbtc; // WBTC (8 decimals)
    // 18 / 6
    underlyings[2] = dai; // DAI (18 decimals)

    // MaticX-Wmatic
    configs[0] = ConcentratedLiquidityBasePriceOracle.AssetConfig(
      0x05BFE97Bf794a4DB69d3059091F064eA0a5E538E,
      10 minutes,
      wtoken
    );
    // WBTC-USDC
    configs[1] = ConcentratedLiquidityBasePriceOracle.AssetConfig(
      0xA5CD8351Cbf30B531C7b11B0D9d3Ff38eA2E280f,
      10 minutes,
      stable
    );
    // DAI-USDC
    configs[2] = ConcentratedLiquidityBasePriceOracle.AssetConfig(
      0xe7E0eB9F6bCcCfe847fDf62a3628319a092F11a2,
      10 minutes,
      stable
    );

    uint256[] memory expPrices = new uint256[](3);
    expPrices[0] = 1072289959017680334; //  0,72$ / 0,67$ =  1,07 MATIC   (07/07/2023)
    expPrices[1] = mpo.price(wbtc);
    expPrices[2] = mpo.price(dai);

    uint256[] memory prices = getPriceFeed(underlyings, configs);

    assertEq(prices[0], expPrices[0], "!Price Error");
    assertApproxEqRel(prices[1], expPrices[1], 1e17, "!Price Error");
    assertApproxEqRel(prices[2], expPrices[2], 1e17, "!Price Error");
  }

  function testZkEvmAssets() public forkAtBlock(ZKEVM_MAINNET, 4167547) {
    address usdt = 0x1E4a5963aBFD975d8c9021ce480b42188849D41d; // 6 decimals
    address wmatic = 0xa2036f0538221a77A3937F1379699f44945018d0;

    address[] memory underlyings = new address[](3);
    ConcentratedLiquidityBasePriceOracle.AssetConfig[]
      memory configs = new ConcentratedLiquidityBasePriceOracle.AssetConfig[](3);

    underlyings[0] = wmatic; // WMATIC (18 decimals)
    underlyings[1] = wbtc; // WBTC (8 decimals)
    underlyings[2] = usdt; // WBTC (6 decimals)

    // WMATIC-WETH
    configs[0] = ConcentratedLiquidityBasePriceOracle.AssetConfig(
      0xB73AbFb5a2C89f4038baA476Ff3A7942A021c196,
      10 minutes,
      wtoken
    );
    // WBTC-WETH
    configs[1] = ConcentratedLiquidityBasePriceOracle.AssetConfig(
      0xFC4A3A7dc6b62bd2EA595b106392f5E006083b83,
      10 minutes,
      wtoken
    );
    // USDT-USDC
    configs[2] = ConcentratedLiquidityBasePriceOracle.AssetConfig(
      0x9591b8A30c3a52256ea93E98dA49EE43Afa136A8,
      10 minutes,
      stable
    );

    uint256[] memory expPrices = new uint256[](3);
    expPrices[0] = 366000000000000; //  $0.670691 / 1833$ =  0,000366   (07/07x/2023)
    expPrices[1] = 15849057118531331165; // $29,016.86 / 1833$ = 15,85  (07/07/2023)
    expPrices[2] = 545553737043099; // $1 / 1833$ = 0,000545$           (07/07/2023)

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

  function testSetUnsupportedBaseToken() public fork(POLYGON_MAINNET) {
    address usdt = 0xc2132D05D31c914a87C6611C10748AEb04B58e8F;
    address ixt = 0xE06Bd4F5aAc8D0aA337D13eC88dB6defC6eAEefE;

    address[] memory underlyings = new address[](1);
    ConcentratedLiquidityBasePriceOracle.AssetConfig[]
      memory configs = new ConcentratedLiquidityBasePriceOracle.AssetConfig[](1);

    underlyings[0] = ixt;

    // USDT/IXT
    configs[0] = ConcentratedLiquidityBasePriceOracle.AssetConfig(
      0xD6e486c197606559946384AE2624367d750A160f,
      10 minutes,
      usdt
    );
    // revert if underlying is not supported
    vm.startPrank(oracle.owner());
    vm.expectRevert(bytes("Base token must be supported"));
    oracle.setPoolFeeds(underlyings, configs);

    // add it successfully when suported
    oracle._setSupportedBaseTokens(asArray(usdt, stable));
    oracle.setPoolFeeds(underlyings, configs);
    vm.stopPrank();

    // check prices
    vm.prank(address(mpo));
    uint256 price = oracle.price(ixt);
    assertTrue(price > 0, "!Price Error");
  }
}
