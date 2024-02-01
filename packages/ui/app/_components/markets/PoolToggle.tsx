import React, { useState } from 'react';

const PoolToggle = () => {
  const [active, setActive] = useState<string>('all');
  return (
    <div
      className={`w-max  rounded-xl bg-grayUnselect p-1 flex gap-x-3 text-xs items-center justify-center`}
    >
      <p
        onClick={() => setActive('all')}
        className={`rounded-xl py-1 px-3  cursor-pointer ${
          active === 'all' ? 'bg-darkone text-accent ' : 'text-white/40 '
        } transition-all duration-200 ease-linear `}
      >
        All Pools
      </p>
      {/* <p
        onClick={() => setActive('stable')}
        className={` rounded-xl py-1 px-3   ${
          active === 'stable' ? 'bg-darkone text-accent ' : 'text-white/40'
        } cursor-pointer transition-all duration-200 ease-linear`}
      >
        Stablecoin Pools
      </p> */}
    </div>
  );
};

export default PoolToggle;
{
  /* <div className={``}></div> */
}
