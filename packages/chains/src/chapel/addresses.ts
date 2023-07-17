import { assetSymbols, ChainAddresses, underlying } from "@ionicprotocol/types";
import { ethers } from "ethers";

import { assets } from "./assets";

const chainAddresses: ChainAddresses = {
  W_TOKEN: underlying(assets, assetSymbols.WBNB),
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
  UNISWAP_V2_ROUTER: "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3",
  UNISWAP_V2_FACTORY: "0xB7926C0430Afb07AA7DEfDE6DA862aE0Bde767bc",
  PAIR_INIT_HASH: ethers.utils.hexlify("0xecba335299a6693cb2ebc4782e74669b84290b6378ea3a3873c7231a8d7d1074"),
  STABLE_TOKEN: underlying(assets, assetSymbols.BUSD),
  W_BTC_TOKEN: underlying(assets, assetSymbols.BTCB)
};

export default chainAddresses;
