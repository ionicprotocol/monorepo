import { assetSymbols, ChainParams } from "@ionicprotocol/types";
import { Address } from "viem";

import chainAddresses from "./addresses";

const specificParams: ChainParams = {
  blocksPerYear: BigInt(30 * 60 * 24 * 365), // 30 blocks per minute = 2 sec block time
  cgId: "ethereum",
  metadata: {
    chainIdHex: "0x2105",
    name: "Base Mainnet",
    shortName: "Base",
    uniswapV3Fees: {},
    img: "https://icons.llamao.fi/icons/chains/rsz_base.jpg",
    blockExplorerUrls: { default: { name: "basescan", url: "https://basescan.org/" } },
    rpcUrls: {
      default: {
        http: [
          "https://rpc.ankr.com/base/5f29692f7dd10adfd399569824ee3168c7b0c055ceea0ba9075d7f926bd49fd7",
          "https://mainnet.base.org",
          "https://base.llamarpc.com",
          "https://base-rpc.publicnode.com",
          "https://gateway.tenderly.co/public/base",
          "https://base.meowrpc.com",
          "https://base-mainnet.public.blastapi.io"
        ]
      },
      public: {
        http: [
          "https://mainnet.base.org",
          "https://base.llamarpc.com",
          "https://base-rpc.publicnode.com",
          "https://gateway.tenderly.co/public/base",
          "https://base.meowrpc.com",
          "https://base-mainnet.public.blastapi.io"
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
