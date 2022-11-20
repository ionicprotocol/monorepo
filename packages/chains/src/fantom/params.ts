import { assetSymbols, ChainParams } from "@midas-capital/types";
import { BigNumber } from "ethers";

import chainAddresses from "./addresses";

const specificParams: ChainParams = {
  // ~ 1.5 seconds per block: https://ftmscan.com/chart/blocktime
  blocksPerYear: BigNumber.from((40 * 24 * 365 * 60).toString()),
  cgId: "fantom",
  metadata: {
    chainIdHex: "0xFA",
    name: "Fantom Opera",
    shortName: "Fantom",
    img: "https://d1912tcoux65lj.cloudfront.net/network/fantom.jpg",
    blockExplorerUrls: { default: { name: "ftmscan", url: "https://ftmscan.com" } },
    rpcUrls: { default: "https://rpcapi.fantom.network" },
    nativeCurrency: {
      symbol: "FTM",
      name: "FTM",
    },
    wrappedNativeCurrency: {
      symbol: assetSymbols.WFTM,
      address: chainAddresses.W_TOKEN,
      name: "WFTM",
      decimals: 18,
      color: "#7A88A1",
      overlayTextColor: "#fff",
      logoURL: "https://d1912tcoux65lj.cloudfront.net/network/fantom.jpg",
    },
  },
};

export default specificParams;
