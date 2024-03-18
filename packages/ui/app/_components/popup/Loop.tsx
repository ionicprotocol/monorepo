import { BigNumber } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';
import { useChainId } from 'wagmi';

import Modal from '../Modal';

import Amount from './Amount';
import SliderComponent from './Slider';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useMaxSupplyAmount } from '@ui/hooks/useMaxSupplyAmount';
import type { MarketData } from '@ui/types/TokensDataMap';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';
import { useMaxBorrowAmount } from '@ui/hooks/useMaxBorrowAmount';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import ResultHandler from '../ResultHandler';

export type LoopProps = {
  comptrollerAddress: string;
  selectedMarketData: MarketData;
};

type LoopHealthRatioDisplayProps = {
  currentValue: number;
  healthRatio: number;
  liquidationValue: number;
};

type LoopInfoDisplayProps = {
  aprPercentage: string;
  aprText: string;
  nativeAmount: string;
  symbol: string;
  title: string;
  usdAmount: number;
};

type SupplyActionsProps = {
  amount?: string;
  comptrollerAddress: LoopProps['comptrollerAddress'];
  selectedMarketData: LoopProps['selectedMarketData'];
  setAmount: React.Dispatch<React.SetStateAction<string | undefined>>;
};

type BorrowActionsProps = {
  borrowAmount?: string;
  comptrollerAddress: LoopProps['comptrollerAddress'];
  selectedMarketData: LoopProps['selectedMarketData'];
  setBorrowAmount: React.Dispatch<React.SetStateAction<string | undefined>>;
};

enum SupplyActionsMode {
  DEPOSIT,
  WITHDRAW
}

