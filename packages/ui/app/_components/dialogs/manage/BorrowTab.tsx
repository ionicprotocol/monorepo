import { useEffect, useMemo } from 'react';

import { Info } from 'lucide-react';
import { formatUnits } from 'viem';

import { Alert, AlertDescription } from '@ui/components/ui/alert';
import { Button } from '@ui/components/ui/button';
import {
  HFPStatus,
  TransactionType,
  useManageDialogContext
} from '@ui/context/ManageDialogContext';
import { useBorrow } from '@ui/hooks/market/useBorrow';
import { useHealth } from '@ui/hooks/market/useHealth';

import Amount from '../../Amount';
import StatusAlerts from './StatusAlerts';
import TransactionStepsHandler from './TransactionStepsHandler';
import ResultHandler from '../../ResultHandler';
import MemoizedUtilizationStats from '../../UtilizationStats';
import { useMaxRepayAmount } from '@ui/hooks/useMaxRepayAmount';
import { useMaxBorrowAmount } from '@ui/hooks/useMaxBorrowAmount';

interface BorrowTabProps {
  capAmount: number;
  totalAmount: number;
  capFiat: number;
  totalFiat: number;
}

const BorrowTab = ({
  capAmount,
  totalAmount,
  capFiat,
  totalFiat
}: BorrowTabProps) => {
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

  const { data: maxAmount, isLoading: isLoadingMax } = useMaxBorrowAmount(
    selectedMarketData,
    comptrollerAddress,
    chainId
  );

  const {
    isWaitingForIndexing,
    borrowAmount,
    isPolling,
    borrowLimits,
    isUnderMinBorrow,
    amount,
    setAmount,
    utilizationPercentage,
    handleUtilization,
    amountAsBInt
  } = useBorrow({
    selectedMarketData,
    chainId,
    comptrollerAddress
  });

  const { isLoadingPredictedHealthFactor, healthFactor, hfpStatus } = useHealth(
    {
      comptrollerAddress,
      cToken: selectedMarketData.cToken,
      activeTab: 'borrow',
      amount: amountAsBInt,
      exchangeRate: selectedMarketData.exchangeRate,
      decimals: selectedMarketData.underlyingDecimals
    }
  );

  const isDisabled =
    !amount ||
    amountAsBInt === 0n ||
    isLoadingPredictedHealthFactor ||
    hfpStatus === HFPStatus.CRITICAL ||
    hfpStatus === HFPStatus.UNKNOWN;

  useEffect(() => {
    setPredictionAmount(amountAsBInt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountAsBInt]);

  const transactionSteps = useMemo(() => {
    return getStepsForTypes(TransactionType.BORROW);
  }, [getStepsForTypes]);

  return (
    <div className="space-y-4 pt-4">
      <Amount
        amount={amount}
        handleInput={(val?: string) => setAmount(val ?? '')}
        isLoading={isLoadingMax || isPolling}
        max={formatUnits(
          maxAmount?.bigNumber ?? 0n,
          selectedMarketData.underlyingDecimals
        )}
        symbol={selectedMarketData.underlyingSymbol}
        currentUtilizationPercentage={utilizationPercentage}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-x-8">
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

        <MemoizedUtilizationStats
          label="Total Supplied"
          value={totalAmount}
          max={capAmount}
          symbol={selectedMarketData.underlyingSymbol}
          valueInFiat={totalFiat}
          maxInFiat={capFiat}
        />
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
