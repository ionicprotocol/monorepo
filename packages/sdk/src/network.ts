import { Artifacts, ChainDeployment } from "./Fuse/types";
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
    UNISWAP_V2_ROUTER: "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
    UNISWAP_V2_FACTORY: "0x6725F303b657a9451d8BA641348b6761A6CC7a17",
    PAIR_INIT_HASH: ethers.utils.hexlify("0xd0d4c4cd0848c93cb4fd1f498d7013ee6bfb25783ea21593d5834f5d250ece66"),
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
    USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    W_TOKEN: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
    W_TOKEN_USD_CHAINLINK_PRICE_FEED: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
    UNISWAP_V2_ROUTER: "0x638771E1eE3c85242D811e9eEd89C71A4F8F4F73",
    UNISWAP_V2_FACTORY: "0xBB86C1332f54afb6509CB599BF88980f7b389403",
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
