import { useCallback, useEffect, useMemo, useState } from 'react';

import { toast } from 'react-hot-toast';
import { type Address, formatUnits, parseUnits } from 'viem';

import { useTransactionSteps } from '@ui/app/_components/dialogs/manage/TransactionStepsHandler';
import { INFO_MESSAGES } from '@ui/constants';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import type { MarketData } from '@ui/types/TokensDataMap';

import { useBalancePolling } from '../useBalancePolling';
import { useMaxRepayAmount } from '../useMaxRepayAmount';

interface UseRepayProps {
  maxAmount: bigint;
  selectedMarketData: MarketData;
  chainId: number;
}

export const useRepay = ({
  maxAmount,
  selectedMarketData,
  chainId
}: UseRepayProps) => {
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

  const { refetch: refetchMaxRepay } = useMaxRepayAmount(
    selectedMarketData,
    chainId
  );

  const currentBorrowAmountAsFloat = useMemo<number>(
    () => parseFloat(selectedMarketData.borrowBalance.toString()),
    [selectedMarketData]
  );

  const repayAmount = async () => {
    if (
      !transactionSteps.length &&
      currentSdk &&
      address &&
      amount &&
      amountAsBInt > 0n &&
      currentBorrowAmountAsFloat
    ) {
      let currentTransactionStep = 0;
      addStepsForAction([
        {
          error: false,
          message: INFO_MESSAGES.REPAY.APPROVE,
          success: false
        },
        {
          error: false,
          message: INFO_MESSAGES.REPAY.REPAYING,
          success: false
        }
      ]);

      try {
        const token = currentSdk.getEIP20TokenInstance(
          selectedMarketData.underlyingToken,
          currentSdk.publicClient as any
        );
        const hasApprovedEnough =
          (await token.read.allowance([address, selectedMarketData.cToken])) >=
          amountAsBInt;

        if (!hasApprovedEnough) {
          const tx = await currentSdk.approve(
            selectedMarketData.cToken,
            selectedMarketData.underlyingToken,
            (amountAsBInt * 105n) / 100n
          );

          upsertTransactionStep({
            index: currentTransactionStep,
            transactionStep: {
              ...transactionSteps[currentTransactionStep],
              txHash: tx
            }
          });

          await currentSdk.publicClient.waitForTransactionReceipt({
            hash: tx,
            confirmations: 2
          });
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            success: true
          }
        });

        currentTransactionStep++;

        const isRepayingMax =
          amountAsBInt >= (selectedMarketData.borrowBalance ?? 0n);

        const { tx, errorCode } = await currentSdk.repay(
          selectedMarketData.cToken,
          isRepayingMax,
          isRepayingMax ? selectedMarketData.borrowBalance : amountAsBInt
        );

        if (errorCode) {
          throw new Error('Error during repaying!');
        }

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            txHash: tx
          }
        });

        if (tx) {
          await currentSdk.publicClient.waitForTransactionReceipt({ hash: tx });
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
            `Repaid ${amount} ${selectedMarketData.underlyingSymbol}`
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

        toast.error('Error while repaying!');
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
      refetchMaxRepay();
      setAmount('0');
      setUtilizationPercentage(0);
      toast.success(`Repaid ${amount} ${selectedMarketData.underlyingSymbol}`);
    }
  });

  return {
    isWaitingForIndexing,
    repayAmount,
    transactionSteps,
    isPolling,
    currentBorrowAmountAsFloat,
    amount,
    setAmount,
    utilizationPercentage,
    handleUtilization,
    amountAsBInt
  };
};
