/* eslint-disable @next/next/no-img-element */
'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { mode } from 'viem/chains';
import { useChainId } from 'wagmi';

import { useOutsideClick } from '../../hooks/useOutsideClick';
import FromTOChainSelector from '../_components/bridge/FromToChainSelector';
import ProgressSteps from '../_components/bridge/ProgressSteps';
import MaxDeposit from '../_components/stake/MaxDeposit';

import { pools } from '@ui/constants/index';

export default function Bridge() {
  const chainId = useChainId();
  const searchParams = useSearchParams();
  const querychain = searchParams.get('chain');
  const chain = querychain ?? String(chainId);

  const {
    componentRef: fromRef,
    isopen: fromIsOpen,
    toggle: fromToggle
  } = useOutsideClick();
  const {
    componentRef: toRef,
    isopen: toIsOpen,
    toggle: toToggle
  } = useOutsideClick();
  //----------------------
  const [deposit, setDeposit] = useState<string>('');

  // function returnedTokenFn(token: string) {
  //   console.log(token);
  // }

  // const chainsArr = [
  //   {
  //     name: 'Mode',
  //     id: 34443
  //   },
  //   {
  //     name: 'Eth',
  //     id: 1
  //   },
  //   {
  //     name: 'Base',
  //     id: 8453
  //   },
  //   {
  //     name: 'Polygon',
  //     id: 137
  //   },
  //   {
  //     name: 'Arbitrum',
  //     id: 42161
  //   },
  //   {
  //     name: 'Optimism',
  //     id: 10
  //   }
  // ];

  return (
    <main className={``}>
      <div className="bg-grayone  p-6 rounded-xl max-w-[55%] mx-auto mt-10">
        <div className={`mb-2 flex items-center justify-between`}>
          <h2 className="text-lg ">Bridge</h2>
          <h2 className="text-xs text-white/50 ">
            Finish Bridge{' '}
            <img
              className={`inline-block w-3 h-3 mx-0.5`}
              src="https://img.icons8.com/ios/50/ffffff/info--v1.png"
              alt="info--v1"
            />
          </h2>
        </div>

        <div className="mb-4">
          {/* <p className=" text-sm text-white/50 ">TOKEN AMOUNT</p> */}
          <div className={`flex flex-col  `}>
            <MaxDeposit
              headerText="Token Amount"
              amount={deposit}
              tokenName={'ion'}
              token={'0x3eE5e23eEE121094f1cFc0Ccc79d6C809Ebd22e5'}
              handleInput={(val?: string) => setDeposit(val ?? '')}
              chain={+chain}
              // tokenSelector={true}
              tokenArr={['ion']}
            />
          </div>
        </div>
        <div className={`grid grid-cols-2 gap-x-4`}>
          <div className="mb-2 ">
            <p className=" text-xs text-white/50">FROM</p>
            <FromTOChainSelector
              newRef={fromRef}
              open={fromIsOpen}
              setOpen={fromToggle}
            />
          </div>

          <div className="mb-2 ">
            <p className=" text-xs text-white/50">TO</p>
            <FromTOChainSelector
              newRef={toRef}
              open={toIsOpen}
              setOpen={toToggle}
              mode="toChain"
            />
          </div>
        </div>
        <div className={`flex items-center justify-center w-full gap-2`}>
          <button
            className={`my-3 py-1.5 text-sm ${pools[+chain].text} w-full ${pools[+chain].bg ?? pools[mode.id].bg} rounded-md`}
            // onClick={() => setRewardPopup(true)}
          >
            Approve
          </button>
          <button
            className={`my-3 py-1.5 text-sm ${pools[+chain].text} w-full ${pools[+chain].bg ?? pools[mode.id].bg} rounded-md`}
            // onClick={() => setRewardPopup(true)}
          >
            Send
          </button>
        </div>
        <div className={`w-[70%] mx-auto mt-3`}>
          <ProgressSteps bg={`${pools[+chain]?.bg ?? pools[mode.id]?.bg}`} />
        </div>
      </div>
    </main>
  );
}
