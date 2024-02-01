import React from 'react';
interface IMode {
  mode: string;
  setActive: (val: string) => void;
  active: string;
}
const Tab = ({ mode, setActive, active }: IMode) => {
  return (
    <div
      className={`w-[94%] mx-auto rounded-lg bg-grayone py-1 grid ${
        mode === 'DEFAULT' ? 'grid-cols-4' : 'grid-cols-2'
      } text-center gap-x-1 text-xs items-center justify-center`}
    >
      {(mode === 'SUPPLY' || mode === 'DEFAULT') && (
        <>
          <p
            onClick={() => setActive('COLLATERAL')}
            className={`rounded-md py-1 text-center  cursor-pointer ${
              active === 'COLLATERAL'
                ? 'bg-darkone text-accent '
                : 'text-white/40 '
            } transition-all duration-200 ease-linear `}
          >
            COLLATERAL
          </p>
          <p
            onClick={() => setActive('WITHDRAW')}
            className={` rounded-md py-1 px-3   ${
              active === 'WITHDRAW'
                ? 'bg-darkone text-accent '
                : 'text-white/40'
            } cursor-pointer transition-all duration-200 ease-linear`}
          >
            WITHDRAW
          </p>
        </>
      )}
      {(mode === 'BORROW' || mode === 'DEFAULT') && (
        <>
          <p
            onClick={() => setActive('BORROW')}
            className={` rounded-md py-1 px-3   ${
              active === 'BORROW' ? 'bg-darkone text-accent ' : 'text-white/40'
            } cursor-pointer transition-all duration-200 ease-linear`}
          >
            BORROW
          </p>
          <p
            onClick={() => setActive('REPAY')}
            className={` rounded-md py-1 px-3   ${
              active === 'REPAY' ? 'bg-darkone text-accent ' : 'text-white/40'
            } cursor-pointer transition-all duration-200 ease-linear`}
          >
            REPAY
          </p>
        </>
      )}
    </div>
  );
};

export default Tab;
