import type { Roles } from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';

import { useSdk } from '../ionic/useSdk';

export const useIsAuth = (pool?: string, role?: Roles, chainId?: number) => {
  const sdk = useSdk(chainId);

  return useQuery(
    ['useIsAuth', sdk?.chainId, pool, role],
    async () => {
      if (sdk && pool && role) {
        return await sdk.isAuth(pool, role);
      }

      return null;
    },
    {
      enabled: !!pool && !!role && !!chainId
    }
  );
};
