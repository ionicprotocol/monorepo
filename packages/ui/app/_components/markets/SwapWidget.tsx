/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef } from 'react';

import { LiFiWidget, useWidgetEvents, WidgetEvent } from '@lifi/widget';
import { type Address, zeroAddress } from 'viem';
import { mode } from 'viem/chains';

import { pools } from '@ui/constants/index';
import { getToken } from '@ui/utils/getStakingTokens';

import type { Route, WidgetConfig } from '@lifi/widget';

interface IProps {
  close: () => void;
  open: boolean;
  toChain: number;
  fromChain?: number;
  toToken?: Address;
  fromToken?: Address;
  onRouteExecutionCompleted?: (route: Route) => void;
}

export default function Widget({
  close,
  open,
  toChain,
  fromChain,
  toToken,
  fromToken,
  onRouteExecutionCompleted
}: IProps) {
  const widgetEvents = useWidgetEvents();

  useEffect(() => {
    widgetEvents.on(
      WidgetEvent.RouteExecutionCompleted,
      onRouteExecutionCompleted
    );

    return () => widgetEvents.all.clear();
  }, [onRouteExecutionCompleted, widgetEvents]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const widgetConfig: WidgetConfig = {
    toChain,
    fromChain: fromChain ?? toChain,
    fromToken: fromToken ?? zeroAddress,
    toToken: toToken ?? getToken(toChain),
    theme: {
      palette: {
        primary: {
          main: `${pools[toChain]?.hexcode ?? pools[mode.id].hexcode}`
        }
      },
      container: {
        border: `1px solid ${pools[toChain]?.hexcode ?? pools[mode.id].hexcode}`,
        borderRadius: '16px'
      }
    },
    sdkConfig: {
      routeOptions: {
        maxPriceImpact: 0.4, // increases threshold to 40%
        slippage: 0.005
      }
    },
    fee: 0.01,
    // theme : { palette : "grey"},
    integrator: 'ionic',
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
          integrator="ionic"
          config={widgetConfig}
        />
      </div>
    </div>
  );
}

// export default dynamic(() => Promise.resolve(Widget), { ssr: false });
