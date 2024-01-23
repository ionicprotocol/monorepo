import React from 'react';
import PercentMeter from './PercentMeter';

interface IStrategy {
  earnBy: string;
  amount: number;
  vaultSupply: number;
  points: number;
  percent: number;
  color: string;
}
const StrategyROW = ({
  earnBy,
  amount,
  vaultSupply,
  points,
  percent,
  color
}: IStrategy) => {
  return (
    <div
      className={`w-full hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl mb-3 px-2  gap-x-1 grid  grid-cols-5  py-5 text-xs text-white/80 font-semibold text-center items-center `}
    >
      <div className={`  flex gap-2 items-center justify-center  `}>
        <span
          className="h-4 w-4 rounded-full"
          style={{ backgroundColor: `${color}` }}
        ></span>
        <span className={` `}>{earnBy}</span>
      </div>
      <span className={``}>{amount}</span>
      <span className={``}>${vaultSupply}</span>
      <span className={``}>{points}</span>
      <PercentMeter
        percent={percent}
        color={color}
      />
    </div>
  );
};

export default StrategyROW;
