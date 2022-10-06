import * as ChainConfigs from '@midas-capital/chains';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { SupportedChains } from 'types/dist/cjs';

const ChainIdCoingeckoIdMapping = Object.entries(ChainConfigs)
  .map(([, config]): [string, string] => [config.chainId.toString(), config.specificParams.cgId])
  .reduce<Record<string, string>>((acc, cur) => {
    acc[cur[0]] = cur[1];
    acc[cur[1]] = cur[0];
    return acc;
  }, {});

const ChainIdNativeSymbolMapping = Object.entries(ChainConfigs)
  .map(([, config]): [string, string] => [
    config.chainId.toString(),
    config.specificParams.metadata.nativeCurrency.symbol,
  ])
  .reduce<Record<string, string>>((acc, cur) => {
    acc[cur[0]] = cur[1];
    acc[cur[1]] = cur[0];
    return acc;
  }, {});

interface Price {
  value: number;
  symbol: string;
}

// TODO Make currency agnostic
async function getUSDPriceOf(chainIds: SupportedChains[]): Promise<Record<string, Price>> {
  const cgIds = chainIds.map((id) => ChainIdCoingeckoIdMapping[id]);

  const { data } = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${cgIds.join(',')}`
  );

  return cgIds
    .map((cgId): [string, Price] => {
      if (data[cgId])
        return [ChainIdCoingeckoIdMapping[cgId], { value: data[cgId].usd, symbol: '$' }];
      console.warn("No price data in response for '${cgId}', setting to 1");
      if (cgId === ChainConfigs.neondevnet.specificParams.cgId) {
        return [
          ChainIdCoingeckoIdMapping[cgId],
          { value: 0.05, symbol: ChainIdNativeSymbolMapping[ChainIdCoingeckoIdMapping[cgId]] },
        ];
      }

      return [
        ChainIdCoingeckoIdMapping[cgId],
        { value: 1, symbol: ChainIdNativeSymbolMapping[ChainIdCoingeckoIdMapping[cgId]] },
      ];
    })
    .reduce<Record<string, Price>>((acc, cur) => {
      acc[cur[0]] = cur[1];
      return acc;
    }, {});
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
