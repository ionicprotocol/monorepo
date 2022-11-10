import { MidasSdk } from "@midas-capital/sdk";
import { assetSymbols, SupportedChains } from "@midas-capital/types";
import { BigNumber } from "ethers";
import { restore } from "sinon";

import { configs } from "../../src/config";
import { PriceVerifier } from "../../src/services/verifiers";
import { AbstractOracleVerifier } from "../../src/services/verifiers/base";
import { chainIdToConfig, Services } from "../../src/types";
import { expect } from "../globalTestHook";
import { getSigner } from "../helpers";

describe("Price verifier", () => {
  let priceVerifier: PriceVerifier;
  let sdk: MidasSdk;
  let env: Record<string, string | undefined>;

  const chainConfig = chainIdToConfig[SupportedChains.bsc];
  const assetsToTest = [assetSymbols.WBNB, assetSymbols.BUSD, assetSymbols.BTCB, assetSymbols.USDT, assetSymbols.DAI];
  const assets = chainConfig.assets.filter((x) => assetsToTest.some((y) => y === x.symbol));
  const config = configs[Services.PriceVerifier];

  beforeEach(() => {
    env = process.env;
    process.env = { ...process.env, SERVICE_TO_RUN: "price-verifier" };

    const signer = getSigner(SupportedChains.bsc);
    sdk = new MidasSdk(signer, chainIdToConfig[SupportedChains.bsc]);
    priceVerifier = new PriceVerifier(sdk, assets[0], config);
  });
  afterEach(function () {
    process.env = env;
    restore();
  });
  describe("config", () => {
    it("Expect service config to be correctly set", async () => {
      expect(config.maxPriceDeviation).to.be.equal(15);
      expect(process.env.SERVICE_TO_RUN).to.be.equal("price-verifier");
    });
  });
  describe("instantiate", () => {
    it("should init FeedVerifier", async () => {
      const verifier = await priceVerifier.init();
      expect(verifier).to.be.instanceOf(AbstractOracleVerifier);
      expect(verifier?.mpoPrice).to.be.not.equal(BigNumber.from(0));
    });
  });
});
