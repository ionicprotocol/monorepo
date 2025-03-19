import { useQuery } from '@tanstack/react-query';
import { useAccount, usePublicClient } from 'wagmi';

import { useVeIONContext } from '@ui/context/VeIonContext';

import type { Address, Hex } from 'viem';

import { voterLensAbi } from '@ionicprotocol/sdk';
import type { SupportedChains } from '@ionicprotocol/types';

export const VOTERLENS_CHAIN_ADDRESSES = {
  8453: '0xFEF51b9B5a1050B2bBE52A39cC356dfCEE79D87B',
  34443: '0x0286bf00b6f6Cc45D2bd7e8C2e728B1DF2854c7D'
} as const;

export interface BribeReward {
  amount: bigint;
  chainId: SupportedChains;
  rewardToken: Hex;
  bribeAddress: Address;
  tokenId: bigint;
  market?: Address;
}

export interface UserBribe {
  tokenId: bigint;
  market: Address;
  bribe: Address;
  reward: Address;
  earned: bigint;
}

const extendedVoterLensAbi = [
  ...voterLensAbi,
  {
    type: 'function',
    name: 'getUserBribeRewards',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [
      {
        name: '_userBribes',
        type: 'tuple[]',
        components: [
          { name: 'tokenId', type: 'uint256' },
          { name: 'market', type: 'address' },
          { name: 'bribe', type: 'address' },
          { name: 'reward', type: 'address' },
          { name: 'earned', type: 'uint256' }
        ]
      }
    ],
    stateMutability: 'view'
  }
] as const;

export const useBribeRewards = () => {
  const { address: userAddress } = useAccount();
  const { currentChain } = useVeIONContext();
  const publicClient = usePublicClient({ chainId: currentChain });

  const {
    data: bribeRewards,
    isLoading,
    error
  } = useQuery<BribeReward[], Error>({
    queryKey: ['bribeRewards', currentChain, userAddress],
    queryFn: async () => {
      if (!userAddress || !publicClient || !currentChain) {
        return [];
      }

      const voterLensAddress =
        VOTERLENS_CHAIN_ADDRESSES[
          currentChain as keyof typeof VOTERLENS_CHAIN_ADDRESSES
        ];
      if (!voterLensAddress) return [];

      try {
        // Use the new getUserBribeRewards function to get all bribe rewards in one call
        const userBribes = (await publicClient.readContract({
          address: voterLensAddress,
          abi: extendedVoterLensAbi,
          functionName: 'getUserBribeRewards',
          args: [userAddress as Address]
        })) as UserBribe[];

        // console.log('User bribes from VoterLens:', userBribes);

        // Convert UserBribe objects to BribeReward objects
        const rewards: BribeReward[] = userBribes
          .filter((bribe) => bribe.earned > 0n) // Only include bribes with non-zero amounts
          .map((bribe) => ({
            amount: bribe.earned,
            chainId: currentChain as SupportedChains,
            rewardToken: bribe.reward as Hex,
            bribeAddress: bribe.bribe as Address,
            tokenId: bribe.tokenId,
            market: bribe.market
          }));

        return rewards;
      } catch (err) {
        console.error('Error fetching user bribe rewards:', err);
        throw err;
      }
    },
    enabled: !!userAddress && !!publicClient && !!currentChain,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000
  });

  return {
    bribeRewards: bribeRewards ?? [],
    isLoading,
    error
  };
};

// Helper function to group rewards by token ID (optional utility)
export const groupRewardsByTokenId = (rewards: BribeReward[]) => {
  const grouped: Record<string, BribeReward[]> = {};

  rewards.forEach((reward) => {
    const tokenIdKey = reward.tokenId.toString();
    if (!grouped[tokenIdKey]) {
      grouped[tokenIdKey] = [];
    }
    grouped[tokenIdKey].push(reward);
  });

  return grouped;
};
