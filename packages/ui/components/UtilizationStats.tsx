import React, { memo, useMemo } from 'react';

import millify from 'millify';

import MemoizedDonutChart from './dialogs/manage/DonutChart';

interface UtilizationStatsProps {
  label: string;
  value: number;
  max: number;
  symbol?: string;
  valueInFiat: number;
  maxInFiat: number;
}

function UtilizationStats({
  label,
  value,
  max,
  symbol = '',
  valueInFiat,
  maxInFiat
}: UtilizationStatsProps) {
  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center">
        <div className="w-20 mr-4">
          <MemoizedDonutChart
            max={max}
            value={value}
          />
        </div>
        <div>
          <div className="text-gray-400 text-xs uppercase">{label}</div>
          <div className="text-white">
            <strong>
              {millify(value)} of {millify(max)} {symbol}
            </strong>
          </div>
          <div className="text-sm text-gray-300">
            ${millify(valueInFiat)} of ${millify(maxInFiat)}
          </div>
        </div>
      </div>
    </div>
  );
}

const MemoizedUtilizationStats = memo(UtilizationStats);

export default MemoizedUtilizationStats;
