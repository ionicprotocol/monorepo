import { useQuery } from '@tanstack/react-query';
import type { NewPosition, OpenPosition } from 'types/dist';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

export const usePositionsQuery = () => {
  const { address, currentSdk } = useMultiIonic();

  return useQuery({
    enabled: !!currentSdk && !!address,
    queryFn: async (): Promise<{
      newPositions: NewPosition[];
      openPositions: OpenPosition[];
    }> => {
      if (!currentSdk || !address) {
        throw new Error('Error while fetching positions!');
      }

      const response = await currentSdk.getAllLeveredPositions(address);

      return response;
    },
    queryKey: ['positions', address]
  });
};
