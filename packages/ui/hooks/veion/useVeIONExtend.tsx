import { useState } from 'react';

import { parseUnits, erc20Abi } from 'viem';
import { useAccount, useChainId } from 'wagmi';

import { getVeIonContract } from '@ui/constants/veIon';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import { useContractWrite } from '../useContractWrite';

interface VeIONExtendState {
  isExtending: boolean;
  isApproving: boolean;
  error: string | null;
}

export function useVeIONExtend(chain: number) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const veIonContract = getVeIonContract(chainId);
  const { write } = useContractWrite();

  const [state, setState] = useState<VeIONExtendState>({
    isExtending: false,
    isApproving: false,
    error: null
  });

  const resetState = () => {
    setState({
      isExtending: false,
      isApproving: false,
      error: null
    });
  };

  const handleError = (error: Error) => {
    setState((prev) => ({
      ...prev,
      error: error.message,
      isExtending: false,
      isApproving: false
    }));
  };

  const approve = async (tokenAddress: string, amount: bigint) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    if (amount <= BigInt(0)) {
      throw new Error('Invalid amount');
    }

    try {
      const isSwitched = await handleSwitchOriginChain(chain, chainId);
      if (!isSwitched) throw new Error('Failed to switch chain');

      setState((prev) => ({ ...prev, isApproving: true }));

      await write(
        {
          address: tokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: 'approve',
          args: [veIonContract?.address as `0x${string}`, amount]
        },
        {
          successMessage: 'Successfully approved token',
          errorMessage: 'Failed to approve token'
        }
      );

      setState((prev) => ({ ...prev, isApproving: false }));
      return true;
    } catch (error) {
      handleError(error as Error);
      return false;
    }
  };

  const extendLock = async ({
    tokenId,
    lockDuration,
    tokenAddress,
    increaseAmount = '0'
  }: {
    tokenId: number;
    lockDuration: number;
    tokenAddress: string;
    increaseAmount?: string;
  }) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    if (!veIonContract) {
      throw new Error('Contract not initialized');
    }

    try {
      const isSwitched = await handleSwitchOriginChain(chain, chainId);
      if (!isSwitched) throw new Error('Failed to switch chain');

      setState((prev) => ({ ...prev, isExtending: true }));

      // If there's an amount to increase, approve first
      if (increaseAmount !== '0') {
        const amount = parseUnits(increaseAmount, 18);
        await approve(tokenAddress, amount);
      }

      // Extend lock duration
      await write(
        {
          address: veIonContract.address,
          abi: veIonContract.abi,
          functionName: 'increaseUnlockTime',
          args: [tokenAddress, tokenId, lockDuration]
        },
        {
          successMessage: 'Successfully extended lock duration'
        }
      );

      // If there's an amount to increase, increase it
      if (increaseAmount !== '0') {
        await write(
          {
            address: veIonContract.address,
            abi: veIonContract.abi,
            functionName: 'increaseAmount',
            args: [
              [tokenAddress],
              tokenId,
              [parseUnits(increaseAmount, 18)],
              [true]
            ]
          },
          {
            successMessage: 'Successfully increased locked amount'
          }
        );
      }

      setState((prev) => ({ ...prev, isExtending: false }));
      return true;
    } catch (error) {
      handleError(error as Error);
      return false;
    }
  };

  return {
    extendLock,
    resetState,
    ...state
  };
}
