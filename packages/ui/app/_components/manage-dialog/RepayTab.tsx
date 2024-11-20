import { useMemo } from 'react';

import toast from 'react-hot-toast';
import { formatUnits } from 'viem';

import { Alert, AlertDescription } from '@ui/components/ui/alert';
import { Button } from '@ui/components/ui/button';
import { INFO_MESSAGES } from '@ui/constants';
import { useManageDialogContext } from '@ui/context/ManageDialogContext';
import { useMultiIonic } from '@ui/context/MultiIonicContext';

import Amount from './Amount';
import SliderComponent from './Slider';
import TransactionStepsHandler, {
  useTransactionSteps
} from './TransactionStepsHandler';
import ResultHandler from '../ResultHandler';

interface RepayTabProps {
  maxAmount: bigint;
  isLoadingMax: boolean;
}

const RepayTab = ({ maxAmount, isLoadingMax }: RepayTabProps) => {
  const {
    selectedMarketData,
    amount,
    setAmount,
    currentUtilizationPercentage,
    handleUtilization,
    hfpStatus,
    transactionSteps,
    resetTransactionSteps,
    chainId,
    normalizedHealthFactor,
    normalizedPredictedHealthFactor,
    amountAsBInt,
    isLoadingUpdatedAssets,
    updatedValues
  } = useManageDialogContext();
  const { currentSdk, address } = useMultiIonic();

  const { addStepsForAction, upsertTransactionStep } = useTransactionSteps();
  const currentBorrowAmountAsFloat = useMemo<number>(
    () => parseFloat(selectedMarketData.borrowBalance.toString()),
    [selectedMarketData]
  );

  const repayAmount = async () => {
    if (
      !transactionSteps.length &&
      currentSdk &&
      address &&
      amount &&
      amountAsBInt > 0n &&
      currentBorrowAmountAsFloat
    ) {
      let currentTransactionStep = 0;
      addStepsForAction([
        {
          error: false,
          message: INFO_MESSAGES.REPAY.APPROVE,
          success: false
        },
        {
          error: false,
          message: INFO_MESSAGES.REPAY.REPAYING,
          success: false
        }
      ]);

      try {
        const token = currentSdk.getEIP20TokenInstance(
          selectedMarketData.underlyingToken,
          currentSdk.publicClient as any
        );
        const hasApprovedEnough =
          (await token.read.allowance([address, selectedMarketData.cToken])) >=
          amountAsBInt;

        if (!hasApprovedEnough) {
          const tx = await currentSdk.approve(
            selectedMarketData.cToken,
            selectedMarketData.underlyingToken,
            (amountAsBInt * 105n) / 100n
          );

          upsertTransactionStep({
            index: currentTransactionStep,
            transactionStep: {
              ...transactionSteps[currentTransactionStep],
              txHash: tx
            }
          });

          await currentSdk.publicClient.waitForTransactionReceipt({
            hash: tx,
            confirmations: 2
          });

          // wait for 5 seconds to resolve timing issue
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            success: true
          }
        });

        currentTransactionStep++;

        const isRepayingMax =
          amountAsBInt >= (selectedMarketData.borrowBalance ?? 0n);
        console.warn(
          'Repay params:',
          selectedMarketData.cToken,
          isRepayingMax,
          isRepayingMax
            ? selectedMarketData.borrowBalance.toString()
            : amountAsBInt.toString()
        );
        const { tx, errorCode } = await currentSdk.repay(
          selectedMarketData.cToken,
          isRepayingMax,
          isRepayingMax ? selectedMarketData.borrowBalance : amountAsBInt
        );

        if (errorCode) {
          console.error(errorCode);

          throw new Error('Error during repaying!');
        }

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            txHash: tx
          }
        });

        tx &&
          (await currentSdk.publicClient.waitForTransactionReceipt({
            hash: tx
          }));

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            success: true
          }
        });
      } catch (error) {
        console.error(error);

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            error: true
          }
        });

        toast.error('Error while repaying!');
      }
    }
  };

  const healthFactor = {
    current: normalizedHealthFactor ?? '0',
    predicted: normalizedPredictedHealthFactor ?? '0'
  };

  return (
    <div className="space-y-4">
      <Amount
        amount={amount}
        handleInput={setAmount}
        isLoading={isLoadingMax}
        max={formatUnits(maxAmount, selectedMarketData.underlyingDecimals)}
        selectedMarketData={selectedMarketData}
        symbol={selectedMarketData.underlyingSymbol}
      />

      <SliderComponent
        currentUtilizationPercentage={currentUtilizationPercentage}
        handleUtilization={handleUtilization}
      />

      {hfpStatus === 'CRITICAL' && (
        <Alert variant="destructive">
          <AlertDescription>Health factor too low.</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-400">
          <span>CURRENTLY BORROWING</span>
          <div className="flex items-center">
            <span className="text-error">
              {updatedValues.borrowBalanceFrom}
            </span>
            <span className="mx-1">→</span>
            <ResultHandler isLoading={isLoadingUpdatedAssets}>
              <span className="text-accent">
                {updatedValues.borrowBalanceTo}
              </span>
            </ResultHandler>
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-400 uppercase">
          <span>Market Borrow APR</span>
          <div className="flex items-center">
            <span>{updatedValues.borrowAPR}%</span>
            <span className="mx-1">→</span>
            <ResultHandler isLoading={isLoadingUpdatedAssets}>
              {updatedValues.updatedBorrowAPR}%
            </ResultHandler>
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-400 uppercase">
          <span>Health Factor</span>
          <div className="flex items-center">
            <span>{healthFactor.current}</span>
            <span className="mx-1">→</span>
            <ResultHandler isLoading={isLoadingUpdatedAssets}>
              {healthFactor.predicted}
            </ResultHandler>
          </div>
        </div>
      </div>

      {transactionSteps.length > 0 ? (
        <TransactionStepsHandler
          chainId={chainId}
          resetTransactionSteps={resetTransactionSteps}
          transactionSteps={transactionSteps}
        />
      ) : (
        <Button
          className="w-full"
          disabled={
            !amount || amountAsBInt === 0n || !currentBorrowAmountAsFloat
          }
          onClick={repayAmount}
        >
          Repay {selectedMarketData.underlyingSymbol}
        </Button>
      )}
    </div>
  );
};

export default RepayTab;
