import { encodeFunctionData, getContract, SendTransactionReturnType, TransactionReceipt } from "viem";

import { ionicLiquidatorAbi } from "../../generated";
import { IonicBase } from "../../IonicSdk";

export default async function sendTransactionToSafeLiquidator(
  sdk: IonicBase,
  method: string | any,
  params: Array<any> | any
): Promise<TransactionReceipt> {
  sdk.logger.info("Signing and sending safeLiquidateToTokensWithFlashLoan, params:", params);

  let sentTx: SendTransactionReturnType;
  // Sign transaction
  // Send transaction
  const liquidator = getContract({
    abi: ionicLiquidatorAbi,
    address: sdk.contracts.IonicLiquidator.address,
    client: sdk.walletClient!
  });
  try {
    sentTx = await liquidator.write.safeLiquidateToTokensWithFlashLoan(
      [
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
      ],
      { account: sdk.walletClient!.account!, chain: sdk.walletClient!.chain! }
    );
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
