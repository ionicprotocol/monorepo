import { useEffect, useState } from 'react';

import { LiFiWidget, useWidgetEvents, WidgetEvent } from '@lifi/widget';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { mode } from 'viem/chains';

import { Dialog, DialogContent, DialogTitle } from '@ui/components/ui/dialog';
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
        maxPriceImpact: 0.4,
        slippage: 0.005
      }
    },
    fee: 0.01,
    integrator: 'ionic',
    appearance: 'dark'
  };

  const [widgetStatus, setWidgetStatus] = useState<IStatus>();
  const widgetEvents = useWidgetEvents();

  useEffect(() => {
    const onRouteExecutionStarted = () => setWidgetStatus('START');
    const onRouteExecutionUpdated = () => setWidgetStatus('UPDATE');
    const onRouteExecutionCompleted = () => setWidgetStatus('COMPLETED');
    const onRouteExecutionFailed = () => setWidgetStatus('FAIL');
    const onRouteHighValueLoss = () => setWidgetStatus('LOSS');

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
    <Dialog
      open={open}
      onOpenChange={close}
    >
      <DialogContent
        className="bg-transparent max-w-fit p-0 border-none"
        hideCloseButton
      >
        <VisuallyHidden.Root asChild>
          <DialogTitle>Buy Token Widget</DialogTitle>
        </VisuallyHidden.Root>
        <div className="p-4">
          <LiFiWidget
            integrator="ionic"
            config={widgetConfig}
          />
          <button
            className={`my-4 py-1.5 text-sm text-black w-full ${
              pools[+chain].accentbg ?? pools[mode.id].accentbg
            } rounded-md`}
            onClick={() => {
              if (widgetStatus === 'COMPLETED' || widgetStatus === 'FAIL') {
                close();
              }
            }}
          >
            {widgetStatus
              ? 'Step 1 ' + widgetStatus.toLowerCase()
              : 'Lets Start'}{' '}
            {widgetStatus === 'COMPLETED' && '🎉'}{' '}
            {widgetStatus === 'FAIL' && '😵'} {widgetStatus === 'START' && '🤠'}{' '}
            {widgetStatus === 'LOSS' && '📉'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
