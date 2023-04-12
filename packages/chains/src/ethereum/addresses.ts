import { assetSymbols, ChainAddresses, underlying } from "@midas-capital/types";
import { ethers } from "ethers";

import { UNISWAP_V3_ADDRESSES } from "../common/addresses";

import { assets } from "./assets";

const chainAddresses: ChainAddresses = {
  W_TOKEN: underlying(assets, assetSymbols.WETH),
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  UNISWAP_V2_ROUTER: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
  UNISWAP_V2_FACTORY: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
  UNISWAP_V3_ROUTER: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
  PAIR_INIT_HASH: ethers.utils.hexlify("0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f"),
  STABLE_TOKEN: underlying(assets, assetSymbols.USDC),
  W_BTC_TOKEN: underlying(assets, assetSymbols.WBTC),
  UNISWAP_V3: UNISWAP_V3_ADDRESSES,
};

export default chainAddresses;
