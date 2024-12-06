import { useCallback, useState, useMemo } from 'react';

import { toast } from 'react-hot-toast';
import { type Address, formatUnits, parseUnits } from 'viem';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

import { useBalancePolling } from '../useBalancePolling';

interface UseSupplyVaultProps {
  maxAmount: bigint;
  underlyingDecimals: number;
  underlyingToken: Address;
  underlyingSymbol: string;
  vaultAddress: Address;
  chainId: number;
}

export const useSupplyVault = ({
  maxAmount,
  underlyingDecimals,
  underlyingToken,
  underlyingSymbol,
  vaultAddress,
  chainId
}: UseSupplyVaultProps) => {
  const [txHash, setTxHash] = useState<Address>();
  const [isWaitingForIndexing, setIsWaitingForIndexing] = useState(false);
  const [amount, setAmount] = useState<string>('0');
  const [utilizationPercentage, setUtilizationPercentage] = useState<number>(0);
  const [isApproving, setIsApproving] = useState(false);
  const [isSupplying, setIsSupplying] = useState(false);
  const { address, currentSdk } = useMultiIonic();

  const amountAsBInt = useMemo(
    () => parseUnits(amount?.toString() ?? '0', underlyingDecimals),
    [amount, underlyingDecimals]
  );

  const handleUtilization = useCallback(
    (newUtilizationPercentage: number) => {
      const maxAmountNumber = Number(
        formatUnits(maxAmount ?? 0n, underlyingDecimals)
      );
      const calculatedAmount = (
        (newUtilizationPercentage / 100) *
        maxAmountNumber
      ).toFixed(parseInt(underlyingDecimals.toString()));

      setAmount(calculatedAmount);
      setUtilizationPercentage(newUtilizationPercentage);
    },
    [maxAmount, underlyingDecimals]
  );

  const approveAmount = useCallback(async () => {
    if (
      !currentSdk ||
      !address ||
      amountAsBInt <= 0n ||
      amountAsBInt > maxAmount
    )
      return;

    setIsApproving(true);
    try {
      const token = currentSdk.getEIP20TokenInstance(
        underlyingToken,
        currentSdk.publicClient as any
      );

      const tx = await currentSdk.approve(
        vaultAddress,
        underlyingToken,
        amountAsBInt
      );

      await currentSdk.publicClient.waitForTransactionReceipt({
        hash: tx,
        confirmations: 2
      });

      toast.success('Approval successful!');
    } catch (error) {
      console.error('Approval error:', error);
      toast.error('Error while approving!');
    } finally {
      setIsApproving(false);
    }
  }, [
    currentSdk,
    address,
    amountAsBInt,
    maxAmount,
    underlyingToken,
    vaultAddress
  ]);

  const supplyAmount = useCallback(async () => {
    if (
      !currentSdk ||
      !address ||
      amountAsBInt <= 0n ||
      amountAsBInt > maxAmount
    )
      return;

    setIsSupplying(true);
    try {
      const tx = await currentSdk.walletClient!.sendTransaction({
        to: vaultAddress,
        data: '0x',
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

      toast.success(`Supplied ${amount} ${underlyingSymbol} to vault`);
    } catch (error) {
      console.error('Supply error:', error);
      setIsWaitingForIndexing(false);
      setTxHash(undefined);
      toast.error('Error while supplying to vault!');
    } finally {
      setIsSupplying(false);
    }
  }, [
    currentSdk,
    address,
    amountAsBInt,
    maxAmount,
    vaultAddress,
    amount,
    underlyingSymbol
  ]);

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
    approveAmount,
    supplyAmount,
    isPolling,
    amount,
    setAmount,
    utilizationPercentage,
    handleUtilization,
    amountAsBInt,
    isApproving,
    isSupplying
  };
};
