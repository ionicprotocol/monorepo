import { IonicSdk } from "@ionicprotocol/sdk";
import { LiquidationStrategy } from "@ionicprotocol/types";
import { getContract, zeroAddress, erc20Abi, Address, maxUint256 } from "viem";

import { Liquidator } from "../services";

export default async function approveTokensToSafeLiquidator(liquidator: Liquidator) {
  const { chainLiquidationConfig, logger } = liquidator.sdk;
  if (chainLiquidationConfig.LIQUIDATION_STRATEGY === LiquidationStrategy.DEFAULT) {
    for (const tokenAddress of chainLiquidationConfig.SUPPORTED_OUTPUT_CURRENCIES) {
      if (tokenAddress !== zeroAddress) {
        logger.info(`Sending approve transaction for ${tokenAddress}`);
        await approveTokenToSafeLiquidator(liquidator.sdk, tokenAddress as Address);
        logger.info(`Approve transaction for ${tokenAddress} sent`);
      }
    }
  }
}

async function approveTokenToSafeLiquidator(ionicSdk: IonicSdk, erc20Address: Address) {
  // Build data
  const token = getContract({ address: erc20Address, abi: erc20Abi, client: ionicSdk.walletClient });

  if (process.env.NODE_ENV !== "production")
    ionicSdk.logger.info("Signing and sending approval transaction for: " + erc20Address);

  // send transaction
  let sentTx;
  try {
    sentTx = await token.write.approve([ionicSdk.contracts.IonicLiquidator.address, maxUint256], {
      account: ionicSdk.walletClient.account!.address,
      chain: ionicSdk.walletClient.chain,
    });
    const receipt = await ionicSdk.publicClient.waitForTransactionReceipt({ hash: sentTx });
    if (receipt.status === "reverted") {
      throw `Error sending approve transaction for ${erc20Address}`;
    }
  } catch (error) {
    throw "Error sending " + erc20Address + " approval transaction: " + error;
  }
  ionicSdk.logger.info("Successfully sent approval transaction for: " + erc20Address);
  return sentTx;
}
