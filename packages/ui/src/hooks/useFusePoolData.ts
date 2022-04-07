import { FusePoolData } from '@midas-capital/sdk';
import { useQuery } from 'react-query';

import { NATIVE_TOKEN_DATA } from '@constants/networkData';
import { useRari } from '@context/RariContext';

export const useFusePoolData = (poolId: string) => {
  const { fuse, currentChain, address } = useRari();

  const queryResult = useQuery<FusePoolData>(
    ['FusePoolData', currentChain.id, poolId, address],
    async () => {
      return await fuse.fetchFusePoolData(
        poolId,
        address,
        NATIVE_TOKEN_DATA[currentChain.id].coingeckoId
      );
    }
  );

  return queryResult;
};
