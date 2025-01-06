import { assetSymbols, ChainParams } from "@ionicprotocol/types";
import { Address } from "viem";

import chainAddresses from "./addresses";

const specificParams: ChainParams = {
  blocksPerYear: BigInt(30 * 60 * 24 * 365), // 30 blocks per minute = 2 sec block time
  cgId: "ethereum",
  metadata: {
    chainIdHex: "0x74c",
    name: "Soneium",
    shortName: "Soneium",
    uniswapV3Fees: {},
    img: "https://worldcoin-company-website.cdn.prismic.io/worldcoin-company-website/ZxFd_IF3NbkBXsKH_World_logo-01-4-.svg?w=1024",
    blockExplorerUrls: {
      default: { name: "soneiumexplorer", url: "https://xckc3jvrzboyo8w4.blockscout.com/" }
    },
    rpcUrls: {
      default: {
        http: ["https://soneium.rpc.scs.startale.com?apikey=hnUFGYMhADAQ3hFfZ6zIjEbKb6KjoBAq"]
      },
      public: {
        http: ["https://soneium.rpc.scs.startale.com?apikey=hnUFGYMhADAQ3hFfZ6zIjEbKb6KjoBAq"]
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
