import { usePublicClient, useWriteContract } from 'wagmi';

import { useToast } from '@ui/hooks/use-toast';

import type { Address } from 'viem';

interface ContractConfig {
  address: Address;
  abi: any;
  functionName: string;
  args: any[];
  value?: bigint;
}

interface WriteContractOptions {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
}

export function useContractWrite() {
  const { toast } = useToast();
  const { writeContract, isPending, isSuccess, isError, data } =
    useWriteContract();
  const publicClient = usePublicClient();

  const write = async (
    config: ContractConfig,
    options: WriteContractOptions = {}
  ) => {
    if (!publicClient) {
      throw new Error('Public client not initialized');
    }

    try {
      const hash = await writeContract({
        ...config
      });

      // Wait for the transaction to be confirmed
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: hash as unknown as `0x${string}`
      });

      if (receipt.status === 'success') {
        toast({
          title: 'Success',
          description: options.successMessage || 'Transaction successful',
          variant: 'default'
        });
        options.onSuccess?.();
      } else {
        toast({
          title: 'Error',
          description: 'Transaction failed',
          variant: 'destructive'
        });
      }

      return receipt;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: options.errorMessage || error.message,
        variant: 'destructive'
      });
      throw error;
    }
  };

  return {
    write,
    isPending,
    isSuccess,
    isError,
    data
  };
}
