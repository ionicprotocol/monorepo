import React, { useEffect, useState } from 'react';

import { type Address, formatUnits } from 'viem';
import { useChainId } from 'wagmi';

import { useMaxSupplyAmount } from '@ui/hooks/useMaxSupplyAmount';
import type { MarketData } from '@ui/types/TokensDataMap';

import Amount from '../manage/Amount';
import SliderComponent from '../manage/Slider';

export type LoopProps = {
  borrowableAssets: Address[];
  closeLoop: () => void;
  comptrollerAddress: Address;
  currentBorrowAsset?: MarketData;
  isOpen: boolean;
  selectedCollateralAsset: MarketData;
};

type SupplyActionsProps = {
  amount?: string;
  comptrollerAddress: LoopProps['comptrollerAddress'];
  handleClosePosition: () => void;
  isClosingPosition: boolean;
  selectedCollateralAsset: LoopProps['selectedCollateralAsset'];
  selectedCollateralAssetUSDPrice: number;
  setAmount: React.Dispatch<React.SetStateAction<string | undefined>>;
};

enum SupplyActionsMode {
  DEPOSIT,
  WITHDRAW
}

function SupplyActions({
  amount,
  comptrollerAddress,
  handleClosePosition,
  isClosingPosition,
  selectedCollateralAsset,
  selectedCollateralAssetUSDPrice,
  setAmount
}: SupplyActionsProps) {
  const chainId = useChainId();
  const [mode, setMode] = useState<SupplyActionsMode>(
    SupplyActionsMode.DEPOSIT
  );
  const [utilization, setUtilization] = useState<number>(0);
  const { data: maxSupplyAmount, isLoading: isLoadingMaxSupply } =
    useMaxSupplyAmount(selectedCollateralAsset, comptrollerAddress, chainId);

  const handleSupplyUtilization = (utilizationPercentage: number) => {
    if (utilizationPercentage >= 100) {
      setAmount(
        formatUnits(
          maxSupplyAmount?.bigNumber ?? 0n,
          parseInt(selectedCollateralAsset.underlyingDecimals.toString())
        )
      );

      return;
    }

    setAmount(
      ((utilizationPercentage / 100) * (maxSupplyAmount?.number ?? 0)).toFixed(
        parseInt(selectedCollateralAsset.underlyingDecimals.toString())
      )
    );
  };

  useEffect(() => {
    switch (mode) {
      case SupplyActionsMode.DEPOSIT:
        setUtilization(
          Math.round(
            (parseFloat(amount ?? '0') /
              (maxSupplyAmount && maxSupplyAmount.number > 0
                ? maxSupplyAmount.number
                : 1)) *
              100
          )
        );

        break;

      case SupplyActionsMode.WITHDRAW:
        break;
    }
  }, [amount, maxSupplyAmount, mode]);

  return (
    <div className="grow-0 shrink-0 basis-[45%]">
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
              maxSupplyAmount?.bigNumber ?? 0n,
              selectedCollateralAsset.underlyingDecimals
            )}
            selectedMarketData={selectedCollateralAsset}
            symbol={selectedCollateralAsset.underlyingSymbol}
          />

          <div className="flex text-xs text-white/50">
            $
            {(
              selectedCollateralAssetUSDPrice * parseFloat(amount ?? '0')
            ).toFixed(2)}
          </div>

          <SliderComponent
            currentUtilizationPercentage={utilization}
            handleUtilization={handleSupplyUtilization}
          />
        </>
      )}

      {mode === SupplyActionsMode.WITHDRAW && (
        <div className="py-5 text-center">
          <p className="text-sm mb-2">
            Click the button to withdraw your funds
          </p>

          <button
            className="btn-green uppercase"
            disabled={isClosingPosition}
            onClick={handleClosePosition}
          >
            Withdraw
          </button>
        </div>
      )}
    </div>
  );
}

export default SupplyActions;
