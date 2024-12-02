'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { type Address, formatUnits } from 'viem';
import { useChainId } from 'wagmi';

import { useTransactionSteps } from '@ui/app/_components/dialogs/manage/TransactionStepsHandler';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import useUpdatedUserAssets from '@ui/hooks/ionic/useUpdatedUserAssets';
import { useBorrowMinimum } from '@ui/hooks/useBorrowMinimum';
import { useMaxBorrowAmount } from '@ui/hooks/useMaxBorrowAmount';
import { useMaxRepayAmount } from '@ui/hooks/useMaxRepayAmount';
import type { MarketData } from '@ui/types/TokensDataMap';
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
  isMounted: boolean;
  initiateCloseAnimation: () => void;
  resetTransactionSteps: () => void;
  refetchUsedQueries: () => Promise<void>;
  selectedMarketData: MarketData;
  chainId: number;
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
  isLoadingUpdatedAssets: boolean;
  setPredictionAmount: (amount: bigint) => void;
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
  const { upsertTransactionStep } = useTransactionSteps();
  const { currentSdk } = useMultiIonic();
  const chainId = useChainId();
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
  const [predictionAmount, setPredictionAmount] = useState<bigint>(0n);

  useEffect(() => {
    upsertTransactionStep(undefined);
    setCurrentFundOperation(operationMap[active]);
  }, [active, operationMap]);

  const { data: maxRepayAmount } = useMaxRepayAmount(
    selectedMarketData,
    chainId
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

  const [currentFundOperation, setCurrentFundOperation] =
    useState<FundOperationMode>(FundOperationMode.SUPPLY);

  const { data: updatedAssets, isLoading: isLoadingUpdatedAssets } =
    useUpdatedUserAssets({
      amount: predictionAmount,
      assets: [selectedMarketData],
      index: 0,
      mode: currentFundOperation,
      poolChainId: chainId
    });

  const updatedAsset = updatedAssets ? updatedAssets[0] : undefined;

  const [isMounted, setIsMounted] = useState<boolean>(false);

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

  const initiateCloseAnimation = () => setIsMounted(false);

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

  return (
    <ManageDialogContext.Provider
      value={{
        active,
        setActive,
        isMounted,
        initiateCloseAnimation,
        resetTransactionSteps,
        refetchUsedQueries,
        selectedMarketData,
        chainId,
        comptrollerAddress,
        minBorrowAmount,
        maxBorrowAmount,
        isLoadingUpdatedAssets,
        updatedValues,
        setPredictionAmount
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
