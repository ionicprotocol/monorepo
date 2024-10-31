import { useState } from 'react';

import { erc20Abi } from 'viem';
import { useAccount, useChainId } from 'wagmi';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import { useContractWrite } from '../useContractWrite';

interface VeIONClaimState {
  progress: number;
  isApproving: boolean;
  isClaiming: boolean;
  error: string | null;
}

export function useVeIONClaim(chain: number) {
  const { getSdk } = useMultiIonic();
  const ionicSdk = getSdk(chain);
  const veIonContract = ionicSdk?.veIONContracts?.veION;
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { write } = useContractWrite();

  const [state, setState] = useState<VeIONClaimState>({
    progress: 0,
    isApproving: false,
    isClaiming: false,
    error: null
  });

  const resetState = () => {
    setState({
      progress: 0,
      isApproving: false,
      isClaiming: false,
      error: null
    });
  };

  const handleError = (error: Error) => {
    setState((prev) => ({
      ...prev,
      error: error.message,
      isApproving: false,
      isClaiming: false,
      progress: 0
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

      setState((prev) => ({ ...prev, isApproving: true, progress: 1 }));

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

      setState((prev) => ({ ...prev, progress: 2, isApproving: false }));
      return true;
    } catch (error) {
      handleError(error as Error);
      return false;
    }
  };

  const claim = async (tokenAddress: string, tokenId: number) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    if (!veIonContract) {
      throw new Error('Contract not initialized');
    }

    try {
      const isSwitched = await handleSwitchOriginChain(chain, chainId);
      if (!isSwitched) throw new Error('Failed to switch chain');

      setState((prev) => ({ ...prev, isClaiming: true }));

      await write(
        {
          address: veIonContract.address,
          abi: veIonContract.abi,
          functionName: 'withdraw',
          args: [tokenAddress, tokenId]
        },
        {
          successMessage: 'Successfully claimed LP tokens',
          errorMessage: 'Failed to claim LP tokens'
        }
      );

      setState((prev) => ({
        ...prev,
        isClaiming: false,
        progress: 3
      }));
      return true;
    } catch (error) {
      handleError(error as Error);
      return false;
    }
  };

  return {
    approve,
    claim,
    resetState,
    ...state
  };
}
