import { assetSymbols, ChainAddresses, underlying } from "@ionicprotocol/types";

import { assets } from "./assets";

const chainAddresses: ChainAddresses = {
  PAIR_INIT_HASH: "", // TODO is this used anywhere?
  STABLE_TOKEN: "", //underlying(assets, assetSymbols.USDC),
  UNISWAP_V2_ROUTER: "",
  UNISWAP_V2_FACTORY: "",
  UNISWAP_V3: {
    FACTORY: "0x0d922Fb1Bc191F64970ac40376643808b4B74Df9", // kim v4
    PAIR_INIT_HASH: "", // unused
    QUOTER_V2: "0x738fD6d10bCc05c230388B4027CAd37f82fe2AF2" // unused
  },
  UNISWAP_V3_ROUTER: "0x1b35fbA9357fD9bda7ed0429C8BbAbe1e8CC88fc", // universal router, need to check if this works
  W_BTC_TOKEN: "", // underlying(assets, assetSymbols.WBTC),
  W_TOKEN: underlying(assets, assetSymbols.WETH),
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: ""
};

export default chainAddresses;
