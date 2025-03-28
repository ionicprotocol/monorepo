import { useEffect, useMemo } from 'react';

import { Info } from 'lucide-react';
import { formatUnits } from 'viem';

import MaxDeposit from '@ui/components/MaxDeposit';
import ResultHandler from '@ui/components/ResultHandler';
import { Alert, AlertDescription } from '@ui/components/ui/alert';
import { Button } from '@ui/components/ui/button';
import MemoizedUtilizationStats from '@ui/components/UtilizationStats';
import {
  HFPStatus,
  TransactionType,
  useManageDialogContext
} from '@ui/context/ManageDialogContext';
import { useHealth } from '@ui/hooks/market/useHealth';
import { useWithdraw } from '@ui/hooks/market/useWithdraw';
import { useMaxWithdrawAmount } from '@ui/hooks/useMaxWithdrawAmount';

import StatusAlerts from '../StatusAlerts';
import TransactionStepsHandler from '../TransactionStepsHandler';

interface WithdrawTabProps {
  capAmount: number;
  totalAmount: number;
  capFiat: number;
  totalFiat: number;
}

const WithdrawTab = ({
  capAmount,
  totalAmount,
  capFiat,
  totalFiat
}: WithdrawTabProps) => {
  const {
    selectedMarketData,
    resetTransactionSteps,
    chainId,
    updatedValues,
    isLoadingUpdatedAssets,
    comptrollerAddress,
    setPredictionAmount,
    getStepsForTypes,
    isSliding
  } = useManageDialogContext();

  const { data: maxAmount, isLoading: isLoadingMax } = useMaxWithdrawAmount(
    selectedMarketData,
    chainId
  );

  const {
    isWaitingForIndexing,
    withdrawAmount,
    isPolling,
    amount,
    setAmount,
    amountAsBInt
  } = useWithdraw({
    maxAmount: maxAmount ?? 0n,
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
        headerText="Withdraw Amount"
        decimals={selectedMarketData.underlyingDecimals}
        showUtilizationSlider
        hintText="Max Withdraw"
      />

      <Alert
        variant="default"
        className="py-2 border-0 bg-opacity-90"
      >
        <div className="flex items-center">
          <Info className="mr-2 h-4 w-4 text-white" />
          <AlertDescription>
            Please repay all loans and disable collateral before attempting to
            withdraw.
          </AlertDescription>
        </div>
      </Alert>

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
                isLoading={isSliding || isLoadingUpdatedAssets}
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
                isLoading={isSliding || isLoadingUpdatedAssets || isPolling}
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
