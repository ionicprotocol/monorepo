import { assetSymbols, ChainAddresses, underlying } from "@midas-capital/types";
import { ethers } from "ethers";

import { assets } from "./assets";

const chainAddresses: ChainAddresses = {
  W_TOKEN: underlying(assets, assetSymbols.WGLMR),
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: "0x4497B606be93e773bbA5eaCFCb2ac5E2214220Eb",
  UNISWAP_V2_ROUTER: "0x70085a09D30D6f8C4ecF6eE10120d1847383BB57",
  UNISWAP_V2_FACTORY: "0x68A384D826D3678f78BB9FB1533c7E9577dACc0E",
  PAIR_INIT_HASH: ethers.utils.hexlify("0x48a6ca3d52d0d0a6c53a83cc3c8688dd46ea4cb786b169ee959b95ad30f61643"),
  STABLE_TOKEN: underlying(assets, assetSymbols.multiUSDC),
  W_BTC_TOKEN: underlying(assets, assetSymbols.multiWBTC),
};

export default chainAddresses;
