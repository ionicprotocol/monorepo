import { assetSymbols, ChainAddresses, underlying } from "@ionicprotocol/types";
import { ethers } from "ethers";

import { assets } from "./assets";

const chainAddresses: ChainAddresses = {
  PAIR_INIT_HASH: "", // TODO is this used anywhere?
  STABLE_TOKEN: underlying(assets, assetSymbols.USDC),
  UNISWAP_V2_ROUTER: "0x5b0AB9AFe2e5a6eA801fe93BF65478d5A2f8e903",
  UNISWAP_V2_FACTORY: "0xde57CDA805f01c1647c4b6fc6FFdAF36AE6f6600",
  UNISWAP_V3: {
    FACTORY: "0xCD63bA972E72834c6D73a2C0A1Df0F11e0535803", // kim v4
    PAIR_INIT_HASH: "", // unused
    QUOTER_V2: "0xC5290058841028F1614F3A6F0F5816cAd0df5E27" // unused
  },
  UNISWAP_V3_ROUTER: "0x403616fBc3D2d0E9a0aBAf7cDCbc6611F41f7142", // kim v4
  W_BTC_TOKEN: underlying(assets, assetSymbols.WBTC),
  W_TOKEN: underlying(assets, assetSymbols.WETH),
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: ethers.constants.AddressZero
};

export default chainAddresses;
