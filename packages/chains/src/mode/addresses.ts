import { assetSymbols, ChainAddresses, underlying } from "@ionicprotocol/types";
import { ethers } from "ethers";

import { assets } from "./assets";

const chainAddresses: ChainAddresses = {
  PAIR_INIT_HASH: "",
  STABLE_TOKEN: "",
  UNISWAP_V2_ROUTER: ethers.constants.AddressZero,
  UNISWAP_V2_FACTORY: ethers.constants.AddressZero,
  UNISWAP_V3: { FACTORY: "", PAIR_INIT_HASH: "", QUOTER_V2: "" },
  UNISWAP_V3_ROUTER: "",
  W_BTC_TOKEN: "",
  W_TOKEN: underlying(assets, assetSymbols.WETH),
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: ""
};

export default chainAddresses;
