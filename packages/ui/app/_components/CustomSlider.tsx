import React from 'react';

export type CustomSliderProps = {
  currentValue: number;
  setCurrentValue: (amount: number) => void;
};

export default function CustomSlider({
  currentValue,
  setCurrentValue
}: CustomSliderProps) {
  return (
    <div className="w-full max-w-md mx-auto mt-3 mb-5 ">
      <div className={`w-full relative mb-2 text-xs text-white/25`}>
        <span>{currentValue}</span>
      </div>
      <div className={`h-1 rounded-full relative`}>
        <div
          className={`h-full flex z-20 bg-accent relative rounded-l-full`}
          style={{ width: `${currentValue}%` }}
        />
        <div className={`w-full absolute bg-graylite h-1 top-0 z-10 `} />
        <div
          className={`h-4 w-4 bg-accent rounded-full z-20 absolute -top-1.5 -translate-x-1/2 `}
          style={{ left: `${currentValue}%` }}
        />

        <input
          className="absolute top-0  z-30 opacity-0  w-full h-full   cursor-pointer"
          max="100"
          min="0"
          onChange={(e) => setCurrentValue(parseInt(e.target.value))}
          step="1"
          type="range"
          value={currentValue}
        />
      </div>
    </div>
  );
}
