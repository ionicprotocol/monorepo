/* eslint-disable @next/next/no-img-element */
'use client';

import { collateralSwapAbi } from '@ionicprotocol/sdk';
import {
  createConfig,
  getQuote,
  type LiFiStep,
  type QuoteRequest
} from '@lifi/sdk';
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js';
// import { usePathname, useRouter} from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
// import { useCallback, useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  formatEther,
  formatUnits,
  type Hex,
  parseEther,
  parseUnits,
  type Address
} from 'viem';
import { useAccount, useChainId, useWriteContract } from 'wagmi';

import MaxDeposit from './MaxDeposit';
import SwapTo from './SwapTo';

// import { useDebounce } from '@ui/hooks/useDebounce';
import { useDebounce } from '@ui/hooks/useDebounce';
import { useSupplyCap } from '@ui/hooks/useSupplyCap';
import type { MarketData } from '@ui/types/TokensDataMap';
import SliderComponent from 'ui/app/_components/popup/Slider';
import type { IBal } from 'ui/app/_components/stake/MaxDeposit';
import { donutoptions, getDonutData } from 'ui/app/_constants/mock';

createConfig({
  integrator: 'ionic',
  apiKey:
    '7961bbe5-f199-4e58-9f08-006ede209dca.185a3a07-c467-4bac-ae68-182bff954c99'
});

interface IProp {
  params?: { tokenaddress: string };
  swapRef: any;
  toggler: () => void;
  swappedFromAsset: MarketData;
  swappedToAssets: MarketData[];
  swapOpen: boolean;
  comptroller: Address;
}

