import { useQueryClient } from '@tanstack/react-query';
import { type BigNumber, constants } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import millify from 'millify';
import Image from 'next/image';
import type { Dispatch, SetStateAction } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { OpenPosition } from 'types/dist';
import { useBalance, useChainId } from 'wagmi';

import Modal from '../Modal';
import Range from '../Range';
import ResultHandler from '../ResultHandler';

import Amount from './Amount';
import SliderComponent from './Slider';
import TransactionStepsHandler, {
  useTransactionSteps
} from './TransactionStepsHandler';

import { INFO_MESSAGES } from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useCurrentLeverageRatio } from '@ui/hooks/leverage/useCurrentLeverageRatio';
import { useGetNetApy } from '@ui/hooks/leverage/useGetNetApy';
import { useGetPositionBorrowApr } from '@ui/hooks/leverage/useGetPositionBorrowApr';
import { usePositionInfo } from '@ui/hooks/leverage/usePositionInfo';
import { usePositionsQuery } from '@ui/hooks/leverage/usePositions';
import { usePositionsSupplyApy } from '@ui/hooks/leverage/usePositionsSupplyApy';
import { useUsdPrice } from '@ui/hooks/useAllUsdPrices';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useMaxSupplyAmount } from '@ui/hooks/useMaxSupplyAmount';
import type { MarketData } from '@ui/types/TokensDataMap';

