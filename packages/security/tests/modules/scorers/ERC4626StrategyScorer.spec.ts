import { SupportedChains } from "@ionicprotocol/types";

import { SecurityBase } from "../../../src/index";
import * as StrategyModule from "../../../src/strategy";
import { expect } from "../../globalTestHook";

describe("Strategy", () => {
  const Strategy = StrategyModule.withErc4626StrategyScorer(SecurityBase);
  let strategyBsc: InstanceType<typeof Strategy>;
  let strategyPolygon: InstanceType<typeof Strategy>;

  beforeEach(() => {
    strategyBsc = new Strategy(SupportedChains.bsc, null);
    strategyPolygon = new Strategy(SupportedChains.polygon, null);
  });

  describe("getStrategyRating", () => {
    it("should fetch strat rating for bsc", async () => {
      for (const [address, strat] of Object.entries(strategyBsc.chainConfig.deployedPlugins)) {
        const rating = await strategyBsc.getStrategyRating(address);
        console.log(`Rating for strategy: ${strat.name} is ${rating}`);
        expect(rating.totalScore).to.be.greaterThan(0);
      }
    });
    it("should fetch strat rating for polygon", async () => {
      for (const [address, strat] of Object.entries(strategyPolygon.chainConfig.deployedPlugins)) {
        const rating = await strategyPolygon.getStrategyRating(address);
        console.log(`Rating for strategy: ${strat.name} is ${rating}`);
        expect(rating.totalScore).to.be.greaterThan(0);
      }
    });
  });
});
