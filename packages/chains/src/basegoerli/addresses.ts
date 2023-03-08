import { assetSymbols, ChainAddresses, underlying } from "@midas-capital/types";
import { ethers } from "ethers";

import { assets } from "./assets";

const chainAddresses: ChainAddresses = {
  W_TOKEN: underlying(assets, assetSymbols.WETH),
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: "",
  UNISWAP_V2_ROUTER: "0xbdFa4a05372a10172EeEB75075c85FCbff521625",
  UNISWAP_V2_FACTORY: "",
  UNISWAP_V3: {
    FACTORY: "0x865412B6cDf424bE36088fE3DeC2A072a26Cc494",
    QUOTER_V2: "0x4e6b4bf90Ac833A5fDc91d444F7B2e483D77d723",
    PAIR_INIT_HASH: ethers.utils.hexlify("0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54"),
  },
  PAIR_INIT_HASH: ethers.utils.hexlify("0x1f475d88284b09799561ca05d87dc757c1ff4a9f48983cdb84d1dd6e209d3ae2"),
  STABLE_TOKEN: underlying(assets, assetSymbols.USDC),
  W_BTC_TOKEN: underlying(assets, assetSymbols.WBTC),
};

export default chainAddresses;
