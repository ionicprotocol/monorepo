'use client';
import { useMultiMidas } from '@ui/context/MultiIonicContext';
import React, { useMemo, useReducer, useState } from 'react';
import { useBalance } from 'wagmi';
import ResultHandler from '../ResultHandler';
import { BigNumber, Contract } from 'ethers';
import { getContract } from 'sdk/dist/cjs/src/IonicSdk/utils';
import { WETHAbi } from 'sdk/dist/cjs/src';
import TransactionStepsHandler, {
  TransactionStep
} from './TransactionStepHandler';
import { useQueryClient } from '@tanstack/react-query';
import { useSwapAmount } from '@ui/hooks/useSwapAmount';

export type SwapProps = {
  close: () => void;
};

export default function Swap({ close }: SwapProps) {
  const { address, currentSdk } = useMultiMidas();
  const enabledOutputTokens = useMemo<string[]>(
    () => [...(currentSdk ? [currentSdk?.chainSpecificAddresses.W_TOKEN] : [])],
    [currentSdk]
  );
  const [amount, setAmount] = useState<number>();
  const [currentOutputToken, setCurrentOutputToken] = useState<
    string | undefined
  >(enabledOutputTokens.length ? enabledOutputTokens[0] : undefined);
  const {
    data: ethBalance,
    isLoading: isLoadingEthBalance,
    refetch: refetchEthBalance
  } = useBalance({ address: address as any });
  const {
    data: wethBalance,
    isLoading: wethBalanceLoading,
    refetch: refetchwethBalance
  } = useBalance({ address: address as any, token: currentOutputToken as any });
  const queryClient = useQueryClient();
  const WTokenContract = useMemo<Contract | undefined>(() => {
    if (!currentSdk) {
      return;
    }

    return getContract(
      currentSdk.chainSpecificAddresses.W_TOKEN,
      WETHAbi.abi,
      currentSdk.signer
    );
  }, [currentSdk]);
  // const { data } = useSwapAmount(
  //   currentSdk?.chainSpecificAddresses.STABLE_TOKEN,
  //   BigNumber.from('1000'),
  //   currentSdk?.chainSpecificAddresses.W_TOKEN,
  //   BigNumber.from('10000')
  // );
  // console.log(data);
  const maxAmount = useMemo<number>(
    () => parseFloat(ethBalance?.formatted ?? '0'),
    [ethBalance]
  );
  const [transactionSteps, upsertTransactionStep] = useReducer(
    (
      prevState: TransactionStep[],
      updatedStep:
        | { transactionStep: TransactionStep; index: number }
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
    () =>
      BigNumber.from(
        Math.round((amount ?? 0) * Math.pow(10, ethBalance?.decimals ?? 1))
      ),
    [amount]
  );

  function handlInpData(e: React.ChangeEvent<HTMLInputElement>) {
    const currentValue =
      e.target.value.trim() === '' ? undefined : parseFloat(e.target.value);

    setAmount(
      currentValue && currentValue > maxAmount ? maxAmount : currentValue
    );
  }

  function handleMax(val: number) {
    setAmount(val);
  }

  const addStepsForAction = (steps: TransactionStep[]) => {
    steps.forEach((step, i) =>
      upsertTransactionStep({ transactionStep: step, index: i })
    );
  };
  const swapAmount = async () => {
    if (amountAsBInt && amountAsBInt.gt('0') && WTokenContract) {
      let currentTransactionStep = 0;

      addStepsForAction([
        {
          message: 'Swapping ETH -> WETH',
          success: false,
          error: false
        }
      ]);

      try {
        const tx = await WTokenContract.deposit({
          value: amountAsBInt
        });

        upsertTransactionStep({
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            txHash: tx.hash
          },
          index: currentTransactionStep
        });

        await tx.wait();

        upsertTransactionStep({
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            success: true
          },
          index: currentTransactionStep
        });
      } catch (error) {
        console.error(error);

        upsertTransactionStep({
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            error: true
          },
          index: currentTransactionStep
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
  };

  return (
    <div
      className={` z-40 fixed top-0 right-0 w-full min-h-screen  bg-black/25 flex items-center justify-center`}
    >
      <div
        className={`w-[45%] relative p-6 bg-grayUnselect rounded-xl max-h-[65vh] overflow-x-hidden overflow-y-scroll scrollbar-hide`}
      >
        <img
          src="/img/assets/close.png"
          alt="close"
          className={` h-5 z-10 absolute right-4 top-3 cursor-pointer `}
          onClick={() => close()}
        />

        <div className="text-center text-lg font-bold mb-2">Swap Tokens</div>

        <div className="flex justify-center items-center">
          <img
            src="/img/symbols/32/color/eth.png"
            width="30"
            height="30"
          />
          <div className="mx-1">{' -> '}</div>
          <img
            src="/img/symbols/32/color/weth.png"
            width="30"
            height="30"
          />
        </div>

        <div className={` w-full h-[1px]  bg-white/30 mx-auto my-3`}></div>

        <div className="flex text-center">
          <div className="relative w-1/2 mx-auto">
            <input
              type="number"
              placeholder="ETH Amount"
              value={amount}
              onChange={(e) => handlInpData(e)}
              className={`focus:outline-none w-full h-12 amount-field font-bold text-center bg-zinc-900 rounded-md`}
            />

            <div className="flex w-full justify-center items-center mt-1 text-[10px] text-white/50">
              <ResultHandler
                width="15"
                height="15"
                isLoading={!ethBalance}
              >
                <span>{ethBalance?.formatted}</span>
                <button
                  onClick={() => handleMax(maxAmount)}
                  className={`text-accent pl-2`}
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
                transactionSteps={transactionSteps}
                resetTransactionSteps={() => {
                  upsertTransactionStep(undefined);
                  refetchUsedQueries();
                }}
              />
            </div>
          ) : (
            <button
              className={`px-6 rounded-md py-1 transition-colors bg-accent text-darkone`}
              onClick={() => swapAmount()}
            >
              SWAP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
