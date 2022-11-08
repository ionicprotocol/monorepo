export enum Strategy {
  Beefy = "BeefyERC4626",
  Arrakis = "ArrakisERC4626",
  Mimo = "MimoERC4626",
  DotDot = "DotDotLpERC4626",
  Stella = "StellaLpERC4626",
  Bomb = "BombERC4626",
  CurveGauge = "CurveGaugeERC4626",
}

export interface AbstractPlugin {
  market: string;
  name: string;
  strategy: Strategy;
  apyDocsUrl?: string;
  strategyDocsUrl?: string;
  underlying: string;
  otherParams?: any[];
}

export type PluginData = AbstractPlugin;
export type Plugin = AbstractPlugin;

export interface BeefyPlugin extends AbstractPlugin {
  strategy: Strategy.Beefy;
  apyDocsUrl: `https://app.beefy.finance/vault/${string}`;
}

export interface DotDotPlugin extends AbstractPlugin {
  strategy: Strategy.DotDot;
  otherParams: [
    string, // DDD Flywheel
    string, // EPX Flywheel
    string, // LP Depositor
    string, // Rewards Destination
    [string, string] // Reward Tokens [DDD, EPX]
  ];
}

export interface MimoPlugin extends AbstractPlugin {
  strategy: Strategy.Mimo | Strategy.Arrakis;
  otherParams: [
    string, // Mimo Flywheel
    string, // Pool
    string, // Rewards Destination
    [string] // Reward Tokens [Mimo]
  ];
}

export type ArrakisPlugin = MimoPlugin;

export interface BombPlugin extends AbstractPlugin {
  strategy: Strategy.Bomb;
}

export interface StellaPlugin extends AbstractPlugin {
  strategy: Strategy.Stella;
}

export interface CurveGaugePlugin extends AbstractPlugin {
  strategy: Strategy.CurveGauge;
  otherParams: [string, string[]];
}

export type SupportedPlugin =
  | BeefyPlugin
  | DotDotPlugin
  | MimoPlugin
  | BombPlugin
  | StellaPlugin
  | CurveGaugePlugin
  | ArrakisPlugin;

export declare type DeployedPlugins = {
  [pluginAddress: string]: SupportedPlugin;
};
