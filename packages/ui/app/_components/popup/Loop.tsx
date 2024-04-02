import { BigNumber } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import millify from 'millify';
import Image from 'next/image';
import type { Dispatch, SetStateAction } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import type { OpenPosition } from 'types/dist';
import { useChainId } from 'wagmi';

import Modal from '../Modal';
import Range from '../Range';
import ResultHandler from '../ResultHandler';

import Amount from './Amount';
import SliderComponent from './Slider';

import { useCurrentLeverageRatio } from '@ui/hooks/leverage/useCurrentLeverageRatio';
import { useGetNetApy } from '@ui/hooks/leverage/useGetNetApy';
import { useOpenPositionMutation } from '@ui/hooks/leverage/useOpenPositionMutation';
import { usePositionInfo } from '@ui/hooks/leverage/usePositionInfo';
import { usePositionsQuery } from '@ui/hooks/leverage/usePositions';
import { usePositionsSupplyApy } from '@ui/hooks/leverage/usePositionsSupplyApy';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useMaxBorrowAmount } from '@ui/hooks/useMaxBorrowAmount';
import { useMaxSupplyAmount } from '@ui/hooks/useMaxSupplyAmount';
import type { MarketData } from '@ui/types/TokensDataMap';

export type LoopProps = {
  comptrollerAddress: string;
  isOpen: boolean;
  selectedCollateralAsset: MarketData;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

type LoopHealthRatioDisplayProps = {
  currentValue: string;
  healthRatio: number;
  liquidationValue: string;
};

type LoopInfoDisplayProps = {
  aprPercentage: string;
  aprText: string;
  isLoading: boolean;
  nativeAmount: string;
  symbol: string;
  title: string;
  usdAmount: string;
};

type SupplyActionsProps = {
  amount?: string;
  comptrollerAddress: LoopProps['comptrollerAddress'];
  selectedCollateralAsset: LoopProps['selectedCollateralAsset'];
  setAmount: React.Dispatch<React.SetStateAction<string | undefined>>;
};

type BorrowActionsProps = {
  borrowAmount?: string;
  comptrollerAddress: LoopProps['comptrollerAddress'];
  currentLeverage: number;
  selectedBorrowAsset?: MarketData;
  selectedBorrowAssetUSDPrice: number;
  selectedCollateralAsset: LoopProps['selectedCollateralAsset'];
  setCurrentLeverage: Dispatch<SetStateAction<number>>;
  setSelectedBorrowAsset: React.Dispatch<
    React.SetStateAction<MarketData | undefined>
  >;
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
    if (healthRatio < 0) {
      return 0;
    }

    if (healthRatio > 1) {
      return 100;
    }

    return healthRatio * 100;
  }, [healthRatio]);

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
            left: `${healthRatioPosition}%`
          }}
        >
          {/* <span className="absolute bottom-full right-1/2 mb-1 translate-x-1/2 text-sm">
            {healthRatio.toFixed(2)}
          </span> */}
        </div>
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

function LoopInfoDisplay({
  aprText,
  aprPercentage,
  isLoading,
  nativeAmount,
  symbol,
  title,
  usdAmount
}: LoopInfoDisplayProps) {
  return (
    <div className="grow-0 shrink-0 basis-[45%]">
      <div className="text-lg font-bold color-white">{title}</div>

      <div className="flex justify-between items-start mb-1">
        <div className="text-white/50 text-xs">
          <ResultHandler
            height="28"
            isLoading={isLoading}
            width="28"
          >
            <span className="block font-bold text-lg">{nativeAmount}</span> $
            {usdAmount}
          </ResultHandler>
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

        <ResultHandler
          height="24"
          isLoading={isLoading}
          width="24"
        >
          <span className="font-bold">{aprPercentage}</span>
        </ResultHandler>
      </div>
    </div>
  );
}

