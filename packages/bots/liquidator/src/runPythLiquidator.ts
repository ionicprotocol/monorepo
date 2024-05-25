import { JsonRpcProvider } from "@ethersproject/providers";
import config from "./config";
import { logger } from "./logger";
import { Liquidator } from "./services";
import { setUpSdk } from "./utils";
import { BotType } from "@ionicprotocol/sdk/dist/cjs/src/modules/liquidation/utils";
import { PythLiquidatablePool } from "@ionicprotocol/sdk/dist/cjs/src/modules/liquidation/utils";
import { encodeFunctionData, encodeAbiParameters } from "viem";
import { Client } from "@pythnetwork/express-relay-evm-js";
import { OpportunityParams } from "@pythnetwork/express-relay-evm-js";
import IonicLiquidatorABI from "../../../sdk/artifacts/IonicLiquidator.sol/IonicLiquidator.json";

(async function () {
  const chainId: number = config.chainId;
  const provider = new JsonRpcProvider(config.rpcUrl);
  const ionicSdk = setUpSdk(chainId, provider);
  const abi = IonicLiquidatorABI.abi;
  const ionicLiquidator = ionicSdk.contracts.IonicLiquidator.address as `0x${string}`;

  logger.info(`Config for bot: ${JSON.stringify({ ...ionicSdk.chainLiquidationConfig, ...config })}`);

  const liquidator = new Liquidator(ionicSdk);
  const liquidatablePools = await liquidator.fetchLiquidations<PythLiquidatablePool>(BotType.Pyth);

  logger.info(`Found ${liquidatablePools.length} pools with liquidations to process`);

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

      const client: Client = new Client({ baseUrl: "https://per-staging.dourolabs.app/" });

      const calldata = (encodeFunctionData as any)({
        abi,
        functionName: "safeLiquidate",
        args: [
          liquidation.args[0],
          liquidation.args[1],
          liquidation.args[2],
          liquidation.args[3],
          liquidation.args[4],
          true,
        ],
      });

      const permissionkeyPayload = (encodeAbiParameters as any)(
        [{ type: "address", name: "borrower" }],
        [liquidation.args[0]]
      );
      const permissionKey = (encodeAbiParameters as any)(
        [
          { type: "address", name: "contract" },
          { type: "bytes", name: "vaultId" },
        ],
        [ionicLiquidator, permissionkeyPayload]
      );

      const opportunity: OpportunityParams = {
        chainId: "op_sepolia",
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
