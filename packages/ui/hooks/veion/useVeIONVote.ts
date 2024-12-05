import { useState } from 'react';

import { useAccount, useChainId } from 'wagmi';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import { useContractWrite } from '../useContractWrite';

import type { Address } from 'viem';

export enum MarketSide {
  Supply = 0,
  Borrow = 1
}

interface VoteState {
  isVoting: boolean;
  error: string | null;
  pendingVotes: Map<
    string,
    {
      side: MarketSide;
      weight: number;
    }
  >;
}

export function useVeIONVote(chain: number) {
  const { getSdk } = useMultiIonic();
  const ionicSdk = getSdk(chain);
  const voterContract = ionicSdk?.veIONContracts?.voter;
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { write } = useContractWrite();

  const [state, setState] = useState<VoteState>({
    isVoting: false,
    error: null,
    pendingVotes: new Map()
  });

  const resetState = () => {
    setState({
      isVoting: false,
      error: null,
      pendingVotes: new Map()
    });
  };

  const handleError = (error: Error) => {
    setState((prev) => ({
      ...prev,
      error: error.message,
      isVoting: false
    }));
  };

  const addVote = (marketAddress: string, side: MarketSide, weight: number) => {
    setState((prev) => ({
      ...prev,
      pendingVotes: new Map(prev.pendingVotes).set(marketAddress, {
        side,
        weight
      })
    }));
  };

  const removeVote = (marketAddress: string) => {
    setState((prev) => {
      const newVotes = new Map(prev.pendingVotes);
      newVotes.delete(marketAddress);
      return {
        ...prev,
        pendingVotes: newVotes
      };
    });
  };

  const submitVote = async (tokenId: number) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    if (!voterContract) {
      throw new Error('Contract not initialized');
    }

    if (state.pendingVotes.size === 0) {
      throw new Error('No votes to submit');
    }

    try {
      const isSwitched = await handleSwitchOriginChain(chain, chainId);
      if (!isSwitched) throw new Error('Failed to switch chain');

      setState((prev) => ({ ...prev, isVoting: true }));

      // Convert pending votes to arrays for contract call
      const votes = Array.from(state.pendingVotes.entries());
      const marketAddresses = votes.map(([address]) => address as Address);
      const sides = votes.map(([_, data]) => data.side);
      const weights = votes.map(([_, data]) => data.weight);

      // Validate weights sum to 100
      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
      if (totalWeight !== 100) {
        throw new Error('Vote weights must sum to 100');
      }

      await write(
        {
          address: voterContract.address,
          abi: voterContract.abi,
          functionName: 'vote',
          args: [tokenId, marketAddresses, sides, weights]
        },
        {
          successMessage: 'Successfully submitted votes',
          errorMessage: 'Failed to submit votes'
        }
      );

      setState((prev) => ({
        ...prev,
        isVoting: false,
        pendingVotes: new Map()
      }));
      return true;
    } catch (error) {
      handleError(error as Error);
      return false;
    }
  };

  const getPendingVotes = () => Array.from(state.pendingVotes.entries());
  const getVoteCount = () => state.pendingVotes.size;

  return {
    addVote,
    removeVote,
    submitVote,
    getPendingVotes,
    getVoteCount,
    resetState,
    ...state
  };
}
