/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

// import type { Route } from '@lifi/sdk';
import { LiFiWidget } from '@lifi/widget';
import type { WidgetConfig } from '@lifi/widget';
// import { useEffect, useState } from 'react';
// import { formatUnits } from 'viem';
// import { useAccount, useBalance } from 'wagmi';

import ResultHandler from '../ResultHandler';

interface IProps {
  // close: () => void;
  // open: boolean;
  amount?: string;
  handleInput?: (val?: string) => void;
  handleUtilization?: () => void;
  handleCollateralToggle?: () => Promise<void>;
  startSupply?: () => Promise<void>;
  toToken?: string;
}

// type IStatus = 'COMPLETED' | 'FAIL' | 'LOSS' | 'START' | 'UPDATE';

export default function InstantSupply({
  // close,
  // open,
  toToken
}: IProps) {
  const widgetConfig: WidgetConfig = {
    toChain: 34443,
    fromChain: 34443,
    fromToken: '0x0000000000000000000000000000000000000000',
    toToken: toToken ?? '0x0000000000000000000000000000000000000000',
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

  // ------------------ fetching balances
  // const [widgetLoading, setWidgetLoading] = useState<boolean>(true);
  // const { address } = useAccount();
  // const { data } = useBalance({
  //   address,
  //   token: toToken as `0x${string}`,
  //   query: {
  //     refetchInterval: 1000
  //   }
  // });
  // console.log(data);

  return (
    <div
      className={`  items-center justify-center transition-opacity duration-300 overflow-y-auto animate-fade-in animated backdrop-blur-sm w-full`}
    >
      <div
        className={`w-full h-max relative flex flex-col items-center justify-center mx-auto `}
        // ref={newRef}
      >
        <ResultHandler isLoading={toToken === '' ? true : false}>
          <LiFiWidget
            integrator="Ionic Money"
            config={widgetConfig}
          />
        </ResultHandler>
      </div>
    </div>
  );
}

/*

containsSwitchChain
: 
false
fromAddress
: 
"0x26f52740670Ef678b254aa3559d823C29122E9c2"
fromAmount
: 
"100000000000000"
fromAmountUSD
: 
"0.30"
fromChainId
: 
34443
fromToken
: 
{address: '0x0000000000000000000000000000000000000000', chainId: 34443, symbol: 'ETH', decimals: 18, name: 'ETH', …}
gasCostUSD
: 
"0.01"
id
: 
"0x0c5fb64b98459cba4fc6424218337fe31157a832f9456420bc04b9f9ca1c7e80"
insurance
: 
{state: 'NOT_INSURABLE', feeAmountUsd: '0'}
steps
: 
[{…}]
tags
: 
(3) ['RECOMMENDED', 'CHEAPEST', 'FASTEST']
toAddress
: 
"0x26f52740670Ef678b254aa3559d823C29122E9c2"
toAmount
: 
"484290343675935"
toAmountMin
: 
"481868891957555"
toAmountUSD
: 
"0.30"
toChainId
: 
34443
*/
