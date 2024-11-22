import type { Dispatch, SetStateAction } from 'react';
import React from 'react';

import { type Address } from 'viem';
import { useChainId } from 'wagmi';

import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import type { MarketData } from '@ui/types/TokensDataMap';

import Range from '../../Range';
import ResultHandler from '../../ResultHandler';
import Amount from '../manage/Amount';

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
  const maxLoop = 2;

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
              selectedMarketData={selectedBorrowAsset}
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
                {(currentLeverage - 1).toFixed(1)}
              </div>
            </div>

            <div className="w-full">
              <div className="relative h-[20px] mb-2 text-xs md:text-sm">
                {[
                  '0x',
                  '1x',
                  '2x',
                  '3x',
                  '4x',
                  '5x',
                  '6x',
                  '7x',
                  '8x',
                  '9x',
                  '10x'
                ].map((label, i) => (
                  <span
                    className={`absolute top-0 cursor-pointer translate-x-[-50%] ${
                      currentPositionLeverage &&
                      currentPositionLeverage === i + 1 &&
                      'text-lime'
                    } ${i > maxLoop && 'text-white/20'} ${
                      currentLeverage === i + 1 && '!text-accent'
                    } `}
                    key={`label-${label}`}
                    onClick={() =>
                      setCurrentLeverage(i > maxLoop ? maxLoop + 1 : i + 1)
                    }
                    style={{ left: `${(i / 10) * 100}%` }}
                  >
                    {label}
                  </span>
                ))}
              </div>

              <Range
                currentValue={currentLeverage - 1}
                max={10}
                min={0}
                setCurrentValue={(val: number) =>
                  setCurrentLeverage(val > maxLoop ? maxLoop + 1 : val + 1)
                }
                step={1}
              />

              <div className="flex justify-between pt-2 text-white/50 text-xs">
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