function SupplyActions({
  amount,
  comptrollerAddress,
  selectedCollateralAsset,
  setAmount
}: SupplyActionsProps) {
  const chainId = useChainId();
  const [mode, setMode] = useState<SupplyActionsMode>(
    SupplyActionsMode.DEPOSIT
  );
  const [utilization, setUtilization] = useState<number>(0);
  const { data: maxSupplyAmount, isLoading: isLoadingMaxSupply } =
    useMaxSupplyAmount(selectedCollateralAsset, comptrollerAddress, chainId);
  const selectedCollateralAssetUSDPrice = useMemo<number>(
    () =>
      selectedCollateralAsset.totalSupplyFiat /
      parseFloat(
        formatUnits(
          selectedCollateralAsset.totalSupply,
          selectedCollateralAsset.underlyingDecimals
        )
      ),
    [selectedCollateralAsset]
  );

  const handleSupplyUtilization = (utilizationPercentage: number) => {
    if (utilizationPercentage >= 100) {
      setAmount(
        formatUnits(
          maxSupplyAmount?.bigNumber ?? '0',
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
            (parseFloat(amount ?? '0') / (maxSupplyAmount?.number ?? 1)) * 100
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
              maxSupplyAmount?.bigNumber ?? '0',
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
    </div>
  );
}

function BorrowActions({
  borrowAmount,
  currentLeverage,
  comptrollerAddress,
  selectedBorrowAsset,
  selectedBorrowAssetUSDPrice,
  setCurrentLeverage,
  selectedCollateralAsset,
  setSelectedBorrowAsset
}: BorrowActionsProps) {
  const chainId = useChainId();
  const { data: marketData, isLoading: isLoadingMarketData } = useFusePoolData(
    '0',
    chainId
  );
  const maxLoop = 2;

  return (
    <ResultHandler isLoading={isLoadingMarketData}>
      {selectedBorrowAsset && (
        <div className="grow-0 shrink-0 basis-[45%]">
          <div className="relative z-50">
            <Amount
              amount={borrowAmount}
              availableAssets={marketData?.assets}
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
              <div className="flex justify-between mb-2 text-xs md:text-sm">
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
                    className={`cursor-pointer ${
                      i > maxLoop && 'text-white/20'
                    } ${currentLeverage === i + 1 && 'text-accent'}`}
                    key={`label-${label}`}
                    onClick={() =>
                      setCurrentLeverage(i > maxLoop ? maxLoop + 1 : i + 1)
                    }
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

export default function Loop({
  selectedCollateralAsset,
  isOpen,
  comptrollerAddress,
  setIsOpen
}: LoopProps) {
  const chainId = useChainId();
  const [amount, setAmount] = useState<string>();
  const { data: marketData } = useFusePoolData('0', chainId);
  const selectedCollateralAssetUSDPrice = useMemo<number>(
    () =>
      selectedCollateralAsset.totalSupplyFiat /
      parseFloat(
        formatUnits(
          selectedCollateralAsset.totalSupply,
          selectedCollateralAsset.underlyingDecimals
        )
      ),
    [selectedCollateralAsset]
  );
  const [selectedBorrowAsset, setSelectedBorrowAsset] = useState<
    MarketData | undefined
  >(marketData?.assets[0]);
  const selectedBorrowAssetUSDPrice = useMemo<number>(
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
  const { data: positions } = usePositionsQuery();
  const currentPosition = useMemo<OpenPosition | undefined>(() => {
    return positions?.openPositions.find(
      (position) =>
        position.borrowable.underlyingToken ===
          selectedBorrowAsset?.underlyingToken &&
        position.collateral.underlyingToken ===
          selectedCollateralAsset.underlyingToken
    );
  }, [positions, selectedBorrowAsset, selectedCollateralAsset]);
  const { data: currentPositionLeverageRatio } = useCurrentLeverageRatio(
    currentPosition?.address ?? '',
    chainId
  );
  const { mutate: openPosition } = useOpenPositionMutation();
  const collateralsAPR = usePositionsSupplyApy(
    positions?.openPositions.map((position) => position.collateral) ?? [],
    [chainId]
  );
  const { data: positionInfo, isFetching: isFetchingPositionInfo } =
    usePositionInfo(
      currentPosition?.address ?? '',
      collateralsAPR &&
        collateralsAPR[selectedCollateralAsset.cToken] !== undefined
        ? parseUnits(
            collateralsAPR[selectedCollateralAsset.cToken].totalApy.toFixed(18)
          )
        : undefined,
      chainId
    );
  const { data: positionNetApy, isFetching: isFetchingPositionNetApy } =
    useGetNetApy(
      selectedCollateralAsset.cToken,
      selectedBorrowAsset?.cToken ?? '',
      positionInfo?.equityAmount,
      currentPositionLeverageRatio,
      collateralsAPR &&
        collateralsAPR[selectedCollateralAsset.cToken] !== undefined
        ? parseUnits(
            collateralsAPR[selectedCollateralAsset.cToken].totalApy.toFixed(18)
          )
        : undefined,
      chainId
    );
  const [currentLeverage, setCurrentLeverage] = useState<number>(1);
  const {
    borrowedAssetAmount,
    borrowedToCollateralRatio,
    positionValueMillified,
    liquidationValue,
    healthRatio
  } = useMemo(() => {
    const positionValue =
      Number(formatUnits(positionInfo?.positionSupplyAmount ?? '0')) *
      (selectedCollateralAssetUSDPrice ?? 0) *
      (currentPositionLeverageRatio ?? 1);
    const liquidationValue =
      positionValue * Number(formatUnits(positionInfo?.safetyBuffer ?? '0'));
    const healthRatio = positionValue / liquidationValue - 1;
    const borrowedToCollateralRatio =
      selectedBorrowAssetUSDPrice / selectedCollateralAssetUSDPrice;
    const borrowedAssetAmount =
      (Number(formatUnits(positionInfo?.positionSupplyAmount ?? '0')) /
        borrowedToCollateralRatio) *
      (currentPositionLeverageRatio ?? 1);

    return {
      borrowedAssetAmount,
      borrowedToCollateralRatio,
      healthRatio,
      liquidationValue,
      positionValue,
      positionValueMillified: `${millify(positionValue)}`
    };
  }, [
    currentPositionLeverageRatio,
    selectedBorrowAssetUSDPrice,
    selectedCollateralAssetUSDPrice,
    positionInfo
  ]);

  // console.log(positionValue);

  if (positionInfo && currentPosition) {
    console.log(currentPosition, positionInfo);
    // console.log(formatUnits(positionInfo.safetyBuffer));
    // console.log(
    //   formatUnits(positionInfo.equityAmount)
    // );

    // console.log(formatUnits(currentPosition.borrowable.rate));
  }

  return (
    <>
      {isOpen && (
        <Modal close={() => setIsOpen(false)}>
          <div className="flex mb-4 items-center text-lg font-bold">
            <Image
              alt=""
              className="mr-2"
              height="20"
              src={`/img/symbols/32/color/${selectedCollateralAsset.underlyingSymbol.toLowerCase()}.png`}
              width="20"
            />

            {selectedCollateralAsset.underlyingSymbol}
          </div>

          <div className="lg:flex justify-between items-center">
            <div className="grow-0 shrink-0 basis-[45%]">
              <div
                className={`flex w-full items-center justify-between mb-1 hint-text-uppercase `}
              >
                <span className={``}>Position Value</span>
                <ResultHandler
                  height="20"
                  isLoading={isFetchingPositionInfo}
                  width="20"
                >
                  <span className={`flex text-sm font-bold pl-2 text-white`}>
                    ${positionValueMillified}
                  </span>
                </ResultHandler>
              </div>
              <div
                className={`flex w-full items-center justify-between mb-1 hint-text-uppercase `}
              >
                <span className={``}>Net APR</span>
                <ResultHandler
                  height="20"
                  isLoading={isFetchingPositionNetApy}
                  width="20"
                >
                  <span className={`flex text-sm font-bold pl-2 text-white`}>
                    {positionNetApy?.toFixed(2) ?? '0.00'}%
                  </span>
                </ResultHandler>
              </div>

              <div
                className={`flex w-full items-center justify-between mb-1 hint-text-uppercase `}
              >
                <span className={``}>Annual yield</span>
                <span className={`flex text-sm font-bold pl-2 text-white`}>
                  TODO
                </span>
              </div>
            </div>

            <div className={`separator lg:hidden`} />

            <div className="separator-vertical hidden lg:block" />

            <LoopHealthRatioDisplay
              currentValue={positionValueMillified}
              healthRatio={healthRatio}
              liquidationValue={millify(liquidationValue)}
            />
          </div>

          <div className={`separator`} />

          <div className="flex justify-between items-center">
            <LoopInfoDisplay
              aprPercentage={`
                  ${
                    collateralsAPR &&
                    collateralsAPR[selectedCollateralAsset.cToken]
                      ? collateralsAPR[
                          selectedCollateralAsset.cToken
                        ].totalApy.toFixed(4)
                      : '0.00'
                  }
                  %
              `}
              aprText={'Collateral APR'}
              isLoading={isFetchingPositionInfo}
              nativeAmount={
                currentPosition
                  ? formatUnits(
                      positionInfo?.positionSupplyAmount ?? '0',
                      currentPosition.collateral.underlyingDecimals
                    )
                  : '0'
              }
              symbol={selectedCollateralAsset.underlyingSymbol}
              title={'My Collateral'}
              usdAmount={positionValueMillified}
            />

            <div className="separator lg:hidden" />

            <div className="separator-vertical hidden lg:block" />

            <LoopInfoDisplay
              aprPercentage={`
                  ${0}
                  %
              `}
              aprText={'Borrow APR'}
              isLoading={isFetchingPositionInfo}
              nativeAmount={borrowedAssetAmount.toFixed(
                selectedBorrowAsset?.underlyingDecimals.toNumber() ?? 18
              )}
              symbol={selectedBorrowAsset?.underlyingSymbol ?? ''}
              title={'My Borrow'}
              usdAmount={millify(
                borrowedAssetAmount * selectedBorrowAssetUSDPrice
              )}
            />
          </div>

          <div className="separator" />

          <div className="lg:flex justify-between items-center">
            <SupplyActions
              amount={amount}
              comptrollerAddress={comptrollerAddress}
              selectedCollateralAsset={selectedCollateralAsset}
              setAmount={setAmount}
            />

            <div className="separator lg:hidden" />

            <div className="separator-vertical hidden lg:block" />

            <BorrowActions
              borrowAmount={(
                (parseFloat(amount ?? '0') / borrowedToCollateralRatio) *
                currentLeverage
              ).toFixed(
                parseInt(
                  selectedBorrowAsset?.underlyingDecimals.toString() ?? '18'
                )
              )}
              comptrollerAddress={comptrollerAddress}
              currentLeverage={currentLeverage}
              selectedBorrowAsset={selectedBorrowAsset}
              selectedBorrowAssetUSDPrice={selectedBorrowAssetUSDPrice}
              selectedCollateralAsset={selectedCollateralAsset}
              setCurrentLeverage={setCurrentLeverage}
              setSelectedBorrowAsset={setSelectedBorrowAsset}
            />
          </div>

          <div className="mt-4">
            <ResultHandler
              height="32"
              isLoading={isFetchingPositionInfo}
            >
              <button
                className="block w-full btn-green"
                onClick={() =>
                  openPosition({
                    borrowMarket: selectedBorrowAsset?.cToken ?? '',
                    collateralMarket: selectedCollateralAsset.cToken,
                    fundingAmount: parseUnits(
                      amount ?? '',
                      selectedCollateralAsset.underlyingDecimals
                    ),
                    fundingAsset: selectedCollateralAsset.underlyingToken,
                    leverage: BigNumber.from(currentLeverage)
                  })
                }
              >
                Loop
              </button>
            </ResultHandler>
          </div>
        </Modal>
      )}
    </>
  );
}
