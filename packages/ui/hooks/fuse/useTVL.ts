import type { MidasSdk } from '@ionicprotocol/sdk';
import { useQuery } from '@tanstack/react-query';
import { utils } from 'ethers';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';

export const fetchFuseNumberTVL = async (midasSdk: MidasSdk) => {
  const tvlNative = await midasSdk.getTotalValueLocked(false);
  const decimals = midasSdk.chainSpecificParams.metadata.wrappedNativeCurrency.decimals;

  return Number(utils.formatUnits(tvlNative, decimals));
};

type CrossChainTVL = Map<
  string,
  {
    logo: string;
    name: string;
    value: number;
  }
>;

export const useTVL = () => {
  const { sdks } = useMultiMidas();
  const { data: prices, isLoading, error } = useAllUsdPrices();

  return useQuery<CrossChainTVL | null | undefined>(
    [
      'useTVL',
      prices && Object.values(prices).sort(),
      isLoading,
      sdks.map((sdk) => sdk.chainId).sort(),
    ],
    async () => {
      if (!isLoading && error) throw new Error('Could not get USD price');
      if (!isLoading && prices) {
        const chainTVLs: CrossChainTVL = new Map();
        await Promise.all(
          sdks.map(async (sdk) => {
            try {
              chainTVLs.set(sdk.chainId.toString(), {
                logo: sdk.chainSpecificParams.metadata.img,
                name: sdk.chainSpecificParams.metadata.name,
                value: (await fetchFuseNumberTVL(sdk)) * prices[sdk.chainId.toString()].value,
              });
            } catch (e) {
              console.warn(`Unable to fetch TVL for chain ${sdk.chainId}`, e);
            }
          })
        );

        const sortedChainTVLs = new Map([...chainTVLs].sort((a, b) => b[1].value - a[1].value));

        return sortedChainTVLs;
      }

      return null;
    },
    { cacheTime: Infinity, enabled: !!prices && !isLoading, staleTime: Infinity }
  );
};
