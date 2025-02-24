import { useQuery } from '@tanstack/react-query';
import { useAccount, usePublicClient } from 'wagmi';

import { useVeIONContext } from '@ui/context/VeIonContext';

import type { Address, Hex } from 'viem';

import { bribeRewardsAbi, voterLensAbi } from '@ionicprotocol/sdk';
import type { SupportedChains } from '@ionicprotocol/types';

export const VOTERLENS_CHAIN_ADDRESSES = {
  8453: '0x0E6F5bb82ba499A3FdAE6449c00A2936286bbf02', // Base VoterLens
  34443: '0x414E7b43B8b82aDf0B02c84E9EC02Aa82d87b2aA' // Mode VoterLens
} as const;

export const REWARD_TOKENS = {
  8453: ['0x0FAc819628a7F612AbAc1CaD939768058cc0170c'] as const, // Base
  34443: [
    '0xC6A394952c097004F83d2dfB61715d245A38735a',
    '0x690A74d2eC0175a69C0962B309E03021C0b5002E'
  ] as const // Mode
} as const;

export interface BribeReward {
  amount: bigint;
  chainId: SupportedChains;
  rewardToken: Hex;
  bribeAddress: Address;
  tokenId: bigint;
}

export const useBribeRewards = () => {
  const { address: userAddress } = useAccount();
  const {
    currentChain,
    locks: { myLocks }
  } = useVeIONContext();
  const publicClient = usePublicClient({ chainId: currentChain });
  const tokenIds = myLocks?.map((lock) => BigInt(lock.id)) || [];

  const {
    data: bribeRewards,
    isLoading,
    error
  } = useQuery<BribeReward[], Error>({
    queryKey: ['bribeRewards', currentChain, userAddress, tokenIds],
    queryFn: async () => {
      if (!userAddress || !tokenIds.length || !publicClient || !currentChain) {
        return [];
      }

      const voterLensAddress =
        VOTERLENS_CHAIN_ADDRESSES[
          currentChain as keyof typeof VOTERLENS_CHAIN_ADDRESSES
        ];
      if (!voterLensAddress) return [];

      const rewardTokens =
        REWARD_TOKENS[currentChain as keyof typeof REWARD_TOKENS];
      if (!rewardTokens || !rewardTokens.length) return [];

      // Fetch all bribe contracts for the current chain
      const bribes = await publicClient.readContract({
        address: voterLensAddress,
        abi: voterLensAbi,
        functionName: 'getAllBribes'
      });

      if (!bribes.length) return [];

      // Collect all bribe addresses
      const bribeAddresses: Address[] = bribes.flatMap((bribe) => [
        bribe.bribeSupply,
        bribe.bribeBorrow
      ]);

      // Build earned calls for all combinations of bribeAddress, rewardToken, and tokenId
      const earnedCalls = bribeAddresses.flatMap((bribeAddress) =>
        rewardTokens.flatMap((rewardToken) =>
          tokenIds.map((tokenId) => ({
            address: bribeAddress,
            abi: bribeRewardsAbi,
            functionName: 'earned' as const,
            args: [rewardToken, tokenId] as [Hex, bigint]
          }))
        )
      );

      if (!earnedCalls.length) return [];

      // Execute all earned calls in one multicall
      const earnedResults = await publicClient.multicall({
        contracts: earnedCalls,
        allowFailure: true
      });

      // Process results into BribeReward array
      const rewards: BribeReward[] = [];
      let resultIndex = 0;

      for (const bribeAddress of bribeAddresses) {
        for (const rewardToken of rewardTokens) {
          for (const tokenId of tokenIds) {
            const result = earnedResults[resultIndex];
            if (result.status === 'success' && result.result) {
              const amount = result.result as bigint;
              if (amount > 0n) {
                rewards.push({
                  amount,
                  chainId: currentChain as SupportedChains,
                  rewardToken,
                  bribeAddress,
                  tokenId
                });
              }
            }
            resultIndex++;
          }
        }
      }

      return rewards;
    },
    enabled:
      !!userAddress && !!tokenIds.length && !!publicClient && !!currentChain,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000
  });

  return {
    bribeRewards: bribeRewards ?? [],
    isLoading,
    error
  };
};
