import { assetSymbols, ChainParams } from "@ionicprotocol/types";
import { Address } from "viem";

import chainAddresses from "./addresses";

const specificParams: ChainParams = {
  blocksPerYear: BigInt(30 * 60 * 24 * 365), // 30 blocks per minute = 2 sec block time
  cgId: "ethereum",
  metadata: {
    chainIdHex: "0xdef1",
    name: "Ink",
    shortName: "Ink",
    uniswapV3Fees: {},
    img: "https://icons.llamao.fi/icons/chains/rsz_lisk.jpg",
    blockExplorerUrls: { default: { name: "ink", url: "https://explorer.inkonchain.com/" } },
    rpcUrls: {
      default: {
        http: ["https://rpc-gel.inkonchain.com", "https://rpc-qnd.inkonchain.com"]
      },
      public: {
        http: ["https://rpc-gel.inkonchain.com", "https://rpc-qnd.inkonchain.com"]
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
