import { TransactionRequest } from "@ethersproject/providers";
import { BigNumber, Wallet } from "ethers";

import { IonicBase } from "../../IonicSdk";

import { fetchGasLimitForTransaction, fetchGasPrice } from "./utils";

export default async function sendTransactionToSafeLiquidator(
  sdk: IonicBase,
  method: string | any,
  params: Array<any> | any,
  value: number | BigNumber
) {
  // Build data
  const data = sdk.contracts.IonicLiquidator.interface.encodeFunctionData(method, params);
  const txCount = await sdk.provider.getTransactionCount(process.env.ETHEREUM_ADMIN_ACCOUNT!);
  const signer = new Wallet(process.env.ETHEREUM_ADMIN_PRIVATE_KEY!, sdk.provider);

  // Build transaction
  const tx = {
    from: process.env.ETHEREUM_ADMIN_ACCOUNT,
    to: sdk.contracts.IonicLiquidator.address,
    value: value,
    data: data,
    nonce: txCount
  };
  // Estimate gas for transaction
  const gasLimit = await fetchGasLimitForTransaction(sdk, method, tx);
  const gasPrice = await fetchGasPrice(sdk, method);
  const txRequest: TransactionRequest = {
    ...tx,
    gasLimit,
    gasPrice
  };

  sdk.logger.info("Signing and sending", method, "transaction:", tx);

  let sentTx;
  // Sign transaction
  // Send transaction
  try {
    sentTx = await signer.sendTransaction(txRequest);
    const receipt = await sentTx.wait();
    if (receipt.status === 0) {
      throw `Error sending ${method} transaction: Transaction reverted with status 0`;
    }
    sdk.logger.info("Successfully sent", method, "transaction hash:", sentTx.hash);
    return sentTx;
  } catch (error) {
    throw `Error sending ${method}, transaction: ${error}`;
  }
}
