import { assetSymbols, ChainAddresses, underlying } from "@ionicprotocol/types";
import { zeroAddress } from "viem";

import { assets } from "./assets";

const chainAddresses: ChainAddresses = {
  PAIR_INIT_HASH: "", // TODO is this used anywhere?
  STABLE_TOKEN: underlying(assets, assetSymbols.USDT),
  UNISWAP_V2_ROUTER: zeroAddress,
  UNISWAP_V2_FACTORY: zeroAddress,
  UNISWAP_V3: {
    FACTORY: zeroAddress,
    PAIR_INIT_HASH: "",
    QUOTER_V2: "" // unused
  },
  UNISWAP_V3_ROUTER: "", // universal router, need to check if this works
  W_BTC_TOKEN: zeroAddress, // underlying(assets, assetSymbols.WBTC),
  W_TOKEN: underlying(assets, assetSymbols.WETH),
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: zeroAddress
};

export default chainAddresses;
