import { useMemo } from 'react';

interface SortablePool {
  id: number;
  totalBorrowedNative: number;
  totalSuppliedNative: number;
}

const usePoolSorting = <T extends SortablePool>(
  pools: Array<T>,
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
