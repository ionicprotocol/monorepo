import { useMemo } from 'react';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

export const useSecurity = (chainId?: number) => {
  const { getSecurity } = useMultiIonic();

  return useMemo(() => {
    if (chainId) {
      return getSecurity(chainId);
    }
  }, [chainId, getSecurity]);
};
