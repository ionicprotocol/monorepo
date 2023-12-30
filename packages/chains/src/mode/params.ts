import { assetSymbols, ChainParams } from "@ionicprotocol/types";
import { BigNumber } from "ethers";

import chainAddresses from "./addresses";

const specificParams: ChainParams = {
  blocksPerYear: BigNumber.from((30 * 60 * 24 * 365).toString()), // 30 blocks per minute = 2 sec block time
  cgId: "ethereum",
  metadata: {
    chainIdHex: "0x868B",
    name: "Mode Mainnet",
    shortName: "Mode",
    uniswapV3Fees: {},
    img: "https://1430441113-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FmOUA87dDndFyiETJjxpf%2Ficon%2FzSRXk7tkG8rWFi6tG9wV%2FIYXD4bdy_400x400.jpg?alt=media",
    blockExplorerUrls: { default: { name: "modeexplorer", url: "https://explorer.mode.network/" } },
    rpcUrls: {
      default: { http: ["https://mainnet.mode.network/"] },
      public: { http: ["https://mainnet.mode.network/"] }
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
