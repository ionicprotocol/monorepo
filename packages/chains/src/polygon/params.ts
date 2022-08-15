import { assetSymbols, ChainParams } from "@midas-capital/types";
import { BigNumber } from "ethers";

import assets from "./assets";

const specificParams: ChainParams = {
  blocksPerYear: BigNumber.from((26 * 24 * 365 * 60).toString()),
  cgId: "matic-network",
  metadata: {
    chainIdHex: "0x89",
    name: "Polygon Mainnet",
    shortName: "Polygon",
    img: "https://raw.githubusercontent.com/sushiswap/icons/master/network/polygon.jpg",
    blockExplorerUrls: { default: { name: "polygonscan", url: "https://polygonscan.com" } },
    rpcUrls: { default: "https://rpc-mainnet.maticvigil.com/" },
    nativeCurrency: {
      symbol: "MATIC",
      name: "MATIC",
    },
    wrappedNativeCurrency: {
      symbol: assetSymbols.WMATIC,
      address: assets.find((a) => a.symbol === assetSymbols.WMATIC)!.underlying,
      name: "WMATIC",
      decimals: 18,
      color: "#627EEA",
      overlayTextColor: "#fff",
      logoURL: "https://raw.githubusercontent.com/sushiswap/icons/master/network/polygon.jpg",
    },
  },
};

export default specificParams;
