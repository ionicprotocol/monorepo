import * as ChainConfigs from '@midas-capital/chains';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { SupportedChains } from 'types/dist/cjs';

interface Price {
  value: number;
  symbol: string;
}

// TODO Make currency agnostic
async function getUSDPriceOf(chainIds: SupportedChains[]): Promise<Record<string, Price>> {
  const prices: Record<string, Price> = {};

  await Promise.all(
    chainIds.map(async (id) => {
      const config = Object.values(ChainConfigs).find(
        (config) => config.chainId.toString() === id.toString()
      );

      if (config) {
        const _cgId = config.specificParams.cgId;
        const { data } = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${_cgId}`
        );

        if (data[_cgId]) {
          prices[id.toString()] = { value: data[_cgId].usd, symbol: '$' };
        } else {
          // for neondevnet set 0.05
          if (config.chainId === ChainConfigs.neondevnet.chainId) {
            prices[id.toString()] = {
              value: 0.05,
              symbol: config.specificParams.metadata.nativeCurrency.symbol,
            };
          } else {
            prices[id.toString()] = {
              value: 1,
              symbol: config.specificParams.metadata.nativeCurrency.symbol,
            };
          }
        }
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
