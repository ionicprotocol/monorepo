'use client';

import { formatEther, formatUnits } from 'ethers/lib/utils';
import React, { useMemo, useState } from 'react';
import { useChainId } from 'wagmi';

import Amount from './popup/Amount';

import { useMaxSupplyAmount } from '@ui/hooks/useMaxSupplyAmount';
import type { MarketData, PoolData } from '@ui/types/TokensDataMap';

export type LeverageProps = {
  marketData: PoolData;
};

export default function Leverage({ marketData }: LeverageProps) {
  const chainId = useChainId();
  const [selectedFundingAsset, setSelectedFundingAsset] = useState<MarketData>(
    marketData.assets[0]
  );
  const [selectedCollateralAsset, setSelectedCollateralAsset] =
    useState<MarketData>(marketData.assets[1]);
  const [selectedBorrowAsset, setSelectedBorrowAsset] = useState<MarketData>(
    marketData.assets[2]
  );
  const [fundingAmount, setFundingAmount] = useState<string>();
  const [currentLeverage, setCurrentLeverage] = useState<number>(1);
  const borrowToFundingRatio = useMemo<number>(
    () =>
      Number(formatEther(selectedBorrowAsset.underlyingPrice)) /
      Number(formatEther(selectedFundingAsset.underlyingPrice)),
    [selectedBorrowAsset, selectedFundingAsset]
  );
  const borrowAmount = useMemo<string>(
    () =>
      (
        (Number(fundingAmount) / borrowToFundingRatio) *
        currentLeverage
      ).toString(),
    [borrowToFundingRatio, currentLeverage, fundingAmount]
  );
  const { data: maxSupplyAmount } = useMaxSupplyAmount(
    selectedFundingAsset,
    marketData.comptroller,
    chainId
  );

  return (
    <div>
      <Amount
        amount={borrowAmount}
        availableAssets={marketData.assets}
        handleInput={() => {}}
        isLoading={false}
        mainText="Borrow"
        readonly
        selectedMarketData={selectedBorrowAsset}
        setSelectedAsset={(asset: MarketData) => setSelectedBorrowAsset(asset)}
        symbol={selectedBorrowAsset.underlyingSymbol}
      />

      <div className="separator" />

      <Amount
        amount={fundingAmount}
        availableAssets={marketData.assets}
        handleInput={(val?: string) => setFundingAmount(val)}
        mainText="Funding"
        max={formatUnits(
          maxSupplyAmount?.bigNumber ?? '0',
          selectedFundingAsset.underlyingDecimals
        )}
        selectedMarketData={selectedFundingAsset}
        setSelectedAsset={(asset: MarketData) => setSelectedFundingAsset(asset)}
        symbol={selectedFundingAsset.underlyingSymbol}
      />
    </div>
  );
}
