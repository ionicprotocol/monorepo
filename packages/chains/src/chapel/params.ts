import { assetSymbols, ChainParams } from "@midas-capital/types";
import { BigNumber } from "ethers";

import assets from "./assets";

const specificParams: ChainParams = {
  blocksPerYear: BigNumber.from((20 * 24 * 365 * 60).toString()),
  cgId: "binancecoin",
  metadata: {
    chainIdHex: "0x61",
    name: "BSC Testnet (Chapel)",
    shortName: "BSC Testnet",
    img: "https://raw.githubusercontent.com/sushiswap/icons/master/network/bsc.jpg",
    rpcUrls: { default: "https://data-seed-prebsc-1-s1.binance.org:8545/" },
    blockExplorerUrls: { default: { name: "BscScan(Testnet)", url: "https://testnet.bscscan.com" } },
    nativeCurrency: {
      symbol: "BNB",
      name: "BSC",
    },
    wrappedNativeCurrency: {
      symbol: "WBNB",
      address: assets.find((a) => a.symbol === assetSymbols.WBNB)!.underlying,
      name: "BSC",
      decimals: 18,
      color: "#627EEA",
      overlayTextColor: "#fff",
      logoURL: "https://raw.githubusercontent.com/sushiswap/icons/master/network/bsc.jpg",
    },
    testnet: true,
  },
};

export default specificParams;
