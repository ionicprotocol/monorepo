import React, { useState } from 'react';

import { Slider } from '@ui/components/ui/slider';
import { cn } from '@ui/lib/utils';
import type { MarketData } from '@ui/types/TokensDataMap';

interface IAmount {
  amount?: string;
  availableAssets?: MarketData[];
  handleInput: (val?: string) => void;
  hintText?: string;
  isLoading?: boolean;
  mainText?: string;
  max?: string;
  readonly?: boolean;
  selectedMarketData: MarketData;
  setSelectedAsset?: (asset: MarketData) => void;
  symbol: string;
  currentUtilizationPercentage?: number;
  handleUtilization?: (val: number) => void;
}

const Amount = ({
  selectedMarketData,
  handleInput,
  amount,
  availableAssets,
  hintText = 'Wallet Balance',
  mainText = 'Amount',
  max = '0',
  symbol,
  isLoading = false,
  readonly,
  setSelectedAsset,
  currentUtilizationPercentage,
  handleUtilization
}: IAmount) => {
  const [availableAssetsOpen, setAvailableAssetsOpen] = useState(false);
  const percentages = [0, 20, 40, 60, 80, 100];

  return (
    <div className="w-full">
      {/* Mobile Layout */}
      <div className="flex md:hidden flex-col w-full gap-4">
        <div className="flex justify-between items-end w-full">
          <div className="w-32">
            <div className="text-[10px] text-white/50 mb-1">{mainText}</div>
            <input
              className="w-full bg-transparent text-lg font-bold focus:outline-none"
              onChange={(e) => handleInput(e.target.value)}
              placeholder={`${selectedMarketData.underlyingSymbol} Amount`}
              readOnly={!!readonly}
              type="number"
              value={amount}
            />
          </div>

          <div className="flex flex-col items-end gap-1">
            {!readonly && !isLoading && (
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-white/50">
                  {hintText} {max}
                </span>
                <button
                  className="text-accent"
                  onClick={() => handleInput(max)}
                >
                  MAX
                </button>
              </div>
            )}
            <div
              className="flex items-center cursor-pointer"
              onClick={() => setAvailableAssetsOpen(!availableAssetsOpen)}
            >
              <img
                alt={symbol}
                height="20"
                src={`/img/symbols/32/color/${symbol.toLowerCase()}.png`}
                width="20"
              />
              <span className="text-white pl-2">{symbol}</span>
              {availableAssets && (
                <img
                  alt="dropdown"
                  height="24"
                  src="/images/chevron-down.png"
                  width="24"
                />
              )}
            </div>
          </div>
        </div>

        <div className="w-full">
          {currentUtilizationPercentage !== undefined && (
            <Slider
              value={[currentUtilizationPercentage]}
              step={1}
              min={0}
              max={100}
              onValueChange={(value) => handleUtilization?.(value[0])}
              className="w-full"
            />
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex items-center gap-8">
        <div className="w-32">
          <div className="text-[10px] text-white/50 mb-1">{mainText}</div>
          <input
            className="w-full bg-transparent text-lg font-bold focus:outline-none"
            onChange={(e) => handleInput(e.target.value)}
            placeholder={`${selectedMarketData.underlyingSymbol} Amount`}
            readOnly={!!readonly}
            type="number"
            value={amount}
          />
        </div>

        <div className="flex-1">
          {currentUtilizationPercentage !== undefined && (
            <Slider
              value={[currentUtilizationPercentage]}
              step={1}
              min={0}
              max={100}
              onValueChange={(value) => handleUtilization?.(value[0])}
              className="w-full"
            />
          )}
        </div>

        <div className="flex flex-col items-end gap-1">
          {!readonly && !isLoading && (
            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-white/50">
                {hintText} {max}
              </span>
              <button
                className="text-accent"
                onClick={() => handleInput(max)}
              >
                MAX
              </button>
            </div>
          )}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setAvailableAssetsOpen(!availableAssetsOpen)}
          >
            <img
              alt={symbol}
              height="20"
              src={`/img/symbols/32/color/${symbol.toLowerCase()}.png`}
              width="20"
            />
            <span className="text-white pl-2">{symbol}</span>
            {availableAssets && (
              <img
                alt="dropdown"
                height="24"
                src="/images/chevron-down.png"
                width="24"
              />
            )}
          </div>
        </div>
      </div>

      {availableAssets && (
        <div
          className={cn(
            'absolute w-[180px] top-full right-0 px-4 py-3 rounded-lg bg-grayone transition-all',
            availableAssetsOpen
              ? 'visible opacity-100 scale-100'
              : 'opacity-0 scale-90 invisible'
          )}
        >
          {availableAssets.map((asset) => (
            <div
              key={`asset-${asset.underlyingSymbol}`}
              className="flex py-1 items-center font-bold text-white cursor-pointer"
              onClick={() => {
                setSelectedAsset?.(asset);
                setAvailableAssetsOpen(false);
              }}
            >
              <img
                alt={asset.underlyingSymbol}
                height="20"
                src={`/img/symbols/32/color/${asset.underlyingSymbol?.toLowerCase()}.png`}
                width="20"
              />
              <span className="text-white pl-2">{asset.underlyingSymbol}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Amount;
