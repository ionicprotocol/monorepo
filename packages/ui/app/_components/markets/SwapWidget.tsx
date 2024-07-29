/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { LiFiWidget } from '@lifi/widget';
import type { WidgetConfig } from '@lifi/widget';
import { useEffect, useRef } from 'react';
import { mode } from 'viem/chains';

import { pools } from '@ui/constants/index';
import { getToken } from '@ui/utils/getStakingTokens';

interface IProps {
  close: () => void;
  open: boolean;
  chain: number;
}

export default function Widget({ close, open, chain }: IProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const widgetConfig: WidgetConfig = {
    toChain: +chain,
    fromChain: +chain,
    fromToken: '0x0000000000000000000000000000000000000000',
    toToken: getToken(+chain),
    theme: {
      palette: {
        primary: { main: `${pools[+chain].hexcode ?? pools[mode.id].hexcode}` }
      },
      container: {
        border: `1px solid ${pools[+chain].hexcode ?? pools[mode.id].hexcode}`,
        borderRadius: '16px'
      }
    },
    sdkConfig: {
      routeOptions: {
        maxPriceImpact: 0.4, // increases threshold to 40%
        slippage: 0.005
      }
    },
    // theme : { palette : "grey"},
    integrator: 'ionic.money',
    appearance: 'dark'
  };

  const newRef = useRef(null!);

  useEffect(() => {
    const handleOutsideClick = (e: any) => {
      //@ts-ignore
      if (newRef.current && !newRef.current?.contains(e?.target)) {
        close();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [close]);

  // ...

  return (
    <div
      className={` z-50 fixed top-0 right-0 w-full h-screen  bg-black/35 ${
        open ? 'flex' : 'hidden'
      } items-center justify-center transition-opacity duration-300 overflow-y-auto animate-fade-in animated backdrop-blur-sm`}
    >
      <div
        className={`w-max h-max relative flex flex-col items-center justify-center`}
        ref={newRef}
      >
        <LiFiWidget
          integrator="Ionic Money"
          config={widgetConfig}
        />
      </div>
    </div>
  );
}

// export default dynamic(() => Promise.resolve(Widget), { ssr: false });
