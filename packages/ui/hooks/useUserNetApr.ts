import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

export const useUserNetApr = () => {
  const { address, currentSdk } = useMultiIonic();

  return useQuery({
    enabled: !!currentSdk && !!address,
    queryFn: async (): Promise<BigNumber> => {
      if (!currentSdk || !address) {
        throw new Error('Error while fetching net apr');
      }

      const flywheelLens = currentSdk.createIonicFlywheelLensRouter();

      const netApr = await flywheelLens.callStatic.getUserNetApr(
        address,
        BigNumber.from(3600 * 24 * 365)
      );

      return netApr;
    },
    queryKey: ['user', 'netapr', address]
  });
};
