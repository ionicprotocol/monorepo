import { useMemo } from 'react';

const usePoolSorting = <T>(
  pools: Array<T & { totalSuppliedNative: number; totalBorrowedNative: number; id: number }>,
  sortBy: string | null
): Array<T> => {
  return useMemo(() => {
    pools?.sort((a, b) => {
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

    return pools.map((pool) => pool);
  }, [pools, sortBy]);
};

export default usePoolSorting;
