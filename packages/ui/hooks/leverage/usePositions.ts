import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

import type { NewPosition, OpenPosition } from '@ionicprotocol/types';

export const usePositionsQuery = (chain: number) => {
  const { address, getSdk } = useMultiIonic();
  const currentSdk = getSdk(chain);

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
