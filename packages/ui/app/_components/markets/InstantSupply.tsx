/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

// import type { Route } from '@lifi/sdk';
import { LiFiWidget, useWidgetEvents, WidgetEvent } from '@lifi/widget';
import type { WidgetConfig } from '@lifi/widget';
import { useEffect, useState } from 'react';
import { formatUnits } from 'viem';
import { useAccount, useBalance } from 'wagmi';

interface IProps {
  // close: () => void;
  // open: boolean;
  amount?: string;
  handleInput: (val?: string) => void;
  handleUtilization: () => void;
  handleCollateralToggle: () => Promise<void>;
  startSupply: () => void;
  toToken: string;
}

type IStatus = 'COMPLETED' | 'FAIL' | 'LOSS' | 'START' | 'UPDATE';

export default function InstantSupply({
  // close,
  // open,
  toToken,
  handleInput,
  handleUtilization,
  handleCollateralToggle,
  startSupply
}: IProps) {
  const widgetConfig: WidgetConfig = {
    toChain: 34443,
    fromChain: 34443,
    fromToken: '0x0000000000000000000000000000000000000000',
    toToken,
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
    integrator: 'ionic.money',
    appearance: 'dark'
  };

  const [widgetStatus, setWidgetStatus] = useState<IStatus>();
  const widgetEvents = useWidgetEvents();

  // ------------------ fetching balances
  const { address } = useAccount();
  const { data } = useBalance({
    address,
    token: toToken as `0x${string}`,
    query: {
      refetchInterval: 1000
    }
  });
  // console.log(data);
  useEffect(() => {
    const onRouteExecutionStarted = () => {
      // console.log('onRouteExecutionStarted fired.');
      setWidgetStatus('START');
    };
    const onRouteExecutionUpdated = () => {
      // console.log('onRouteExecutionUpdated fired.');
      setWidgetStatus('UPDATE');
    };
    const onRouteExecutionCompleted = async () => {
      // console.log('onRouteExecutionCompleted fired.');
      setWidgetStatus('COMPLETED');
      // set balance to max ------
      if (!data) return;
      // eslint-disable-next-line no-console
      console.log('handle input maxeed --------- ');
      handleInput(formatUnits(data?.value, data?.decimals));
      handleUtilization();
      await handleCollateralToggle();
      startSupply();
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
  }, [
    data,
    handleCollateralToggle,
    handleInput,
    handleUtilization,
    startSupply,
    widgetEvents
  ]);

  return (
    <div
      className={`  items-center justify-center transition-opacity duration-300 overflow-y-auto animate-fade-in animated backdrop-blur-sm w-full`}
    >
      <div
        className={`w-full h-max relative flex flex-col items-center justify-center mx-auto ${widgetStatus}`}
        // ref={newRef}
      >
        <LiFiWidget
          integrator="Ionic Money"
          config={widgetConfig}
        />
        {/* <button
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
        </button> */}
      </div>
    </div>
  );
}
