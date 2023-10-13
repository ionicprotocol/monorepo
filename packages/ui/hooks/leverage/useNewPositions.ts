import type { LeveredPosition } from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';

export const useNewPositions = (allNewPositions: LeveredPosition[]) => {
  const response = useQuery(
    [
      'useNewPositions',
      allNewPositions.map((position) => position.collateral.cToken + position.borrowable.cToken)
    ],
    () => {
      return allNewPositions.map((position) => {
        return {
          apr: position,
          borrowAsset: position,
          collateralAsset: position,
          leverage: position,
          network: position,
          tvl: position,
          yourPosition: position
        };
      });
    },
    {
      enabled: allNewPositions.length > 0
    }
  );

  return response.data ?? [];
};
