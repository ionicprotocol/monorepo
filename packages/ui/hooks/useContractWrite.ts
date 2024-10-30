import { useWriteContract } from 'wagmi';

import { useToast } from '@ui/hooks/use-toast';

import type { Address } from 'viem';

interface ContractConfig {
  address: Address;
  abi: any;
  functionName: string;
  args: any[];
}

interface WriteContractOptions {
  successMessage?: string;
  errorMessage?: string;
}

export function useContractWrite() {
  const { toast } = useToast();
  const { writeContract, isPending } = useWriteContract();

  const write = async (
    config: ContractConfig,
    options: WriteContractOptions = {}
  ) => {
    const { successMessage = 'Transaction successful', errorMessage } = options;

    return writeContract(
      {
        ...config
      },
      {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: successMessage
          });
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: errorMessage || error.message,
            variant: 'destructive'
          });
        }
      }
    );
  };

  return {
    write,
    isPending
  };
}
