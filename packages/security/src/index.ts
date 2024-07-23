import { chainIdToConfig } from "@ionicprotocol/chains";
import { ChainConfig } from "@ionicprotocol/types";
import { PublicClient } from "viem";

import { withErc4626StrategyScorer } from "./strategy";

export { STRATEGY_HELP } from "./enums";
export type GConstructor<T> = new (...args: any[]) => T;
export type SecurityBaseConstructor = GConstructor<SecurityBase>;

export class SecurityBase {
  chainConfig: ChainConfig;
  publicClient: PublicClient;

  constructor(chainId: number, publicClient: PublicClient) {
    this.chainConfig = chainIdToConfig[chainId];
    this.publicClient = publicClient;
  }
}

const SecurityBaseWithModules = withErc4626StrategyScorer(SecurityBase);
export default class Security extends SecurityBaseWithModules {}
