import { useQuery } from '@tanstack/react-query';
import type {
  AdjustedRatioQueryQuery,
  FundingQueryQuery,
  PositionClosedQueryQuery,
  PositionCreatedQueryQuery
} from 'levato-sdk/dist/.graphclient';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

export const usePositionsGraphInfo = (positionAddresses: string[]) => {
  const { levatoSdk } = useMultiIonic();

  return useQuery({
    enabled: !!levatoSdk,
    queryFn: async (): Promise<
      [
        FundingQueryQuery,
        AdjustedRatioQueryQuery,
        PositionCreatedQueryQuery,
        PositionClosedQueryQuery
      ]
    > => {
      if (!levatoSdk) {
        throw new Error('Levato SDK unavailable!');
      }

      const data = await levatoSdk?.getGraphPositionsInfo(positionAddresses);

      return data;
    },
    queryKey: ['graph', 'positions', 'info', ...positionAddresses]
  });
};
