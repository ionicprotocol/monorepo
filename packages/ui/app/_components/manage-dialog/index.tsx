'use client';
import { useEffect, useMemo, useReducer, useState } from 'react';

import dynamic from 'next/dynamic';
import Image from 'next/image';

import { useQueryClient } from '@tanstack/react-query';
import {
  type Address,
  formatEther,
  formatUnits,
  maxUint256,
  parseEther,
  parseUnits
} from 'viem';
import { useChainId } from 'wagmi';

import { Dialog, DialogContent } from '@ui/components/ui/dialog';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@ui/components/ui/tabs';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { PopupProvider } from '@ui/context/ManageDialogContext';
import { useBorrowCapsDataForAsset } from '@ui/hooks/ionic/useBorrowCapsDataForAsset';
import { useSupplyCapsDataForAsset } from '@ui/hooks/ionic/useSupplyCapsDataForPool';
import useUpdatedUserAssets from '@ui/hooks/ionic/useUpdatedUserAssets';
import {
  useHealthFactor,
  useHealthFactorPrediction
} from '@ui/hooks/pools/useHealthFactor';
import { useUsdPrice } from '@ui/hooks/useAllUsdPrices';
import { useMaxBorrowAmount } from '@ui/hooks/useMaxBorrowAmount';
import { useMaxRepayAmount } from '@ui/hooks/useMaxRepayAmount';
import { useMaxSupplyAmount } from '@ui/hooks/useMaxSupplyAmount';
import { useMaxWithdrawAmount } from '@ui/hooks/useMaxWithdrawAmount';
import { useTotalSupplyAPYs } from '@ui/hooks/useTotalSupplyAPYs';
import type { MarketData } from '@ui/types/TokensDataMap';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

import BorrowTab from './BorrowTab';
import RepayTab from './RepayTab';
import SupplyTab from './SupplyTab';
import WithdrawTab from './WithdrawTab';

import { FundOperationMode } from '@ionicprotocol/types';

const SwapWidget = dynamic(() => import('../markets/SwapWidget'), {
  ssr: false
});

export enum PopupMode {
  MANAGE = 1,
  LOOP = 2
}

type ActiveTab = 'borrow' | 'repay' | 'supply' | 'withdraw';

export enum HFPStatus {
  CRITICAL = 'CRITICAL',
  NORMAL = 'NORMAL',
  UNKNOWN = 'UNKNOWN',
  WARNING = 'WARNING'
}

interface IPopup {
  closePopup: () => void;
  comptrollerAddress: Address;
  selectedMarketData: MarketData;
}

