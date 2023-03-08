import { assetSymbols, ChainParams } from "@midas-capital/types";
import { BigNumber } from "ethers";

const specificParams: ChainParams = {
  // ~ 2 seconds per block
  blocksPerYear: BigNumber.from((30 * 24 * 365 * 60).toString()),
  cgId: "ethereum",
  metadata: {
    chainIdHex: "0x14A33",
    name: "Base Goerli",
    shortName: "Base Goerli",
    img: "https://d1912tcoux65lj.cloudfront.net/network/base-goerli-testnet.png",
    rpcUrls: {
      default: { http: ["https://goerli.base.org/"] },
      public: { http: ["https://goerli.base.org/"] },
    },
    blockExplorerUrls: {
      default: { name: "BaseScan", url: "https://goerli.basescan.org" },
      public: { name: "BaseScan", url: "https://goerli.basescan.org" },
    },
    nativeCurrency: {
      symbol: "ETH",
      name: "Base Goerli",
    },
    wrappedNativeCurrency: {
      symbol: assetSymbols.WETH,
      address: "0x44D627f900da8AdaC7561bD73aA745F132450798",
      name: "Base Goerli",
      decimals: 18,
      color: "#627EEA",
      overlayTextColor: "#fff",
      logoURL: "https://d1912tcoux65lj.cloudfront.net/network/base-goerli-testnet.png",
    },
    testnet: true,
  },
};

export default specificParams;
