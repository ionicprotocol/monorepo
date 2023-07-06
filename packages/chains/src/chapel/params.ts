import { assetSymbols, ChainParams } from "@ionicprotocol/types";
import { BigNumber } from "ethers";

import chainAddresses from "./addresses";

const specificParams: ChainParams = {
  blocksPerYear: BigNumber.from((20 * 24 * 365 * 60).toString()),
  cgId: "binancecoin-chapel",
  metadata: {
    chainIdHex: "0x61",
    name: "BSC Testnet (Chapel)",
    shortName: "BSC Testnet",
    img: "https://d1912tcoux65lj.cloudfront.net/network/chapel.jpg",
    rpcUrls: {
      default: { http: ["https://data-seed-prebsc-1-s1.binance.org:8545/"] },
      public: { http: ["https://data-seed-prebsc-1-s1.binance.org:8545/"] },
    },
    blockExplorerUrls: { default: { name: "BscScan(Testnet)", url: "https://testnet.bscscan.com" } },
    nativeCurrency: {
      symbol: "BNB",
      name: "BSC",
    },
    wrappedNativeCurrency: {
      symbol: assetSymbols.WBNB,
      address: chainAddresses.W_TOKEN,
      name: "BSC",
      decimals: 18,
      color: "#627EEA",
      overlayTextColor: "#fff",
      logoURL: "https://d1912tcoux65lj.cloudfront.net/network/chapel.jpg",
    },
    testnet: true,
  },
};

export default specificParams;
