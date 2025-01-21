import type { Dispatch, SetStateAction } from 'react';
import React from 'react';

import { type Address } from 'viem';
import { useChainId } from 'wagmi';

import { Slider } from '@ui/components/ui/slider';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import type { MarketData } from '@ui/types/TokensDataMap';

import ResultHandler from '../../ResultHandler';
import Amount from '../../Amount';

export type LoopProps = {
  borrowableAssets: Address[];
  closeLoop: () => void;
  comptrollerAddress: Address;
  currentBorrowAsset?: MarketData;
  isOpen: boolean;
  selectedCollateralAsset: MarketData;
};

type BorrowActionsProps = {
  borrowAmount?: string;
  borrowableAssets: LoopProps['borrowableAssets'];
  currentLeverage: number;
  currentPositionLeverage?: number;
  selectedBorrowAsset?: MarketData;
  selectedBorrowAssetUSDPrice: number;
  setCurrentLeverage: Dispatch<SetStateAction<number>>;
  setSelectedBorrowAsset: React.Dispatch<
    React.SetStateAction<MarketData | undefined>
  >;
};

function BorrowActions({
  borrowAmount,
  borrowableAssets,
  currentLeverage,
  currentPositionLeverage,
  selectedBorrowAsset,
  selectedBorrowAssetUSDPrice,
  setCurrentLeverage,
  setSelectedBorrowAsset
}: BorrowActionsProps) {
  const chainId = useChainId();
  const { data: marketData, isLoading: isLoadingMarketData } = useFusePoolData(
    '0',
    chainId,
    true
  );
  const maxAllowedLoop = 3;

  const marks = Array.from({ length: 8 }, (_, i) => ({
    value: i + 2,
    label: `${i + 2}x`,
    isDisabled: i + 2 > maxAllowedLoop
  }));

  return (
    <ResultHandler isLoading={isLoadingMarketData}>
      {selectedBorrowAsset && (
        <div className="grow-0 shrink-0 basis-[45%]">
          <div className="relative z-40">
            <Amount
              amount={borrowAmount}
              availableAssets={marketData?.assets.filter((asset) =>
                borrowableAssets.find(
                  (borrowableAsset) => borrowableAsset === asset.cToken
                )
              )}
              handleInput={() => {}}
              hintText="Available:"
              isLoading={false}
              mainText="AMOUNT TO BORROW"
              max={''}
              readonly
              setSelectedAsset={(asset: MarketData) =>
                setSelectedBorrowAsset(asset)
              }
              symbol={selectedBorrowAsset.underlyingSymbol}
            />
          </div>

          <div className="flex text-xs text-white/50 mb-2">
            $
            {(
              selectedBorrowAssetUSDPrice * parseFloat(borrowAmount ?? '0')
            ).toFixed(2)}
          </div>

          <div className="flex items-center text-center text-white/50">
            <div className="mr-6 text-sm">
              LOOP
              <div className="text-lg font-bold">
                {currentLeverage.toFixed(1)}x
              </div>
            </div>

            <div className="w-full space-y-4">
              <Slider
                defaultValue={[2]}
                max={9}
                min={2}
                step={1}
                marks={marks}
                value={[currentLeverage]}
                currentPosition={currentPositionLeverage}
                onMarkClick={(value) => {
                  if (value >= 2 && value <= maxAllowedLoop) {
                    setCurrentLeverage(value);
                  }
                }}
                onValueChange={(value) => {
                  const newValue = value[0];
                  if (newValue >= 2 && newValue <= maxAllowedLoop) {
                    setCurrentLeverage(newValue);
                  }
                }}
                className="w-full"
              />

              <div className="flex justify-between text-white/50 text-xs">
                <span>{'<'} Repay</span>
                <span>Borrow {'>'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </ResultHandler>
  );
}

export default BorrowActions;
