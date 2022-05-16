import { FusePoolData } from '@midas-capital/sdk/dist/cjs/src/Fuse/types';
import { useMemo } from 'react';

const usePoolSorting = (pools: FusePoolData[], sortBy: string | null): FusePoolData[] => {
  return useMemo(() => {
    pools?.sort((a: FusePoolData, b: FusePoolData) => {
      if (!sortBy || sortBy.toLowerCase() === 'supply') {
        if (b.totalSuppliedNative > a.totalSuppliedNative) {
          return 1;
        }

        if (b.totalSuppliedNative < a.totalSuppliedNative) {
          return -1;
        }
      } else {
        if (b.totalBorrowedNative > a.totalBorrowedNative) {
          return 1;
        }

        if (b.totalBorrowedNative < a.totalBorrowedNative) {
          return -1;
        }
      }
      return b.id > a.id ? 1 : -1;
    });

    return pools.map((pool: FusePoolData) => pool);
  }, [pools, sortBy]);
};

export default usePoolSorting;
