import { assetSymbols, ChainParams } from "@ionicprotocol/types";
import { Address } from "viem";

import chainAddresses from "./addresses";

const specificParams: ChainParams = {
  blocksPerYear: BigInt(30 * 60 * 24 * 365), // 30 blocks per minute = 2 sec block time
  cgId: "ethereum",
  metadata: {
    chainIdHex: "0x14d2",
    name: "Superseed",
    shortName: "Superseed",
    uniswapV3Fees: {},
    img: "https://raw.githubusercontent.com/superseed-xyz/brand-kit/227ecaadf8da2ad9acb208428ff178a2cd345565/logos-wordmarks/logos/small-black.svg",
    blockExplorerUrls: { default: { name: "superseed", url: "https://explorer-superseed-mainnet-0.t.conduit.xyz" } },
    rpcUrls: {
      default: {
        http: ["https://mainnet.superseed.xyz"]
      },
      public: {
        http: ["https://mainnet.superseed.xyz"]
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
