import { assetSymbols, ChainParams } from "@midas-capital/types";
import { BigNumber } from "ethers";

import chainAddresses from "./addresses";

const specificParams: ChainParams = {
  blocksPerYear: BigNumber.from((4 * 24 * 365 * 60).toString()),
  cgId: "ethereum",
  metadata: {
    chainIdHex: "0xA4B1",
    name: "Arbitrum One",
    shortName: "Arbitrum",
    uniswapV3Fee: 3000,
    img: "https://d1912tcoux65lj.cloudfront.net/network/arbitrum.jpg",
    blockExplorerUrls: { default: { name: "arbiscan", url: "https://arbiscan.com" } },
    rpcUrls: { default: "https://rpc.ankr.com/arbitrum" },
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
