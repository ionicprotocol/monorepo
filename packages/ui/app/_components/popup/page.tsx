'use client';
/* eslint-disable @next/next/no-img-element */
// import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';

import dynamic from 'next/dynamic';

import { useQueryClient } from '@tanstack/react-query';
import millify from 'millify';
import toast from 'react-hot-toast';
import {
  type Address,
  formatEther,
  formatUnits,
  maxUint256,
  parseEther,
  parseUnits
} from 'viem';
import { useChainId } from 'wagmi';

import { INFO_MESSAGES } from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useBorrowCapsDataForAsset } from '@ui/hooks/ionic/useBorrowCapsDataForAsset';
import { useSupplyCapsDataForAsset } from '@ui/hooks/ionic/useSupplyCapsDataForPool';
import useUpdatedUserAssets from '@ui/hooks/ionic/useUpdatedUserAssets';
import {
  useHealthFactor,
  useHealthFactorPrediction
} from '@ui/hooks/pools/useHealthFactor';
import { useUsdPrice } from '@ui/hooks/useAllUsdPrices';
import { useBorrowMinimum } from '@ui/hooks/useBorrowMinimum';
import type { LoopMarketData } from '@ui/hooks/useLoopMarkets';
import { useMaxBorrowAmount } from '@ui/hooks/useMaxBorrowAmount';
import { useMaxRepayAmount } from '@ui/hooks/useMaxRepayAmount';
import { useMaxSupplyAmount } from '@ui/hooks/useMaxSupplyAmount';
import { useMaxWithdrawAmount } from '@ui/hooks/useMaxWithdrawAmount';
import { useTotalSupplyAPYs } from '@ui/hooks/useTotalSupplyAPYs';
import type { MarketData } from '@ui/types/TokensDataMap';
import { errorCodeToMessage } from '@ui/utils/errorCodeToMessage';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

import Amount from './Amount';
import MemoizedDonutChart from './DonutChart';
import Loop from './Loop';
import SliderComponent from './Slider';
import Tab from './Tab';
import TransactionStepsHandler, {
  useTransactionSteps
} from './TransactionStepsHandler';
import ResultHandler from '../ResultHandler';

import { FundOperationMode } from '@ionicprotocol/types';

const SwapWidget = dynamic(() => import('../markets/SwapWidget'), {
  ssr: false
});

export enum PopupMode {
  SUPPLY = 1,
  WITHDRAW,
  BORROW,
  REPAY,
  LOOP
}

export enum HFPStatus {
  CRITICAL = 'CRITICAL',
  NORMAL = 'NORMAL',
  UNKNOWN = 'UNKNOWN',
  WARNING = 'WARNING'
}

