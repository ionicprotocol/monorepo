import { MidasSdk } from '@midas-capital/sdk';
import { utils } from 'ethers';
import { useQuery } from 'react-query';

import { useMidas } from '@ui/context/MidasContext';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';

export const fetchFuseNumberTVL = async (midasSdk: MidasSdk, usdPrice: number) => {
  const tvlNative = await midasSdk.getTotalValueLocked(false);
  const decimals = midasSdk.chainSpecificParams.metadata.wrappedNativeCurrency.decimals;

  return Number(utils.formatUnits(tvlNative, decimals)) * usdPrice;
};

export const useFuseTVL = () => {
  const { midasSdk, coingeckoId } = useMidas();
  const { data: usdPrice, isLoading, error } = useUSDPrice(coingeckoId);

  return useQuery(['fuseTVL', midasSdk.chainId, usdPrice, isLoading, error], async () => {
    if (!isLoading && error) throw new Error('Could not get USD price');

    return !isLoading && usdPrice && fetchFuseNumberTVL(midasSdk, usdPrice);
  });
};
