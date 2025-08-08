import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { base, mode, optimism } from 'viem/chains';

import { BaseReservesContractAddr } from '@ui/constants/baselp';
import {
  LiskIonTokenAddress,
  LiskReservesContractAddr
} from '@ui/constants/liskLp';
import { ModeReservesContractAddr } from '@ui/constants/lp';
import { OPReservesContractAddr } from '@ui/constants/oplp';

export interface DexScreenerPriceData {
  pair: { priceUsd: string };
}

const REWARD_TOKEN_CONFIGS = {
  [base.id]: {
    name: 'base',
    pairAddress: '0x20cb8f872ae894f7c9e32e621c186e5afce82fd0', // AERO pair
    tokenSymbol: 'AERO',
    ionAddress: BaseReservesContractAddr.toLocaleLowerCase()
  },
  [optimism.id]: {
    name: 'optimism',
    pairAddress: '0x58e6433a6903886e440ddf519ecc573c4046a6b2', // VELO pair
    tokenSymbol: 'VELO',
    ionAddress: OPReservesContractAddr.toLocaleLowerCase()
  },
  [mode.id]: {
    name: 'mode',
    pairAddress: '0xc2026f3fb6fc51f4ecae40a88b4509cb6c143ed4', // MODE pair
    tokenSymbol: 'xVELO',
    ionAddress: ModeReservesContractAddr.toLocaleLowerCase()
  },
  [1135]: {
    name: 'mode',
    pairAddress: '0x076d0CD6228B042aA28E1E6A0894Cf6C97abc23b',
    tokenSymbol: 'xVELO',
    ionAddress: ModeReservesContractAddr.toLocaleLowerCase() // using mode ion address for lisk, because dexscreener does not have it
  }
} as const;

export function useTokenPrice(chainId: number) {
  const config =
    REWARD_TOKEN_CONFIGS[chainId as keyof typeof REWARD_TOKEN_CONFIGS];

  return useQuery({
    queryKey: ['rewardTokenPrice', chainId],
    queryFn: async () => {
      if (!config) {
        throw new Error(`Chain ID ${chainId} not supported`);
      }

      const res = await axios.get(
        `https://api.dexscreener.com/latest/dex/pairs/${config.name}/${config.pairAddress}`
      );

      return {
        ...(res.data as DexScreenerPriceData),
        tokenSymbol: config.tokenSymbol
      };
    },
    staleTime: Infinity
  });
}

export function useIonPrice({ chainId }: { chainId: number }) {
  const { name, ionAddress: address } =
    REWARD_TOKEN_CONFIGS[chainId as keyof typeof REWARD_TOKEN_CONFIGS];

  return useQuery({
    queryKey: ['ionPrice'],
    queryFn: async () => {
      const res = await axios.get(
        `https://api.dexscreener.com/latest/dex/pairs/${name}/${address}`
      );

      const pairData = res.data;

      return pairData as DexScreenerPriceData;
    },

    staleTime: Infinity
  });
}

export function useIonPrices(specificChains?: number[]) {
  // If no chains provided, use all available chains
  const chains = specificChains || [8453, 34443, 10, 1135];

  return useQuery({
    queryKey: ['ionPrices', chains], // Add chains to queryKey for proper caching
    queryFn: async () => {
      const pricePromises = chains.map(async (chainId) => {
        const config =
          REWARD_TOKEN_CONFIGS[chainId as keyof typeof REWARD_TOKEN_CONFIGS];
        if (!config) return { chainId, price: 0 };

        try {
          const res = await axios.get(
            `https://api.dexscreener.com/latest/dex/pairs/${config.name}/${config.ionAddress}`
          );
          return {
            chainId,
            price: Number(res.data.pairs[0]?.priceUsd || '0')
          };
        } catch (error) {
          console.warn(
            `Failed to fetch ION price for chain ${chainId}:`,
            error
          );
          return { chainId, price: 0 };
        }
      });

      const prices = await Promise.all(pricePromises);
      return Object.fromEntries(
        prices.map(({ chainId, price }) => [chainId, price])
      ) as Record<number, number>;
    },
    staleTime: 60000 // Refresh every minute
  });
}
