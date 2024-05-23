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
  // const contractInterface = new ethers.utils.Interface(abi);
  const ionicLiquidator = "0xA3B403E9F62Dc7456BaE19FC0Bdba6Fc66b4D315";

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
          "0xe8784a853584fcf267dff3c87dd519443b73105e",
          "5100978162235747073472",
          "0x13080cdb3e1eafd08b5a196821c324c8553e43de",
          "0xacd8debc9c0b6250e30e4113e392bd9cd58b9936",
          "0",
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
            amount: BigInt("89554132877053445"),
          },
        ],
        sellTokens: [
          {
            token: liquidation.sellTokenUnderlying as `0x${string}`,
            amount: BigInt("5100978162235747073472"),
          },
        ],
      };
      console.log(opportunity);

      try {
        await client.submitOpportunity(opportunity);
        console.log("Opportunity submitted successfully.");
      } catch (error) {
        console.error("Failed to submit opportunity:", error);
      }
    }
  }
})();
