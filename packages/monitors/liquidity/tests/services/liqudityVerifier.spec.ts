import { MidasSdk } from "@midas-capital/sdk";
import { assetSymbols, SupportedChains } from "@midas-capital/types";
import { restore } from "sinon";

import { configs } from "../../src/config";
import { AMMLiquidityVerifier } from "../../src/services/monitor";
import { AbstractLiquidityVerifier } from "../../src/services/monitor/base";
import { chainIdToConfig, Services } from "../../src/types";
import { expect } from "../globalTestHook";
import { getSigner } from "../helpers";

describe("Feed verifier", () => {
  let feedVerifier: AMMLiquidityVerifier;
  let sdk: MidasSdk;

  const chainConfig = chainIdToConfig[SupportedChains.bsc];
  const assetsToTest = [assetSymbols.WBNB, assetSymbols.BUSD, assetSymbols.BTCB, assetSymbols.USDT, assetSymbols.DAI];
  const assets = chainConfig.assets.filter((x) => assetsToTest.some((y) => y === x.symbol));
  // @ts-ignore
  const config = configs[Services.FeedVerifier];

  beforeEach(() => {
    const signer = getSigner(SupportedChains.bsc);
    sdk = new MidasSdk(signer, chainIdToConfig[SupportedChains.bsc]);
    feedVerifier = new AMMLiquidityVerifier(sdk, config);
  });
  afterEach(function () {
    restore();
  });
  describe("instantiate", () => {
    it("should init FeedVerifier", async () => {
      const [verifier] = await feedVerifier.init();
      expect(verifier).to.be.instanceOf(AbstractLiquidityVerifier);
    });
  });
});
