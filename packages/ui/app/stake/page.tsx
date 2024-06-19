/* eslint-disable @next/next/no-img-element */
'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

const Widget = dynamic(() => import('../_components/stake/Widget'), {
  ssr: false
});

// import { Widget } from '../_components/stake/Widget';

export default function Stake() {
  const [widgetPopup, setWidgetPopup] = useState<boolean>(false);
  return (
    <main className={``}>
      <div className="w-full flex items-center justify-center py-20 transition-all duration-200 ease-linear bg-black dark:bg-black relative">
        {widgetPopup && <Widget close={() => setWidgetPopup(false)} />}

        <div className={`md:w-[50%] w-[90%] mx-auto grid grid-cols-2 gap-4`}>
          <div
            className={`bg-grayone col-span-2 flex flex-col items-center justify-center py-4 px-8 rounded-xl gap-y-3 `}
          >
            <h1 className={` text-lg`}>
              Step 1. Buy
              <img
                alt="ion logo"
                className={`w-6 h-6 inline-block mx-1`}
                src="/img/symbols/32/color/ion.png"
              />
              ION Tokens
            </h1>
            <button
              className={` py-1.5 text-sm text-black w-full bg-accent rounded-md`}
              onClick={() => setWidgetPopup(true)}
            >
              Buy ION Tokens
            </button>
          </div>
          <div className={`w-full h-full bg-grayone px-4 rounded-xl py-2`}>
            <h1 className={` text-lg`}>Step 2. LP your ION Tokens</h1>
            <div
              className={`flex w-full mt-2 items-center justify-between text-[11px] text-white/40`}
            >
              <span> Deposit </span>
              <div>
                {' '}
                ION Balance : 00.00
                <button className={`text-accent ml-2`}>MAX</button>
              </div>
            </div>
            <div
              className={`flex w-full mt-2 items-center justify-between text-md `}
            >
              <input
                className={`focus:outline-none amount-field font-bold bg-transparent flex-auto block w-full`}
                placeholder={`0.0`}
                type="number"
                // value={}
              />
              <div className=" flex items-center justify-center">
                <img
                  alt="ion logo"
                  className={`w-5 h-5 inline-block mx-1`}
                  src="/img/symbols/32/color/ion.png"
                />
                <button className={` mx-2`}>ION</button>
              </div>
            </div>
            <div
              className={`flex w-full mt-4 items-center justify-between text-[11px] text-white/40`}
            >
              <span> Deposit </span>
              <div>
                {' '}
                WETH Balance : 00.00
                <button className={`text-accent ml-2`}>MAX</button>
              </div>
            </div>
            <div
              className={`flex w-full mt-2 items-center justify-between text-md `}
            >
              <input
                className={`focus:outline-none amount-field font-bold bg-transparent flex-auto block w-full`}
                placeholder={`0.0`}
                type="number"
                // value={}
              />
              <div className=" flex items-center justify-center">
                <img
                  alt="ion logo"
                  className={`w-5 h-5 inline-block mx-1`}
                  src="/img/logo/ETH.png"
                />
                <button className={` mx-2`}>WETH</button>
              </div>
            </div>
            {/* liner */}

            <div className="h-[2px] w-[95%] mx-auto bg-white/10 my-5" />
            <h1> Expected LP </h1>
            <div
              className={`flex w-full mt-2 items-center justify-between text-md `}
            >
              <input
                className={`focus:outline-none amount-field font-bold bg-transparent flex-auto block w-full`}
                placeholder={`0.0`}
                type="number"
                // value={}
              />
              <div className=" flex items-center justify-center">
                <img
                  alt="ion logo"
                  className={`w-5 h-5 inline-block mx-1`}
                  src="/img/symbols/32/color/ion.png"
                />
                <button className={` mx-2`}>ION/WETH</button>
              </div>
            </div>
            <button
              className={`flex items-center justify-center  py-1.5 mt-8 mb-4 text-sm text-black w-full bg-accent rounded-md`}
            >
              <img
                alt="lock--v1"
                className={`w-4 h-4 inline-block mx-2`}
                src="https://img.icons8.com/ios/50/lock--v1.png"
              />
              Provide Liquidity
            </button>
          </div>
          <div className={`w-full h-full bg-grayone px-4 rounded-xl py-2`}>
            <h1 className={` text-lg`}>Step 3. Stake your LP</h1>
            <h1 className={`text-[12px] text-white/40 mt-2`}> Stake </h1>
            <div
              className={`flex w-full mt-2 items-center justify-between text-md `}
            >
              <input
                className={`focus:outline-none amount-field font-bold bg-transparent flex-auto block w-full`}
                placeholder={`0.0`}
                type="number"
                // value={}
              />
              <div className=" flex items-center justify-center">
                <img
                  alt="ion logo"
                  className={`w-5 h-5 inline-block mx-1`}
                  src="/img/symbols/32/color/ion.png"
                />
                <button className={` mx-2`}>ION/WETH</button>
              </div>
            </div>
            <div className="h-[2px] w-[95%] mx-auto bg-white/10 my-5" />
            <h1 className={` mt-2`}>You will get </h1>
            {/* this will get repeated */}
            <div className="flex items-center w-full mt-3 text-xs gap-2">
              <img
                alt="ion logo"
                className={`w-6 h-6 inline-block mx-1`}
                src="/img/logo/MODE.png"
              />
              <span>Mode Points SZN 2</span>
              <span className="text-accent ml-auto">2x</span>
            </div>
            <div className="flex items-center w-full mt-3 text-xs gap-2">
              <img
                alt="ion logo"
                className={`w-6 h-6 inline-block mx-1`}
                src="/img/logo/MODE.png"
              />
              <span>Mode Points SZN 2</span>
              <span className="text-accent ml-auto">2x</span>
            </div>
            <div className="flex items-center w-full mt-3 text-xs gap-2">
              <img
                alt="ion logo"
                className={`w-6 h-6 inline-block mx-1`}
                src="/img/logo/MODE.png"
              />
              <span>Mode Points SZN 2</span>
              <span className="text-accent ml-auto">2x</span>
            </div>
            <button
              className={`flex items-center justify-center  py-1.5 mt-6 mb-4 text-sm text-black w-full bg-accent rounded-md`}
            >
              Stake
            </button>
          </div>
          {/* this will get repeated */}
        </div>
      </div>
    </main>
  );
}

// export default dynamic(() => Promise.resolve(Stake), { ssr: false });
