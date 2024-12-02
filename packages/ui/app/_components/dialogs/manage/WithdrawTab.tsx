import { useState } from 'react';

import toast from 'react-hot-toast';
import { formatUnits } from 'viem';

import { Button } from '@ui/components/ui/button';
import { INFO_MESSAGES } from '@ui/constants';
import {
  HFPStatus,
  useManageDialogContext
} from '@ui/context/ManageDialogContext';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useBalancePolling } from '@ui/hooks/useBalancePolling';
import { useMaxWithdrawAmount } from '@ui/hooks/useMaxWithdrawAmount';

import Amount from './Amount';
import StatusAlerts from './StatusAlerts';
import TransactionStepsHandler, {
  useTransactionSteps
} from './TransactionStepsHandler';
import ResultHandler from '../../ResultHandler';
import MemoizedUtilizationStats from '../../UtilizationStats';

import type { Address } from 'viem';

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
    isLoadingPredictedHealthFactor,
    updatedValues,
    isLoadingUpdatedAssets
  } = useManageDialogContext();
  const { refetch: refetchMaxWithdraw } = useMaxWithdrawAmount(
    selectedMarketData,
    chainId
  );

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
  const { currentSdk, address } = useMultiIonic();

  const { addStepsForAction, transactionSteps, upsertTransactionStep } =
    useTransactionSteps();

  const { isPolling } = useBalancePolling({
    address,
    chainId,
    txHash,
    enabled: isWaitingForIndexing,
    onSuccess: () => {
      setIsWaitingForIndexing(false);
      setTxHash(undefined);
      refetchMaxWithdraw();
      toast.success(
        `Withdrawn ${amount} ${selectedMarketData.underlyingSymbol}`
      );
    }
  });

  const withdrawAmount = async () => {
    if (
      !transactionSteps.length &&
      currentSdk &&
      address &&
      amount &&
      amountAsBInt > 0n &&
      maxAmount
    ) {
      const currentTransactionStep = 0;
      addStepsForAction([
        {
          error: false,
          message: INFO_MESSAGES.WITHDRAW.WITHDRAWING,
          success: false
        }
      ]);

      try {
        const amountToWithdraw = amountAsBInt;

        console.warn(
          'Withdraw params:',
          selectedMarketData.cToken,
          amountToWithdraw.toString()
        );
        let isMax = false;
        if (amountToWithdraw === maxAmount) {
          isMax = true;
        }

        const { tx, errorCode } = await currentSdk.withdraw(
          selectedMarketData.cToken,
          amountToWithdraw,
          isMax
        );

        if (errorCode) {
          console.error(errorCode);

          throw new Error('Error during withdrawing!');
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
            `Withdrawn ${amount} ${selectedMarketData.underlyingSymbol}`
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

        toast.error('Error while withdrawing!');
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
        hintText="Max Withdraw"
        currentUtilizationPercentage={currentUtilizationPercentage}
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

      <div className="grid grid-cols-2 gap-x-8">
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
          className="w-full bg-accent"
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
