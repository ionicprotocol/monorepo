'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import type { BigNumber, Contract } from 'ethers';
import { parseEther } from 'ethers/lib/utils.js';
import Image from 'next/image';
import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { WETHAbi } from 'sdk/dist/cjs/src';
import { getContract } from 'sdk/dist/cjs/src/IonicSdk/utils';
import { useBalance } from 'wagmi';
import type { FetchBalanceResult } from 'wagmi/actions';

import ResultHandler from '../ResultHandler';

import type { TransactionStep } from './TransactionStepHandler';
import TransactionStepsHandler from './TransactionStepHandler';

import { useMultiMidas } from '@ui/context/MultiIonicContext';

export type SwapProps = {
  close: () => void;
};

enum SwapType {
  ETH_WETH = 1,
  WETH_ETH
}

export default function Swap({ close }: SwapProps) {
  const { address, currentSdk } = useMultiMidas();
  const [amount, setAmount] = useState<string>();
  const [swapType, setSwapType] = useState<SwapType>(SwapType.ETH_WETH);
  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({
    address
  });
  const { data: wethBalance, refetch: refetchWethBalance } = useBalance({
    address,
    token: currentSdk?.chainSpecificAddresses.W_TOKEN as `0x${string}`
  });
  const currentUsedBalance = useMemo<FetchBalanceResult | undefined>(() => {
    switch (swapType) {
      case SwapType.ETH_WETH:
        return ethBalance;

      case SwapType.WETH_ETH:
        return wethBalance;

      default:
        return undefined;
    }
  }, [ethBalance, wethBalance, swapType]);
  const queryClient = useQueryClient();
  const WTokenContract = useMemo<Contract | undefined>(() => {
    if (!currentSdk || !address) {
      return;
    }

    return getContract(
      currentSdk.chainSpecificAddresses.W_TOKEN,
      WETHAbi.abi,
      currentSdk.signer
    );
  }, [address, currentSdk]);
  const [transactionSteps, upsertTransactionStep] = useReducer(
    (
      prevState: TransactionStep[],
      updatedStep:
        | { index: number; transactionStep: TransactionStep }
        | undefined
    ): TransactionStep[] => {
      if (!updatedStep) {
        return [];
      }

      const currentSteps = prevState.slice();

      currentSteps[updatedStep.index] = {
        ...currentSteps[updatedStep.index],
        ...updatedStep.transactionStep
      };

      if (
        updatedStep.transactionStep.error &&
        updatedStep.index + 1 < currentSteps.length
      ) {
        for (let i = updatedStep.index + 1; i < currentSteps.length; i++) {
          currentSteps[i] = {
            ...currentSteps[i],
            error: true
          };
        }
      }

      return currentSteps;
    },
    []
  );
  const amountAsBInt = useMemo<BigNumber>(
    () => parseEther(amount ?? '0'),
    [amount]
  );
  const [isMounted, setIsMounted] = useState<boolean>(false);

  /**
   * Animation
   */
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let closeTimer: ReturnType<typeof setTimeout>;

    if (!isMounted) {
      closeTimer = setTimeout(() => {
        close();
      }, 301);
    }

    return () => {
      clearTimeout(closeTimer);
    };
  }, [close, isMounted]);

  const initiateCloseAnimation = () => setIsMounted(false);
  const handlInpData = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUsedBalance) {
      return;
    }

    const currentValue = e.target.value.trim();
    let newAmount = currentValue === '' ? undefined : currentValue;
    const numbersBeforeSeparator = new RegExp(/[0-9]\./gm).test(
      currentValue ?? ''
    )
      ? 1
      : 0;

    if (
      newAmount &&
      newAmount.length > 1 &&
      newAmount[0] === '0' &&
      newAmount[1] !== '.'
    ) {
      newAmount = newAmount.slice(1, newAmount.length);
    }

    if (
      newAmount &&
      newAmount.length >
        currentUsedBalance.decimals + 1 + numbersBeforeSeparator
    ) {
      return;
    }

    if (newAmount && currentUsedBalance.value.lt(parseEther(newAmount))) {
      setAmount(currentUsedBalance.formatted);

      return;
    }

    setAmount(newAmount);
  };
  const handleMax = (val: string) => {
    setAmount(val.trim());
  };
  const addStepsForAction = (steps: TransactionStep[]) => {
    steps.forEach((step, i) =>
      upsertTransactionStep({ index: i, transactionStep: step })
    );
  };
  const swapAmount = async () => {
    if (amountAsBInt && amountAsBInt.gt('0') && WTokenContract) {
      const currentTransactionStep = 0;

      addStepsForAction([
        {
          error: false,
          message:
            swapType === SwapType.ETH_WETH
              ? 'Wrapping ETH -> WETH'
              : 'Unwrapping WETH -> ETH',
          success: false
        }
      ]);

      try {
        const tx =
          swapType === SwapType.ETH_WETH
            ? await WTokenContract.deposit({
                value: amountAsBInt
              })
            : await WTokenContract.withdraw(amountAsBInt);

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            txHash: tx.hash
          }
        });

        await tx.wait();

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            success: true
          }
        });
      } catch (error) {
        console.error(error);

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            error: true
          }
        });
      }
    }
  };

  const refetchUsedQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['useFusePoolData'] });
    queryClient.invalidateQueries({ queryKey: ['useBorrowMinimum'] });
    queryClient.invalidateQueries({ queryKey: ['useUsdPrice'] });
    queryClient.invalidateQueries({ queryKey: ['useAllUsdPrices'] });
    queryClient.invalidateQueries({ queryKey: ['useTotalSupplyAPYs'] });
    queryClient.invalidateQueries({ queryKey: ['useUpdatedUserAssets'] });
    queryClient.invalidateQueries({ queryKey: ['useMaxSupplyAmount'] });
    queryClient.invalidateQueries({ queryKey: ['useMaxWithdrawAmount'] });
    queryClient.invalidateQueries({ queryKey: ['useMaxBorrowAmount'] });
    queryClient.invalidateQueries({ queryKey: ['useMaxRepayAmount'] });
    queryClient.invalidateQueries({
      queryKey: ['useSupplyCapsDataForPool']
    });
    queryClient.invalidateQueries({
      queryKey: ['useBorrowCapsDataForAsset']
    });
    refetchEthBalance();
    refetchWethBalance();
  };

  return (
    <div
      className={` z-40 fixed top-0 right-0 w-full min-h-screen  bg-black/25 flex items-center justify-center transition-opacity duration-300 animate-fade-in ${
        isMounted && 'animated'
      }`}
    >
      <div
        className={`w-[45%] max-w-[450px] relative p-6 bg-grayUnselect rounded-xl max-h-[65vh] overflow-x-hidden overflow-y-scroll scrollbar-hide transition-all duration-300 animate-pop-in ${
          isMounted && 'animated'
        }`}
      >
        <Image
          alt="close"
          className={` h-5 z-10 absolute right-4 top-3 cursor-pointer `}
          height="20"
          onClick={initiateCloseAnimation}
          src="/img/assets/close.png"
          width="20"
        />

        <div className="text-center text-lg font-bold mb-2">Swap Tokens</div>

        <div
          className={`w-[94%] mx-auto rounded-lg bg-grayone py-1 grid ${'grid-cols-2'} text-center gap-x-1 text-xs items-center justify-center mb-4`}
        >
          <div
            className={`rounded-md py-1 text-center  cursor-pointer flex justify-center items-center ${
              swapType === SwapType.ETH_WETH
                ? 'bg-darkone text-accent '
                : 'text-white/40 '
            } transition-all duration-200 ease-linear `}
            onClick={() => setSwapType(SwapType.ETH_WETH)}
          >
            <Image
              alt="eth icon"
              height="30"
              src="/img/symbols/32/color/eth.png"
              width="30"
            />
            <div className="mx-1">{' -> '}</div>
            <Image
              alt="weth icon"
              height="30"
              src="/img/symbols/32/color/weth.png"
              width="30"
            />
          </div>
          <div
            className={` rounded-md py-1 px-3  flex justify-center items-center ${
              swapType === SwapType.WETH_ETH
                ? 'bg-darkone text-accent '
                : 'text-white/40'
            } cursor-pointer transition-all duration-200 ease-linear`}
            onClick={() => setSwapType(SwapType.WETH_ETH)}
          >
            <Image
              alt="weth icon"
              height="30"
              src="/img/symbols/32/color/weth.png"
              width="30"
            />
            <div className="mx-1">{' -> '}</div>
            <Image
              alt="eth icon"
              height="30"
              src="/img/symbols/32/color/eth.png"
              width="30"
            />
          </div>
        </div>

        {address ? (
          <>
            <div className="flex text-center">
              <div className="relative w-1/2 mx-auto">
                <input
                  className={`focus:outline-none w-full h-12 amount-field font-bold text-center bg-zinc-900 rounded-md`}
                  onChange={(e) => handlInpData(e)}
                  placeholder={`${
                    swapType === SwapType.ETH_WETH ? 'ETH' : 'WETH'
                  } Amount`}
                  type="number"
                  value={amount}
                />

                <div className="flex w-full justify-center items-center mt-1 text-[10px] text-white/50">
                  <ResultHandler
                    height="15"
                    isLoading={!currentUsedBalance}
                    width="15"
                  >
                    <span>{currentUsedBalance?.formatted}</span>
                    <button
                      className={`text-accent pl-2`}
                      onClick={() =>
                        handleMax(currentUsedBalance?.formatted ?? '0')
                      }
                    >
                      MAX
                    </button>
                  </ResultHandler>
                </div>
              </div>
            </div>

            <div className="pt-4 text-center">
              {transactionSteps.length > 0 ? (
                <div className="flex justify-center text-left">
                  <TransactionStepsHandler
                    resetTransactionSteps={() => {
                      upsertTransactionStep(undefined);
                      refetchUsedQueries();
                      initiateCloseAnimation();
                    }}
                    transactionSteps={transactionSteps}
                  />
                </div>
              ) : (
                <button
                  className={`px-6 btn-green`}
                  onClick={() => swapAmount()}
                >
                  {swapType === SwapType.ETH_WETH ? 'WRAP' : 'UNWRAP'}
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="flex justify-center uppercase connect-button">
            <ConnectButton />
          </div>
        )}
      </div>
    </div>
  );
}
