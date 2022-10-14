import { SecurityBaseConstructor } from "../";

import * as scoring from "./scoring";
import { strategies } from "./strategies";

const WEIGHTS = {
  COMPLEXITY: 0.3,
  TIME_IN_MARKET: 0.1,
  ASSET_RISK: 0.2,
  PLATFORM_RISK: 0.2,
};

export function withErc4626StrategyScorer<TBase extends SecurityBaseConstructor>(Base: TBase) {
  return class Erc4626StrategyScorer extends Base {
    getStrategyRating(strategyAddress: string): number {
      const strategy = strategies.find((s) => s.address === strategyAddress);
      if (!strategy) {
        throw new Error("Strategy not found");
      }
      const complexityScore = scoring.complexityScore(strategy.complexity);
      const timeInMarketScore = scoring.timeInMarketScore(strategy.timeInMarket);

      const assetRiskILScore = scoring.assetRiskILScore(strategy.riskIL);
      const assetRiskLiquidityScore = scoring.assetRiskLiquidityScore(strategy.liquidity);
      const assetRiskMktCapScore = scoring.assetRiskMktCapScore(strategy.mktCap);
      const assetRiskSupplyScore = scoring.assetRiskSupplyScore(strategy.supplyCentralised);

      const platformRiskReputationScore = scoring.platformRiskReputationScore(strategy.reputation);
      const platformRiskAuditScore = scoring.platformRiskAuditScore(strategy.audit);
      const platformRiskContractsVerifiedScore = scoring.platformRiskContractsVerifiedScore(strategy.contractsVerified);
      const platformRiskAdminWithTimelockScore = scoring.platformRiskAdminWithTimelockScore(strategy.adminWithTimelock);

      const complexity = complexityScore * WEIGHTS.COMPLEXITY;
      const timeInMarket = timeInMarketScore * WEIGHTS.TIME_IN_MARKET;
      const assetRisk =
        assetRiskILScore * assetRiskLiquidityScore * assetRiskMktCapScore * assetRiskSupplyScore * WEIGHTS.ASSET_RISK;
      const platformRisk =
        platformRiskReputationScore *
        platformRiskAuditScore *
        platformRiskContractsVerifiedScore *
        platformRiskAdminWithTimelockScore *
        WEIGHTS.PLATFORM_RISK;
      return complexity + timeInMarket + assetRisk + platformRisk;
    }
  };
}
