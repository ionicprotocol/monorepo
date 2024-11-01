import { useWriteContract } from 'wagmi';
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
    useWriteContract({
      mutation: {
        onError(error: Error) {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive'
          });
        },
        onSuccess() {
          toast({
            title: 'Success',
            description: 'Transaction successful'
          });
        }
      }
    });

  const write = async (
    config: ContractConfig,
    options: WriteContractOptions = {}
  ) => {
    try {
      return await writeContract({
        ...config
      });
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
