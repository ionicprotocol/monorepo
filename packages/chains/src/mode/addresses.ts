import { assetSymbols, ChainAddresses, underlying } from "@ionicprotocol/types";
import { ethers } from "ethers";

import { assets } from "./assets";

const chainAddresses: ChainAddresses = {
  PAIR_INIT_HASH: "",
  STABLE_TOKEN: underlying(assets, assetSymbols.USDC),
  UNISWAP_V2_ROUTER: ethers.constants.AddressZero,
  UNISWAP_V2_FACTORY: ethers.constants.AddressZero,
  UNISWAP_V3: {
    FACTORY: ethers.constants.AddressZero,
    PAIR_INIT_HASH: "",
    QUOTER_V2: ethers.constants.AddressZero // 0x7Fd569b2021850fbA53887dd07736010aCBFc787
  },
  UNISWAP_V3_ROUTER: "", // 0xC9Adff795f46105E53be9bbf14221b1C9919EE25 ?
  W_BTC_TOKEN: ethers.constants.AddressZero,
  W_TOKEN: underlying(assets, assetSymbols.WETH),
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: ethers.constants.AddressZero
};

export default chainAddresses;
