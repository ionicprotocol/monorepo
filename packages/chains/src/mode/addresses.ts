import { assetSymbols, ChainAddresses, underlying } from "@ionicprotocol/types";
import { ethers } from "ethers";

import { assets } from "./assets";

const chainAddresses: ChainAddresses = {
  PAIR_INIT_HASH: "", // TODO is this used anywhere?
  STABLE_TOKEN: underlying(assets, assetSymbols.USDC),
  UNISWAP_V2_ROUTER: "0x5D61c537393cf21893BE619E36fC94cd73C77DD3",
  UNISWAP_V2_FACTORY: "0xc02155946dd8c89d3d3238a6c8a64d04e2cd4500",
  UNISWAP_V3: {
    FACTORY: "0xC33Ce0058004d44E7e1F366E5797A578fDF38584",
    PAIR_INIT_HASH: "0x3e03ddab0aa29c12c46cd283f9cf8c6800eb7ea3c6530a382474bac82333f2e0",
    QUOTER_V2: "0x7Fd569b2021850fbA53887dd07736010aCBFc787"
  },
  UNISWAP_V3_ROUTER: "0xC9Adff795f46105E53be9bbf14221b1C9919EE25",
  W_BTC_TOKEN: underlying(assets, assetSymbols.WBTC),
  W_TOKEN: underlying(assets, assetSymbols.WETH),
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: ethers.constants.AddressZero
};

export default chainAddresses;
