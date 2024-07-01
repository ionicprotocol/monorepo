import { assetSymbols, ChainAddresses, underlying } from "@ionicprotocol/types";

import { assets } from "./assets";

const chainAddresses: ChainAddresses = {
  PAIR_INIT_HASH: "", // TODO is this used anywhere?
  STABLE_TOKEN: underlying(assets, assetSymbols.USDC),
  UNISWAP_V2_ROUTER: "0x4A7b5Da61326A6379179b40d00F57E5bbDC962c2",
  UNISWAP_V2_FACTORY: "0x0c3c1c532F1e39EdF36BE9Fe0bE1410313E074Bf",
  UNISWAP_V3: {
    FACTORY: "0x1F98431c8aD98523631AE4a59f267346ea31F984", //
    PAIR_INIT_HASH: "", // unused
    QUOTER_V2: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e" // unused
  },
  UNISWAP_V3_ROUTER: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45", // universal router, need to check if this works
  W_BTC_TOKEN: underlying(assets, assetSymbols.WBTC),
  W_TOKEN: underlying(assets, assetSymbols.WETH),
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: "0x13e3Ee699D1909E989722E753853AE30b17e08c5"
};

export default chainAddresses;
