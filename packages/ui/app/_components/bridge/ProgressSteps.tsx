'use client';

import React from 'react';

interface IProgress {
  progress?: number;
  bg?: string;
  totalSteps?: number;
}

export default function ProgressSteps({
  progress = 2,
  bg = 'bg-accent',
  totalSteps = 2
}: IProgress) {
  const calculateProgress = () => {
    return ((progress - 1) / (totalSteps - 1)) * 100 + '%';
  };
  console.log(calculateProgress());
  return (
    <div className={`relative`}>
      <div className={`flex flex-nowrap w-full justify-between items-center`}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <span
            key={index}
            className={`${progress - 1 >= index ? bg : 'bg-gray-500'} rounded-full w-5 h-5 text-xs flex items-center justify-center z-30 text-black `}
          >
            {index + 1}
          </span>
        ))}
        <div className={` absolute w-full top-1/2 -translate-y-1/2`}>
          <div
            style={{ width: calculateProgress() }}
            className={` absolute top-1/2 -translate-y-1/2 z-50 h-[3px] ${+calculateProgress() > 0 ? bg : 'bg-gray-500'} transition-all duration-300 ease-linear`}
          />
          <div
            className={`absolute top-1/2 -translate-y-1/2 w-full bg-gray-500 h-[3px] z-10`}
          />
        </div>
      </div>
    </div>
  );
}
