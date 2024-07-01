import type { IonicSdk } from '@ionicprotocol/sdk';
import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';

export const fetchVaultNumberTVL = async (ionicSdk: IonicSdk) => {
  const optimizedVaultsRegistry = ionicSdk.createOptimizedVaultsRegistry();
  const vaultsData = await optimizedVaultsRegistry.read.getVaultsData();
  const tvlNative = vaultsData.reduce(
    (tvl, vault) => (tvl = tvl + vault.estimatedTotalAssets),
    0n
  );
  const decimals =
    ionicSdk.chainSpecificParams.metadata.wrappedNativeCurrency.decimals;

  return Number(formatUnits(tvlNative, decimals));
};

type CrossChainVaultTVL = Map<
  string,
  {
    logo: string;
    name: string;
    value: number;
  }
>;

export const useVaultTVL = () => {
  const { sdks } = useMultiIonic();
  const { data: prices, isLoading, error } = useAllUsdPrices();

  return useQuery<CrossChainVaultTVL | null | undefined>(
    [
      'useVaultTVL',
      prices && Object.values(prices).sort(),
      isLoading,
      sdks.map((sdk) => sdk.chainId).sort()
    ],
    async () => {
      if (!isLoading && error) throw new Error('Could not get USD price');
      if (!isLoading && prices) {
        const chainVaultTVLs: CrossChainVaultTVL = new Map();
        await Promise.all(
          sdks.map(async (sdk) => {
            try {
              chainVaultTVLs.set(sdk.chainId.toString(), {
                logo: sdk.chainSpecificParams.metadata.img,
                name: sdk.chainSpecificParams.metadata.name,
                value:
                  (await fetchVaultNumberTVL(sdk)) *
                  prices[sdk.chainId.toString()].value
              });
            } catch (e) {
              console.warn(`Unable to fetch TVL for chain ${sdk.chainId}`, e);
            }
          })
        );

        const sortedChainVaultTVLs: CrossChainVaultTVL = new Map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          [...(chainVaultTVLs as any)].sort((a, b) => b[1].value - a[1].value)
        );

        return sortedChainVaultTVLs;
      }

      return null;
    },
    {
      cacheTime: Infinity,
      enabled: !!prices && !isLoading,
      staleTime: Infinity
    }
  );
};
