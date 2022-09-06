import { assetSymbols, ChainAddresses, underlying } from "@midas-capital/types";
import { ethers } from "ethers";

import { assets } from "./assets";

const chainAddresses: ChainAddresses = {
  W_TOKEN: underlying(assets, assetSymbols.WNEON),
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: "",
  UNISWAP_V2_ROUTER: "0x53172f5CF9fB7D7123A2521a26eC8DB2707045E2",
  UNISWAP_V2_FACTORY: "0xBD9EbFe0E6e909E56f1Fd3346D0118B7Db49Ca15",
  PAIR_INIT_HASH: ethers.utils.hexlify("0x5e60a73d5771bebe13c2aec4784c2f5bd78d04e8e89e164a5299407beb2d324a"),
  STABLE_TOKEN: underlying(assets, assetSymbols.USDC),
  W_BTC_TOKEN: underlying(assets, assetSymbols.WBTC),
};

export default chainAddresses;
