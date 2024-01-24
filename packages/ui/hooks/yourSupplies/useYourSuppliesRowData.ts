import { useQuery } from '@tanstack/react-query';
import { constants } from 'ethers';

import type { YourSupplyRowData } from '@ui/components/pages/PoolPage/YourSupplies';
import type { MarketData } from '@ui/types/TokensDataMap';

export const useYourSuppliesRowData = (assets?: MarketData[]) => {
  const response = useQuery(
    ['useYourSuppliesRowData', assets?.map((asset) => asset.cToken + asset.supplyBalance).sort()],
    () => {
      const res: YourSupplyRowData[] = [];

      if (assets && assets.length > 0) {
        const yourSupplies = assets.filter((asset) => asset.supplyBalance.gt(constants.Zero));

        yourSupplies.map((asset) => {
          res.push({
            apy: asset,
            asset: asset,
            collateral: asset,
            yourBalance: asset
          });
        });
      }

      return res;
    },
    {
      enabled: !!assets && assets.length > 0
    }
  );

  return response.data ?? [];
};
