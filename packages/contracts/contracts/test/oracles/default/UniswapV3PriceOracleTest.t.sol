// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { UniswapV3PriceOracle } from "../../../oracles/default/UniswapV3PriceOracle.sol";
import { ChainlinkPriceOracleV2 } from "../../../oracles/default/ChainlinkPriceOracleV2.sol";
import { ConcentratedLiquidityBasePriceOracle } from "../../../oracles/default/ConcentratedLiquidityBasePriceOracle.sol";
import { IUniswapV3Pool } from "../../../external/uniswap/IUniswapV3Pool.sol";
import { BasePriceOracle } from "../../../oracles/BasePriceOracle.sol";
import { MasterPriceOracle } from "../../../oracles/MasterPriceOracle.sol";
import { BaseTest } from "../../config/BaseTest.t.sol";

contract UniswapV3PriceOracleTest is BaseTest {
  UniswapV3PriceOracle oracle;
  MasterPriceOracle mpo;
  address wtoken;
  address stable;

  function afterForkSetUp() internal override {
    // TODO: remove this after deployment
    if (block.chainid == ETHEREUM_MAINNET) {
      return;
    }
    stable = ap.getAddress("stableToken"); // USDC or arbitrum
    wtoken = ap.getAddress("wtoken"); // WETH
    mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));
    oracle = new UniswapV3PriceOracle();

    vm.prank(mpo.admin());
    oracle.initialize(wtoken, asArray(stable));
  }

  function testPolygonRetroAlmAssets() public fork(POLYGON_MAINNET) {
    address[] memory underlyings = new address[](1);
    ConcentratedLiquidityBasePriceOracle.AssetConfig[]
      memory configs = new ConcentratedLiquidityBasePriceOracle.AssetConfig[](1);

    underlyings[0] = 0x5D066D022EDE10eFa2717eD3D79f22F949F8C175; // CASH (18 decimals)

    // USDC-CASH
    configs[0] = ConcentratedLiquidityBasePriceOracle.AssetConfig(
      0x619259F699839dD1498FFC22297044462483bD27,
      10 minutes,
      stable
    );
    uint256[] memory prices = getPriceFeed(underlyings, configs);
    for (uint256 i = 0; i < prices.length; i++) {
      assertTrue(prices[i] > 0, "!Price Error");
    }
    uint256[] memory expPrices = new uint256[](7);
    expPrices[0] = mpo.price(stable);

    // CASH should be priced like USDC
    assertApproxEqRel(prices[0], expPrices[0], 1e15);

    bool[] memory cardinalityChecks = getCardinality(configs);
    for (uint256 i = 0; i < cardinalityChecks.length; i++) {
      assertEq(cardinalityChecks[i], true, "!Cardinality Error");
    }
  }

  function testPolygonAssets() public fork(POLYGON_MAINNET) {
    address[] memory underlyings = new address[](1);
    ConcentratedLiquidityBasePriceOracle.AssetConfig[]
      memory configs = new ConcentratedLiquidityBasePriceOracle.AssetConfig[](1);

    underlyings[0] = 0xE5417Af564e4bFDA1c483642db72007871397896; // GNS (18 decimals)

    // GNS-MATIC
    configs[0] = ConcentratedLiquidityBasePriceOracle.AssetConfig(
      0xEFa98Fdf168f372E5e9e9b910FcDfd65856f3986,
      10 minutes,
      wtoken
    );
    uint256[] memory prices = getPriceFeed(underlyings, configs);
    for (uint256 i = 0; i < prices.length; i++) {
      assertTrue(prices[i] > 0, "!Price Error");
    }

    bool[] memory cardinalityChecks = getCardinality(configs);
    for (uint256 i = 0; i < cardinalityChecks.length; i++) {
      assertEq(cardinalityChecks[i], true, "!Cardinality Error");
    }
  }

  function testArbitrumAssets() public fork(ARBITRUM_ONE) {
    address[] memory underlyings = new address[](1);
    ConcentratedLiquidityBasePriceOracle.AssetConfig[]
      memory configs = new ConcentratedLiquidityBasePriceOracle.AssetConfig[](1);

    underlyings[0] = 0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f; // WBTC (18 decimals)
    // WBTC-USDC
    configs[0] = ConcentratedLiquidityBasePriceOracle.AssetConfig(
      0xA62aD78825E3a55A77823F00Fe0050F567c1e4EE,
      10 minutes,
      stable
    );
    vm.prank(oracle.owner());
    oracle.setPoolFeeds(underlyings, configs);
    vm.roll(1);

    vm.prank(address(mpo));
    uint256 oraclePrice = oracle.price(underlyings[0]);
    uint256 mpoPrice = mpo.price(underlyings[0]);
    assertApproxEqRel(oraclePrice, mpoPrice, 1e16, "Oracle price != MPO price by > 1%");
  }

  function testForkedArbitrumAssets() public debuggingOnly forkAtBlock(ARBITRUM_ONE, 122287973) {
    address[] memory underlyings = new address[](7);
    ConcentratedLiquidityBasePriceOracle.AssetConfig[]
      memory configs = new ConcentratedLiquidityBasePriceOracle.AssetConfig[](7);

    underlyings[0] = 0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a; // GMX (18 decimals)
    underlyings[1] = 0x6C2C06790b3E3E3c38e12Ee22F8183b37a13EE55; // DPX (18 decimals)
    underlyings[2] = 0x539bdE0d7Dbd336b79148AA742883198BBF60342; // MAGIC (18 decimals)
    underlyings[3] = 0xD74f5255D557944cf7Dd0E45FF521520002D5748; // USDs (18 decimals)
    underlyings[4] = 0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9; // USDT (6 decimals)
    underlyings[5] = 0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a; // GMX (18 decimals)
    underlyings[6] = 0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f; // WBTC (8 decimals)

    // GMX-ETH
    configs[0] = ConcentratedLiquidityBasePriceOracle.AssetConfig(
      0x80A9ae39310abf666A87C743d6ebBD0E8C42158E,
      10 minutes,
      wtoken
    );
    // DPX-ETH
    configs[1] = ConcentratedLiquidityBasePriceOracle.AssetConfig(
      0xb52781C275431bD48d290a4318e338FE0dF89eb9,
      10 minutes,
      wtoken
    );
    // MAGIC-ETH
    configs[2] = ConcentratedLiquidityBasePriceOracle.AssetConfig(
      0x7e7FB3CCEcA5F2ac952eDF221fd2a9f62E411980,
      10 minutes,
      wtoken
    );
    // USDs-USDC
    configs[3] = ConcentratedLiquidityBasePriceOracle.AssetConfig(
      0x50450351517117Cb58189edBa6bbaD6284D45902,
      10 minutes,
      stable
    );
    // USDT-USDC
    configs[4] = ConcentratedLiquidityBasePriceOracle.AssetConfig(
      0x13398E27a21Be1218b6900cbEDF677571df42A48,
      10 minutes,
      stable
    );
    // GMX-USDC
    configs[5] = ConcentratedLiquidityBasePriceOracle.AssetConfig(
      0xBed2589feFAE17d62A8a4FdAC92fa5895cAe90d2,
      10 minutes,
      stable
    );
    // WBTC-USDC
    configs[6] = ConcentratedLiquidityBasePriceOracle.AssetConfig(
      0xA62aD78825E3a55A77823F00Fe0050F567c1e4EE,
      10 minutes,
      stable
    );

    uint256[] memory expPrices = new uint256[](7);
    expPrices[0] = 22458983666679741; // (22458983666679741 / 1e18) * 1807 = $75.4 (17/08/2023)
    expPrices[1] = 39909577522344847; //  (39909577522344847 / 1e18) * 1807 = $72 (17/08/2023)
    expPrices[2] = 373271191958027; //  (373271191958027 / 1e18) * 1807 = $0.67 (17/08/2023
    expPrices[3] = 557704868599802; // (557704868599802 / 1e18) * 1807 = $1.005 (17/08/2023
    expPrices[4] = 559771099154822; // (559771099154822 / 1e18) * 1807 = $1.01 (17/08/2023
    expPrices[5] = 22458983666679741; // (22458983666679741 / 1e18) * 1807 = $40,5 (17/08/2023)
    expPrices[6] = 15955521590135476492; //  (15955521590135476492 / 1e18) * 1807 = $28.864,6 (17/08/2023)

    emit log_named_uint("USDC PRICE", mpo.price(stable));
    uint256[] memory prices = getPriceFeed(underlyings, configs);
    for (uint256 i = 0; i < prices.length; i++) {
      assertEq(prices[i], expPrices[i], "!Price Error");
    }

    bool[] memory cardinalityChecks = getCardinality(configs);
    for (uint256 i = 0; i < cardinalityChecks.length; i++) {
      assertEq(cardinalityChecks[i], true, "!Cardinality Error");
    }
  }

  function testEthereumAssets() public fork(ETHEREUM_MAINNET) {
    // TODO: Remove these after mainnet deployment
    // Initialise MPO
    stable = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    wtoken = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    setUpBaseOracles();

    // Initialise Uniswap Oracle
    oracle = new UniswapV3PriceOracle();
    vm.prank(mpo.admin());
    oracle.initialize(wtoken, asArray(stable));

    address[] memory underlyings = new address[](2);
    ConcentratedLiquidityBasePriceOracle.AssetConfig[]
      memory configs = new ConcentratedLiquidityBasePriceOracle.AssetConfig[](2);

    underlyings[0] = 0x68037790A0229e9Ce6EaA8A99ea92964106C4703; // PAR (18 decimals)
    underlyings[1] = 0x0ab87046fBb341D058F17CBC4c1133F25a20a52f; // gOHM decimals)
    // PAR-USDC
    configs[0] = ConcentratedLiquidityBasePriceOracle.AssetConfig(
      0xD7Dcb0eb6AaB643b85ba74cf9997c840fE32e695,
      10 minutes,
      stable
    );
    // GOHM-USDC
    configs[1] = ConcentratedLiquidityBasePriceOracle.AssetConfig(
      0xcF7e21b96a7DAe8e1663b5A266FD812CBE973E70,
      10 minutes,
      stable
    );
    uint256[] memory prices = getPriceFeed(underlyings, configs);
    uint256 mpoPrice = mpo.price(underlyings[0]);
    // Compare univ3 (PAR/USDC) vs Chainlink prices (EUR/USD)
    assertApproxEqRel(prices[0], mpoPrice, 1e16, "Oracle price != MPO price by > 1%");
    assertGt(prices[1], mpo.price(wtoken), "gOHM price is > eth price");

    bool[] memory cardinalityChecks = getCardinality(configs);
    for (uint256 i = 0; i < cardinalityChecks.length; i++) {
      assertEq(cardinalityChecks[i], true, "!Cardinality Error");
    }
  }

  function testForkedEthereumAssets() public forkAtBlock(ETHEREUM_MAINNET, 17065696) {
    // TODO: Remove these after mainnet deployment
    // Initialise MPO
    stable = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    wtoken = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    setUpBaseOracles();

    // Initialise Uniswap Oracle
    oracle = new UniswapV3PriceOracle();
    vm.prank(mpo.admin());
    oracle.initialize(wtoken, asArray(stable));

    address[] memory underlyings = new address[](1);
    ConcentratedLiquidityBasePriceOracle.AssetConfig[]
      memory configs = new ConcentratedLiquidityBasePriceOracle.AssetConfig[](1);

    underlyings[0] = 0x0ab87046fBb341D058F17CBC4c1133F25a20a52f; // gOHM decimals)
    // GOHM-USDC
    configs[0] = ConcentratedLiquidityBasePriceOracle.AssetConfig(
      0xcF7e21b96a7DAe8e1663b5A266FD812CBE973E70,
      10 minutes,
      wtoken
    );
    uint256[] memory prices = getPriceFeed(underlyings, configs);

    // 17/04/2024
    // - ETH Price = 2096  USD
    // - gOHM Price = 2,745.22 USD
    // - gOHM Price = 1.30 ETH
    assertEq(prices[0], 1296264965685839645, "!price");
  }

  function setUpBaseOracles() public {
    // TODO: Remove these after mainnet deployment
    if (block.chainid == ETHEREUM_MAINNET) {
      setUpMpoAndAddresses();
      BasePriceOracle[] memory oracles = new BasePriceOracle[](2);
      ChainlinkPriceOracleV2 chainlinkOracle = new ChainlinkPriceOracleV2();
      chainlinkOracle.initialize(stable, 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419);

      vm.prank(chainlinkOracle.owner());
      chainlinkOracle.setPriceFeeds(
        asArray(stable),
        asArray(0x986b5E1e1755e3C2440e960477f25201B0a8bbD4),
        ChainlinkPriceOracleV2.FeedBaseCurrency.ETH
      );
      chainlinkOracle.setPriceFeeds(
        asArray(0x68037790A0229e9Ce6EaA8A99ea92964106C4703), // PAR
        asArray(0xb49f677943BC038e9857d61E7d053CaA2C1734C1), // EUR/USD price feed
        ChainlinkPriceOracleV2.FeedBaseCurrency.USD
      );
      oracles[0] = chainlinkOracle;
      oracles[1] = chainlinkOracle;

      vm.prank(mpo.admin());
      mpo.add(asArray(stable, 0x68037790A0229e9Ce6EaA8A99ea92964106C4703), oracles);
    }
  }

  function setUpMpoAndAddresses() public {
    address[] memory assets = new address[](0);
    BasePriceOracle[] memory oracles = new BasePriceOracle[](0);
    mpo = new MasterPriceOracle();
    mpo.initialize(assets, oracles, BasePriceOracle(address(0)), address(this), true, address(wtoken));
  }

  function getPriceFeed(address[] memory underlyings, UniswapV3PriceOracle.AssetConfig[] memory configs)
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

  function getCardinality(UniswapV3PriceOracle.AssetConfig[] memory configs) internal view returns (bool[] memory) {
    bool[] memory checks = new bool[](configs.length);
    for (uint256 i = 0; i < configs.length; i += 1) {
      (, , , , uint16 observationCardinalityNext, , ) = IUniswapV3Pool(configs[i].poolAddress).slot0();
      checks[i] = observationCardinalityNext >= 10;
    }

    return checks;
  }
}
