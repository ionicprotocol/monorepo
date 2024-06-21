import type { Roles } from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';

import { useSdk } from '../ionic/useSdk';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

export const useIsAuth = (
  pool?: string,
  market?: string,
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
