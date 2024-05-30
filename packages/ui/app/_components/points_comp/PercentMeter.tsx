import React from 'react';

interface IMeter {
  color?: string;
  percent: number;
}
const PercentMeter = ({ color = '#3bff89ff', percent }: IMeter) => {
  return (
    <div className={`h-2 w-[200px] mx-auto md:w-full relative  `}>
      <div className="relative h-2 rounded-lg overflow-hidden">
        <p className={`w-full h-full bg-stone-600`} />
        <p
          className={`absolute top-0 rounded-lg h-full`}
          style={{ backgroundColor: `${color}`, width: `${percent}%` }}
        />
      </div>
      <p className={`absolute text-[8px] -top-5`}>{percent}%</p>
    </div>
  );
};

export default PercentMeter;
