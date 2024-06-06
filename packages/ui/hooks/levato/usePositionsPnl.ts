import { useQuery } from '@tanstack/react-query';

import type { Position } from 'levato-sdk/dist/.graphclient';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

export const usePositionsPnl = () => {
  const { address, levatoSdk } = useMultiIonic();

  return useQuery({
    enabled: !!address && !!levatoSdk,
    queryFn: async (): Promise<Map<
      string,
      Pick<Position, 'collateral' | 'fundedCollateralAmount' | 'id'>
    > | null> => {
      if (!levatoSdk || !address) {
        throw new Error('Levato SDK not available!');
      }

      const data = await levatoSdk?.getPositionsPnl(address);

      return data;
    },
    queryKey: ['positions', 'pnl', address]
  });
};
