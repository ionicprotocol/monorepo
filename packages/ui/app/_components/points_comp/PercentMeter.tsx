import React from 'react';

interface IMeter {
  color?: string;
  percent: number;
}
const PercentMeter = ({ color = '#3bff89ff', percent }: IMeter) => {
  return (
    <div className={`h-2 w-[200px] mx-auto md:w-full relative  `}>
      <p className={`w-full h-2 rounded-lg bg-stone-600`} />
      <p
        className={`absolute top-0 rounded-lg h-2`}
        style={{ backgroundColor: `${color}`, width: `${percent}%` }}
      />
      <p className={`absolute text-[8px] -top-5`}>{percent}%</p>
    </div>
  );
};

export default PercentMeter;
