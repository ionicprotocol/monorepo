/* eslint-disable @next/next/no-img-element */
'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useChainId } from 'wagmi';

import MaxDeposit from '../_components/stake/MaxDeposit';

export default function Bridge() {
  const chainId = useChainId();
  const searchParams = useSearchParams();
  const querychain = searchParams.get('chain');
  const chain = querychain ? querychain : String(chainId);
  // const [tokenAmount, setTokenAmount] = useState(0);
  const [fromNetwork, setFromNetwork] = useState('abc');
  const [toNetwork, setToNetwork] = useState('abc');

  //----------------------
  const [deposit, setDeposit] = useState<string>('');
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
            />
          </div>
        </div>
        <div className={`grid grid-cols-2 gap-x-4`}>
          <div className="mb-2 ">
            <p className=" text-xs text-white/50">FROM</p>
            <div className="relative mt-1">
              <select
                value={fromNetwork}
                onChange={(e) => setFromNetwork(e.target.value)}
                className="block p-2 bg-gray-800 border border-gray-600 rounded w-full appearance-none text-white"
              >
                <option value="abc">abc</option>
                {/* Add more network options as needed */}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="mb-2 ">
            <p className=" text-xs text-white/50">TO</p>
            <div className="relative mt-1">
              <select
                value={toNetwork}
                onChange={(e) => setToNetwork(e.target.value)}
                className="block p-2 bg-gray-800 border border-gray-600 rounded w-full appearance-none text-white"
              >
                <option value="abc">abc</option>
                {/* Add more network options as needed */}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <button className="bg-accent  hover:bg-green-600 text-black  py-1 px-4 rounded w-full mt-4">
          Connect Wallet
        </button>
      </div>
    </main>
  );
}
