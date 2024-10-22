/* eslint-disable @next/next/no-img-element */
'use client';

import type { MutableRefObject } from 'react';
import { useMemo, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { useChainId } from 'wagmi';

import { getToken } from '@ui/utils/getStakingTokens';

import AutoLock from './AutoLock';
import InfoPopover from './InfoPopover';
import LockDuration from './LockDuration';
import SliderComponent from '../popup/Slider';
import MaxDeposit from '../stake/MaxDeposit';
import Toggle from '../Toggle';

interface IProp {
  isManageOpen: boolean;
  toggleManage: () => void;
  manageRef: MutableRefObject<never>;
}

export default function ManagePopup({
  isManageOpen,
  toggleManage,
  manageRef
}: IProp) {
  const toggleArr = [
    'Increase',
    'Extend',
    'Delegate',
    'Merge',
    'Split',
    'Transfer'
  ];

  //temp
  const maxtoken = '100'; //this will be change

  const chainId = useChainId();
  const searchParams = useSearchParams();
  const querychain = searchParams.get('chain');
  const chain = querychain ? querychain : String(chainId);
  const [activeManageToggle, setActiveManageToggle] = useState<string>(
    toggleArr[0]
  );

  const [increaseVeionAmount, setIncreaseVeionAmount] = useState<string>('');
  const [extendDuration, setExtendDuration] = useState<string>('');
  const [delegateAddress, setDelegateAddress] = useState<string>('');
  const [splitTokenInto, setSplitTokenInto] = useState<number>(2);

  const [autoLock, setAutoLock] = useState<boolean>(false);
  const [utilization, setUtilization] = useState<number>(0);
  const [transferAddress, setTransferAddress] = useState<string>('');

  const [splitValuesArr, setSplitValuesArr] = useState(
    Array(splitTokenInto).fill(0)
  );

  // eslint-disable-next-line no-console
  console.log({ extendDuration, delegateAddress, transferAddress });
  // const handleSliderChange = (index, value) => {
  //   const updatedSplitValues = [...splitValues];
  //   updatedSplitValues[index] = value;
  //   setSplitValuesArr(updatedSplitValues);
  // };

  const handleSubmit = () => {
    const result = splitValuesArr.map((value, index) => ({
      veionTokenNumber: index + 1, // Token number, starting from 1
      splitAmount: value
    }));
    // eslint-disable-next-line no-console
    console.log(result); // You can replace this with your desired function
  };

  useMemo(() => {
    setUtilization(
      Number(((+increaseVeionAmount / Number(maxtoken)) * 100).toFixed(0)) ?? 0
    );
  }, [increaseVeionAmount]);
  return (
    <div
      className={` z-50 fixed top-0 right-0 w-full h-screen  bg-black/35 ${
        isManageOpen ? 'flex' : 'hidden'
      } items-center justify-center transition-opacity duration-300 overflow-y-auto animate-fade-in animated backdrop-blur-sm `}
    >
      <div
        ref={manageRef}
        className="bg-grayone border border-graylite/60 py-4 px-6 rounded-md  md:w-[35%] w-[80%]  flex flex-col "
      >
        <div
          className={`  mb-2 text-xl  flex items-center justify-between h-max relative`}
        >
          <span>Manage veIon #12</span>
          <img
            alt="close"
            className={` h-5 cursor-pointer `}
            onClick={() => toggleManage()}
            src="/img/assets/close.png"
          />
        </div>
        <div className="flex gap-2 text-xs ">
          <span className="text-white/50 ">Voting Power: 20.00 veION</span>
          <span className="text-white/50 ">Locked Until: 28 Aug 2023I</span>
        </div>
        <div className="bg-graylite rounded-md my-3">
          <Toggle
            setActiveToggle={(val) => setActiveManageToggle(val)}
            arrText={toggleArr}
          />
        </div>
        {activeManageToggle == 'Increase' && (
          <div className="flex flex-col gap-y-2 py-2 px-3">
            <MaxDeposit
              headerText={'Lock Amount'}
              max={maxtoken} //this will get changed in futur
              amount={increaseVeionAmount}
              tokenName={'ion/eth LP'}
              token={getToken(+chain)}
              handleInput={(val?: string) => {
                setIncreaseVeionAmount(val!);
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
                setIncreaseVeionAmount(veionval.toString());
              }}
            />
            <div
              className={` flex w-full items-center justify-between text-xs text-white/50`}
            >
              <div className="">
                VOTING POWER{' '}
                <InfoPopover content="Your voting power diminishes each day closer to the end of the token lock period." />
              </div>
              <p>0.00 veIon</p>
            </div>
            <div
              className={` flex w-full items-center justify-between text-xs text-white/50`}
            >
              <div className="">
                LOCKED BLP{' '}
                <InfoPopover content="Info reguarding the locked BLP." />
              </div>
              <p>67.90 veIon</p>
            </div>
            <button
              onClick={() => toggleManage()}
              className="bg-accent py-1 text-sm text-black rounded-md  mt-4 "
            >
              Increase Locked Amount
            </button>
          </div>
        )}

        {activeManageToggle == 'Extend' && (
          <div className="flex flex-col gap-y-2 py-2 px-3">
            <LockDuration setLockDuration={setExtendDuration} />
            <AutoLock
              autoLock={autoLock}
              setAutoLock={setAutoLock}
            />
            <div className="h-[2px] w-[95%] mx-auto bg-white/10 mt-5 mb-3" />
            <div
              className={` flex w-full items-center justify-between text-xs text-white/50`}
            >
              <div className="">
                VOTING POWER{' '}
                <InfoPopover content="Your voting power diminishes each day closer to the end of the token lock period." />
              </div>
              <p>0.00 veIon</p>
            </div>
            <div
              className={` flex w-full items-center justify-between text-xs text-white/50`}
            >
              <div className="">
                LOCKED Until{' '}
                <InfoPopover content="Info reguarding the locked BLP." />
              </div>
              <p>28 Aug 2023{'->'} 28 Aug 2024</p>
            </div>
            <button
              onClick={() => toggleManage()}
              className="bg-accent py-1 text-sm text-black rounded-md  mt-4 "
            >
              Extend Lock
            </button>
          </div>
        )}
        {activeManageToggle == 'Delegate' && (
          <div className="flex flex-col gap-y-2 py-2 px-3">
            <p>Delegate Address</p>
            <input
              className={`focus:outline-none amount-field font-bold bg-transparent disabled:text-white/60 flex-auto flex w-full trucnate`}
              placeholder={`0x...`}
              type="string"
              onChange={(e) => setDelegateAddress(e.target.value)}
              // disabled={handleInput ? false : true}
            />
            <div className="border text-yellow-300 text-xs  items-center justify-center border-yellow-300 flex gap-3 rounded-md py-2 px-4 mt-2">
              <img
                alt="warn"
                className={` h-5  `}
                src="/img/assets/warn.png"
              />
              <span>
                You may delegate your voting power to any user, without
                transferring the tokens. You may revoke it, but the user will
                still be able to vote until the end of the current voting
                period.{' '}
              </span>
            </div>
            <button className="bg-accent py-1 text-sm text-black rounded-md  mt-4 ">
              Delegate veION
            </button>
          </div>
        )}
        {activeManageToggle == 'Merge' && (
          <div>
            <p className="text-[10px] text-white/50">veION</p>
            <p>#10990</p>
            <p className="text-[10px] text-white/50 mt-3">Merge To</p>
          </div>
        )}
        {activeManageToggle == 'Split' && (
          <>
            <p className="text-[10px] mb-2 text-white/50">SPLIT TO</p>
            <div className="flex gap-2 text-sm ">
              {[2, 3, 4].map((value) => (
                <button
                  key={value}
                  onClick={() => setSplitTokenInto(value)}
                  className={`px-4 py-1 rounded  
                ${splitTokenInto === value ? 'bg-accent text-black' : 'bg-graylite'}
                hover:bg-gray-600 focus:outline-none`}
                >
                  {value} tokens
                </button>
              ))}
            </div>
            {Array.from({ length: splitTokenInto }).map((_, index) => (
              <div
                className={`flex flex-col gap-y-2 py-2 px-3`}
                key={index}
              >
                <p className="text-[10px] text-white/50">{index + 1} veION</p>
                <SliderComponent
                  currentUtilizationPercentage={
                    splitValuesArr[index] ? splitValuesArr[index] : 0
                  }
                  handleUtilization={(val?: number) => {
                    if (!val) return;
                    const updatedSplitValues = [...splitValuesArr];
                    updatedSplitValues[index] = val;
                    setSplitValuesArr(updatedSplitValues);
                  }}
                />
              </div>
            ))}
            <button
              onClick={handleSubmit}
              className="mt-4 px-4 py-2 bg-accent text-black rounded-md hover:bg-accent/80"
            >
              Split
            </button>
          </>
        )}
        {activeManageToggle == 'Transfer' && (
          <div className="flex flex-col gap-y-2 py-2 px-3">
            <p className="text-[10px] mb-2 text-white/50">TRANSFER ADDRESS</p>
            <input
              className={`focus:outline-none amount-field font-bold bg-transparent disabled:text-white/60 flex-auto flex w-full trucnate`}
              placeholder={`0x...`}
              type="string"
              onChange={(e) => setTransferAddress(e.target.value)}
              // disabled={handleInput ? false : true}
            />
            <div className="border text-yellow-300 text-xs  items-center justify-center border-yellow-300 flex gap-3 rounded-md py-2 px-4 mt-2">
              <img
                alt="warn"
                className={` h-5  `}
                src="/img/assets/warn.png"
              />
              <span>
                Once you transfer the tokens, you lose access to them
                irrevocably.
              </span>
            </div>
            <button className="bg-accent py-1 text-sm text-black rounded-md  mt-4 ">
              Transfer veION
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
