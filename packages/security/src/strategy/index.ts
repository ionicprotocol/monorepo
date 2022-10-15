import { SecurityBaseConstructor } from "../";

import * as scoring from "./scoring";
import { strategies } from "./strategies";

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

      const complexity = complexityScore * scoring.SCORING_WEIGHTS.COMPLEXITY;

      const timeInMarket = timeInMarketScore * scoring.SCORING_WEIGHTS.TIME_IN_MARKET;

      const assetRisk =
        assetRiskILScore *
        assetRiskLiquidityScore *
        assetRiskMktCapScore *
        assetRiskSupplyScore *
        scoring.SCORING_WEIGHTS.ASSET_RISK;

      const platformRisk =
        platformRiskReputationScore *
        platformRiskAuditScore *
        platformRiskContractsVerifiedScore *
        platformRiskAdminWithTimelockScore *
        scoring.SCORING_WEIGHTS.PLATFORM_RISK;
      return complexity + timeInMarket + assetRisk + platformRisk;
    }
  };
}
