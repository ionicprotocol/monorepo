import { BigNumber } from 'ethers';
import Image from 'next/image';
import React, { useMemo, useState } from 'react';
import { useChainId } from 'wagmi';

import Modal from '../Modal';

import Amount from './Amount';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import type { MarketData } from '@ui/types/TokensDataMap';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

export type LoopProps = {
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
  nativeAmount: number;
  symbol: string;
  title: string;
  usdAmount: number;
};

type SupplyActionsProps = {
  amount?: string;
  selectedMarketData: LoopProps['selectedMarketData'];
  setAmount: React.Dispatch<React.SetStateAction<string | undefined>>;
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
          <span className="block font-bold text-lg">
            {nativeAmount.toFixed(2)}
          </span>{' '}
          ${usdAmount.toFixed(2)}
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
  selectedMarketData,
  setAmount
}: SupplyActionsProps) {
  const [mode, setMode] = useState<SupplyActionsMode>(
    SupplyActionsMode.DEPOSIT
  );

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

      <Amount
        amount={amount}
        handleInput={(val?: string) => setAmount(val)}
        hintText="Available:"
        isLoading={false}
        max={'0'}
        selectedMarketData={selectedMarketData}
        symbol={selectedMarketData.underlyingSymbol}
      />
    </div>
  );
}

export default function Loop({ selectedMarketData }: LoopProps) {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const { currentSdk } = useMultiIonic();
  const chainId = useChainId();
  const [amount, setAmount] = useState<string>();

  console.log(selectedMarketData);

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
            aprPercentage={'0.00%'}
            aprText={'Collateral APR'}
            nativeAmount={0}
            symbol={'ETH'}
            title={'My Collateral'}
            usdAmount={0}
          />

          <div className="separator" />

          <LoopInfoDisplay
            aprPercentage={'0.00%'}
            aprText={'Borrow APR'}
            nativeAmount={0}
            symbol={'ETH'}
            title={'My Borrow'}
            usdAmount={0}
          />

          <div className="separator" />

          <SupplyActions
            amount={amount}
            selectedMarketData={selectedMarketData}
            setAmount={setAmount}
          />
        </Modal>
      )}
    </>
  );
}
