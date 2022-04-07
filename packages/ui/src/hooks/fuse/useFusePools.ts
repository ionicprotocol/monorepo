import { FusePoolData } from '@midas-capital/sdk/dist/cjs/src/Fuse/types';
import { FusePoolDirectory } from '@midas-capital/sdk/dist/cjs/typechain/FusePoolDirectory';
import { FusePoolLens } from '@midas-capital/sdk/dist/cjs/typechain/FusePoolLens';
import { BigNumber, BigNumberish } from 'ethers';
import FuseJS from 'fuse.js';
import { useMemo } from 'react';
import { useQuery } from 'react-query';

import { NATIVE_TOKEN_DATA } from '@constants/networkData';
import { useRari } from '@context/RariContext';

export type LensPoolsWithData = [
  ids: BigNumberish[],
  fusePools: FusePoolDirectory.FusePoolStructOutput[],
  fusePoolsData: FusePoolLens.FusePoolDataStructOutput[],
  errors: boolean[]
];

const poolSort = (pools: FusePoolData[]) => {
  return pools.sort((a, b) => {
    if (b.totalSuppliedUSD > a.totalSuppliedUSD) {
      return 1;
    }

    if (b.totalSuppliedUSD < a.totalSuppliedUSD) {
      return -1;
    }

    // They're equal, let's sort by pool number:
    return b.id > a.id ? 1 : -1;
  });
};
interface UseFusePoolsReturn {
  pools: FusePoolData[] | undefined;
  filteredPools: FusePoolData[];
  isLoading: boolean;
}

// returns impersonal data about fuse pools ( can filter by your supplied/created pools )
export const useFusePools = (
  filter: 'created-pools' | 'verified-pools' | 'unverified-pools' | string | null
): UseFusePoolsReturn => {
  const { fuse, currentChain, address } = useRari();

  const isCreatedPools = filter === 'created-pools';
  const isAllPools = filter === '';

  const { isLoading, data: pools } = useQuery(
    ['FusePoolList', currentChain.id, filter, address],

    async () => {
      const coingeckoId = NATIVE_TOKEN_DATA[fuse.chainId].coingeckoId;

      if (!filter) {
        return await fuse.fetchPoolsManual({
          verification: false,
          coingeckoId,
          options: {
            from: address,
          },
        });
      }
      return await fuse.fetchPools({
        filter,
        coingeckoId,
        options: { from: address },
      });
    },
    {
      enabled: !!currentChain.id,
    }
  );

  const filteredPools = useMemo(() => {
    if (!pools?.length) {
      return [];
    }

    if (!filter) {
      return poolSort(pools);
    }

    if (isCreatedPools || isAllPools) {
      return poolSort(pools);
    }

    const options = {
      keys: ['name', 'id', 'underlyingTokens', 'underlyingSymbols'],
      threshold: 0.3,
    };

    const filtered = new FuseJS(pools, options).search(filter);
    return poolSort(filtered.map((item) => item.item));
  }, [pools, filter, isCreatedPools, isAllPools]);

  return { pools, filteredPools, isLoading };
};
