import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { ChainConfig } from "@midas-capital/types";
import { Signer } from "ethers";

import { chainIdToConfig } from "./enums";
import { withChainLinkOracleScorer, withUniswapV3OracleScorer } from "./oracle";

export type GConstructor<T> = new (...args: any[]) => T;
export type SecurityBaseConstructor = GConstructor<SecurityBase>;

export type SupportedProvider = JsonRpcProvider | Web3Provider;
export type SupportedSigners = Signer;
export type SignerOrProvider = SupportedSigners | SupportedProvider;

export class SecurityBase {
  chainConfig: ChainConfig;
  provider: SignerOrProvider | null;

  constructor(chainId: number, provider: SignerOrProvider | null) {
    this.chainConfig = chainIdToConfig[chainId];
    this.provider = provider;
  }
}

const SecurityBaseWithModules = withChainLinkOracleScorer(withUniswapV3OracleScorer(SecurityBase));
export default class Security extends SecurityBaseWithModules {}
