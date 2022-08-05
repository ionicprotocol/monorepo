import { ethers } from "ethers";

import { SupportedChains } from "../enums";
import { ChainSpecificAddresses } from "../types";
import { underlying } from "./supportedAssets";

import {
  assetSymbols,
  auroraAssets,
  bscAssets,
  chapelAssets,
  evmosAssets,
  evmosTestnetAssets,
  ganacheAssets,
  moonbaseAlphaAssets,
  moonbeamAssets,
  neonDevnetAssets,
  polygonAssets,
} from "./assets";

const chainSpecificAddresses: ChainSpecificAddresses = {
  [SupportedChains.ganache]: {

    W_TOKEN: underlying(ganacheAssets, assetSymbols.WETH),
    W_TOKEN_USD_CHAINLINK_PRICE_FEED: "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419",
    UNISWAP_V2_ROUTER: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    UNISWAP_V2_FACTORY: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    PAIR_INIT_HASH: ethers.utils.hexlify("0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f"),
    STABLE_TOKEN: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    W_BTC_TOKEN: underlying(ganacheAssets, assetSymbols.WBTC),
  },
  [SupportedChains.chapel]: {
    W_TOKEN: underlying(chapelAssets, assetSymbols.WBNB),
    W_TOKEN_USD_CHAINLINK_PRICE_FEED: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
    UNISWAP_V2_ROUTER: "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3",
    UNISWAP_V2_FACTORY: "0xb7926c0430afb07aa7defde6da862ae0bde767bc",
    PAIR_INIT_HASH: ethers.utils.hexlify("0xecba335299a6693cb2ebc4782e74669b84290b6378ea3a3873c7231a8d7d1074"),
    STABLE_TOKEN: underlying(chapelAssets, assetSymbols.BUSD),
    W_BTC_TOKEN: underlying(chapelAssets, assetSymbols.BTCB),
  },
  [SupportedChains.bsc]: {
    W_TOKEN: underlying(bscAssets, assetSymbols.WBNB),
    W_TOKEN_USD_CHAINLINK_PRICE_FEED: "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419",
    UNISWAP_V2_ROUTER: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    UNISWAP_V2_FACTORY: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
    PAIR_INIT_HASH: ethers.utils.hexlify("0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5"),
    STABLE_TOKEN: underlying(bscAssets, assetSymbols.BUSD),
    W_BTC_TOKEN: underlying(bscAssets, assetSymbols.BTCB),
  },
  // checked
  [SupportedChains.evmos_testnet]: {
    W_TOKEN: underlying(evmosTestnetAssets, assetSymbols.WEVMOS),
    W_TOKEN_USD_CHAINLINK_PRICE_FEED: "",
    UNISWAP_V2_ROUTER: "0x72bd489d3cF0e9cC36af6e306Ff53E56d0f9EFb4",
    UNISWAP_V2_FACTORY: "0x81BC50a2df9cE424843e3c17110E1ab1FedCD4b8",
    PAIR_INIT_HASH: ethers.utils.hexlify("0xa192c894487128ec7b68781ed7bd7e3141d1718df9e4e051e0124b7671d9a6ef"),
    STABLE_TOKEN: underlying(evmosTestnetAssets, assetSymbols.USDC),
    W_BTC_TOKEN: underlying(evmosTestnetAssets, assetSymbols.WBTC),
  },
  // checked
  [SupportedChains.evmos]: {
    W_TOKEN: underlying(evmosAssets, assetSymbols.WEVMOS),
    W_TOKEN_USD_CHAINLINK_PRICE_FEED: "",
    UNISWAP_V2_ROUTER: "0xFCd2Ce20ef8ed3D43Ab4f8C2dA13bbF1C6d9512F",
    UNISWAP_V2_FACTORY: "0x6aBdDa34Fb225be4610a2d153845e09429523Cd2",
    PAIR_INIT_HASH: ethers.utils.hexlify("0xa192c894487128ec7b68781ed7bd7e3141d1718df9e4e051e0124b7671d9a6ef"),
    STABLE_TOKEN: underlying(evmosAssets, assetSymbols.USDC),
    W_BTC_TOKEN: underlying(evmosAssets, assetSymbols.WBTC),
  },
  // checked
  [SupportedChains.moonbeam]: {
    W_TOKEN: underlying(moonbeamAssets, assetSymbols.WGLMR),
    W_TOKEN_USD_CHAINLINK_PRICE_FEED: "0x4497B606be93e773bbA5eaCFCb2ac5E2214220Eb",
    UNISWAP_V2_ROUTER: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    UNISWAP_V2_FACTORY: "0x985BcA32293A7A496300a48081947321177a86FD",
    PAIR_INIT_HASH: ethers.utils.hexlify("0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5"),
    STABLE_TOKEN: underlying(moonbeamAssets, assetSymbols.multiUSDC),
    W_BTC_TOKEN: underlying(moonbeamAssets, assetSymbols.madWBTC),
  },
  // TODO: check addresses
  [SupportedChains.moonbase_alpha]: {
    W_TOKEN: underlying(moonbaseAlphaAssets, assetSymbols.WDEV),
    W_TOKEN_USD_CHAINLINK_PRICE_FEED: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
    UNISWAP_V2_ROUTER: "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
    UNISWAP_V2_FACTORY: "0x6725F303b657a9451d8BA641348b6761A6CC7a17",
    PAIR_INIT_HASH: ethers.utils.hexlify("0xd0d4c4cd0848c93cb4fd1f498d7013ee6bfb25783ea21593d5834f5d250ece66"),
    STABLE_TOKEN: underlying(moonbaseAlphaAssets, assetSymbols.USDC),
    W_BTC_TOKEN: underlying(moonbaseAlphaAssets, assetSymbols.WBTC),
  },
  // TODO: check addresses
  [SupportedChains.aurora]: {
    W_TOKEN: underlying(auroraAssets, assetSymbols.WNEAR),
    W_TOKEN_USD_CHAINLINK_PRICE_FEED: "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419",
    UNISWAP_V2_ROUTER: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    UNISWAP_V2_FACTORY: "0x985BcA32293A7A496300a48081947321177a86FD",
    PAIR_INIT_HASH: ethers.utils.hexlify("0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5"),
    STABLE_TOKEN: underlying(auroraAssets, assetSymbols.WNEAR),
    W_BTC_TOKEN: underlying(auroraAssets, assetSymbols.WNEAR),
  },
  // TODO: change these to the correct addresses!
  [SupportedChains.neon_devnet]: {
    W_TOKEN: underlying(neonDevnetAssets, assetSymbols.WNEON),
    W_TOKEN_USD_CHAINLINK_PRICE_FEED: "",
    UNISWAP_V2_ROUTER: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    UNISWAP_V2_FACTORY: "0x985BcA32293A7A496300a48081947321177a86FD",
    PAIR_INIT_HASH: ethers.utils.hexlify("0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5"),
    STABLE_TOKEN: underlying(neonDevnetAssets, assetSymbols.USDC),
    W_BTC_TOKEN: underlying(neonDevnetAssets, assetSymbols.WBTC),
  },
  // checked
  [SupportedChains.polygon]: {
    W_TOKEN: underlying(polygonAssets, assetSymbols.WMATIC),
    W_TOKEN_USD_CHAINLINK_PRICE_FEED: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0",
    UNISWAP_V2_ROUTER: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
    UNISWAP_V2_FACTORY: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
    PAIR_INIT_HASH: ethers.utils.hexlify("0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f"),
    STABLE_TOKEN: underlying(polygonAssets, assetSymbols.USDC),
    W_BTC_TOKEN: underlying(polygonAssets, assetSymbols.WBTC),
  },
};

export default chainSpecificAddresses;
