/* eslint-disable no-console */
import { useState } from 'react';

import {
  useAccount,
  useChainId,
  usePublicClient,
  useWalletClient
} from 'wagmi';

import { getVoterContract } from '@ui/constants/veIon';
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
  const voterContract = getVoterContract(chain);
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { write } = useContractWrite();

  const [state, setState] = useState<VoteState>({
    isVoting: false,
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
    console.error('Vote Error:', error);
  };

  const simulateVote = async (tokenId: number, voteParams: VoteParams) => {
    if (!voterContract || !publicClient) {
      throw new Error('Contract not initialized for simulation');
    }

    const { marketAddresses, sides, weights } = voteParams;

    console.log('Simulating vote with params:', {
      tokenId,
      marketAddresses,
      sides,
      weights
    });

    try {
      // Check if NFT is whitelisted
      const isWhitelisted = await publicClient.readContract({
        ...voterContract,
        functionName: 'isWhitelistedNFT',
        args: [BigInt(tokenId)]
      });

      console.log('NFT whitelist status:', { tokenId, isWhitelisted });

      if (!isWhitelisted) {
        throw new Error('NFT is not whitelisted');
      }

      // Check if already voted in this epoch
      const lastVoted = await publicClient.readContract({
        ...voterContract,
        functionName: 'lastVoted',
        args: [BigInt(tokenId)]
      });

      console.log('Last voted timestamp:', { tokenId, lastVoted });

      // Simulate the transaction
      const simulatedCall = await publicClient.simulateContract({
        ...voterContract,
        functionName: 'vote',
        args: [BigInt(tokenId), marketAddresses, sides, weights],
        account: address as `0x${string}`
      });

      console.log('Simulation successful:', simulatedCall);
      return true;
    } catch (error) {
      console.error('Simulation failed:', error);
      throw error;
    }
  };

  const submitVote = async (tokenId: number, voteParams: VoteParams) => {
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
      console.log('Starting vote submission:', {
        tokenId,
        marketAddresses,
        sides,
        weights,
        currentChain: chainId,
        targetChain: chain
      });

      // Validate chain
      const isSwitched = await handleSwitchOriginChain(chain, chainId);
      if (!isSwitched) throw new Error('Failed to switch chain');

      setState((prev) => ({ ...prev, isVoting: true }));

      // Simulate before actual transaction
      await simulateVote(tokenId, voteParams);

      // Validate weights sum to 10000 (100%)
      const totalWeight = weights.reduce(
        (sum, weight) => sum + Number(weight),
        0
      );
      console.log('Total weight:', totalWeight);

      if (totalWeight !== 10000) {
        throw new Error(
          `Vote weights must sum to 100% (got ${totalWeight / 100}%)`
        );
      }

      // Validate array lengths match
      if (
        marketAddresses.length !== sides.length ||
        sides.length !== weights.length
      ) {
        throw new Error('Mismatched array lengths');
      }

      // Get current block for reference
      const block = await publicClient.getBlock();
      console.log('Current block:', {
        number: block.number,
        timestamp: block.timestamp
      });

      await write(
        getContractConfig('vote', [tokenId, marketAddresses, sides, weights]),
        {
          successMessage: 'Successfully submitted votes',
          errorMessage: 'Failed to submit votes',
          onSuccess: () => {
            console.log('Vote transaction succeeded');
            setState((prev) => ({
              ...prev,
              isVoting: false,
              pendingVotes: new Map()
            }));
          },
          onError: (error) => {
            console.error('Vote transaction failed:', error);
            handleError(error as Error);
          }
        }
      );

      return true;
    } catch (error) {
      console.error('Vote submission failed:', error);
      handleError(error as Error);
      return false;
    }
  };

  return {
    submitVote,
    simulateVote,
    resetState,
    ...state
  };
}
