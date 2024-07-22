// import { chainIdToConfig } from "@ionicprotocol/chains";
// import { IonicSdk } from "@ionicprotocol/sdk";
// import { assetSymbols, SupportedChains } from "@ionicprotocol/types";
// import { Contract } from "ethers";
// import { restore } from "sinon";

// import { configs } from "../../src/config";
// import { FeedVerifier } from "../../src/services/verifiers";
// import { AbstractOracleVerifier } from "../../src/services/verifiers/base";
// import { Services } from "../../src/types";
// import { expect } from "../globalTestHook";
// import { getSigner } from "../helpers";

// describe("Feed verifier", () => {
//   let feedVerifier: FeedVerifier;
//   let sdk: IonicSdk;

//   const chainConfig = chainIdToConfig[SupportedChains.bsc];
//   const assetsToTest = [assetSymbols.WBNB, assetSymbols.BUSD, assetSymbols.BTCB, assetSymbols.USDT, assetSymbols.DAI];
//   const assets = chainConfig.assets.filter((x) => assetsToTest.some((y) => y === x.symbol));
//   // @ts-ignore
//   const config = configs[Services.FeedVerifier];

//   beforeEach(() => {
//     const signer = getSigner(SupportedChains.bsc);
//     sdk = new IonicSdk(signer, chainIdToConfig[SupportedChains.bsc]);
//     feedVerifier = new FeedVerifier(sdk, assets[0], config);
//   });
//   afterEach(function () {
//     restore();
//   });
//   describe("instantiate", () => {
//     it("should init FeedVerifier", async () => {
//       const [verifier] = await feedVerifier.init();
//       expect(verifier).to.be.instanceOf(AbstractOracleVerifier);
//       expect(verifier?.underlyingOracle).to.be.instanceOf(Contract);
//     });
//   });
// });
