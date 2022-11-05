import { assetSymbols, ChainParams, underlying } from "@midas-capital/types";
import { BigNumber } from "ethers";

import chainAddresses from "./addresses";
import assets from "./assets";

const specificParams: ChainParams = {
  blocksPerYear: BigNumber.from((26 * 24 * 365 * 60).toString()),
  cgId: "matic-network",
  metadata: {
    chainIdHex: "0x89",
    name: "Polygon Mainnet",
    shortName: "Polygon",
    uniswapV3Fees: {
      [underlying(assets, assetSymbols.USDC)]: {
        [underlying(assets, assetSymbols.PAR)]: 500,
      }
    },
    img: "https://d1912tcoux65lj.cloudfront.net/network/polygon.jpg",
    blockExplorerUrls: { default: { name: "polygonscan", url: "https://polygonscan.com" } },
    rpcUrls: { default: "https://rpc.ankr.com/polygon" },
    nativeCurrency: {
      symbol: "MATIC",
      name: "MATIC",
    },
    wrappedNativeCurrency: {
      symbol: assetSymbols.WMATIC,
      address: chainAddresses.W_TOKEN,
      name: "WMATIC",
      decimals: 18,
      color: "#627EEA",
      overlayTextColor: "#fff",
      logoURL: "https://d1912tcoux65lj.cloudfront.net/network/polygon.jpg",
    },
  },
};

export default specificParams;
