import { Fuse } from '@midas-capital/sdk';
import { utils } from 'ethers';
import { useQuery } from 'react-query';

import { NATIVE_TOKEN_DATA } from '../../constants/networkData';

import { useRari } from '@context/RariContext';
import { fetchCoinGeckoPrice } from '@utils/coingecko';
import { fetchFuseTVL } from '@utils/fetchTVL';

export const fetchFuseNumberTVL = async (fuse: Fuse) => {
  const tvlNative = await fetchFuseTVL(fuse);
  const { coingeckoId, decimals } = NATIVE_TOKEN_DATA[fuse.chainId];
  const nativeTokenPrice = await fetchCoinGeckoPrice(coingeckoId);

  return Number(utils.formatUnits(tvlNative, decimals)) * nativeTokenPrice;
};

export const useFuseTVL = () => {
  const { fuse } = useRari();

  return useQuery('fuseTVL', async () => {
    return fetchFuseNumberTVL(fuse);
  });
};
