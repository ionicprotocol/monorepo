/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

// import type { Route } from '@lifi/sdk';
import { LiFiWidget, useWidgetEvents, WidgetEvent } from '@lifi/widget';
import type { WidgetConfig } from '@lifi/widget';
import { useEffect, useRef, useState } from 'react';

const widgetConfig: WidgetConfig = {
  toChain: 34443,
  fromChain: 34443,
  fromToken: '0x0000000000000000000000000000000000000000',
  toToken: '0x18470019bf0e94611f15852f7e93cf5d65bc34ca',
  theme: {
    palette: {
      primary: { main: '#3bff89' }
    },
    container: {
      border: '1px solid #3bff89ff',
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

interface IProps {
  close: () => void;
  open: boolean;
}

type IStatus = 'COMPLETED' | 'FAIL' | 'LOSS' | 'START' | 'UPDATE';

export default function Widget({ close, open }: IProps) {
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
          integrator="Ionic Money"
          config={widgetConfig}
        />
        <button
          className={`my-4 py-1.5 text-sm text-black w-full bg-accent rounded-md`}
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
