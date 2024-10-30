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

  const extendLock = async ({
    tokenAddress,
    tokenId,
    lockDuration
  }: {
    tokenAddress: `0x${string}`;
    tokenId: Hex;
    lockDuration: number;
  }) => {
    if (!veIonContract) throw new Error('Contract not initialized');

    return writeContract(
      {
        address: veIonContract.address,
        abi: veIonContract.abi,
        functionName: 'increaseUnlockTime',
        args: [tokenAddress, tokenId, lockDuration]
      },
      {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: 'Successfully extended lock duration'
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

  const delegate = async ({
    fromTokenId,
    toTokenId,
    lpToken,
    amount
  }: {
    fromTokenId: Hex;
    toTokenId: Hex;
    lpToken: `0x${string}`;
    amount: number;
  }) => {
    if (!veIonContract) throw new Error('Contract not initialized');

    return writeContract(
      {
        address: veIonContract.address,
        abi: veIonContract.abi,
        functionName: 'delegate',
        args: [fromTokenId, toTokenId, lpToken, amount]
      },
      {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: 'Successfully delegated voting power'
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

  const merge = async ({
    fromTokenId,
    toTokenId
  }: {
    fromTokenId: Hex;
    toTokenId: Hex;
  }) => {
    if (!veIonContract) throw new Error('Contract not initialized');

    return writeContract(
      {
        address: veIonContract.address,
        abi: veIonContract.abi,
        functionName: 'merge',
        args: [fromTokenId, toTokenId]
      },
      {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: 'Successfully merged positions'
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

  const split = async ({
    tokenAddress,
    from,
    amount
  }: {
    tokenAddress: `0x${string}`;
    from: Hex;
    amount: number;
  }) => {
    if (!veIonContract) throw new Error('Contract not initialized');

    return writeContract(
      {
        address: veIonContract.address,
        abi: veIonContract.abi,
        functionName: 'split',
        args: [tokenAddress, from, amount]
      },
      {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: 'Successfully split veION position'
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

  const safeTransfer = async ({
    from,
    to,
    tokenId
  }: {
    from: `0x${string}`;
    to: `0x${string}`;
    tokenId: Hex;
  }) => {
    if (!veIonContract) throw new Error('Contract not initialized');

    return writeContract(
      {
        address: veIonContract.address,
        abi: veIonContract.abi,
        functionName: 'safeTransferFrom',
        args: [from, to, tokenId]
      },
      {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: 'Successfully transferred veION'
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
    extendLock,
    delegate,
    merge,
    split,
    safeTransfer,
    isPending,
    isContractLoading: !veIonContract
  };
}
