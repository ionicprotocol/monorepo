import { StrategyScore } from "@ionicprotocol/types";

import { SecurityBaseConstructor } from "../";

import * as scoring from "./scoring";
import { strategies } from "./strategies";

export function withErc4626StrategyScorer<TBase extends SecurityBaseConstructor>(Base: TBase) {
  return class Erc4626StrategyScorer extends Base {
    getStrategyRating(strategyAddress: string): StrategyScore {
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

      const assetRiskScore = assetRiskILScore * assetRiskLiquidityScore * assetRiskMktCapScore * assetRiskSupplyScore;

      const assetRisk = assetRiskScore * scoring.SCORING_WEIGHTS.ASSET_RISK;

      const platformRiskScore =
        platformRiskReputationScore *
        platformRiskAuditScore *
        platformRiskContractsVerifiedScore *
        platformRiskAdminWithTimelockScore;

      const platformRisk = platformRiskScore * scoring.SCORING_WEIGHTS.PLATFORM_RISK;

      const totalScore = complexity + timeInMarket + assetRisk + platformRisk;

      return {
        strategy,
        complexityScore,
        timeInMarketScore,
        assetRiskILScore,
        assetRiskLiquidityScore,
        assetRiskMktCapScore,
        assetRiskSupplyScore,
        platformRiskReputationScore,
        platformRiskAuditScore,
        platformRiskContractsVerifiedScore,
        platformRiskAdminWithTimelockScore,
        totalScore,
      };
    }
  };
}
