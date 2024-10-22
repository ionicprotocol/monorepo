import { useMemo } from 'react';

import { useSecurity } from '@ui/hooks/ionic/useSecurity';

import type { StrategyScore } from '@ionicprotocol/types';

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
