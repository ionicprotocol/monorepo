import { useQuery } from '@tanstack/react-query';
import { constants } from 'ethers';

import type { YourBorrowRowData } from '@ui/components/pages/PoolPage/YourBorrows/index';
import type { MarketData } from '@ui/types/TokensDataMap';

export const useYourBorrowsRowData = (assets?: MarketData[]) => {
  const response = useQuery(
    ['useYourBorrowsRowData', assets?.map((asset) => asset.cToken).sort()],
    () => {
      const res: YourBorrowRowData[] = [];

      if (assets && assets.length > 0) {
        const yourBorrows = assets.filter((asset) => asset.borrowBalance.gt(constants.Zero));

        yourBorrows.map((asset) => {
          res.push({
            apr: asset,
            aprType: asset,
            asset: asset,
            debt: asset,
          });
        });
      }

      return res;
    },
    {
      enabled: !!assets && assets.length > 0,
    }
  );

  return response.data ?? [];
};
