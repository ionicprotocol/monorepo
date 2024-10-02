import { SendTransactionReturnType, TransactionReceipt } from "viem";

import { IonicBase } from "../../IonicSdk";

import { FlashSwapLiquidationTxParams } from "./utils";

export default async function sendTransactionToSafeLiquidator(
  sdk: IonicBase,
  params: FlashSwapLiquidationTxParams
): Promise<TransactionReceipt> {
  let sentTx: SendTransactionReturnType;
  // Sign transaction
  // Send transaction
    sentTx = await sdk.contracts.IonicLiquidator.write.safeLiquidateToTokensWithFlashLoan(
      [
        {
          borrower: params.borrower,
          cErc20: params.cErc20,
          cTokenCollateral: params.cTokenCollateral,
          debtFundingStrategies: params.debtFundingStrategies,
          debtFundingStrategiesData: params.debtFundingStrategiesData,
          flashSwapContract: params.flashSwapContract,
          minProfitAmount: params.minProfitAmount,
          redemptionStrategies: params.redemptionStrategies,
          repayAmount: params.repayAmount,
          strategyData: params.strategyData
        }
      ],
      { account: sdk.walletClient!.account!.address, chain: sdk.walletClient!.chain }
    );
    const receipt = await sdk.publicClient.waitForTransactionReceipt({ hash: sentTx });
    if (receipt.status === "reverted") {
      throw `Error sending safeLiquidateToTokensWithFlashLoan transaction: Transaction reverted with status 0`;
    }
    sdk.logger.info("Successfully sent safeLiquidateToTokensWithFlashLoan transaction hash:", sentTx);
    return receipt;
  }
