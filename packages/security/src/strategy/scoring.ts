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
} from "@midas-capital/types";

export const SCORING_WEIGHTS = {
  COMPLEXITY: 0.3,
  TIME_IN_MARKET: 0.2,
  ASSET_RISK: 0.25,
  PLATFORM_RISK: 0.25,
};

export const complexityScore = (complexity: StrategyComplexity) => {
  switch (complexity) {
    case StrategyComplexity.LOW:
      return 10;
    case StrategyComplexity.MEDIUM:
      return 7;
    case StrategyComplexity.HIGH:
      return 3;
  }
};

export const timeInMarketScore = (timeInMarket: StrategyTimeInMarket) => {
  switch (timeInMarket) {
    case StrategyTimeInMarket.BATTLE_TESTED:
      return 10;
    case StrategyTimeInMarket.EXPERIMENTAL:
      return 7;
    case StrategyTimeInMarket.NEW:
      return 3;
  }
};

export const assetRiskILScore = (assetRiskIL: AssetRiskIL) => {
  switch (assetRiskIL) {
    case AssetRiskIL.NONE:
      return 10;
    case AssetRiskIL.LOW:
      return 7;
    case AssetRiskIL.HIGH:
      return 3;
  }
};

export const assetRiskLiquidityScore = (assetRiskLiquidity: AssetRiskLiquidity) => {
  switch (assetRiskLiquidity) {
    case AssetRiskLiquidity.HIGH:
      return 10;
    case AssetRiskLiquidity.LOW:
      return 3;
  }
};

export const assetRiskMktCapScore = (assetRiskMktCap: AssetRiskMktCap) => {
  switch (assetRiskMktCap) {
    case AssetRiskMktCap.LARGE:
      return 10;
    case AssetRiskMktCap.MEDIUM:
      return 7;
    case AssetRiskMktCap.SMALL:
      return 3;
    case AssetRiskMktCap.MICRO:
      return 10;
  }
};

export const assetRiskSupplyScore = (assetRiskSupply: AssetRiskSupply) => {
  switch (assetRiskSupply) {
    case AssetRiskSupply.DECENTRALIZED:
      return 10;
    case AssetRiskSupply.CENTRALIZED:
      return 3;
  }
};

export const platformRiskReputationScore = (platformRiskReputation: PlatformRiskReputation) => {
  switch (platformRiskReputation) {
    case PlatformRiskReputation.ESTABLISHED:
      return 10;
    case PlatformRiskReputation.NEW:
      return 3;
  }
};

export const platformRiskAuditScore = (platformRiskAudit: PlatformRiskAudit) => {
  switch (platformRiskAudit) {
    case PlatformRiskAudit.AUDIT:
      return 10;
    case PlatformRiskAudit.NO_AUDIT:
      return 3;
  }
};

export const platformRiskContractsVerifiedScore = (platformContractsVerified: PlatformRiskContractsVerified) => {
  switch (platformContractsVerified) {
    case PlatformRiskContractsVerified.CONTRACTS_VERIFIED:
      return 10;
    case PlatformRiskContractsVerified.CONTRACTS_UNVERIFIED:
      return 3;
  }
};

export const platformRiskAdminWithTimelockScore = (platformAdminWithTimelock: PlatformRiskAdminWithTimelock) => {
  switch (platformAdminWithTimelock) {
    case PlatformRiskAdminWithTimelock.ADMIN_WITH_TIMELOCK:
      return 10;
    case PlatformRiskAdminWithTimelock.ADMIN_WITHOUT_TIMELOCK:
      return 3;
  }
};
