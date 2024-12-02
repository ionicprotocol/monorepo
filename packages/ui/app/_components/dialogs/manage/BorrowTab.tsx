import { Info } from 'lucide-react';
import { formatUnits } from 'viem';

import { Alert, AlertDescription } from '@ui/components/ui/alert';
import { Button } from '@ui/components/ui/button';
import {
  HFPStatus,
  useManageDialogContext
} from '@ui/context/ManageDialogContext';
import { useBorrow } from '@ui/hooks/market/useBorrow';

import Amount from './Amount';
import StatusAlerts from './StatusAlerts';
import TransactionStepsHandler from './TransactionStepsHandler';
import ResultHandler from '../../ResultHandler';
import MemoizedUtilizationStats from '../../UtilizationStats';

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
    resetTransactionSteps,
    chainId,
    normalizedHealthFactor,
    normalizedPredictedHealthFactor,
    amountAsBInt,
    isLoadingPredictedHealthFactor,
    isLoadingUpdatedAssets,
    updatedValues
  } = useManageDialogContext();

  const {
    isWaitingForIndexing,
    borrowAmount,
    transactionSteps,
    isPolling,
    borrowLimits,
    isUnderMinBorrow
  } = useBorrow();

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
