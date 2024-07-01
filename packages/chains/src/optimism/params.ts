import { assetSymbols, ChainParams } from "@ionicprotocol/types";
import { BigNumber } from "ethers";

import chainAddresses from "./addresses";

const specificParams: ChainParams = {
  blocksPerYear: BigNumber.from((30 * 60 * 24 * 365).toString()), // 30 blocks per minute = 2 sec block time
  cgId: "ethereum",
  metadata: {
    chainIdHex: "0xa",
    name: "Optimism Mainnet",
    shortName: "Optimism",
    uniswapV3Fees: {},
    img: "https://icons.llamao.fi/icons/chains/rsz_optimism.jpg",
    blockExplorerUrls: { default: { name: "optimism etherscan", url: "https://optimistic.etherscan.io/" } },
    rpcUrls: {
      default: { http: ["https://mainnet.optimism.io"] },
      public: { http: ["https://mainnet.optimism.io"] }
    },
    nativeCurrency: {
      symbol: "ETH",
      name: "ETH"
    },
    wrappedNativeCurrency: {
      symbol: assetSymbols.WETH,
      address: chainAddresses.W_TOKEN,
      name: "WETH",
      decimals: 18,
      color: "#7A88A1",
      overlayTextColor: "#fff",
      logoURL: "https://d1912tcoux65lj.cloudfront.net/network/ethereum.png"
    }
  }
};

export default specificParams;
