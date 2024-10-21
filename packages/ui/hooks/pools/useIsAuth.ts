import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

import { useSdk } from '../ionic/useSdk';

import type { Address } from 'viem';

import type { Roles } from '@ionicprotocol/types';

export const useIsAuth = (
  pool?: Address,
  market?: Address,
  role?: Roles,
  chainId?: number
) => {
  const sdk = useSdk(chainId);
  const { address } = useMultiIonic();

  return useQuery({
    queryKey: ['useIsAuth', sdk?.chainId, pool, role, address],

    queryFn: async () => {
      if (sdk && pool && role && address && market) {
        return await sdk.isAuth(pool, market, role, address);
      }

      return null;
    },

    enabled: !!pool && !!role && !!chainId && !!address && !!market
  });
};
