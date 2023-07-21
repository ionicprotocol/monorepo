import type { StrategyScore } from '@ionicprotocol/types';
import { useMemo } from 'react';

import { useSecurity } from '@ui/hooks/ionic/useSecurity';

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
