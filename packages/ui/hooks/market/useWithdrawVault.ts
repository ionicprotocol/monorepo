// useWithdrawVault.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { type Address, formatUnits, parseUnits } from 'viem';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useBalancePolling } from '../useBalancePolling';
import type { VaultRowData } from '@ui/hooks/market/useSupplyVaults';

interface UseWithdrawVaultProps {
  maxAmount: bigint;
  selectedVaultData: VaultRowData;
  chainId: number;
}

export const useWithdrawVault = ({
  maxAmount,
  selectedVaultData,
  chainId
}: UseWithdrawVaultProps) => {
  const [txHash, setTxHash] = useState<Address>();
  const [isWaitingForIndexing, setIsWaitingForIndexing] = useState(false);
  const [amount, setAmount] = useState<string>('0');
  const [utilizationPercentage, setUtilizationPercentage] = useState<number>(0);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const { address, currentSdk } = useMultiIonic();

  const amountAsBInt = useMemo(
    () =>
      parseUnits(
        amount?.toString() ?? '0',
        selectedVaultData.underlyingDecimals
      ),
    [amount, selectedVaultData.underlyingDecimals]
  );

  const handleUtilization = useCallback(
    (newUtilizationPercentage: number) => {
      const maxAmountNumber = Number(
        formatUnits(maxAmount ?? 0n, selectedVaultData.underlyingDecimals)
      );
      const calculatedAmount = (
        (newUtilizationPercentage / 100) *
        maxAmountNumber
      ).toFixed(parseInt(selectedVaultData.underlyingDecimals.toString()));

      setAmount(calculatedAmount);
      setUtilizationPercentage(newUtilizationPercentage);
    },
    [maxAmount, selectedVaultData.underlyingDecimals]
  );

  // Update utilization percentage when amount changes
  useEffect(() => {
    if (amount === '0' || !amount || !maxAmount) {
      setUtilizationPercentage(0);
      return;
    }

    const utilization = (Number(amountAsBInt) * 100) / Number(maxAmount);
    setUtilizationPercentage(Math.min(Math.round(utilization), 100));
  }, [amountAsBInt, maxAmount, amount]);

  const withdrawAmount = useCallback(async () => {
    if (
      !currentSdk ||
      !address ||
      amountAsBInt <= 0n ||
      amountAsBInt > maxAmount
    )
      return;

    setIsWithdrawing(true);
    try {
      // Get the vault instance from SDK (will have to implement)
      const vaultContract = currentSdk.getVaultInstance(
        selectedVaultData.vaultAddress as `0x${string}`,
        currentSdk.publicClient as any
      );

      // Call withdraw function on the vault
      const tx = await currentSdk.walletClient!.sendTransaction({
        to: selectedVaultData.vaultAddress as `0x${string}`,
        data: vaultContract.interface.encodeFunctionData('withdraw', [
          amountAsBInt
        ]),
        value: 0n,
        account: address,
        chain: currentSdk?.walletClient?.chain
      });

      setTxHash(tx);
      setIsWaitingForIndexing(true);

      await currentSdk.publicClient.waitForTransactionReceipt({
        hash: tx,
        confirmations: 1
      });

      toast.success(
        `Withdrawn ${amount} ${selectedVaultData.underlyingSymbol} from vault`
      );
    } catch (error) {
      console.error('Withdrawal error:', error);
      setIsWaitingForIndexing(false);
      setTxHash(undefined);
      toast.error('Error while withdrawing from vault!');
    } finally {
      setIsWithdrawing(false);
    }
  }, [currentSdk, address, amountAsBInt, maxAmount, selectedVaultData, amount]);

  const { isPolling } = useBalancePolling({
    address,
    chainId,
    txHash,
    enabled: isWaitingForIndexing,
    onSuccess: () => {
      setIsWaitingForIndexing(false);
      setTxHash(undefined);
      setAmount('0');
      setUtilizationPercentage(0);
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
    amountAsBInt,
    isWithdrawing
  };
};