function LoopHealthRatioDisplay({
  currentValue,
  healthRatio,
  liquidationValue
}: LoopHealthRatioDisplayProps) {
  const healthRatioPosition = useMemo<number>(() => {
    if (healthRatio < 1) {
      return 0;
    }

    if (healthRatio > 10) {
      return 100;
    }

    return (healthRatio / 10) * 100;
  }, [healthRatio]);

  return (
    <div>
      <div
        className={`flex w-full mb-2 items-center justify-between mb-1 hint-text-uppercase `}
      >
        Health Ratio
      </div>

      <div className="relative h-[4px] mb-2 rounded-[4px] bg-health-ratio-gradient">
        <div
          className="absolute w-[8px] h-[8px] top-1/2 rounded-[8px] mt-[-4px] ml-[-4px] shadow-health-ratio-handle bg-white transition-all"
          style={{
            left: `${healthRatioPosition}%`
          }}
        >
          <span className="absolute bottom-full right-1/2 mb-1 translate-x-1/2 text-sm">
            {healthRatio.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="flex justify-between">
        <div className={`hint-text`}>
          <span className="block text-white text-sm">
            ${currentValue.toFixed(2)}
          </span>
          Current value
        </div>

        <div className={`hint-text text-right`}>
          <span className="block text-white text-sm">
            ${liquidationValue.toFixed(2)}
          </span>
          Liquidation
        </div>
      </div>
    </div>
  );
}

function LoopInfoDisplay({
  aprText,
  aprPercentage,
  nativeAmount,
  symbol,
  title,
  usdAmount
}: LoopInfoDisplayProps) {
  return (
    <div>
      <div className="text-lg font-bold color-white">{title}</div>

      <div className="flex justify-between items-start mb-1">
        <div className="text-white/50 text-xs">
          <span className="block font-bold text-lg">{nativeAmount}</span> $
          {usdAmount.toFixed(2)}
        </div>

        <div className="flex items-center font-bold">
          <Image
            alt=""
            className="mr-2"
            height="20"
            src={`/img/symbols/32/color/${symbol.toLowerCase()}.png`}
            width="20"
          />

          {symbol}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="hint-text-uppercase">{aprText}</span>

        <span className="font-bold">{aprPercentage}</span>
      </div>
    </div>
  );
}

function SupplyActions({
  amount,
  comptrollerAddress,
  selectedMarketData,
  setAmount
}: SupplyActionsProps) {
  const chainId = useChainId();
  const [mode, setMode] = useState<SupplyActionsMode>(
    SupplyActionsMode.DEPOSIT
  );
  const [utilization, setUtilization] = useState<number>(0);
  const { data: maxSupplyAmount, isLoading: isLoadingMaxSupply } =
    useMaxSupplyAmount(selectedMarketData, comptrollerAddress, chainId);
  const selectedMarketDataUSDPrice = useMemo<number>(
    () =>
      selectedMarketData.totalSupplyFiat /
      parseFloat(
        formatUnits(
          selectedMarketData.totalSupply,
          selectedMarketData.underlyingDecimals
        )
      ),
    [selectedMarketData]
  );

  const handleSupplyUtilization = (utilizationPercentage: number) => {
    if (utilizationPercentage >= 100) {
      setAmount(
        formatUnits(
          maxSupplyAmount?.bigNumber ?? '0',
          parseInt(selectedMarketData.underlyingDecimals.toString())
        )
      );

      return;
    }

    setAmount(
      ((utilizationPercentage / 100) * (maxSupplyAmount?.number ?? 0)).toFixed(
        parseInt(selectedMarketData.underlyingDecimals.toString())
      )
    );
  };

  useEffect(() => {
    switch (mode) {
      case SupplyActionsMode.DEPOSIT:
        setUtilization(
          Math.round(
            (parseFloat(amount ?? '0') / (maxSupplyAmount?.number ?? 1)) * 100
          )
        );

        break;

      case SupplyActionsMode.WITHDRAW:
        break;
    }
  }, [amount, maxSupplyAmount, mode]);

  return (
    <div>
      <div className="mb-2 inline-flex rounded-2xl text-center p-1 bg-grayone">
        <div
          className={`rounded-xl transition-all cursor-pointer py-2 px-4 ${
            mode === SupplyActionsMode.DEPOSIT
              ? 'bg-darkone text-accent font-bold'
              : 'text-white/40'
          }`}
          onClick={() => setMode(SupplyActionsMode.DEPOSIT)}
        >
          Deposit
        </div>

        <div
          className={`rounded-xl transition-all cursor-pointer py-2 px-4 ${
            mode === SupplyActionsMode.WITHDRAW
              ? 'bg-darkone text-accent font-bold'
              : 'text-white/40'
          }`}
          onClick={() => setMode(SupplyActionsMode.WITHDRAW)}
        >
          Withdraw
        </div>
      </div>

      {mode === SupplyActionsMode.DEPOSIT && (
        <>
          <Amount
            amount={amount}
            handleInput={(val?: string) => setAmount(val)}
            hintText="Available:"
            isLoading={isLoadingMaxSupply}
            mainText="AMOUNT TO DEPOSIT"
            max={formatUnits(
              maxSupplyAmount?.bigNumber ?? '0',
              selectedMarketData.underlyingDecimals
            )}
            selectedMarketData={selectedMarketData}
            symbol={selectedMarketData.underlyingSymbol}
          />

          <div className="flex text-xs text-white/50">
            $
            {(selectedMarketDataUSDPrice * parseFloat(amount ?? '0')).toFixed(
              2
            )}
          </div>

          <SliderComponent
            currentUtilizationPercentage={utilization}
            handleUtilization={handleSupplyUtilization}
          />
        </>
      )}
    </div>
  );
}

function BorrowActions({
  borrowAmount,
  comptrollerAddress,
  selectedMarketData,
  setBorrowAmount
}: BorrowActionsProps) {
  const chainId = useChainId();
  const { data: maxBorrowAmount, isLoading: isLoadingMaxBorrowAmount } =
    useMaxBorrowAmount(selectedMarketData, comptrollerAddress, chainId);
  const { data: marketData, isLoading: isLoadingMarketData } = useFusePoolData(
    '0',
    chainId
  );
  const [selectedBorrowAsset, setSelectedBorrowAsset] = useState<
    MarketData | undefined
  >(marketData?.assets[0]);
  const selectedBorrowDataUSDPrice = useMemo<number>(
    () =>
      selectedBorrowAsset
        ? selectedBorrowAsset.totalSupplyFiat /
          parseFloat(
            formatUnits(
              selectedBorrowAsset.totalSupply,
              selectedBorrowAsset.underlyingDecimals
            )
          )
        : 0,
    [selectedBorrowAsset]
  );

  return (
    <ResultHandler isLoading={isLoadingMarketData}>
      {selectedBorrowAsset && (
        <>
          <Amount
            amount={borrowAmount}
            availableAssets={marketData?.assets}
            handleInput={(val?: string) => setBorrowAmount(val)}
            hintText="Available:"
            isLoading={isLoadingMaxBorrowAmount}
            mainText="AMOUNT TO BORROW"
            max={formatUnits(
              maxBorrowAmount?.bigNumber ?? '0',
              selectedBorrowAsset.underlyingDecimals
            )}
            selectedMarketData={selectedBorrowAsset}
            setSelectedAsset={(asset: MarketData) =>
              setSelectedBorrowAsset(asset)
            }
            symbol={selectedBorrowAsset.underlyingSymbol}
          />

          <div className="flex text-xs text-white/50">
            $
            {(
              selectedBorrowDataUSDPrice * parseFloat(borrowAmount ?? '0')
            ).toFixed(2)}
          </div>
        </>
      )}
    </ResultHandler>
  );
}

export default function Loop({
  selectedMarketData,
  comptrollerAddress
}: LoopProps) {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const { currentSdk } = useMultiIonic();
  const chainId = useChainId();
  const [amount, setAmount] = useState<string>();
  const [borrowAmount, setBorrowAmount] = useState<string>();

  return (
    <>
      {isOpen && (
        <Modal close={() => setIsOpen(false)}>
          <div className="flex mb-4 items-center text-lg font-bold">
            <Image
              alt=""
              className="mr-2"
              height="20"
              src={`/img/symbols/32/color/${selectedMarketData.underlyingSymbol.toLowerCase()}.png`}
              width="20"
            />

            {selectedMarketData.underlyingSymbol}
          </div>

          <div
            className={`flex w-full items-center justify-between mb-1 hint-text-uppercase `}
          >
            <span className={``}>Position Value</span>
            <span className={`flex text-sm font-bold pl-2 text-white`}>
              $
              {selectedMarketData.supplyBalanceFiat.toLocaleString('en-US', {
                maximumFractionDigits: 2
              })}
            </span>
          </div>
          <div
            className={`flex w-full items-center justify-between mb-1 hint-text-uppercase `}
          >
            <span className={``}>Net APR</span>
            <span className={`flex text-sm font-bold pl-2 text-white`}>
              {currentSdk
                ?.ratePerBlockToAPY(
                  selectedMarketData.supplyRatePerBlock ?? BigNumber.from(0),
                  getBlockTimePerMinuteByChainId(chainId)
                )
                .toFixed(2) ?? '0.00'}
              %
            </span>
          </div>

          <div
            className={`flex w-full items-center justify-between mb-1 hint-text-uppercase `}
          >
            <span className={``}>Annual yield</span>
            <span className={`flex text-sm font-bold pl-2 text-white`}>
              TODO
            </span>
          </div>

          <div className={`separator`} />

          <LoopHealthRatioDisplay
            currentValue={0}
            healthRatio={11}
            liquidationValue={0}
          />

          <div className={`separator`} />

          <LoopInfoDisplay
            aprPercentage={`${
              currentSdk
                ?.ratePerBlockToAPY(
                  selectedMarketData.supplyRatePerBlock ?? BigNumber.from(0),
                  getBlockTimePerMinuteByChainId(chainId)
                )
                .toFixed(2) ?? '0.00'
            }%`}
            aprText={'Collateral APR'}
            nativeAmount={formatUnits(
              selectedMarketData.supplyBalance.add(
                parseUnits(amount ?? '0', selectedMarketData.underlyingDecimals)
              ),
              selectedMarketData.underlyingDecimals
            )}
            symbol={selectedMarketData.underlyingSymbol}
            title={'My Collateral'}
            usdAmount={selectedMarketData.supplyBalanceNative}
          />

          <div className="separator" />

          <LoopInfoDisplay
            aprPercentage={'0.00%'}
            aprText={'Borrow APR'}
            nativeAmount={'0'}
            symbol={'ETH'}
            title={'My Borrow'}
            usdAmount={0}
          />

          <div className="separator" />

          <SupplyActions
            amount={amount}
            comptrollerAddress={comptrollerAddress}
            selectedMarketData={selectedMarketData}
            setAmount={setAmount}
          />

          <div className="separator" />

          <BorrowActions
            borrowAmount={borrowAmount}
            comptrollerAddress={comptrollerAddress}
            selectedMarketData={selectedMarketData}
            setBorrowAmount={setBorrowAmount}
          />
        </Modal>
      )}
    </>
  );
}
