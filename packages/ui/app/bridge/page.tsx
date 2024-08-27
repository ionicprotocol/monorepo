/* eslint-disable @next/next/no-img-element */
'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useChainId } from 'wagmi';

import { useOutsideClick } from '../../hooks/useOutsideClick';
import MaxDeposit from '../_components/stake/MaxDeposit';
import TokenSelector from '../_components/stake/TokenSelector';

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

  function returnedTokenFn(token: string) {
    console.log(token);
  }
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
              tokenSelector={true}
              tokenArr={['ion', 'eth', 'mode', 'weth']}
            />
          </div>
        </div>
        <div className={`grid grid-cols-2 gap-x-4`}>
          <div className="mb-2 ">
            <p className=" text-xs text-white/50">FROM</p>
            <TokenSelector
              newRef={fromRef}
              open={fromIsOpen}
              setOpen={fromToggle}
              chain={+chain}
              tokenArr={[
                'polygon',
                'mode',
                'eth',
                'arbitrum',
                'optimism',
                'base'
              ]}
              tokenReturned={(token) => returnedTokenFn(token)}
            />
          </div>

          <div className="mb-2 ">
            <p className=" text-xs text-white/50">TO</p>
            <TokenSelector
              newRef={toRef}
              open={toIsOpen}
              setOpen={toToggle}
              chain={+chain}
              tokenArr={['mode', 'eth', 'arbitrum', 'optimism', 'base']}
            />
          </div>
        </div>
        {/* <button className="bg-accent  hover:bg-green-600 text-black  py-1 px-4 rounded w-full mt-4">
          Connect Wallet
        </button> */}
      </div>
    </main>
  );
}
