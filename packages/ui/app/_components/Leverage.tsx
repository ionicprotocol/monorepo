'use client';

import { formatEther, formatUnits } from 'ethers/lib/utils';
import React, { useMemo, useState } from 'react';
import { useChainId } from 'wagmi';

import Amount from './popup/Amount';

import { useMaxSupplyAmount } from '@ui/hooks/useMaxSupplyAmount';
import type { MarketData, PoolData } from '@ui/types/TokensDataMap';
import Range from './Range';

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
  const { data: maxSupplyAmount, isLoading: isLoadingMaxSupplyAmount } =
    useMaxSupplyAmount(selectedFundingAsset, marketData.comptroller, chainId);

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
        isLoading={isLoadingMaxSupplyAmount}
        mainText="Funding"
        max={formatUnits(
          maxSupplyAmount?.bigNumber ?? '0',
          selectedFundingAsset.underlyingDecimals
        )}
        selectedMarketData={selectedFundingAsset}
        setSelectedAsset={(asset: MarketData) => setSelectedFundingAsset(asset)}
        symbol={selectedFundingAsset.underlyingSymbol}
      />

      <div className="flex items-center text-center text-white/50 mt-2">
        <div className="mr-6 text-sm">
          LEVERAGE
          <div className="text-lg font-bold">{currentLeverage.toFixed(1)}</div>
        </div>

        <div className="w-full">
          <div className="relative h-[20px] mb-2 text-xs md:text-sm">
            {['1x', '2x', '3x', '4x', '5x', '6x', '7x', '8x', '9x', '10x'].map(
              (label, i) => (
                <span
                  className={`absolute top-0 cursor-pointer translate-x-[-50%] ${
                    currentLeverage === i + 1 && 'text-accent'
                  }`}
                  key={`label-${label}`}
                  onClick={() => setCurrentLeverage(i + 1)}
                  style={{ left: `${(i / 9) * 100}%` }}
                >
                  {label}
                </span>
              )
            )}
          </div>

          <Range
            currentValue={currentLeverage}
            max={10}
            min={1}
            setCurrentValue={(val: number) => setCurrentLeverage(val)}
            step={1}
          />

          <div className="flex justify-between pt-2 text-white/50 text-xs">
            <span>{'<'} Repay</span>

            <span>Borrow {'>'}</span>
          </div>
        </div>
      </div>

      <div className="separator" />

      <div
        className={`flex w-full items-center justify-between mb-1 hint-text-uppercase`}
      >
        <span className={``}>POSITION VALUE</span>
        <span className={`font-bold pl-2 text-white`}>$0.00</span>
      </div>

      <div
        className={`flex w-full items-center justify-between mb-1 hint-text-uppercase`}
      >
        <span className={``}>NET APR</span>
        <span className={`font-bold pl-2 text-white`}>$0.00</span>
      </div>

      <div
        className={`flex w-full items-center justify-between mb-1 hint-text-uppercase`}
      >
        <span className={``}>ANNUAL YIELD</span>
        <span className={`font-bold pl-2 text-white`}>$0.00</span>
      </div>

      <div
        className={`flex w-full items-center justify-between mb-1 hint-text-uppercase`}
      >
        <span className={``}>COLLATERAL APR</span>
        <span className={`font-bold pl-2 text-white`}>$0.00</span>
      </div>

      <div
        className={`flex w-full items-center justify-between mb-1 hint-text-uppercase`}
      >
        <span className={``}>HEALTH RATIO</span>
        <span className={`font-bold pl-2 text-white`}>$0.00</span>
      </div>

      <div className="separator" />

      <div className="text-center">
        <button className="btn-green">OPEN POSITION</button>
      </div>
    </div>
  );
}
