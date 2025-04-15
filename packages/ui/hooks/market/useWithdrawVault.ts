import { useCallback, useMemo, useState } from 'react';

import { toast } from 'react-hot-toast';
import { parseUnits } from 'viem';
import { useWriteContract, useAccount, useSimulateContract } from 'wagmi';

import type { VaultRowData } from '@ui/types/SupplyVaults';
import { VAULT_ABI, VAULT_ADDRESSES } from '@ui/utils/marketUtils';

interface UseWithdrawVaultProps {
  maxAmount: bigint;
  selectedVaultData: VaultRowData;
}

export const useWithdrawVault = ({
  maxAmount,
  selectedVaultData
}: UseWithdrawVaultProps) => {
  const [amount, setAmount] = useState<string>('0');
  const { address } = useAccount();
  const [isPending, setIsPending] = useState(false);

  const amountAsBInt = useMemo(
    () =>
      parseUnits(
        amount?.toString() ?? '0',
        selectedVaultData.underlyingDecimals
      ),
    [amount, selectedVaultData.underlyingDecimals]
  );

  // Withdraw simulation and execution
  const { data: simulateWithdraw } = useSimulateContract({
    address: VAULT_ADDRESSES.SECOND_EXTENSION,
    abi: VAULT_ABI,
    functionName: 'withdraw',
    args: [amountAsBInt],
    query: {
      enabled: Boolean(
        address && amountAsBInt > 0n && amountAsBInt <= maxAmount
      )
    }
  });

  const { writeContract: writeWithdraw, isPending: isWithdrawing } =
    useWriteContract();

  const withdrawAmount = useCallback(async () => {
    if (
      !address ||
      amountAsBInt <= 0n ||
      amountAsBInt > maxAmount ||
      !simulateWithdraw?.request
    )
      return;

    try {
      setIsPending(true);
      const hash = await writeWithdraw(simulateWithdraw.request);
      toast.success(
        `Withdrawn ${amount} ${selectedVaultData.underlyingSymbol} from vault`
      );
      setAmount('0');
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.error('Error while withdrawing from vault!');
    } finally {
      setIsPending(false);
    }
  }, [
    address,
    amountAsBInt,
    maxAmount,
    simulateWithdraw,
    writeWithdraw,
    amount,
    selectedVaultData.underlyingSymbol
  ]);

  return {
    withdrawAmount,
    amount,
    setAmount,
    amountAsBInt,
    isWithdrawing,
    isPending
  };
};
