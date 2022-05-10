import { Artifacts, ChainDeployment, ChainPlugins } from "./Fuse/types";
import { BigNumber, ethers } from "ethers";

export enum SupportedChains {
  bsc = 56,
  chapel = 97,
  ganache = 1337,
  aurora = 1313161555,
  evmos = 9001,
  evmos_testnet = 9000,
  harmony = 1666600000,
  moonbeam = 1284,
  moonbase_alpha = 1287,
}

export const chainSpecificParams = {
  [SupportedChains.ganache]: {
    blocksPerYear: BigNumber.from((4 * 24 * 365 * 60).toString()),
  },
  [SupportedChains.chapel]: {
    blocksPerYear: BigNumber.from((4 * 24 * 365 * 60).toString()),
  },
  [SupportedChains.bsc]: {
    blocksPerYear: BigNumber.from((4 * 24 * 365 * 60).toString()),
  },
  // TODO: not sure if this is correct
  [SupportedChains.evmos_testnet]: {
    blocksPerYear: BigNumber.from((4 * 24 * 365 * 60).toString()),
  },
  [SupportedChains.moonbeam]: {
    blocksPerYear: BigNumber.from((5 * 24 * 365 * 60).toString()),
  },
  [SupportedChains.moonbase_alpha]: {
    blocksPerYear: BigNumber.from((5 * 24 * 365 * 60).toString()),
  },
};

export const chainSpecificAddresses = {
  [SupportedChains.ganache]: {
    DAI_POT: "0x197e90f9fad81970ba7976f33cbd77088e5d7cf7",
    DAI_JUG: "0x19c0976f590d67707e62397c87829d896dc0f1f1",
    USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    W_TOKEN: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    W_TOKEN_USD_CHAINLINK_PRICE_FEED: "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419", // use mainnet
    UNISWAP_V2_ROUTER: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    UNISWAP_V2_FACTORY: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    PAIR_INIT_HASH: ethers.utils.hexlify("0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f"),
  },
  [SupportedChains.chapel]: {
    DAI_POT: "0x197e90f9fad81970ba7976f33cbd77088e5d7cf7",
    DAI_JUG: "0x19c0976f590d67707e62397c87829d896dc0f1f1",
    USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    W_TOKEN: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
    W_TOKEN_USD_CHAINLINK_PRICE_FEED: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
    UNISWAP_V2_ROUTER: "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3",
    UNISWAP_V2_FACTORY: "0xb7926c0430afb07aa7defde6da862ae0bde767bc",
    PAIR_INIT_HASH: ethers.utils.hexlify("0xecba335299a6693cb2ebc4782e74669b84290b6378ea3a3873c7231a8d7d1074"),
  },
  [SupportedChains.bsc]: {
    DAI_POT: "0x197e90f9fad81970ba7976f33cbd77088e5d7cf7",
    DAI_JUG: "0x19c0976f590d67707e62397c87829d896dc0f1f1",
    USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    W_TOKEN: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    W_TOKEN_USD_CHAINLINK_PRICE_FEED: "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419",
    UNISWAP_V2_ROUTER: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    UNISWAP_V2_FACTORY: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
    PAIR_INIT_HASH: ethers.utils.hexlify("0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5"),
  },
  // TODO: not sure if this is correct
  [SupportedChains.evmos_testnet]: {
    DAI_POT: "0x197e90f9fad81970ba7976f33cbd77088e5d7cf7",
    DAI_JUG: "0x19c0976f590d67707e62397c87829d896dc0f1f1",
    USDC: "0x412576738928c7a3dDA5c8AdF211C5C56054781b",
    W_TOKEN: "0x7F865d113DA1cD186271Fa0E5170753733Cf4ED9",
    W_TOKEN_USD_CHAINLINK_PRICE_FEED: "",
    UNISWAP_V2_ROUTER: "0x72bd489d3cF0e9cC36af6e306Ff53E56d0f9EFb4",
    UNISWAP_V2_FACTORY: "0x81BC50a2df9cE424843e3c17110E1ab1FedCD4b8",
    PAIR_INIT_HASH: ethers.utils.hexlify("0xa192c894487128ec7b68781ed7bd7e3141d1718df9e4e051e0124b7671d9a6ef"),
  },
  // TODO: not sure if this is correct
  [SupportedChains.moonbeam]: {
    DAI_POT: "0x197e90f9fad81970ba7976f33cbd77088e5d7cf7",
    DAI_JUG: "0x19c0976f590d67707e62397c87829d896dc0f1f1",
    USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    W_TOKEN: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    W_TOKEN_USD_CHAINLINK_PRICE_FEED: "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419",
    UNISWAP_V2_ROUTER: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    UNISWAP_V2_FACTORY: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
    PAIR_INIT_HASH: ethers.utils.hexlify("0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5"),
  },
  // TODO: not sure if this is correct
  [SupportedChains.moonbase_alpha]: {
    DAI_POT: "0x197e90f9fad81970ba7976f33cbd77088e5d7cf7",
    DAI_JUG: "0x19c0976f590d67707e62397c87829d896dc0f1f1",
    USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    W_TOKEN: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
    W_TOKEN_USD_CHAINLINK_PRICE_FEED: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
    UNISWAP_V2_ROUTER: "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
    UNISWAP_V2_FACTORY: "0x6725F303b657a9451d8BA641348b6761A6CC7a17",
    PAIR_INIT_HASH: ethers.utils.hexlify("0xd0d4c4cd0848c93cb4fd1f498d7013ee6bfb25783ea21593d5834f5d250ece66"),
  },
};

