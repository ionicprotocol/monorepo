import { useState } from 'react';

import { useAccount, useChainId } from 'wagmi';

import { getVeIonContract } from '@ui/constants/veIon';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import { useContractWrite } from '../useContractWrite';

interface VeIONDelegateState {
  isUndelegating: boolean;
  error: string | null;
}

export function useVeIONDelegate(chain: number) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const veIonContract = getVeIonContract(chainId);
  const { write } = useContractWrite();

  const [state, setState] = useState<VeIONDelegateState>({
    isUndelegating: false,
    error: null
  });

  const resetState = () => {
    setState({
      isUndelegating: false,
      error: null
    });
  };

  const handleError = (error: Error) => {
    setState((prev) => ({
      ...prev,
      error: error.message,
      isUndelegating: false
    }));
  };

  const undelegate = async ({
    fromTokenId,
    toTokenIds,
    lpToken,
    amounts
  }: {
    fromTokenId: number;
    toTokenIds: number[];
    lpToken: `0x${string}`;
    amounts: string[];
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

      setState((prev) => ({ ...prev, isUndelegating: true }));

      await write(
        {
          address: veIonContract.address,
          abi: veIonContract.abi,
          functionName: 'deDelegate',
          args: [fromTokenId, toTokenIds, lpToken, amounts]
        },
        {
          successMessage: 'Successfully undelegated tokens',
          errorMessage: 'Failed to undelegate tokens'
        }
      );

      setState((prev) => ({ ...prev, isUndelegating: false }));
      return true;
    } catch (error) {
      handleError(error as Error);
      return false;
    }
  };

  return {
    undelegate,
    resetState,
    ...state
  };
}
