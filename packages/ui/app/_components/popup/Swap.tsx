'use client';

import { wethAbi } from '@ionicprotocol/sdk';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';
import {
  type Address,
  formatEther,
  getContract,
  type GetContractReturnType,
  parseEther,
  type PublicClient
} from 'viem';
import { mode } from 'viem/chains';
import { useBalance } from 'wagmi';
import type { GetBalanceData } from 'wagmi/query';

import ConnectButton from '../ConnectButton';
import ResultHandler from '../ResultHandler';

import TransactionStepsHandler, {
  useTransactionSteps
} from './TransactionStepsHandler';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

export type SwapProps = {
  close: () => void;
  dropdownSelectedChain: number;
  selectedChain: number;
};

enum SwapType {
  ETH_WETH = 1,
  WETH_ETH
}

export default function Swap({
  close,
  selectedChain,
  dropdownSelectedChain
}: SwapProps) {
  const { address, currentSdk } = useMultiIonic();
  const [amount, setAmount] = useState<string>();
  const [swapType, setSwapType] = useState<SwapType>(SwapType.ETH_WETH);
  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({
    address
  });
  const { data: wethBalance, refetch: refetchWethBalance } = useBalance({
    address,
    token: currentSdk?.chainSpecificAddresses.W_TOKEN as `0x${string}`
  });
  const currentUsedBalance = useMemo<GetBalanceData | undefined>(() => {
    switch (swapType) {
      case SwapType.ETH_WETH:
        return ethBalance;

      case SwapType.WETH_ETH:
        return wethBalance;

      default:
        return undefined;
    }
  }, [ethBalance, wethBalance, swapType]);
  const currentUsedBalanceAsBigInt = useMemo<bigint>(
    () => currentUsedBalance?.value ?? 0n,
    [currentUsedBalance]
  );
  const queryClient = useQueryClient();
  const WTokenContract = useMemo<
    GetContractReturnType<typeof wethAbi, PublicClient> | undefined
  >(() => {
    if (!currentSdk || !address) {
      return;
    }

    return getContract({
      address: currentSdk.chainSpecificAddresses.W_TOKEN as Address,
      abi: wethAbi,
      client: {
        public: currentSdk.publicClient,
        wallet: currentSdk.walletClient
      }
    });
  }, [address, currentSdk]);
  const { addStepsForAction, transactionSteps, upsertTransactionStep } =
    useTransactionSteps();
  const amountAsBInt = useMemo<bigint>(
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

    if (newAmount && currentUsedBalanceAsBigInt < parseEther(newAmount)) {
      setAmount(formatEther(currentUsedBalanceAsBigInt));

      return;
    }

    setAmount(newAmount);
  };
  const handleMax = (val: string) => {
    setAmount(val.trim());
  };
  const swapAmount = async () => {
    if (amountAsBInt && amountAsBInt > 0n && WTokenContract) {
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
            ? await WTokenContract.write.deposit({
                account: currentSdk!.walletClient.account!.address,
                chain: currentSdk!.walletClient.chain,
                value: amountAsBInt
              })
            : await WTokenContract.write.withdraw([amountAsBInt], {
                account: currentSdk!.walletClient.account!.address,
                chain: currentSdk!.walletClient.chain
              });

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            txHash: tx
          }
        });

        await currentSdk?.publicClient.waitForTransactionReceipt({ hash: tx });

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
      className={` z-50 fixed top-0 right-0 w-full h-screen  bg-black/25 flex overflow-y-scroll transition-opacity duration-300 animate-fade-in ${
        isMounted && 'animated'
      }`}
    >
      <div
        className={`w-[85%] sm:w-[45%] max-w-[450px] m-auto relative p-6 bg-grayUnselect rounded-xl overflow-hidden scrollbar-hide transition-all duration-300 animate-pop-in ${
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
                    chainId={currentSdk?.chainId || mode.id}
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
                  onClick={async () => {
                    const result = await handleSwitchOriginChain(
                      selectedChain,
                      dropdownSelectedChain
                    );
                    if (result) {
                      swapAmount();
                    }
                  }}
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
