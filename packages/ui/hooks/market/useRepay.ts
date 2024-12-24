import { useCallback, useState, useEffect, useMemo } from 'react';

import { toast } from 'react-hot-toast';
import {
  type Address,
  formatUnits,
  parseUnits,
  getContract,
  maxUint256
} from 'viem';

import { useTransactionSteps } from '@ui/app/components/dialogs/manage/TransactionStepsHandler';
import { INFO_MESSAGES } from '@ui/constants';
import {
  TransactionType,
  useManageDialogContext
} from '@ui/context/ManageDialogContext';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import type { MarketData } from '@ui/types/TokensDataMap';

import { useBalancePolling } from '../useBalancePolling';
import { useMaxRepayAmount } from '../useMaxRepayAmount';

import { icErc20Abi } from '@ionicprotocol/sdk';

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
  const { address, currentSdk } = useMultiIonic();
  const [txHash, setTxHash] = useState<Address>();
  const [isWaitingForIndexing, setIsWaitingForIndexing] = useState(false);
  const [amount, setAmount] = useState<string>('0');
  const [utilizationPercentage, setUtilizationPercentage] = useState<number>(0);
  const { addStepsForType, upsertStepForType } = useManageDialogContext();
  const { transactionSteps } = useTransactionSteps();

  const formatToFixedDecimals = (num: number, decimals: number): string => {
    // Convert to string and remove scientific notation
    let str = num.toFixed(decimals);

    // Remove trailing zeros after decimal point
    if (str.includes('.')) {
      str = str.replace(/\.?0+$/, '');
    }

    // If the string is empty or just a decimal point, return '0'
    if (!str || str === '.') return '0';

    return str;
  };

  const INTEREST_BUFFER_MULTIPLIER = 1.01;

  const amountWithBufferAsBInt = useMemo(() => {
    try {
      const amountAsNumber = Number(amount);
      if (isNaN(amountAsNumber) || amountAsNumber === 0) return 0n;

      const amountWithBuffer = amountAsNumber * INTEREST_BUFFER_MULTIPLIER;
      const formattedAmount = formatToFixedDecimals(
        amountWithBuffer,
        selectedMarketData.underlyingDecimals
      );

      return parseUnits(formattedAmount, selectedMarketData.underlyingDecimals);
    } catch (error) {
      console.error('Error calculating buffer amount:', error);
      return 0n;
    }
  }, [amount, selectedMarketData.underlyingDecimals]);

  const handleUtilization = useCallback(
    (newUtilizationPercentage: number) => {
      const maxAmountNumber = Number(
        formatUnits(maxAmount ?? 0n, selectedMarketData.underlyingDecimals)
      );
      const calculatedAmount = formatToFixedDecimals(
        (newUtilizationPercentage / 100) * maxAmountNumber,
        selectedMarketData.underlyingDecimals
      );

      setAmount(calculatedAmount);
      setUtilizationPercentage(newUtilizationPercentage);
    },
    [maxAmount, selectedMarketData.underlyingDecimals]
  );

  const amountAsBInt = useMemo(() => {
    try {
      if (!amount || amount === '0') return 0n;
      // Ensure the amount is properly formatted before parsing
      const formattedAmount = formatToFixedDecimals(
        Number(amount),
        selectedMarketData.underlyingDecimals
      );
      return parseUnits(formattedAmount, selectedMarketData.underlyingDecimals);
    } catch (error) {
      console.error('Error parsing amount:', error);
      return 0n;
    }
  }, [amount, selectedMarketData.underlyingDecimals]);

  useEffect(() => {
    if (amount === '0' || !amount || maxAmount === 0n) {
      setUtilizationPercentage(0);
      return;
    }
    const utilization = (Number(amountAsBInt) * 100) / Number(maxAmount);
    setUtilizationPercentage(Math.min(Math.round(utilization), 100));
  }, [amountAsBInt, maxAmount, amount]);

  const currentBorrowAmountAsFloat = useMemo<number>(
    () => parseFloat(selectedMarketData.borrowBalance.toString()),
    [selectedMarketData]
  );

  const repayAmount = useCallback(async () => {
    if (
      !currentSdk ||
      !address ||
      !amount ||
      amountAsBInt <= 0n ||
      !currentBorrowAmountAsFloat
    )
      return;

    let currentTransactionStep = 0;

    addStepsForType(TransactionType.REPAY, [
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
      // Get token instances
      const token = currentSdk.getEIP20TokenInstance(
        selectedMarketData.underlyingToken,
        currentSdk.publicClient as any
      );

      const cToken = getContract({
        address: selectedMarketData.cToken,
        abi: icErc20Abi,
        client: currentSdk.walletClient!
      });

      const currentAllowance = await token.read.allowance([
        address,
        selectedMarketData.cToken
      ]);

      // Use buffered amount for allowance check and approval
      if (currentAllowance < amountWithBufferAsBInt) {
        const approveTx = await currentSdk.approve(
          selectedMarketData.cToken,
          selectedMarketData.underlyingToken,
          amountWithBufferAsBInt // Using buffered amount for approval
        );

        upsertStepForType(TransactionType.REPAY, {
          index: currentTransactionStep,
          transactionStep: {
            error: false,
            message: INFO_MESSAGES.REPAY.APPROVE,
            txHash: approveTx,
            success: false
          }
        });

        await currentSdk.publicClient.waitForTransactionReceipt({
          hash: approveTx,
          confirmations: 2
        });

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      currentTransactionStep++;

      // Check if we're repaying the max amount
      const isRepayingMax =
        amountAsBInt >= (selectedMarketData.borrowBalance ?? 0n);
      const repayAmount = isRepayingMax ? maxUint256 : amountAsBInt;

      // Verify final allowance against buffered amount
      const finalAllowance = await token.read.allowance([
        address,
        selectedMarketData.cToken
      ]);
      if (finalAllowance < amountWithBufferAsBInt) {
        throw new Error('Insufficient allowance after approval');
      }

      upsertStepForType(TransactionType.REPAY, {
        index: currentTransactionStep - 1,
        transactionStep: {
          error: false,
          message: INFO_MESSAGES.REPAY.APPROVE,
          success: true
        }
      });

      if (!currentSdk || !currentSdk.walletClient) {
        console.error('SDK or wallet client is not initialized');
        return;
      }

      // Estimate gas first
      const gasLimit = await cToken.estimateGas.repayBorrow([repayAmount], {
        account: address
      });

      // Execute the repay with gas limit
      const tx = await cToken.write.repayBorrow([repayAmount], {
        gas: gasLimit,
        account: address,
        chain: currentSdk.walletClient.chain
      });

      upsertStepForType(TransactionType.REPAY, {
        index: currentTransactionStep,
        transactionStep: {
          error: false,
          message: INFO_MESSAGES.REPAY.REPAYING,
          txHash: tx,
          success: false
        }
      });

      await currentSdk.publicClient.waitForTransactionReceipt({
        hash: tx,
        confirmations: 1
      });

      setTxHash(tx);
      setIsWaitingForIndexing(true);

      upsertStepForType(TransactionType.REPAY, {
        index: currentTransactionStep,
        transactionStep: {
          error: false,
          message: INFO_MESSAGES.REPAY.REPAYING,
          txHash: tx,
          success: true
        }
      });

      toast.success(`Repaid ${amount} ${selectedMarketData.underlyingSymbol}`);
    } catch (error) {
      console.error('Repay error:', error);
      setIsWaitingForIndexing(false);
      setTxHash(undefined);

      upsertStepForType(TransactionType.REPAY, {
        index: currentTransactionStep,
        transactionStep: {
          error: true,
          message:
            currentTransactionStep === 0
              ? INFO_MESSAGES.REPAY.APPROVE
              : INFO_MESSAGES.REPAY.REPAYING,
          success: false
        }
      });

      toast.error('Error while repaying!');
    }
  }, [
    currentSdk,
    address,
    amount,
    amountAsBInt,
    amountWithBufferAsBInt,
    currentBorrowAmountAsFloat,
    selectedMarketData,
    addStepsForType,
    upsertStepForType
  ]);

  const { refetch: refetchMaxRepay } = useMaxRepayAmount(
    selectedMarketData,
    chainId
  );

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
