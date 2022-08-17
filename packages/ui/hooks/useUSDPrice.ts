import axios from 'axios';
import { useQuery } from 'react-query';

export function useUSDPrice(coingeckoId: string) {
  return useQuery(
    ['useUSDPrice', coingeckoId],
    async () => {
      let usdPrice: number;

      try {
        usdPrice = (
          await axios.get(
            `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${coingeckoId}`
          )
        ).data[coingeckoId].usd as number;

        // set 1.0 for undefined token prices in coingecko
        usdPrice = usdPrice ? usdPrice : 1.0;
      } catch (e) {
        usdPrice = 1.0;
      }

      return usdPrice;
    },
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!coingeckoId }
  );
}
