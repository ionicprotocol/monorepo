import { useEffect } from 'react';
import { LiFiWidget, useWidgetEvents, WidgetEvent } from '@lifi/widget';
import { type Address, zeroAddress } from 'viem';
import { mode } from 'viem/chains';
import { Dialog, DialogContent } from '@ui/components/ui/dialog';
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

export default function SwapWidget({
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
        maxPriceImpact: 0.4,
        slippage: 0.005
      }
    },
    fee: 0.01,
    integrator: 'ionic',
    appearance: 'dark'
  };

  return (
    <Dialog
      open={open}
      onOpenChange={close}
    >
      <DialogContent
        className="max-w-[480px] p-0 bg-transparent border-0"
        hideCloseButton
      >
        <LiFiWidget
          integrator="ionic"
          config={widgetConfig}
        />
      </DialogContent>
    </Dialog>
  );
}
