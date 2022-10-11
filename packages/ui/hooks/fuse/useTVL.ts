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

interface CrossChainTVL {
  [chainId: string]: {
    value: number;
    name: string;
    logo: string;
  };
}

export const useTVL = () => {
  const { sdks, chainIds } = useMultiMidas();
  const { data: prices, isLoading, error } = useUSDPrices(chainIds);

  return useQuery<CrossChainTVL | undefined>(
    ['useTVL', ...chainIds, prices && Object.values(prices).sort(), isLoading],
    async () => {
      if (!isLoading && error) throw new Error('Could not get USD price');
      if (!isLoading && prices) {
        const chainTVLs: CrossChainTVL = {};

        await Promise.all(
          sdks.map(async (sdk) => {
            chainTVLs[sdk.chainId.toString()] = {
              value: (await fetchFuseNumberTVL(sdk)) * prices[sdk.chainId.toString()],
              name: sdk.chainSpecificParams.metadata.name,
              logo: sdk.chainSpecificParams.metadata.img,
            };
          })
        );

        return chainTVLs;
      }
    },
    { enabled: !!prices && !isLoading }
  );
};
