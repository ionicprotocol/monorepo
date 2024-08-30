'use client';
import { useSearchParams } from 'next/navigation';
import type { MutableRefObject } from 'react';
import { formatEther } from 'viem';
import { mode } from 'viem/chains';

import { chainsArr, pools, scans } from '@ui/constants/index';

interface IProps {
  close: () => void;
  open: boolean;
  bridgeref: MutableRefObject<never>;
  mock?: {
    amount: bigint;
    hash: string;
    approvalHash: string;
    fromChain: string;
    toChain: string;
    status?: boolean;
  };
}

export default function TxPopup({
  close,
  open,
  bridgeref,
  mock = {
    amount: BigInt(0),
    hash: '0x1234567890abcdef1234567890abcdef12345678',
    fromChain: '',
    toChain: '',
    approvalHash: ''
  }
}: IProps) {
  const searchParams = useSearchParams();
  const querychain = searchParams.get('chain');
  const chain = querychain ?? '34443';
  return (
    <div
      className={` z-50 fixed top-0 right-0 w-full h-screen  bg-black/35 ${
        open ? 'flex' : 'hidden'
      } items-center justify-center transition-opacity duration-300 overflow-y-auto animate-fade-in animated backdrop-blur-sm`}
    >
      <div
        className={`xl:max-w-[45%] sm:w-[75%] md:w-[60%]  w-[80%] h-max relative flex flex-col items-center justify-cente `}
        ref={bridgeref}
      >
        <div
          className={`bg-grayUnselect w-full p-4 flex flex-col gap-y-2 rounded-md`}
        >
          <div className={`  mb-5 text-xl  flex items-center justify-between`}>
            <span>Bridging</span>
            <img
              alt="close"
              className={` h-5 cursor-pointer `}
              onClick={() => close()}
              src="/img/assets/close.png"
            />
          </div>
          <div className={`w-full items-center justify-start flex `}>
            <span className={`text-xs  min-w-max`}>Amount</span>
            <div className={`ml-auto flex gap-2`}>
              <span className={`text-xs text-white/50`}>
                {Number(formatEther(mock.amount)).toLocaleString('en-US', {
                  maximumFractionDigits: 6
                })}
              </span>
              <img
                alt="close"
                className={` h-4 w-4 `}
                src="/img/logo/ION.png"
              />
              <span className={`text-xs text-white/50`}>ION</span>
            </div>
          </div>
          <div className={`w-full items-center justify-start flex `}>
            <span className={`text-xs  min-w-max`}>Received</span>
            <div className={`ml-auto flex gap-2`}>
              <span className={`text-xs text-white/50`}>
                {(
                  Number(formatEther(mock?.amount)) -
                  Number(formatEther(mock?.amount)) * 0.01
                ).toLocaleString('en-US', {
                  maximumFractionDigits: 3
                })}
              </span>
              <img
                alt="close"
                className={` h-4 w-4 `}
                src="/img/logo/ION.png"
              />
              <span className={`text-xs text-white/50`}>ION</span>
            </div>
          </div>
          <div className={`w-full items-center justify-start flex `}>
            <span className={`text-xs  min-w-max`}>Networks</span>
            <div className={`ml-auto flex items-center gap-2`}>
              <span className={`text-xs text-white/50`}>
                {chainsArr[+mock?.fromChain]}
              </span>
              {'->'}
              <span className={`text-xs text-white/50`}>
                {chainsArr[+mock?.toChain]}
              </span>
            </div>
          </div>
          <div className={`w-full items-center justify-start flex gap-4`}>
            <span className={`text-xs min-w-max`}>Approval Hash</span>
            <div className={`ml-auto truncate`}>
              <a
                target="_blank"
                href={`${scans[+mock?.fromChain]}${mock?.approvalHash}`}
                className={`text-xs text-white/50 `}
              >
                {mock?.approvalHash}
              </a>
            </div>
          </div>
          <div className={`w-full items-center justify-start flex gap-4 `}>
            <span className={`text-xs  min-w-max`}>Transaction Hash</span>
            <div className={`ml-auto truncate`}>
              <a
                target="_blank"
                href={`${scans[+mock?.fromChain]}${mock?.hash}`}
                className={`text-xs text-white/50  `}
              >
                {mock?.hash}
              </a>
            </div>
          </div>

          <a
            target="_blank"
            href={`https://layerzeroscan.com/tx/${mock?.hash}`}
            className={`my-3 py-1.5 text-sm ${pools[+chain].text} w-full ${pools[+chain].bg ?? pools[mode.id].bg} rounded-md flex items-center justify-center`}
          >
            TRACK
          </a>
        </div>
      </div>
    </div>
  );
}
