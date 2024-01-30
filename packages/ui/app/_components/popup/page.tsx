'use client';
/* eslint-disable @next/next/no-img-element */
import { useQueryClient } from '@tanstack/react-query';
import { INFO_MESSAGES } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiIonicContext';
import useUpdatedUserAssets from '@ui/hooks/ionic/useUpdatedUserAssets';
import { useBorrowMinimum } from '@ui/hooks/useBorrowMinimum';
import { useMaxBorrowAmount } from '@ui/hooks/useMaxBorrowAmount';
import { useMaxRepayAmount } from '@ui/hooks/useMaxRepayAmount';
import { useMaxSupplyAmount } from '@ui/hooks/useMaxSupplyAmount';
import { useMaxWithdrawAmount } from '@ui/hooks/useMaxWithdrawAmount';
import { useTotalSupplyAPYs } from '@ui/hooks/useTotalSupplyAPYs';
import { MarketData } from '@ui/types/TokensDataMap';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';
import { BigNumber, constants, utils } from 'ethers';
import { formatUnits } from 'ethers/lib/utils.js';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { ThreeCircles } from 'react-loader-spinner';
import { FundOperationMode } from 'types/dist';
import { useChainId } from 'wagmi';
import ResultHandler from '../ResultHandler';
import Amount from './Amount';
import SliderComponent from './Slider';
import Tab from './Tab';

type LoadingButtonWithTextProps = {
  text: String;
};

function LoadingButtonWithText({ text }: LoadingButtonWithTextProps) {
  return (
    <button className={`w-full rounded-md py-1 transition-colors bg-accent`}>
      <span className="flex justify-center">
        <span className="block mr-2">{text}</span>{' '}
        <ThreeCircles
          visible={true}
          height="20"
          width="20"
          color="#0a0a0aff"
          ariaLabel="three-circles-loading"
          wrapperClass=""
        />
      </span>
    </button>
  );
}

type TransactionStep = {
  message: string;
  success: boolean;
  error: boolean;
  txHash?: string;
};
type TransactionStepsHandlerProps = {
  transactionSteps: TransactionStep[];
  resetTransactionSteps: () => void;
};

function TransactionStepsHandler({
  transactionSteps,
  resetTransactionSteps
}: TransactionStepsHandlerProps) {
  return (
    <div className="mx-auto text-sm">
      {transactionSteps.map((transactionStep, i) => (
        <div key={`transaction-step-${i}`}>
          <div
            className={`flex align-center mt-2 ${
              !transactionStep.error && !transactionStep.success && 'text-white'
            } ${transactionStep.success && 'text-accent'} ${
              transactionStep.error && 'text-error'
            }`}
          >
            {!transactionStep.error && !transactionStep.success && (
              <ThreeCircles
                visible={true}
                height="20"
                width="20"
                color="#39ff88"
                ariaLabel="three-circles-loading"
              />
            )}

            {transactionStep.error && <span className="error-icon" />}

            {transactionStep.success && <span className="success-icon" />}

            <span className="ml-1">{transactionStep.message}</span>
          </div>

          {transactionStep.txHash && (
            <div className="pl-6 text-cyan-400">
              <a
                href={`https://explorer.mode.network/tx/${transactionStep.txHash}`}
                target="_blank"
              >
                0x{transactionStep.txHash.slice(2, 4)}...
                {transactionStep.txHash.slice(-6)}
              </a>
            </div>
          )}
        </div>
      ))}

      {(transactionSteps.filter((step) => step.success).length ===
        transactionSteps.length ||
        transactionSteps.find((step) => step.error) !== undefined) && (
        <div className="text-center">
          <button
            className="mt-4 px-3 rounded-md py-1 transition-colors bg-accent text-center"
            onClick={resetTransactionSteps}
          >
            CONTINUE
          </button>
        </div>
      )}
    </div>
  );
}

