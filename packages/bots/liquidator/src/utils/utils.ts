import { IonicSdk } from "@ionicprotocol/sdk";
import { TransactionRequest } from "viem";

export async function fetchGasLimitForTransaction(ionicSdk: IonicSdk, method: string, tx: TransactionRequest) {
  try {
    return await ionicSdk.publicClient.estimateGas(tx);
  } catch (error) {
    throw `Failed to estimate gas before signing and sending ${method} transaction: ${error}`;
  }
}
