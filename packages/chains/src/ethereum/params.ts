import { assetSymbols, ChainParams } from "@ionicprotocol/types";
import { BigNumber } from "ethers";

import chainAddresses from "./addresses";
import assets from "./assets";

const specificParams: ChainParams = {
  blocksPerYear: BigNumber.from((5 * 24 * 365 * 60).toString()),
  cgId: "ethereum",
  metadata: {
    chainIdHex: "0x1",
    name: "Ethereum Mainnet",
    shortName: "Ethereum",
    uniswapV3Fees: {},
    img: "https://d1912tcoux65lj.cloudfront.net/network/ethereum.png",
    blockExplorerUrls: { default: { name: "etherscan", url: "https://etherscan.io" } },
    rpcUrls: {
      default: { http: ["https://rpc.ankr.com/eth"] },
      public: { http: ["https://rpc.ankr.com/eth"] }
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
