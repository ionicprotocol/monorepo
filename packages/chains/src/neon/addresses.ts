import { assetSymbols, ChainAddresses, underlying } from "@ionicprotocol/types";
import { ethers } from "ethers";

import { assets } from "./assets";

const chainAddresses: ChainAddresses = {
  W_TOKEN: underlying(assets, assetSymbols.WNEON),
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: ethers.constants.AddressZero,
  UNISWAP_V2_ROUTER: "0x594e37B9F39f5D31DEc4a8c1cC4fe2E254153034",
  UNISWAP_V2_FACTORY: "0xd43F135f6667174f695ecB7DD2B5f953d161e4d1",
  PAIR_INIT_HASH: ethers.utils.hexlify("0x90bd59376ac57291a9f9f006d78c05e6784b9f3e1381868317da55d80893a0e0"),
  STABLE_TOKEN: underlying(assets, assetSymbols.USDC),
  W_BTC_TOKEN: underlying(assets, assetSymbols.WBTC)
};

export default chainAddresses;
