import { assetSymbols, ChainParams } from "@ionicprotocol/types";
import { Address } from "viem";

import chainAddresses from "./addresses";

const specificParams: ChainParams = {
  blocksPerYear: BigInt(30 * 60 * 24 * 365), // 30 blocks per minute = 2 sec block time
  cgId: "ethereum",
  metadata: {
    chainIdHex: "0xed88",
    name: "Build On Bitcoin",
    shortName: "BOB",
    uniswapV3Fees: {},
    img: "https://icons.llamao.fi/icons/chains/rsz_bob.jpg",
    blockExplorerUrls: { default: { name: "bobexplorer", url: "https://explorer.gobob.xyz" } },
    rpcUrls: {
      default: { http: ["https://rpc.gobob.xyz"] },
      public: { http: ["https://rpc.gobob.xyz"] }
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
