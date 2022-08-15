import { assetSymbols, ChainParams } from "@midas-capital/types";
import { BigNumber } from "ethers";

import assets from "./assets";

const specificParams: ChainParams = {
  blocksPerYear: BigNumber.from((5 * 24 * 365 * 60).toString()),
  cgId: "moonbeam",
  metadata: {
    chainIdHex: "0x504",
    name: "Moonbeam",
    shortName: "Moonbeam",
    img: "https://raw.githubusercontent.com/sushiswap/icons/master/network/moonbeam.jpg",
    blockExplorerUrls: { default: { name: "Moonbeam", url: "https://moonscan.io/" } },
    rpcUrls: { default: "https://rpc.api.moonbeam.network" },
    nativeCurrency: {
      symbol: "GLMR",
      name: "Moonbeam",
    },
    wrappedNativeCurrency: {
      symbol: assetSymbols.WGLMR,
      address: assets.find((a) => a.symbol === assetSymbols.WGLMR)!.underlying,
      name: "Moonbeam",
      decimals: 18,
      color: "#627EEA",
      overlayTextColor: "#fff",
      logoURL: "https://raw.githubusercontent.com/sushiswap/icons/master/network/moonbeam.jpg",
    },
  },
};

export default specificParams;
