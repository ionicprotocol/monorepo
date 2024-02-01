import { useQuery } from '@tanstack/react-query';

import type { MarketData } from '@ui/types/TokensDataMap';

export const useLendingAssets = (assets: MarketData[]) => {
  const response = useQuery(
    [
      'useLendingAssets',
      assets.map(
        (asset) => asset.cToken + asset.supplyBalance + asset.totalSupply
      )
    ],
    () => {
      return assets
        .filter((asset) => !asset.isSupplyPaused)
        .map((asset) => {
          return {
            apy: asset,
            collateral: asset,
            percentInPortfolio: asset,
            supplyAsset: asset,
            totalSupply: asset,
            utilizationRate: asset,
            walletBalance: asset
          };
        });
    },
    {
      enabled: assets.length > 0
    }
  );

  return response.data ?? [];
};
