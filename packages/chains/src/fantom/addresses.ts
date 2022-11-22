import { assetSymbols, ChainAddresses, underlying } from "@midas-capital/types";
import { ethers } from "ethers";

import { assets } from "./assets";

const chainAddresses: ChainAddresses = {
  W_TOKEN: underlying(assets, assetSymbols.WFTM),
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: "0xf4766552D15AE4d256Ad41B6cf2933482B0680dc",
  UNISWAP_V2_ROUTER: "0xF491e7B69E4244ad4002BC14e878a34207E38c29",
  UNISWAP_V2_FACTORY: "0x152eE697f2E276fA89E96742e9bB9aB1F2E61bE3",
  PAIR_INIT_HASH: ethers.utils.hexlify("0xcdf2deca40a0bd56de8e3ce5c7df6727e5b1bf2ac96f283fa9c4b3e6b42ea9d2"),
  STABLE_TOKEN: underlying(assets, assetSymbols.USDC),
  W_BTC_TOKEN: underlying(assets, assetSymbols.multiBTC),
};

export default chainAddresses;
