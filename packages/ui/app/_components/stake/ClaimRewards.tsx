/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useRef } from 'react';

interface IProps {
  close: () => void;
  open: boolean;
}

export default function ClaimRewards({ close, open }: IProps) {
  const newRef = useRef(null!);

  useEffect(() => {
    const handleOutsideClick = (e: any) => {
      //@ts-ignore
      if (newRef.current && !newRef.current?.contains(e?.target)) {
        close();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [close]);

  return (
    <div
      className={` z-50 fixed top-0 right-0 w-full h-screen  bg-black/35 ${
        open ? 'flex' : 'hidden'
      } items-center justify-center transition-opacity duration-300 overflow-y-auto animate-fade-in animated backdrop-blur-sm`}
    >
      <div
        className={`w-[30%] h-max relative flex flex-col items-center justify-cente `}
        ref={newRef}
      >
        <div className={`bg-grayUnselect w-full p-4 rounded-md`}>
          <div
            className={`  mb-5 text-xl px-4 flex items-center justify-between`}
          >
            <span>Claim Rewards</span>
            <img
              alt="close"
              className={` h-5 cursor-pointer `}
              onClick={() => close()}
              src="/img/assets/close.png"
            />
          </div>
          <h1 className={` text-center mb-2`}>Emissions</h1>
          <div
            className={`grid grid-cols-3 justify-between w-full items-center text-sm text-white/60`}
          >
            <span className={` mx-auto`}>Mode</span>
            <span className={` mx-auto`}>0.9</span>
            <button
              className={`mx-auto py-0.5 px-4 text-sm text-black w-max bg-accent rounded-md`}
            >
              Claim
            </button>
          </div>
          <h1 className={`mt-4 mb-2 text-center`}>Trading Fees</h1>
          <div
            className={`grid grid-cols-3  w-full items-center text-sm text-white/60`}
          >
            <span className={` mx-auto`}>ION</span>
            <span className={` mx-auto`}>0.9</span>
          </div>
          <div
            className={`grid grid-cols-3  w-full items-center text-sm text-white/60`}
          >
            <span className={` mx-auto`}>Weth</span>
            <span className={` mx-auto`}>1.9</span>
            <button
              className={` mx-auto py-0.5 px-4 text-sm text-black w-max bg-accent rounded-md`}
            >
              Claim
            </button>
          </div>
          <div
            className={` w-max py-1 px-10 mx-auto mt-6 text-sm text-black  bg-accent rounded-md`}
          >
            Claim All
          </div>
        </div>
      </div>
    </div>
  );
}
