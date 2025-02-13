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
  onError?: (error: Error) => void;
}

export function useContractWrite() {
  const { toast } = useToast();
  const { writeContractAsync, isPending, isSuccess, isError, data } =
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
      // Execute the write contract call and get the hash
      const hash = await writeContractAsync(config);

      if (!hash) {
        throw new Error('Transaction failed - no hash returned');
      }

      // Wait for the transaction to be confirmed
      const receipt = await publicClient.waitForTransactionReceipt({
        hash
      });

      if (receipt.status === 'success') {
        toast({
          title: 'Success',
          description: options.successMessage || 'Transaction successful',
          variant: 'default'
        });
        options.onSuccess?.();
      } else {
        throw new Error('Transaction failed during confirmation');
      }

      return receipt;
    } catch (error: any) {
      const errorMessage = error?.message || 'Transaction failed';
      toast({
        title: 'Error',
        description: options.errorMessage || errorMessage,
        variant: 'destructive'
      });

      options.onError?.(error);
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
