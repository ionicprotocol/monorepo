'use client';
import { useMemo, useState } from 'react';

import dynamic from 'next/dynamic';
import Image from 'next/image';

import { type Address, formatEther, formatUnits } from 'viem';
import { useChainId } from 'wagmi';

import { Dialog, DialogContent } from '@ui/components/ui/dialog';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@ui/components/ui/tabs';
import {
  ManageDialogProvider,
  useManageDialogContext
} from '@ui/context/ManageDialogContext';
import { useBorrowCapsDataForAsset } from '@ui/hooks/ionic/useBorrowCapsDataForAsset';
import { useSupplyCapsDataForAsset } from '@ui/hooks/ionic/useSupplyCapsDataForPool';
import { useUsdPrice } from '@ui/hooks/useAllUsdPrices';
import { useMaxBorrowAmount } from '@ui/hooks/useMaxBorrowAmount';
import { useMaxRepayAmount } from '@ui/hooks/useMaxRepayAmount';
import { useMaxSupplyAmount } from '@ui/hooks/useMaxSupplyAmount';
import { useMaxWithdrawAmount } from '@ui/hooks/useMaxWithdrawAmount';
import type { MarketData } from '@ui/types/TokensDataMap';

import BorrowTab from './BorrowTab';
import RepayTab from './RepayTab';
import SupplyTab from './SupplyTab';
import WithdrawTab from './WithdrawTab';
import AnimateHeight from '../../AnimateHeight';

const SwapWidget = dynamic(() => import('../../markets/SwapWidget'), {
  ssr: false
});

export enum PopupMode {
  MANAGE = 1,
  LOOP = 2
}

export type ActiveTab = 'borrow' | 'repay' | 'supply' | 'withdraw';

export enum HFPStatus {
  CRITICAL = 'CRITICAL',
  NORMAL = 'NORMAL',
  UNKNOWN = 'UNKNOWN',
  WARNING = 'WARNING'
}

interface IPopup {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  comptrollerAddress: Address;
  selectedMarketData: MarketData;
  isBorrowDisabled?: boolean;
  activeTab?: ActiveTab;
}

const ManageDialog = ({
  isOpen,
  setIsOpen,
  selectedMarketData,
  comptrollerAddress,
  isBorrowDisabled = false,
  activeTab = 'supply'
}: IPopup) => {
  const [swapWidgetOpen, setSwapWidgetOpen] = useState(false);
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
  const { data: maxRepayAmount, isLoading: isLoadingMaxRepayAmount } =
    useMaxRepayAmount(selectedMarketData, chainId);
  const { data: maxBorrowAmount, isLoading: isLoadingMaxBorrowAmount } =
    useMaxBorrowAmount(selectedMarketData, comptrollerAddress, chainId);
  const { data: maxWithdrawAmount, isLoading: isLoadingMaxWithdrawAmount } =
    useMaxWithdrawAmount(selectedMarketData, chainId);

  const TabsWithContext = ({
    activeTab,
    isBorrowDisabled
  }: {
    activeTab: ActiveTab;
    isBorrowDisabled: boolean;
  }) => {
    const { setActive } = useManageDialogContext();

    return (
      <div className="tabs-container">
        <Tabs
          defaultValue={activeTab}
          onValueChange={(value) => setActive(value as ActiveTab)}
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="supply">Supply</TabsTrigger>
            <TabsTrigger
              value="borrow"
              disabled={isBorrowDisabled}
            >
              Borrow
            </TabsTrigger>
            <TabsTrigger
              value="repay"
              disabled={isBorrowDisabled}
            >
              Repay
            </TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>

          <TabsContent
            value="supply"
            className="mt-2"
          >
            <SupplyTab
              maxAmount={maxSupplyAmount?.bigNumber ?? 0n}
              isLoadingMax={isLoadingMaxSupply}
              totalStats={{
                capAmount: supplyCapAsNumber,
                totalAmount: totalSupplyAsNumber,
                capFiat: supplyCapAsFiat,
                totalFiat: selectedMarketData.totalSupplyFiat
              }}
              setSwapWidgetOpen={setSwapWidgetOpen}
            />
          </TabsContent>
          <TabsContent value="borrow">
            <BorrowTab
              maxAmount={maxBorrowAmount?.bigNumber ?? 0n}
              isLoadingMax={isLoadingMaxBorrowAmount}
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
              maxAmount={maxRepayAmount ?? 0n}
              isLoadingMax={isLoadingMaxRepayAmount}
              totalStats={{
                capAmount: borrowCapAsNumber,
                totalAmount: totalBorrowAsNumber,
                capFiat: borrowCapAsFiat,
                totalFiat: selectedMarketData.totalBorrowFiat
              }}
            />
          </TabsContent>
          <TabsContent value="withdraw">
            <WithdrawTab
              maxAmount={maxWithdrawAmount ?? 0n}
              isLoadingMax={isLoadingMaxWithdrawAmount}
              totalStats={{
                capAmount: supplyCapAsNumber,
                totalAmount: totalSupplyAsNumber,
                capFiat: supplyCapAsFiat,
                totalFiat: selectedMarketData.totalSupplyFiat
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <ManageDialogProvider
      comptrollerAddress={comptrollerAddress}
      closePopup={() => setIsOpen(false)}
      selectedMarketData={selectedMarketData}
    >
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <DialogContent
          maxWidth="800px"
          className="bg-grayUnselect"
          fullWidth
        >
          <div className="flex w-20 mx-auto relative text-center">
            <Image
              alt="modlogo"
              className="mx-auto"
              height={32}
              src={`/img/symbols/32/color/${selectedMarketData?.underlyingSymbol.toLowerCase()}.png`}
              width={32}
            />
          </div>

          <AnimateHeight>
            <TabsWithContext
              activeTab={activeTab}
              isBorrowDisabled={isBorrowDisabled}
            />
          </AnimateHeight>
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
    </ManageDialogProvider>
  );
};

export default ManageDialog;
