import { Client, OpportunityParams } from "@pythnetwork/express-relay-evm-js";
import { ionicLiquidatorAbi } from "@ionicprotocol/sdk";
import { createPublicClient, createWalletClient, encodeAbiParameters, encodeFunctionData, Hex, http } from "viem";
import { mode } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

import config from "./config";
import { logger } from "./logger";
import { setUpSdk } from "./utils";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
const account = privateKeyToAccount(config.adminPrivateKey as Hex);
const publicClient = createPublicClient({
  batch: { multicall: { wait: 16 } },
  chain: mode,
  transport: http(config.rpcUrl),
});
const walletClient = createWalletClient({
  account,
  chain: mode,
  transport: http(config.rpcUrl),
});

(async function () {
  const chainName: string = config.chainName;
  const ionicSdk = setUpSdk(mode.id, publicClient, walletClient);
  const ionicLiquidator = ionicSdk.contracts.IonicLiquidator.address as `0x${string}`;
  const client: Client = new Client({ baseUrl: config.expressRelayEndpoint });
  const liquidation = {
    method: "safeLiquidate(address,uint256,address,address,uint256)",
    args: [
      "0x40fBe83aa55a77D13E8037F159Ddfc087e05468f",
      5553214,
      "0xc53edEafb6D502DAEC5A7015D67936CEa0cD0F52",
      "0x4341620757Bee7EB4553912FaFC963e59C949147",
      0,
    ],
    value: 0,
    buyTokenAmount: "557586274468506068885",
    sellTokenAmount: "5553214",
    buyTokenUnderlying: "0xDfc7C877a950e49D2610114102175A06C2e3167a",
    sellTokenUnderlying: "0xd988097fb8612cc24eeC14542bC03424c656005f",
  };

  const calldata = encodeFunctionData({
    abi: ionicLiquidatorAbi,
    functionName: "safeLiquidate",
    args: [
      liquidation.args[0] as `0x${string}`,
      BigInt(liquidation.args[1].toString()),
      liquidation.args[2] as `0x${string}`,
      liquidation.args[3] as `0x${string}`,
      BigInt(liquidation.args[4].toString()),
    ],
  });
  logger.info(`Calldata: ${calldata}`);
  const permissionkeyPayload = encodeAbiParameters(
    [{ type: "address", name: "borrower" }],
    [liquidation.args[0] as `0x${string}`]
  );
  const permissionKey = encodeAbiParameters(
    [
      { type: "address", name: "contract" },
      { type: "bytes", name: "vaultId" },
    ],
    [ionicLiquidator, permissionkeyPayload]
  );
  logger.info(`Permission Key: ${permissionKey}`);
  const opportunity: OpportunityParams = {
    chainId: chainName,
    targetContract: ionicLiquidator,
    targetCalldata: calldata as `0x${string}`,
    permissionKey: permissionKey as `0x${string}`,
    targetCallValue: BigInt(0),
    buyTokens: [
      {
        token: liquidation.buyTokenUnderlying as `0x${string}`,
        amount: BigInt(liquidation.buyTokenAmount),
      },
    ],
    sellTokens: [
      {
        token: liquidation.sellTokenUnderlying as `0x${string}`,
        amount: BigInt(liquidation.sellTokenAmount),
      },
    ],
  };
  logger.info("Opportunity:", JSON.stringify(opportunity, null, 2));
  try {
    await client.submitOpportunity(opportunity);
    console.info("Opportunity submitted successfully:", opportunity);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : error;
    console.error("Failed to submit opportunity:", {
      error: errorMessage,
      opportunity: JSON.stringify(opportunity, null, 2),
      blockNumber: await publicClient.getBlockNumber(),
    });
    console.error("Detailed Error:", error);
  }
})();
