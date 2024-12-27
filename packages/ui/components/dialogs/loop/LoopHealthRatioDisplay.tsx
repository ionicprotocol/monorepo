import React, { useCallback } from 'react';

import { type Address } from 'viem';

import type { MarketData } from '@ui/types/TokensDataMap';

export type LoopProps = {
  borrowableAssets: Address[];
  closeLoop: () => void;
  comptrollerAddress: Address;
  currentBorrowAsset?: MarketData;
  isOpen: boolean;
  selectedCollateralAsset: MarketData;
};

type LoopHealthRatioDisplayProps = {
  currentValue: string;
  healthRatio: number;
  liquidationValue: string;
  projectedHealthRatio?: number;
};

function LoopHealthRatioDisplay({
  currentValue,
  healthRatio,
  liquidationValue,
  projectedHealthRatio
}: LoopHealthRatioDisplayProps) {
  const healthRatioPosition = useCallback((value: number): number => {
    if (value < 0) {
      return 0;
    }

    if (value > 1) {
      return 100;
    }

    return value * 100;
  }, []);

  return (
    <div className="grow-0 shrink-0 basis-[45%]">
      <div
        className={`flex w-full mb-2 items-center justify-between mb-1 hint-text-uppercase `}
      >
        Health Ratio
      </div>

      <div className="relative h-[4px] mb-2 rounded-[4px] bg-health-ratio-gradient">
        <div
          className="absolute w-[8px] h-[8px] top-1/2 rounded-[8px] mt-[-4px] ml-[-4px] shadow-health-ratio-handle bg-white transition-all"
          style={{
            left: `${healthRatioPosition(healthRatio)}%`
          }}
        />

        <div
          className={`absolute w-[8px] h-[8px] top-1/2 rounded-[8px] mt-[-4px] ml-[-4px] shadow-health-ratio-handle bg-lime transition-all ${
            projectedHealthRatio ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            left: `${healthRatioPosition(projectedHealthRatio ?? healthRatio)}%`
          }}
        />
      </div>

      <div className="flex justify-between">
        <div className={`hint-text`}>
          <span className="block text-white text-sm">${liquidationValue}</span>
          Liquidation
        </div>

        <div className={`hint-text text-right`}>
          <span className="block text-white text-sm">${currentValue}</span>
          Current value
        </div>
      </div>
    </div>
  );
}

export default LoopHealthRatioDisplay;
