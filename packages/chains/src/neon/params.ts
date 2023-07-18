import { assetSymbols, ChainParams } from "@ionicprotocol/types";
import { BigNumber } from "ethers";

const specificParams: ChainParams = {
  blocksPerYear: BigNumber.from((5 * 24 * 365 * 60).toString()),
  cgId: "neon",
  metadata: {
    chainIdHex: "0xE9AC0CE",
    name: "Neon",
    shortName: "Neon",
    img: "https://d1912tcoux65lj.cloudfront.net/network/neon.jpg",
    rpcUrls: {
      default: { http: ["https://neon-proxy-mainnet.solana.p2p.org"] },
      public: { http: ["https://neon-proxy-mainnet.solana.p2p.org"] },
    },
    blockExplorerUrls: {
      default: { name: "NeonScan", url: "https://neonscan.org" },
      public: { name: "NeonScan", url: "https://neonscan.org" },
    },
    nativeCurrency: {
      symbol: "NEON",
      name: "Neon Devnet",
    },
    wrappedNativeCurrency: {
      symbol: assetSymbols.WNEON,
      address: "",
      name: "Neon",
      decimals: 18,
      color: "#627EEA",
      overlayTextColor: "#fff",
      logoURL: "https://d1912tcoux65lj.cloudfront.net/network/neon.jpg",
    },
    testnet: true,
  },
};

export default specificParams;