const ManageDialog = ({
  selectedMarketData,
  closePopup,
  comptrollerAddress
}: IPopup) => {
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
  const {
    data: maxSupplyAmount,
    isLoading: isLoadingMaxSupply,
    refetch: refetchMaxSupplyAmount
  } = useMaxSupplyAmount(selectedMarketData, comptrollerAddress, chainId);
  const { data: assetsSupplyAprData } = useTotalSupplyAPYs(
    [selectedMarketData],
    chainId
  );
  const collateralApr = useMemo<number>(() => {
    // Todo: add the market rewards to this calculation
    if (assetsSupplyAprData) {
      return parseFloat(
        assetsSupplyAprData[selectedMarketData.cToken].apy.toFixed(2)
      );
    }

    return 0.0;
  }, [assetsSupplyAprData, selectedMarketData.cToken]);
  const [active, setActive] = useState<ActiveTab>('supply');

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
  const [isMounted, setIsMounted] = useState<boolean>(false);
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

  const initiateCloseAnimation = () => setIsMounted(false);

  return (
    <PopupProvider
      comptrollerAddress={comptrollerAddress}
      closePopup={closePopup}
      selectedMarketData={selectedMarketData}
    >
      <Dialog
        open={isMounted}
        onOpenChange={(open) => !open && initiateCloseAnimation()}
      >
        <DialogContent className="w-[85%] sm:w-[55%] md:w-[45%] bg-grayUnselect">
          <div className="flex w-20 mx-auto relative text-center">
            <Image
              alt="modlogo"
              className="mx-auto"
              height={32}
              src={`/img/symbols/32/color/${selectedMarketData?.underlyingSymbol.toLowerCase()}.png`}
              width={32}
            />
          </div>

          <Tabs
            defaultValue={active}
            onValueChange={(value) => {
              setActive(value as ActiveTab);
            }}
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="supply">Supply</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
              <TabsTrigger value="borrow">Borrow</TabsTrigger>
              <TabsTrigger value="repay">Repay</TabsTrigger>
            </TabsList>

            <TabsContent value="supply">
              <SupplyTab
                isLoadingUpdatedAssets={isLoadingUpdatedAssets}
                maxAmount={maxSupplyAmount?.bigNumber ?? 0n}
                isLoadingMax={isLoadingMaxSupply}
                isDisabled={!amount || amountAsBInt === 0n}
                updatedValues={{
                  balanceFrom: supplyBalanceFrom,
                  balanceTo: supplyBalanceTo,
                  aprFrom: supplyAPY,
                  aprTo: updatedSupplyAPY,
                  collateralApr
                }}
                totalStats={{
                  capAmount: supplyCapAsNumber,
                  totalAmount: totalSupplyAsNumber,
                  capFiat: supplyCapAsFiat,
                  totalFiat: selectedMarketData.totalSupplyFiat
                }}
                setSwapWidgetOpen={setSwapWidgetOpen}
              />
            </TabsContent>

            <TabsContent value="withdraw">
              <WithdrawTab
                isLoadingUpdatedAssets={isLoadingUpdatedAssets}
                maxAmount={maxWithdrawAmount ?? 0n}
                isLoadingMax={isLoadingMaxWithdrawAmount}
                isDisabled={
                  !amount ||
                  amountAsBInt === 0n ||
                  isLoadingPredictedHealthFactor ||
                  hfpStatus === HFPStatus.CRITICAL ||
                  hfpStatus === HFPStatus.UNKNOWN
                }
                updatedValues={{
                  balanceFrom: supplyBalanceFrom,
                  balanceTo: supplyBalanceTo,
                  aprFrom: supplyAPY,
                  aprTo: updatedSupplyAPY
                }}
              />
            </TabsContent>
            <TabsContent value="borrow">
              <BorrowTab
                isLoadingUpdatedAssets={isLoadingUpdatedAssets}
                maxAmount={maxBorrowAmount?.bigNumber ?? 0n}
                isLoadingMax={isLoadingMaxBorrowAmount}
                isDisabled={
                  !amount ||
                  amountAsBInt === 0n ||
                  isLoadingPredictedHealthFactor ||
                  hfpStatus === HFPStatus.CRITICAL ||
                  hfpStatus === HFPStatus.UNKNOWN
                }
                updatedValues={{
                  balanceFrom: borrowBalanceFrom,
                  balanceTo: borrowBalanceTo,
                  aprFrom: borrowAPR,
                  aprTo: updatedBorrowAPR
                }}
                totalStats={{
                  capAmount: borrowCapAsNumber,
                  totalAmount: totalBorrowAsNumber,
                  capFiat: borrowCapAsFiat,
                  totalFiat: selectedMarketData.totalBorrowFiat
                }}
              />
            </TabsContent>
            <TabsContent value="repay">
              <RepayTab
                isLoadingUpdatedAssets={isLoadingUpdatedAssets}
                maxAmount={maxRepayAmount ?? 0n}
                isLoadingMax={isLoadingMaxRepayAmount}
                updatedValues={{
                  balanceFrom: borrowBalanceFrom,
                  balanceTo: borrowBalanceTo,
                  aprFrom: borrowAPR,
                  aprTo: updatedBorrowAPR
                }}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <SwapWidget
        close={() => setSwapWidgetOpen(false)}
        open={swapWidgetOpen}
        fromChain={chainId}
        toChain={chainId}
        toToken={selectedMarketData.underlyingToken}
        onRouteExecutionCompleted={() => refetchMaxSupplyAmount()}
      />
    </PopupProvider>
  );
};

export default ManageDialog;
