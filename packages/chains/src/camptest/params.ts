import { assetSymbols, ChainParams } from "@ionicprotocol/types";
import { Address } from "viem";

import chainAddresses from "./addresses";

const specificParams: ChainParams = {
  blocksPerYear: BigInt(30 * 60 * 24 * 365), // 30 blocks per minute = 2 sec block time
  cgId: "ethereum",
  metadata: {
    chainIdHex: "0x4f588",
    name: "Camp Network Testnet V2",
    shortName: "Camp Testnet",
    uniswapV3Fees: {},
    img: "",
    blockExplorerUrls: {
      default: { name: "camptestnetexplorer", url: "https://camp-network-testnet.blockscout.com/" }
    },
    rpcUrls: {
      default: {
        http: ["https://rpc-campnetwork.xyz"]
      },
      public: {
        http: ["https://rpc-campnetwork.xyz"]
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
