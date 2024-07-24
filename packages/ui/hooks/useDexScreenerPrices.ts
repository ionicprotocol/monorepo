import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface DexScreenerPriceData {
  pair: { priceUsd: string };
}
export function useIonPrice() {
  return useQuery({
    queryKey: ['ionPrice'],

    queryFn: async () => {
      const res = await axios.get(
        'https://api.dexscreener.com/latest/dex/pairs/base/0x0fac819628a7f612abac1cad939768058cc0170c'
      );

      const pairData = res.data;

      return pairData as DexScreenerPriceData;
    },

    gcTime: Infinity,
    staleTime: Infinity
  });
}

export function useModePrice() {
  return useQuery({
    queryKey: ['modePrice'],

    queryFn: async () => {
      const res = await axios.get(
        'https://api.dexscreener.com/latest/dex/pairs/mode/0x8cfe2a02dfbabc56ae7e573170e35f88a38bea55'
      );

      const pairData = res.data;

      return pairData as DexScreenerPriceData;
    },

    gcTime: Infinity,
    staleTime: Infinity
  });
}
