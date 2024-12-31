'use client';
import { useMemo } from 'react';

import Image from 'next/image';

import { DialogTitle } from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { type Address, formatEther, formatUnits } from 'viem';

import { DialogContent, DialogHeader } from '@ui/components/ui/dialog';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@ui/components/ui/tabs';
import { useManageDialogContext } from '@ui/context/ManageDialogContext';
import { useBorrowCapsDataForAsset } from '@ui/hooks/ionic/useBorrowCapsDataForAsset';
import { useSupplyCapsDataForAsset } from '@ui/hooks/ionic/useSupplyCapsDataForPool';
import { useUsdPrice } from '@ui/hooks/useUsdPrices';
import type { MarketData } from '@ui/types/TokensDataMap';

import BorrowTab from './BorrowTab';
import RepayTab from './RepayTab';
import SupplyTab from './SupplyTab';
import WithdrawTab from './WithdrawTab';
import AnimateHeight from '../../AnimateHeight';

import type { ActiveTab } from '.';

const ManageDialogTabs = ({
  selectedMarketData,
  comptrollerAddress,
  isBorrowDisabled,
  currentActiveTab,
  setCurrentActiveTab,
  setSwapWidgetOpen,
  chainId
}: {
  selectedMarketData: MarketData;
  comptrollerAddress: Address;
  isBorrowDisabled: boolean;
  currentActiveTab: ActiveTab;
  setCurrentActiveTab: (tab: ActiveTab) => void;
  setSwapWidgetOpen: (open: boolean) => void;
  chainId: number;
}) => {
  const { data: usdPrice } = useUsdPrice(chainId);

  // Memoize calculations
  const pricePerSingleAsset = useMemo(
    () =>
      parseFloat(formatEther(selectedMarketData.underlyingPrice)) *
      (usdPrice ?? 0),
    [selectedMarketData.underlyingPrice, usdPrice]
  );

  const { data: supplyCap } = useSupplyCapsDataForAsset(
    comptrollerAddress,
    selectedMarketData.cToken,
    chainId
  );

  const supplyCapAsNumber = useMemo(
    () =>
      parseFloat(
        formatUnits(
          supplyCap?.supplyCaps ?? 0n,
          selectedMarketData.underlyingDecimals
        )
      ),
    [supplyCap?.supplyCaps, selectedMarketData.underlyingDecimals]
  );

  const supplyCapAsFiat = useMemo(
    () => pricePerSingleAsset * supplyCapAsNumber,
    [pricePerSingleAsset, supplyCapAsNumber]
  );

  const totalSupplyAsNumber = useMemo(
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

  const borrowCapAsNumber = useMemo(
    () =>
      parseFloat(
        formatUnits(
          borrowCap?.totalBorrowCap ?? 0n,
          selectedMarketData.underlyingDecimals
        )
      ),
    [borrowCap?.totalBorrowCap, selectedMarketData.underlyingDecimals]
  );

  const borrowCapAsFiat = useMemo(
    () => pricePerSingleAsset * borrowCapAsNumber,
    [pricePerSingleAsset, borrowCapAsNumber]
  );

  const totalBorrowAsNumber = useMemo(
    () =>
      parseFloat(
        formatUnits(
          selectedMarketData.totalBorrow,
          selectedMarketData.underlyingDecimals
        )
      ),
    [selectedMarketData.totalBorrow, selectedMarketData.underlyingDecimals]
  );

  const TabsComponent = () => {
    const { setActive } = useManageDialogContext();

    const handleTabChange = (value: string) => {
      const newTab = value as ActiveTab;
      setCurrentActiveTab(newTab);
      setActive(newTab);
    };

    return (
      <Tabs
        defaultValue={currentActiveTab}
        onValueChange={handleTabChange}
        value={currentActiveTab}
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
            capAmount={supplyCapAsNumber}
            totalAmount={totalSupplyAsNumber}
            capFiat={supplyCapAsFiat}
            totalFiat={selectedMarketData.totalSupplyFiat}
            setSwapWidgetOpen={setSwapWidgetOpen}
          />
        </TabsContent>
        <TabsContent value="borrow">
          <BorrowTab
            capAmount={borrowCapAsNumber}
            totalAmount={totalBorrowAsNumber}
            capFiat={borrowCapAsFiat}
            totalFiat={selectedMarketData.totalBorrowFiat}
          />
        </TabsContent>
        <TabsContent value="repay">
          <RepayTab
            capAmount={borrowCapAsNumber}
            totalAmount={totalBorrowAsNumber}
            capFiat={borrowCapAsFiat}
            totalFiat={selectedMarketData.totalBorrowFiat}
          />
        </TabsContent>
        <TabsContent value="withdraw">
          <WithdrawTab
            capAmount={supplyCapAsNumber}
            totalAmount={totalSupplyAsNumber}
            capFiat={supplyCapAsFiat}
            totalFiat={selectedMarketData.totalSupplyFiat}
          />
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <DialogContent
      maxWidth="800px"
      className="bg-grayUnselect"
      fullWidth
    >
      <DialogHeader className="flex w-20 mx-auto relative text-center">
        <VisuallyHidden.Root>
          <DialogTitle />
        </VisuallyHidden.Root>
        <Image
          alt="modlogo"
          className="mx-auto"
          height={32}
          src={`/img/symbols/32/color/${selectedMarketData?.underlyingSymbol.toLowerCase()}.png`}
          width={32}
        />
      </DialogHeader>
      <AnimateHeight>
        <TabsComponent />
      </AnimateHeight>
    </DialogContent>
  );
};

export default ManageDialogTabs;
