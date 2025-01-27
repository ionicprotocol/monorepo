import { parseUnits, erc20Abi } from 'viem';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';

import { getVeIonContract } from '@ui/constants/veIon';

import { useContractWrite } from '../useContractWrite';

import type { Hex } from 'viem';

export function useVeIONManage(chain: number) {
  const veIonContract = getVeIonContract(chain);
  const { write, isPending } = useContractWrite();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const getContractConfig = (functionName: string, args: any[]) => {
    if (!veIonContract) {
      console.error('Contract not initialized');
      throw new Error('Contract not initialized');
    }
    return {
      address: veIonContract.address,
      abi: veIonContract.abi,
      functionName,
      args
    };
  };

  const checkAllowance = async (
    tokenAddress: `0x${string}`,
    owner: `0x${string}`,
    amount: bigint
  ) => {
    if (!veIonContract) throw new Error('Contract not initialized');
    if (!publicClient) throw new Error('Public client not initialized');

    const allowance = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [owner, veIonContract.address]
    });

    return allowance >= amount;
  };

  async function increaseAmount({
    tokenAddress,
    tokenId,
    amount,
    tokenDecimals
  }: {
    tokenAddress: `0x${string}`;
    tokenId: number;
    amount: number;
    tokenDecimals: number;
  }) {
    if (address && publicClient && walletClient) {
      const parsedAmount = parseUnits(String(amount), tokenDecimals);

      // Check if approval is needed
      const hasAllowance = await checkAllowance(
        tokenAddress,
        address,
        parsedAmount
      );

      if (!hasAllowance) {
        // First approve tokens
        const approvalTx = await walletClient.writeContract({
          abi: erc20Abi,
          account: walletClient.account,
          address: tokenAddress,
          args: [veIonContract.address, parsedAmount],
          functionName: 'approve'
        });

        // Wait for approval transaction to be confirmed
        await publicClient.waitForTransactionReceipt({ hash: approvalTx });
      }

      // Then increase amount
      return write(
        getContractConfig('increaseAmount', [
          tokenAddress,
          BigInt(tokenId),
          parsedAmount,
          true // _stakeUnderlying parameter
        ]),
        {
          successMessage: 'Successfully increased locked amount',
          errorMessage: 'Failed to increase locked amount'
        }
      );
    }
  }

  function extendLock({
    tokenAddress,
    tokenId,
    lockDuration
  }: {
    tokenAddress: `0x${string}`;
    tokenId: Hex;
    lockDuration: number;
  }) {
    return write(
      getContractConfig('increaseUnlockTime', [
        tokenAddress,
        tokenId,
        lockDuration
      ]),
      {
        successMessage: 'Successfully extended lock duration',
        errorMessage: 'Failed to extend lock duration'
      }
    );
  }

  function delegate({
    fromTokenId,
    toTokenId,
    lpToken,
    amount
  }: {
    fromTokenId: Hex;
    toTokenId: Hex;
    lpToken: `0x${string}`;
    amount: number;
  }) {
    return write(
      getContractConfig('delegate', [fromTokenId, toTokenId, lpToken, amount]),
      {
        successMessage: 'Successfully delegated voting power',
        errorMessage: 'Failed to delegate voting power'
      }
    );
  }

  function merge({
    fromTokenId,
    toTokenId
  }: {
    fromTokenId: Hex;
    toTokenId: Hex;
  }) {
    return write(getContractConfig('merge', [fromTokenId, toTokenId]), {
      successMessage: 'Successfully merged positions',
      errorMessage: 'Failed to merge positions'
    });
  }

  function split({
    tokenAddress,
    from,
    amount
  }: {
    tokenAddress: `0x${string}`;
    from: number;
    amount: bigint;
  }) {
    const config = getContractConfig('split', [
      tokenAddress,
      BigInt(from),
      amount
    ]);

    return write(config, {
      successMessage: 'Successfully split veION position',
      errorMessage: 'Failed to split veION position'
    });
  }

  function safeTransfer({
    from,
    to,
    tokenId
  }: {
    from: `0x${string}`;
    to: `0x${string}`;
    tokenId: Hex;
  }) {
    return write(getContractConfig('safeTransferFrom', [from, to, tokenId]), {
      successMessage: 'Successfully transferred veION',
      errorMessage: 'Failed to transfer veION'
    });
  }

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
