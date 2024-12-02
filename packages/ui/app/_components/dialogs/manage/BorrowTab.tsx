import { useState } from 'react';

import { Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatUnits } from 'viem';

import { Alert, AlertDescription } from '@ui/components/ui/alert';
import { Button } from '@ui/components/ui/button';
import { INFO_MESSAGES } from '@ui/constants';
import {
  HFPStatus,
  useManageDialogContext
} from '@ui/context/ManageDialogContext';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useBalancePolling } from '@ui/hooks/useBalancePolling';
import { useMaxBorrowAmount } from '@ui/hooks/useMaxBorrowAmount';

import Amount from './Amount';
import StatusAlerts from './StatusAlerts';
import TransactionStepsHandler, {
  useTransactionSteps
} from './TransactionStepsHandler';
import ResultHandler from '../../ResultHandler';
import MemoizedUtilizationStats from '../../UtilizationStats';

import type { Address } from 'viem';

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
  const [txHash, setTxHash] = useState<Address>();
  const [isWaitingForIndexing, setIsWaitingForIndexing] = useState(false);

  const {
    selectedMarketData,
    amount,
    setAmount,
    currentUtilizationPercentage,
    handleUtilization,
    hfpStatus,
    resetTransactionSteps,
    chainId,
    normalizedHealthFactor,
    normalizedPredictedHealthFactor,
    amountAsBInt,
    minBorrowAmount,
    maxBorrowAmount,
    isLoadingPredictedHealthFactor,
    isLoadingUpdatedAssets,
    updatedValues,
    comptrollerAddress
  } = useManageDialogContext();

  const { refetch: refetchMaxBorrow } = useMaxBorrowAmount(
    selectedMarketData,
    comptrollerAddress,
    chainId
  );
  const { currentSdk, address } = useMultiIonic();

  const { isPolling } = useBalancePolling({
    address,
    chainId,
    txHash,
    enabled: isWaitingForIndexing,
    onSuccess: () => {
      setIsWaitingForIndexing(false);
      setTxHash(undefined);
      refetchMaxBorrow();
      toast.success(
        `Borrowed ${amount} ${selectedMarketData.underlyingSymbol}`
      );
    }
  });

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

  const { addStepsForAction, transactionSteps, upsertTransactionStep } =
    useTransactionSteps();

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

        if (tx) {
          await currentSdk.publicClient.waitForTransactionReceipt({
            hash: tx
          });

          setTxHash(tx);
          setIsWaitingForIndexing(true);

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
        }
      } catch (error) {
        console.error(error);
        setIsWaitingForIndexing(false);
        setTxHash(undefined);

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
    <div className="space-y-4 pt-4">
      <Amount
        amount={amount}
        handleInput={setAmount}
        isLoading={isLoadingMax || isPolling}
        max={formatUnits(maxAmount, selectedMarketData.underlyingDecimals)}
        symbol={selectedMarketData.underlyingSymbol}
        currentUtilizationPercentage={currentUtilizationPercentage}
        handleUtilization={handleUtilization}
      />

      {/* <SliderComponent /> */}

      {isUnderMinBorrow && (
        <Alert
          variant="default"
          className="py-2 border-0 bg-opacity-90"
        >
          <div className="flex items-center">
            <Info className="mr-2 h-4 w-4 text-white" />
            <AlertDescription>
              Amount must be greater than minimum borrow amount (
              {borrowLimits.min} {selectedMarketData.underlyingSymbol})
            </AlertDescription>
          </div>
        </Alert>
      )}

      <StatusAlerts
        status={hfpStatus}
        availableStates={[
          HFPStatus.CRITICAL,
          HFPStatus.UNKNOWN,
          HFPStatus.WARNING
        ]}
      />

      <div className="grid grid-cols-2 gap-x-8">
        {/* Left Column */}
        <div className="space-y-4 content-center">
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
                isLoading={isLoadingUpdatedAssets || isPolling}
                height={16}
                width={16}
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

        {/* Right Column */}
        {totalStats && (
          <MemoizedUtilizationStats
            label="Total Supplied"
            value={totalStats.totalAmount}
            max={totalStats.capAmount}
            symbol={selectedMarketData.underlyingSymbol}
            valueInFiat={totalStats.totalFiat}
            maxInFiat={totalStats.capFiat}
          />
        )}
      </div>

      {transactionSteps.length > 0 ? (
        <div className="flex justify-center">
          <TransactionStepsHandler
            chainId={chainId}
            resetTransactionSteps={resetTransactionSteps}
            transactionSteps={transactionSteps}
          />
        </div>
      ) : (
        <Button
          className="w-full bg-accent"
          disabled={isDisabled || !!isUnderMinBorrow || isWaitingForIndexing}
          onClick={borrowAmount}
        >
          {isWaitingForIndexing
            ? 'Updating Balances...'
            : `Borrow ${selectedMarketData.underlyingSymbol}`}
        </Button>
      )}
    </div>
  );
};

export default BorrowTab;
