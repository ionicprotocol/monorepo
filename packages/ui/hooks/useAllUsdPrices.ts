import { chainIdToConfig } from '@ionicprotocol/chains';
import { SupportedChains } from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { COINGECKO_API, DEFI_LLAMA_API } from '@ui/constants/index';
import { getSupportedChainIds } from '@ui/utils/networkData';

interface Price {
  symbol: string;
  value: number;
}

export function useAllUsdPrices() {
  const chainIds = getSupportedChainIds();

  return useQuery(
    ['useAllUsdPrices', ...chainIds.sort()],
    async () => {
      const prices: Record<string, Price> = {};

      await Promise.all(
        chainIds.map(async (id) => {
          const config = chainIdToConfig[id];
          if (config) {
            const _cgId = config.specificParams.cgId;
            try {
              const { data } = await axios.get(`${COINGECKO_API}${_cgId}`);

              if (data[_cgId] && data[_cgId].usd) {
                prices[id.toString()] = { symbol: '$', value: data[_cgId].usd };
              }
            } catch (e) {
              const { data } = await axios.get(`${DEFI_LLAMA_API}coingecko:${_cgId}`);

              if (data.coins[`coingecko:${_cgId}`] && data.coins[`coingecko:${_cgId}`].price) {
                prices[id.toString()] = {
                  symbol: '$',
                  value: data.coins[`coingecko:${_cgId}`].price,
                };
              }
            }

            if (!prices[id.toString()]) {
              if (config.chainId === chainIdToConfig[SupportedChains.neon_devnet].chainId) {
                prices[id.toString()] = {
                  symbol: config.specificParams.metadata.nativeCurrency.symbol,
                  value: 1.2,
                };
              } else {
                prices[id.toString()] = {
                  symbol: config.specificParams.metadata.nativeCurrency.symbol,
                  value: 1,
                };
              }
            }
          }
        })
      );

      return prices;
    },
    { cacheTime: Infinity, enabled: !!chainIds && chainIds.length > 0, staleTime: Infinity }
  );
}

export function useUsdPrice(chainId: string) {
  const { data: usdPrices } = useAllUsdPrices();

  return useQuery(
    ['useUsdPrice', chainId, usdPrices],
    async () => {
      if (usdPrices && usdPrices[chainId]) {
        return usdPrices[chainId].value;
      } else {
        return null;
      }
    },
    { cacheTime: Infinity, enabled: !!chainId && !!usdPrices, staleTime: Infinity }
  );
}
