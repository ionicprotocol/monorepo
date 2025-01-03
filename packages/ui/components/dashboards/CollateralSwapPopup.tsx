/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useMemo, useState } from 'react';

import { useSearchParams } from 'next/navigation';

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

import SliderComponent from '@ui/components/dialogs/ManageMarket/Slider';
import TransactionStepsHandler, {
  useTransactionSteps
} from '@ui/components/dialogs/ManageMarket/TransactionStepsHandler';
import { INFO_MESSAGES } from '@ui/constants/index';
import { donutoptions, getDonutData } from '@ui/constants/market-details-chart';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useHealthFactor } from '@ui/hooks/pools/useHealthFactor';
import { useDebounce } from '@ui/hooks/useDebounce';
import { useSupplyCap } from '@ui/hooks/useSupplyCap';
import type { MarketData } from '@ui/types/TokensDataMap';

import SwapTo from './SwapTo';
import MaxDeposit from '../MaxDeposit';

import type { IBal } from './SwapTo';

import { collateralSwapAbi } from '@ionicprotocol/sdk/src';

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

// Replace the SlippageDropdown import with a simpler dropdown implementation
const SlippageSelector = ({
  onSlippageChange
}: {
  onSlippageChange: (value: number) => void;
}) => {
  return (
    <div className="flex items-center justify-between w-full text-xs pb-2">
      <span className="text-white/50">SLIPPAGE TOLERANCE</span>
      <select
        className="bg-graytwo text-white rounded px-2 py-1 text-xs"
        onChange={(e) => onSlippageChange(Number(e.target.value))}
        defaultValue="0.01"
      >
        <option value="0.001">0.1%</option>
        <option value="0.005">0.5%</option>
        <option value="0.01">1%</option>
        <option value="0.02">2%</option>
        <option value="0.05">5%</option>
      </select>
    </div>
  );
};

export default function CollateralSwapPopup({
  swapRef,
  toggler,
  swappedFromAsset,
  swappedToAssets,
  comptroller
}: IProp) {
  const [conversionRate, setConversionRate] = useState<string>('-');
  const [swapFromAmount, setSwapFromAmount] = useState<string>('');
  const [effectiveSlippage, setEffectiveSlippage] = useState<number>(0.01); // Default to 1%
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

  const handleSlippageChange = (newSlippage: number) => {
    setEffectiveSlippage(newSlippage);
  };

  const resetTransactionSteps = () => {
    upsertTransactionStep(undefined);
  };
  const { isConnected } = useAccount();

  const {
    isLoading: isLoadingLifiQuote,
    isFetching: isFetchingLifiQuote,
    data: lifiQuote,
    isError,
    error
  } = useQuery({
    queryKey: [
      'lifiQuote',
      debouncedSwapFromAmount,
      swappedFromAsset.underlyingToken,
      swappedToAsset?.underlyingToken
    ],
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
        slippage: effectiveSlippage
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
        className="flex flex-col items-start justify-start transition-all duration-200 ease-linear bg-grayone w-[85%] sm:w-[55%] md:w-[40%] mx-auto my-10 rounded-md max-h-[90vh]"
      >
        <div className="sticky top-0 bg-grayone w-full px-8 pt-4 z-10">
          <div className="flex items-center justify-between w-full mb-3">
            <span className="text-lg font-bold text-white">
              Collateral Swap
            </span>
            <img
              alt="close"
              className="h-5 w-5 cursor-pointer z-20 opacity-70"
              onClick={() => toggler()}
              src="/img/assets/close.png"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto w-full px-8">
          <div className="text-xs flex items-center justify-between w-full">
            <span className="text-white/50">PRICE IMPACT</span>
            <span className="">{conversionRate + '%'}</span>
          </div>
          <div className="text-xs flex items-center justify-between w-full">
            <span className="text-white/50">FEES</span>
            <span className="">
              {lifiQuote
                ? lifiQuote?.estimate?.feeCosts?.reduce(
                    (acc, curr) => acc + Number(curr.amountUSD),
                    0
                  ) + ' USD'
                : '-'}
            </span>
          </div>
          <div className="h-[2px] w-full mx-auto bg-white/10 my-2.5" />
          <div className="w-full">
            <MaxDeposit
              headerText={'Supply Balance'}
              amount={swapFromAmount}
              tokenName={swappedFromAsset.underlyingSymbol.toLowerCase()}
              token={swappedFromAsset.cToken}
              handleInput={(val?: string) => setSwapFromAmount(val as string)}
              chain={+chain}
              footerText={'$' + (lifiQuote?.estimate?.fromAmountUSD ?? '0')}
              decimals={swappedFromAsset.underlyingDecimals}
              showUtilizationSlider
            />

            <SwapTo
              headerText={'Swap To'}
              amount={formatUnits(
                BigInt(lifiQuote?.estimate?.toAmount ?? '0'),
                swappedToAsset?.underlyingDecimals ?? 18
              )}
              isLoading={isLoadingLifiQuote || isFetchingLifiQuote}
              tokenName={swappedToTokenQuery}
              token={swappedToAsset?.cToken}
              // handleInput={(val?: string) => setSwapToToken(val as string)}
              tokenSelector
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
          </div>
          <div className="h-[2px] w-full mx-auto bg-white/10 my-2.5" />
          <div className="text-xs flex items-center justify-between w-full">
            <span className="text-white/50">HEALTH FACTOR</span>
            <span className="">{healthFactor ?? '-'}</span>
          </div>
          <div className="h-[2px] w-full mx-auto bg-white/10 my-2.5" />
          <div className="text-xs flex items-center justify-between w-full">
            <span className="text-white/50">
              MARKET SUPPLY BALANCE {swappedFromAsset.underlyingSymbol}
            </span>
            <span className="">
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
          <div className="text-xs flex items-center justify-between w-full">
            {swappedToAsset && (
              <>
                <span className="text-white/50">
                  MARKET SUPPLY BALANCE {swappedToAsset.underlyingSymbol}
                </span>
                <span className="">
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
            <div className="text-xs flex items-center justify-between w-full">
              <span className="text-white/50">COLLATERAL FACTOR</span>
              <span className="">
                {Number(formatEther(swappedFromAsset.collateralFactor)) * 100}%{' '}
                {'->'}{' '}
                {Number(formatEther(swappedToAsset.collateralFactor)) * 100}%
              </span>
            </div>
          )}
          <div className="h-[2px] w-full mx-auto bg-white/10 my-2.5" />
          <div className="w-full flex items-center justify-center gap-5">
            <div className="w-14 h-14">
              <Doughnut
                data={getDonutData(
                  swappedToAsset?.totalSupplyFiat ?? 0,
                  supplyCap?.usdCap ?? 100
                )}
                options={donutoptions}
                updateMode="resize"
              />
            </div>

            <div className="w-[40%] flex gap-5 items-start justify-start">
              <div className="flex flex-col items-start justify-center gap-y-1">
                <p className="text-white/60 text-[10px]">TOTAL SUPPLIED</p>
                <p className="font-semibold">
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
                <p className="font-semibold text-[8px] text-white/30">
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
          <div className="h-[2px] w-full mx-auto bg-white/10 my-2.5" />
          <SlippageSelector onSlippageChange={handleSlippageChange} />
        </div>

        <div className="sticky bottom-0 bg-grayone w-full px-8 pb-4">
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
    </div>
  );
}

/*
 <div className={``}> </div>
*/
