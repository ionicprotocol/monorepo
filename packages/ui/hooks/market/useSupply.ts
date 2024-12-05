import { useCallback, useState, useEffect, useMemo } from 'react';

import { toast } from 'react-hot-toast';
import { type Address, formatUnits, parseUnits } from 'viem';
import { getContract } from 'viem';

import { useTransactionSteps } from '@ui/app/_components/dialogs/manage/TransactionStepsHandler';
import { INFO_MESSAGES } from '@ui/constants';
import {
  TransactionType,
  useManageDialogContext
} from '@ui/context/ManageDialogContext';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import type { MarketData } from '@ui/types/TokensDataMap';

import { useBalancePolling } from '../useBalancePolling';
import { useMaxSupplyAmount } from '../useMaxSupplyAmount';

import { icErc20Abi } from '@ionicprotocol/sdk';

interface UseSupplyProps {
  maxAmount: bigint;
  enableCollateral: boolean;
  selectedMarketData: MarketData;
  comptrollerAddress: Address;
  chainId: number;
}

export const useSupply = ({
  maxAmount,
  enableCollateral,
  selectedMarketData,
  comptrollerAddress,
  chainId
}: UseSupplyProps) => {
  const { address, currentSdk } = useMultiIonic();
  const [txHash, setTxHash] = useState<Address>();
  const [isWaitingForIndexing, setIsWaitingForIndexing] = useState(false);
  const [amount, setAmount] = useState<string>('0');
  const [utilizationPercentage, setUtilizationPercentage] = useState<number>(0);
  const { addStepsForType, upsertStepForType } = useManageDialogContext();

  const { transactionSteps } = useTransactionSteps();

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

  useEffect(() => {
    if (amount === '0' || !amount || maxAmount === 0n) {
      setUtilizationPercentage(0);
      return;
    }
    const utilization = (Number(amountAsBInt) * 100) / Number(maxAmount);
    setUtilizationPercentage(Math.min(Math.round(utilization), 100));
  }, [amountAsBInt, maxAmount, amount]);

  const supplyAmount = useCallback(async () => {
    if (
      !currentSdk ||
      !address ||
      !amount ||
      amountAsBInt <= 0n ||
      amountAsBInt > maxAmount
    )
      return;

    let currentTransactionStep = 0;

    // Add steps for both supply and collateral if needed
    addStepsForType(TransactionType.SUPPLY, [
      {
        error: false,
        message: INFO_MESSAGES.SUPPLY.APPROVE,
        success: false
      },
      {
        error: false,
        message: INFO_MESSAGES.SUPPLY.SUPPLYING,
        success: false
      }
    ]);

    if (enableCollateral && !selectedMarketData.membership) {
      addStepsForType(TransactionType.COLLATERAL, [
        {
          error: false,
          message: INFO_MESSAGES.SUPPLY.COLLATERAL,
          success: false
        }
      ]);
    }

    try {
      const token = currentSdk.getEIP20TokenInstance(
        selectedMarketData.underlyingToken,
        currentSdk.publicClient as any
      );

      const cToken = getContract({
        address: selectedMarketData.cToken,
        abi: icErc20Abi,
        client: currentSdk.walletClient!
      });

      // Check and handle allowance
      const currentAllowance = await token.read.allowance([
        address,
        selectedMarketData.cToken
      ]);

      if (currentAllowance < amountAsBInt) {
        const approveTx = await currentSdk.approve(
          selectedMarketData.cToken,
          selectedMarketData.underlyingToken,
          amountAsBInt
        );

        upsertStepForType(TransactionType.SUPPLY, {
          index: currentTransactionStep,
          transactionStep: {
            error: false,
            message: INFO_MESSAGES.SUPPLY.APPROVE,
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

      upsertStepForType(TransactionType.SUPPLY, {
        index: currentTransactionStep,
        transactionStep: {
          error: false,
          message: INFO_MESSAGES.SUPPLY.APPROVE,
          success: true
        }
      });

      currentTransactionStep++;

      // Handle collateral if needed
      if (enableCollateral && !selectedMarketData.membership) {
        const enterMarketsTx = await currentSdk.enterMarkets(
          selectedMarketData.cToken,
          comptrollerAddress
        );

        upsertStepForType(TransactionType.COLLATERAL, {
          index: 0,
          transactionStep: {
            error: false,
            message: INFO_MESSAGES.SUPPLY.COLLATERAL,
            txHash: enterMarketsTx,
            success: false
          }
        });

        await currentSdk.publicClient.waitForTransactionReceipt({
          hash: enterMarketsTx
        });

        upsertStepForType(TransactionType.COLLATERAL, {
          index: 0,
          transactionStep: {
            error: false,
            message: INFO_MESSAGES.SUPPLY.COLLATERAL,
            success: true
          }
        });
      }

      // Verify final allowance
      const finalAllowance = await token.read.allowance([
        address,
        selectedMarketData.cToken
      ]);
      if (finalAllowance < amountAsBInt) {
        throw new Error('Insufficient allowance after approval');
      }

      // Execute mint
      const gasLimit = await cToken.estimateGas.mint([amountAsBInt], {
        account: address
      });

      if (!currentSdk || !currentSdk.walletClient) {
        console.error('SDK or wallet client is not initialized');
        return;
      }

      const tx = await cToken.write.mint([amountAsBInt], {
        gas: gasLimit,
        account: address,
        chain: currentSdk.walletClient.chain
      });

      upsertStepForType(TransactionType.SUPPLY, {
        index: currentTransactionStep,
        transactionStep: {
          error: false,
          message: INFO_MESSAGES.SUPPLY.SUPPLYING,
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

      upsertStepForType(TransactionType.SUPPLY, {
        index: currentTransactionStep,
        transactionStep: {
          error: false,
          message: INFO_MESSAGES.SUPPLY.SUPPLYING,
          txHash: tx,
          success: true
        }
      });

      toast.success(
        `Supplied ${amount} ${selectedMarketData.underlyingSymbol}`
      );
    } catch (error) {
      console.error('Supply error:', error);
      setIsWaitingForIndexing(false);
      setTxHash(undefined);

      // Mark all remaining steps as error
      upsertStepForType(TransactionType.SUPPLY, {
        index: currentTransactionStep,
        transactionStep: {
          error: true,
          message: INFO_MESSAGES.SUPPLY.SUPPLYING,
          success: false
        }
      });

      if (enableCollateral && !selectedMarketData.membership) {
        upsertStepForType(TransactionType.COLLATERAL, {
          index: 0,
          transactionStep: {
            error: true,
            message: INFO_MESSAGES.SUPPLY.COLLATERAL,
            success: false
          }
        });
      }

      toast.error('Error while supplying!');
    }
  }, [
    currentSdk,
    address,
    amount,
    amountAsBInt,
    maxAmount,
    selectedMarketData,
    enableCollateral,
    comptrollerAddress,
    addStepsForType,
    upsertStepForType
  ]);

  const { refetch: refetchMaxSupply } = useMaxSupplyAmount(
    selectedMarketData,
    comptrollerAddress,
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
      refetchMaxSupply();
      setAmount('0');
      setUtilizationPercentage(0);
      toast.success(
        `Supplied ${amount} ${selectedMarketData.underlyingSymbol}`
      );
    }
  });

  async function resetAllowance(selectedMarketData: MarketData) {
    const tx = await currentSdk?.approve(
      selectedMarketData.cToken,
      selectedMarketData.underlyingToken,
      0n // Set allowance to 0
    );

    if (tx) {
      await currentSdk?.publicClient.waitForTransactionReceipt({ hash: tx });
    }
  }

  return {
    isWaitingForIndexing,
    supplyAmount,
    transactionSteps,
    isPolling,
    amount,
    setAmount,
    utilizationPercentage,
    handleUtilization,
    amountAsBInt,
    resetAllowance
  };
};
