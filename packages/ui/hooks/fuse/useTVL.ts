import { MidasSdk } from '@midas-capital/sdk';
import { useQuery } from '@tanstack/react-query';
import { utils } from 'ethers';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useUSDPrices } from '@ui/hooks/useUSDPrices';

export const fetchFuseNumberTVL = async (midasSdk: MidasSdk, usdPrice: number) => {
  const tvlNative = await midasSdk.getTotalValueLocked(false);
  const decimals = midasSdk.chainSpecificParams.metadata.wrappedNativeCurrency.decimals;

  return Number(utils.formatUnits(tvlNative, decimals)) * usdPrice;
};

interface CrossChainTVL {
  [chainId: string]: {
    value: number;
    symbol: string;
    name: string;
    logo: string;
  };
}

export const useTVL = () => {
  const { sdks } = useMultiMidas();
  const chainIds = Object.keys(sdks);
  const { data: prices, isLoading, error } = useUSDPrices(chainIds);

  return useQuery<CrossChainTVL>(
    ['useTVL', ...chainIds.sort()],
    async () => {
      if (!isLoading && error) throw new Error('Could not get USD price');
      if (!isLoading && prices) {
        const chainTVLs: CrossChainTVL[] = await Promise.all(
          Object.entries(sdks).map(
            async ([chainId, sdk]): Promise<CrossChainTVL> => ({
              [chainId as string]: {
                value: (await fetchFuseNumberTVL(sdk, 1)) * prices[chainId].value,
                symbol: prices[chainId].symbol,
                name: sdk.chainSpecificParams.metadata.name,
                logo: sdk.chainSpecificParams.metadata.img,
              },
            })
          )
        );

        return Object.assign({}, ...chainTVLs);
      }
    },
    { enabled: !!prices && !isLoading }
  );
};
