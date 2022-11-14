import { JsonRpcProvider } from "@ethersproject/providers";
import { SupportedChains } from "@midas-capital/types";
import { Wallet } from "ethers";

import { setUpSdk } from "../src";
import { assets } from "../src/config";
import { baseConfig } from "../src/config/variables";
import { runVerifier } from "../src/run";
import { Services } from "../src/types";

(async function () {
  const chainId: number = process.env.TARGET_CHAIN_ID ? parseInt(process.env.TARGET_CHAIN_ID) : SupportedChains.ganache;
  const provider = new JsonRpcProvider(process.env.WEB3_HTTP_PROVIDER_URL);
  const signer = new Wallet(baseConfig.adminPrivateKey, provider);
  const midasSdk = setUpSdk(chainId, signer);

  const assetsOverride = assets[Services.FeedVerifier].slice(0, 1);
  runVerifier(midasSdk, Services.FeedVerifier, assetsOverride);
  runVerifier(midasSdk, Services.PriceVerifier, assetsOverride);
})();
