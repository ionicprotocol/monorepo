'use client';
import { useState } from 'react';

import dynamic from 'next/dynamic';

import { type Address } from 'viem';
import { useChainId } from 'wagmi';

import { ManageDialogProvider } from '@ui/context/ManageDialogContext';
import { useMaxSupplyAmount } from '@ui/hooks/useMaxSupplyAmount';
import type { MarketData } from '@ui/types/TokensDataMap';

import DialogWrapper from './DialogWrapper';
import ManageDialogTabs from './ManageDialogTabs';

const SwapWidget = dynamic(() => import('../../markets/SwapWidget'), {
  ssr: false
});

export type ActiveTab = 'borrow' | 'repay' | 'supply' | 'withdraw';

export enum HFPStatus {
  CRITICAL = 'CRITICAL',
  NORMAL = 'NORMAL',
  UNKNOWN = 'UNKNOWN',
  WARNING = 'WARNING'
}

interface ManageDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isBorrowDisabled?: boolean;
  comptrollerAddress: Address;
  selectedMarketData: MarketData;
  activeTab?: ActiveTab;
}

const ManageDialog = ({
  isOpen,
  setIsOpen,
  selectedMarketData,
  comptrollerAddress,
  isBorrowDisabled = false,
  activeTab = 'supply'
}: ManageDialogProps) => {
  const [swapWidgetOpen, setSwapWidgetOpen] = useState(false);
  const chainId = useChainId();
  const [currentActiveTab, setCurrentActiveTab] =
    useState<ActiveTab>(activeTab);
  const { refetch: refetchMaxSupplyAmount } = useMaxSupplyAmount(
    selectedMarketData,
    comptrollerAddress,
    chainId
  );

  return (
    <ManageDialogProvider
      comptrollerAddress={comptrollerAddress}
      selectedMarketData={selectedMarketData}
    >
      <DialogWrapper
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        setCurrentActiveTab={setCurrentActiveTab}
      >
        <ManageDialogTabs
          selectedMarketData={selectedMarketData}
          comptrollerAddress={comptrollerAddress}
          isBorrowDisabled={isBorrowDisabled}
          currentActiveTab={currentActiveTab}
          setCurrentActiveTab={setCurrentActiveTab}
          setSwapWidgetOpen={setSwapWidgetOpen}
          chainId={chainId}
        />
      </DialogWrapper>

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
