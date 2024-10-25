import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { base, mode, optimism } from 'viem/chains';

import { BaseReservesContractAddr } from '@ui/constants/baselp';
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
    pairAddress: '0x8cfe2a02dfbabc56ae7e573170e35f88a38bea55', // MODE pair
    tokenSymbol: 'MODE',
    ionAddress: ModeReservesContractAddr.toLocaleLowerCase()
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
