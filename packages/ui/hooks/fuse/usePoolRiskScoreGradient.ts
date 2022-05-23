import { useMemo } from 'react';

import { useColors } from '@ui/hooks/useColors';
import { letterScore } from '@ui/hooks/useRSS';

export const usePoolRiskScoreGradient = (rssScore: ReturnType<typeof letterScore> | '?') => {
  const { cRssScore } = useColors();
  return useMemo(() => {
    return {
      'A++': cRssScore.bgColor,
      'A+': cRssScore.bgColor,
      A: cRssScore.bgColor,
      'A-': cRssScore.bgColor,
      B: cRssScore.bgColor,
      C: cRssScore.bgColor,
      D: cRssScore.bgColor,
      F: cRssScore.bgColor,
      UNSAFE: cRssScore.bgColor,
      '?': cRssScore.bgColor,
    }[rssScore];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rssScore]);
};