interface IPopup {
  mode?: string;
  specific?: string | null;
  selectedMarketData: MarketData;
  comptrollerAddress: string;
}
const Popup = ({
  mode = 'DEFAULT',
  specific = null,
  selectedMarketData,
  comptrollerAddress
}: IPopup) => {
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
  const { currentSdk, address } = useMultiMidas();
  const chainId = useChainId();
  const { data: minBorrowAmount } = useBorrowMinimum(
    selectedMarketData,
    chainId
  );
  const { data: maxSupplyAmount, isLoading: isLoadingMaxSupply } =
    useMaxSupplyAmount(selectedMarketData, comptrollerAddress, chainId);
  const { data: assetsSupplyAprData } = useTotalSupplyAPYs(
    [selectedMarketData],
    chainId
  );
  const collateralApr = useMemo<string>(() => {
    // Todo: add the market rewards to this calculation
    if (assetsSupplyAprData) {
      return `${assetsSupplyAprData[selectedMarketData.cToken].apy.toFixed(
        2
      )}%`;
    }

    return '0.00%';
  }, [assetsSupplyAprData]);
  const [currentInfoMessage, setCurrentInfoMessage] = useState<string>();
  const [active, setActive] = useState<string>('');
  const slide = useRef<HTMLDivElement>(null!);
  const router = useRouter();
  const [amount, setAmount] = useReducer(
    (_: number | undefined, value: number | undefined): number | undefined => {
      const marketDataDecimals = parseInt(
        selectedMarketData.underlyingDecimals.toString()
      );

      return typeof value === 'number'
        ? parseFloat(value.toFixed(marketDataDecimals))
        : undefined;
    },
    undefined
  );
  const { data: maxRepayAmount, isLoading: isLoadingMaxRepayAmount } =
    useMaxRepayAmount(selectedMarketData, chainId);
  const amountAsBInt = useMemo<BigNumber>(
    () =>
      BigNumber.from(
        Math.round(
          (amount ?? 0) *
            Math.pow(
              10,
              parseInt(selectedMarketData.underlyingDecimals.toString())
            )
        )
      ),
    [amount]
  );
  const { data: maxBorrowAmount, isLoading: isLoadingMaxBorrowAmount } =
    useMaxBorrowAmount(selectedMarketData, comptrollerAddress, chainId);
  const currentBorrowAmountAsFloat = useMemo<number>(
    () => parseFloat(selectedMarketData.borrowBalance.toString()),
    [selectedMarketData]
  );
  const [currentUtilizationPercentage, setCurrentUtilizationPercentage] =
    useState<number>(0);
  const [currentFundOperation, setCurrentFundOperation] =
    useState<FundOperationMode>(FundOperationMode.SUPPLY);
  const { data: updatedAssets, isLoading: isLoadingUpdatedAssets } =
    useUpdatedUserAssets({
      mode: currentFundOperation,
      poolChainId: chainId,
      amount: amountAsBInt,
      assets: [selectedMarketData],
      index: 0
    });
  const updatedAsset = updatedAssets ? updatedAssets[0] : undefined;
  const { data: maxWithdrawAmount, isLoading: isLoadingMaxWithdrawAmount } =
    useMaxWithdrawAmount(selectedMarketData, chainId);
  const {
    supplyAPY,
    borrowAPR,
    updatedSupplyAPY,
    updatedBorrowAPR,
    supplyBalanceFrom,
    supplyBalanceTo,
    borrowBalanceFrom,
    borrowBalanceTo
  } = useMemo(() => {
    const blocksPerMinute = getBlockTimePerMinuteByChainId(chainId);

    if (currentSdk) {
      return {
        borrowAPR: currentSdk.ratePerBlockToAPY(
          selectedMarketData.borrowRatePerBlock,
          blocksPerMinute
        ),
        supplyAPY: currentSdk.ratePerBlockToAPY(
          selectedMarketData.supplyRatePerBlock,
          blocksPerMinute
        ),
        supplyBalanceFrom: utils.commify(
          utils.formatUnits(
            selectedMarketData.supplyBalance,
            selectedMarketData.underlyingDecimals
          )
        ),
        supplyBalanceTo: updatedAsset
          ? utils.commify(
              utils.formatUnits(
                updatedAsset.supplyBalance,
                updatedAsset.underlyingDecimals
              )
            )
          : undefined,
        borrowBalanceFrom: utils.commify(
          utils.formatUnits(
            selectedMarketData.borrowBalance,
            selectedMarketData.underlyingDecimals
          )
        ),
        borrowBalanceTo: updatedAsset
          ? utils.commify(
              utils.formatUnits(
                updatedAsset.borrowBalance,
                updatedAsset.underlyingDecimals
              )
            )
          : undefined,
        updatedBorrowAPR: updatedAsset
          ? currentSdk.ratePerBlockToAPY(
              updatedAsset.borrowRatePerBlock,
              blocksPerMinute
            )
          : undefined,
        updatedSupplyAPY: updatedAsset
          ? currentSdk.ratePerBlockToAPY(
              updatedAsset.supplyRatePerBlock,
              blocksPerMinute
            )
          : undefined,
        totalBorrows: updatedAssets?.reduce(
          (acc, cur) => acc + cur.borrowBalanceFiat,
          0
        ),
        updatedTotalBorrows: updatedAssets
          ? updatedAssets.reduce((acc, cur) => acc + cur.borrowBalanceFiat, 0)
          : undefined
      };
    }

    return {};
  }, [chainId, updatedAsset, selectedMarketData, updatedAssets, currentSdk]);
  const minBorrowAmountAsNumber = useMemo<number>(
    () =>
      parseFloat(
        formatUnits(
          minBorrowAmount?.minBorrowAsset ?? '0',
          selectedMarketData.underlyingDecimals
        )
      ),
    [minBorrowAmount]
  );
  const queryClient = useQueryClient();

  /**
   * Update utilization percentage when amount changes
   */
  useEffect(() => {
    switch (active) {
      case 'COLLATERAL':
        setCurrentUtilizationPercentage(
          Math.round(((amount ?? 0) / (maxSupplyAmount?.number ?? 0)) * 100)
        );

        break;

      case 'WITHDRAW':
        setCurrentUtilizationPercentage(
          Math.round(
            ((amount ?? 0) /
              parseFloat(
                formatUnits(
                  maxWithdrawAmount ?? '0',
                  selectedMarketData.underlyingDecimals
                ) ?? '1'
              )) *
              100
          )
        );

        break;

      case 'BORROW':
        setCurrentUtilizationPercentage(
          Math.round(((amount ?? 0) / (maxBorrowAmount?.number ?? 1)) * 100)
        );

        break;

      case 'REPAY':
        setCurrentUtilizationPercentage(
          Math.round(
            ((amount ?? 0) /
              parseFloat(
                formatUnits(
                  maxRepayAmount ?? '0',
                  selectedMarketData.underlyingDecimals
                ) ?? '1'
              )) *
              100
          )
        );

        break;
    }
  }, [amount]);

  useEffect(() => {
    if (mode === 'DEFAULT' || 'SUPPLY') {
      if (specific) {
        setActive(specific);
        return;
      }
      setActive('COLLATERAL');
    }

    if (mode === 'BORROW') {
      if (specific) {
        setActive(specific);
        return;
      }
      setActive('BORROW');
    }
  }, [mode, specific]);

  useEffect(() => {
    setAmount(0);
    setCurrentUtilizationPercentage(0);
    upsertTransactionStep(undefined);

    switch (active) {
      case 'COLLATERAL':
        setCurrentFundOperation(FundOperationMode.SUPPLY);

        break;

      case 'WITHDRAW':
        setCurrentFundOperation(FundOperationMode.WITHDRAW);

        break;

      case 'BORROW':
        setCurrentFundOperation(FundOperationMode.BORROW);

        break;

      case 'REPAY':
        setCurrentFundOperation(FundOperationMode.REPAY);

        break;
    }

    if (mode === 'DEFAULT') {
      if (active === 'COLLATERAL') {
        slide.current.style.transform = 'translateX(0%)';
      }
      if (active === 'WITHDRAW') {
        slide.current.style.transform = 'translateX(-100%)';
      }
      if (active === 'BORROW') {
        slide.current.style.transform = 'translateX(-200%)';
      }
      if (active === 'REPAY') {
        slide.current.style.transform = 'translateX(-300%)';
      }
    }
    if (mode === 'SUPPLY') {
      if (active === 'COLLATERAL') {
        slide.current.style.transform = 'translateX(0%)';
      }
      if (active === 'WITHDRAW') {
        slide.current.style.transform = 'translateX(-100%)';
      }
    }
    if (mode === 'BORROW') {
      if (active === 'BORROW') {
        slide.current.style.transform = 'translateX(0%)';
      }
      if (active === 'REPAY') {
        slide.current.style.transform = 'translateX(-100%)';
      }
    }
  }, [active, mode]);

  const handleSupplyUtilization = (utilizationPercentage: number) => {
    setAmount(
      parseFloat(
        (
          (utilizationPercentage / 100) *
          (maxSupplyAmount?.number ?? 0)
        ).toFixed(parseInt(selectedMarketData.underlyingDecimals.toString()))
      )
    );
  };

  const handleWithdrawUtilization = (utilizationPercentage: number) => {
    setAmount(
      parseFloat(
        (
          (utilizationPercentage / 100) *
          parseFloat(
            formatUnits(
              maxWithdrawAmount ?? '0',
              selectedMarketData.underlyingDecimals
            ) ?? '0.0'
          )
        ).toFixed(parseInt(selectedMarketData.underlyingDecimals.toString()))
      )
    );
  };

  const handleBorrowUtilization = (utilizationPercentage: number) => {
    setAmount(
      parseFloat(
        (
          (utilizationPercentage / 100) *
          (maxBorrowAmount?.number ?? 0)
        ).toFixed(parseInt(selectedMarketData.underlyingDecimals.toString()))
      )
    );
  };

  const handleRepayUtilization = (utilizationPercentage: number) => {
    setAmount(
      parseFloat(
        (
          (utilizationPercentage / 100) *
          parseFloat(
            formatUnits(
              maxRepayAmount ?? '0',
              selectedMarketData.underlyingDecimals
            ) ?? '0.0'
          )
        ).toFixed(parseInt(selectedMarketData.underlyingDecimals.toString()))
      )
    );
  };

  const addStepsForAction = (steps: TransactionStep[]) => {
    steps.forEach((step, i) =>
      upsertTransactionStep({ transactionStep: step, index: i })
    );
  };

  const resetTransactionSteps = () => {
    upsertTransactionStep(undefined);
  };

  const supplyAmount = async (collateral: boolean = false) => {
    if (
      !transactionSteps.length &&
      currentSdk &&
      address &&
      amount &&
      amount > 0 &&
      maxSupplyAmount &&
      amount <= maxSupplyAmount.number
    ) {
      let currentTransactionStep = 0;
      addStepsForAction([
        {
          message: INFO_MESSAGES.SUPPLY.APPROVE,
          success: false,
          error: false
        },
        ...(collateral
          ? [
              {
                message: INFO_MESSAGES.SUPPLY.COLLATERAL,
                success: false,
                error: false
              }
            ]
          : []),
        {
          message: INFO_MESSAGES.SUPPLY.SUPPLYING,
          success: false,
          error: false
        }
      ]);

      try {
        const token = currentSdk.getEIP20TokenInstance(
          selectedMarketData.underlyingToken,
          currentSdk.signer
        );
        const hasApprovedEnough = (
          await token.callStatic.allowance(address, selectedMarketData.cToken)
        ).gte(amountAsBInt);

        if (!hasApprovedEnough) {
          const tx = await currentSdk.approve(
            selectedMarketData.cToken,
            selectedMarketData.underlyingToken
          );

          upsertTransactionStep({
            transactionStep: {
              ...transactionSteps[currentTransactionStep],
              txHash: tx.hash
            },
            index: currentTransactionStep
          });

          await tx.wait();
        }

        upsertTransactionStep({
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            success: true
          },
          index: currentTransactionStep
        });

        currentTransactionStep++;

        if (collateral) {
          const tx = await currentSdk.enterMarkets(
            selectedMarketData.cToken,
            comptrollerAddress
          );

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

          currentTransactionStep++;
        }

        const { tx, errorCode } = await currentSdk.mint(
          selectedMarketData.cToken,
          amountAsBInt
        );

        if (errorCode) {
          throw new Error('Error during supplying!');
        }

        upsertTransactionStep({
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            txHash: tx?.hash
          },
          index: currentTransactionStep
        });

        await tx?.wait();

        await Promise.all([
          queryClient.refetchQueries({ queryKey: ['useFusePoolData'] }),
          queryClient.refetchQueries({ queryKey: ['useMaxSupplyAmount'] }),
          queryClient.refetchQueries({ queryKey: ['useMaxWithdrawAmount'] }),
          queryClient.refetchQueries({ queryKey: ['useMaxBorrowAmount'] }),
          queryClient.refetchQueries({ queryKey: ['useMaxRepayAmount'] }),
          queryClient.refetchQueries({
            queryKey: ['useSupplyCapsDataForPool']
          }),
          queryClient.refetchQueries({
            queryKey: ['useBorrowCapsDataForAsset']
          })
        ]);

        upsertTransactionStep({
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            success: true
          },
          index: currentTransactionStep
        });

        toast.success(
          `Supplied ${amount} ${selectedMarketData.underlyingSymbol}`
        );
      } catch (error) {
        toast.error('Error while supplying!');

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

  const withdrawAmount = async () => {
    if (
      !transactionSteps.length &&
      currentSdk &&
      address &&
      amount &&
      amount > 0 &&
      amount <=
        parseFloat(
          formatUnits(
            maxWithdrawAmount ?? '0',
            selectedMarketData.underlyingDecimals
          )
        )
    ) {
      let currentTransactionStep = 0;
      addStepsForAction([
        {
          message: INFO_MESSAGES.WITHDRAW.WITHDRAWING,
          success: false,
          error: false
        }
      ]);

      try {
        if (
          parseFloat(
            formatUnits(
              selectedMarketData.supplyBalance,
              selectedMarketData.underlyingDecimals
            )
          ) <= amount
        ) {
          const { tx, errorCode } = await currentSdk.withdraw(
            selectedMarketData.cToken,
            constants.MaxUint256
          );

          if (errorCode) {
            throw new Error('Error during withdrawing!');
          }

          upsertTransactionStep({
            transactionStep: {
              ...transactionSteps[currentTransactionStep],
              txHash: tx?.hash
            },
            index: currentTransactionStep
          });

          await tx?.wait();
        } else {
          const { tx, errorCode } = await currentSdk.withdraw(
            selectedMarketData.cToken,
            amountAsBInt
          );

          if (errorCode) {
            throw new Error('Error during withdrawing!');
          }

          upsertTransactionStep({
            transactionStep: {
              ...transactionSteps[currentTransactionStep],
              txHash: tx?.hash
            },
            index: currentTransactionStep
          });

          await tx?.wait();
        }

        upsertTransactionStep({
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            success: true
          },
          index: currentTransactionStep
        });

        toast.success(
          `Withdrawn ${amount} ${selectedMarketData.underlyingSymbol}`
        );
      } catch (error) {
        console.error(error);

        upsertTransactionStep({
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            error: true
          },
          index: currentTransactionStep
        });

        toast.error('Error while withdrawing!');
      }
    }
  };

  const borrowAmount = async () => {
    if (
      !transactionSteps.length &&
      currentSdk &&
      address &&
      amount &&
      amount > 0 &&
      minBorrowAmount &&
      amount > minBorrowAmountAsNumber &&
      maxBorrowAmount &&
      amount <= maxBorrowAmount.number
    ) {
      let currentTransactionStep = 0;
      addStepsForAction([
        {
          message: INFO_MESSAGES.BORROW.BORROWING,
          success: false,
          error: false
        }
      ]);

      try {
        const { tx, errorCode } = await currentSdk.borrow(
          selectedMarketData.cToken,
          amountAsBInt
        );

        if (errorCode) {
          throw new Error('Error during borrowing!');
        }

        upsertTransactionStep({
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            txHash: tx?.hash
          },
          index: currentTransactionStep
        });

        await tx?.wait();

        upsertTransactionStep({
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            success: true
          },
          index: currentTransactionStep
        });

        await queryClient.refetchQueries({ queryKey: ['useFusePoolData'] });
        await queryClient.refetchQueries({ queryKey: ['useMaxSupplyAmount'] });
        await queryClient.refetchQueries({
          queryKey: ['useMaxWithdrawAmount']
        });
        await queryClient.refetchQueries({ queryKey: ['useMaxBorrowAmount'] });
        await queryClient.refetchQueries({ queryKey: ['useMaxRepayAmount'] });
        await queryClient.refetchQueries({
          queryKey: ['useSupplyCapsDataForPool']
        });
        await queryClient.refetchQueries({
          queryKey: ['useBorrowCapsDataForAsset']
        });

        toast.success(
          `Borrowed ${amount} ${selectedMarketData.underlyingSymbol}`
        );
      } catch (error) {
        console.error(error);

        upsertTransactionStep({
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            error: true
          },
          index: currentTransactionStep
        });

        toast.error('Error while borrowing!');
      }
    }
  };

  const repayAmount = async () => {
    if (
      !transactionSteps.length &&
      currentSdk &&
      address &&
      amount &&
      amount > 0 &&
      currentBorrowAmountAsFloat
    ) {
      let currentTransactionStep = 0;
      addStepsForAction([
        {
          message: INFO_MESSAGES.REPAY.APPROVE,
          success: false,
          error: false
        },
        {
          message: INFO_MESSAGES.REPAY.REPAYING,
          success: false,
          error: false
        }
      ]);

      try {
        const token = currentSdk.getEIP20TokenInstance(
          selectedMarketData.underlyingToken,
          currentSdk.signer
        );
        const hasApprovedEnough = (
          await token.callStatic.allowance(address, selectedMarketData.cToken)
        ).gte(amountAsBInt);

        if (!hasApprovedEnough) {
          const tx = await currentSdk.approve(
            selectedMarketData.cToken,
            selectedMarketData.underlyingToken
          );

          upsertTransactionStep({
            transactionStep: {
              ...transactionSteps[currentTransactionStep],
              txHash: tx.hash
            },
            index: currentTransactionStep
          });

          await tx.wait();
        }

        upsertTransactionStep({
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            success: true
          },
          index: currentTransactionStep
        });

        currentTransactionStep++;

        const isRepayingMax = amountAsBInt.gte(maxRepayAmount ?? '0');
        const { tx, errorCode } = await currentSdk.repay(
          selectedMarketData.cToken,
          isRepayingMax,
          isRepayingMax ? selectedMarketData.borrowBalance : amountAsBInt
        );

        if (errorCode) {
          throw new Error('Error during repaying!');
        }

        upsertTransactionStep({
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            txHash: tx?.hash
          },
          index: currentTransactionStep
        });

        await tx?.wait();

        upsertTransactionStep({
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            success: true
          },
          index: currentTransactionStep
        });
        await queryClient.refetchQueries({ queryKey: ['useFusePoolData'] });
        await queryClient.refetchQueries({ queryKey: ['useMaxSupplyAmount'] });
        await queryClient.refetchQueries({
          queryKey: ['useMaxWithdrawAmount']
        });
        await queryClient.refetchQueries({ queryKey: ['useMaxBorrowAmount'] });
        await queryClient.refetchQueries({ queryKey: ['useMaxRepayAmount'] });
        await queryClient.refetchQueries({
          queryKey: ['useSupplyCapsDataForPool']
        });
        await queryClient.refetchQueries({
          queryKey: ['useBorrowCapsDataForAsset']
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

        toast.error('Error while repaying!');
      }
    }
  };

  return (
    <div
      className={` z-40 fixed top-0 right-0 w-full min-h-screen  bg-black/25 flex items-center justify-center`}
    >
      <div
        className={`w-[45%] relative  bg-grayUnselect rounded-xl max-h-[65vh] overflow-x-hidden overflow-y-scroll scrollbar-hide`}
      >
        <img
          src="/img/assets/close.png"
          alt="close"
          className={` h-5 z-10 absolute right-4 top-3 cursor-pointer `}
          onClick={() => router.back()}
        />
        <div className={`flex w-20 mx-auto mt-4 mb-2 relative text-center`}>
          <img
            src={`/img/symbols/32/color/${selectedMarketData?.underlyingSymbol.toLowerCase()}.png`}
            alt="modlogo"
            width="32"
            height="32"
            className="mx-auto"
          />
        </div>
        <Tab
          setActive={setActive}
          mode={mode}
          active={active}
        />
        {/* all the respective slides */}

        <div
          ref={slide}
          className={`w-full transition-all duration-300 ease-linear h-min  flex`}
        >
          {(mode === 'SUPPLY' || mode === 'DEFAULT') && (
            <>
              {/* ---------------------------------------------------------------------------- */}
              {/* SUPPLY-Collateral section */}
              {/* ---------------------------------------------------------------------------- */}
              <div className={`min-w-full py-5 px-[6%] h-min `}>
                <Amount
                  selectedMarketData={selectedMarketData}
                  handleInput={(val?: number) => setAmount(val)}
                  amount={amount}
                  max={maxSupplyAmount?.number ?? 0}
                  symbol={selectedMarketData.underlyingSymbol}
                  isLoading={isLoadingMaxSupply}
                />
                <SliderComponent
                  currentUtilizationPercentage={currentUtilizationPercentage}
                  handleUtilization={handleSupplyUtilization}
                />
                <div
                  className={` w-full h-[1px]  bg-white/30 mx-auto my-3`}
                ></div>
                <div
                  className={`flex w-full items-center justify-between text-sm text-white/50 `}
                >
                  <span className={``}>COLLATERAL APR</span>
                  <span className={`font-bold pl-2`}>
                    {collateralApr}
                    {/* to do: add the rewards to the calculation */}
                  </span>
                </div>
                <div
                  className={` w-full h-[1px]  bg-white/30 mx-auto my-3`}
                ></div>
                <div
                  className={`flex w-full items-center justify-between text-xs mb-1 text-white/50 uppercase `}
                >
                  <span className={``}>Market Supply Balance</span>
                  <span className={`flex font-bold pl-2`}>
                    {supplyBalanceFrom}
                    <span className="mx-1">{`->`}</span>
                    <ResultHandler
                      isLoading={isLoadingUpdatedAssets}
                      width="16"
                      height="16"
                    >
                      {supplyBalanceTo}
                    </ResultHandler>
                    {/* this will be dynamic */}
                  </span>
                </div>
                <div
                  className={`flex w-full items-center justify-between text-xs mb-1 text-white/50 uppercase`}
                >
                  <span className={``}>Market Supply APR</span>
                  <span className={`flex font-bold pl-2`}>
                    {`${supplyAPY?.toFixed(2)}%`}
                    <span className="mx-1">{`->`}</span>
                    <ResultHandler
                      isLoading={isLoadingUpdatedAssets}
                      width="16"
                      height="16"
                    >
                      {updatedSupplyAPY?.toFixed(2)}%
                    </ResultHandler>
                  </span>
                </div>
                <div
                  className={`flex w-full items-center justify-between gap-2 text-sm mb-1 mt-4 text-darkone `}
                >
                  {transactionSteps.length > 0 ? (
                    <TransactionStepsHandler
                      transactionSteps={transactionSteps}
                      resetTransactionSteps={resetTransactionSteps}
                    />
                  ) : (
                    <>
                      <button
                        className={`w-full rounded-md py-1 transition-colors ${
                          amount && amount > 0 ? 'bg-accent' : 'bg-stone-500'
                        } `}
                        onClick={() => supplyAmount()}
                      >
                        Supply {selectedMarketData.underlyingSymbol}
                      </button>

                      <button
                        className={`w-full rounded-md py-1 transition-colors ${
                          amount && amount > 0 ? 'bg-accent' : 'bg-stone-500'
                        } `}
                        onClick={() => supplyAmount(true)}
                      >
                        Collateral {selectedMarketData.underlyingSymbol}
                      </button>
                    </>
                  )}
                </div>
                {/* <Approved /> */}
              </div>
              <div className={`min-w-full py-5 px-[6%] h-min`}>
                {/* ---------------------------------------------------------------------------- */}
                {/* SUPPLY-Withdraw section */}
                {/* ---------------------------------------------------------------------------- */}
                <Amount
                  selectedMarketData={selectedMarketData}
                  handleInput={(val?: number) => setAmount(val)}
                  amount={amount}
                  max={parseFloat(
                    formatUnits(
                      maxWithdrawAmount ?? '0',
                      selectedMarketData.underlyingDecimals
                    )
                  )}
                  symbol={selectedMarketData.underlyingSymbol}
                  hintText="Max Withdraw"
                  isLoading={isLoadingMaxWithdrawAmount}
                />
                <SliderComponent
                  currentUtilizationPercentage={currentUtilizationPercentage}
                  handleUtilization={handleWithdrawUtilization}
                />
                <div
                  className={` w-full h-[1px]  bg-white/30 mx-auto my-3`}
                ></div>

                <div
                  className={`flex w-full items-center justify-between text-xs mb-1 text-white/50 uppercase `}
                >
                  <span className={``}>Market Supply Balance</span>
                  <span className={`flex font-bold pl-2`}>
                    {supplyBalanceFrom}
                    <span className="mx-1">{`->`}</span>
                    <ResultHandler
                      isLoading={isLoadingUpdatedAssets}
                      width="16"
                      height="16"
                    >
                      {supplyBalanceTo}
                    </ResultHandler>
                    {/* this will be dynamic */}
                  </span>
                </div>
                <div
                  className={`flex w-full items-center justify-between text-xs mb-1 text-white/50 uppercase`}
                >
                  <span className={``}>Market Supply APR</span>
                  <span className={`flex font-bold pl-2`}>
                    {`${supplyAPY?.toFixed(2)}%`}
                    <span className="mx-1">{`->`}</span>
                    <ResultHandler
                      isLoading={isLoadingUpdatedAssets}
                      width="16"
                      height="16"
                    >
                      {updatedSupplyAPY?.toFixed(2)}%
                    </ResultHandler>
                  </span>
                </div>
                <div
                  className={`flex w-full items-center justify-between gap-2  text-sm mb-1 mt-4 text-darkone `}
                >
                  {transactionSteps.length > 0 ? (
                    <TransactionStepsHandler
                      transactionSteps={transactionSteps}
                      resetTransactionSteps={resetTransactionSteps}
                    />
                  ) : (
                    <button
                      className={`w-full rounded-md py-1 transition-colors ${
                        amount && amount > 0 ? 'bg-accent' : 'bg-stone-500'
                      } `}
                      onClick={withdrawAmount}
                    >
                      Withdraw {selectedMarketData.underlyingSymbol}
                    </button>
                  )}
                </div>
                {/* <Approved /> */}
              </div>
            </>
          )}
          {(mode === 'BORROW' || mode === 'DEFAULT') && (
            <>
              <div className={`min-w-full py-5 px-[6%] h-min`}>
                {/* ---------------------------------------------------------------------------- */}
                {/* SUPPLY-borrow section */}
                {/* ---------------------------------------------------------------------------- */}
                <Amount
                  selectedMarketData={selectedMarketData}
                  handleInput={(val?: number) => setAmount(val)}
                  amount={amount}
                  max={maxBorrowAmount?.number ?? 0}
                  symbol={selectedMarketData.underlyingSymbol}
                  hintText="Max Borrow Amount"
                  isLoading={isLoadingMaxBorrowAmount}
                />
                <SliderComponent
                  currentUtilizationPercentage={currentUtilizationPercentage}
                  handleUtilization={handleBorrowUtilization}
                />
                <div
                  className={` w-full h-[1px]  bg-white/30 mx-auto my-3`}
                ></div>
                <div
                  className={`flex w-full items-center justify-between mb-2 text-xs text-white/50 `}
                >
                  <span className={``}>MIN BORROW</span>
                  <span className={`font-bold pl-2`}>
                    {minBorrowAmountAsNumber}
                    {/* this will be dynamic */}
                  </span>
                </div>
                <div
                  className={`flex w-full items-center justify-between mb-2 text-xs text-white/50 `}
                >
                  <span className={``}>MAX BORROW</span>
                  <span className={`font-bold pl-2`}>
                    {maxBorrowAmount?.number?.toFixed(
                      parseInt(selectedMarketData.underlyingDecimals.toString())
                    ) ?? '0.00'}
                    {/* this will be dynamic */}
                  </span>
                </div>
                <div
                  className={`flex w-full items-center justify-between mb-2 text-xs text-white/50 `}
                >
                  <span className={``}>CURRENTLY BORROWING</span>
                  <span className={`flex font-bold pl-2`}>
                    {`${borrowBalanceFrom}`}
                    <span className="mx-1">{`->`}</span>
                    <ResultHandler
                      isLoading={isLoadingUpdatedAssets}
                      width="16"
                      height="16"
                    >
                      {borrowBalanceTo}
                    </ResultHandler>
                  </span>
                </div>
                <div
                  className={`flex w-full items-center justify-between text-xs mb-1 text-white/50 uppercase`}
                >
                  <span className={``}>Market Borrow Apr</span>
                  <span className={`flex font-bold pl-2`}>
                    {`${borrowAPR?.toFixed(2)}%`}
                    <span className="mx-1">{`->`}</span>
                    <ResultHandler
                      isLoading={isLoadingUpdatedAssets}
                      width="16"
                      height="16"
                    >
                      {updatedBorrowAPR?.toFixed(2)}%
                    </ResultHandler>
                  </span>
                </div>
                <div
                  className={` w-full h-[1px]  bg-white/30 mx-auto my-3`}
                ></div>
                <div
                  className={`flex w-full items-center justify-between gap-2  text-sm mb-1 mt-4 text-darkone `}
                >
                  {transactionSteps.length > 0 ? (
                    <TransactionStepsHandler
                      transactionSteps={transactionSteps}
                      resetTransactionSteps={resetTransactionSteps}
                    />
                  ) : (
                    <button
                      className={`w-full rounded-md py-1 transition-colors ${
                        amount &&
                        amount > 0 &&
                        minBorrowAmount &&
                        amount >= minBorrowAmountAsNumber &&
                        maxBorrowAmount &&
                        amount <= maxBorrowAmount.number
                          ? 'bg-accent'
                          : 'bg-stone-500'
                      } `}
                      onClick={borrowAmount}
                    >
                      Borrow {selectedMarketData.underlyingSymbol}
                    </button>
                  )}
                </div>
              </div>
              <div className={`min-w-full py-5 px-[6%] h-min`}>
                {/* ---------------------------------------------------------------------------- */}
                {/* SUPPLY-repay section */}
                {/* ---------------------------------------------------------------------------- */}
                <Amount
                  selectedMarketData={selectedMarketData}
                  handleInput={(val?: number) => setAmount(val)}
                  amount={amount}
                  hintText={'Max Repay Amount'}
                  max={parseFloat(
                    formatUnits(
                      maxRepayAmount ?? '0',
                      selectedMarketData.underlyingDecimals
                    )
                  )}
                  symbol={selectedMarketData.underlyingSymbol}
                  isLoading={isLoadingMaxRepayAmount}
                />
                <SliderComponent
                  currentUtilizationPercentage={currentUtilizationPercentage}
                  handleUtilization={handleRepayUtilization}
                />
                <div
                  className={` w-full h-[1px]  bg-white/30 mx-auto my-3`}
                ></div>
                <div
                  className={`flex w-full items-center justify-between mb-2 text-xs text-white/50 `}
                >
                  <span className={``}>CURRENTLY BORROWING</span>
                  <span className={`flex font-bold pl-2`}>
                    {`${borrowBalanceFrom}`}
                    <span className="mx-1">{`->`}</span>
                    <ResultHandler
                      isLoading={isLoadingUpdatedAssets}
                      width="16"
                      height="16"
                    >
                      {borrowBalanceTo}
                    </ResultHandler>
                  </span>
                </div>
                <div
                  className={`flex w-full items-center justify-between text-xs mb-1 text-white/50 uppercase`}
                >
                  <span className={``}>Market Borrow Apr</span>
                  <span className={`flex font-bold pl-2`}>
                    {`${borrowAPR?.toFixed(2)}%`}
                    <span className="mx-1">{`->`}</span>
                    <ResultHandler
                      isLoading={isLoadingUpdatedAssets}
                      width="16"
                      height="16"
                    >
                      {updatedBorrowAPR?.toFixed(2)}%
                    </ResultHandler>
                  </span>
                </div>
                <div
                  className={` w-full h-[1px]  bg-white/30 mx-auto my-3`}
                ></div>
                <div
                  className={`flex w-full items-center justify-between gap-2  text-sm mb-1 mt-4 text-darkone `}
                >
                  {transactionSteps.length > 0 ? (
                    <TransactionStepsHandler
                      transactionSteps={transactionSteps}
                      resetTransactionSteps={resetTransactionSteps}
                    />
                  ) : (
                    <button
                      className={`w-full rounded-md py-1 transition-colors ${
                        amount && amount > 0 && currentBorrowAmountAsFloat
                          ? 'bg-accent'
                          : 'bg-stone-500'
                      } `}
                      onClick={repayAmount}
                    >
                      Repay {selectedMarketData.underlyingSymbol}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Popup;

/*mode should be of 
supply consist of collateral , withdraw
 borrow ( borrow repay)
manage collateral withdraw borrow repay - default
*/

/* <div className={``}></div>  <p className={``}></p>
          <p className={``}></p>  colleteralT , borrowingT , lendingT , cAPR , lAPR , bAPR} */
