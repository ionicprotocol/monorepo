import * as ChainConfigs from '@midas-capital/chains';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { SupportedChains } from 'types/dist/cjs';

// TODO Make currency agnostic
async function getUSDPriceOf(chainIds: SupportedChains[]): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};

  await Promise.all(
    chainIds.map(async (id) => {
      const config = Object.values(ChainConfigs).find(
        (config) => config.chainId.toString() === id.toString()
      );

      if (config) {
        if (config.chainId === ChainConfigs.neondevnet.chainId) {
          prices[id.toString()] = 0.05;
        } else {
          const _cgId = config.specificParams.cgId;
          const { data } = await axios.get(
            `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${_cgId}`
          );

          prices[id.toString()] = data[_cgId].usd;
        }
      } else {
        prices[id.toString()] = 1;
      }
    })
  );

  return prices;
}

export function useUSDPrices(chainIds: SupportedChains[]) {
  return useQuery(
    ['useUSDPrice', ...chainIds.sort()],
    async () => {
      return getUSDPriceOf(chainIds);
    },
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!chainIds && chainIds.length > 0 }
  );
}
