'use client';
import React, { memo, useMemo } from 'react';

export type DonutChartProps = {
  max: number;
  radius?: number;
  value: number;
};

export function DonutChart({ max, radius = 16, value }: DonutChartProps) {
  const circleCircumference = useMemo<number>(
    () => 2 * Math.PI * radius,
    [radius]
  );
  const valueAsStrokeDasharray = useMemo<number>(
    () => (value / max) * circleCircumference,
    [circleCircumference, max, value]
  );
  const valueAsPercentage = useMemo<string>(
    () => `${((value / max) * 100).toFixed(2)}%`,
    [max, value]
  );

  return (
    <svg
      className="donut"
      height="100%"
      viewBox="0 0 40 40"
      width="100%"
    >
      <circle
        className="donut-hole"
        cx="20"
        cy="20"
        fill="transparent"
        r={radius}
      />
      <circle
        className="donut-ring"
        cx="20"
        cy="20"
        fill="transparent"
        r={radius}
        stroke="rgb(255 255 255 / 0.3)"
        strokeWidth="2"
      />
      <circle
        className="donut-segment donut-segment-2"
        cx="20"
        cy="20"
        fill="transparent"
        r={radius}
        stroke="#3bff89ff"
        strokeDasharray={`${valueAsStrokeDasharray} ${
          circleCircumference - valueAsStrokeDasharray
        }`}
        strokeDashoffset="25"
        strokeLinecap="round"
        strokeWidth="4"
      />
      <text
        dominantBaseline="middle"
        fill="#fff"
        fontSize="7px"
        textAnchor="middle"
        x="50%"
        y="50%"
      >
        {valueAsPercentage}
      </text>
    </svg>
  );
}

const MemoizedDonutChart = memo(DonutChart);

export default MemoizedDonutChart;
