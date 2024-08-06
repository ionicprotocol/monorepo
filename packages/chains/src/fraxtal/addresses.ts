import { assetSymbols, ChainAddresses, underlying } from "@ionicprotocol/types";

import { assets } from "./assets";

const chainAddresses: ChainAddresses = {
  PAIR_INIT_HASH: "", // TODO is this used anywhere?
  STABLE_TOKEN: underlying(assets, assetSymbols.FRAX),
  UNISWAP_V2_ROUTER: "0x39cd4db6460d8B5961F73E997E86DdbB7Ca4D5F6",
  UNISWAP_V2_FACTORY: "0xE30521fe7f3bEB6Ad556887b50739d6C7CA667E6",
  UNISWAP_V3: {
    FACTORY: "0x0000000000000000000000000000000000000000", //
    PAIR_INIT_HASH: "", // unused
    QUOTER_V2: "" // unused
  },
  UNISWAP_V3_ROUTER: "0x0000000000000000000000000000000000000000", // universal router, need to check if this works
  W_BTC_TOKEN: underlying(assets, assetSymbols.frxBTC),
  W_TOKEN: underlying(assets, assetSymbols.WETH),
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: "0x89e60b56efD70a1D4FBBaE947bC33cae41e37A72"
};

export default chainAddresses;
