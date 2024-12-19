import { assetSymbols, ChainParams } from "@ionicprotocol/types";
import { Address } from "viem";

import chainAddresses from "./addresses";

const specificParams: ChainParams = {
  blocksPerYear: BigInt(30 * 60 * 24 * 365), // 30 blocks per minute = 2 sec block time
  cgId: "ethereum",
  metadata: {
    chainIdHex: "0x46f",
    name: "Worldchain",
    shortName: "World",
    uniswapV3Fees: {},
    img: "https://worldcoin-company-website.cdn.prismic.io/worldcoin-company-website/ZxFd_IF3NbkBXsKH_World_logo-01-4-.svg?w=1024",
    blockExplorerUrls: {
      default: { name: "worldchainexplorer", url: "https://worldchain-mainnet.explorer.alchemy.com/" }
    },
    rpcUrls: {
      default: {
        http: [
          "https://worldchain.drpc.org",
          "https://worldchain-mainnet.g.alchemy.com/public",
          "https://worldchain-mainnet.gateway.tenderly.co",
          "https://480.rpc.thirdweb.com",
          "https://sparkling-autumn-dinghy.worldchain-mainnet.quiknode.pro"
        ]
      },
      public: {
        http: [
          "https://worldchain.drpc.org",
          "https://worldchain-mainnet.g.alchemy.com/public",
          "https://worldchain-mainnet.gateway.tenderly.co",
          "https://480.rpc.thirdweb.com",
          "https://sparkling-autumn-dinghy.worldchain-mainnet.quiknode.pro"
        ]
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
