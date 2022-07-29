import { TransactionRequest } from "@ethersproject/providers";
import { MidasSdk } from "@midas-capital/sdk";
import { BigNumber, Wallet } from "ethers";

import { fetchGasLimitForTransaction } from "./utils";

import { logger } from "./index";

export default async function sendTransactionToSafeLiquidator(
  midasSdk: MidasSdk,
  method: string | any,
  params: Array<any> | any,
  value: number | BigNumber
) {
  // Build data
  const data = midasSdk.contracts.FuseSafeLiquidator.interface.encodeFunctionData(method, params);
  const txCount = await midasSdk.provider.getTransactionCount(process.env.ETHEREUM_ADMIN_ACCOUNT!);
  const signer = new Wallet(process.env.ETHEREUM_ADMIN_PRIVATE_KEY!, midasSdk.provider);

  // Build transaction
  const tx = {
    from: process.env.ETHEREUM_ADMIN_ACCOUNT,
    to: midasSdk.contracts.FuseSafeLiquidator.address,
    value: value,
    data: data,
    nonce: txCount,
  };
  // Estimate gas for transaction
  const gasLimit = await fetchGasLimitForTransaction(midasSdk, method, tx);
  const txRequest: TransactionRequest = {
    ...tx,
    gasLimit: gasLimit,
  };

  if (process.env.NODE_ENV !== "production") logger.info("Signing and sending", method, "transaction:", tx);

  let sentTx;
  // Sign transaction
  // Send transaction
  try {
    sentTx = await signer.sendTransaction(txRequest);
  } catch (error) {
    const msg = `Error sending ${method}, transaction: ${error}`;
    logger.error(msg);
    throw msg;
  }
  logger.info("Successfully sent", method, "transaction hash:", sentTx.hash);
  return sentTx;
}
