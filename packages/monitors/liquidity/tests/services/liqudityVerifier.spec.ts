import { bsc, chainIdToConfig } from "@midas-capital/chains";
import { MidasSdk } from "@midas-capital/sdk";
import { assetFilter, assetSymbols, SupportedChains, underlying } from "@midas-capital/types";
import { restore } from "sinon";

import { configs } from "../../src/config";
import { AMMLiquidityVerifier } from "../../src/services/monitor";
import { AbstractLiquidityVerifier } from "../../src/services/monitor/base";
import { Services } from "../../src/types";
import { expect } from "../globalTestHook";
import { getSigner } from "../helpers";

describe("Feed verifier", () => {
  let liquidityVerifier: AMMLiquidityVerifier;
  let sdk: MidasSdk;

  const config = configs[Services.LiquidityDepthVerifier];

  beforeEach(() => {
    const signer = getSigner(SupportedChains.bsc);
    sdk = new MidasSdk(signer, chainIdToConfig[SupportedChains.bsc]);
    const testAssetConfig = {
      token0: underlying(bsc.assets, assetSymbols.stkBNB),
      token1: underlying(bsc.assets, assetSymbols.WBNB),
      identifier: "PCS stkBNB-WBNB",
      affectedAssets: [assetFilter(bsc.assets, assetSymbols.stkBNB)],
    };
    liquidityVerifier = new AMMLiquidityVerifier(sdk, testAssetConfig, config);
  });
  afterEach(function () {
    restore();
  });
  describe("instantiate", () => {
    it("should init FeedVerifier", async () => {
      const [verifier] = await liquidityVerifier.init();
      expect(verifier).to.be.instanceOf(AbstractLiquidityVerifier);
    });
  });
});