export type LoopProps = {
  borrowableAssets: string[];
  closeLoop: () => void;
  comptrollerAddress: string;
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

type LoopInfoDisplayProps = {
  aprPercentage?: string;
  aprText?: string;
  isLoading: boolean;
  nativeAmount: string;
  symbol: string;
  title: string;
  usdAmount: string;
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

enum SupplyActionsMode {
  DEPOSIT,
  WITHDRAW
}

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
            height="44"
            isLoading={isLoading}
            width="44"
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

      {aprText && aprPercentage && (
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
      )}
    </div>
  );
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
          <div className="relative z-50">
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

export default function Loop({
  borrowableAssets,
  closeLoop,
  comptrollerAddress,
  currentBorrowAsset,
  selectedCollateralAsset,
  isOpen
}: LoopProps) {
  const chainId = useChainId();
  const [amount, setAmount] = useState<string>();
  const amountAsBInt = useMemo<BigNumber>(
    () => parseUnits(amount ?? '0', selectedCollateralAsset.underlyingDecimals),
    [amount, selectedCollateralAsset]
  );
  const { data: marketData } = useFusePoolData('0', chainId, true);
  const { data: usdPrice } = useUsdPrice(chainId.toString());
  const [selectedBorrowAsset, setSelectedBorrowAsset] = useState<
    MarketData | undefined
  >(currentBorrowAsset);
  const { data: positions } = usePositionsQuery();
  const currentPosition = useMemo<OpenPosition | undefined>(() => {
    return positions?.openPositions.find(
      (position) =>
        position.borrowable.underlyingToken ===
          selectedBorrowAsset?.underlyingToken &&
        position.collateral.underlyingToken ===
          selectedCollateralAsset.underlyingToken &&
        !position.isClosed
    );
  }, [positions, selectedBorrowAsset, selectedCollateralAsset]);
  const { data: currentPositionLeverageRatio } = useCurrentLeverageRatio(
    currentPosition?.address ?? '',
    chainId
  );
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
  const { data: borrowApr } = useGetPositionBorrowApr({
    amount: amountAsBInt,
    borrowMarket: selectedBorrowAsset?.cToken ?? '',
    collateralMarket: selectedCollateralAsset.cToken,
    leverage: parseUnits(currentLeverage.toString())
  });

  const {
    borrowedAssetAmount,
    borrowedToCollateralRatio,
    positionValueMillified,
    projectedHealthRatio,
    liquidationValue,
    healthRatio,
    projectedCollateral,
    projectedBorrowAmount,
    projectedCollateralValue,
    selectedBorrowAssetUSDPrice,
    selectedCollateralAssetUSDPrice
  } = useMemo(() => {
    const selectedCollateralAssetUSDPrice =
      (usdPrice ?? 0) *
      parseFloat(formatUnits(selectedCollateralAsset.underlyingPrice));
    const selectedBorrowAssetUSDPrice =
      usdPrice && selectedBorrowAsset
        ? (usdPrice ?? 0) *
          parseFloat(formatUnits(selectedBorrowAsset.underlyingPrice))
        : 0;
    const positionValue =
      Number(formatUnits(positionInfo?.positionSupplyAmount ?? '0')) *
      (selectedCollateralAssetUSDPrice ?? 0);
    const liquidationValue =
      positionValue * Number(formatUnits(positionInfo?.safetyBuffer ?? '0'));
    const healthRatio = positionValue / liquidationValue - 1;
    const borrowedToCollateralRatio =
      selectedBorrowAssetUSDPrice / selectedCollateralAssetUSDPrice;
    const borrowedAssetAmount = Number(
      formatUnits(
        positionInfo?.debtAmount ?? '0',
        currentPosition?.borrowable.underlyingDecimals
      )
    );
    const projectedCollateral = formatUnits(
      positionInfo?.equityAmount.add(amountAsBInt) ?? '0',
      selectedCollateralAsset.underlyingDecimals
    );
    const projectedCollateralValue =
      Number(projectedCollateral) * selectedCollateralAssetUSDPrice;
    const projectedBorrowAmount =
      (Number(projectedCollateral) / borrowedToCollateralRatio) *
      (currentLeverage - 1);
    const projectedHealthRatio = currentPosition
      ? (projectedCollateralValue +
          projectedBorrowAmount * selectedBorrowAssetUSDPrice) /
          liquidationValue -
        1
      : undefined;

    return {
      borrowedAssetAmount,
      borrowedToCollateralRatio,
      healthRatio,
      liquidationValue,
      positionValue,
      positionValueMillified: `${millify(positionValue)}`,
      projectedBorrowAmount,
      projectedCollateral,
      projectedCollateralValue,
      projectedHealthRatio,
      selectedBorrowAssetUSDPrice,
      selectedCollateralAssetUSDPrice
    };
  }, [
    amountAsBInt,
    currentLeverage,
    currentPosition,
    selectedBorrowAsset,
    selectedCollateralAsset,
    positionInfo,
    usdPrice
  ]);
  const { currentSdk, address } = useMultiIonic();
  const { addStepsForAction, transactionSteps, upsertTransactionStep } =
    useTransactionSteps();
  const { refetch: refetchBalance } = useBalance({
    address,
    token: selectedCollateralAsset.underlyingToken as `0x${string}`
  });
  const queryClient = useQueryClient();

  /**
   * Force new borrow asset
   * when currentBorrowAsset
   * is present
   */
  useEffect(() => {
    if (currentBorrowAsset && isOpen) {
      setSelectedBorrowAsset(currentBorrowAsset);
    }
  }, [currentBorrowAsset, isOpen]);

  /**
   * Update selected borrow asset
   * when market data loads
   */
  useEffect(() => {
    if (!selectedBorrowAsset && marketData) {
      setSelectedBorrowAsset(
        marketData.assets.filter((asset) =>
          borrowableAssets.find(
            (borrowableAsset) => borrowableAsset === asset.cToken
          )
        )[0]
      );
    }
  }, [borrowableAssets, marketData, selectedBorrowAsset]);

  /**
   * Reset neccessary queries after actions
   */
  const resetQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['useCurrentLeverageRatio'] });
    queryClient.invalidateQueries({ queryKey: ['useGetNetApy'] });
    queryClient.invalidateQueries({ queryKey: ['usePositionInfo'] });
    queryClient.invalidateQueries({ queryKey: ['positions'] });
    queryClient.invalidateQueries({ queryKey: ['useMaxSupplyAmount'] });
    refetchBalance();
  };

  /**
   * Handle position opening
   */
  const handleOpenPosition = async (): Promise<void> => {
    if (!currentSdk || !address) {
      return;
    }

    let currentTransactionStep = 0;

    addStepsForAction([
      {
        error: false,
        message: INFO_MESSAGES.OPEN_POSITION.APPROVE,
        success: false
      },
      {
        error: false,
        message: INFO_MESSAGES.OPEN_POSITION.OPENING,
        success: false
      }
    ]);

    try {
      const token = currentSdk.getEIP20TokenInstance(
        selectedCollateralAsset.underlyingToken,
        currentSdk.signer
      );
      const factory = currentSdk.createLeveredPositionFactory();
      const hasApprovedEnough = (
        await token.callStatic.allowance(address, factory.address)
      ).gte(amountAsBInt);

      if (!hasApprovedEnough) {
        const tx = await token.approve(factory.address, constants.MaxUint256);

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            txHash: tx.hash
          }
        });

        await tx.wait();
      }

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          success: true
        }
      });

      currentTransactionStep++;

      const tx = await currentSdk.createAndFundPositionAtRatio(
        selectedCollateralAsset.cToken,
        selectedBorrowAsset?.cToken ?? '',
        selectedCollateralAsset.underlyingToken,
        amountAsBInt,
        parseUnits(currentLeverage.toString())
      );

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          txHash: tx.hash
        }
      });

      await tx.wait();

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          success: true
        }
      });
    } catch (error) {
      console.error(error);

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          error: true
        }
      });
    }
  };

  /**
   * Handle leverage adjustment
   */
  const handleLeverageAdjustment = async (): Promise<void> => {
    const currentTransactionStep = 0;

    addStepsForAction([
      {
        error: false,
        message: INFO_MESSAGES.ADJUST_LEVERAGE.ADJUSTING,
        success: false
      }
    ]);

    try {
      const tx = await currentSdk?.adjustLeverageRatio(
        currentPosition?.address ?? '',
        currentLeverage
      );

      if (!tx) {
        throw new Error('Error while adjusting leverage');
      }

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          txHash: tx.hash
        }
      });

      await tx.wait();

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          success: true
        }
      });
    } catch (error) {
      console.error(error);

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          error: true
        }
      });
    }
  };

  /**
   * Handle position funding
   */
  const handlePositionFunding = async (): Promise<void> => {
    if (!currentSdk || !address || !currentPosition) {
      return;
    }

    let currentTransactionStep = 0;

    addStepsForAction([
      {
        error: false,
        message: INFO_MESSAGES.FUNDING_POSITION.APPROVE,
        success: false
      },
      {
        error: false,
        message: INFO_MESSAGES.FUNDING_POSITION.FUNDING,
        success: false
      }
    ]);

    try {
      const token = currentSdk.getEIP20TokenInstance(
        selectedCollateralAsset.underlyingToken,
        currentSdk.signer
      );
      const hasApprovedEnough = (
        await token.callStatic.allowance(address, currentPosition.address)
      ).gte(amountAsBInt);

      if (!hasApprovedEnough) {
        const tx = await token.approve(
          currentPosition.address,
          constants.MaxUint256
        );

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            txHash: tx.hash
          }
        });

        await tx.wait();
      }

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          success: true
        }
      });

      currentTransactionStep++;

      const tx = await currentSdk.fundPosition(
        currentPosition?.address ?? '',
        selectedCollateralAsset.underlyingToken,
        amountAsBInt
      );

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          txHash: tx.hash
        }
      });

      await tx.wait();

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          success: true
        }
      });
    } catch (error) {
      console.error(error);

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          error: true
        }
      });
    }
  };

  /**
   * Handle position closing
   */
  const handleClosePosition = async (): Promise<void> => {
    const currentTransactionStep = 0;

    addStepsForAction([
      {
        error: false,
        message: INFO_MESSAGES.CLOSE_POSITION.CLOSING,
        success: false
      }
    ]);

    try {
      const tx = await currentSdk?.closeLeveredPosition(
        currentPosition?.address ?? ''
      );

      if (!tx) {
        throw new Error('Error while closing position');
      }

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          txHash: tx.hash
        }
      });

      await tx.wait();

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          success: true
        }
      });
    } catch (error) {
      console.error(error);

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          error: true
        }
      });
    }
  };

  /**
   * Handle transaction steps reset
   */
  const handleTransactionStepsReset = (): void => {
    resetQueries();
    upsertTransactionStep(undefined);
  };

  return (
    <>
      {isOpen && (
        <Modal close={() => closeLoop()}>
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
              projectedHealthRatio={
                parseFloat(amount ?? '0') > 0 ||
                (!!currentPositionLeverageRatio &&
                  Math.round(currentPositionLeverageRatio) !== currentLeverage)
                  ? projectedHealthRatio
                  : undefined
              }
            />
          </div>

          <div className={`separator`} />

          <div className="md:flex justify-between items-center">
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
              isLoading={isFetchingPositionInfo || !collateralsAPR}
              nativeAmount={
                currentPosition
                  ? formatUnits(
                      positionInfo?.equityAmount ?? '0',
                      currentPosition.collateral.underlyingDecimals
                    )
                  : '0'
              }
              symbol={selectedCollateralAsset.underlyingSymbol}
              title={'My Collateral'}
              usdAmount={millify(
                Number(
                  formatUnits(
                    positionInfo?.equityAmount ?? '0',
                    selectedCollateralAsset.underlyingDecimals
                  )
                ) * selectedCollateralAssetUSDPrice
              )}
            />

            <div className="separator lg:hidden" />

            <div className="separator-vertical hidden lg:block" />

            <LoopInfoDisplay
              aprPercentage={`
                  ${Number(formatUnits(borrowApr ?? '0')).toFixed(2)}
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

          {currentPosition && (
            <>
              <div className="md:flex justify-between items-center">
                <LoopInfoDisplay
                  isLoading={isFetchingPositionInfo || !collateralsAPR}
                  nativeAmount={projectedCollateral}
                  symbol={selectedCollateralAsset.underlyingSymbol}
                  title={'Projected Collateral'}
                  usdAmount={millify(projectedCollateralValue)}
                />

                <div className="separator lg:hidden" />

                <div className="separator-vertical hidden lg:block" />

                <LoopInfoDisplay
                  isLoading={isFetchingPositionInfo}
                  nativeAmount={projectedBorrowAmount.toString() ?? '0'}
                  symbol={selectedBorrowAsset?.underlyingSymbol ?? ''}
                  title={'Projected Borrow'}
                  usdAmount={millify(
                    Number(projectedBorrowAmount) * selectedBorrowAssetUSDPrice
                  )}
                />
              </div>

              <div className="separator" />
            </>
          )}

          <div className="lg:flex justify-between items-center">
            <SupplyActions
              amount={amount}
              comptrollerAddress={comptrollerAddress}
              handleClosePosition={handleClosePosition}
              isClosingPosition={!!transactionSteps.length}
              selectedCollateralAsset={selectedCollateralAsset}
              selectedCollateralAssetUSDPrice={selectedCollateralAssetUSDPrice}
              setAmount={setAmount}
            />

            <div className="separator lg:hidden" />

            <div className="separator-vertical hidden lg:block" />

            <BorrowActions
              borrowAmount={(
                (parseFloat(amount ?? '0') / borrowedToCollateralRatio) *
                (currentLeverage - 1)
              ).toFixed(
                parseInt(
                  selectedBorrowAsset?.underlyingDecimals.toString() ?? '18'
                )
              )}
              borrowableAssets={borrowableAssets}
              currentLeverage={currentLeverage}
              currentPositionLeverage={
                currentPositionLeverageRatio
                  ? Math.round(currentPositionLeverageRatio)
                  : undefined
              }
              selectedBorrowAsset={selectedBorrowAsset}
              selectedBorrowAssetUSDPrice={selectedBorrowAssetUSDPrice}
              setCurrentLeverage={setCurrentLeverage}
              setSelectedBorrowAsset={setSelectedBorrowAsset}
            />
          </div>

          <div className="mt-4">
            <ResultHandler
              center
              height="32"
              isLoading={isFetchingPositionInfo}
            >
              <>
                {transactionSteps.length > 0 ? (
                  <div className="flex justify-center">
                    <TransactionStepsHandler
                      resetTransactionSteps={handleTransactionStepsReset}
                      transactionSteps={transactionSteps}
                    />
                  </div>
                ) : (
                  <>
                    {currentPosition ? (
                      <div className="md:flex">
                        <button
                          className={`block w-full btn-green md:mr-6 uppercase`}
                          disabled={parseFloat(amount ?? '0') <= 0}
                          onClick={handlePositionFunding}
                        >
                          Fund position
                        </button>

                        <button
                          className={`block w-full btn-green mt-2 md:mt-0 md:ml-6 uppercase`}
                          disabled={
                            !!currentPositionLeverageRatio &&
                            Math.round(currentPositionLeverageRatio) ===
                              currentLeverage
                          }
                          onClick={handleLeverageAdjustment}
                        >
                          Adjust leverage
                        </button>
                      </div>
                    ) : (
                      <button
                        className={`block w-full btn-green uppercase`}
                        disabled={parseFloat(amount ?? '0') <= 0}
                        onClick={handleOpenPosition}
                      >
                        Loop
                      </button>
                    )}
                  </>
                )}
              </>
            </ResultHandler>
          </div>
        </Modal>
      )}
    </>
  );
}
