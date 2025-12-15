import { createPublicClient, createWalletClient, fallback, Hex, http, parseEther, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { chainIdtoChain } from "@ionicprotocol/chains";

import config from "./config";
import { logger } from "./logger";
import { setUpSdk } from "./utils";

// Define the start time as a Unix timestamp
const startTime = Math.floor(new Date().getTime() / 1000);

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const account = privateKeyToAccount(config.adminPrivateKey as Hex);
const clientConfig = {
  batch: { multicall: { wait: 16 } },
  chain: chainIdtoChain[config.chainId],
  transport: fallback(config.rpcUrls.map((url) => http(url))),
  cacheTime: 4_000,
  pollingInterval: 4_000,
};
const publicClient = createPublicClient(clientConfig);
const walletClient = createWalletClient({
  account,
  chain: chainIdtoChain[config.chainId],
  transport: fallback(config.rpcUrls.map((url) => http(url))),
});

const HEALTH_CHECK_CONCURRENCY = parseInt(process.env.HEALTH_CHECK_CONCURRENCY || "12", 10);
const HEALTH_CHECK_RETRIES = parseInt(process.env.HEALTH_CHECK_RETRIES || "3", 10);
const HEALTH_CHECK_BASE_DELAY_MS = parseInt(process.env.HEALTH_CHECK_BASE_DELAY_MS || "300", 10);

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  let attempt = 0;
  // Exponential backoff with jitter
  while (true) {
    try {
      return await fn();
    } catch (e: any) {
      attempt++;
      if (attempt > HEALTH_CHECK_RETRIES) {
        logger.error(`Max retries reached for ${label}: ${e?.message || e}`);
        throw e;
      }
      const delay = HEALTH_CHECK_BASE_DELAY_MS * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 100);
      logger.warn(
        `Retrying ${label} (attempt ${attempt}/${HEALTH_CHECK_RETRIES}) in ${delay}ms due to: ${e?.message || e}`
      );
      await sleep(delay);
    }
  }
}

// Main function to fetch all borrowers without pagination
(async function runAllBorrowers() {
  const chainName: string = config.chainName;
  const ionicSdk = setUpSdk(config.chainId, publicClient, walletClient);

  logger.info(`Target Chain: ${chainName} (${config.chainId})`);
  logger.info(`Config for bot: ${JSON.stringify({ ...ionicSdk.chainLiquidationConfig, ...config })}`);

  try {
    const message = `
**runAllBorrowers Started**
- **Start Time**: ${new Date(startTime * 1000).toISOString()}
**----------------------------------------------------------------------------------------**
`;
    logger.info(`${message}`);

    // Get all active pools
    const [, allPools] = await ionicSdk.contracts.PoolDirectory.read.getActivePools();
    logger.info(`Found ${allPools.length} active pools`);

    for (const pool of allPools) {
      const { comptroller, name } = pool;
      logger.info(`\n=== Processing Pool: ${name} (${comptroller}) ===`);

      try {
        // Get all borrowers for this comptroller using a different approach
        const comptrollerInstance = ionicSdk.createComptroller(comptroller);

        // Try to get all borrowers at once with a very large page size
        const [, allBorrowers] = await comptrollerInstance.read.getPaginatedBorrowers([
          BigInt(0),
          BigInt(10000), // Very large page size to get all at once
        ]);

        logger.info(`Total borrowers in ${name}: ${allBorrowers.length}`);

        if (allBorrowers.length > 0) {
          // Log first 50 borrowers
          const sample = allBorrowers.slice(0, 50);
          logger.info(`First ${sample.length} borrowers: ${sample.join(", ")}`);

          if (allBorrowers.length > 50) {
            logger.info(`... and ${allBorrowers.length - 50} more borrowers`);
          }

          // Check health factors for all borrowers (throttled + retries)
          logger.info(`Checking health factors for all ${allBorrowers.length} borrowers...`);

          let healthyCount = 0;
          let unhealthyCount = 0;
          let errorCount = 0;
          const unhealthyList: Array<{ address: `0x${string}`; health: bigint }> = [];

          let processed = 0;
          for (let i = 0; i < allBorrowers.length; i += HEALTH_CHECK_CONCURRENCY) {
            const chunk = allBorrowers.slice(i, i + HEALTH_CHECK_CONCURRENCY);
            const results = await Promise.allSettled(
              chunk.map((borrower, idx) =>
                withRetry(async () => {
                  const health = await ionicSdk.contracts.PoolLens.read.getHealthFactor([borrower, comptroller]);
                  const globalIndex = i + idx + 1;
                  if (globalIndex <= 20 || health < parseEther("1.1")) {
                    // Log first 20 or any unhealthy-ish
                    logger.info(`[${globalIndex}/${allBorrowers.length}] ${borrower}: health=${health.toString()}`);
                  }
                  if (health < parseEther("1.0")) {
                    unhealthyCount++;
                    unhealthyList.push({ address: borrower as `0x${string}`, health });
                  } else {
                    healthyCount++;
                  }
                }, `health(${name}:${borrower})`)
              )
            );

            // Count errors without throwing the whole batch
            for (const r of results) {
              if (r.status === "rejected") errorCount++;
            }
            processed += chunk.length;
            if (processed % 50 === 0 || processed === allBorrowers.length) {
              logger.info(`Progress: ${processed}/${allBorrowers.length} borrowers processed in ${name}`);
            }
          }

          logger.info(`\nHealth Summary for ${name}:`);
          logger.info(`- Total borrowers: ${allBorrowers.length}`);
          logger.info(`- Healthy (health >= 1.0): ${healthyCount}`);
          logger.info(`- Unhealthy (health < 1.0): ${unhealthyCount}`);
          logger.info(`- Errors: ${errorCount}`);
          if (unhealthyList.length > 0) {
            logger.info(`\nUnhealthy borrowers for ${name} (health < 1.0):`);
            for (const u of unhealthyList) {
              logger.info(`${u.address}, health=${formatEther(u.health)} ETH`);
            }
          }
        } else {
          logger.info(`No borrowers found in ${name}`);
        }
      } catch (error) {
        logger.error(`Error processing pool ${name} (${comptroller}): ${error}`);
      }
    }
  } catch (error) {
    logger.error(`Error during borrower fetch process: ${error}`);
  } finally {
    const endMessage = `
    **runAllBorrowers Ended**
    - **Start Time**: ${new Date(startTime * 1000).toISOString()}
    - **End Time**: ${new Date().toISOString()}
    **----------------------------------------------------------------------------------------**
    `;
    logger.info(`${endMessage}`);
  }
})();
