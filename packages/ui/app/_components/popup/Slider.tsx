'use client';
// SliderComponent.js
import React from 'react';
interface IUtilization {
  currentUtilizationPercentage: number;
  handleUtilization: (val: number) => void;
}
const SliderComponent = ({
  currentUtilizationPercentage,
  handleUtilization
}: IUtilization) => {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleUtilization(+e.target.value);
  };

  const getColor = () => {
    if (currentUtilizationPercentage <= 50) {
      return 'bg-accent';
    }

    return 'bg-lime';
  };
  const gettextColor = () => {
    if (currentUtilizationPercentage <= 50) {
      return 'text-accent';
    }

    return 'text-lime';
  };

  return (
    <div className="w-full max-w-md mx-auto mt-3 mb-5 ">
      <div className={`w-full relative mb-2 text-xs text-white/25`}>
        <span className={`${gettextColor()}  `}>
          {currentUtilizationPercentage}%
        </span>
        <span className={`absolute left-[80%] -translate-x-full`}>80%</span>
        <span className={`absolute left-[100%] -translate-x-full`}>100%</span>
      </div>
      <div className={`h-1 rounded-full relative`}>
        <div
          className={`h-full flex z-20 ${getColor()} relative rounded-l-full`}
          style={{ width: `${currentUtilizationPercentage}%` }}
        />
        <div className={`w-full absolute bg-graylite h-1 top-0 z-10 `} />
        <div
          className={`h-4 w-4 ${getColor()} rounded-full z-20 absolute -top-1.5 -translate-x-1/2 `}
          style={{ left: `${currentUtilizationPercentage}%` }}
        />

        <input
          className="absolute top-0  z-30 opacity-0  w-full h-full   cursor-pointer"
          max="100"
          min="0"
          onChange={handleSliderChange}
          step="1"
          type="range"
          value={currentUtilizationPercentage}
        />
      </div>
    </div>
  );
};

export default SliderComponent;

// #666666ff
