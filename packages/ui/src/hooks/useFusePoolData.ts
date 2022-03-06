import { FusePoolData } from '@midas-capital/sdk';
import { useQuery } from 'react-query';

import { NATIVE_TOKEN_DATA } from '@constants/networkData';
import { useRari } from '@context/RariContext';

export const useFusePoolData = (poolId: string | undefined): FusePoolData | undefined => {
  const { fuse, address } = useRari();

  const { data } = useQuery(poolId + ' poolData ' + address, () => {
    return fuse.fetchFusePoolData(poolId, address, NATIVE_TOKEN_DATA[fuse.chainId].coingeckoId);
  });

  return data;
};
