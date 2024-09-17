/* eslint-disable @next/next/no-img-element */
'use client';

import dynamic from 'next/dynamic';
import { fraxtal } from 'viem/chains';

const SwapWidget = dynamic(() => import('./SwapWidget'), {
  ssr: false
});

interface IProps {
  dropdownSelectedChain: number;
  setSwapWidgetOpen: any;
  swapWidgetOpen: boolean;
}
export default function WrapEthSwaps({
  dropdownSelectedChain,
  setSwapWidgetOpen,
  swapWidgetOpen
}: IProps) {
  return (
    <div className=" w-full flex md:mt-auto mt-3 flex-row gap-3 md:mb-0 mb-3  justify-center md:justify-start ">
      <button
        className={`xl:px-12 w-[80%] lg:px-8 px-6 md:mx-auto rounded-md py-1.5 transition-colors bg-accent text-darkone text-xs  uppercase`}
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
