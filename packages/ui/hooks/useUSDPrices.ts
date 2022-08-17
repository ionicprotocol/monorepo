import axios from 'axios';
import { useQuery } from 'react-query';

async function getUSDPriceOf(cgIds: string[]): Promise<number[]> {
  const { data } = await axios
    .get(`https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${cgIds.join(',')}`)
    .catch(() => {
      const mockData: { [key: string]: { usd: number } } = {};
      cgIds.forEach((cgId) => {
        mockData[cgId] = {
          usd: 1,
        };
      });
      return mockData;
    });
  return cgIds.map((cgId) => (data[cgId] ? data[cgId].usd : 1));
}

export function useUSDPrice(coingeckoIds: string[]) {
  return useQuery(
    ['useUSDPrice', ...coingeckoIds],
    async () => {
      return getUSDPriceOf(coingeckoIds);
    },
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!coingeckoIds && coingeckoIds.length > 0 }
  );
}
