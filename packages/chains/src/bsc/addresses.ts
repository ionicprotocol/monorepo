import { ChainAddresses } from "@midas-capital/types";
import { ethers } from "ethers";

import { BTCB, BUSD, WBNB } from "./assets";

const chainAddresses: ChainAddresses = {
  W_TOKEN: WBNB,
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419",
  UNISWAP_V2_ROUTER: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
  UNISWAP_V2_FACTORY: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
  PAIR_INIT_HASH: ethers.utils.hexlify("0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5"),
  STABLE_TOKEN: BUSD,
  W_BTC_TOKEN: BTCB,
  ALGEBRA_SWAP_ROUTER: "0x327Dd3208f0bCF590A66110aCB6e5e6941A4EfA0",
  SOLIDLY_SWAP_ROUTER: "0xd4ae6eCA985340Dd434D38F470aCCce4DC78D109",
};

export default chainAddresses;
