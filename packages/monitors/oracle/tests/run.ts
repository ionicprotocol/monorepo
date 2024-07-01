import { IonicSdk } from "@ionicprotocol/sdk";
import { SupportedChains } from "@ionicprotocol/types";
import { createPublicClient, createWalletClient, Hex, http, PublicClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, mode, optimism } from "viem/chains";

import { assets, configs, verifiers } from "../src/config";
import { baseConfig } from "../src/config/variables";
import { logger, setUpSdk } from "../src/logger";
import { BatchVerifier } from "../src/services/verifier";
import { OracleVerifierAsset, Services } from "../src/types";

export async function runVerifier(sdk: IonicSdk, service: Services, assetsOverride?: OracleVerifierAsset[]) {
  logger.info(`RUNNING SERVICE: ${service}`);
  const assetsToVerify = assetsOverride ? assetsOverride : assets[service];
  const verifier = new BatchVerifier(sdk, assetsToVerify);
  await verifier.batchVerify(verifiers[service], configs[service]);
}

(async function () {
  const chainId: number = process.env.TARGET_CHAIN_ID ? parseInt(process.env.TARGET_CHAIN_ID) : SupportedChains.mode;

  let chain;
  switch (baseConfig.chainId) {
    case 34443:
      chain = mode;
      break;
    case 8453:
      chain = base;
      break;
    case 10:
      chain = optimism;
      break;
    case 43114:
      break;
    default:
      throw new Error(`Unsupported chainId: ${baseConfig.chainId}`);
  }

  const client = createPublicClient({
    chain,
    transport: http(),
  });

  const account = privateKeyToAccount(baseConfig.adminPrivateKey as Hex);

  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(),
  });

  const ionicSdk = setUpSdk(chainId, client as PublicClient, walletClient);

  runVerifier(ionicSdk, baseConfig.service);
})();
