import { assetSymbols, ChainParams } from "@ionicprotocol/types";
import { BigNumber } from "ethers";

import chainAddresses from "./addresses";
import assets from "./assets";

const specificParams: ChainParams = {
  blocksPerYear: BigNumber.from((5 * 24 * 365 * 60).toString()),
  cgId: "ethereum",
  metadata: {
    chainIdHex: "0xE704",
    name: "Linea Mainnet",
    shortName: "Linea",
    uniswapV3Fees: {},
    img: "https://d1912tcoux65lj.cloudfront.net/network/linea.png",
    blockExplorerUrls: { default: { name: "lineascan", url: "https://lineascan.build" } },
    rpcUrls: {
      default: { http: ["https://linea-mainnet.infura.io/v3/"] },
      public: { http: ["https://linea-mainnet.infura.io/v3/"] }
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
