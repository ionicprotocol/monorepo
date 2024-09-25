'use client';
import { format } from 'date-fns'; // to format dates
import formatDistanceToNowStrict from 'date-fns/formatDistanceToNowStrict';
import React, { useState } from 'react';

interface Iprops {
  setLockDuration: React.Dispatch<React.SetStateAction<string>>;
}

import InfoPopover from './InfoPopover';

export default function DateSlider({ setLockDuration }: Iprops) {
  const [currentValue, setCurrentValue] = useState(180);

  // Function to convert slider value to a date
  const valueToDate = (value: number) => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + value);
    return endDate;
  };

  const handleSliderChange = (event: { target: { value: string } }) => {
    const value = parseInt(event.target.value, 10);
    setCurrentValue(value);
    setLockDuration(format(currentDate, 'dd/mm/yyyy'));
  };

  // Slider range corresponding to 180 days to 2 years
  const sliderMin = 180;
  const sliderMax = 730; // approximately 2 years

  const currentDate = valueToDate(currentValue);
  const dateIn365Days = valueToDate(365);
  const dateIn2Years = valueToDate(sliderMax);
  // console.log(format(currentDate, 'MM/dd/yyyy'));
  // console.log(currentDate);
  return (
    <div className="w-full mx-auto mt-3 mb-5 ">
      <div className="text-xs text-white/50 mb-2">
        LOCK UNTIL <InfoPopover content='A longer lock period gives you more veION for the same amount of LPs, which means a higher voting power'/>.{' '}
      </div>
      <p className="text-lg text-white/50 mb-4">
        {format(currentDate, 'dd/MM/yyyy')}
      </p>
      <div className={`w-full  relative mb-2 text-xs text-white/25`}>
        <span>180 Days</span>
        <span className={`absolute left-[33%] -translate-x-full`}>
          {formatDistanceToNowStrict(dateIn365Days)}
        </span>
        <span className={`absolute left-[66%] -translate-x-full`}>
          1.5 Years
        </span>
        <span
          className={`absolute left-[100%] inline-block w-max -translate-x-full`}
        >
          {formatDistanceToNowStrict(dateIn2Years)}
        </span>
      </div>
      <div className={`h-1 w-full rounded-full relative`}>
        <div
          className={`h-full flex z-20 bg-accent relative rounded-l-full`}
          style={{
            width: `${((currentValue - sliderMin) / (sliderMax - sliderMin)) * 100}%`
          }}
        />
        <div className={`w-full  absolute bg-graylite h-1 top-0 z-10`} />
        <div
          className={`h-4 w-4 bg-accent rounded-full z-20 absolute -top-1.5 -translate-x-1/2`}
          style={{
            left: `${((currentValue - sliderMin) / (sliderMax - sliderMin)) * 100}%`
          }}
        />

        <input
          className="absolute top-0 z-30 opacity-0 w-full h-full cursor-pointer"
          max={sliderMax}
          min={sliderMin}
          onChange={handleSliderChange}
          step="1"
          type="range"
          value={currentValue}
        />
      </div>
    </div>
  );
}
