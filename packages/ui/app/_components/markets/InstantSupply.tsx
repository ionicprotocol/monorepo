/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { type Route } from '@lifi/sdk';
// import type { Route } from '@lifi/sdk';
import { LiFiWidget, useWidgetEvents, WidgetEvent } from '@lifi/widget';
import type { WidgetConfig } from '@lifi/widget';
// import { useEffect, useState } from 'react';
// import { formatUnits } from 'viem';
// import { useAccount, useBalance } from 'wagmi';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { erc20Abi } from 'viem';
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWalletClient
} from 'wagmi';

import ResultHandler from '../ResultHandler';

import { ABI } from '@ui/constants/mintCrossChainABI';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

interface IProps {
  // close: () => void;
  // open: boolean;
  amount?: string;
  handleInput?: (val?: string) => void;
  handleUtilization?: () => void;
  handleCollateralToggle?: () => Promise<void>;
  startSupply?: () => Promise<void>;
  toToken?: string;
  cToken?: string;
}

// type IStatus = 'COMPLETED' | 'FAIL' | 'LOSS' | 'START' | 'UPDATE';

export default function InstantSupply({
  // close,
  // open,
  toToken,
  cToken
}: IProps) {
  const widgetEvents = useWidgetEvents();
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
  const searchParams = useSearchParams();
  const chain = searchParams.get('chain');
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  // console.log(selectedMarketData);
  useEffect(() => {
    const onRouteExecutionStarted = () => {
      // console.log('onRouteExecutionStarted fired.');
      // setWidgetStatus('START')
    };
    const onRouteExecutionUpdated = () => {
      // console.log('onRouteExecutionUpdated fired.');
      // setWidgetStatus('UPDATE');
    };
    const onRouteExecutionCompleted = async (route: Route) => {
      // eslint-disable-next-line no-console
      console.log('-----------------------------');
      try {
        if (!isConnected) {
          console.error('Not connected');
          return;
        }
        const switched = await handleSwitchOriginChain(
          Number(chain) as number,
          chainId
        );
        if (!switched) return;

        const args = {
          amountToApprove: BigInt(route?.toAmountMin) as unknown as bigint,
          spender: cToken as `0x${string}`,
          abi: ABI
        };
        // console.log({ args });
        // eslint-disable-next-line no-console
        console.log('approval started');
        const approval = await walletClient!.writeContract({
          abi: erc20Abi,
          account: walletClient?.account,
          address: route.toToken.address as `0x${string}`,
          args: [args.spender, args.amountToApprove],
          functionName: 'approve'
        });

        const approvalhash = await publicClient?.waitForTransactionReceipt({
          hash: approval
        });

        // eslint-disable-next-line no-console
        console.log({ approvalhash });
        // eslint-disable-next-line no-console
        console.log('minting started');
        const tx = await walletClient!.writeContract({
          abi: args.abi,
          account: walletClient?.account,
          address: args.spender,
          args: [args.amountToApprove],
          functionName: 'mint'
        });
        // eslint-disable-next-line no-console
        console.log('Transaction Hash --->>>', tx);
        if (!tx) return;
        const transaction = await publicClient?.waitForTransactionReceipt({
          hash: tx
        });
        // eslint-disable-next-line no-console
        console.log('Transaction --->>>', transaction);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      }
      // eslint-disable-next-line no-console
      console.log('-----------------------------');
      // const amountToSet = formatUnits(
      //   BigInt(route?.toAmountMin),
      //   route?.toToken.decimals
      // );
      // setAmount(amountToSet);
      // handleUtilization();
      // setCurrentUtilizationPercentage(100);
      // eslint-disable-next-line no-console
      // console.log({ route, amountToSet, amount });
      // eslint-disable-next-line no-console
      // console.log('supply started');
      // await supplyAmount(true, amountToSet);
      // eslint-disable-next-line no-console
      // console.log('supply completed');
    };
    const onRouteExecutionFailed = () => {
      // console.log('onRouteExecutionFailed fired.');
      // setWidgetStatus('FAIL');
    };
    const onRouteHighValueLoss = () => {
      // console.log('onRouteHighValueLoss continued.');
      // setWidgetStatus('LOSS');
    };

    widgetEvents.on(WidgetEvent.RouteExecutionStarted, onRouteExecutionStarted);
    widgetEvents.on(WidgetEvent.RouteExecutionUpdated, onRouteExecutionUpdated);
    widgetEvents.on(
      WidgetEvent.RouteExecutionCompleted,
      onRouteExecutionCompleted
    );
    widgetEvents.on(WidgetEvent.RouteExecutionFailed, onRouteExecutionFailed);
    widgetEvents.on(WidgetEvent.RouteHighValueLoss, onRouteHighValueLoss);
    // setWidgetLoading(false);
    return () => widgetEvents.all.clear();
  }, [
    chainId,
    isConnected,
    publicClient,
    cToken,
    walletClient,
    widgetEvents,
    chain
  ]);
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
