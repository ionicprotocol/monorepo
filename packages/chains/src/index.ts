import { ChainConfig } from "@ionicprotocol/types";
import {
  Chain,
  base as vBase,
  bob as vBob,
  fraxtal as vFraxtal,
  lisk as vLisk,
  metalL2 as vMetal,
  mode as vMode,
  optimism as vOptimism,
  superseed as vSuperseed,
  worldchain as vWorldchain
} from "viem/chains";

import { default as base } from "./base";
import { default as bob } from "./bob";
import { default as camptest } from "./camptest";
import { default as fraxtal } from "./fraxtal";
import { default as ink } from "./ink";
import { default as lisk } from "./lisk";
import { default as metalL2 } from "./metalL2";
import { default as mode } from "./mode";
import { default as optimism } from "./optimism";
import { default as ozeantest } from "./ozeantest";
import { default as soneium } from "./soneium";
import { default as superseed } from "./superseed";
import { default as swellchain } from "./swellchain";
import { default as worldchain } from "./worldchain";

export {
  base,
  bob,
  lisk,
  mode,
  optimism,
  fraxtal,
  superseed,
  worldchain,
  ink,
  swellchain,
  soneium,
  camptest,
  ozeantest,
  metalL2
};

export const vInk: Chain = {
  id: 57073,
  name: "Ink",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: { default: { http: ["https://rpc-qnd.inkonchain.com", "https://rpc-gel.inkonchain.com"] } }
};

export const vSwellchain: Chain = {
  id: 1923,
  name: "Swellchain",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: { default: { http: ["https://rpc.ankr.com/swell", "https://swell-mainnet.alt.technology"] } }
};

export const vSoneium: Chain = {
  id: 1868,
  name: "Soneium",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: { default: { http: ["https://soneium.rpc.scs.startale.com?apikey=hnUFGYMhADAQ3hFfZ6zIjEbKb6KjoBAq"] } }
};

export const vOzeantest: Chain = {
  id: 7849306,
  name: "Ozean Testnet",
  nativeCurrency: {
    name: "USDX",
    symbol: "USDX",
    decimals: 18
  },
  rpcUrls: { default: { http: ["https://ozean-testnet.rpc.caldera.xyz/http"] } }
};

export const vCampTest: Chain = {
  id: 325000,
  name: "Camp Network Testnet V2",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: { default: { http: ["https://rpc-campnetwork.xyz"] } }
};

export const chainIdtoChain: { [chainId: number]: Chain } = {
  [mode.chainId]: vMode,
  [base.chainId]: vBase,
  [optimism.chainId]: vOptimism,
  [bob.chainId]: vBob,
  [fraxtal.chainId]: vFraxtal,
  [lisk.chainId]: vLisk,
  [ink.chainId]: vInk,
  [superseed.chainId]: vSuperseed,
  [worldchain.chainId]: vWorldchain,
  [swellchain.chainId]: vSwellchain,
  [ozeantest.chainId]: vOzeantest,
  [camptest.chainId]: vCampTest,
  [soneium.chainId]: vSoneium,
  [metalL2.chainId]: vMetal
};

export const chainIdToConfig: { [chainId: number]: ChainConfig } = {
  [mode.chainId]: mode,
  [base.chainId]: base,
  [optimism.chainId]: optimism,
  [bob.chainId]: bob,
  [fraxtal.chainId]: fraxtal,
  [lisk.chainId]: lisk,
  [ink.chainId]: ink,
  [superseed.chainId]: superseed,
  [worldchain.chainId]: worldchain,
  [swellchain.chainId]: swellchain,
  [ozeantest.chainId]: ozeantest,
  [camptest.chainId]: camptest,
  [soneium.chainId]: soneium,
  [metalL2.chainId]: metalL2
};
