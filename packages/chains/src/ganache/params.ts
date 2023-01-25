import { assetSymbols, ChainParams } from "@midas-capital/types";
import { BigNumber } from "ethers";

import chainAddresses from "./addresses";

const specificParams: ChainParams = {
  blocksPerYear: BigNumber.from((5 * 24 * 365 * 60).toString()),
  cgId: "ethereum",
  metadata: {
    chainIdHex: "0x539",
    name: "Ganache",
    shortName: "Ganache",
    img: "https://d1912tcoux65lj.cloudfront.net/network/hardhat.png",
    rpcUrls: { default: { http: ["http://localhost:8545"] }, public: { http: ["http://localhost:8545"] } },
    blockExplorerUrls: { default: { name: "Etherscan", url: "http://localhost:3000" } },
    nativeCurrency: {
      symbol: "ETH",
      name: "Ganache",
    },
    wrappedNativeCurrency: {
      symbol: assetSymbols.WETH,
      address: chainAddresses.W_TOKEN,
      name: "Ganache",
      decimals: 18,
      color: "#627EEA",
      overlayTextColor: "#fff",
      logoURL: "https://d1912tcoux65lj.cloudfront.net/network/hardhat.png",
    },
    testnet: true,
  },
};

export default specificParams;
