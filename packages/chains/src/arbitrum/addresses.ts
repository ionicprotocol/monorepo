import { assetSymbols, ChainAddresses, underlying } from "@ionicprotocol/types";
import { ethers } from "ethers";

import { UNISWAP_V3_ADDRESSES } from "../common/addresses";

import { assets } from "./assets";

const chainAddresses: ChainAddresses = {
  W_TOKEN: underlying(assets, assetSymbols.WETH),
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
  UNISWAP_V2_ROUTER: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
  UNISWAP_V2_FACTORY: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
  UNISWAP_V3_ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
  PAIR_INIT_HASH: ethers.utils.hexlify("0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303"),
  STABLE_TOKEN: underlying(assets, assetSymbols.USDC),
  W_BTC_TOKEN: underlying(assets, assetSymbols.WBTC),
  UNISWAP_V3: UNISWAP_V3_ADDRESSES
};

export default chainAddresses;
