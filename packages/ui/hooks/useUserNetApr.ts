import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

export const useUserNetApr = () => {
  const { address, currentSdk } = useMultiIonic();

  return useQuery({
    enabled: !!currentSdk && !!address,
    queryFn: async (): Promise<bigint> => {
      if (!currentSdk || !address) {
        throw new Error('Error while fetching net apr');
      }

      const flywheelLens = currentSdk.createIonicFlywheelLensRouter();

      const netApr = (
        await flywheelLens.simulate.getUserNetApr([
          address,
          BigInt(3600 * 24 * 365)
        ])
      ).result;

      return netApr;
    },
    queryKey: ['user', 'netapr', address]
  });
};
