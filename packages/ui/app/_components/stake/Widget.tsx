/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

// import type { Route } from '@lifi/sdk';
// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-imports
import { useEffect, useRef, useState } from 'react';

import { LiFiWidget, useWidgetEvents, WidgetEvent } from '@lifi/widget';
import { mode } from 'viem/chains';

import { pools } from '@ui/constants/index';
import { getToken } from '@ui/utils/getStakingTokens';

import type { WidgetConfig } from '@lifi/widget';

interface IProps {
  close: () => void;
  open: boolean;
  chain: number;
}

type IStatus = 'COMPLETED' | 'FAIL' | 'LOSS' | 'START' | 'UPDATE';

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
    fee: 0.01,
    // theme : { palette : "grey"},
    integrator: 'ionic',
    appearance: 'dark'
  };

  const [widgetStatus, setWidgetStatus] = useState<IStatus>();
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

  const widgetEvents = useWidgetEvents();

  // ...

  useEffect(() => {
    const onRouteExecutionStarted = () => {
      // console.log('onRouteExecutionStarted fired.');
      setWidgetStatus('START');
    };
    const onRouteExecutionUpdated = () => {
      // console.log('onRouteExecutionUpdated fired.');
      setWidgetStatus('UPDATE');
    };
    const onRouteExecutionCompleted = () => {
      // console.log('onRouteExecutionCompleted fired.');
      setWidgetStatus('COMPLETED');
    };
    const onRouteExecutionFailed = () => {
      // console.log('onRouteExecutionFailed fired.');
      setWidgetStatus('FAIL');
    };
    const onRouteHighValueLoss = () => {
      // console.log('onRouteHighValueLoss continued.');
      setWidgetStatus('LOSS');
    };

    widgetEvents.on(WidgetEvent.RouteExecutionStarted, onRouteExecutionStarted);
    widgetEvents.on(WidgetEvent.RouteExecutionUpdated, onRouteExecutionUpdated);
    widgetEvents.on(
      WidgetEvent.RouteExecutionCompleted,
      onRouteExecutionCompleted
    );
    widgetEvents.on(WidgetEvent.RouteExecutionFailed, onRouteExecutionFailed);
    widgetEvents.on(WidgetEvent.RouteHighValueLoss, onRouteHighValueLoss);

    return () => widgetEvents.all.clear();
  }, [widgetEvents]);

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
        <button
          className={`my-4 py-1.5 text-sm text-black w-full ${pools[+chain].accentbg ?? pools[mode.id].accentbg} rounded-md`}
          onClick={() => {
            (widgetStatus === 'COMPLETED' || widgetStatus === 'FAIL') &&
              close();
          }}
        >
          {widgetStatus ? 'Step 1 ' + widgetStatus.toLowerCase() : 'Lets Start'}{' '}
          {widgetStatus === 'COMPLETED' && '🎉'}{' '}
          {widgetStatus === 'FAIL' && '😵'} {widgetStatus === 'START' && '🤠'}{' '}
          {widgetStatus === 'LOSS' && '📉'}
        </button>
      </div>
    </div>
  );
}

// export default dynamic(() => Promise.resolve(Widget), { ssr: false });
