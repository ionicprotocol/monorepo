import { useMemo } from 'react';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

export const useSdk = (chainId?: number) => {
  const { getSdk } = useMultiIonic();

  return useMemo(() => {
    if (chainId) {
      return getSdk(chainId);
    }
  }, [chainId, getSdk]);
};
