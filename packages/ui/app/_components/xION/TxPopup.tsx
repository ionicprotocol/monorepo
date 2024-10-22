/* eslint-disable @next/next/no-img-element */
'use client';

import { type MutableRefObject } from 'react';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

// import { xErc20LayerZeroAbi } from 'sdk/src';
import { formatEther } from 'viem';
import { mode } from 'viem/chains';
// import { useWatchContractEvent } from 'wagmi';

import { chainsArr, pools, scans } from '@ui/constants/index';
// import useLocalStorage from '@ui/hooks/useLocalStorage';
// import { BridgingContractAddress } from '@ui/utils/getStakingTokens';

interface IProps {
  close: () => void;
  open: boolean;
  bridgeref: MutableRefObject<never>;
  mock: Imock;
}

interface Imock {
  // hasHistory: boolean;
  amount: bigint;
  hash: string;
  fromChain: string;
  toChain: string;
  approvalHash: string;
  bridgeStatus: string;
  status: boolean;
  // bridgingBlock: string;
}

function TxPopup({
  close,
  open,
  bridgeref,
  mock
  // mock = {
  //   amount: BigInt(0),
  //   hash: '0x1234567890abcdef1234567890abcdef12345678',
  //   fromChain: '34443',
  //   toChain: '8453',
  //   approvalHash: '0x123456789',
  //   bridgeStatus: 'unknown',
  //   status: false
  // }
}: IProps) {
  const searchParams = useSearchParams();
  const querychain = searchParams.get('chain');
  const chain = querychain ?? '34443';
  // const [bridgeStatus, setBridgeStatus] = useState<
  //   'completed' | 'error' | 'pending' | 'unknown'
  // >('unknown');

  const temp = {
    hasHistory: false,
    amount: BigInt(0),
    hash: '0x1234567890abcdef1234567890abcdef12345678',
    fromChain: '34443',
    toChain: '8453',
    approvalHash: '0x123456789',
    bridgeStatus: 'unknown',
    status: false,
    bridgingBlock: '21212'
  };

  //-------------------------- for future use
  // const [mock] = useLocalStorage('bridgeTx', '');
  // console.log(mock);
  // useWatchContractEvent({
  //   address: BridgingContractAddress[+mock?.toChain],
  //   abi: xErc20LayerZeroAbi,
  //   eventName: 'TokenReceived',
  //   chainId: +mock?.toChain,
  //   onLogs(logs) {
  //     console.warn('New logs!', logs);
  //     setBridgeStatus('completed');
  //     setInit(JSON.stringify({ ...mock, bridgeStatus: 'completed' }));
  //   }
  //   // syncConnectedChain: true
  // });

  // const statusimg: Record<string, string> = {
  //   completed: 'https://img.icons8.com/ios-glyphs/30/ffffff/checkmark--v1.png',
  //   error: '/img/assets/close.png',
  //   pending: '/img/assets/loading.gif',
  //   unknown: '/img/assets/search.png'
  // };
  //-----------------------------------------------------------
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
                {Number(
                  formatEther(mock?.amount ?? temp.amount)
                ).toLocaleString('en-US', {
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
                  Number(formatEther(mock?.amount ?? temp.amount)) -
                  Number(formatEther(mock?.amount ?? temp.amount)) * 0.01
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
                {chainsArr[+mock?.fromChain ?? temp.fromChain]}
              </span>
              {'->'}
              <span className={`text-xs text-white/50`}>
                {chainsArr[+mock?.toChain ?? temp.toChain]}
              </span>
            </div>
          </div>
          <div className={`w-full items-center justify-start flex gap-4`}>
            <span className={`text-xs min-w-max`}>Approval Hash</span>
            <div className={`ml-auto truncate`}>
              <a
                target="_blank"
                href={`${scans[+mock?.fromChain ?? temp.fromChain]}${mock?.approvalHash ?? temp.approvalHash}`}
                className={`text-xs text-white/50 `}
              >
                {mock?.approvalHash ?? temp.approvalHash}
              </a>
            </div>
          </div>
          <div className={`w-full items-center justify-start flex gap-4 `}>
            <span className={`text-xs  min-w-max`}>Transaction Hash</span>
            <div className={`ml-auto truncate`}>
              <a
                target="_blank"
                href={`${scans[+mock?.fromChain ?? temp.fromChain]}${mock?.hash ?? temp.hash}`}
                className={`text-xs text-white/50  `}
              >
                {mock?.hash ?? temp.hash}
              </a>
            </div>
          </div>
          {/* <div className={`w-full items-center justify-start flex gap-4 `}>
            <span className={`text-xs  min-w-max`}>Bridging Status</span>
            <div className={`ml-auto truncate`}>
              {
                <img
                  alt="status"
                  className={` h-5 cursor-pointer inline-block ${mock.bridgeStatus === 'pending' && 'invert mix-blend-screen'} `}
                  src={statusimg[bridgeStatus]}
                />
              }
            </div>
          </div> */}

          <a
            target="_blank"
            href={`https://layerzeroscan.com/tx/${mock?.hash ?? temp.hash}`}
            className={`my-3 py-1.5 text-sm ${pools[+chain].text} w-full ${pools[+chain].bg ?? pools[mode.id].bg} rounded-md flex items-center justify-center`}
          >
            TRACK
          </a>
        </div>
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(TxPopup), { ssr: false });
