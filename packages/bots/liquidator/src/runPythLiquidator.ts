import { JsonRpcProvider } from "@ethersproject/providers";
import { BotType, PythLiquidatablePool } from "@ionicprotocol/sdk/dist/cjs/src/modules/liquidation/utils";
import { Client, OpportunityParams } from "@pythnetwork/express-relay-evm-js";
import { encodeAbiParameters, encodeFunctionData } from "viem";

import IonicLiquidatorABI from "../../../sdk/artifacts/IonicLiquidator.sol/IonicLiquidator.json";

import config from "./config";
import { logger } from "./logger";
import { Liquidator } from "./services";
import { setUpSdk } from "./utils";

(async function () {
  const chainId: number = config.chainId;
  const chainName: string = config.chainName;
  const provider = new JsonRpcProvider(config.rpcUrl);
  const ionicSdk = setUpSdk(chainId, provider);
  const abi = IonicLiquidatorABI.abi;
  const ionicLiquidator = ionicSdk.contracts.IonicLiquidator.address as `0x${string}`;

  logger.info(`Config for bot: ${JSON.stringify({ ...ionicSdk.chainLiquidationConfig, ...config })}`);

  const liquidator = new Liquidator(ionicSdk);
  const liquidatablePools = await liquidator.fetchLiquidations<PythLiquidatablePool>(BotType.Pyth);

  logger.info(`Found ${liquidatablePools.length} pools with liquidations to process`);
  const client: Client = new Client({ baseUrl: config.expressRelayEndpoint });

  for (const liquidatablePool of liquidatablePools) {
    logger.info(
      `Liquidating pool: ${liquidatablePool.comptroller} -- ${liquidatablePool.liquidations.length} liquidations found`
    );

    for (const liquidation of liquidatablePool.liquidations) {
      // // Log each argument of the current liquidation
      logger.info(`Borrower Address: ${liquidation.args[0]}`);
      logger.info(`Repay Amount: ${liquidation.args[1].toString()}`);
      logger.info(`cErc20 Address: ${liquidation.args[2]}`);
      logger.info(`cToken Collateral Address: ${liquidation.args[3]}`);
      logger.info(`Minimum Output Amount: ${liquidation.args[4].toString()}`);

      // // Log additional details about tokens involved in the liquidation, if applicable
      if (liquidation.buyTokenUnderlying && liquidation.sellTokenUnderlying) {
        logger.info(
          `Buying Token (Underlying): ${
            liquidation.buyTokenUnderlying
          }, Amount: ${liquidation.buyTokenAmount.toString()}`
        );
        logger.info(
          `Selling Token (Underlying): ${
            liquidation.sellTokenUnderlying
          }, Amount: ${liquidation.sellTokenAmount.toString()}`
        );
      }

      const calldata = encodeFunctionData({
        abi,
        functionName: "safeLiquidate",
        args: [liquidation.args[0], liquidation.args[1], liquidation.args[2], liquidation.args[3], liquidation.args[4]],
      });

      const permissionkeyPayload = encodeAbiParameters([{ type: "address", name: "borrower" }], [liquidation.args[0]]);
      const permissionKey = encodeAbiParameters(
        [
          { type: "address", name: "contract" },
          { type: "bytes", name: "vaultId" },
        ],
        [ionicLiquidator, permissionkeyPayload]
      );

      const opportunity: OpportunityParams = {
        chainId: chainName,
        targetContract: ionicLiquidator,
        targetCalldata: calldata as `0x${string}`,
        permissionKey: permissionKey as `0x${string}`,
        targetCallValue: BigInt(0),
        buyTokens: [
          {
            token: liquidation.buyTokenUnderlying as `0x${string}`,
            amount: BigInt(liquidation.buyTokenAmount.toString()),
          },
        ],
        sellTokens: [
          {
            token: liquidation.sellTokenUnderlying as `0x${string}`,
            amount: BigInt(liquidation.sellTokenAmount.toString()),
          },
        ],
      };

      try {
        await client.submitOpportunity(opportunity);
        console.log("Opportunity submitted successfully.");
      } catch (error) {
        console.error("Failed to submit opportunity:", error);
      }
    }
  }
})();
