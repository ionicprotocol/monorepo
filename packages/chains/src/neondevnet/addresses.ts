import { assetSymbols, ChainAddresses, underlying } from "@midas-capital/types";
import { ethers } from "ethers";

import { assets } from "./assets";

const chainAddresses: ChainAddresses = {
  W_TOKEN: underlying(assets, assetSymbols.WNEON),
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: "",
  UNISWAP_V2_ROUTER: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
  UNISWAP_V2_FACTORY: "0x985BcA32293A7A496300a48081947321177a86FD",
  PAIR_INIT_HASH: ethers.utils.hexlify("0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5"),
  STABLE_TOKEN: underlying(assets, assetSymbols.USDC),
  W_BTC_TOKEN: underlying(assets, assetSymbols.WBTC),
};

export default chainAddresses;
