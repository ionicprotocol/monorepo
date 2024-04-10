import React, { useMemo } from 'react';

export type CustomSliderProps = {
  currentValue: number;
  max: number;
  min: number;
  setCurrentValue: (amount: number) => void;
  step: number;
};

export default function Range({
  currentValue,
  max,
  min,
  setCurrentValue,
  step
}: CustomSliderProps) {
  const currentPercentage = useMemo<number>(
    () => ((currentValue - min) / (max - min)) * 100,
    [currentValue, max, min]
  );

  return (
    <div className="w-full">
      <div className={`h-1 rounded-full relative`}>
        <div className={`w-full absolute bg-graylite h-1 top-0`} />
        <div
          className={`h-full flex bg-accent relative rounded-l-full`}
          style={{ width: `${currentPercentage}%` }}
        />
        <div
          className={`h-4 w-4 bg-accent rounded-full absolute -top-1.5 -translate-x-1/2 `}
          style={{ left: `${currentPercentage}%` }}
        />

        <input
          className="absolute top-0 left-0 opacity-0  w-full h-full   cursor-pointer"
          max={max}
          min={min}
          onChange={(e) => setCurrentValue(parseInt(e.target.value))}
          step={step}
          type="range"
          value={currentValue}
        />
      </div>
    </div>
  );
}
