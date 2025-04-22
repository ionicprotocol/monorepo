import { createClient } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';
import { useAccount, usePublicClient } from 'wagmi';

import { REWARDS_TO_SYMBOL } from '@ui/constants'; // Import the REWARDS_TO_SYMBOL mapping
import { useVeIONContext } from '@ui/context/VeIonContext';

import type { Address, Hex } from 'viem';

import { voterLensAbi } from '@ionicprotocol/sdk';
import type { SupportedChains } from '@ionicprotocol/types';

const supabase = createClient(
  'https://uoagtjstsdrjypxlkuzr.supabase.co/',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvYWd0anN0c2RyanlweGxrdXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc5MDE2MTcsImV4cCI6MjAyMzQ3NzYxN30.CYck7aPTmW5LE4hBh2F4Y89Cn15ArMXyvnP3F521S78'
);

export const VOTERLENS_CHAIN_ADDRESSES = {
  8453: '0xFEF51b9B5a1050B2bBE52A39cC356dfCEE79D87B',
  34443: '0x0286bf00b6f6Cc45D2bd7e8C2e728B1DF2854c7D',
  1135: '0x8865E0678E3b1BD0F5302e4C178a4B576F6aAA27' // Using Lisk Voter contract as Lens
} as const;

export interface BribeReward {
  amount: bigint;
  chainId: SupportedChains;
  rewardToken: Hex;
  bribeAddress: Address;
  tokenId: bigint;
  market?: Address;
  // Add these fields for formatted display
  formattedAmount?: string;
  tokenSymbol?: string;
}

export interface UserBribe {
  tokenId: bigint;
  market: Address;
  bribe: Address;
  reward: Address;
  earned: bigint;
}

export interface TokenInfo {
  symbol: string;
  decimals: number;
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
        // Step 1: Get user bribes from the blockchain
        const userBribes = (await publicClient.readContract({
          address: voterLensAddress,
          abi: extendedVoterLensAbi,
          functionName: 'getUserBribeRewards',
          args: [userAddress as Address]
        })) as UserBribe[];

        // Step 2: Filter to bribes with earned amounts > 0
        const rewardsWithAmounts = userBribes
          .filter((bribe) => bribe.earned > 0n)
          .map((bribe) => ({
            amount: bribe.earned,
            chainId: currentChain as SupportedChains,
            rewardToken: bribe.reward as Hex,
            bribeAddress: bribe.bribe as Address,
            tokenId: bribe.tokenId,
            market: bribe.market
          }));

        // Step 3: If no rewards, return early
        if (rewardsWithAmounts.length === 0) {
          return [];
        }

        // Step 4: Get token info from Supabase for all reward tokens
        const rewardTokenAddresses = [
          ...new Set(rewardsWithAmounts.map((r) => r.rewardToken.toLowerCase()))
        ];

        // Query Supabase for token information (both as underlying and ctoken)
        const tokenInfo: Record<string, TokenInfo> = {};

        // First check for tokens as underlying assets
        const { data: underlyingData } = await supabase
          .from('asset_master_data_main')
          .select('underlying_symbol, underlying_address, decimals')
          .eq('chain_id', currentChain)
          .in('underlying_address', rewardTokenAddresses);

        if (underlyingData && underlyingData.length > 0) {
          underlyingData.forEach((token) => {
            if (token.underlying_address) {
              tokenInfo[token.underlying_address.toLowerCase()] = {
                symbol: token.underlying_symbol || 'Unknown',
                decimals: token.decimals || 18
              };
            }
          });
        }

        // Then check for tokens as ctokens
        const { data: ctokenData } = await supabase
          .from('asset_master_data_main')
          .select('ctoken_symbol, ctoken_address, ctoken_decimals')
          .eq('chain_id', currentChain)
          .in('ctoken_address', rewardTokenAddresses);

        if (ctokenData && ctokenData.length > 0) {
          ctokenData.forEach((token) => {
            if (token.ctoken_address) {
              tokenInfo[token.ctoken_address.toLowerCase()] = {
                symbol: token.ctoken_symbol || 'Unknown',
                decimals: token.ctoken_decimals || 18
              };
            }
          });
        }

        // Step 5: Format rewards with the correct decimals and symbols
        const formattedRewards = rewardsWithAmounts.map((reward) => {
          const tokenAddress = reward.rewardToken.toLowerCase();
          const info = tokenInfo[tokenAddress];

          // Use token info from DB or fallback for decimals
          const decimals = info?.decimals || 18;

          const tokenSymbol =
            info?.symbol ||
            (REWARDS_TO_SYMBOL[reward.chainId] &&
              REWARDS_TO_SYMBOL[reward.chainId][reward.rewardToken]) ||
            'Unknown';

          return {
            ...reward,
            formattedAmount: formatUnits(reward.amount, decimals),
            tokenSymbol
          };
        });

        return formattedRewards;
      } catch (err) {
        console.error('Error fetching user bribe rewards:', err);
        throw err;
      }
    },
    enabled: !!userAddress && !!publicClient && !!currentChain,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000 // 5 minutes
  });

  return {
    bribeRewards: bribeRewards ?? [],
    isLoading,
    error
  };
};
