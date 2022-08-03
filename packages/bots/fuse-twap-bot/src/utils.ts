import { TransactionRequest } from "@ethersproject/providers";
import { MidasSdk } from "@midas-capital/sdk";
import { ethers, Wallet } from "ethers";

export async function fetchGasLimitForTransaction(midasSdk: MidasSdk, method: string, tx: TransactionRequest) {
  try {
    return await midasSdk.provider.estimateGas(tx);
  } catch (error) {
    throw `Failed to estimate gas before signing and sending ${method} transaction: ${error}`;
  }
}

export async function getPriceOracle(midasSdk: MidasSdk) {
  const uniswapTwap = midasSdk.chainDeployment.UniswapTwapPriceOracleV2Root;
  const signer = new Wallet(process.env.ETHEREUM_ADMIN_PRIVATE_KEY!, midasSdk.provider);
  return new ethers.Contract(uniswapTwap.address, uniswapTwap.abi, signer);
}
