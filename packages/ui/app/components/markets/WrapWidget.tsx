/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef } from 'react';

import { LiFiWidget, useWidgetEvents, WidgetEvent } from '@lifi/widget';
import { zeroAddress } from 'viem';
import { mode } from 'viem/chains';

import { pools } from '@ui/constants/index';

import type { Route, WidgetConfig } from '@lifi/widget';

interface IProps {
  close: () => void;
  open: boolean;
  chain: number;
  onRouteExecutionCompleted?: (route: Route) => void;
}

export default function Widget({
  close,
  open,
  chain,
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
    toChain: chain,
    fromChain: chain,
    fromToken: zeroAddress,
    toToken: '0x4200000000000000000000000000000000000006',
    theme: {
      palette: {
        primary: {
          main: `${pools[chain]?.hexcode ?? pools[mode.id].hexcode}`
        }
      },
      container: {
        border: `1px solid ${pools[chain]?.hexcode ?? pools[mode.id].hexcode}`,
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
    integrator: 'ionic_unwrapping',
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
          integrator="ionic_unwrapping"
          config={widgetConfig}
          chains={{ allow: [chain] }}
          tokens={{
            allow: [
              { address: zeroAddress, chainId: chain },
              {
                address: '0x4200000000000000000000000000000000000006',
                chainId: chain
              }
            ]
          }}
        />
      </div>
    </div>
  );
}

// export default dynamic(() => Promise.resolve(Widget), { ssr: false });
