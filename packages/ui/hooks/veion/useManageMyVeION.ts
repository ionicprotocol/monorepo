import { parseUnits } from 'viem';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

import { useContractWrite } from '../useContractWrite';

import type { Hex } from 'viem';

export function useManageMyVeION(chain: number) {
  const { getSdk } = useMultiIonic();
  const ionicSdk = getSdk(chain);
  const veIonContract = ionicSdk?.veIONContracts?.veION;
  const { write, isPending } = useContractWrite();

  const getContractConfig = (functionName: string, args: any[]) => {
    if (!veIonContract) throw new Error('Contract not initialized');
    return {
      address: veIonContract.address,
      abi: veIonContract.abi,
      functionName,
      args
    };
  };

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
    return write(
      getContractConfig('increaseAmount', [
        [tokenAddress],
        tokenId,
        [parseUnits(String(amount), tokenDecimals)],
        [true]
      ]),
      { successMessage: 'Successfully increased locked amount' }
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
    return write(
      getContractConfig('increaseUnlockTime', [
        tokenAddress,
        tokenId,
        lockDuration
      ]),
      { successMessage: 'Successfully extended lock duration' }
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
    return write(
      getContractConfig('delegate', [fromTokenId, toTokenId, lpToken, amount]),
      { successMessage: 'Successfully delegated voting power' }
    );
  };

  const merge = async ({
    fromTokenId,
    toTokenId
  }: {
    fromTokenId: Hex;
    toTokenId: Hex;
  }) => {
    return write(getContractConfig('merge', [fromTokenId, toTokenId]), {
      successMessage: 'Successfully merged positions'
    });
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
    return write(getContractConfig('split', [tokenAddress, from, amount]), {
      successMessage: 'Successfully split veION position'
    });
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
    return write(getContractConfig('safeTransferFrom', [from, to, tokenId]), {
      successMessage: 'Successfully transferred veION'
    });
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
