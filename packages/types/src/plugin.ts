export enum Strategy {
  Beefy = "BeefyERC4626",
  Arrakis = "ArrakisERC4626",
  DotDot = "DotDotLpERC4626",
  Stella = "StellaLpERC4626",
  Bomb = "BombERC4626",
  CurveGauge = "CurveGaugeERC4626",
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
