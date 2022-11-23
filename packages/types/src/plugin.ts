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
  icon?: string;
  otherParams?: any[];
}

export type PluginData = AbstractPlugin;
export type Plugin = AbstractPlugin;

export interface BeefyPlugin extends AbstractPlugin {
  strategy: Strategy.Beefy;
  apyDocsUrl: `https://app.beefy.finance/vault/${string}`;
  icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png";
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
  icon: "https://d1912tcoux65lj.cloudfront.net/plugin/mimo.png";
}

export type ArrakisPlugin = MimoPlugin;

export interface BombPlugin extends AbstractPlugin {
  strategy: Strategy.Bomb;
  icon: "https://d1912tcoux65lj.cloudfront.net/plugin/bomb.png";
}

export interface StellaPlugin extends AbstractPlugin {
  strategy: Strategy.Stella;
  icon: "https://d1912tcoux65lj.cloudfront.net/plugin/stella.png";
}

export interface CurveGaugePlugin extends AbstractPlugin {
  strategy: Strategy.CurveGauge;
  otherParams: [string, string[]];
  icon: "https://d1912tcoux65lj.cloudfront.net/plugin/curve.png";
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

export enum StrategyComplexity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export enum StrategyTimeInMarket {
  NEW = "NEW",
  EXPERIMENTAL = "EXPERIMENTAL",
  BATTLE_TESTED = "BATTLE_TESTED",
}

export enum AssetRiskIL {
  NONE = "NONE",
  LOW = "LOW",
  HIGH = "HIGH",
}

export enum AssetRiskLiquidity {
  LOW = "LOW",
  HIGH = "HIGH",
}

export enum AssetRiskMktCap {
  LARGE = "LARGE",
  MEDIUM = "MEDIUM",
  SMALL = "SMALL",
  MICRO = "MICRO",
}

export enum AssetRiskSupply {
  CENTRALIZED = "CENTRALIZED",
  DECENTRALIZED = "DECENTRALIZED",
}

export enum PlatformRiskReputation {
  ESTABLISHED = "ESTABLISHED",
  NEW = "NEW",
}

export enum PlatformRiskAudit {
  AUDIT = "AUDIT",
  NO_AUDIT = "NO_AUDIT",
}

export enum PlatformRiskContractsVerified {
  CONTRACTS_VERIFIED = "CONTRACTS_VERIFIED",
  CONTRACTS_UNVERIFIED = "CONTRACTS_UNVERIFIED",
}

export enum PlatformRiskAdminWithTimelock {
  ADMIN_WITH_TIMELOCK = "ADMIN_WITH_TIMELOCK",
  ADMIN_WITHOUT_TIMELOCK = "ADMIN_WITHOUT_TIMELOCK",
}

export type ERC4626Strategy = {
  address: string;
  name: string;
  strategy: string;
  complexity: StrategyComplexity;
  timeInMarket: StrategyTimeInMarket;
  riskIL: AssetRiskIL;
  liquidity: AssetRiskLiquidity;
  mktCap: AssetRiskMktCap;
  supplyCentralised: AssetRiskSupply;
  reputation: PlatformRiskReputation;
  audit: PlatformRiskAudit;
  contractsVerified: PlatformRiskContractsVerified;
  adminWithTimelock: PlatformRiskAdminWithTimelock;
};

export type StrategyScore = {
  strategy: ERC4626Strategy;
  complexityScore: number;
  timeInMarketScore: number;
  assetRiskILScore: number;
  assetRiskLiquidityScore: number;
  assetRiskMktCapScore: number;
  assetRiskSupplyScore: number;
  platformRiskReputationScore: number;
  platformRiskAuditScore: number;
  platformRiskContractsVerifiedScore: number;
  platformRiskAdminWithTimelockScore: number;
  totalScore: number;
};
