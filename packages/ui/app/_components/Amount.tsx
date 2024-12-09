import React, { useState } from 'react';

import { Slider } from '@ui/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@ui/components/ui/tooltip';
import { cn } from '@ui/lib/utils';
import type { MarketData } from '@ui/types/TokensDataMap';

import ResultHandler from './ResultHandler';

interface IAmount {
  amount?: string;
  availableAssets?: MarketData[];
  handleInput: (val?: string) => void;
  hintText?: string;
  isLoading?: boolean;
  mainText?: string;
  max?: string;
  readonly?: boolean;
  setSelectedAsset?: (asset: MarketData) => void;
  symbol: string;
  currentUtilizationPercentage?: number;
  handleUtilization?: (val: number) => void;
}

const AmountInput = ({
  mainText,
  handleInput,
  readonly,
  amount,
  max,
  isLoading
}: {
  mainText?: string;
  handleInput: (val?: string) => void;
  readonly?: boolean;
  amount?: string;
  max?: string;
  isLoading?: boolean;
}) => {
  const isDisabled = readonly || max === '0' || isLoading;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      handleInput(undefined);
      return;
    }

    const numValue = parseFloat(value);
    const maxValue = parseFloat(max || '0');

    if (numValue > maxValue) {
      handleInput(max);
      return;
    }

    handleInput(value);
  };

  return (
    <div className="w-32">
      <div className="text-xs text-white/50 mb-1">{mainText}</div>
      <input
        className={cn(
          'w-full bg-transparent text-md border border-white/10 rounded px-2 py-1 focus:outline-none focus:border-white/20',
          isDisabled && 'opacity-50 cursor-not-allowed'
        )}
        onChange={handleChange}
        placeholder="0,00"
        readOnly={isDisabled}
        disabled={isDisabled}
        type="number"
        value={amount}
        min="0"
        max={max}
      />
    </div>
  );
};

const AssetSelector = ({
  symbol,
  availableAssets,
  onClick,
  children
}: {
  symbol: string;
  availableAssets: any;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col items-end gap-1">
    {children}

    <div
      className="flex items-center cursor-pointer"
      onClick={onClick}
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
);

const UtilizationSlider = ({
  currentUtilizationPercentage,
  handleUtilization,
  max
}: {
  currentUtilizationPercentage: number;
  handleUtilization?: (val: number) => void;
  max: string;
}) => {
  const isDisabled = max === '0';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'w-full',
              isDisabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Slider
              value={[currentUtilizationPercentage]}
              step={1}
              min={0}
              max={100}
              onValueChange={(value) =>
                !isDisabled && handleUtilization?.(value[0])
              }
              disabled={isDisabled}
              className="w-full"
            />
          </div>
        </TooltipTrigger>
        {isDisabled && (
          <TooltipContent>
            <p>No balance available</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

const Amount = ({
  handleInput,
  amount,
  availableAssets,
  hintText = 'Balance',
  mainText = 'Token Amount',
  max = '0',
  symbol,
  isLoading = false,
  readonly,
  setSelectedAsset,
  currentUtilizationPercentage,
  handleUtilization
}: IAmount) => {
  const [availableAssetsOpen, setAvailableAssetsOpen] = useState(false);

  const MaxButton = (
    <ResultHandler
      isLoading={isLoading}
      height={16}
      width={16}
    >
      <button
        onClick={() => handleInput(max)}
        className="text-xs text-white/50 hover:text-white transition-colors"
      >
        {hintText}: {parseFloat(max).toFixed(3)}
      </button>
    </ResultHandler>
  );

  const AssetsDropdown = availableAssets && (
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
  );

  return (
    <div className="w-full">
      {/* Mobile Layout */}
      <div className="flex md:hidden flex-col w-full gap-4">
        <div className="flex justify-between items-end w-full">
          <AmountInput
            mainText={mainText}
            handleInput={handleInput}
            readonly={readonly}
            amount={amount}
            max={max}
          />
          <AssetSelector
            symbol={symbol}
            availableAssets={availableAssets}
            onClick={() => setAvailableAssetsOpen(!availableAssetsOpen)}
          >
            {MaxButton}
          </AssetSelector>
        </div>

        {currentUtilizationPercentage !== undefined && (
          <UtilizationSlider
            currentUtilizationPercentage={currentUtilizationPercentage}
            handleUtilization={handleUtilization}
            max={max}
          />
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex items-center gap-8">
        <AmountInput
          mainText={mainText}
          handleInput={handleInput}
          readonly={readonly}
          amount={amount}
          max={max}
        />

        {currentUtilizationPercentage !== undefined && (
          <div className="flex-1">
            <UtilizationSlider
              currentUtilizationPercentage={currentUtilizationPercentage}
              handleUtilization={handleUtilization}
              max={max}
            />
          </div>
        )}

        <AssetSelector
          symbol={symbol}
          availableAssets={availableAssets}
          onClick={() => setAvailableAssetsOpen(!availableAssetsOpen)}
        >
          {MaxButton}
        </AssetSelector>
      </div>

      {AssetsDropdown}
    </div>
  );
};

export default Amount;
