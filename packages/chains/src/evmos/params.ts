import { assetSymbols, ChainParams } from "@ionicprotocol/types";
import { BigNumber } from "ethers";

import chainAddresses from "./addresses";

const specificParams: ChainParams = {
  // 1.8 seconds block time
  blocksPerYear: BigNumber.from((33 * 24 * 365 * 60).toString()),
  cgId: "evmos",
  metadata: {
    chainIdHex: "0x2329",
    name: "Evmos Mainnet",
    shortName: "EVMOS",
    img: "https://d1912tcoux65lj.cloudfront.net/network/evmos.png",
    rpcUrls: {
      default: { http: ["https://evmos.api.onfinality.io/public"] },
      public: { http: ["https://evmos.api.onfinality.io/public"] },
    },
    blockExplorerUrls: { default: { name: "Evmos", url: "https://escan.live" } },
    nativeCurrency: {
      symbol: "EVMOS",
      name: "EVMOS",
    },
    wrappedNativeCurrency: {
      name: "Wrapped EVMOS",
      symbol: assetSymbols.WEVMOS,
      address: chainAddresses.W_TOKEN,
      decimals: 18,
      color: "#000",
      overlayTextColor: "#fff",
      logoURL: "https://d1912tcoux65lj.cloudfront.net/network/evmos.png",
    },
    testnet: false,
  },
};

export default specificParams;
