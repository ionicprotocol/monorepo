import { assetSymbols, ChainAddresses, underlying } from "@ionicprotocol/types";

import { assets } from "./assets";

const chainAddresses: ChainAddresses = {
  PAIR_INIT_HASH: "", // TODO is this used anywhere?
  STABLE_TOKEN: "", //underlying(assets, assetSymbols.USDC),
  UNISWAP_V2_ROUTER: "",
  UNISWAP_V2_FACTORY: "",
  UNISWAP_V3: {
    FACTORY: "", // kim v4
    PAIR_INIT_HASH: "", // unused
    QUOTER_V2: "" // unused
  },
  UNISWAP_V3_ROUTER: "", // universal router, need to check if this works
  W_BTC_TOKEN: "", // underlying(assets, assetSymbols.WBTC),
  W_TOKEN: underlying(assets, assetSymbols.WETH),
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: ""
};

export default chainAddresses;
