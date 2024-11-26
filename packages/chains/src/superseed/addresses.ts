import { assetSymbols, ChainAddresses, underlying } from "@ionicprotocol/types";

import { assets } from "./assets";

const chainAddresses: ChainAddresses = {
  PAIR_INIT_HASH: "", // TODO is this used anywhere?
  STABLE_TOKEN: "",
  UNISWAP_V2_ROUTER: "",
  UNISWAP_V2_FACTORY: "",
  UNISWAP_V3: {
    FACTORY: "",
    PAIR_INIT_HASH: "",
    QUOTER_V2: "" // unused
  },
  UNISWAP_V3_ROUTER: "", // universal router, need to check if this works
  W_BTC_TOKEN: "", // underlying(assets, assetSymbols.WBTC),
  W_TOKEN: underlying(assets, assetSymbols.WETH),
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: "0x6b7AB4213c77A671Fc7AEe8eB23C9961fDdaB3b2"
};

export default chainAddresses;
