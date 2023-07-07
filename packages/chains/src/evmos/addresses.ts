import { assetSymbols, ChainAddresses, underlying } from "@ionicprotocol/types";
import { ethers } from "ethers";

import { assets } from "./assets";

const chainAddresses: ChainAddresses = {
  W_TOKEN: underlying(assets, assetSymbols.WEVMOS),
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: "",
  UNISWAP_V2_ROUTER: "0xFCd2Ce20ef8ed3D43Ab4f8C2dA13bbF1C6d9512F",
  UNISWAP_V2_FACTORY: "0x6aBdDa34Fb225be4610a2d153845e09429523Cd2",
  PAIR_INIT_HASH: ethers.utils.hexlify("0xa192c894487128ec7b68781ed7bd7e3141d1718df9e4e051e0124b7671d9a6ef"),
  STABLE_TOKEN: underlying(assets, assetSymbols.gUSDC),
  W_BTC_TOKEN: underlying(assets, assetSymbols.gWBTC),
};

export default chainAddresses;
