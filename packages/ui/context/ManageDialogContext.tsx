'use client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState
} from 'react';

import { useQueryClient } from '@tanstack/react-query';
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

import type { TransactionStep } from '@ui/app/_components/dialogs/manage/TransactionStepsHandler';
import { useTransactionSteps } from '@ui/app/_components/dialogs/manage/TransactionStepsHandler';
import { INFO_MESSAGES } from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import useUpdatedUserAssets from '@ui/hooks/ionic/useUpdatedUserAssets';
import {
  useHealthFactor,
  useHealthFactorPrediction
} from '@ui/hooks/pools/useHealthFactor';
import { useBorrowMinimum } from '@ui/hooks/useBorrowMinimum';
import { useMaxBorrowAmount } from '@ui/hooks/useMaxBorrowAmount';
import { useMaxRepayAmount } from '@ui/hooks/useMaxRepayAmount';
import { useMaxSupplyAmount } from '@ui/hooks/useMaxSupplyAmount';
import { useMaxWithdrawAmount } from '@ui/hooks/useMaxWithdrawAmount';
import type { MarketData } from '@ui/types/TokensDataMap';
import { errorCodeToMessage } from '@ui/utils/errorCodeToMessage';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

import { FundOperationMode } from '@ionicprotocol/types';

type ActiveTab = 'borrow' | 'repay' | 'supply' | 'withdraw';
type FundOperation =
  | FundOperationMode.BORROW
  | FundOperationMode.REPAY
  | FundOperationMode.SUPPLY
  | FundOperationMode.WITHDRAW;

export enum HFPStatus {
  CRITICAL = 'CRITICAL',
  NORMAL = 'NORMAL',
  UNKNOWN = 'UNKNOWN',
  WARNING = 'WARNING'
}

interface PopupContextType {
  active: ActiveTab;
  setActive: (tab: ActiveTab) => void;
  amount?: string;
  setAmount: (value: string | undefined) => void;
  currentUtilizationPercentage: number;
  handleUtilization: (utilizationPercentage: number) => void;
  hfpStatus: HFPStatus;
  enableCollateral: boolean;
  handleCollateralToggle: () => Promise<void>;
  normalizedHealthFactor: string | undefined;
  normalizedPredictedHealthFactor: string | undefined;
  isMounted: boolean;
  initiateCloseAnimation: () => void;
  transactionSteps: TransactionStep[];
  resetTransactionSteps: () => void;
  refetchUsedQueries: () => Promise<void>;
  selectedMarketData: MarketData;
  chainId: number;
  amountAsBInt: bigint;
  comptrollerAddress: Address;
  minBorrowAmount?: {
    minBorrowAsset: bigint | undefined;
    minBorrowNative: bigint | undefined;
    minBorrowUSD: number | undefined;
  };
  maxBorrowAmount?:
    | {
        bigNumber: bigint;
        number: number;
      }
    | null
    | undefined;
  updatedValues: {
    borrowAPR: number | undefined;
    borrowBalanceFrom: string;
    borrowBalanceTo: string | undefined;
    supplyAPY: number | undefined;
    supplyBalanceFrom: string;
    supplyBalanceTo: number | string;
    totalBorrows: number | undefined;
    updatedBorrowAPR: number | undefined;
    updatedSupplyAPY: number | undefined;
    updatedTotalBorrows: number | undefined;
  };
  isLoadingPredictedHealthFactor: boolean;
  isLoadingUpdatedAssets: boolean;

  // Add any other shared variables or functions here
}

const formatBalance = (value: bigint | undefined, decimals: number): string => {
  const formatted = Number(formatUnits(value ?? 0n, decimals));
  return formatted === 0 ? '0' : formatted.toFixed(2);
};

const ManageDialogContext = createContext<PopupContextType | undefined>(
  undefined
);

