import { useCallback, useState, useEffect, useMemo } from 'react';
import { type Address, formatUnits, parseUnits, PublicClient } from 'viem';
import { toast } from 'react-hot-toast';
import { getContract } from 'viem';
import { icErc20Abi } from '@ionicprotocol/sdk';
import { useTransactionSteps } from '@ui/app/_components/dialogs/manage/TransactionStepsHandler';
import { INFO_MESSAGES } from '@ui/constants';
import { MarketData } from '@ui/types/TokensDataMap';
import { useBalancePolling } from '../useBalancePolling';
import { useMaxSupplyAmount } from '../useMaxSupplyAmount';
import { useMultiIonic } from '@ui/context/MultiIonicContext';

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

  const { addStepsForAction, transactionSteps, upsertTransactionStep } =
    useTransactionSteps();

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
    addStepsForAction([
      {
        error: false,
        message: INFO_MESSAGES.SUPPLY.APPROVE,
        success: false
      },
      ...(enableCollateral && !selectedMarketData.membership
        ? [
            {
              error: false,
              message: INFO_MESSAGES.SUPPLY.COLLATERAL,
              success: false
            }
          ]
        : []),
      {
        error: false,
        message: INFO_MESSAGES.SUPPLY.SUPPLYING,
        success: false
      }
    ]);

    try {
      // Use the publicClient in your function call
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

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            txHash: approveTx
          }
        });

        await currentSdk.publicClient.waitForTransactionReceipt({
          hash: approveTx,
          confirmations: 2
        });

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
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

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            txHash: enterMarketsTx
          }
        });

        await currentSdk.publicClient.waitForTransactionReceipt({
          hash: enterMarketsTx
        });

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            success: true
          }
        });

        currentTransactionStep++;
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

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          txHash: tx
        }
      });

      await currentSdk.publicClient.waitForTransactionReceipt({
        hash: tx,
        confirmations: 1
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
        `Supplied ${amount} ${selectedMarketData.underlyingSymbol}`
      );
    } catch (error) {
      console.error('Supply error:', error);
      setIsWaitingForIndexing(false);
      setTxHash(undefined);

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          error: true
        }
      });

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
    comptrollerAddress
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
