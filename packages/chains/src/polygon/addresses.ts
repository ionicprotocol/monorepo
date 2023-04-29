import { assetSymbols, ChainAddresses, underlying } from "@midas-capital/types";
import { ethers } from "ethers";

import { assets } from "./assets";

const chainAddresses: ChainAddresses = {
  W_TOKEN: underlying(assets, assetSymbols.WMATIC),
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0",
  UNISWAP_V2_ROUTER: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
  UNISWAP_V2_FACTORY: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
  UNISWAP_V3_ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
  PAIR_INIT_HASH: ethers.utils.hexlify("0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f"),
  STABLE_TOKEN: underlying(assets, assetSymbols.USDC),
  W_BTC_TOKEN: underlying(assets, assetSymbols.WBTC),
  ALGEBRA_SWAP_ROUTER: "0xf5b509bB0909a69B1c207E495f687a596C168E12",
};

export default chainAddresses;
