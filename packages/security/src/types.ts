import {
  AssetRiskIL,
  AssetRiskLiquidity,
  AssetRiskMktCap,
  AssetRiskSupply,
  PlatformRiskAdminWithTimelock,
  PlatformRiskAudit,
  PlatformRiskContractsVerified,
  PlatformRiskReputation,
  StrategyComplexity,
  StrategyTimeInMarket,
} from "./enums";
import { ChainLinkFeedStatus } from "./oracle/scorers/chainlink/types";

export type ScoreRange = {
  range: [number, number] | number;
  score: number;
};

export type ScoreEnum = {
  enum: ChainLinkFeedStatus;
  score: number;
};

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
