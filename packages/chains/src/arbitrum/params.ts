import { assetSymbols, ChainParams, underlying } from "@midas-capital/types";
import { BigNumber } from "ethers";

import chainAddresses from "./addresses";
import assets from "./assets";

const specificParams: ChainParams = {
  blocksPerYear: BigNumber.from((4 * 24 * 365 * 60).toString()),
  cgId: "ethereum",
  metadata: {
    chainIdHex: "0xA4B1",
    name: "Arbitrum One",
    shortName: "Arbitrum",
    uniswapV3Fees: {
      [underlying(assets, assetSymbols.USDC)]: {
        [underlying(assets, assetSymbols.GMX)]: 3000,
      },
    },
    img: "https://d1912tcoux65lj.cloudfront.net/network/arbitrum.jpg",
    blockExplorerUrls: { default: { name: "arbiscan", url: "https://arbiscan.io" } },
    rpcUrls: { default: { http: ["https://rpc.ankr.com/arbitrum"] } },
    nativeCurrency: {
      symbol: "ETH",
      name: "ETH",
    },
    wrappedNativeCurrency: {
      symbol: assetSymbols.WETH,
      address: chainAddresses.W_TOKEN,
      name: "WETH",
      decimals: 18,
      color: "#7A88A1",
      overlayTextColor: "#fff",
      logoURL: "https://d1912tcoux65lj.cloudfront.net/network/arbitrum.jpg",
    },
  },
};

export default specificParams;
