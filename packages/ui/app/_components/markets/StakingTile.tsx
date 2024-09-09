'use client';

export default function StakingTile() {
  return (
    <div
      className={`w-full col-span-2 px-2 lg:px-[2%] xl:px-[3%] flex  flex-col items-center justify-center md:justify-start gap-3 bg-grayone  py-4 rounded-md`}
    >
      <h1>Staking</h1>
      <div>
        <div>
          <span>APY</span>
          <span>150%</span>
        </div>
        <div>
          <span>Ionic Staked</span>
          <span>32678.4</span>
        </div>
      </div>
      <button>Stake</button>
    </div>
  );
}
