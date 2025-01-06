import { useEffect, useMemo } from 'react';

import { formatUnits } from 'viem';

import MaxDeposit from '@ui/components/MaxDeposit';
import ResultHandler from '@ui/components/ResultHandler';
import { Button } from '@ui/components/ui/button';
import MemoizedUtilizationStats from '@ui/components/UtilizationStats';
import {
  HFPStatus,
  TransactionType,
  useManageDialogContext
} from '@ui/context/ManageDialogContext';
import { useHealth } from '@ui/hooks/market/useHealth';
import { useRepay } from '@ui/hooks/market/useRepay';
import { useMaxRepayAmount } from '@ui/hooks/useMaxRepayAmount';

import StatusAlerts from '../StatusAlerts';
import TransactionStepsHandler from '../TransactionStepsHandler';

interface RepayTabProps {
  capAmount: number;
  totalAmount: number;
  capFiat: number;
  totalFiat: number;
}

const RepayTab = ({
  capAmount,
  totalAmount,
  capFiat,
  totalFiat
}: RepayTabProps) => {
  const {
    selectedMarketData,
    resetTransactionSteps,
    chainId,
    isLoadingUpdatedAssets,
    updatedValues,
    comptrollerAddress,
    setPredictionAmount,
    getStepsForTypes,
    isSliding
  } = useManageDialogContext();

  const { data: maxAmount, isLoading: isLoadingMax } = useMaxRepayAmount(
    selectedMarketData,
    chainId
  );

  const {
    isWaitingForIndexing,
    repayAmount,
    isPolling,
    currentBorrowAmountAsFloat,
    amount,
    setAmount,
    amountAsBInt
  } = useRepay({
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
      <MaxDeposit
        max={formatUnits(
          maxAmount ?? 0n,
          selectedMarketData.underlyingDecimals
        )}
        isLoading={isLoadingMax || isPolling}
        amount={amount}
        tokenName={selectedMarketData.underlyingSymbol}
        handleInput={(val?: string) => setAmount(val ?? '')}
        chain={chainId}
        headerText="Repay Amount"
        decimals={selectedMarketData.underlyingDecimals}
        showUtilizationSlider
        hintText="Max Repay"
      />

      <StatusAlerts
        status={hfpStatus}
        availableStates={[HFPStatus.CRITICAL]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-x-8">
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
                isLoading={isSliding || isLoadingUpdatedAssets}
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
                isLoading={isSliding || isLoadingUpdatedAssets || isPolling}
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
                isLoading={isSliding || isLoadingUpdatedAssets}
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
