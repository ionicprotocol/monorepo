/* eslint-disable @next/next/no-img-element */
'use client';

import dynamic from 'next/dynamic';
import { fraxtal } from 'viem/chains';

const SwapWidget = dynamic(() => import('./SwapWidget'), {
  ssr: false
});

interface IProps {
  setSwapOpen: any;
  dropdownSelectedChain: number;
  setSwapWidgetOpen: any;
  swapWidgetOpen: boolean;
}
export default function WrapEthSwaps({
  setSwapOpen,
  dropdownSelectedChain,
  setSwapWidgetOpen,
  swapWidgetOpen
}: IProps) {
  return (
    <div className=" flex mt-auto flex-row gap-3 md:mb-0 mb-3 justify-center md:justify-start md:mx-0 mx-auto  ">
      <button
        className={`xl:px-6 lg:px-4 px-2 lg:text-sm text-[8px]  md:mx-0 rounded-md py-1 transition-colors bg-accent text-darkone text-sm  uppercase`}
        onClick={() => setSwapOpen(true)}
      >
        {`Wrap ${+dropdownSelectedChain === fraxtal.id ? 'frxETH' : 'ETH'} `}

        <img
          alt=""
          className="inline-block"
          height="15"
          src={`/img/symbols/32/color/${+dropdownSelectedChain === fraxtal.id ? 'frxeth' : 'eth'}.png`}
          width="15"
        />
        <span>{' -> '}</span>
        <img
          alt=""
          className="inline-block"
          height="15"
          src={`/img/symbols/32/color/${+dropdownSelectedChain === fraxtal.id ? 'wfrxeth' : 'weth'}.png`}
          width="15"
        />
      </button>

      <button
        className={`xl:px-12 lg:px-8 px-6 lg:text-sm text-[8px] md:mx-0 rounded-md py-1 transition-colors bg-accent text-darkone text-xs  uppercase`}
        onClick={() => setSwapWidgetOpen(true)}
      >
        {'Swap Assets'}
      </button>

      <SwapWidget
        close={() => setSwapWidgetOpen(false)}
        open={swapWidgetOpen}
        toChain={+dropdownSelectedChain}
      />
    </div>
  );
}
