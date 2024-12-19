import { VAULT_ABI, VAULT_ADDRESSES } from '@ui/utils/marketUtils';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { type Address, parseUnits, erc20Abi } from 'viem';
import {
  useWriteContract,
  useAccount,
  useReadContract,
  useSimulateContract
} from 'wagmi';

interface UseSupplyVaultProps {
  underlyingDecimals: number;
  underlyingToken: Address;
  underlyingSymbol: string;
  chainId: number;
}

export const useSupplyVault = ({
  underlyingDecimals,
  underlyingToken,
  underlyingSymbol,
  chainId
}: UseSupplyVaultProps) => {
  const [amount, setAmount] = useState<string>('0');
  const { address } = useAccount();
  const [isPending, setIsPending] = useState(false);

  const amountAsBInt = useMemo(
    () => parseUnits(amount?.toString() ?? '0', underlyingDecimals),
    [amount, underlyingDecimals]
  );

  // Approval simulation and execution
  const { data: simulateApprove } = useSimulateContract({
    address: underlyingToken,
    abi: erc20Abi,
    functionName: 'approve',
    args: [VAULT_ADDRESSES.SECOND_EXTENSION, amountAsBInt],
    query: {
      enabled: Boolean(address && amountAsBInt > 0n)
    }
  });

  const { writeContract: writeApprove, isPending: isApproving } =
    useWriteContract();

  // Deposit simulation and execution
  const { data: simulateDeposit } = useSimulateContract({
    address: VAULT_ADDRESSES.SECOND_EXTENSION,
    abi: VAULT_ABI,
    functionName: 'deposit',
    args: [amountAsBInt],
    query: {
      enabled: Boolean(address && amountAsBInt > 0n)
    }
  });

  const { writeContract: writeDeposit, isPending: isSupplying } =
    useWriteContract();

  // Check allowance
  const { data: allowance } = useReadContract({
    address: underlyingToken,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address!, VAULT_ADDRESSES.SECOND_EXTENSION],
    query: {
      enabled: Boolean(address)
    }
  });

  const approveAmount = useCallback(async () => {
    if (!address || amountAsBInt <= 0n || !simulateApprove?.request) return;

    try {
      setIsPending(true);
      const hash = await writeApprove(simulateApprove.request);
      toast.success('Approval successful!');
    } catch (error) {
      console.error('Approval error:', error);
      toast.error('Error while approving!');
    } finally {
      setIsPending(false);
    }
  }, [address, amountAsBInt, simulateApprove, writeApprove]);

  const supplyAmount = useCallback(async () => {
    if (!address || amountAsBInt <= 0n || !simulateDeposit?.request) return;

    // Check if approval is needed
    if (allowance && allowance < amountAsBInt) {
      toast.error('Please approve first');
      return;
    }

    try {
      setIsPending(true);
      const hash = await writeDeposit(simulateDeposit.request);
      toast.success(`Supplied ${amount} ${underlyingSymbol} to vault`);
      setAmount('0');
    } catch (error) {
      console.error('Supply error:', error);
      toast.error('Error while supplying to vault!');
    } finally {
      setIsPending(false);
    }
  }, [
    address,
    amountAsBInt,
    allowance,
    simulateDeposit,
    writeDeposit,
    amount,
    underlyingSymbol
  ]);

  return {
    approveAmount,
    supplyAmount,
    amount,
    setAmount,
    amountAsBInt,
    isApproving,
    isSupplying,
    isPending,
    needsApproval: allowance ? allowance < amountAsBInt : true
  };
};
