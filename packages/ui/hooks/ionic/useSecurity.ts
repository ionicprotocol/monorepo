import { useMemo } from 'react';

import { useMultiMidas } from '@ui/context/MultiIonicContext';

export const useSecurity = (chainId?: number) => {
  const { getSecurity } = useMultiMidas();

  return useMemo(() => {
    if (chainId) {
      return getSecurity(chainId);
    }
  }, [chainId, getSecurity]);
};
