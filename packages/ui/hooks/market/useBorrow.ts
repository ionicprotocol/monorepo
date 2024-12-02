// useBorrow.ts
import { useCallback, useEffect, useMemo, useState } from 'react';

import { toast } from 'react-hot-toast';
import { type Address, formatUnits, parseUnits } from 'viem';

import { useTransactionSteps } from '@ui/app/_components/dialogs/manage/TransactionStepsHandler';
import { INFO_MESSAGES } from '@ui/constants';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import type { MarketData } from '@ui/types/TokensDataMap';

import { useBalancePolling } from '../useBalancePolling';
import { useMaxBorrowAmount } from '../useMaxBorrowAmount';

interface UseBorrowProps {
  selectedMarketData: MarketData;
  chainId: number;
  comptrollerAddress: Address;
  minBorrowAmount?: {
    minBorrowAsset: bigint | undefined;
    minBorrowNative: bigint | undefined;
    minBorrowUSD: number | undefined;
  };
  maxBorrowAmount?: {
    bigNumber: bigint;
    number: number;
  } | null;
}

export const useBorrow = ({
  selectedMarketData,
  chainId,
  comptrollerAddress,
  minBorrowAmount,
  maxBorrowAmount
}: UseBorrowProps) => {
  const [txHash, setTxHash] = useState<Address>();
  const [isWaitingForIndexing, setIsWaitingForIndexing] = useState(false);
  const [amount, setAmount] = useState<string>('0');
  const [utilizationPercentage, setUtilizationPercentage] = useState<number>(0);

  const { addStepsForAction, transactionSteps, upsertTransactionStep } =
    useTransactionSteps();
  const { currentSdk, address } = useMultiIonic();

  const amountAsBInt = useMemo(
    () =>
      parseUnits(
        amount?.toString() ?? '0',
        selectedMarketData.underlyingDecimals
      ),
    [amount, selectedMarketData.underlyingDecimals]
  );

  const handleUtilization = useCallback(
    (newUtilizationPercentage: number) => {
      const maxAmountNumber = maxBorrowAmount?.number ?? 0;

      const calculatedAmount = (
        (newUtilizationPercentage / 100) *
        maxAmountNumber
      ).toFixed(parseInt(selectedMarketData.underlyingDecimals.toString()));

      setAmount(calculatedAmount);
      setUtilizationPercentage(newUtilizationPercentage);
    },
    [maxBorrowAmount?.number, selectedMarketData.underlyingDecimals]
  );

  // Update utilization percentage when amount changes
  useEffect(() => {
    if (amount === '0' || !amount || !maxBorrowAmount?.bigNumber) {
      setUtilizationPercentage(0);
      return;
    }

    const utilization =
      (Number(amountAsBInt) * 100) / Number(maxBorrowAmount.bigNumber);
    setUtilizationPercentage(Math.min(Math.round(utilization), 100));
  }, [amountAsBInt, maxBorrowAmount?.bigNumber, amount]);

  const { refetch: refetchMaxBorrow } = useMaxBorrowAmount(
    selectedMarketData,
    comptrollerAddress,
    chainId
  );

  const borrowLimits = {
    min: formatUnits(
      minBorrowAmount?.minBorrowAsset ?? 0n,
      selectedMarketData.underlyingDecimals
    ),
    max:
      maxBorrowAmount?.number?.toFixed(
        parseInt(selectedMarketData.underlyingDecimals.toString())
      ) ?? '0.00'
  };

  const isUnderMinBorrow =
    amount &&
    borrowLimits.min &&
    parseFloat(amount) < parseFloat(borrowLimits.min);

  const borrowAmount = async () => {
    if (
      !transactionSteps.length &&
      currentSdk &&
      address &&
      amount &&
      amountAsBInt > 0n &&
      minBorrowAmount &&
      amountAsBInt >= (minBorrowAmount.minBorrowAsset ?? 0n) &&
      maxBorrowAmount &&
      amountAsBInt <= maxBorrowAmount.bigNumber
    ) {
      const currentTransactionStep = 0;
      addStepsForAction([
        {
          error: false,
          message: INFO_MESSAGES.BORROW.BORROWING,
          success: false
        }
      ]);

      try {
        const { tx, errorCode } = await currentSdk.borrow(
          selectedMarketData.cToken,
          amountAsBInt
        );

        if (errorCode) {
          console.error(errorCode);
          throw new Error('Error during borrowing!');
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
            `Borrowed ${amount} ${selectedMarketData.underlyingSymbol}`
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

        toast.error('Error while borrowing!');
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
      refetchMaxBorrow();
      setAmount('0');
      setUtilizationPercentage(0);
      toast.success(
        `Borrowed ${amount} ${selectedMarketData.underlyingSymbol}`
      );
    }
  });

  return {
    isWaitingForIndexing,
    borrowAmount,
    transactionSteps,
    isPolling,
    borrowLimits,
    isUnderMinBorrow,
    amount,
    setAmount,
    utilizationPercentage,
    handleUtilization,
    amountAsBInt
  };
};
