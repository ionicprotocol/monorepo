import { useEffect, useMemo } from 'react';

import { formatUnits } from 'viem';

import { Button } from '@ui/components/ui/button';
import {
  HFPStatus,
  TransactionType,
  useManageDialogContext
} from '@ui/context/ManageDialogContext';
import { useHealth } from '@ui/hooks/market/useHealth';
import { useRepay } from '@ui/hooks/market/useRepay';

import Amount from './Amount';
import StatusAlerts from './StatusAlerts';
import TransactionStepsHandler from './TransactionStepsHandler';
import ResultHandler from '../../ResultHandler';
import MemoizedUtilizationStats from '../../UtilizationStats';

interface RepayTabProps {
  maxAmount: bigint;
  isLoadingMax: boolean;
  totalStats?: {
    capAmount: number;
    totalAmount: number;
    capFiat: number;
    totalFiat: number;
  };
}

const RepayTab = ({ maxAmount, isLoadingMax, totalStats }: RepayTabProps) => {
  const {
    selectedMarketData,
    resetTransactionSteps,
    chainId,
    isLoadingUpdatedAssets,
    updatedValues,
    comptrollerAddress,
    setPredictionAmount,
    getStepsForTypes
  } = useManageDialogContext();

  const {
    isWaitingForIndexing,
    repayAmount,
    isPolling,
    currentBorrowAmountAsFloat,
    amount,
    setAmount,
    utilizationPercentage,
    handleUtilization,
    amountAsBInt
  } = useRepay({
    maxAmount,
    selectedMarketData,
    chainId
  });

  const { healthFactor, hfpStatus } = useHealth({
    comptrollerAddress,
    cToken: selectedMarketData.cToken,
    activeTab: 'repay',
    amount: amountAsBInt,
    exchangeRate: selectedMarketData.exchangeRate,
    decimals: selectedMarketData.underlyingDecimals
  });

  useEffect(() => {
    setPredictionAmount(amountAsBInt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountAsBInt]);

  const transactionSteps = useMemo(() => {
    return getStepsForTypes(TransactionType.REPAY);
  }, [getStepsForTypes]);

  return (
    <div className="space-y-4 pt-4">
      <Amount
        amount={amount}
        handleInput={(val?: string) => setAmount(val ?? '')}
        isLoading={isLoadingMax || isPolling}
        max={formatUnits(maxAmount, selectedMarketData.underlyingDecimals)}
        symbol={selectedMarketData.underlyingSymbol}
        currentUtilizationPercentage={utilizationPercentage}
        handleUtilization={handleUtilization}
      />

      <StatusAlerts
        status={hfpStatus}
        availableStates={[HFPStatus.CRITICAL]}
      />

      <div className="grid grid-cols-2 gap-x-8">
        <div className="space-y-4 content-center">
          <div className="flex justify-between text-xs text-gray-400">
            <span>CURRENTLY BORROWING</span>
            <div className="flex items-center">
              <span className="text-error">
                {updatedValues.borrowBalanceFrom}
              </span>
              <span className="mx-1">→</span>
              <ResultHandler
                width={16}
                height={16}
                isLoading={isLoadingUpdatedAssets}
              >
                <span className="text-accent">
                  {updatedValues.borrowBalanceTo}
                </span>
              </ResultHandler>
            </div>
          </div>

          <div className="flex justify-between text-xs text-gray-400 uppercase">
            <span>Market Borrow APR</span>
            <div className="flex items-center">
              <span>{updatedValues.borrowAPR?.toFixed(2)}%</span>
              <span className="mx-1">→</span>
              <ResultHandler
                isLoading={isLoadingUpdatedAssets || isPolling}
                width={16}
                height={16}
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
          className="w-full bg-accent hover:bg-accent/80"
          disabled={
            !amount || amountAsBInt === 0n || !currentBorrowAmountAsFloat
          }
          onClick={repayAmount}
        >
          {isWaitingForIndexing
            ? 'Updating Balances...'
            : `Repay ${selectedMarketData.underlyingSymbol}`}
        </Button>
      )}
    </div>
  );
};

export default RepayTab;