const OracleTypes = {
  MasterPriceOracle: "MasterPriceOracle",
  SimplePriceOracle: "SimplePriceOracle",
  ChainlinkPriceOracleV2: "ChainlinkPriceOracleV2",
  UniswapTwapPriceOracleV2: "UniswapTwapPriceOracleV2",
} as const;

export const chainOracles = {
  [SupportedChains.ganache]: [OracleTypes.SimplePriceOracle, OracleTypes.MasterPriceOracle],
  [SupportedChains.chapel]: [
    OracleTypes.MasterPriceOracle,
    OracleTypes.ChainlinkPriceOracleV2,
    OracleTypes.UniswapTwapPriceOracleV2,
  ],
  [SupportedChains.bsc]: [
    OracleTypes.MasterPriceOracle,
    OracleTypes.ChainlinkPriceOracleV2,
    OracleTypes.UniswapTwapPriceOracleV2,
    OracleTypes.SimplePriceOracle,
  ],
  // TODO: not sure if this is correct
  [SupportedChains.evmos_testnet]: [OracleTypes.MasterPriceOracle],
  [SupportedChains.moonbeam]: [OracleTypes.MasterPriceOracle],
  [SupportedChains.moonbase_alpha]: [OracleTypes.MasterPriceOracle],
};

export const oracleConfig = (deployments: ChainDeployment, artifacts: Artifacts, availableOracles: Array<string>) => {
  const asMap = new Map(availableOracles.map((o) => [o, { artifact: artifacts[o], address: deployments[o].address }]));
  return Object.fromEntries(asMap);
};

export const irmConfig = (deployments: ChainDeployment, artifacts: Artifacts) => {
  return {
    JumpRateModel: {
      artifact: artifacts.JumpRateModel,
      address: deployments.JumpRateModel.address,
    },
    WhitePaperInterestRateModel: {
      artifact: artifacts.WhitePaperInterestRateModel,
      address: deployments.WhitePaperInterestRateModel.address,
    },
  };
};

