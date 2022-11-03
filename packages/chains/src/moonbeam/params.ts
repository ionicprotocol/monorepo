import { assetSymbols, ChainParams } from "@midas-capital/types";
import { BigNumber } from "ethers";

import chainAddresses from "./addresses";

const specificParams: ChainParams = {
  blocksPerYear: BigNumber.from((5 * 24 * 365 * 60).toString()),
  cgId: "moonbeam",
  metadata: {
    chainIdHex: "0x504",
    name: "Moonbeam",
    shortName: "Moonbeam",
    img: "https://d1912tcoux65lj.cloudfront.net/network/moonbeam.jpg",
    blockExplorerUrls: { default: { name: "Moonbeam", url: "https://moonscan.io" } },
    rpcUrls: { default: "https://rpc.api.moonbeam.network" },
    nativeCurrency: {
      symbol: "GLMR",
      name: "Moonbeam",
    },
    wrappedNativeCurrency: {
      symbol: assetSymbols.WGLMR,
      address: chainAddresses.W_TOKEN,
      name: "Moonbeam",
      decimals: 18,
      color: "#627EEA",
      overlayTextColor: "#fff",
      logoURL: "https://d1912tcoux65lj.cloudfront.net/network/moonbeam.jpg",
    },
  },
};

export default specificParams;
