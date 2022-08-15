import { assetSymbols, ChainParams } from "@midas-capital/types";
import { BigNumber } from "ethers";

import chainAddresses from "./addresses";

const specificParams: ChainParams = {
  blocksPerYear: BigNumber.from((10 * 24 * 365 * 60).toString()),
  cgId: "evmos",
  metadata: {
    chainIdHex: "0x2328",
    name: "Evmos Testnet",
    shortName: "Evmos Testnet",
    img: "/images/evmos.png",
    rpcUrls: { default: "https://eth.bd.evmos.dev:8545" },
    blockExplorerUrls: { default: { name: "Evmos", url: "https://evm.evmos.dev" } },
    nativeCurrency: {
      symbol: "EVMOS",
      name: "EVMOS",
    },
    wrappedNativeCurrency: {
      name: "Wrapped EVMOS",
      symbol: assetSymbols.WBNB,
      address: chainAddresses.W_TOKEN,
      decimals: 18,
      color: "#000",
      overlayTextColor: "#fff",
      logoURL: "/images/evmos.png",
    },
    testnet: true,
  },
};

export default specificParams;