export const chainPluginConfig: ChainPlugins = {
  [SupportedChains.ganache]: {
    // TRIBE
    "0x5d7075e5A69A4d55BfA86F8d6ae49D7893D968f9": [
      {
        strategyName: "Mock Tribe Strategy With TOUCH Rewards",
        strategyAddress: "0xdC206B5684A85ddEb4e2e1Ca48A1fCb5C3d31Ef3",
        dynamicFlywheel: {
          address: "0x681cEEE3d6781394b2ECD7a4b9d5214f537aFeEb",
          rewardToken: "0x54572129Fd040C19F9ab57A1a152e95C1fEC0dF0", // TOUCH
        },
      },
    ],
    // TOUCH
    "0x54572129Fd040C19F9ab57A1a152e95C1fEC0dF0": [
      {
        strategyName: "Mock Touch Strategy",
        strategyAddress: "0xdC206B5684A85ddEb4e2e1Ca48A1fCb5C3d31Ef3",
        dynamicFlywheel: null,
      },
    ],
  },
  [SupportedChains.chapel]: {},
  [SupportedChains.bsc]: {
    // BOMB-BTC LP
    "0x84392649eb0bC1c1532F2180E58Bae4E1dAbd8D6": [
      {
        strategyName: "BOMB-BTC LP Autocompounding (beefy)",
        strategyAddress: "0x9015315d6757fd1c8735F7d3f0E7fE3E76934c40",
        dynamicFlywheel: null,
      },
    ],
    // BOMB
    "0x522348779DCb2911539e76A1042aA922F9C47Ee3": [
      {
        strategyName: "BOMB Autocompounding (beefy)",
        strategyAddress: "0x9baB520eBB7954D0030E9cF03A9345554994a786",
        dynamicFlywheel: null,
      },
    ],
    // 3EPS
    "0xaF4dE8E872131AE328Ce21D909C74705d3Aaf452": [
      {
        strategyName: "3EPS LP Staker with EPX Rewards",
        strategyAddress: "",
        dynamicFlywheel: {
          address: "0x968086e25851D465127Bb536516c2162Cd79B360",
          rewardToken: "0xaf41054c1487b0e5e2b9250c0332ecbce6ce9d71",
        },
      },
    ],
    // dai3EPS
    "0x0BC3a8239B0a63E945Ea1bd6722Ba747b9557e56": [
      {
        strategyName: "dai3EPS LP Staker with EPX Rewards",
        strategyAddress: "",
        dynamicFlywheel: {
          address: "0x968086e25851D465127Bb536516c2162Cd79B360",
          rewardToken: "0xaf41054c1487b0e5e2b9250c0332ecbce6ce9d71",
        },
      },
    ],
    // ust3EPS
    "0x151F1611b2E304DEd36661f65506f9D7D172beba": [
      {
        strategyName: "ust3EPS LP Staker with EPX Rewards",
        strategyAddress: "",
        dynamicFlywheel: {
          address: "0x968086e25851D465127Bb536516c2162Cd79B360",
          rewardToken: "0xaf41054c1487b0e5e2b9250c0332ecbce6ce9d71",
        },
      },
    ],
    // WBNB
    "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c": [
      {
        strategyName: "Alpaca Finance ibWBNB Vault",
        strategyAddress: "0x0b434c33905C2B80bA978B90bFD874dFBa5260b3",
        dynamicFlywheel: null,
      },
    ],
    // ETH
    "0x2170ed0880ac9a755fd29b2688956bd959f933f8": [
      {
        strategyName: "Alpaca Finance ibETH Vault",
        strategyAddress: "0xCBE401B8874A1C30163740f5f45156088Eb21481",
        dynamicFlywheel: null,
      },
    ],
    // BUSD
    "0xe9e7cea3dedca5984780bafc599bd69add087d56": [
      {
        strategyName: "Alpaca Finance ibBUSD Vault",
        strategyAddress: "0x9012ef7414D5c42873D94506b91C1677BF4DfF38",
        dynamicFlywheel: null,
      },
    ],
    // USDT
    "0x55d398326f99059ff775485246999027b3197955": [
      {
        strategyName: "Alpaca Finance ibUSDT Vault",
        strategyAddress: "0xF0BbDdd4EF2Ac465f949B45f0c7a8AFFCD09C8AC",
        dynamicFlywheel: null,
      },
    ],
    // USDC
    "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d": [
      {
        strategyName: "Alpaca Finance ibUSDC Vault",
        strategyAddress: "0x40bDBA20fc031042d0b4cF804caDe6109DBEb33C",
        dynamicFlywheel: null,
      },
    ],
    // TUSD
    "0x14016e85a25aeb13065688cafb43044c2ef86784": [
      {
        strategyName: "Alpaca Finance ibTUSD Vault",
        strategyAddress: "",
        dynamicFlywheel: null,
      },
    ],
    // BTCB
    "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c": [
      {
        strategyName: "Alpaca Finance ibBTCB Vault",
        strategyAddress: "0xE2f3563b4E7d19bcC3B1F63e61D4D29f6dD7e593",
        dynamicFlywheel: null,
      },
    ],
  },

  [SupportedChains.evmos_testnet]: {},
  [SupportedChains.evmos]: {},
  [SupportedChains.moonbeam]: {},
  [SupportedChains.moonbase_alpha]: {},
  [SupportedChains.aurora]: {},
  [SupportedChains.harmony]: {},
};
