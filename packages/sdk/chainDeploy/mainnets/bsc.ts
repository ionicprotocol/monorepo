import { ChainDeployConfig, ChainlinkFeedBaseCurrency, deployChainlinkOracle, deployUniswapOracle } from "../helpers";
import { ethers } from "ethers";
import { Asset, ChainDeployFnParams, ChainlinkAsset, CurvePoolConfig } from "../helpers/types";
import { deployCurveLpOracle } from "../oracles/curveLp";
import { deployUniswapLpOracle } from "../oracles/uniswapLp";
import { deployERC4626Plugin, deployFlywheelWithDynamicRewards } from "../helpers/erc4626Plugins";
import { AddressesProvider } from "../../lib/contracts/typechain/AddressesProvider";

export const assets: Asset[] = [
  {
    symbol: "WBNB",
    underlying: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    name: "Wrapped Binance Network Token",
    decimals: 18,
  },
  {
    symbol: "BUSD",
    underlying: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    name: "Binance USD",
    decimals: 18,
  },
  {
    symbol: "BTCB",
    underlying: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    name: "Binance BTC",
    decimals: 18,
  },
  {
    symbol: "DAI",
    underlying: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    name: "Binance DAI",
    decimals: 18,
  },
  {
    symbol: "ETH",
    underlying: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    name: "Binance ETH",
    decimals: 18,
  },
  // STONX
  {
    symbol: "TSLA",
    underlying: "0xF215A127A196e3988C09d052e16BcFD365Cd7AA3",
    name: "Wrapped Mirror TSLA Token",
    decimals: 18,
  },
  {
    symbol: "GOOGL",
    underlying: "0x62D71B23bF15218C7d2D7E48DBbD9e9c650B173f",
    name: "Wrapped Mirror GOOGL Token",
    decimals: 18,
  },
  {
    symbol: "NFLX",
    underlying: "0xa04F060077D90Fe2647B61e4dA4aD1F97d6649dc",
    name: "Wrapped Mirror NFLX Token",
    decimals: 18,
  },
  {
    symbol: "AMZN",
    underlying: "0x3947B992DC0147D2D89dF0392213781b04B25075",
    name: "Wrapped Mirror AMZN Token",
    decimals: 18,
  },
  // CZ
  {
    symbol: "BETH",
    underlying: "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B",
    name: "Binance Beacon ETH",
    decimals: 18,
  },
  {
    symbol: "CAKE",
    underlying: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    name: "PancakeSwap Token",
    decimals: 18,
  },
  //
  {
    symbol: "AUTO",
    underlying: "0xa184088a740c695E156F91f5cC086a06bb78b827",
    name: "AUTOv2",
    decimals: 18,
  },
  {
    symbol: "BIFI",
    underlying: "0xCa3F508B8e4Dd382eE878A314789373D80A5190A",
    name: "beefy.finance",
    decimals: 18,
  },
  {
    symbol: "ALPACA",
    underlying: "0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F",
    name: "AlpacaToken",
    decimals: 18,
  },
  // stables
  {
    symbol: "USDC",
    underlying: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    name: "Binance-Peg USD Coin",
    decimals: 18,
  },
  {
    symbol: "USDT",
    underlying: "0x55d398326f99059fF775485246999027B3197955",
    name: "Binance-Peg BSC-USD",
    decimals: 18,
  },
  {
    symbol: "UST",
    underlying: "0x23396cF899Ca06c4472205fC903bDB4de249D6fC",
    name: "Wrapped UST Token",
    decimals: 18,
  },
  // Ellipsis
  {
    symbol: "3EPS",
    underlying: "0xaF4dE8E872131AE328Ce21D909C74705d3Aaf452",
    name: "Ellipsis.finance BUSD/USDC/USDT",
    decimals: 18,
  },
  {
    symbol: "dai3EPS",
    underlying: "0x0BC3a8239B0a63E945Ea1bd6722Ba747b9557e56",
    name: "Ellipsis.finance DAI/3EPS",
    decimals: 18,
  },
  {
    symbol: "ust3EPS",
    underlying: "0x151F1611b2E304DEd36661f65506f9D7D172beba",
    name: "Ellipsis.finance UST/3EPS",
    decimals: 18,
  },
  // Bomb
  {
    symbol: "BOMB",
    underlying: "0x522348779DCb2911539e76A1042aA922F9C47Ee3",
    name: "BOMB",
    decimals: 18,
  },
  // Jarvis
  {
    symbol: "jBRL",
    underlying: "0x316622977073BBC3dF32E7d2A9B3c77596a0a603",
    name: "Jarvis Synthetic Brazilian Real",
    decimals: 18,
  },
];

