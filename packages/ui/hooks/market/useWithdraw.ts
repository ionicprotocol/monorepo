// useWithdraw.ts
import { useCallback, useEffect, useMemo, useState } from 'react';

import { toast } from 'react-hot-toast';
import { type Address, formatUnits, parseUnits } from 'viem';

import { INFO_MESSAGES } from '@ui/constants';
import {
  TransactionType,
  useManageDialogContext
} from '@ui/context/ManageDialogContext';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import type { MarketData } from '@ui/types/TokensDataMap';

import { useBalancePolling } from '../useBalancePolling';
import { useMaxWithdrawAmount } from '../useMaxWithdrawAmount';

interface UseWithdrawProps {
  maxAmount: bigint;
  selectedMarketData: MarketData;
  chainId: number;
}

export const useWithdraw = ({
  maxAmount,
  selectedMarketData,
  chainId
}: UseWithdrawProps) => {
  const [txHash, setTxHash] = useState<Address>();
  const [isWaitingForIndexing, setIsWaitingForIndexing] = useState(false);
  const [amount, setAmount] = useState<string>('0');
  const [utilizationPercentage, setUtilizationPercentage] = useState<number>(0);

  const { addStepsForType, upsertStepForType } = useManageDialogContext();

  const { currentSdk, address } = useMultiIonic();

  const amountAsBInt = useMemo(
    () =>
      parseUnits(
        amount?.toString() ?? '0',
        selectedMarketData.underlyingDecimals
      ),
    [amount, selectedMarketData.underlyingDecimals]
  );

  const { refetch: refetchMaxWithdraw } = useMaxWithdrawAmount(
    selectedMarketData,
    chainId
  );

  const handleUtilization = useCallback(
    (newUtilizationPercentage: number) => {
      const maxAmountNumber = Number(
        formatUnits(maxAmount ?? 0n, selectedMarketData.underlyingDecimals)
      );

      const calculatedAmount = (
        (newUtilizationPercentage / 100) *
        maxAmountNumber
      ).toFixed(parseInt(selectedMarketData.underlyingDecimals.toString()));

      setAmount(calculatedAmount);
      setUtilizationPercentage(newUtilizationPercentage);
    },
    [maxAmount, selectedMarketData.underlyingDecimals]
  );

  // Update utilization percentage when amount changes
  useEffect(() => {
    if (amount === '0' || !amount) {
      setUtilizationPercentage(0);
      return;
    }

    if (maxAmount === 0n) {
      setUtilizationPercentage(0);
      return;
    }

    const utilization = (Number(amountAsBInt) * 100) / Number(maxAmount);
    setUtilizationPercentage(Math.min(Math.round(utilization), 100));
  }, [amountAsBInt, maxAmount, amount]);

  const withdrawAmount = async () => {
    if (currentSdk && address && amount && amountAsBInt > 0n && maxAmount) {
      const currentTransactionStep = 0;
      addStepsForType(TransactionType.WITHDRAW, [
        {
          error: false,
          message: INFO_MESSAGES.WITHDRAW.WITHDRAWING,
          success: false
        }
      ]);

      try {
        const amountToWithdraw = amountAsBInt;
        const isMax = amountToWithdraw === maxAmount;

        const { tx, errorCode } = await currentSdk.withdraw(
          selectedMarketData.cToken,
          amountToWithdraw,
          isMax
        );

        if (errorCode) {
          console.error(errorCode);
          throw new Error('Error during withdrawing!');
        }

        upsertStepForType(TransactionType.WITHDRAW, {
          index: currentTransactionStep,
          transactionStep: {
            error: false,
            message: INFO_MESSAGES.WITHDRAW.WITHDRAWING,
            txHash: tx,
            success: false
          }
        });

        if (tx) {
          await currentSdk.publicClient.waitForTransactionReceipt({
            hash: tx
          });

          setTxHash(tx);
          setIsWaitingForIndexing(true);

          upsertStepForType(TransactionType.WITHDRAW, {
            index: currentTransactionStep,
            transactionStep: {
              error: false,
              message: INFO_MESSAGES.WITHDRAW.WITHDRAWING,
              txHash: tx,
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

        upsertStepForType(TransactionType.WITHDRAW, {
          index: currentTransactionStep,
          transactionStep: {
            error: true,
            message: INFO_MESSAGES.WITHDRAW.WITHDRAWING,
            success: false
          }
        });

        toast.error('Error while withdrawing!');
      }
    }
  };

  const { isPolling } = useBalancePolling({
    address,
    chainId,
    txHash,
    enabled: isWaitingForIndexing,
    onSuccess: () => {
      setIsWaitingForIndexing(false);
      setTxHash(undefined);
      refetchMaxWithdraw();
      setAmount('0');
      setUtilizationPercentage(0);
      toast.success(
        `Withdrawn ${amount} ${selectedMarketData.underlyingSymbol}`
      );
    }
  });

  return {
    isWaitingForIndexing,
    withdrawAmount,
    isPolling,
    amount,
    setAmount,
    utilizationPercentage,
    handleUtilization,
    amountAsBInt
  };
};
