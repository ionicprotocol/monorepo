import millify from 'millify';
import toast from 'react-hot-toast';
import { formatUnits } from 'viem';

import { Alert, AlertDescription } from '@ui/components/ui/alert';
import { Button } from '@ui/components/ui/button';
import { Separator } from '@ui/components/ui/separator';
import { INFO_MESSAGES } from '@ui/constants';
import {
  HFPStatus,
  useManageDialogContext
} from '@ui/context/ManageDialogContext';
import { useMultiIonic } from '@ui/context/MultiIonicContext';

import Amount from './Amount';
import MemoizedDonutChart from './DonutChart';
import SliderComponent from './Slider';
import TransactionStepsHandler, {
  useTransactionSteps
} from './TransactionStepsHandler';
import ResultHandler from '../../ResultHandler';

interface BorrowTabProps {
  maxAmount: bigint;
  isLoadingMax: boolean;
  totalStats?: {
    capAmount: number;
    totalAmount: number;
    capFiat: number;
    totalFiat: number;
  };
}

const BorrowTab = ({ maxAmount, isLoadingMax, totalStats }: BorrowTabProps) => {
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
    minBorrowAmount,
    maxBorrowAmount,
    isLoadingPredictedHealthFactor,
    isLoadingUpdatedAssets,
    updatedValues
  } = useManageDialogContext();

  const isDisabled =
    !amount ||
    amountAsBInt === 0n ||
    isLoadingPredictedHealthFactor ||
    hfpStatus === HFPStatus.CRITICAL ||
    hfpStatus === HFPStatus.UNKNOWN;

  const healthFactor = {
    current: normalizedHealthFactor ?? '0',
    predicted: normalizedPredictedHealthFactor ?? '0'
  };

  const borrowLimits = {
    min: formatUnits(
      minBorrowAmount?.minBorrowAsset ?? 0n,
      selectedMarketData.underlyingDecimals
    ),
    max:
      maxBorrowAmount?.number?.toFixed(
        parseInt(selectedMarketData.underlyingDecimals.toString())
      ) ?? '0.00'
  };

  const isUnderMinBorrow =
    amount &&
    borrowLimits.min &&
    parseFloat(amount) < parseFloat(borrowLimits.min);

  const { currentSdk, address } = useMultiIonic();

  const { addStepsForAction, upsertTransactionStep } = useTransactionSteps();

  const borrowAmount = async () => {
    if (
      !transactionSteps.length &&
      currentSdk &&
      address &&
      amount &&
      amountAsBInt > 0n &&
      minBorrowAmount &&
      amountAsBInt >= (minBorrowAmount.minBorrowAsset ?? 0n) &&
      maxBorrowAmount &&
      amountAsBInt <= maxBorrowAmount.bigNumber
    ) {
      const currentTransactionStep = 0;
      addStepsForAction([
        {
          error: false,
          message: INFO_MESSAGES.BORROW.BORROWING,
          success: false
        }
      ]);

      try {
        const { tx, errorCode } = await currentSdk.borrow(
          selectedMarketData.cToken,
          amountAsBInt
        );

        if (errorCode) {
          console.error(errorCode);

          throw new Error('Error during borrowing!');
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

        toast.success(
          `Borrowed ${amount} ${selectedMarketData.underlyingSymbol}`
        );
      } catch (error) {
        console.error(error);

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            error: true
          }
        });

        toast.error('Error while borrowing!');
      }
    }
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

      {isUnderMinBorrow && (
        <Alert variant="default">
          <AlertDescription>
            Amount must be greater than minimum borrow amount (
            {borrowLimits.min} {selectedMarketData.underlyingSymbol})
          </AlertDescription>
        </Alert>
      )}

      {hfpStatus === 'UNKNOWN' && (
        <Alert variant="default">
          <AlertDescription>
            Unable to calculate health factor.
          </AlertDescription>
        </Alert>
      )}

      {hfpStatus === 'WARNING' && (
        <Alert>
          <AlertDescription>
            You are close to the liquidation threshold. Manage your health
            factor carefully.
          </AlertDescription>
        </Alert>
      )}

      {hfpStatus === 'CRITICAL' && (
        <Alert variant="destructive">
          <AlertDescription>Health factor too low.</AlertDescription>
        </Alert>
      )}

      <Separator className="my-4 bg-white/50" />

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-400">
          <span>MIN BORROW</span>
          <span>{borrowLimits.min}</span>
        </div>

        <div className="flex justify-between text-xs text-gray-400">
          <span>MAX BORROW</span>
          <span>{borrowLimits.max}</span>
        </div>

        <div className="flex justify-between text-xs text-gray-400">
          <span>CURRENTLY BORROWING</span>
          <div className="flex items-center">
            <span>{updatedValues.borrowBalanceFrom}</span>
            <span className="mx-1">→</span>
            <ResultHandler
              height={16}
              width={16}
              isLoading={isLoadingUpdatedAssets}
            >
              {updatedValues.borrowBalanceTo}
            </ResultHandler>
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-400 uppercase">
          <span>Market Borrow APR</span>
          <div className="flex items-center">
            <span>{updatedValues.borrowAPR?.toFixed(2)}%</span>
            <span className="mx-1">→</span>
            <ResultHandler
              height={16}
              width={16}
              isLoading={isLoadingUpdatedAssets}
            >
              {updatedValues.updatedBorrowAPR?.toFixed(2)}%
            </ResultHandler>
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-400 uppercase">
          <span>Health Factor</span>
          <div className="flex items-center">
            <span>{healthFactor.current}</span>
            <span className="mx-1">→</span>
            <ResultHandler
              width={16}
              height={16}
              isLoading={isLoadingUpdatedAssets}
            >
              {healthFactor.predicted}
            </ResultHandler>
          </div>
        </div>
      </div>

      <Separator className="my-4 bg-white/50" />

      {totalStats && (
        <div className="flex items-center justify-center">
          <div className="w-20 mr-4">
            <MemoizedDonutChart
              max={totalStats.capAmount}
              value={totalStats.totalAmount}
            />
          </div>
          <div>
            <div className="text-gray-400">Total Borrowed:</div>
            <div className="text-white">
              <strong>
                {millify(totalStats.totalAmount)} of{' '}
                {millify(totalStats.capAmount)}{' '}
                {selectedMarketData.underlyingSymbol}
              </strong>
            </div>
            <div className="text-sm text-gray-300">
              ${millify(totalStats.totalFiat)} of ${millify(totalStats.capFiat)}
            </div>
          </div>
        </div>
      )}

      {transactionSteps.length > 0 ? (
        <TransactionStepsHandler
          chainId={chainId}
          resetTransactionSteps={resetTransactionSteps}
          transactionSteps={transactionSteps}
        />
      ) : (
        <Button
          className="w-full"
          disabled={isDisabled || !!isUnderMinBorrow}
          onClick={borrowAmount}
        >
          Borrow {selectedMarketData.underlyingSymbol}
        </Button>
      )}
    </div>
  );
};

export default BorrowTab;
