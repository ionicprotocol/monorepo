import { assetSymbols, ChainAddresses, underlying } from "@midas-capital/types";
import { ethers } from "ethers";

import { assets } from "./assets";

const chainAddresses: ChainAddresses = {
  W_TOKEN: underlying(assets, assetSymbols.WNEON),
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: "",
  UNISWAP_V2_ROUTER: "0x696d73D7262223724d60B2ce9d6e20fc31DfC56B",
  UNISWAP_V2_FACTORY: "0x6dcDD1620Ce77B595E6490701416f6Dbf20D2f67",
  PAIR_INIT_HASH: ethers.utils.hexlify("0x1f475d88284b09799561ca05d87dc757c1ff4a9f48983cdb84d1dd6e209d3ae2"),
  STABLE_TOKEN: underlying(assets, assetSymbols.USDC),
  W_BTC_TOKEN: "",
};

export default chainAddresses;
