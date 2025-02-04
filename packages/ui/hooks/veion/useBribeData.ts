import { useQuery } from '@tanstack/react-query';
import { erc20Abi } from 'viem';
import { usePublicClient, useReadContract } from 'wagmi';

import type { Address, PublicClient } from 'viem';

import { bribeRewardsAbi } from '@ionicprotocol/sdk';
import { voterLensAbi } from '@ionicprotocol/sdk/src';

const CHAIN_ADDRESSES = {
  8453: '0x0E6F5bb82ba499A3FdAE6449c00A2936286bbf02', // Base
  34443: '0x0E6F5bb82ba499A3FdAE6449c00A2936286bbf02' // Mode
} as const;

const CACHE_TIME = 5 * 60 * 1000;
const STALE_TIME = 60 * 1000;

type RewardInfo = {
  token: Address;
  symbol?: string;
  decimals?: number;
  weeklyAmount: bigint;
  annualAmount: bigint; // weeklyAmount * 52
  apr: number;
  formattedWeeklyAmount: string;
};

type MarketBribeData = {
  supply: {
    rewards: RewardInfo[];
    totalApr: number;
    bribeAddress: Address;
  };
  borrow: {
    rewards: RewardInfo[];
    totalApr: number;
    bribeAddress: Address;
  };
};

type BribeAprData = Record<string, MarketBribeData>;

export const useBribeData = ({ chain }: { chain: number }) => {
  const publicClient = usePublicClient({ chainId: chain });
  const voterLensAddress =
    CHAIN_ADDRESSES[chain as keyof typeof CHAIN_ADDRESSES];

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
      if (!publicClient || !bribes.length) return {};

      const newBribeData: BribeAprData = {};

      await Promise.all(
        bribes.map(async (bribe) => {
          const marketKey = bribe.market.toLowerCase();

          const [supplyData, borrowData] = await Promise.all([
            calculateDetailedBribeInfo(publicClient, bribe.bribeSupply, chain),
            calculateDetailedBribeInfo(publicClient, bribe.bribeBorrow, chain)
          ]);

          newBribeData[marketKey] = {
            supply: {
              ...supplyData,
              bribeAddress: bribe.bribeSupply
            },
            borrow: {
              ...borrowData,
              bribeAddress: bribe.bribeBorrow
            }
          };
        })
      );

      return newBribeData;
    },
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    enabled: bribes.length > 0 && !!publicClient
  });

  const getBribeApr = (marketAddress: string, side: 'borrow' | 'supply') => {
    const market = marketAddress.toLowerCase();
    return bribeData[market]?.[side].totalApr ?? 0;
  };

  const getRewardDetails = (
    marketAddress: string,
    side: 'borrow' | 'supply'
  ) => {
    const market = marketAddress.toLowerCase();
    return bribeData[market]?.[side] ?? null;
  };

  return {
    bribeData,
    isLoading,
    error,
    getBribeApr,
    getRewardDetails
  };
};

async function calculateDetailedBribeInfo(
  publicClient: PublicClient,
  bribeAddress: Address,
  chainId: number
) {
  try {
    const rewardTokens = await publicClient.readContract({
      address: bribeAddress,
      abi: bribeRewardsAbi,
      functionName: 'getAllLpRewardTokens'
    });

    if (!rewardTokens.length) {
      return { rewards: [], totalApr: 0 };
    }

    // Get total supply using the first token
    const totalSupply = await publicClient.readContract({
      address: bribeAddress,
      abi: bribeRewardsAbi,
      functionName: 'totalSupply',
      args: [rewardTokens[0]]
    });

    if (totalSupply === 0n) {
      return { rewards: [], totalApr: 0 };
    }

    // Get details for each reward token
    const rewardsInfo = await Promise.all(
      rewardTokens.map(async (token) => {
        const [weeklyAmount, decimals, symbol] = await Promise.all([
          publicClient.readContract({
            address: bribeAddress,
            abi: bribeRewardsAbi,
            functionName: 'tokenRewardsPerEpoch',
            args: [token, BigInt(Math.floor(Date.now() / 1000))]
          }),
          publicClient.readContract({
            address: token,
            abi: erc20Abi,
            functionName: 'decimals'
          }),
          getTokenSymbol(token, publicClient, chainId)
        ]);

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
      })
    );

    const totalApr = rewardsInfo.reduce((sum, reward) => sum + reward.apr, 0);

    return {
      rewards: rewardsInfo,
      totalApr
    };
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
