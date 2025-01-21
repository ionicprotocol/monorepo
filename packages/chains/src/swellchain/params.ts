import { assetSymbols, ChainParams } from "@ionicprotocol/types";
import { Address } from "viem";

import chainAddresses from "./addresses";

const specificParams: ChainParams = {
  blocksPerYear: BigInt(30 * 60 * 24 * 365), // 30 blocks per minute = 2 sec block time
  cgId: "ethereum",
  metadata: {
    chainIdHex: "0x783",
    name: "Swellchain",
    shortName: "Swell",
    uniswapV3Fees: {},
    img: "https://worldcoin-company-website.cdn.prismic.io/worldcoin-company-website/ZxFd_IF3NbkBXsKH_World_logo-01-4-.svg?w=1024",
    blockExplorerUrls: {
      default: { name: "swellchainexplorer", url: "https://explorer.swellnetwork.io/" }
    },
    rpcUrls: {
      default: {
        http: ["https://rpc.ankr.com/swell", "https://swell-mainnet.alt.technology"]
      },
      public: {
        http: ["https://rpc.ankr.com/swell", "https://swell-mainnet.alt.technology"]
      }
    },
    nativeCurrency: {
      symbol: "ETH",
      name: "ETH"
    },
    wrappedNativeCurrency: {
      symbol: assetSymbols.WETH,
      address: chainAddresses.W_TOKEN as Address,
      name: "WETH",
      decimals: 18,
      color: "#7A88A1",
      overlayTextColor: "#fff",
      logoURL: "https://d1912tcoux65lj.cloudfront.net/network/ethereum.png"
    }
  }
};

export default specificParams;
