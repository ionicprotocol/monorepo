import { assetSymbols, ChainAddresses, underlying } from "@ionicprotocol/types";
import { zeroAddress } from "viem";

import { assets } from "./assets";

const chainAddresses: ChainAddresses = {
  PAIR_INIT_HASH: "", // TODO is this used anywhere?
  STABLE_TOKEN: "0x51e85d70944256710cb141847f1a04f568c1db0e",
  UNISWAP_V2_ROUTER: zeroAddress,
  UNISWAP_V2_FACTORY: zeroAddress,
  UNISWAP_V3: {
    FACTORY: zeroAddress,
    PAIR_INIT_HASH: "",
    QUOTER_V2: zeroAddress // unused
  },
  UNISWAP_V3_ROUTER: zeroAddress, // universal router, need to check if this works
  W_BTC_TOKEN: zeroAddress, // underlying(assets, assetSymbols.WBTC),
  W_TOKEN: underlying(assets, assetSymbols.WETH),
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: "0x5b0cf2b36a65a6BB085D501B971e4c102B9Cd473"
};

export default chainAddresses;
