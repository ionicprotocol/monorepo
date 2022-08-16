import { ChainParams } from "@midas-capital/types";
import { BigNumber } from "ethers";

import chainAddresses from "./addresses";

const specificParams: ChainParams = {
  blocksPerYear: BigNumber.from((20 * 24 * 365 * 60).toString()),
  cgId: "binancecoin",
  metadata: {
    chainIdHex: "0x38",
    name: "Binance Smart Chain",
    shortName: "BSC",
    img: "https://raw.githubusercontent.com/sushiswap/icons/master/network/bsc.jpg",
    blockExplorerUrls: { default: { name: "BscScan", url: "https://bscscan.com" } },
    rpcUrls: { default: "https://bsc-dataseed.binance.org/" },
    nativeCurrency: {
      symbol: "BNB",
      name: "BSC",
    },
    wrappedNativeCurrency: {
      symbol: "WBNB",
      address: chainAddresses.W_TOKEN,
      name: "BSC",
      decimals: 18,
      color: "#627EEA",
      overlayTextColor: "#fff",
      logoURL: "https://raw.githubusercontent.com/sushiswap/icons/master/network/bsc.jpg",
    },
  },
};

export default specificParams;
