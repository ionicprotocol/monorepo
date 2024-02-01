import React from 'react';
import PercentMeter from './PercentMeter';
interface IRefLed {
  rank: number;
  eid: string;
  vaultSupply: number;
  points: number;
  percent: number;
}
const ReferralLeaderboard = ({
  rank,
  eid,
  vaultSupply,
  points,
  percent
}: IRefLed) => {
  return (
    <div
      className={`w-full hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl mb-3 px-2  gap-x-1 grid  grid-cols-7  py-5 text-xs text-white/80 font-semibold text-center items-center `}
    >
      <span className={` `}>#{rank}</span>
      <span className={` col-span-3`}>{eid}</span>
      <span className={``}>${vaultSupply}</span>
      <span className={``}>{points}</span>
      <PercentMeter percent={percent} />
    </div>
  );
};

export default ReferralLeaderboard;
