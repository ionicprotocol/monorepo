import { Fuse } from '@midas-capital/sdk';
import { utils } from 'ethers';
import { useQuery } from 'react-query';

import { useRari } from '@context/RariContext';
import { useUSDPrice } from '@hooks/useUSDPrice';
import { NATIVE_TOKEN_DATA } from '@networkData/index';
import { fetchFuseTVL } from '@utils/fetchTVL';

export const fetchFuseNumberTVL = async (fuse: Fuse, usdPrice: number) => {
  const tvlNative = await fetchFuseTVL(fuse);
  const { decimals } = NATIVE_TOKEN_DATA[fuse.chainId];

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
