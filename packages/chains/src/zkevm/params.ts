import { assetSymbols, ChainParams } from "@ionicprotocol/types";
import { BigNumber } from "ethers";

import chainAddresses from "./addresses";
import assets from "./assets";

const specificParams: ChainParams = {
  blocksPerYear: BigNumber.from((40 * 24 * 365 * 60).toString()),
  cgId: "ethereum",
  metadata: {
    chainIdHex: "0x44D",
    name: "Polygon zkEVM",
    shortName: "zkEVM",
    uniswapV3Fees: {},
    img: "https://d1912tcoux65lj.cloudfront.net/network/polygon_zkevm.png",
    blockExplorerUrls: { default: { name: "polygonscan", url: "https://zkevm.polygonscan.com" } },
    rpcUrls: {
      default: { http: ["https://zkevm-rpc.com"] },
      public: { http: ["https://zkevm-rpc.com"] }
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
      logoURL: "https://d1912tcoux65lj.cloudfront.net/network/polygon_zkevm.png"
    }
  }
};

export default specificParams;
