import { useQuery } from '@tanstack/react-query';
import { LeveragedPositionsLens } from 'levato-sdk';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

/**
 * Get positions info
 */
export const useGetPositionsInfoQuery = () => {
  const { levatoSdk, address } = useMultiIonic();

  return useQuery({
    enabled: !!levatoSdk && !!address,
    queryFn: async (): Promise<
      [
        LeveragedPositionsLens.PositionInfoStructOutput[],
        LeveragedPositionsLens.PositionInfoStructOutput[]
      ]
    > => {
      if (!address || !levatoSdk) {
        throw new Error('Error while fetching position info!');
      }

      const [positions] =
        await levatoSdk.factoryContract.callStatic.getPositionsByAccount(
          address
        );

      const apys = positions.map(() => '0');
      const positionsData =
        await levatoSdk.lensContract.callStatic.getPositionsInfo(
          JSON.parse(JSON.stringify(positions)),
          apys
        );
      const openPositions: LeveragedPositionsLens.PositionInfoStructOutput[] =
        [];
      const closedPositions: LeveragedPositionsLens.PositionInfoStructOutput[] =
        [];

      for (let i = 0; i < positionsData.length; i++) {
        positionsData[i].closed
          ? closedPositions.push(positionsData[i])
          : openPositions.push(positionsData[i]);
      }

      // Reverse to sort them in descending order
      return [openPositions.reverse(), closedPositions.reverse()];
    },
    queryKey: ['positions', address],
    structuralSharing: false
  });
};
