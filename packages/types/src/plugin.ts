export enum Strategy {
  Beefy = "BeefyERC4626",
  Arrakis = "ArrakisERC4626",
  DotDot = "DotDotLpERC4626",
  Stella = "StellaLpERC4626",
  Bomb = "BombERC4626",
}

export interface PluginData {
  market: string;
  name: string;
  strategy: Strategy;
  apyDocsUrl?: string;
  strategyDocsUrl?: string;
  underlying: string;
  otherParams?: any[];
}

export type DeployedPlugins = {
  [pluginAddress: string]: PluginData;
};
