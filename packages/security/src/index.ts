import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { chainIdToConfig } from "@midas-capital/chains";
import { ChainConfig } from "@midas-capital/types";
import { Signer } from "ethers";

import { withChainLinkOracleScorer, withUniswapV3OracleScorer } from "./oracle";
import { withErc4626StrategyScorer } from "./strategy";

export { STRATEGY_HELP } from "./enums";
export type GConstructor<T> = new (...args: any[]) => T;
export type SecurityBaseConstructor = GConstructor<SecurityBase>;

export type SupportedProvider = JsonRpcProvider | Web3Provider;
export type SupportedSigners = Signer;
export type SignerOrProvider = SupportedSigners | SupportedProvider;

export class SecurityBase {
  chainConfig: ChainConfig;
  provider: SignerOrProvider;

  constructor(chainId: number, provider: SignerOrProvider) {
    this.chainConfig = chainIdToConfig[chainId];
    this.provider = provider;
  }
}

const SecurityBaseWithModules = withErc4626StrategyScorer(SecurityBase);
export default class Security extends SecurityBaseWithModules {}
