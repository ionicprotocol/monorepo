import { Fuse } from '@midas-capital/sdk';
import { utils } from 'ethers';
import { useQuery } from 'react-query';

import { useRari } from '@ui/context/RariContext';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';
import { WRAPPED_NATIVE_TOKEN_DATA } from '@ui/networkData/index';
import { fetchFuseTVL } from '@ui/utils/fetchTVL';

export const fetchFuseNumberTVL = async (fuse: Fuse, usdPrice: number) => {
  const tvlNative = await fetchFuseTVL(fuse);
  const { decimals } = WRAPPED_NATIVE_TOKEN_DATA[fuse.chainId];

  return Number(utils.formatUnits(tvlNative, decimals)) * usdPrice;
};

export const useFuseTVL = () => {
  const { fuse, coingeckoId } = useRari();
  const { data: usdPrice, isLoading, error } = useUSDPrice(coingeckoId);

  return useQuery(['fuseTVL', fuse.chainId, usdPrice, isLoading, error], async () => {
    if (!isLoading && error) throw new Error('Could not get USD price');

    return !isLoading && usdPrice && fetchFuseNumberTVL(fuse, usdPrice);
  });
};
