'use client';

import { useState, useMemo } from 'react';

import AutoLock from './AutoLock';
import LockDuration from './LockDuration';
import SliderComponent from '../popup/Slider';

interface Iprop {
  extendRef: any;
  extendOpen: boolean;
  toggle: () => void;
}

export default function ExtendVeion({ extendRef, extendOpen, toggle }: Iprop) {
  const [veIonAmount, setVeIonAmount] = useState<string>('');
  const [utilization, setUtilization] = useState<number>(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lockDuration, setLockDuration] = useState<string>('');
  const [autoLock, setAutoLock] = useState<boolean>(false);
  const maxtoken = 100;

  useMemo(() => {
    setUtilization(
      Number(((+veIonAmount / Number(maxtoken)) * 100).toFixed(0)) ?? 0
    );
  }, [veIonAmount]);
  return (
    <div
      className={` z-50 fixed top-0 right-0 w-full h-screen  bg-black/25 ${
        extendOpen ? 'flex' : 'hidden'
      } items-center justify-center transition-opacity duration-300 overflow-y-auto animate-fade-in animated backdrop-blur-sm `}
    >
      <div
        ref={extendRef}
        className="bg-grayone border border-grayUnselect py-4 px-6 rounded-md  md:w-[35%] w-[80%]  flex flex-col "
      >
        <div
          className={` w-full mb-3 text-xl  flex items-center justify-between h-max relative`}
        >
          <span>Extend veION</span>
          <img
            alt="close"
            className={` h-5 cursor-pointer `}
            onClick={() => toggle()}
            src="/img/assets/close.png"
          />
        </div>

        <div className="flex gap-5 text-xs ">
          <span className="text-white/50 ">Voting Power: 20.00 veION</span>
          <span className="text-white/50 ">Locked Until: 28 Aug 2023I</span>
        </div>
        <div className="  mb-5 text-xl  flex flex-col items-center justify-between h-max relative">
          <SliderComponent
            currentUtilizationPercentage={utilization}
            handleUtilization={(val?: number) => {
              if (!val) return;
              const veionval =
                (Number(val) / 100) *
                Number(
                  // formatEther(
                  maxtoken
                  // withdrawalMaxToken?.decimals as number
                  // )
                );
              setVeIonAmount(veionval.toString());
            }}
          />
          <LockDuration setLockDuration={setLockDuration} />
          <AutoLock
            autoLock={autoLock}
            setAutoLock={setAutoLock}
          />
        </div>
        <div className="h-[2px] w-[95%] mx-auto bg-white/10 mt-3 mb-4" />

        <div className="flex flex-col gap-2 mb-4">
          <div className="text-xs flex items-center justify-between w-full text-white/50">
            <span> Voting Power</span>
            <span> 0.00 {'->'} 120</span>
          </div>
          <div className="text-xs flex items-center justify-between w-full text-white/50">
            <span> Locked Untill</span>
            <span> 09 Sep 2023 {'->'} 09 Sep 2024</span>
          </div>
        </div>
        <button className="bg-accent  py-1.5 px-4 w-full text-black rounded-md  ">
          Extend Lock
        </button>
      </div>
    </div>
  );
}