export const deployConfig: ChainDeployConfig = {
  wtoken: assets.find((a) => a.symbol === "WBNB")!.underlying,
  nativeTokenUsdChainlinkFeed: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE",
  nativeTokenName: "Binance Network Token",
  nativeTokenSymbol: "BNB",
  stableToken: assets.find((a) => a.symbol === "BUSD")!.underlying,
  wBTCToken: assets.find((a) => a.symbol === "BTCB")!.underlying,
  blocksPerYear: 20 * 24 * 365 * 60,
  uniswap: {
    hardcoded: [],
    uniswapData: [{ lpDisplayName: "PancakeSwap", lpName: "Pancake LPs", lpSymbol: "Cake-LP" }],
    pairInitHashCode: ethers.utils.hexlify("0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5"),
    uniswapV2RouterAddress: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    uniswapV2FactoryAddress: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
    uniswapOracleInitialDeployTokens: [
      {
        token: "0x522348779DCb2911539e76A1042aA922F9C47Ee3", // BOMB
        baseToken: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", // BTCB
      },
    ],
    uniswapOracleLpTokens: [
      "0x84392649eb0bC1c1532F2180E58Bae4E1dAbd8D6", // BOMB-BTC PCS LP
      "0xc7c3cCCE4FA25700fD5574DA7E200ae28BBd36A3", // WBNB-DAI PCS LP
      "0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16", // WBNB-BUSD PCS LP
    ],
  },
  plugins: [
    {
      // 0x
      strategy: "BeefyERC4626",
      name: "BOMBBTCLP",
      underlying: "0x84392649eb0bC1c1532F2180E58Bae4E1dAbd8D6", // BOMB-BTC PCS LP
      otherParams: ["0x94e85b8e050f3f281cb9597cc0144f1f7af1fe9b"], // Beefy Vault Address
    },
    {
      // 0x
      strategy: "BombERC4626",
      underlying: "0x522348779DCb2911539e76A1042aA922F9C47Ee3", // BOMB
      otherParams: ["0xAf16cB45B8149DA403AF41C63AbFEBFbcd16264b"], // xBOMB
      name: "BOMBxBOMB",
    },
    {
      // 0x
      strategy: "AutofarmERC4626",
      underlying: "0xa184088a740c695E156F91f5cC086a06bb78b827", // AUTO
      otherParams: ["0", "0xa184088a740c695E156F91f5cC086a06bb78b827", "0x0895196562C7868C5Be92459FaE7f877ED450452"], // poolId, AUTO, AutofarmV2 (Vault Handler)
      flywheelIndices: [2],
      name: "AUTO",
    },
    {
      // 0x
      strategy: "DotDotLpERC4626",
      underlying: "0xaF4dE8E872131AE328Ce21D909C74705d3Aaf452", // 3EPS
      otherParams: ["0x8189F0afdBf8fE6a9e13c69bA35528ac6abeB1af"], // lpDepositor
      flywheelIndices: [0, 1],
      name: "3EPS",
    },
    {
      // 0x
      strategy: "DotDotLpERC4626",
      underlying: "0x0BC3a8239B0a63E945Ea1bd6722Ba747b9557e56", // dai3EPS
      otherParams: ["0x8189F0afdBf8fE6a9e13c69bA35528ac6abeB1af"], // lpDepositor
      flywheelIndices: [0, 1],
      name: "dai3EPS",
    },
    {
      // 0x
      strategy: "DotDotLpERC4626",
      underlying: "0x151F1611b2E304DEd36661f65506f9D7D172beba", // ust3EPS
      otherParams: ["0x8189F0afdBf8fE6a9e13c69bA35528ac6abeB1af"], // lpDepositor
      flywheelIndices: [0, 1],
      name: "ust3EPS",
    },
    // All of these vaults are depricated
    /*{
      // 0x
      strategy: "AutofarmERC4626",
      underlying: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
      otherParams: [ "1","0xa184088a740c695E156F91f5cC086a06bb78b827", "0x0895196562C7868C5Be92459FaE7f877ED450452"], // poolId, AUTO, AutofarmV2 (Vault Handler)
      flywheelIndices: [2]
    },
    {
      // 0x
      strategy: "AutofarmERC4626",
      underlying: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", // BUSD
      otherParams: [ "2","0xa184088a740c695E156F91f5cC086a06bb78b827", "0x0895196562C7868C5Be92459FaE7f877ED450452"], // poolId, AUTO, AutofarmV2 (Vault Handler)
      flywheelIndices: [2]
    },
    {
      // 0x
      strategy: "AutofarmERC4626",
      underlying: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", // BTCB
      otherParams: [ "3","0xa184088a740c695E156F91f5cC086a06bb78b827", "0x0895196562C7868C5Be92459FaE7f877ED450452"], // poolId, AUTO, AutofarmV2 (Vault Handler)
     flywheelIndices: [2]
    },
    {
      // 0x
      strategy: "AutofarmERC4626",
      underlying: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", // BETH
      otherParams: [ "4","0xa184088a740c695E156F91f5cC086a06bb78b827", "0x0895196562C7868C5Be92459FaE7f877ED450452"], // poolId, AUTO, AutofarmV2 (Vault Handler)
      flywheelIndices: [2]
    }, */
    {
      // 0x
      strategy: "AlpacaERC4626",
      underlying: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
      otherParams: ["0xd7D069493685A581d27824Fc46EdA46B7EfC0063"], // ibWBNB
      name: "WBNB",
    },
    {
      // 0x
      strategy: "AlpacaERC4626",
      underlying: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", // ETH
      otherParams: ["0xbfF4a34A4644a113E8200D7F1D79b3555f723AfE"], // ibETH
      name: "ETH",
    },
    {
      // 0x
      strategy: "AlpacaERC4626",
      underlying: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", // BUSD
      otherParams: ["0x7C9e73d4C71dae564d41F78d56439bB4ba87592f"], // ibBUSD
      name: "BUSD",
    },
    {
      // 0x
      strategy: "AlpacaERC4626",
      underlying: "0x55d398326f99059ff775485246999027b3197955", // USDT
      otherParams: ["0x158Da805682BdC8ee32d52833aD41E74bb951E59"], // ibUSDT
      name: "USDT",
    },
    {
      // 0x
      strategy: "AlpacaERC4626",
      underlying: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // USDC
      otherParams: ["0x800933D685E7Dc753758cEb77C8bd34aBF1E26d7"], // ibUSDC
      name: "USDC",
    },
    {
      // 0x
      strategy: "AlpacaERC4626",
      underlying: "0x14016e85a25aeb13065688cafb43044c2ef86784", // TUSD
      otherParams: ["0x3282d2a151ca00BfE7ed17Aa16E42880248CD3Cd"], // ibTUSD
      name: "TUSD",
    },
    {
      // 0x
      strategy: "AlpacaERC4626",
      underlying: "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c", // BTCB
      otherParams: ["0x08FC9Ba2cAc74742177e0afC3dC8Aed6961c24e7"], // ibBTCB
      name: "BTCB",
    },
  ],
  dynamicFlywheels: [
    { rewardToken: "0x84c97300a190676a19D1E13115629A11f8482Bd1", cycleLength: 1, name: "DDD" },
    { rewardToken: "0xaf41054c1487b0e5e2b9250c0332ecbce6ce9d71", cycleLength: 1, name: "EPX" },
    { rewardToken: "0xa184088a740c695E156F91f5cC086a06bb78b827", cycleLength: 1, name: "AUTOv2" },
  ],
};

