import { neondevnet } from '@midas-capital/chains';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { COINGECKO_API, DEFI_LLAMA_API } from '@ui/constants/index';

export function useUSDPrice(coingeckoId: string) {
  return useQuery(
    ['useUSDPrice', coingeckoId],
    async () => {
      let usdPrice = NaN;

      try {
        const { data } = await axios.get(`${COINGECKO_API}${coingeckoId}`);

        if (data[coingeckoId] && data[coingeckoId].usd) {
          usdPrice = data[coingeckoId].usd;
        }
      } catch (e) {
        const { data } = await axios.get(`${DEFI_LLAMA_API}coingecko:${coingeckoId}`);

        if (
          data.coins[`coingecko:${coingeckoId}`] &&
          data.coins[`coingecko:${coingeckoId}`].price
        ) {
          usdPrice = data.coins[`coingecko:${coingeckoId}`].price;
        }
      }

      if (usdPrice) {
        return usdPrice;
      } else {
        if (coingeckoId === neondevnet.specificParams.cgId) {
          return 0.05;
        } else {
          return 1;
        }
      }
    },
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!coingeckoId }
  );
}
