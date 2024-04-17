'use client';

import { constants } from 'ethers';
import {
  formatEther,
  formatUnits,
  parseEther,
  parseUnits
} from 'ethers/lib/utils';
import millify from 'millify';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useChainId } from 'wagmi';

import Amount from './popup/Amount';
import TransactionStepsHandler, {
  useTransactionSteps
} from './popup/TransactionStepsHandler';
import Range from './Range';
import ResultHandler from './ResultHandler';

import { INFO_MESSAGES } from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useBorrowRates } from '@ui/hooks/levato/useBorrowRates';
import { useLiquidationThreshold } from '@ui/hooks/levato/useLiquidationThreshold';
import { useMaxLeverageAmount } from '@ui/hooks/levato/useMaxLeverageAmount';
import { useUsdPrice } from '@ui/hooks/useAllUsdPrices';
import { useMaxSupplyAmount } from '@ui/hooks/useMaxSupplyAmount';
import type { MarketData, PoolData } from '@ui/types/TokensDataMap';

export type LeverageProps = {
  marketData: PoolData;
};

export default function Leverage({ marketData }: LeverageProps) {
  const chainId = useChainId();
  const { currentSdk, levatoSdk, address } = useMultiIonic();
  const { data: usdPrice } = useUsdPrice(chainId.toString());
  const [selectedFundingAsset, setSelectedFundingAsset] = useState<MarketData>(
    marketData.assets[0]
  );
  const [selectedCollateralAsset, setSelectedCollateralAsset] =
    useState<MarketData>(marketData.assets[1]);
  const [selectedPositionAsset, setSelectedPositionAsset] =
    useState<MarketData>(marketData.assets[2]);
  const [fundingAmount, setFundingAmount] = useState<string>();
  const [currentLeverage, setCurrentLeverage] = useState<number>(1);

  const { debtValue, positionAmount, collateralAmount, positionValue } =
    useMemo(() => {
      const positionToFundingRatio =
        Number(formatEther(selectedPositionAsset.underlyingPrice)) /
        Number(formatEther(selectedFundingAsset.underlyingPrice));
      const collateralToFundingRatio =
        Number(formatEther(selectedCollateralAsset.underlyingPrice)) /
        Number(formatEther(selectedFundingAsset.underlyingPrice));
      const positionAmount = (
        (Number(fundingAmount ?? '0') / positionToFundingRatio) *
        currentLeverage
      ).toFixed(Number(selectedPositionAsset.underlyingDecimals.toString()));
      const collateralAmount = (
        (Number(fundingAmount ?? '0') / collateralToFundingRatio) *
        (currentLeverage - 1)
      ).toFixed(Number(selectedCollateralAsset.underlyingDecimals.toString()));
      const fundingValue = !!usdPrice
        ? Number(fundingAmount ?? '0') *
          usdPrice *
          Number(formatEther(selectedFundingAsset.underlyingPrice))
        : 0;
      const positionValue = fundingValue * currentLeverage;
      const debtValue = positionValue - fundingValue;

      return {
        collateralAmount,
        debtValue,
        positionAmount,
        positionToFundingRatio,
        positionValue
      };
    }, [
      currentLeverage,
      fundingAmount,
      selectedPositionAsset,
      selectedCollateralAsset,
      selectedFundingAsset,
      usdPrice
    ]);
  const {
    data: liquidationThreshold,
    isLoading: isLoadingLiquidationThreshold
  } = useLiquidationThreshold(
    selectedCollateralAsset.underlyingToken,
    parseUnits(
      collateralAmount,
      selectedCollateralAsset.underlyingDecimals
    ).toString(),
    selectedPositionAsset.underlyingToken,
    parseEther(currentLeverage.toString()).toString()
  );
  const { data: maxSupplyAmount, isLoading: isLoadingMaxSupplyAmount } =
    useMaxSupplyAmount(selectedFundingAsset, marketData.comptroller, chainId);
  const { addStepsForAction, transactionSteps, upsertTransactionStep } =
    useTransactionSteps();
  const { data: maxLeverage, isLoading: isLoadingMaxLeverage } =
    useMaxLeverageAmount(
      selectedCollateralAsset.cToken,
      parseUnits(
        collateralAmount,
        selectedCollateralAsset.underlyingDecimals
      ).toString(),
      selectedPositionAsset.cToken
    );
  const { data: borrowRates, isLoading: isLoadingBorrowRates } = useBorrowRates(
    marketData.assets.map((asset) => asset.underlyingToken)
  );

  /**
   * Open a position
   */
  const openPosition = async () => {
    let currentTransactionStep = 0;

    addStepsForAction([
      {
        error: false,
        message: INFO_MESSAGES.OPEN_LEVATO_POSITION.APPROVE,
        success: false
      },
      {
        error: false,
        message: INFO_MESSAGES.OPEN_LEVATO_POSITION.OPENING,
        success: false
      }
    ]);

    try {
      if (!currentSdk || !levatoSdk || !address) {
        return;
      }

      const amountAsBInt = parseUnits(
        fundingAmount ?? '0',
        selectedFundingAsset.underlyingDecimals
      );
      const token = currentSdk.getEIP20TokenInstance(
        selectedFundingAsset.underlyingToken,
        currentSdk.signer
      );
      const factoryContract = levatoSdk.factoryContract;
      const hasApprovedEnough = (
        await token.callStatic.allowance(address, factoryContract.address)
      ).gte(amountAsBInt);

      if (!hasApprovedEnough) {
        const tx = await token.approve(
          factoryContract.address,
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

      const tx = await levatoSdk.openPosition(
        selectedCollateralAsset.underlyingToken,
        selectedPositionAsset.underlyingToken,
        amountAsBInt,
        selectedFundingAsset.underlyingToken,
        currentLeverage.toString()
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

      toast.success(
        `Opened position for ${selectedFundingAsset.underlyingSymbol}/${selectedPositionAsset.underlyingSymbol}`
      );
    } catch (error) {
      console.error(error);

      toast.error(`Error while opening position!`);

      upsertTransactionStep({
        index: currentTransactionStep,
        transactionStep: {
          ...transactionSteps[currentTransactionStep],
          error: true
        }
      });
    }
  };

  return (
    <div>
      <Amount
        amount={positionAmount}
        availableAssets={marketData.assets}
        handleInput={() => {}}
        isLoading={false}
        mainText="Borrow"
        readonly
        selectedMarketData={selectedPositionAsset}
        setSelectedAsset={(asset: MarketData) =>
          setSelectedPositionAsset(asset)
        }
        symbol={selectedPositionAsset.underlyingSymbol}
      />

      <div className="separator" />

      <Amount
        amount={fundingAmount}
        availableAssets={marketData.assets}
        handleInput={(val?: string) => setFundingAmount(val)}
        isLoading={isLoadingMaxSupplyAmount}
        mainText="Funding"
        max={formatUnits(
          maxSupplyAmount?.bigNumber ?? '0',
          selectedFundingAsset.underlyingDecimals
        )}
        selectedMarketData={selectedFundingAsset}
        setSelectedAsset={(asset: MarketData) => setSelectedFundingAsset(asset)}
        symbol={selectedFundingAsset.underlyingSymbol}
      />

      <div className="flex items-center text-center text-white/50 mt-2">
        <div className="mr-6 text-sm">
          LEVERAGE
          <div className="text-lg font-bold">{currentLeverage.toFixed(1)}</div>
        </div>

        <div className="w-full">
          <div className="relative h-[20px] mb-2 text-xs md:text-sm">
            {['1x', '2x', '3x', '4x', '5x', '6x', '7x', '8x', '9x', '10x'].map(
              (label, i) => (
                <span
                  className={`absolute top-0 cursor-pointer translate-x-[-50%] ${
                    currentLeverage === i + 1 && 'text-accent'
                  }`}
                  key={`label-${label}`}
                  onClick={() => setCurrentLeverage(i + 1)}
                  style={{ left: `${(i / 9) * 100}%` }}
                >
                  {label}
                </span>
              )
            )}
          </div>

          <Range
            currentValue={currentLeverage}
            max={Number(maxLeverage ? formatEther(maxLeverage) : '50')}
            min={1}
            setCurrentValue={(val: number) => setCurrentLeverage(val)}
            step={1}
          />

          <div className="flex justify-between pt-2 text-white/50 text-xs">
            <span>{'<'} Repay</span>

            <span>Borrow {'>'}</span>
          </div>
        </div>
      </div>

      <div className="separator" />

      <div
        className={`flex w-full items-center justify-between mb-1 hint-text-uppercase`}
      >
        <span className={``}>POSITION VALUE</span>
        <span className={`font-bold pl-2 text-white`}>
          ${millify(positionValue)}
        </span>
      </div>

      <div
        className={`flex w-full items-center justify-between mb-1 hint-text-uppercase`}
      >
        <span className={``}>BORROW RATE</span>
        <span className={`font-bold pl-2 text-white`}>
          <ResultHandler
            height="16"
            isLoading={isLoadingBorrowRates}
            width="16"
          >
            {borrowRates?.get(selectedPositionAsset.underlyingToken)}
          </ResultHandler>
        </span>
      </div>

      <div
        className={`flex w-full items-center justify-between mb-1 hint-text-uppercase`}
      >
        <span className={``}>Debt value</span>
        <span className={`font-bold pl-2 text-white`}>
          ${millify(debtValue)}
        </span>
      </div>

      <div
        className={`flex w-full items-center justify-between mb-1 hint-text-uppercase`}
      >
        <span className={``}>Liquidation threshold</span>
        <span className={`font-bold pl-2 text-white`}>
          <ResultHandler
            height="16"
            isLoading={isLoadingLiquidationThreshold}
            width="16"
          >
            $
            {millify(
              Number(formatEther(liquidationThreshold ?? '0')) * (usdPrice ?? 0)
            )}
          </ResultHandler>
        </span>
      </div>

      <div className="separator" />

      <div className="text-center">
        {transactionSteps.length > 0 ? (
          <div className="flex justify-center">
            <TransactionStepsHandler
              resetTransactionSteps={() => upsertTransactionStep(undefined)}
              transactionSteps={transactionSteps}
            />
          </div>
        ) : (
          <button
            className="btn-green"
            onClick={openPosition}
          >
            OPEN POSITION
          </button>
        )}
      </div>
    </div>
  );
}
