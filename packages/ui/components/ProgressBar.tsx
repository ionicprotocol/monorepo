import React, { memo, useMemo } from 'react';

import { Progress } from '@ui/components/ui/progress';

export type ProgressBarProps = {
  max: number;
  value: number;
};

function ProgressBar({ max, value }: ProgressBarProps) {
  const percentage = useMemo<number>(() => (value / max) * 100, [max, value]);

  const percentageFormatted = useMemo<string>(
    () => `${percentage.toFixed(2)}%`,
    [percentage]
  );

  return (
    <div className="w-full space-y-1">
      <Progress
        value={percentage}
        className="h-2"
      />
      <div className="text-xs text-gray-400">
        {percentageFormatted} utilized
      </div>
    </div>
  );
}

const MemoizedProgressBar = memo(ProgressBar);

export default MemoizedProgressBar;
