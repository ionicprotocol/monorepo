import { Address, encodeFunctionData, SendTransactionReturnType, TransactionReceipt, TransactionRequest } from "viem";

import { ionicLiquidatorAbi } from "../../generated";
import { IonicBase } from "../../IonicSdk";

import { fetchGasLimitForTransaction, fetchGasPrice } from "./utils";

export default async function sendTransactionToSafeLiquidator(
  sdk: IonicBase,
  method: string | any,
  params: Array<any> | any,
  value: bigint
): Promise<TransactionReceipt> {
  // Build data
  const data = encodeFunctionData({
    abi: ionicLiquidatorAbi,
    functionName: "safeLiquidateToTokensWithFlashLoan",
    args: [
      {
        borrower: params[0].borrower,
        repayAmount: params[0].repayAmount,
        cErc20: params[0].cErc20,
        cTokenCollateral: params[0].cTokenCollateral,
        flashSwapContract: params[0].flashSwapContract,
        minProfitAmount: params[0].minProfitAmount,
        redemptionStrategies: params[0].redemptionStrategies,
        strategyData: params[0].strategyData,
        debtFundingStrategies: params[0].debtFundingStrategies,
        debtFundingStrategiesData: params[0].debtFundingStrategiesData
      }
    ]
  });
  const txCount = await sdk.publicClient.getTransactionCount({
    address: process.env.ETHEREUM_ADMIN_ACCOUNT! as Address
  });

  // Build transaction
  const tx = {
    from: process.env.ETHEREUM_ADMIN_ACCOUNT! as Address,
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
    gas: gasLimit,
    gasPrice
  };

  sdk.logger.info("Signing and sending", method, "transaction:", tx);

  let sentTx: SendTransactionReturnType;
  // Sign transaction
  // Send transaction
  try {
    sentTx = await sdk.walletClient!.sendTransaction({
      ...txRequest,
      account: sdk.walletClient!.account!.address,
      chain: sdk.walletClient!.chain
    });
    const receipt = await sdk.publicClient.waitForTransactionReceipt({ hash: sentTx });
    if (receipt.status === "reverted") {
      throw `Error sending ${method} transaction: Transaction reverted with status 0`;
    }
    sdk.logger.info("Successfully sent", method, "transaction hash:", sentTx);
    return receipt;
  } catch (error) {
    throw `Error sending ${method}, transaction: ${error}`;
  }
}
