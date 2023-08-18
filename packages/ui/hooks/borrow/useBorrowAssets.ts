import { useQuery } from '@tanstack/react-query';

import type { MarketData } from '@ui/types/TokensDataMap';

export const useBorrowAssets = (assets: MarketData[]) => {
  const response = useQuery(
    ['useBorrowAssets', assets.map((asset) => asset.cToken)],
    () => {
      return assets
        .filter((asset) => !asset.isBorrowPaused)
        .map((asset) => {
          return {
            apy: asset,
            borrowAsset: asset,
            percentInPortfolio: asset,
            totalBorrow: asset,
            utilizationRate: asset
          };
        });
    },
    {
      enabled: assets.length > 0
    }
  );

  return response.data ?? [];
};