interface IPopup {
  closePopup: () => void;
  comptrollerAddress: Address;
  loopMarkets?: LoopMarketData;
  mode?: PopupMode;
  selectedMarketData: MarketData;
}
const Popup = ({
  mode = PopupMode.SUPPLY,
  loopMarkets,
  selectedMarketData,
  closePopup,
  comptrollerAddress
}: IPopup) => {
  const { addStepsForAction, transactionSteps, upsertTransactionStep } =
    useTransactionSteps();
  const { currentSdk, address } = useMultiIonic();
  const chainId = useChainId();
  const { data: usdPrice } = useUsdPrice(chainId.toString());
  const pricePerSingleAsset = useMemo<number>(
    () =>
      parseFloat(formatEther(selectedMarketData.underlyingPrice)) *
      (usdPrice ?? 0),
    [selectedMarketData, usdPrice]
  );
  const { data: supplyCap } = useSupplyCapsDataForAsset(
    comptrollerAddress,
    selectedMarketData.cToken,
    chainId
  );
  const supplyCapAsNumber = useMemo<number>(
    () =>
      parseFloat(
        formatUnits(
          supplyCap?.supplyCaps ?? 0n,
          selectedMarketData.underlyingDecimals
        )
      ),
    [supplyCap, selectedMarketData.underlyingDecimals]
  );
  const supplyCapAsFiat = useMemo<number>(
    () => pricePerSingleAsset * supplyCapAsNumber,
    [pricePerSingleAsset, supplyCapAsNumber]
  );
  const totalSupplyAsNumber = useMemo<number>(
    () =>
      parseFloat(
        formatUnits(
          selectedMarketData.totalSupply,
          selectedMarketData.underlyingDecimals
        )
      ),
    [selectedMarketData.totalSupply, selectedMarketData.underlyingDecimals]
  );
  const { data: borrowCap } = useBorrowCapsDataForAsset(
    selectedMarketData.cToken,
    chainId
  );
  const borrowCapAsNumber = useMemo<number>(
    () =>
      parseFloat(
        formatUnits(
          borrowCap?.totalBorrowCap ?? 0n,
          selectedMarketData.underlyingDecimals
        )
      ),
    [borrowCap, selectedMarketData.underlyingDecimals]
  );
  const borrowCapAsFiat = useMemo<number>(
    () => pricePerSingleAsset * borrowCapAsNumber,
    [pricePerSingleAsset, borrowCapAsNumber]
  );
  const totalBorrowAsNumber = useMemo<number>(
    () =>
      parseFloat(
        formatUnits(
          selectedMarketData.totalBorrow,
          selectedMarketData.underlyingDecimals
        )
      ),
    [selectedMarketData.totalBorrow, selectedMarketData.underlyingDecimals]
  );
  const { data: minBorrowAmount } = useBorrowMinimum(
    selectedMarketData,
    chainId
  );
  const {
    data: maxSupplyAmount,
    isLoading: isLoadingMaxSupply,
    refetch: refetchMaxSupplyAmount
  } = useMaxSupplyAmount(selectedMarketData, comptrollerAddress, chainId);
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
  }, [assetsSupplyAprData, selectedMarketData.cToken]);
  const [active, setActive] = useState<PopupMode>(mode);
  const slide = useRef<HTMLDivElement>(null!);
  const [amount, setAmount] = useReducer(
    (_: string | undefined, value: string | undefined): string | undefined =>
      value,
    '0'
  );
  const { data: maxRepayAmount, isLoading: isLoadingMaxRepayAmount } =
    useMaxRepayAmount(selectedMarketData, chainId);
  const amountAsBInt = useMemo<bigint>(
    () =>
      parseUnits(
        amount?.toString() ?? '0',
        selectedMarketData.underlyingDecimals
      ),
    [amount, selectedMarketData.underlyingDecimals]
  );
  const { data: maxBorrowAmount, isLoading: isLoadingMaxBorrowAmount } =
    useMaxBorrowAmount(selectedMarketData, comptrollerAddress, chainId);

  // const setBorrow = useStore((state) => state.setBorrowAmount);

  const { data: healthFactor } = useHealthFactor(comptrollerAddress, chainId);
  const {
    data: _predictedHealthFactor,
    isLoading: isLoadingPredictedHealthFactor
  } = useHealthFactorPrediction(
    comptrollerAddress,
    address ?? ('' as Address),
    selectedMarketData.cToken,
    active === PopupMode.WITHDRAW
      ? (amountAsBInt * BigInt(1e18)) / selectedMarketData.exchangeRate
      : parseUnits('0', selectedMarketData.underlyingDecimals),
    active === PopupMode.BORROW
      ? amountAsBInt
      : parseUnits('0', selectedMarketData.underlyingDecimals),
    active === PopupMode.REPAY
      ? (amountAsBInt * BigInt(1e18)) / selectedMarketData.exchangeRate
      : parseUnits('0', selectedMarketData.underlyingDecimals)
  );

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
      amount: amountAsBInt,
      assets: [selectedMarketData],
      index: 0,
      mode: currentFundOperation,
      poolChainId: chainId
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
        borrowBalanceFrom: Number(
          formatUnits(
            selectedMarketData.borrowBalance,
            selectedMarketData.underlyingDecimals
          )
        ).toLocaleString('en-US', { maximumFractionDigits: 2 }),
        borrowBalanceTo: updatedAsset
          ? Number(
              formatUnits(
                updatedAsset.borrowBalance,
                updatedAsset.underlyingDecimals
              )
            ).toLocaleString('en-US', { maximumFractionDigits: 2 })
          : undefined,
        supplyAPY: currentSdk.ratePerBlockToAPY(
          selectedMarketData.supplyRatePerBlock,
          blocksPerMinute
        ),
        supplyBalanceFrom: Number(
          formatUnits(
            selectedMarketData.supplyBalance,
            selectedMarketData.underlyingDecimals
          )
        ).toLocaleString('en-US', { maximumFractionDigits: 2 }),
        supplyBalanceTo: updatedAsset
          ? Math.abs(
              Number(
                formatUnits(
                  updatedAsset.supplyBalance,
                  updatedAsset.underlyingDecimals
                )
              )
            ).toLocaleString('en-US', { maximumFractionDigits: 2 })
          : undefined,
        totalBorrows: updatedAssets?.reduce(
          (acc, cur) => acc + cur.borrowBalanceFiat,
          0
        ),
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
        updatedTotalBorrows: updatedAssets
          ? updatedAssets.reduce((acc, cur) => acc + cur.borrowBalanceFiat, 0)
          : undefined
      };
    }

    return {};
  }, [chainId, updatedAsset, selectedMarketData, updatedAssets, currentSdk]);
  const [enableCollateral, setEnableCollateral] = useState<boolean>(
    selectedMarketData.membership && selectedMarketData.supplyBalance > 0n
  );
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [loopOpen, setLoopOpen] = useState<boolean>(false);
  const [swapWidgetOpen, setSwapWidgetOpen] = useState(false);
  const predictedHealthFactor = useMemo<bigint | undefined>(() => {
    if (updatedAsset && updatedAsset?.supplyBalanceFiat < 0.01) {
      return maxUint256;
    }

    if (amountAsBInt === 0n) {
      return parseEther(healthFactor ?? '0');
    }

    return _predictedHealthFactor;
  }, [_predictedHealthFactor, updatedAsset, amountAsBInt, healthFactor]);

  const hfpStatus = useMemo<HFPStatus>(() => {
    if (!predictedHealthFactor) {
      return HFPStatus.UNKNOWN;
    }

    if (predictedHealthFactor === maxUint256) {
      return HFPStatus.NORMAL;
    }

    if (updatedAsset && updatedAsset?.supplyBalanceFiat < 0.01) {
      return HFPStatus.NORMAL;
    }

    const predictedHealthFactorNumber = Number(
      formatEther(predictedHealthFactor)
    );

    if (predictedHealthFactorNumber <= 1.1) {
      return HFPStatus.CRITICAL;
    }

    if (predictedHealthFactorNumber <= 1.2) {
      return HFPStatus.WARNING;
    }

    return HFPStatus.NORMAL;
  }, [predictedHealthFactor, updatedAsset]);
  const queryClient = useQueryClient();

  /**
   * Fade in animation
   */
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let closeTimer: ReturnType<typeof setTimeout>;

    if (!isMounted) {
      closeTimer = setTimeout(() => {
        closePopup();
      }, 301);
    }

    return () => {
      clearTimeout(closeTimer);
    };
  }, [isMounted, closePopup]);

  /**
   * Update utilization percentage when amount changes
   */
  useEffect(() => {
    switch (active) {
      case PopupMode.SUPPLY: {
        const div =
          Number(formatEther(amountAsBInt)) /
          (maxSupplyAmount?.bigNumber && maxSupplyAmount.number > 0
            ? Number(formatEther(maxSupplyAmount?.bigNumber))
            : 1);
        setCurrentUtilizationPercentage(Math.round(div * 100));

        break;
      }

      case PopupMode.WITHDRAW: {
        const div =
          Number(formatEther(amountAsBInt)) /
          (maxWithdrawAmount && maxWithdrawAmount > 0n
            ? Number(formatEther(maxWithdrawAmount))
            : 1);
        setCurrentUtilizationPercentage(Math.round(div * 100));

        break;
      }

      case PopupMode.BORROW: {
        const div =
          Number(formatEther(amountAsBInt)) /
          (maxBorrowAmount?.bigNumber && maxBorrowAmount.number > 0
            ? Number(formatEther(maxBorrowAmount?.bigNumber))
            : 1);
        setCurrentUtilizationPercentage(Math.round(div * 100));
        // setBorrow(
        //   maxBorrowAmount?.bigNumber && maxBorrowAmount.number > 0
        //     ? formatEther(maxBorrowAmount?.bigNumber)
        //     : ''
        // );
        break;
      }

      case PopupMode.REPAY: {
        const div =
          Number(formatEther(amountAsBInt)) /
          (maxRepayAmount && maxRepayAmount > 0n
            ? Number(formatEther(maxRepayAmount))
            : 1);
        setCurrentUtilizationPercentage(Math.round(div * 100));

        break;
      }

      case PopupMode.LOOP: {
        setLoopOpen(true);

        break;
      }
    }
  }, [
    amountAsBInt,
    active,
    maxBorrowAmount,
    maxRepayAmount,
    maxSupplyAmount,
    maxWithdrawAmount
    // setBorrow
  ]);

  useEffect(() => {
    setAmount('0');
    setCurrentUtilizationPercentage(0);
    upsertTransactionStep(undefined);

    switch (active) {
      case PopupMode.SUPPLY:
        slide.current.style.transform = 'translateX(0%)';

        setCurrentFundOperation(FundOperationMode.SUPPLY);

        break;

      case PopupMode.WITHDRAW:
        slide.current.style.transform = 'translateX(-100%)';

        setCurrentFundOperation(FundOperationMode.WITHDRAW);

        break;

      case PopupMode.BORROW:
        slide.current.style.transform = 'translateX(0%)';

        setCurrentFundOperation(FundOperationMode.BORROW);

        break;

      case PopupMode.REPAY:
        slide.current.style.transform = 'translateX(-100%)';

        setCurrentFundOperation(FundOperationMode.REPAY);

        break;
    }
  }, [active, mode, upsertTransactionStep]);

  const initiateCloseAnimation = () => setIsMounted(false);

  const handleSupplyUtilization = (utilizationPercentage: number) => {
    if (utilizationPercentage >= 100) {
      setAmount(
        formatUnits(
          maxSupplyAmount?.bigNumber ?? 0n,
          parseInt(selectedMarketData.underlyingDecimals.toString())
        )
      );

      return;
    }

    setAmount(
      ((utilizationPercentage / 100) * (maxSupplyAmount?.number ?? 0)).toFixed(
        parseInt(selectedMarketData.underlyingDecimals.toString())
      )
    );
  };

  const handleWithdrawUtilization = (utilizationPercentage: number) => {
    if (utilizationPercentage >= 100) {
      setAmount(
        formatUnits(
          maxWithdrawAmount ?? 0n,
          parseInt(selectedMarketData.underlyingDecimals.toString())
        )
      );

      return;
    }

    setAmount(
      (
        (utilizationPercentage / 100) *
        parseFloat(
          formatUnits(
            maxWithdrawAmount ?? 0n,
            selectedMarketData.underlyingDecimals
          ) ?? '0.0'
        )
      ).toFixed(parseInt(selectedMarketData.underlyingDecimals.toString()))
    );
  };

  const handleBorrowUtilization = (utilizationPercentage: number) => {
    if (utilizationPercentage >= 100) {
      setAmount(
        formatUnits(
          maxBorrowAmount?.bigNumber ?? 0n,
          parseInt(selectedMarketData.underlyingDecimals.toString())
        )
      );

      return;
    }

    setAmount(
      ((utilizationPercentage / 100) * (maxBorrowAmount?.number ?? 0)).toFixed(
        parseInt(selectedMarketData.underlyingDecimals.toString())
      )
    );
  };

  const handleRepayUtilization = (utilizationPercentage: number) => {
    if (utilizationPercentage >= 100) {
      setAmount(
        formatUnits(
          maxRepayAmount ?? 0n,
          parseInt(selectedMarketData.underlyingDecimals.toString())
        )
      );

      return;
    }

    setAmount(
      (
        (utilizationPercentage / 100) *
        parseFloat(
          formatUnits(
            maxRepayAmount ?? 0n,
            selectedMarketData.underlyingDecimals
          ) ?? '0.0'
        )
      ).toFixed(parseInt(selectedMarketData.underlyingDecimals.toString()))
    );
  };

  const resetTransactionSteps = () => {
    refetchUsedQueries();
    upsertTransactionStep(undefined);
    initiateCloseAnimation();
  };

  const refetchUsedQueries = async () => {
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
  };

  const supplyAmount = async () => {
    if (
      !transactionSteps.length &&
      currentSdk &&
      address &&
      amount &&
      amountAsBInt > 0n &&
      maxSupplyAmount &&
      amountAsBInt <= maxSupplyAmount.bigNumber
    ) {
      let currentTransactionStep = 0;
      addStepsForAction([
        {
          error: false,
          message: INFO_MESSAGES.SUPPLY.APPROVE,
          success: false
        },
        ...(enableCollateral && !selectedMarketData.membership
          ? [
              {
                error: false,
                message: INFO_MESSAGES.SUPPLY.COLLATERAL,
                success: false
              }
            ]
          : []),
        {
          error: false,
          message: INFO_MESSAGES.SUPPLY.SUPPLYING,
          success: false
        }
      ]);

      try {
        const token = currentSdk.getEIP20TokenInstance(
          selectedMarketData.underlyingToken,
          currentSdk.publicClient as any
        );
        const hasApprovedEnough =
          (await token.read.allowance([address, selectedMarketData.cToken])) >=
          amountAsBInt;

        if (!hasApprovedEnough) {
          const tx = await currentSdk.approve(
            selectedMarketData.cToken,
            selectedMarketData.underlyingToken,
            (amountAsBInt * 105n) / 100n
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

        if (enableCollateral && !selectedMarketData.membership) {
          const tx = await currentSdk.enterMarkets(
            selectedMarketData.cToken,
            comptrollerAddress
          );

          upsertTransactionStep({
            index: currentTransactionStep,
            transactionStep: {
              ...transactionSteps[currentTransactionStep],
              txHash: tx
            }
          });

          await currentSdk.publicClient.waitForTransactionReceipt({ hash: tx });

          upsertTransactionStep({
            index: currentTransactionStep,
            transactionStep: {
              ...transactionSteps[currentTransactionStep],
              success: true
            }
          });

          currentTransactionStep++;
        }

        const { tx, errorCode } = await currentSdk.mint(
          selectedMarketData.cToken,
          amountAsBInt
        );

        if (errorCode) {
          console.error(errorCode);

          throw new Error('Error during supplying!');
        }

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            txHash: tx
          }
        });

        tx &&
          (await currentSdk.publicClient.waitForTransactionReceipt({
            hash: tx
          }));

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            success: true
          }
        });

        toast.success(
          `Supplied ${amount} ${selectedMarketData.underlyingSymbol}`
        );
      } catch (error) {
        toast.error('Error while supplying!');

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

  const withdrawAmount = async () => {
    if (
      !transactionSteps.length &&
      currentSdk &&
      address &&
      amount &&
      amountAsBInt > 0n &&
      maxWithdrawAmount
    ) {
      const currentTransactionStep = 0;
      addStepsForAction([
        {
          error: false,
          message: INFO_MESSAGES.WITHDRAW.WITHDRAWING,
          success: false
        }
      ]);

      try {
        const amountToWithdraw = amountAsBInt;

        console.warn(
          'Withdraw params:',
          selectedMarketData.cToken,
          amountToWithdraw.toString()
        );
        let isMax = false;
        if (amountToWithdraw === maxWithdrawAmount) {
          isMax = true;
        }

        const { tx, errorCode } = await currentSdk.withdraw(
          selectedMarketData.cToken,
          amountToWithdraw,
          isMax
        );

        if (errorCode) {
          console.error(errorCode);

          throw new Error('Error during withdrawing!');
        }

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            txHash: tx
          }
        });

        tx &&
          (await currentSdk.publicClient.waitForTransactionReceipt({
            hash: tx
          }));

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            success: true
          }
        });

        toast.success(
          `Withdrawn ${amount} ${selectedMarketData.underlyingSymbol}`
        );
      } catch (error) {
        console.error(error);

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            error: true
          }
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
      amountAsBInt > 0n &&
      minBorrowAmount &&
      amountAsBInt >= (minBorrowAmount.minBorrowAsset ?? 0n) &&
      maxBorrowAmount &&
      amountAsBInt <= maxBorrowAmount.bigNumber
    ) {
      const currentTransactionStep = 0;
      addStepsForAction([
        {
          error: false,
          message: INFO_MESSAGES.BORROW.BORROWING,
          success: false
        }
      ]);

      try {
        const { tx, errorCode } = await currentSdk.borrow(
          selectedMarketData.cToken,
          amountAsBInt
        );

        if (errorCode) {
          console.error(errorCode);

          throw new Error('Error during borrowing!');
        }

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            txHash: tx
          }
        });

        tx &&
          (await currentSdk.publicClient.waitForTransactionReceipt({
            hash: tx
          }));

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            success: true
          }
        });

        toast.success(
          `Borrowed ${amount} ${selectedMarketData.underlyingSymbol}`
        );
      } catch (error) {
        console.error(error);

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            error: true
          }
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
      amountAsBInt > 0n &&
      currentBorrowAmountAsFloat
    ) {
      let currentTransactionStep = 0;
      addStepsForAction([
        {
          error: false,
          message: INFO_MESSAGES.REPAY.APPROVE,
          success: false
        },
        {
          error: false,
          message: INFO_MESSAGES.REPAY.REPAYING,
          success: false
        }
      ]);

      try {
        const token = currentSdk.getEIP20TokenInstance(
          selectedMarketData.underlyingToken,
          currentSdk.publicClient as any
        );
        const hasApprovedEnough =
          (await token.read.allowance([address, selectedMarketData.cToken])) >=
          amountAsBInt;

        if (!hasApprovedEnough) {
          const tx = await currentSdk.approve(
            selectedMarketData.cToken,
            selectedMarketData.underlyingToken,
            (amountAsBInt * 105n) / 100n
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

        const isRepayingMax =
          amountAsBInt >= (selectedMarketData.borrowBalance ?? 0n);
        console.warn(
          'Repay params:',
          selectedMarketData.cToken,
          isRepayingMax,
          isRepayingMax
            ? selectedMarketData.borrowBalance.toString()
            : amountAsBInt.toString()
        );
        const { tx, errorCode } = await currentSdk.repay(
          selectedMarketData.cToken,
          isRepayingMax,
          isRepayingMax ? selectedMarketData.borrowBalance : amountAsBInt
        );

        if (errorCode) {
          console.error(errorCode);

          throw new Error('Error during repaying!');
        }

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            txHash: tx
          }
        });

        tx &&
          (await currentSdk.publicClient.waitForTransactionReceipt({
            hash: tx
          }));

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

        toast.error('Error while repaying!');
      }
    }
  };

  const handleCollateralToggle = async () => {
    if (!transactionSteps.length) {
      if (currentSdk && selectedMarketData.supplyBalance > 0n) {
        const currentTransactionStep = 0;

        try {
          let tx;

          switch (enableCollateral) {
            case true: {
              const comptrollerContract = currentSdk.createComptroller(
                comptrollerAddress,
                currentSdk.publicClient
              );

              const exitCode = (
                await comptrollerContract.simulate.exitMarket(
                  [selectedMarketData.cToken],
                  { account: currentSdk.walletClient!.account!.address }
                )
              ).result;

              if (exitCode !== 0n) {
                toast.error(errorCodeToMessage(Number(exitCode)));

                return;
              }

              addStepsForAction([
                {
                  error: false,
                  message: INFO_MESSAGES.COLLATERAL.DISABLE,
                  success: false
                }
              ]);

              upsertTransactionStep({
                index: currentTransactionStep,
                transactionStep: {
                  error: false,
                  message: INFO_MESSAGES.COLLATERAL.DISABLE,
                  success: false
                }
              });

              tx = await comptrollerContract.write.exitMarket(
                [selectedMarketData.cToken],
                {
                  account: currentSdk.walletClient!.account!.address,
                  chain: currentSdk.publicClient.chain
                }
              );

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

              setEnableCollateral(false);

              upsertTransactionStep({
                index: currentTransactionStep,
                transactionStep: {
                  ...transactionSteps[currentTransactionStep],
                  success: true
                }
              });

              break;
            }

            case false: {
              addStepsForAction([
                {
                  error: false,
                  message: INFO_MESSAGES.COLLATERAL.ENABLE,
                  success: false
                }
              ]);

              upsertTransactionStep({
                index: currentTransactionStep,
                transactionStep: {
                  error: false,
                  message: INFO_MESSAGES.COLLATERAL.ENABLE,
                  success: false
                }
              });

              tx = await currentSdk.enterMarkets(
                selectedMarketData.cToken,
                comptrollerAddress
              );

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

              setEnableCollateral(true);

              upsertTransactionStep({
                index: currentTransactionStep,
                transactionStep: {
                  ...transactionSteps[currentTransactionStep],
                  success: true
                }
              });

              break;
            }
          }

          refetchUsedQueries();

          return;
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

      setEnableCollateral(!enableCollateral);
    }
  };

  const normalizedHealthFactor = useMemo(() => {
    return healthFactor
      ? healthFactor === '-1'
        ? '∞'
        : Number(healthFactor).toFixed(2)
      : undefined;
  }, [healthFactor]);

  const normalizedPredictedHealthFactor = useMemo(() => {
    return predictedHealthFactor === maxUint256
      ? '∞'
      : Number(formatEther(predictedHealthFactor ?? 0n)).toFixed(2);
  }, [predictedHealthFactor]);
  return (
    <>
      <div
        className={` z-40 fixed top-0 right-0 w-full h-screen  bg-black/25 flex transition-opacity duration-300 overflow-y-auto animate-fade-in ${
          isMounted && 'animated'
        }`}
      >
        <SwapWidget
          close={() => setSwapWidgetOpen(false)}
          open={swapWidgetOpen}
          fromChain={chainId}
          toChain={chainId}
          toToken={selectedMarketData.underlyingToken}
          onRouteExecutionCompleted={() => refetchMaxSupplyAmount()}
        />
        <div
          className={`w-[85%] sm:w-[55%] md:w-[45%] relative m-auto bg-grayUnselect rounded-xl overflow-hidden scrollbar-hide transition-all duration-300 animate-pop-in ${
            isMounted && 'animated'
          }`}
        >
          <img
            alt="close"
            className={` h-5 z-10 absolute right-4 top-3 cursor-pointer `}
            onClick={initiateCloseAnimation}
            src="/img/assets/close.png"
          />
          <div className={`flex w-20 mx-auto mt-4 mb-2 relative text-center`}>
            <img
              alt="modlogo"
              className="mx-auto"
              height="32"
              src={`/img/symbols/32/color/${selectedMarketData?.underlyingSymbol.toLowerCase()}.png`}
              width="32"
            />
          </div>
          <Tab
            active={active}
            loopPossible={
              loopMarkets
                ? loopMarkets[selectedMarketData.cToken].length > 0
                : false
            }
            mode={mode}
            setActive={setActive}
            borrowPossible={borrowCap ? borrowCap?.totalBorrowCap > 1n : true}
          />
          {/* all the respective slides */}

          <div
            className={`w-full transition-all duration-300 ease-linear h-min  flex`}
            ref={slide}
          >
            {(mode === PopupMode.SUPPLY || mode === PopupMode.WITHDRAW) && (
              <>
                {/* ---------------------------------------------------------------------------- */}
                {/* SUPPLY-Collateral section */}
                {/* ---------------------------------------------------------------------------- */}
                <div className={`min-w-full pb-5 px-[6%] h-min `}>
                  <button
                    className={`w-full font-bold uppercase rounded-md py-1 transition-colors bg-accent text-darkone text-xs mx-auto my-2`}
                    onClick={() => setSwapWidgetOpen(true)}
                  >
                    Get {selectedMarketData.underlyingSymbol}
                  </button>
                  {/* <div className={`w-full flex items-center justify-center`}> */}
                  {/* </div> */}
                  <Amount
                    amount={amount}
                    handleInput={(val?: string) => setAmount(val)}
                    isLoading={isLoadingMaxSupply}
                    max={formatUnits(
                      maxSupplyAmount?.bigNumber ?? 0n,
                      selectedMarketData.underlyingDecimals
                    )}
                    selectedMarketData={selectedMarketData}
                    symbol={selectedMarketData.underlyingSymbol}
                  />
                  <SliderComponent
                    currentUtilizationPercentage={currentUtilizationPercentage}
                    handleUtilization={handleSupplyUtilization}
                  />

                  <div
                    className={` w-full h-[1px]  bg-white/30 mx-auto my-3`}
                  />
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
                  />
                  <div
                    className={`flex w-full items-center justify-between text-xs mb-1 text-white/50 uppercase `}
                  >
                    <span className={``}>Market Supply Balance</span>
                    <span className={`flex font-bold pl-2`}>
                      {supplyBalanceFrom}
                      <span className="mx-1">{`->`}</span>
                      <ResultHandler
                        height="16"
                        isLoading={isLoadingUpdatedAssets}
                        width="16"
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
                        height="16"
                        isLoading={isLoadingUpdatedAssets}
                        width="16"
                      >
                        {updatedSupplyAPY?.toFixed(2)}%
                      </ResultHandler>
                    </span>
                  </div>
                  {/* <div
                    className={`flex w-full items-center justify-between text-xs mb-1 text-white/50 uppercase`}
                  >
                    <span className={``}>Health Factor</span>
                    <span className={`flex font-bold pl-2`}>
                      {`${Number(healthFactor).toFixed(2)}`}
                      <span className="mx-1">{`->`}</span>
                      <ResultHandler
                        height="16"
                        isLoading={isLoadingPredictedHealthFactor}
                        width="16"
                      >
                        {Number(
                          formatEther(predictedHealthFactor ?? 0n)
                        ).toFixed(2)}
                      </ResultHandler>
                    </span>
                  </div> */}
                  <div
                    className={` w-full h-[1px]  bg-white/30 mx-auto my-3`}
                  />

                  <div className="flex justify-center items-center">
                    <ResultHandler
                      height="80"
                      isLoading={!totalSupplyAsNumber && !supplyCapAsNumber}
                      width="80"
                    >
                      <div className="w-[80px] mr-4">
                        <MemoizedDonutChart
                          max={supplyCapAsNumber}
                          value={totalSupplyAsNumber}
                        />
                      </div>

                      <div className="text">
                        <div className="text-gray-400">Total Supplied:</div>

                        <div className="text-white">
                          <strong>
                            {millify(Math.round(totalSupplyAsNumber))} of{' '}
                            {millify(Math.round(supplyCapAsNumber))}{' '}
                            {selectedMarketData.underlyingSymbol}
                          </strong>
                        </div>

                        <div className="text-small text-gray-300">
                          $
                          {millify(
                            Math.round(selectedMarketData.totalSupplyFiat)
                          )}{' '}
                          of ${millify(Math.round(supplyCapAsFiat))}
                        </div>
                      </div>
                    </ResultHandler>
                  </div>

                  <div
                    className={` w-full h-[1px]  bg-white/30 mx-auto my-3`}
                  />
                  <div className="flex items-center text-sm text-white/50 uppercase">
                    Enable collateral
                    <div className="ml-2">
                      <span
                        className={`toggle ${enableCollateral && 'is-on'}`}
                        onClick={handleCollateralToggle}
                      />
                    </div>
                  </div>
                  <div
                    className={`flex w-full items-center justify-between gap-2 text-sm mb-1 mt-4 text-darkone `}
                  >
                    {transactionSteps.length > 0 ? (
                      <TransactionStepsHandler
                        chainId={chainId}
                        resetTransactionSteps={resetTransactionSteps}
                        transactionSteps={transactionSteps}
                      />
                    ) : (
                      <>
                        <button
                          className={`w-full font-bold uppercase rounded-md py-1 transition-colors ${
                            amount && amountAsBInt > 0n
                              ? 'bg-accent'
                              : 'bg-stone-500'
                          } `}
                          onClick={() => supplyAmount()}
                        >
                          Supply {selectedMarketData.underlyingSymbol}
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
                    amount={amount}
                    handleInput={(val?: string) => setAmount(val)}
                    hintText="Max Withdraw"
                    isLoading={isLoadingMaxWithdrawAmount}
                    max={formatUnits(
                      maxWithdrawAmount ?? 0n,
                      selectedMarketData.underlyingDecimals
                    )}
                    selectedMarketData={selectedMarketData}
                    symbol={selectedMarketData.underlyingSymbol}
                  />
                  <SliderComponent
                    currentUtilizationPercentage={currentUtilizationPercentage}
                    handleUtilization={handleWithdrawUtilization}
                  />

                  {hfpStatus === HFPStatus.WARNING && (
                    <div className="text-lime text-xs text-center">
                      Warning: You are close to the liquidation threshold and
                      will need to manage your health factor.
                    </div>
                  )}

                  {hfpStatus === HFPStatus.CRITICAL && (
                    <div className="text-error text-xs text-center">
                      Health factor too low.
                    </div>
                  )}

                  <div
                    className={` w-full h-[1px]  bg-white/30 mx-auto my-3`}
                  />

                  <div
                    className={`flex w-full items-center justify-between text-xs mb-1 text-white/50 uppercase `}
                  >
                    <span className={``}>Market Supply Balance</span>
                    <span className={`flex font-bold pl-2`}>
                      {supplyBalanceFrom}
                      <span className="mx-1">{`->`}</span>
                      <ResultHandler
                        height="16"
                        isLoading={isLoadingUpdatedAssets}
                        width="16"
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
                        height="16"
                        isLoading={isLoadingUpdatedAssets}
                        width="16"
                      >
                        {updatedSupplyAPY?.toFixed(2)}%
                      </ResultHandler>
                    </span>
                  </div>
                  <div
                    className={`flex w-full items-center justify-between text-xs mb-1 text-white/50 uppercase`}
                  >
                    <span className={``}>Health Factor</span>
                    <span className={`flex font-bold pl-2`}>
                      {`${normalizedHealthFactor}`}
                      <span className="mx-1">{`->`}</span>
                      <ResultHandler
                        height="16"
                        isLoading={isLoadingPredictedHealthFactor}
                        width="16"
                      >
                        {normalizedPredictedHealthFactor}
                      </ResultHandler>
                    </span>
                  </div>
                  <div
                    className={`flex w-full items-center justify-between gap-2  text-sm mb-1 mt-4 text-darkone `}
                  >
                    {transactionSteps.length > 0 ? (
                      <TransactionStepsHandler
                        chainId={chainId}
                        resetTransactionSteps={resetTransactionSteps}
                        transactionSteps={transactionSteps}
                      />
                    ) : (
                      <button
                        className={`w-full font-bold uppercase rounded-md py-1 transition-colors ${
                          amount &&
                          amountAsBInt > 0n &&
                          !isLoadingPredictedHealthFactor &&
                          hfpStatus !== HFPStatus.CRITICAL &&
                          hfpStatus !== HFPStatus.UNKNOWN
                            ? 'bg-accent'
                            : 'bg-stone-500'
                        } `}
                        disabled={
                          isLoadingPredictedHealthFactor ||
                          hfpStatus === HFPStatus.CRITICAL ||
                          hfpStatus === HFPStatus.UNKNOWN
                        }
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
            {(mode === PopupMode.BORROW || mode === PopupMode.REPAY) && (
              <>
                <div className={`min-w-full py-5 px-[6%] h-min`}>
                  {/* ---------------------------------------------------------------------------- */}
                  {/* SUPPLY-borrow section */}
                  {/* ---------------------------------------------------------------------------- */}
                  <Amount
                    amount={amount}
                    handleInput={(val?: string) => setAmount(val)}
                    hintText="Max Borrow Amount"
                    isLoading={isLoadingMaxBorrowAmount}
                    max={formatUnits(
                      maxBorrowAmount?.bigNumber ?? 0n,
                      selectedMarketData.underlyingDecimals
                    )}
                    selectedMarketData={selectedMarketData}
                    symbol={selectedMarketData.underlyingSymbol}
                  />
                  <SliderComponent
                    currentUtilizationPercentage={currentUtilizationPercentage}
                    handleUtilization={handleBorrowUtilization}
                  />

                  {hfpStatus === HFPStatus.WARNING && (
                    <div className="text-lime text-xs text-center">
                      Warning: You are close to the liquidation threshold and
                      will need to manage your health factor.
                    </div>
                  )}

                  {hfpStatus === HFPStatus.CRITICAL && (
                    <div className="text-error text-xs text-center">
                      Health factor too low.
                    </div>
                  )}

                  <div
                    className={` w-full h-[1px]  bg-white/30 mx-auto my-3`}
                  />
                  <div
                    className={`flex w-full items-center justify-between mb-2 text-xs text-white/50 `}
                  >
                    <span className={``}>MIN BORROW</span>
                    <span className={`font-bold pl-2`}>
                      {formatUnits(
                        minBorrowAmount?.minBorrowAsset ?? 0n,
                        selectedMarketData.underlyingDecimals
                      )}
                      {/* this will be dynamic */}
                    </span>
                  </div>
                  <div
                    className={`flex w-full items-center justify-between mb-2 text-xs text-white/50 `}
                  >
                    <span className={``}>MAX BORROW</span>
                    <span className={`font-bold pl-2`}>
                      {maxBorrowAmount?.number?.toFixed(
                        parseInt(
                          selectedMarketData.underlyingDecimals.toString()
                        )
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
                        height="16"
                        isLoading={isLoadingUpdatedAssets}
                        width="16"
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
                        height="16"
                        isLoading={isLoadingUpdatedAssets}
                        width="16"
                      >
                        {updatedBorrowAPR?.toFixed(2)}%
                      </ResultHandler>
                    </span>
                  </div>
                  <div
                    className={`flex w-full items-center justify-between text-xs mb-1 text-white/50 uppercase`}
                  >
                    <span className={``}>Health Factor</span>
                    <span className={`flex font-bold pl-2`}>
                      {`${normalizedHealthFactor}`}
                      <span className="mx-1">{`->`}</span>
                      <ResultHandler
                        height="16"
                        isLoading={isLoadingPredictedHealthFactor}
                        width="16"
                      >
                        {normalizedPredictedHealthFactor}
                      </ResultHandler>
                    </span>
                  </div>
                  <div
                    className={` w-full h-[1px]  bg-white/30 mx-auto my-3`}
                  />

                  <div className="flex justify-center items-center">
                    <ResultHandler
                      height="80"
                      isLoading={!totalBorrowAsNumber && !borrowCapAsNumber}
                      width="80"
                    >
                      <div className="w-[80px] mr-4">
                        <MemoizedDonutChart
                          max={borrowCapAsNumber}
                          value={totalBorrowAsNumber}
                        />
                      </div>

                      <div className="text">
                        <div className="text-gray-400">Total Borrowed:</div>

                        <div className="text-white">
                          <strong>
                            {millify(Math.round(totalBorrowAsNumber))} of{' '}
                            {millify(Math.round(borrowCapAsNumber))}{' '}
                            {selectedMarketData.underlyingSymbol}
                          </strong>
                        </div>

                        <div className="text-small text-gray-300">
                          $
                          {millify(
                            Math.round(selectedMarketData.totalBorrowFiat)
                          )}{' '}
                          of ${millify(Math.round(borrowCapAsFiat))}
                        </div>
                      </div>
                    </ResultHandler>
                  </div>

                  <div
                    className={` w-full h-[1px]  bg-white/30 mx-auto my-3`}
                  />
                  <div
                    className={`flex w-full items-center justify-between gap-2  text-sm mb-1 mt-4 text-darkone `}
                  >
                    {transactionSteps.length > 0 ? (
                      <TransactionStepsHandler
                        chainId={chainId}
                        resetTransactionSteps={resetTransactionSteps}
                        transactionSteps={transactionSteps}
                      />
                    ) : (
                      <button
                        className={`w-full font-bold uppercase rounded-md py-1 transition-colors ${
                          amount &&
                          amountAsBInt > 0n &&
                          minBorrowAmount &&
                          amountAsBInt >=
                            (minBorrowAmount.minBorrowAsset ?? 0n) &&
                          maxBorrowAmount &&
                          amountAsBInt <= (maxBorrowAmount?.bigNumber ?? 0n) &&
                          !isLoadingPredictedHealthFactor &&
                          hfpStatus !== HFPStatus.CRITICAL &&
                          hfpStatus !== HFPStatus.UNKNOWN
                            ? 'bg-accent'
                            : 'bg-stone-500'
                        } `}
                        disabled={
                          isLoadingPredictedHealthFactor ||
                          hfpStatus === HFPStatus.CRITICAL ||
                          hfpStatus === HFPStatus.UNKNOWN
                        }
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
                    amount={amount}
                    handleInput={(val?: string) => setAmount(val)}
                    hintText={'Max Repay Amount'}
                    isLoading={isLoadingMaxRepayAmount}
                    max={formatUnits(
                      maxRepayAmount ?? 0n,
                      selectedMarketData.underlyingDecimals
                    )}
                    selectedMarketData={selectedMarketData}
                    symbol={selectedMarketData.underlyingSymbol}
                  />
                  <SliderComponent
                    currentUtilizationPercentage={currentUtilizationPercentage}
                    handleUtilization={handleRepayUtilization}
                  />
                  <div
                    className={` w-full h-[1px]  bg-white/30 mx-auto my-3`}
                  />
                  <div
                    className={`flex w-full items-center justify-between mb-2 text-xs text-white/50 `}
                  >
                    <span className={``}>CURRENTLY BORROWING</span>
                    <span className={`flex font-bold pl-2`}>
                      <span className={`text-error`}>
                        {`${borrowBalanceFrom}`}
                      </span>
                      <span className="mx-1">{`->`}</span>
                      <ResultHandler
                        height="16"
                        isLoading={isLoadingUpdatedAssets}
                        width="16"
                      >
                        <span className="text-accent">{borrowBalanceTo}</span>
                      </ResultHandler>
                    </span>
                  </div>
                  <div
                    className={`flex w-full items-center justify-between text-xs mb-1 text-white/50 uppercase`}
                  >
                    <span className={``}>Market Borrow Apr</span>
                    <span className={`flex font-bold pl-2`}>
                      <span className="">{`${borrowAPR?.toFixed(2)}%`}</span>
                      <span className="mx-1">{`->`}</span>
                      <ResultHandler
                        height="16"
                        isLoading={isLoadingUpdatedAssets}
                        width="16"
                      >
                        <span>{updatedBorrowAPR?.toFixed(2)}%</span>
                      </ResultHandler>
                    </span>
                  </div>
                  <div
                    className={`flex w-full items-center justify-between text-xs mb-1 text-white/50 uppercase`}
                  >
                    <span className={``}>Health Factor</span>
                    <span className={`flex font-bold pl-2`}>
                      {`${normalizedHealthFactor}`}
                      <span className="mx-1">{`->`}</span>
                      <ResultHandler
                        height="16"
                        isLoading={isLoadingPredictedHealthFactor}
                        width="16"
                      >
                        {normalizedPredictedHealthFactor}
                      </ResultHandler>
                    </span>
                  </div>
                  <div
                    className={` w-full h-[1px]  bg-white/30 mx-auto my-3`}
                  />
                  <div
                    className={`flex w-full items-center justify-between gap-2  text-sm mb-1 mt-4 text-darkone `}
                  >
                    {transactionSteps.length > 0 ? (
                      <TransactionStepsHandler
                        chainId={chainId}
                        resetTransactionSteps={resetTransactionSteps}
                        transactionSteps={transactionSteps}
                      />
                    ) : (
                      <button
                        className={`w-full font-bold uppercase rounded-md py-1 transition-colors ${
                          amount &&
                          amountAsBInt > 0n &&
                          currentBorrowAmountAsFloat
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

      <Loop
        borrowableAssets={
          loopMarkets ? loopMarkets[selectedMarketData.cToken] : []
        }
        closeLoop={() => {
          setLoopOpen(false);
          setActive(PopupMode.BORROW);
        }}
        comptrollerAddress={comptrollerAddress}
        isOpen={loopOpen}
        selectedCollateralAsset={selectedMarketData}
      />
    </>
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
