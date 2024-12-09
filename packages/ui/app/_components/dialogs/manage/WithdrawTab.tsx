import { useEffect, useMemo } from 'react';

import { formatUnits } from 'viem';

import { Button } from '@ui/components/ui/button';
import {
  HFPStatus,
  TransactionType,
  useManageDialogContext
} from '@ui/context/ManageDialogContext';
import { useHealth } from '@ui/hooks/market/useHealth';
import { useWithdraw } from '@ui/hooks/market/useWithdraw';

import Amount from '../../Amount';
import StatusAlerts from './StatusAlerts';
import TransactionStepsHandler from './TransactionStepsHandler';
import ResultHandler from '../../ResultHandler';
import MemoizedUtilizationStats from '../../UtilizationStats';

interface WithdrawTabProps {
  maxAmount: bigint;
  isLoadingMax: boolean;
  totalStats?: {
    capAmount: number;
    totalAmount: number;
    capFiat: number;
    totalFiat: number;
  };
}

const WithdrawTab = ({
  maxAmount,
  isLoadingMax,
  totalStats
}: WithdrawTabProps) => {
  const {
    selectedMarketData,
    resetTransactionSteps,
    chainId,
    updatedValues,
    isLoadingUpdatedAssets,
    comptrollerAddress,
    setPredictionAmount,
    getStepsForTypes // Add this from context
  } = useManageDialogContext();

  const {
    isWaitingForIndexing,
    withdrawAmount,
    isPolling,
    amount,
    setAmount,
    utilizationPercentage,
    handleUtilization,
    amountAsBInt
  } = useWithdraw({
    maxAmount,
    selectedMarketData,
    chainId
  });

  const { isLoadingPredictedHealthFactor, healthFactor, hfpStatus } = useHealth(
    {
      comptrollerAddress,
      cToken: selectedMarketData.cToken,
      activeTab: 'withdraw',
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
    return getStepsForTypes(TransactionType.WITHDRAW);
  }, [getStepsForTypes]);

  return (
    <div className="space-y-4 pt-4">
      <Amount
        amount={amount}
        handleInput={(val?: string) => setAmount(val ?? '')}
        isLoading={isLoadingMax || isPolling}
        max={formatUnits(maxAmount, selectedMarketData.underlyingDecimals)}
        symbol={selectedMarketData.underlyingSymbol}
        hintText="Max Withdraw"
        currentUtilizationPercentage={utilizationPercentage}
        handleUtilization={handleUtilization}
      />

      <StatusAlerts
        status={hfpStatus}
        availableStates={[
          HFPStatus.CRITICAL,
          HFPStatus.WARNING,
          HFPStatus.UNKNOWN
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-x-8">
        <div className="space-y-4 content-center">
          <div className="flex justify-between text-xs text-gray-400 uppercase">
            <span>Market Supply Balance</span>
            <div className="flex items-center">
              <span>{updatedValues.supplyBalanceFrom}</span>
              <span className="mx-1">→</span>
              <ResultHandler
                height={16}
                width={16}
                isLoading={isLoadingUpdatedAssets}
              >
                {updatedValues.supplyBalanceTo}
              </ResultHandler>
            </div>
          </div>

          <div className="flex justify-between text-xs text-gray-400 uppercase">
            <span>Market Supply APR</span>
            <div className="flex items-center">
              <span>{updatedValues.supplyAPY?.toFixed(2)}%</span>
              <span className="mx-1">→</span>
              <ResultHandler
                isLoading={isLoadingUpdatedAssets || isPolling}
                height={16}
                width={16}
              >
                {updatedValues.updatedSupplyAPY?.toFixed(2)}%
              </ResultHandler>
            </div>
          </div>

          <div className="flex justify-between text-xs text-gray-400 uppercase">
            <span>Health Factor</span>
            <div className="flex items-center">
              <span>{healthFactor.current}</span>
              <span className="mx-1">→</span>
              <ResultHandler
                height={16}
                width={16}
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
          disabled={isDisabled}
          onClick={withdrawAmount}
        >
          {isWaitingForIndexing
            ? 'Updating Balances...'
            : `Withdraw ${selectedMarketData.underlyingSymbol}`}
        </Button>
      )}
    </div>
  );
};

export default WithdrawTab;
