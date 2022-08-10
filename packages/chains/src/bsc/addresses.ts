import { assetSymbols, ChainAddresses, underlying } from "@midas-capital/types";
import { ethers } from "ethers";

import { assets } from "./assets";

const chainAddresses: ChainAddresses = {
  W_TOKEN: underlying(assets, assetSymbols.WBNB),
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419",
  UNISWAP_V2_ROUTER: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
  UNISWAP_V2_FACTORY: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
  PAIR_INIT_HASH: ethers.utils.hexlify("0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5"),
  STABLE_TOKEN: underlying(assets, assetSymbols.BUSD),
  W_BTC_TOKEN: underlying(assets, assetSymbols.BTCB),
};

export default chainAddresses;
