import { assetSymbols, ChainAddresses, underlying } from "@midas-capital/types";
import { ethers } from "ethers";

import { UNISWAP_V3_ADDRESSES } from "../common/addresses";

import { assets } from "./assets";

const chainAddresses: ChainAddresses = {
  W_TOKEN: underlying(assets, assetSymbols.WETH),
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: ethers.constants.AddressZero,
  UNISWAP_V2_ROUTER: ethers.constants.AddressZero,
  UNISWAP_V2_FACTORY: ethers.constants.AddressZero,
  UNISWAP_V3_ROUTER: ethers.constants.AddressZero,
  PAIR_INIT_HASH: ethers.utils.hexlify("0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f"),
  STABLE_TOKEN: underlying(assets, assetSymbols.USDC),
  W_BTC_TOKEN: underlying(assets, assetSymbols.WBTC),
  UNISWAP_V3: UNISWAP_V3_ADDRESSES,
};

export default chainAddresses;
