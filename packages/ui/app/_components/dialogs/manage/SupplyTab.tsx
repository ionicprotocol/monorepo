import { useMemo } from 'react';

import { formatUnits } from 'viem';

import { Button } from '@ui/components/ui/button';
import { Switch } from '@ui/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@ui/components/ui/tooltip';
import { useManageDialogContext } from '@ui/context/ManageDialogContext';
import { useCollateralToggle } from '@ui/hooks/market/useCollateralToggle';
import { useSupply } from '@ui/hooks/market/useSupply';

import Amount from './Amount';
import TransactionStepsHandler from './TransactionStepsHandler';
import ResultHandler from '../../ResultHandler';
import MemoizedUtilizationStats from '../../UtilizationStats';

interface SupplyTabProps {
  maxAmount: bigint;
  isLoadingMax: boolean;
  totalStats?: {
    capAmount: number;
    totalAmount: number;
    capFiat: number;
    totalFiat: number;
  };
  setSwapWidgetOpen: (open: boolean) => void;
}

const SupplyTab = ({
  maxAmount,
  isLoadingMax,
  totalStats,
  setSwapWidgetOpen
}: SupplyTabProps) => {
  const {
    selectedMarketData,
    amount,
    setAmount,
    currentUtilizationPercentage,
    handleUtilization,
    resetTransactionSteps,
    chainId,
    amountAsBInt,
    comptrollerAddress,
    updatedValues,
    isLoadingUpdatedAssets,
    refetchUsedQueries
  } = useManageDialogContext();

  const {
    enableCollateral,
    handleCollateralToggle,
    transactionSteps: collateralTxSteps
  } = useCollateralToggle({
    selectedMarketData,
    comptrollerAddress,
    onSuccess: refetchUsedQueries
  });

  const {
    isWaitingForIndexing,
    supplyAmount,
    transactionSteps: supplyTxSteps,
    isPolling
  } = useSupply({
    maxAmount,
    enableCollateral
  });

  // Combine both sets of transaction steps
  const combinedTransactionSteps = useMemo(() => {
    return [...supplyTxSteps, ...collateralTxSteps];
  }, [supplyTxSteps, collateralTxSteps]);

  const isDisabled = !amount || amountAsBInt === 0n;
  const hasActiveTransactions = combinedTransactionSteps.length > 0;

  return (
    <div className="space-y-4 pt-2">
      <div className="flex justify-between">
        <Button
          className="w-full text-xs uppercase bg-accent"
          onClick={() => setSwapWidgetOpen(true)}
        >
          Get {selectedMarketData.underlyingSymbol}
        </Button>
      </div>

      <Amount
        amount={amount}
        handleInput={setAmount}
        isLoading={isLoadingMax || isPolling}
        max={formatUnits(maxAmount, selectedMarketData.underlyingDecimals)}
        symbol={selectedMarketData.underlyingSymbol}
        currentUtilizationPercentage={currentUtilizationPercentage}
        handleUtilization={handleUtilization}
      />

      <div className="grid grid-cols-2 gap-x-8">
        <div className="space-y-4 content-center">
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-400 uppercase">
              <span>Market Supply Balance</span>
              <div className="flex items-center">
                <span>{updatedValues.supplyBalanceFrom}</span>
                <span className="mx-1">→</span>
                <ResultHandler
                  isLoading={isLoadingUpdatedAssets || isPolling}
                  height={16}
                  width={16}
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
                  isLoading={isLoadingUpdatedAssets}
                  height={16}
                  width={16}
                >
                  {updatedValues.updatedSupplyAPY?.toFixed(2)}%
                </ResultHandler>
              </div>
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

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400 uppercase">
          Enable Collateral
        </span>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <div>
              <Switch
                checked={enableCollateral}
                onCheckedChange={handleCollateralToggle}
                disabled={
                  hasActiveTransactions || !selectedMarketData.supplyBalance
                }
              />
            </div>
          </TooltipTrigger>
          {(hasActiveTransactions || !selectedMarketData.supplyBalance) && (
            <TooltipContent side="top">
              {hasActiveTransactions
                ? 'Cannot modify collateral during an active transaction'
                : 'You need to supply assets first before enabling as collateral'}
            </TooltipContent>
          )}
        </Tooltip>
      </div>

      {hasActiveTransactions ? (
        <div className="flex justify-center">
          <TransactionStepsHandler
            chainId={chainId}
            resetTransactionSteps={resetTransactionSteps}
            transactionSteps={combinedTransactionSteps}
          />
        </div>
      ) : (
        <Button
          className="w-full bg-accent"
          disabled={isDisabled || isWaitingForIndexing}
          onClick={supplyAmount}
        >
          {isWaitingForIndexing
            ? 'Updating Balances...'
            : `Supply ${selectedMarketData.underlyingSymbol}`}
        </Button>
      )}
    </div>
  );
};

export default SupplyTab;
