import type { Roles } from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';

import { useSdk } from '../ionic/useSdk';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

export const useIsAuth = (pool?: string, role?: Roles, chainId?: number) => {
  const sdk = useSdk(chainId);
  const { address } = useMultiIonic();

  return useQuery(
    ['useIsAuth', sdk?.chainId, pool, role, address],
    async () => {
      if (sdk && pool && role) {
        return await sdk.isAuth(pool, role, address);
      }

      return null;
    },
    {
      enabled: !!pool && !!role && !!chainId && !!address
    }
  );
};
