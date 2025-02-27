import { useQuery } from '@tanstack/react-query';
import { erc20Abi } from 'viem';
import { usePublicClient, useReadContract } from 'wagmi';

import {
  REWARD_TOKENS,
  VOTERLENS_CHAIN_ADDRESSES
} from '../rewards/useBribeRewards';

import type { Address, Hex, PublicClient } from 'viem';

import { voterLensAbi, bribeRewardsAbi } from '@ionicprotocol/sdk';

type RewardInfo = {
  token: Address;
  symbol?: string;
  decimals?: number;
  weeklyAmount: bigint;
  annualAmount: bigint;
  apr: number;
  formattedWeeklyAmount: string;
};

type MarketBribeData = {
  supply: { rewards: RewardInfo[]; totalApr: number; bribeAddress: Address };
  borrow: { rewards: RewardInfo[]; totalApr: number; bribeAddress: Address };
};

type BribeAprData = Record<string, MarketBribeData>;

export const useBribeData = ({ chain }: { chain: number }) => {
  const publicClient = usePublicClient({ chainId: chain });
  const voterLensAddress =
    VOTERLENS_CHAIN_ADDRESSES[chain as keyof typeof VOTERLENS_CHAIN_ADDRESSES];
  const rewardTokens = REWARD_TOKENS[chain as keyof typeof REWARD_TOKENS];

  const { data: bribes = [] } = useReadContract({
    address: voterLensAddress,
    abi: voterLensAbi,
    functionName: 'getAllBribes',
    chainId: chain
  });

  const {
    data: bribeData = {},
    isLoading,
    error
  } = useQuery<BribeAprData, Error>({
    queryKey: ['bribeData', chain],
    queryFn: async () => {
      if (!publicClient || !bribes.length || !rewardTokens?.length) return {};

      const newBribeData: BribeAprData = {};
      const currentEpoch = BigInt(Math.floor(Date.now() / 1000));

      await Promise.all(
        bribes.map(async (bribe) => {
          const marketKey = bribe.market.toLowerCase();
          const [supplyData, borrowData] = await Promise.all([
            calculateDetailedBribeInfo(
              publicClient,
              bribe.bribeSupply,
              rewardTokens,
              currentEpoch,
              chain
            ),
            calculateDetailedBribeInfo(
              publicClient,
              bribe.bribeBorrow,
              rewardTokens,
              currentEpoch,
              chain
            )
          ]);

          newBribeData[marketKey] = {
            supply: { ...supplyData, bribeAddress: bribe.bribeSupply },
            borrow: { ...borrowData, bribeAddress: bribe.bribeBorrow }
          };
        })
      );

      return newBribeData;
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: bribes.length > 0 && !!publicClient && !!rewardTokens?.length
  });

  const getBribeApr = (marketAddress: string, side: 'borrow' | 'supply') =>
    bribeData[marketAddress.toLowerCase()]?.[side].totalApr ?? 0;

  const getRewardDetails = (marketAddress: string, side: 'borrow' | 'supply') =>
    bribeData[marketAddress.toLowerCase()]?.[side] ?? null;

  return { bribeData, isLoading, error, getBribeApr, getRewardDetails };
};

async function calculateDetailedBribeInfo(
  publicClient: PublicClient,
  bribeAddress: Address,
  rewardTokens: readonly Hex[],
  currentEpoch: bigint,
  chainId: number
) {
  try {
    // Batch all contract calls
    const [totalSupplies, tokenInfos, rewardsPerEpoch] = await Promise.all([
      Promise.all(
        rewardTokens.map((token) =>
          publicClient.readContract({
            address: bribeAddress,
            abi: bribeRewardsAbi,
            functionName: 'totalSupply',
            args: [token]
          })
        )
      ),
      Promise.all(
        rewardTokens.map((token) =>
          Promise.all([
            publicClient.readContract({
              address: token,
              abi: erc20Abi,
              functionName: 'decimals'
            }),
            getTokenSymbol(token, publicClient, chainId)
          ])
        )
      ),
      Promise.all(
        rewardTokens.map((token) =>
          publicClient.readContract({
            address: bribeAddress,
            abi: bribeRewardsAbi,
            functionName: 'tokenRewardsPerEpoch',
            args: [token, currentEpoch]
          })
        )
      )
    ]);

    const totalSupply = totalSupplies[0]; // Assuming same supply for all tokens
    if (totalSupply === 0n) return { rewards: [], totalApr: 0 };

    const rewardsInfo = rewardTokens.map((token, i) => {
      const weeklyAmount = rewardsPerEpoch[i];
      const [decimals, symbol] = tokenInfos[i];
      const annualAmount = weeklyAmount * BigInt(52);
      const apr =
        totalSupply > 0n
          ? (Number(annualAmount) / Number(totalSupply)) * 100
          : 0;

      return {
        token,
        symbol,
        decimals,
        weeklyAmount,
        annualAmount,
        apr,
        formattedWeeklyAmount: formatTokenAmount(weeklyAmount, decimals)
      };
    });

    const totalApr = rewardsInfo.reduce((sum, reward) => sum + reward.apr, 0);
    return { rewards: rewardsInfo, totalApr };
  } catch (err) {
    console.error('Error calculating bribe info:', err);
    return { rewards: [], totalApr: 0 };
  }
}

const COINGECKO_CHAIN_IDS = {
  8453: 'base',
  34443: 'mode'
} as const;

const symbolCache = new Map<string, string>();

export async function getTokenSymbol(
  token: Address,
  publicClient: PublicClient,
  chainId: number
): Promise<string> {
  const cacheKey = `${chainId}-${token}`;
  if (symbolCache.has(cacheKey)) {
    return symbolCache.get(cacheKey)!;
  }

  try {
    // First try ERC20 symbol
    const symbol = await publicClient.readContract({
      address: token,
      abi: erc20Abi,
      functionName: 'symbol'
    });

    symbolCache.set(cacheKey, symbol);
    return symbol;
  } catch (err) {
    // Fallback to CoinGecko
    try {
      const cgChainId =
        COINGECKO_CHAIN_IDS[chainId as keyof typeof COINGECKO_CHAIN_IDS];
      const response = await fetch(
        `https://api.coingecko.com/v3/coins/${cgChainId}/contract/${token}`
      );
      const data = await response.json();
      const symbol = data.symbol.toUpperCase();

      symbolCache.set(cacheKey, symbol);
      return symbol;
    } catch (err) {
      // If all fails, return shortened address
      const shortAddr = `${token.slice(0, 6)}...${token.slice(-4)}`;
      symbolCache.set(cacheKey, shortAddr);
      return shortAddr;
    }
  }
}

export function formatTokenAmount(
  amount: bigint,
  decimals: number = 18
): string {
  const formatted = Number(amount) / 10 ** decimals;
  if (formatted < 0.01) return '< 0.01';
  return formatted.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });
}
