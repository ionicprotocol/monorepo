import { parseUnits } from 'viem';
import { useWriteContract } from 'wagmi';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useToast } from '@ui/hooks/use-toast';

import type { Hex } from 'viem';

export function useManageMyVeION(chain: number) {
  const { toast } = useToast();
  const { getSdk } = useMultiIonic();
  const ionicSdk = getSdk(chain);
  const veIonContract = ionicSdk?.veIONContracts?.veION;
  const { writeContract, isPending } = useWriteContract();

  const increaseAmount = async ({
    tokenAddress,
    tokenId,
    amount,
    tokenDecimals
  }: {
    tokenAddress: `0x${string}`;
    tokenId: Hex;
    amount: number;
    tokenDecimals: number;
  }) => {
    if (!veIonContract) throw new Error('Contract not initialized');

    return writeContract(
      {
        address: veIonContract.address,
        abi: veIonContract.abi,
        functionName: 'increaseAmount',
        args: [
          [tokenAddress],
          tokenId,
          [parseUnits(String(amount), tokenDecimals)],
          [true] // stakeUnderlying
        ]
      },
      {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: 'Successfully increased locked amount'
          });
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive'
          });
        }
      }
    );
  };

  return {
    increaseAmount,
    isPending,
    isContractLoading: !veIonContract
  };
}
