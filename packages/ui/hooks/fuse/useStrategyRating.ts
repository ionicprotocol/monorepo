import type { StrategyScore } from '@midas-capital/types';
import { useMemo } from 'react';

import { useSecurity } from '@ui/hooks/fuse/useSecurity';

export const useStrategyRating = (
  chainId: number,
  strategyAddress?: string
): StrategyScore | undefined => {
  const security = useSecurity(chainId);

  return useMemo(() => {
    if (security && strategyAddress) {
      return security.getStrategyRating(strategyAddress);
    }
  }, [security, strategyAddress]);
};