export const ManageDialogProvider: React.FC<{
  selectedMarketData: MarketData;
  comptrollerAddress: Address;
  closePopup: () => void;
  children: React.ReactNode;
}> = ({ selectedMarketData, comptrollerAddress, closePopup, children }) => {
  const { addStepsForAction, transactionSteps, upsertTransactionStep } =
    useTransactionSteps();
  const { currentSdk, address } = useMultiIonic();
  const chainId = useChainId();

  const { data: maxSupplyAmount } = useMaxSupplyAmount(
    selectedMarketData,
    comptrollerAddress,
    chainId
  );
  const [active, setActive] = useState<ActiveTab>('supply');
  const operationMap = useMemo<Record<ActiveTab, FundOperation>>(
    () => ({
      supply: FundOperationMode.SUPPLY,
      withdraw: FundOperationMode.WITHDRAW,
      borrow: FundOperationMode.BORROW,
      repay: FundOperationMode.REPAY
    }),
    []
  );

  const resetTabState = useCallback(() => {
    setAmount('0');
    setCurrentUtilizationPercentage(0);
    upsertTransactionStep(undefined);
  }, [upsertTransactionStep]);

  useEffect(() => {
    resetTabState();
    setCurrentFundOperation(operationMap[active]);
  }, [active, resetTabState, operationMap]);

  const [amount, setAmount] = useReducer(
    (_: string | undefined, value: string | undefined): string | undefined =>
      value,
    '0'
  );

  const { data: maxRepayAmount } = useMaxRepayAmount(
    selectedMarketData,
    chainId
  );
  const amountAsBInt = useMemo<bigint>(
    () =>
      parseUnits(
        amount?.toString() ?? '0',
        selectedMarketData.underlyingDecimals
      ),
    [amount, selectedMarketData.underlyingDecimals]
  );
  const { data: maxBorrowAmount } = useMaxBorrowAmount(
    selectedMarketData,
    comptrollerAddress,
    chainId
  );

  const { data: minBorrowAmount } = useBorrowMinimum(
    selectedMarketData,
    chainId
  );

  const { data: healthFactor } = useHealthFactor(comptrollerAddress, chainId);
  const {
    data: _predictedHealthFactor,
    isLoading: isLoadingPredictedHealthFactor
  } = useHealthFactorPrediction(
    comptrollerAddress,
    address ?? ('' as Address),
    selectedMarketData.cToken,
    active === 'withdraw'
      ? (amountAsBInt * BigInt(1e18)) / selectedMarketData.exchangeRate
      : parseUnits('0', selectedMarketData.underlyingDecimals),
    active === 'borrow'
      ? amountAsBInt
      : parseUnits('0', selectedMarketData.underlyingDecimals),
    active === 'repay'
      ? (amountAsBInt * BigInt(1e18)) / selectedMarketData.exchangeRate
      : parseUnits('0', selectedMarketData.underlyingDecimals)
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
  const { data: maxWithdrawAmount } = useMaxWithdrawAmount(
    selectedMarketData,
    chainId
  );

  const [enableCollateral, setEnableCollateral] = useState<boolean>(
    selectedMarketData.membership && selectedMarketData.supplyBalance > 0n
  );
  const [isMounted, setIsMounted] = useState<boolean>(false);
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
    // If we're loading but have a previous health factor, keep using it
    if (isLoadingPredictedHealthFactor && healthFactor) {
      return healthFactor === '-1'
        ? HFPStatus.NORMAL
        : Number(healthFactor) <= 1.1
          ? HFPStatus.CRITICAL
          : Number(healthFactor) <= 1.2
            ? HFPStatus.WARNING
            : HFPStatus.NORMAL;
    }

    if (!predictedHealthFactor && !healthFactor) {
      return HFPStatus.UNKNOWN;
    }

    if (predictedHealthFactor === maxUint256) {
      return HFPStatus.NORMAL;
    }

    if (updatedAsset && updatedAsset?.supplyBalanceFiat < 0.01) {
      return HFPStatus.NORMAL;
    }

    const predictedHealthFactorNumber = Number(
      formatEther(predictedHealthFactor ?? 0n)
    );

    if (predictedHealthFactorNumber <= 1.1) {
      return HFPStatus.CRITICAL;
    }

    if (predictedHealthFactorNumber <= 1.2) {
      return HFPStatus.WARNING;
    }

    return HFPStatus.NORMAL;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    predictedHealthFactor,
    updatedAsset,
    healthFactor,
    isLoadingPredictedHealthFactor
  ]);

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
    if (amount === '0' || !amount) {
      setCurrentUtilizationPercentage(0);
      return;
    }

    let maxAmount: bigint;
    switch (active) {
      case 'supply':
        maxAmount = maxSupplyAmount?.bigNumber ?? 0n;
        break;
      case 'withdraw':
        maxAmount = maxWithdrawAmount ?? 0n;
        break;
      case 'borrow':
        maxAmount = maxBorrowAmount?.bigNumber ?? 0n;
        break;
      case 'repay':
        maxAmount = maxRepayAmount ?? 0n;
        break;
      default:
        maxAmount = 0n;
    }

    if (maxAmount === 0n) {
      setCurrentUtilizationPercentage(0);
      return;
    }

    const utilization = (Number(amountAsBInt) * 100) / Number(maxAmount);
    setCurrentUtilizationPercentage(Math.min(Math.round(utilization), 100));
  }, [
    active,
    amountAsBInt,
    maxSupplyAmount?.bigNumber,
    maxWithdrawAmount,
    maxBorrowAmount?.bigNumber,
    maxRepayAmount,
    amount
  ]);

  const initiateCloseAnimation = () => setIsMounted(false);

  const handleUtilization = useCallback(
    (utilizationPercentage: number) => {
      let maxAmountNumber = 0;
      switch (active) {
        case 'supply':
          maxAmountNumber = Number(
            formatUnits(
              maxSupplyAmount?.bigNumber ?? 0n,
              selectedMarketData.underlyingDecimals
            )
          );
          break;
        case 'withdraw':
          maxAmountNumber = Number(
            formatUnits(
              maxWithdrawAmount ?? 0n,
              selectedMarketData.underlyingDecimals
            )
          );
          break;
        case 'borrow':
          maxAmountNumber = Number(
            formatUnits(
              maxBorrowAmount?.bigNumber ?? 0n,
              selectedMarketData.underlyingDecimals
            )
          );
          break;
        case 'repay':
          maxAmountNumber = Number(
            formatUnits(
              maxRepayAmount ?? 0n,
              selectedMarketData.underlyingDecimals
            )
          );
          break;
        default:
          break;
      }

      const calculatedAmount = (
        (utilizationPercentage / 100) *
        maxAmountNumber
      ).toFixed(parseInt(selectedMarketData.underlyingDecimals.toString()));
      setAmount(calculatedAmount);
      // Don't set utilization here - let the effect handle it
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      active,
      maxSupplyAmount?.bigNumber,
      selectedMarketData.underlyingDecimals /* add other dependencies */
    ]
  );

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

  const updatedValues = useMemo(() => {
    const blocksPerMinute = getBlockTimePerMinuteByChainId(chainId);

    if (currentSdk) {
      const formatBalanceValue = (value: bigint, decimals: number) => {
        const formatted = Number(formatUnits(value, decimals));
        return isNaN(formatted)
          ? '0'
          : formatted.toLocaleString('en-US', { maximumFractionDigits: 2 });
      };

      return {
        borrowAPR: currentSdk.ratePerBlockToAPY(
          selectedMarketData.borrowRatePerBlock,
          blocksPerMinute
        ),
        borrowBalanceFrom: formatBalanceValue(
          selectedMarketData.borrowBalance,
          selectedMarketData.underlyingDecimals
        ),
        borrowBalanceTo: updatedAsset
          ? formatBalanceValue(
              updatedAsset.borrowBalance,
              updatedAsset.underlyingDecimals
            )
          : '0',
        supplyAPY: currentSdk.ratePerBlockToAPY(
          selectedMarketData.supplyRatePerBlock,
          blocksPerMinute
        ),
        supplyBalanceFrom: formatBalance(
          selectedMarketData.supplyBalance,
          selectedMarketData.underlyingDecimals
        ),
        supplyBalanceTo: updatedAsset
          ? formatBalance(
              updatedAsset.supplyBalance,
              updatedAsset.underlyingDecimals
            )
          : '0',
        totalBorrows:
          updatedAssets?.reduce(
            (acc, cur) =>
              acc + (isNaN(cur.borrowBalanceFiat) ? 0 : cur.borrowBalanceFiat),
            0
          ) ?? 0,
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
          ? updatedAssets.reduce(
              (acc, cur) =>
                acc +
                (isNaN(cur.borrowBalanceFiat) ? 0 : cur.borrowBalanceFiat),
              0
            )
          : 0
      };
    }

    // Default values when currentSdk is not available
    return {
      borrowAPR: 0,
      borrowBalanceFrom: '0',
      borrowBalanceTo: '0',
      supplyAPY: 0,
      supplyBalanceFrom: '0',
      supplyBalanceTo: '0',
      totalBorrows: 0,
      updatedBorrowAPR: 0,
      updatedSupplyAPY: 0,
      updatedTotalBorrows: 0
    };
  }, [chainId, updatedAsset, selectedMarketData, updatedAssets, currentSdk]);

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
    <ManageDialogContext.Provider
      value={{
        active,
        setActive,
        amount,
        setAmount,
        currentUtilizationPercentage,
        handleUtilization,
        hfpStatus,
        enableCollateral,
        handleCollateralToggle,
        normalizedHealthFactor,
        normalizedPredictedHealthFactor,
        isMounted,
        initiateCloseAnimation,
        transactionSteps,
        resetTransactionSteps,
        refetchUsedQueries,
        selectedMarketData,
        chainId,
        amountAsBInt,
        comptrollerAddress,
        minBorrowAmount,
        maxBorrowAmount,
        isLoadingPredictedHealthFactor,
        isLoadingUpdatedAssets,
        updatedValues
      }}
    >
      {children}
    </ManageDialogContext.Provider>
  );
};

export const useManageDialogContext = (): PopupContextType => {
  const context = useContext(ManageDialogContext);
  if (!context) {
    throw new Error(
      'useManageDialogContext must be used within a ManageDialogProvider'
    );
  }
  return context;
};
