import { TransactionRequest } from "@ethersproject/providers";
import { IonicSdk } from "@ionicprotocol/sdk";

export async function fetchGasLimitForTransaction(ionicSdk: IonicSdk, method: string, tx: TransactionRequest) {
  try {
    return await ionicSdk.provider.estimateGas(tx);
  } catch (error) {
    throw `Failed to estimate gas before signing and sending ${method} transaction: ${error}`;
  }
}
