/* eslint-disable @next/next/no-img-element */
'use client';

import { collateralSwapAbi } from '@ionicprotocol/sdk';
import { createConfig, getQuote, type QuoteRequest } from '@lifi/sdk';
import { useQuery } from '@tanstack/react-query';
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
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import {
  type Address,
  formatEther,
  formatUnits,
  type Hex,
  parseUnits
} from 'viem';
import { useAccount, useChainId, useWriteContract } from 'wagmi';

import MaxDeposit from './MaxDeposit';
import SwapTo from './SwapTo';

import SliderComponent from '@ui/app/_components/popup/Slider';
import TransactionStepsHandler, {
  useTransactionSteps
} from '@ui/app/_components/popup/TransactionStepsHandler';
import type { IBal } from '@ui/app/_components/stake/MaxDeposit';
import { donutoptions, getDonutData } from '@ui/app/_constants/mock';
import { INFO_MESSAGES } from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useHealthFactor } from '@ui/hooks/pools/useHealthFactor';
import { useDebounce } from '@ui/hooks/useDebounce';
import { useSupplyCap } from '@ui/hooks/useSupplyCap';
import type { MarketData } from '@ui/types/TokensDataMap';

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

const DEFAULT_SLIPPAGE_TOL = 0.005;

export default function CollateralSwapPopup({
  swapRef,
  toggler,
  swappedFromAsset,
  swappedToAssets,
  comptroller
}: IProp) {
  const [utilization, setUtilization] = useState<number>(0);
  const [conversionRate, setConversionRate] = useState<string>('-');
  const [swapFromAmount, setSwapFromAmount] = useState<string>('');
  const [maxTokens, setMaxTokens] = useState<IBal>({
    value: BigInt(0),
    decimals: swappedFromAsset.underlyingDecimals
  });
  const chainId = useChainId();
  const searchParams = useSearchParams();
  const querychain = searchParams.get('chain');
  const chain = querychain ? querychain : String(chainId);
  const queryToken = searchParams.get('token');
  const { data: healthFactor } = useHealthFactor(comptroller, +chain);

  const { getSdk, currentSdk, address } = useMultiIonic();
  const sdk = getSdk(+chain);
  const collateralSwapContract =
    sdk?.chainDeployment[`CollateralSwap-${comptroller}`];

  const swapFromAmountCTokens = useMemo(() => {
    if (!swapFromAmount) return 0n;
    const decimals = swappedFromAsset?.underlyingDecimals ?? 18;
    return (
      (parseUnits(swapFromAmount, decimals) * 10n ** BigInt(18)) /
      swappedFromAsset.exchangeRate
    );
  }, [swapFromAmount, swappedFromAsset]);

  const debouncedSwapFromAmount = useDebounce(swapFromAmount, 2000);

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

  const resetTransactionSteps = () => {
    // refetchUsedQueries();
    upsertTransactionStep(undefined);
    // initiateCloseAnimation();
  };
  const { isConnected } = useAccount();

  const {
    isLoading: isLoadingLifiQuote,
    data: lifiQuote,
    isFetching,
    isPending: isPendingLiFi,
    isRefetching,
    isError,
    error
  } = useQuery({
    queryKey: ['lifiQuote'],
    queryFn: async () => {
      const quoteRequest: QuoteRequest = {
        fromChain: chain,
        toChain: chain,
        fromToken: swappedFromAsset.underlyingToken,
        toToken: swappedToAsset!.underlyingToken,
        fromAmount: parseUnits(
          debouncedSwapFromAmount,
          swappedFromAsset?.underlyingDecimals ?? 18
        ).toString(),
        fromAddress: collateralSwapContract!.address,
        skipSimulation: true,
        integrator: 'ionic',
        fee: '0.005',
        slippage: DEFAULT_SLIPPAGE_TOL
      };
      const quote = await getQuote(quoteRequest);
      return quote;
    },
    enabled:
      !!collateralSwapContract &&
      !!swappedToAsset &&
      parseUnits(
        debouncedSwapFromAmount,
        swappedFromAsset.underlyingDecimals ?? 18
      ) > 0n
  });

  useEffect(() => {
    if (isError) {
      console.error('Error fetching quote', error);
      if (error && (error as Error).message.includes('429')) {
        toast.error('Rate limit exceeded, please try again later');
      } else {
        toast.error('Error fetching quote');
      }
    }
  }, [isError, error]);

  useEffect(() => {
    if (lifiQuote?.estimate) {
      setConversionRate(
        (
          ((Number(lifiQuote?.estimate?.toAmountUSD) -
            Number(lifiQuote?.estimate?.fromAmountUSD)) /
            Number(lifiQuote?.estimate?.fromAmountUSD)) *
          100
        ).toLocaleString('en-US', { maximumFractionDigits: 2 })
      );
    }
  }, [lifiQuote]);

  useEffect(() => {
    if (swapFromAmount) {
      const percent =
        (+swapFromAmount /
          Number(formatUnits(maxTokens.value, maxTokens.decimals))) *
        100;
      setUtilization(Number(percent.toFixed(0)));
    }
  }, [maxTokens, swapFromAmount]);

  const { writeContractAsync, isPending } = useWriteContract();
  const { addStepsForAction, transactionSteps, upsertTransactionStep } =
    useTransactionSteps();

  const handleSwitch = async () => {
    if (!currentSdk || !collateralSwapContract?.address || !address) return;
    let currentTransactionStep = 0;

    addStepsForAction([
      {
        error: false,
        message: INFO_MESSAGES.SWAP.APPROVE,
        success: false
      },
      {
        error: false,
        message: INFO_MESSAGES.SWAP.SWAPPING,
        success: false
      }
    ]);

    try {
      const token = currentSdk.getEIP20TokenInstance(
        swappedFromAsset.cToken,
        currentSdk.publicClient as any
      );
      const hasApprovedEnough =
        (await token.read.allowance([
          address,
          collateralSwapContract.address as Address
        ])) >= swapFromAmountCTokens;

      if (!hasApprovedEnough) {
        const tx = await currentSdk.approve(
          collateralSwapContract.address as Address,
          swappedFromAsset.cToken,
          (swapFromAmountCTokens * 105n) / 100n
        );

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            txHash: tx
          }
        });

        await currentSdk.publicClient.waitForTransactionReceipt({
          hash: tx,
          confirmations: 2
        });

        // wait for 5 seconds to resolve timing issue
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          success: true
        }
      });
      currentTransactionStep++;

      const tx = await writeContractAsync({
        address: collateralSwapContract!.address as Address,
        abi: collateralSwapAbi,
        functionName: 'swapCollateral',
        args: [
          parseUnits(swapFromAmount, swappedFromAsset.underlyingDecimals),
          swappedFromAsset!.cToken,
          swappedToAsset!.cToken,
          lifiQuote!.transactionRequest!.to as Address,
          lifiQuote!.transactionRequest!.data as Hex
        ]
      });
      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          txHash: tx
        }
      });

      await currentSdk.publicClient.waitForTransactionReceipt({
        hash: tx
      });

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          success: true
        }
      });

      toast.success(
        `Swapped ${swappedFromAsset.underlyingSymbol} to ${swappedToAsset?.underlyingSymbol}`
      );
    } catch (error) {
      console.error('handleSwitch ~ error:', error);
      toast.error('Error while supplying!');

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          error: true
        }
      });
    }
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
          <span className=" text-white/50 ">PRICE IMPACT</span>
          <span className=" ">{conversionRate + '%'}</span>
        </div>
        <div className={` text-xs  flex items-center justify-between w-full`}>
          <span className=" text-white/50 ">FEES</span>
          <span className=" ">
            {lifiQuote
              ? lifiQuote?.estimate?.feeCosts?.reduce(
                  (acc, curr) => acc + Number(curr.amountUSD),
                  0
                ) + ' USD'
              : '-'}
          </span>
        </div>
        <div className="h-[2px] w-full mx-auto bg-white/10 my-2.5 " />
        <div className="w-full">
          <MaxDeposit
            headerText={'Supply Balance'}
            amount={swapFromAmount}
            tokenName={swappedFromAsset.underlyingSymbol.toLowerCase()}
            token={swappedFromAsset.cToken}
            handleInput={(val?: string) => setSwapFromAmount(val as string)}
            // max="0"
            chain={+chain}
            setMaxTokenForUtilization={setMaxTokens}
            exchangeRate={swappedFromAsset.exchangeRate}
            footerText={'$' + (lifiQuote?.estimate?.fromAmountUSD ?? '0')}
            decimals={swappedFromAsset.underlyingDecimals}
          />

          <SwapTo
            headerText={'Swap To'}
            amount={formatUnits(
              BigInt(lifiQuote?.estimate?.toAmount ?? '0'),
              swappedToAsset?.underlyingDecimals ?? 18
            )}
            isLoading={isLoadingLifiQuote}
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
            footerText={'$' + (lifiQuote?.estimate?.toAmountUSD ?? '0')}
          />
          <div className={`my-6 w-full`}>
            <SliderComponent
              currentUtilizationPercentage={Number(utilization.toFixed(0))}
              handleUtilization={(val?: number) => {
                if (!val && !isConnected) return;
                const percentval =
                  (Number(val) / 100) *
                  Number(
                    maxTokens.value
                      ? formatUnits(BigInt(maxTokens.value), maxTokens.decimals)
                      : swapFromAmount
                  );
                setSwapFromAmount(
                  percentval.toLocaleString('en-US', {
                    maximumFractionDigits: 3
                  })
                );
                setUtilization(val ?? 0);
              }}
            />
          </div>
        </div>
        <div className="h-[2px] w-full mx-auto bg-white/10 my-2.5 " />
        <div className={` text-xs  flex items-center justify-between w-full`}>
          <span className=" text-white/50 ">HEALTH FACTOR</span>
          <span className=" ">{healthFactor ?? '-'}</span>
        </div>
        <div className="h-[2px] w-full mx-auto bg-white/10 my-2.5 " />
        <div className={` text-xs  flex items-center justify-between w-full`}>
          <span className=" text-white/50 ">
            MARKET SUPPLY BALANCE {swappedFromAsset.underlyingSymbol}
          </span>
          <span className=" ">
            {Number(
              formatUnits(
                swappedFromAsset.supplyBalance,
                swappedFromAsset.underlyingDecimals
              )
            ).toLocaleString('en-US', {
              maximumFractionDigits: 2
            })}{' '}
            {'->'}{' '}
            {Math.abs(
              Number(
                formatUnits(
                  swappedFromAsset.supplyBalance -
                    parseUnits(
                      swapFromAmount ?? '0',
                      swappedFromAsset.underlyingDecimals
                    ),
                  swappedFromAsset.underlyingDecimals
                )
              )
            ).toLocaleString('en-US', {
              maximumFractionDigits: 2
            })}
          </span>
        </div>
        <div className={` text-xs  flex items-center justify-between w-full`}>
          {swappedToAsset && (
            <>
              <span className=" text-white/50 ">
                MARKET SUPPLY BALANCE {swappedToAsset.underlyingSymbol}
              </span>
              <span className=" ">
                {Number(
                  formatUnits(
                    swappedToAsset.supplyBalance,
                    swappedToAsset.underlyingDecimals
                  )
                ).toLocaleString('en-US', {
                  maximumFractionDigits: 2
                })}{' '}
                {'->'}{' '}
                {Number(
                  formatUnits(
                    swappedToAsset.supplyBalance +
                      BigInt(lifiQuote?.estimate?.toAmount ?? '0'),
                    swappedToAsset.underlyingDecimals
                  )
                ).toLocaleString('en-US', {
                  maximumFractionDigits: 2
                })}
              </span>
            </>
          )}
        </div>
        {swappedToAsset && (
          <div className={` text-xs  flex items-center justify-between w-full`}>
            <span className=" text-white/50 ">COLLATERAL FACTOR</span>
            <span className=" ">
              {Number(formatEther(swappedFromAsset.collateralFactor)) * 100}%{' '}
              {'->'}{' '}
              {Number(formatEther(swappedToAsset.collateralFactor)) * 100}%
            </span>
          </div>
        )}
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
        <p className={`text-xs mb-3`}>
          {DEFAULT_SLIPPAGE_TOL * 100}% Slippage Tolerance
        </p>
        {transactionSteps.length > 0 ? (
          <TransactionStepsHandler
            chainId={chainId}
            resetTransactionSteps={resetTransactionSteps}
            transactionSteps={transactionSteps}
          />
        ) : (
          <button
            className={`bg-accent py-1 px-3 w-full text-sm rounded-md text-black disabled:opacity-50`}
            onClick={handleSwitch}
            disabled={isPending || !lifiQuote}
          >
            SWITCH {swappedFromAsset?.underlyingSymbol} TO{' '}
            {swappedToAsset?.underlyingSymbol}{' '}
          </button>
        )}
      </div>
    </div>
  );
}

/*
 <div className={``}> </div>
*/
