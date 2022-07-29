import { MidasSdk } from '@midas-capital/sdk';
import { utils } from 'ethers';
import { useQuery } from 'react-query';

import { useRari } from '@ui/context/RariContext';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';
import { WRAPPED_NATIVE_TOKEN_DATA } from '@ui/networkData/index';

export const fetchFuseNumberTVL = async (midasSdk: MidasSdk, usdPrice: number) => {
  const tvlNative = await midasSdk.getTotalValueLocked(false);
  const { decimals } = WRAPPED_NATIVE_TOKEN_DATA[midasSdk.chainId];

  return Number(utils.formatUnits(tvlNative, decimals)) * usdPrice;
};

export const useFuseTVL = () => {
  const { midasSdk, coingeckoId } = useRari();
  const { data: usdPrice, isLoading, error } = useUSDPrice(coingeckoId);

  return useQuery(['fuseTVL', midasSdk.chainId, usdPrice, isLoading, error], async () => {
    if (!isLoading && error) throw new Error('Could not get USD price');

    return !isLoading && usdPrice && fetchFuseNumberTVL(midasSdk, usdPrice);
  });
};