//------misc---------
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export default function CollateralSwapPopup({
  swapRef,
  toggler,
  swappedFromAsset,
  swappedToAssets,
  comptroller
}: IProp) {
  const [utilization, setUtilization] = useState<number>(0);
  const [swapFromAmount, setSwapFromAmount] = useState<string>('');
  const [swapToAmount, setSwapToAmount] = useState<string>('');
  const [lifiQuote, setLifiQuote] = useState<LiFiStep>();
  const [conversionRate, setConversionRate] = useState<string>('100');
  const [maxTokens, setMaxTokens] = useState<IBal>({
    value: BigInt(0),
    decimals: 18
  });
  const chainId = useChainId();
  const searchParams = useSearchParams();
  const querychain = searchParams.get('chain');
  const chain = querychain ? querychain : String(chainId);
  const queryToken = searchParams.get('token');
  // const pathname = usePathname();
  // const swappedToTokenQuery = queryToken
  //   ? queryToken !== swappedToAsset.map((asset) => asset.underlyingSymbol)[0]
  //   : '';

  const swapFromAmountUnderlying = useMemo(() => {
    if (!swapFromAmount) return '0';
    const decimals = swappedFromAsset?.underlyingDecimals ?? 18;
    return formatUnits(
      (parseUnits(swapFromAmount, decimals) * swappedFromAsset.exchangeRate) /
        10n ** BigInt(decimals),
      decimals
    );
  }, [swapFromAmount, swappedFromAsset]);

  const debouncedSwapFromAmountUnderlying = useDebounce(
    swapFromAmountUnderlying,
    2000
  );

  const swappedToTokenQuery =
    queryToken ??
    swappedToAssets
      .filter(
        (asset) => asset.underlyingSymbol !== swappedFromAsset.underlyingSymbol
      )
      .map((asset) => asset.underlyingSymbol)[0];

  const swappedToAsset =
    swappedToAssets &&
    swappedToAssets.find(
      (asset) => asset.underlyingSymbol === swappedToTokenQuery
    );

  const { data: supplyCap } = useSupplyCap({
    chainId: +chain,
    market: swappedToAsset,
    comptroller
  });

  // const router = useRouter();
  // const createQueryString = useCallback(
  //   (name: string, value: string) => {
  //     const params = new URLSearchParams(searchParams.toString());
  //     params.set(name, value);

  //     return params.toString();
  //   },
  //   [searchParams]
  // );
  // const router = useRouter();
  // useEffect(() => {
  //   const otherToken = swappedToAsset
  //     .filter(
  //       (asset) =>
  //         asset.underlyingSymbol !== swappedFromAsset.underlyingSymbol &&
  //         swappedToTokenQuery !== swappedFromAsset.underlyingSymbol
  //     )
  //     .map((asset) => asset.underlyingSymbol)[0];
  //     console.log(otherToken)
  //   if (swappedToTokenQuery === swappedFromAsset.underlyingSymbol && otherToken)
  //     router.push(pathname + '?' + createQueryString('token', otherToken));
  // }, [
  //   createQueryString,
  //   pathname,
  //   router,
  //   swapOpen,
  //   swappedFromAsset.underlyingSymbol,
  //   swappedToAsset,
  //   swappedToTokenQuery
  // ]);
  // console.log(swappedToTokenAddress);
  const { isConnected } = useAccount();
  // const abc = lifiQuote;
  useEffect(() => {
    if (!swapFromAmount) return;
    const percent =
      (+swapFromAmount /
        Number(formatUnits(maxTokens.value, maxTokens.decimals))) *
      100;
    setUtilization(Number(percent.toFixed(0)));
  }, [maxTokens, swapFromAmount]);

  // const delayedswapFromToken = useDebounce(swapFromToken, 2000) ?? BigInt(0);  this needs to get fixed
  useEffect(() => {
    const fetchQuote = async () => {
      if (
        !swappedFromAsset ||
        !swappedToAsset ||
        parseEther(debouncedSwapFromAmountUnderlying) === BigInt(0)
      )
        return;

      const quoteRequest: QuoteRequest = {
        fromChain: chain,
        toChain: chain,
        fromToken: swappedFromAsset?.underlyingToken,
        toToken: swappedToAsset?.underlyingToken,
        //@ts-ignore
        fromAmount: parseUnits(
          debouncedSwapFromAmountUnderlying,
          swappedFromAsset?.underlyingDecimals ?? 18
        ), // 10 USDC needs to get delayed
        // The address from which the tokens are being transferred.
        fromAddress: '0x552008c0f6870c2f77e5cC1d2eb9bdff03e30Ea0',
        skipSimulation: true,
        integrator: 'ionic'
      };
      const quote = await getQuote(quoteRequest);
      // eslint-disable-next-line no-console
      console.log('🚀 ~ fetchQuote ~ quote:', quote);
      setLifiQuote(quote);
      setSwapToAmount(quote?.estimate?.toAmount);
      setConversionRate(
        (
          (Number(quote?.estimate?.fromAmountUSD) /
            Number(quote?.estimate?.toAmountUSD)) *
          100
        ).toLocaleString('en-US', { maximumFractionDigits: 2 })
      );
    };
    fetchQuote();
  }, [
    chain,
    swapFromAmount,
    swappedFromAsset,
    swappedToAssets,
    swappedToAsset,
    debouncedSwapFromAmountUnderlying
  ]);

  const { writeContractAsync, isPending, isError, isSuccess } =
    useWriteContract();
  console.log('🚀 ~ isSuccess:', isSuccess);
  console.log('🚀 ~ isError:', isError);
  console.log('🚀 ~ isPending:', isPending);
  const handleSwitch = async () => {
    console.log('Switching');
    await writeContractAsync({
      address: '0x028227c4dd1e5419d11Bb6fa6e661920c519D4F5',
      abi: collateralSwapAbi,
      functionName: 'swapCollateral',
      args: [
        BigInt(swapFromAmountUnderlying),
        swappedFromAsset?.cToken,
        swappedToAsset!.cToken,
        lifiQuote?.transactionRequest?.to as Address,
        lifiQuote!.transactionRequest!.data as Hex
      ]
    });
  };

  return (
    <div
      className={`w-full bg-black/40 backdrop-blur-md z-50 flex items-center justify-center min-h-screen fixed top-0 left-0`}
    >
      <div
        ref={swapRef}
        className=" flex flex-col items-start justify-start transition-all duration-200 ease-linear bg-grayone w-[85%] sm:w-[55%] md:w-[40%] mx-auto my-10 rounded-md py-4 px-8 gap-y-1 "
      >
        <div className={` flex items-center justify-between w-full mb-3`}>
          <span className="text-lg font-bold text-white">Collateral Swap</span>
          <img
            alt="close"
            className={` top-4 right-4 h-5 w-5 cursor-pointer z-20 opacity-70`}
            onClick={() => toggler()}
            src="/img/assets/close.png"
          />
        </div>
        <div className={` text-xs  flex items-center justify-between w-full`}>
          <span className=" text-white/50 ">CONVERSION RATE</span>
          <span className=" ">{conversionRate}%</span>
        </div>
        <div className={` text-xs  flex items-center justify-between w-full`}>
          <span className=" text-white/50 ">FEES</span>
          <span className=" ">
            {lifiQuote ? lifiQuote?.estimate?.feeCosts?.[0]?.amountUSD : ''} USD
          </span>
        </div>
        <div className="h-[2px] w-full mx-auto bg-white/10 my-2.5 " />
        <div className="w-full">
          <MaxDeposit
            headerText={'Wallet Balance'}
            amount={swapFromAmountUnderlying}
            tokenName={swappedFromAsset?.underlyingSymbol.toLowerCase()}
            token={swappedFromAsset?.cToken}
            handleInput={(val?: string) => setSwapFromAmount(val as string)}
            // max="0"
            chain={+chain}
            setMaxTokenForUtilization={setMaxTokens}
            exchangeRate={swappedFromAsset?.exchangeRate}
          />
          <SwapTo
            headerText={'Swap To'}
            amount={formatUnits(
              BigInt(swapToAmount),
              swappedToAsset?.underlyingDecimals ?? 18
            )}
            tokenName={swappedToTokenQuery}
            token={swappedToAsset?.cToken}
            // handleInput={(val?: string) => setSwapToToken(val as string)}
            tokenSelector={true}
            tokenArr={
              swappedToAssets &&
              swappedToAssets
                .filter(
                  (asset) =>
                    asset.underlyingSymbol !==
                    swappedFromAsset?.underlyingSymbol
                )
                .map((asset) => asset.underlyingSymbol)
            }
          />
          <div className={`my-6 w-full`}>
            <SliderComponent
              currentUtilizationPercentage={Number(utilization.toFixed(0))}
              handleUtilization={(val?: number) => {
                if (!val && !isConnected) return;
                const percentval =
                  (Number(val) / 100) *
                  Number(
                    formatEther(BigInt(maxTokens.value ?? swapFromAmount))
                  );
                setSwapFromAmount(percentval.toString());
                setUtilization(val ?? 0);
              }}
            />
          </div>
        </div>
        <div className="h-[2px] w-full mx-auto bg-white/10 my-2.5 " />
        <div className={` text-xs  flex items-center justify-between w-full`}>
          <span className=" text-white/50 ">HEALTH FACTOR</span>
          <span className=" ">69</span>
        </div>
        <div className="h-[2px] w-full mx-auto bg-white/10 my-2.5 " />
        <div className={` text-xs  flex items-center justify-between w-full`}>
          <span className=" text-white/50 ">MARKET SUPPLY BALANCE</span>
          <span className=" ">234 {'->'} 648</span>
        </div>
        <div className={` text-xs  flex items-center justify-between w-full`}>
          <span className=" text-white/50 ">COLLATERAL FACTOR</span>
          <span className=" ">545 {'->'} 34</span>
        </div>
        <div className="h-[2px] w-full mx-auto bg-white/10 my-2.5 " />
        <div className={`w-full flex items-center justify-center gap-5`}>
          <div className={` w-14 h-14`}>
            <Doughnut
              data={getDonutData(
                swappedToAsset?.totalSupplyFiat ?? 0,
                supplyCap?.usdCap ?? 100
              )}
              options={donutoptions}
              updateMode="resize"
            />
          </div>

          <div className={`w-[40%] flex gap-5 items-start justify-start `}>
            <div className={`flex flex-col items-start justify-center gap-y-1`}>
              <p className={`text-white/60 text-[10px]`}>TOTAL SUPPLIED</p>
              <p className={`font-semibold`}>
                {(swappedToAsset
                  ? Number(
                      formatUnits(
                        swappedToAsset?.totalSupply,
                        swappedToAsset?.underlyingDecimals
                      )
                    )
                  : 0
                ).toLocaleString('en-US', {
                  maximumFractionDigits: 0
                })}{' '}
                of{' '}
                {(supplyCap?.tokenCap ?? 0).toLocaleString('en-US', {
                  maximumFractionDigits: 0
                })}{' '}
                {swappedToAsset?.underlyingSymbol}
              </p>
              <p className={`font-semibold text-[8px] text-white/30`}>
                $
                {(swappedToAsset?.totalSupplyFiat ?? 0).toLocaleString(
                  'en-US',
                  {
                    maximumFractionDigits: 0
                  }
                )}{' '}
                of $
                {(supplyCap?.usdCap ?? 0).toLocaleString('en-US', {
                  maximumFractionDigits: 0
                })}
              </p>
            </div>
          </div>
        </div>
        <div className="h-[2px] w-full mx-auto bg-white/10 my-2.5 " />
        {/* <div className={` text-xs  flex items-center justify-between w-full`}>
        <span className=" text-white/50 ">Slippage</span>
        <span className=" ">0.2%</span>
      </div> */}
        <p className={`text-xs mb-3`}>0.01% Slippage Tolerance</p>
        <button
          className={`bg-accent py-1 px-3 w-full text-sm rounded-md text-black`}
          onClick={handleSwitch}
          disabled={switchInProgress}
        >
          SWITCH {swappedFromAsset?.underlyingSymbol} TO{' '}
          {swappedToAsset?.underlyingSymbol}{' '}
        </button>
      </div>
    </div>
  );
}

/*
 <div className={``}> </div>
*/
