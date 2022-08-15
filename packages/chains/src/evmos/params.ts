import { ChainParams } from "@midas-capital/types";
import { BigNumber } from "ethers";

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
      symbol: "WEVMOS",
      decimals: 18,
      address: "0xA30404AFB4c43D25542687BCF4367F59cc77b5d2",
      color: "#000",
      overlayTextColor: "#fff",
      logoURL: "/images/evmos.png",
    },
    testnet: true,
  },
};

export default specificParams;
