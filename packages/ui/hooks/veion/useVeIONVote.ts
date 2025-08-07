import { useState } from 'react';

import {
  useAccount,
  useChainId,
  usePublicClient,
  useWalletClient
} from 'wagmi';

import { getiVoterContract } from '@ui/constants/veIon';
import { useVeIonVoteContext } from '@ui/context/VeIonVoteContext';
import type { MarketSide } from '@ui/types/veION';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import { useContractWrite } from '../useContractWrite';

interface VoteParams {
  marketAddresses: `0x${string}`[];
  sides: MarketSide[];
  weights: bigint[];
}

interface VoteState {
  isVoting: boolean;
  isResetting: boolean;
  error: string | null;
  pendingVotes: Map<
    string,
    {
      side: MarketSide;
      weight: bigint;
    }
  >;
}

export const convertToContractWeight = (percentage: string): number => {
  const value = parseFloat(percentage);
  // Convert percentage to basis points (100% = 10000)
  return Math.round(value * 100);
};

export const convertFromContractWeight = (weight: number): string => {
  return (weight / 100).toFixed(2);
};

export function useVeIONVote(chain: number) {
  const voterContract = getiVoterContract(chain);
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { write } = useContractWrite();

  // Get refresh functions from context
  const { selectedPoolRows, votingPeriod } = useVeIonVoteContext();

  const [state, setState] = useState<VoteState>({
    isVoting: false,
    isResetting: false,
    error: null,
    pendingVotes: new Map()
  });

  const getContractConfig = (functionName: string, args: any[]) => {
    if (!voterContract) {
      console.error('Contract not initialized');
      throw new Error('Contract not initialized');
    }
    return {
      address: voterContract.address,
      abi: voterContract.abi,
      functionName,
      args
    };
  };

  const simulateVote = async (tokenId: number, voteParams: VoteParams) => {
    if (!voterContract || !publicClient) {
      throw new Error('Contract not initialized for simulation');
    }

    const { marketAddresses, sides, weights } = voteParams;

    try {
      const simulatedCall = await publicClient.simulateContract({
        ...voterContract,
        functionName: 'vote',
        args: [BigInt(tokenId), marketAddresses, sides, weights],
        account: address as `0x${string}`
      });

      return true;
    } catch (error) {
      console.error('Simulation failed:', error);
      throw error;
    }
  };

  async function handleVote(tokenId: number, voteParams: VoteParams) {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    if (!voterContract || !publicClient || !walletClient) {
      throw new Error('Contract not initialized');
    }

    const { marketAddresses, sides, weights } = voteParams;

    if (marketAddresses.length === 0) {
      throw new Error('No votes to submit');
    }

    try {
      // Validate chain
      const isSwitched = await handleSwitchOriginChain(chain, chainId);
      if (!isSwitched) throw new Error('Failed to switch chain');

      setState((prev) => ({ ...prev, isVoting: true }));

      // Simulate before actual transaction
      await simulateVote(tokenId, voteParams);

      // Validate array lengths match
      if (
        marketAddresses.length !== sides.length ||
        sides.length !== weights.length
      ) {
        throw new Error('Mismatched array lengths');
      }

      await write(
        getContractConfig('vote', [tokenId, marketAddresses, sides, weights]),
        {
          successMessage: 'Successfully submitted votes',
          errorMessage: 'Failed to submit votes'
        }
      );

      // Refetch data after successful vote
      await Promise.all([
        votingPeriod.refetch?.(),
        selectedPoolRows.refetch?.()
      ]);

      setState((prev) => ({
        ...prev,
        isVoting: false,
        pendingVotes: new Map()
      }));

      return true;
    } catch (error) {
      console.error('Vote submission failed:', error);
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        isVoting: false
      }));
      return false;
    }
  }

  const handleReset = async (tokenId: number) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    if (!voterContract || !publicClient || !walletClient) {
      throw new Error('Contract not initialized');
    }

    try {
      // Validate chain
      const isSwitched = await handleSwitchOriginChain(chain, chainId);
      if (!isSwitched) throw new Error('Failed to switch chain');

      setState((prev) => ({ ...prev, isResetting: true }));

      await write(getContractConfig('reset', [tokenId]), {
        successMessage: 'Successfully reset votes',
        errorMessage: 'Failed to reset votes, last voted this epoch'
      });

      // Refetch data after successful reset
      await Promise.all([
        votingPeriod.refetch?.(),
        selectedPoolRows.refetch?.()
      ]);

      setState((prev) => ({
        ...prev,
        isResetting: false,
        pendingVotes: new Map()
      }));

      return true;
    } catch (error) {
      console.error('Vote reset failed:', error);
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        isResetting: false
      }));
      return false;
    }
  };

  return {
    handleVote,
    handleReset,
    simulateVote,
    resetState: () =>
      setState({
        isVoting: false,
        isResetting: false,
        error: null,
        pendingVotes: new Map()
      }),
    ...state
  };
}
