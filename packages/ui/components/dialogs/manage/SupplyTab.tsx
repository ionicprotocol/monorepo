import { useEffect, useMemo } from 'react';

import { useSearchParams } from 'next/navigation';

import { mode } from 'viem/chains';

import MaxDeposit from '@ui/components/MaxDeposit';
import { Button } from '@ui/components/ui/button';
import { Switch } from '@ui/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@ui/components/ui/tooltip';
import {
  TransactionType,
  useManageDialogContext
} from '@ui/context/ManageDialogContext';
import { useCollateralToggle } from '@ui/hooks/market/useCollateralToggle';
import { useMarketData } from '@ui/hooks/market/useMarketData';
import { useSupply } from '@ui/hooks/market/useSupply';
import { useMaxSupplyAmount } from '@ui/hooks/useMaxSupplyAmount';

import TransactionStepsHandler from './TransactionStepsHandler';
import ResultHandler from '../../ResultHandler';
import MemoizedUtilizationStats from '../../UtilizationStats';

interface SupplyTabProps {
  capAmount: number;
  totalAmount: number;
  capFiat: number;
  totalFiat: number;
  setSwapWidgetOpen: (open: boolean) => void;
}

const SupplyTab = ({
  capAmount,
  totalAmount,
  capFiat,
  totalFiat,
  setSwapWidgetOpen
}: SupplyTabProps) => {
  const {
    selectedMarketData,
    resetTransactionSteps,
    chainId,
    comptrollerAddress,
    updatedValues,
    isLoadingUpdatedAssets,
    refetchUsedQueries,
    setPredictionAmount,
    getStepsForTypes
  } = useManageDialogContext();

  const { data: maxAmount, isLoading: isLoadingMax } = useMaxSupplyAmount(
    selectedMarketData,
    comptrollerAddress,
    chainId
  );

  const { enableCollateral, handleCollateralToggle } = useCollateralToggle({
    selectedMarketData,
    comptrollerAddress,
    onSuccess: refetchUsedQueries
  });

  const searchParams = useSearchParams();
  const querychain = searchParams.get('chain');
  const querypool = searchParams.get('pool');
  const selectedPool = querypool ?? '0';
  const chain = querychain ? querychain : mode.id.toString();

  const { marketData } = useMarketData(selectedPool, chain);

  const getTooltipContent = () => {
    if (hasActiveTransactions) {
      return 'Cannot modify collateral during an active transaction';
    }
    if (!selectedMarketData.supplyBalance) {
      return 'You need to supply assets first before enabling as collateral';
    }
    if (disableCollateral) {
      return 'Unavailable until borrowing is enabled';
    }
    return null;
  };

  const disableCollateral = marketData.length === 1;

  const {
    isWaitingForIndexing,
    supplyAmount,
    isPolling,
    amount,
    setAmount,
    amountAsBInt
  } = useSupply({
    maxAmount: maxAmount?.bigNumber ?? 0n,
    enableCollateral,
    selectedMarketData,
    comptrollerAddress,
    chainId
  });

  useEffect(() => {
    setPredictionAmount(amountAsBInt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountAsBInt]);

  const combinedTransactionSteps = useMemo(() => {
    return getStepsForTypes(TransactionType.SUPPLY, TransactionType.COLLATERAL);
  }, [getStepsForTypes]);

  const isDisabled = !amount || amountAsBInt === 0n;
  const hasActiveTransactions = combinedTransactionSteps.length > 0;
  const showTooltip =
    hasActiveTransactions ||
    !selectedMarketData.supplyBalance ||
    disableCollateral;

  return (
    <div className="space-y-4 pt-2">
      <div className="flex justify-between">
        <Button
          className="w-full text-xs uppercase bg-accent hover:bg-accent/80"
          onClick={() => setSwapWidgetOpen(true)}
        >
          Get {selectedMarketData.underlyingSymbol}
        </Button>
      </div>

      <MaxDeposit
        amount={amount}
        tokenName={selectedMarketData.underlyingSymbol}
        isLoading={isLoadingMax || isPolling}
        token={selectedMarketData.underlyingToken}
        handleInput={(val?: string) => setAmount(val ?? '')}
        chain={chainId}
        headerText="Supply Amount"
        decimals={selectedMarketData.underlyingDecimals}
        showUtilizationSlider
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-x-8">
        <div className="space-y-4 content-center">
          <div className="space-y-4">
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

            <div className="flex justify-between text-xs text-gray-400 uppercase">
              <span>Enable Collateral</span>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <div>
                    <Switch
                      checked={enableCollateral}
                      onCheckedChange={handleCollateralToggle}
                      disabled={
                        disableCollateral ||
                        hasActiveTransactions ||
                        !selectedMarketData.supplyBalance
                      }
                    />
                  </div>
                </TooltipTrigger>
                {showTooltip && (
                  <TooltipContent side="top">
                    {getTooltipContent()}
                  </TooltipContent>
                )}
              </Tooltip>
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
          className="w-full bg-accent hover:bg-accent/80"
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
