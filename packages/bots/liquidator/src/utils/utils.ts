import { TransactionRequest } from "@ethersproject/providers";
import { MidasSdk } from "@ionicprotocol/sdk";

export async function fetchGasLimitForTransaction(midasSdk: MidasSdk, method: string, tx: TransactionRequest) {
  try {
    return await midasSdk.provider.estimateGas(tx);
  } catch (error) {
    throw `Failed to estimate gas before signing and sending ${method} transaction: ${error}`;
  }
}
