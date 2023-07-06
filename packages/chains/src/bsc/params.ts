import { ChainParams } from "@ionicprotocol/types";
import { BigNumber } from "ethers";

import { WBNB } from "./assets";

const specificParams: ChainParams = {
  blocksPerYear: BigNumber.from((20 * 24 * 365 * 60).toString()),
  cgId: "binancecoin",
  metadata: {
    chainIdHex: "0x38",
    name: "Binance Smart Chain",
    shortName: "BNB",
    img: "https://d1912tcoux65lj.cloudfront.net/network/bsc.jpg",
    blockExplorerUrls: { default: { name: "BnbScan", url: "https://bscscan.com" } },
    rpcUrls: {
      default: { http: ["https://bsc-dataseed.binance.org/"] },
      public: { http: ["https://bsc-dataseed.binance.org/"] },
    },
    nativeCurrency: {
      symbol: "BNB",
      name: "BNB",
    },
    wrappedNativeCurrency: {
      symbol: "WBNB",
      address: WBNB,
      name: "BNB",
      decimals: 18,
      color: "#627EEA",
      overlayTextColor: "#fff",
      logoURL: "https://d1912tcoux65lj.cloudfront.net/network/bsc.jpg",
    },
  },
};

export default specificParams;
