import { MidasSdk } from '@midas-capital/sdk';
import { useQuery } from '@tanstack/react-query';
import { utils } from 'ethers';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useUSDPrices } from '@ui/hooks/useUSDPrices';

export const fetchFuseNumberTVL = async (midasSdk: MidasSdk) => {
  const tvlNative = await midasSdk.getTotalValueLocked(false);
  const decimals = midasSdk.chainSpecificParams.metadata.wrappedNativeCurrency.decimals;

  return Number(utils.formatUnits(tvlNative, decimals));
};

type CrossChainTVL = Map<
  string,
  {
    value: number;
    name: string;
    logo: string;
  }
>;

export const useTVL = () => {
  const { sdks, chainIds } = useMultiMidas();
  const { data: prices, isLoading, error } = useUSDPrices(chainIds);

  return useQuery<CrossChainTVL | null | undefined>(
    ['useTVL', ...chainIds, prices && Object.values(prices).sort(), isLoading],
    async () => {
      if (!isLoading && error) throw new Error('Could not get USD price');
      if (!isLoading && prices) {
        const chainTVLs: CrossChainTVL = new Map();
        await Promise.all(
          sdks.map(async (sdk) => {
            try {
              chainTVLs.set(sdk.chainId.toString(), {
                value: (await fetchFuseNumberTVL(sdk)) * prices[sdk.chainId.toString()].value,
                name: sdk.chainSpecificParams.metadata.name,
                logo: sdk.chainSpecificParams.metadata.img,
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
    { enabled: !!prices && !isLoading }
  );
};
