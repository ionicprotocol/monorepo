/* eslint-disable @next/next/no-img-element */
'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, useState, type MutableRefObject } from 'react';
import { useChainId } from 'wagmi';

import SliderComponent from '../popup/Slider';
import MaxDeposit from '../stake/MaxDeposit';

import LockDuration from './LockDuration';
import AutoLock from './AutoLock';

import { getToken } from '@ui/utils/getStakingTokens';

interface IProp {
  isGetIonOpen: boolean;
  toggleGetIon: () => void;
  getIonRef: MutableRefObject<never>;
}
export default function GetveIon({
  isGetIonOpen,
  toggleGetIon,
  getIonRef
}: IProp) {
  const chainId = useChainId();
  const searchParams = useSearchParams();
  const querychain = searchParams.get('chain');
  const chain = querychain ? querychain : String(chainId);
  const [veIonAmount, setVeIonAmount] = useState<string>('');
  const [utilization, setUtilization] = useState<number>(0);
  const [lockDuration, setLockDuration] = useState<string>('');
  const [autoLock, setAutoLock] = useState<boolean>(false);

  const maxtoken = '100';
  useMemo(() => {
    setUtilization(
      Number(((+veIonAmount / Number(maxtoken)) * 100).toFixed(0)) ?? 0
    );
  }, [veIonAmount]);
  // console.log(lockDuration);
  return (
    <div
      className={` z-50 fixed top-0 right-0 w-full h-screen  bg-black/35 ${
        isGetIonOpen ? 'flex' : 'hidden'
      } items-center justify-center transition-opacity duration-300 overflow-y-auto animate-fade-in animated backdrop-blur-sm `}
    >
      <div
        ref={getIonRef}
        className="bg-grayUnselect py-4 px-6 rounded-md  md:w-[35%] w-[80%]  flex flex-col "
      >
        <div
          className={`  mb-5 text-xl  flex items-center justify-between h-max relative`}
        >
          <span>Get veION</span>
          <img
            alt="close"
            className={` h-5 cursor-pointer `}
            onClick={() => toggleGetIon()}
            src="/img/assets/close.png"
          />
        </div>
        <MaxDeposit
          headerText={'Lock Amount'}
          max={maxtoken} //this will get changed in futur
          amount={veIonAmount}
          tokenName={'ion/eth LP'}
          token={getToken(+chain)}
          handleInput={(val?: string) => {
            setVeIonAmount(val!);
          }}
          chain={+chain}
        />
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
        <div className="h-[2px] w-[95%] mx-auto bg-white/10 mt-5 mb-3" />
        <div
          className={` flex w-full items-center justify-between text-xs text-white/50`}
        >
          <p>
            {' '}
            VOTING POWER <i className="popover-hint">i</i>
          </p>
          <p>0.00 veIon</p>
        </div>
        <button className="bg-accent py-1 text-sm text-black rounded-md  mt-4 ">
          Lock LP and get veION
        </button>
      </div>
    </div>
  );
}
