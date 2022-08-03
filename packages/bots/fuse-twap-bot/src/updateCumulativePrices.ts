import { TransactionRequest, TransactionResponse } from "@ethersproject/providers";
import { MidasSdk } from "@midas-capital/sdk";
import { Wallet } from "ethers";

import { fetchGasLimitForTransaction, getPriceOracle } from "./utils";

import { logger } from "./index";

export default async function updateCumulativePrices(
  pairs: Array<string>,
  useNonce: false | number,
  midasSdk: MidasSdk
) {
  const rootPriceOracleContract = await getPriceOracle(midasSdk);
  const signer = new Wallet(process.env.ETHEREUM_ADMIN_PRIVATE_KEY!, midasSdk.provider);

  // Create update transaction
  let method: string;
  let args: Array<any>;

  if (pairs.length > 1) {
    method = "update(address[])";
    args = [pairs];
  } else {
    method = "update(address)";
    args = [pairs[0]];
  }
  // @ts-ignore
  const data = rootPriceOracleContract.interface.encodeFunctionData(method, args);

  // Build transaction
  const tx = {
    from: process.env.ETHEREUM_ADMIN_ACCOUNT,
    to: rootPriceOracleContract.address,
    value: 0,
    data: data,
    nonce: useNonce ? useNonce : await midasSdk.provider.getTransactionCount(process.env.ETHEREUM_ADMIN_ACCOUNT!),
  };

  let txRequest: TransactionRequest = {
    ...tx,
  };

  if (useNonce !== undefined && useNonce !== null) {
    const gasPrice = (await midasSdk.provider.getGasPrice()).mul(250).div(100);
    txRequest = { ...txRequest, gasPrice: gasPrice };
  }

  logger.info("Signing and sending update transaction:", tx);

  // Estimate gas for transaction
  try {
    const gasLimit = await fetchGasLimitForTransaction(midasSdk, "update", txRequest);
    txRequest = { ...txRequest, gasLimit: gasLimit };
    logger.info(`Gas limit estimation: ${gasLimit}`);
  } catch (error) {
    logger.error("Failed to estimate gas before signing and sending update transaction: " + error);
  }

  // send transaction
  let sentTx: TransactionResponse;
  try {
    sentTx = await signer.sendTransaction(txRequest);
    await sentTx.wait();
  } catch (error) {
    throw "Error sending transaction: " + error;
  }
  logger.info("Successfully sent update transaction:", sentTx);
  return sentTx;
}