const chainlinkAssets: ChainlinkAsset[] = [
  //
  {
    symbol: "BUSD",
    aggregator: "0xcBb98864Ef56E9042e7d2efef76141f15731B82f",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: "BTCB",
    aggregator: "0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: "DAI",
    aggregator: "0x132d3C0B1D2cEa0BC552588063bdBb210FDeecfA",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: "ETH",
    aggregator: "0x63D407F32Aa72E63C7209ce1c2F5dA40b3AaE726",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  // CZ
  {
    symbol: "BETH",
    aggregator: "0x2A3796273d47c4eD363b361D3AEFb7F7E2A13782",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: "CAKE",
    aggregator: "0xB6064eD41d4f67e353768aA239cA86f4F73665a1",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  //
  {
    symbol: "AUTO",
    aggregator: "0x88E71E6520E5aC75f5338F5F0c9DeD9d4f692cDA",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: "BIFI",
    aggregator: "0xaB827b69daCd586A37E80A7d552a4395d576e645",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  // stables
  {
    symbol: "USDC",
    aggregator: "0x51597f405303C4377E36123cBc172b13269EA163",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: "USDT",
    aggregator: "0xB97Ad0E74fa7d920791E90258A6E2085088b4320",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: "UST",
    aggregator: "0xcbf8518F8727B8582B22837403cDabc53463D462",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  // Jarvis
  {
    symbol: "jBRL",
    aggregator: "0x5cb1Cb3eA5FB46de1CE1D0F3BaDB3212e8d8eF48",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: "ALPACA",
    aggregator: "0xe0073b60833249ffd1bb2af809112c2fbf221df6",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
];

// https://docs.ellipsis.finance/deployment-links
const curvePools: CurvePoolConfig[] = [
  {
    // 3EPS
    lpToken: assets.find((a) => a.symbol === "3EPS")!.underlying,
    pool: "0x160CAed03795365F3A589f10C379FfA7d75d4E76",
    underlyings: [
      assets.find((a) => a.symbol === "BUSD")!.underlying,
      assets.find((a) => a.symbol === "USDC")!.underlying,
      assets.find((a) => a.symbol === "USDT")!.underlying,
    ],
  },
  {
    // dai3EPS metapool
    lpToken: assets.find((a) => a.symbol === "dai3EPS")!.underlying,
    pool: "0xc6a752948627bECaB5474a10821Df73fF4771a49",
    underlyings: [
      assets.find((a) => a.symbol === "DAI")!.underlying,
      assets.find((a) => a.symbol === "3EPS")!.underlying,
    ],
  },
  {
    // UST metapool
    lpToken: assets.find((a) => a.symbol === "ust3EPS")!.underlying,
    pool: "0x780de1A0E4613da6b65ceF7F5FB63d14CbDcfB72",
    underlyings: [
      assets.find((a) => a.symbol === "UST")!.underlying,
      assets.find((a) => a.symbol === "3EPS")!.underlying,
    ],
  },
];

export const deploy = async ({ run, ethers, getNamedAccounts, deployments }: ChainDeployFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  ////
  //// ORACLES

  //// ChainLinkV2 Oracle
  await deployChainlinkOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    assets,
    chainlinkAssets,
  });
  ////

  //// Uniswap Oracle
  await deployUniswapOracle({ run, ethers, getNamedAccounts, deployments, deployConfig });
  ////

  await deployUniswapLpOracle({ run, ethers, getNamedAccounts, deployments, deployConfig });

  await deployCurveLpOracle({ run, ethers, getNamedAccounts, deployments, deployConfig, curvePools });

  const simplePO = await deployments.deploy("SimplePriceOracle", {
    from: deployer,
    args: [],
    log: true,
  });
  if (simplePO.transactionHash) await ethers.provider.waitForTransaction(simplePO.transactionHash);
  console.log("SimplePriceOracle: ", simplePO.address);

  //// Liquidator Redemption Strategies
  const uniswapLpTokenLiquidator = await deployments.deploy("UniswapLpTokenLiquidator", {
    from: deployer,
    args: [],
    log: true,
  });
  if (uniswapLpTokenLiquidator.transactionHash) {
    await ethers.provider.waitForTransaction(uniswapLpTokenLiquidator.transactionHash);
  }
  console.log("UniswapLpTokenLiquidator: ", uniswapLpTokenLiquidator.address);

  //// Liquidator Redemption Strategies
  /// xBOMB->BOMB
  const xbombLiquidator = await deployments.deploy("XBombLiquidator", {
    from: deployer,
    args: [],
    log: true,
  });
  if (xbombLiquidator.transactionHash) await ethers.provider.waitForTransaction(xbombLiquidator.transactionHash);
  console.log("XBombLiquidator: ", xbombLiquidator.address);

  /// jBRL->BUSD
  // TODO in the addresses provider?
  let synthereumLiquidityPoolAddress = "0x0fD8170Dc284CD558325029f6AEc1538c7d99f49";
  let expirationTime = 40 * 60; // period in which the liquidation tx is valid to be included in a block, in seconds
  const jarvisSynthereumLiquidator = await deployments.deploy("JarvisSynthereumLiquidator", {
    from: deployer,
    args: [synthereumLiquidityPoolAddress, expirationTime],
    log: true,
  });
  if (jarvisSynthereumLiquidator.transactionHash)
    await ethers.provider.waitForTransaction(jarvisSynthereumLiquidator.transactionHash);
  console.log("JarvisSynthereumLiquidator: ", jarvisSynthereumLiquidator.address);

  /// EPS
  const curveOracle = await ethers.getContract("CurveLpTokenPriceOracleNoRegistry", deployer);
  const curveLpTokenLiquidatorNoRegistry = await deployments.deploy("CurveLpTokenLiquidatorNoRegistry", {
    from: deployer,
    args: [deployConfig.wtoken, curveOracle.address],
    log: true,
  });
  if (curveLpTokenLiquidatorNoRegistry.transactionHash)
    await ethers.provider.waitForTransaction(curveLpTokenLiquidatorNoRegistry.transactionHash);
  console.log("CurveLpTokenLiquidatorNoRegistry: ", curveLpTokenLiquidatorNoRegistry.address);

  ////

  // Plugins & Rewards
  const dynamicFlywheels = await deployFlywheelWithDynamicRewards({
    ethers,
    getNamedAccounts,
    deployments,
    run,
    deployConfig,
  });
  console.log("deployed dynamicFlywheels: ", dynamicFlywheels);
  await deployERC4626Plugin({ ethers, getNamedAccounts, deployments, run, deployConfig, dynamicFlywheels });

  /// Addresses Provider - set bUSD
  const addressesProvider = (await ethers.getContract("AddressesProvider", deployer)) as AddressesProvider;
  let tx = await addressesProvider.setAddress("bUSD", assets.find((a) => a.symbol === "BUSD")!.underlying);
  await tx.wait();
  ////
};
