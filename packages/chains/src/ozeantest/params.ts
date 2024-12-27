import { assetSymbols, ChainParams } from "@ionicprotocol/types";
import { Address } from "viem";

import chainAddresses from "./addresses";

const specificParams: ChainParams = {
  blocksPerYear: BigInt(30 * 60 * 24 * 365), // 30 blocks per minute = 2 sec block time
  cgId: "ethereum",
  metadata: {
    chainIdHex: "0x50237",
    name: "Ozean Testnet",
    shortName: "OzeanTest",
    uniswapV3Fees: {},
    img: "",
    blockExplorerUrls: {
      default: { name: "ozeantestexplorer", url: "https://ozean-l2.explorer.caldera.xyz/" }
    },
    rpcUrls: {
      default: {
        http: ["https://ozean-testnet.rpc.caldera.xyz/http"]
      },
      public: {
        http: ["https://ozean-testnet.rpc.caldera.xyz/http"]
      }
    },
    nativeCurrency: {
      symbol: "ETH",
      name: "ETH"
    },
    wrappedNativeCurrency: {
      symbol: assetSymbols.WUSDX,
      address: chainAddresses.W_TOKEN as Address,
      name: "WUSDX",
      decimals: 18,
      color: "#7A88A1",
      overlayTextColor: "#fff",
      logoURL: "https://d1912tcoux65lj.cloudfront.net/network/ethereum.png"
    }
  }
};

export default specificParams;
