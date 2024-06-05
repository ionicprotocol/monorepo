'use client';

import { useQueryClient } from '@tanstack/react-query';
import { constants } from 'ethers';
import {
  formatEther,
  formatUnits,
  parseEther,
  parseUnits
} from 'ethers/lib/utils';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useBalance, useChainId } from 'wagmi';

import AssetsList from './AssetsList';
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
import type { MarketData, PoolData } from '@ui/types/TokensDataMap';

enum LeverageMode {
  LONG,
  SHORT
}

export type LeverageProps = {
  marketData: PoolData;
};

const ENABLED_LEVERAGE_SYMBOLS = ['USDT', 'USDC', 'WBTC', 'WETH'];
const ENABLED_SECONDARY_SYMBOLS = ['USDC', 'USDT'];

export default function Leverage({ marketData }: LeverageProps) {
  const availableAssets = useMemo(
    () =>
      marketData.assets.filter(
        (asset) => ENABLED_LEVERAGE_SYMBOLS.indexOf(asset.underlyingSymbol) > -1
      ),
    [marketData]
  );
  const secondaryAssets = useMemo(
    () =>
      marketData.assets.filter(
        (asset) =>
          ENABLED_SECONDARY_SYMBOLS.indexOf(asset.underlyingSymbol) > -1
      ),
    [marketData]
  );
  const chainId = useChainId();
  const { currentSdk, levatoSdk, address } = useMultiIonic();
  const { data: usdPrice } = useUsdPrice(chainId.toString());
  const [selectedFundingAsset, setSelectedFundingAsset] = useState<MarketData>(
    availableAssets[0]
  );
  const [selectedPrimaryAsset, setSelectedPrimaryAsset] = useState<MarketData>(
    availableAssets[1]
  );
  const [selectedSecondaryAsset, setSelectedSecondaryAsset] =
    useState<MarketData>(secondaryAssets[0]);
  const [fundingAmount, setFundingAmount] = useState<string>();
  const [currentLeverage, setCurrentLeverage] = useState<number>(1);
  const [leverageMode, setLeverageMode] = useState<LeverageMode>(
    LeverageMode.LONG
  );
  const [secondarySelectOpen, setSecondarySelectOpen] =
    useState<boolean>(false);

  const { secondaryAmount, debtValue, primaryAmount, positionValue } =
    useMemo(() => {
      const secondaryToFundingRatio =
        Number(formatEther(selectedSecondaryAsset.underlyingPrice)) /
        Number(formatEther(selectedFundingAsset.underlyingPrice));
      const primaryToFundingRatio =
        Number(formatEther(selectedPrimaryAsset.underlyingPrice)) /
        Number(formatEther(selectedFundingAsset.underlyingPrice));
      const secondaryAmount = (
        (Number(fundingAmount ?? '0') / secondaryToFundingRatio) *
        currentLeverage
      ).toFixed(Number(selectedSecondaryAsset.underlyingDecimals.toString()));
      const primaryAmount = (
        (Number(fundingAmount ?? '0') / primaryToFundingRatio) *
        currentLeverage
      ).toFixed(Number(selectedPrimaryAsset.underlyingDecimals.toString()));
      const fundingValue = !!usdPrice
        ? Number(fundingAmount ?? '0') *
          usdPrice *
          Number(formatEther(selectedFundingAsset.underlyingPrice))
        : 0;
      const positionValue = fundingValue * currentLeverage;
      const debtValue = positionValue - fundingValue;

      return {
        debtValue,
        positionValue,
        primaryAmount,
        secondaryAmount,
        secondaryToFundingRatio
      };
    }, [
      currentLeverage,
      fundingAmount,
      selectedSecondaryAsset,
      selectedPrimaryAsset,
      selectedFundingAsset,
      usdPrice
    ]);
  const {
    data: liquidationThreshold,
    isLoading: isLoadingLiquidationThreshold
  } = useLiquidationThreshold(
    leverageMode === LeverageMode.LONG
      ? selectedPrimaryAsset.underlyingToken
      : selectedSecondaryAsset.underlyingToken,
    leverageMode === LeverageMode.LONG
      ? parseUnits(
          primaryAmount,
          selectedPrimaryAsset.underlyingDecimals
        ).toString()
      : parseUnits(
          secondaryAmount,
          selectedSecondaryAsset.underlyingDecimals
        ).toString(),
    leverageMode === LeverageMode.LONG
      ? selectedSecondaryAsset.underlyingToken
      : selectedPrimaryAsset.underlyingToken,
    parseEther(currentLeverage.toString()).toString()
  );

  const { healthRatio } = useMemo(() => {
    const healthRatio = !!liquidationThreshold
      ? positionValue / liquidationThreshold
      : 0.0;

    return { healthRatio };
  }, [liquidationThreshold, positionValue]);
  const {
    data: maxSupplyAmount,
    isLoading: isLoadingMaxSupplyAmount,
    refetch: refetchBalance
  } = useBalance({
    address,
    token: selectedFundingAsset.underlyingToken as `0x${string}`
  });
  const { addStepsForAction, transactionSteps, upsertTransactionStep } =
    useTransactionSteps();
  const { data: maxLeverage } = useMaxLeverageAmount(
    selectedPrimaryAsset.cToken,
    parseUnits(
      primaryAmount,
      selectedPrimaryAsset.underlyingDecimals
    ).toString(),
    selectedSecondaryAsset.cToken
  );
  const { data: borrowRates, isLoading: isLoadingBorrowRates } = useBorrowRates(
    availableAssets.map((asset) => asset.underlyingToken)
  );
  const currentPrimaryAssetPriceInUSD = useMemo(
    () =>
      Number(formatEther(selectedPrimaryAsset.underlyingPrice)) *
      (usdPrice ?? 0),
    [selectedPrimaryAsset, usdPrice]
  );
  const currentLiquidationPriceInUSD = useMemo<string>(() => {
    if (!healthRatio || healthRatio === Infinity || healthRatio === 0) {
      return 'N/A';
    }

    return leverageMode === LeverageMode.LONG
      ? `$${(currentPrimaryAssetPriceInUSD / healthRatio).toLocaleString(
          'en-US',
          {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
          }
        )}`
      : `$${(currentPrimaryAssetPriceInUSD * healthRatio).toLocaleString(
          'en-US',
          {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
          }
        )}`;
  }, [currentPrimaryAssetPriceInUSD, healthRatio, leverageMode]);
  const queryClient = useQueryClient();

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
        leverageMode === LeverageMode.LONG
          ? selectedPrimaryAsset.underlyingToken
          : selectedSecondaryAsset.underlyingToken,
        leverageMode === LeverageMode.LONG
          ? selectedSecondaryAsset.underlyingToken
          : selectedPrimaryAsset.underlyingToken,
        amountAsBInt,
        selectedFundingAsset.underlyingToken,
        parseUnits(currentLeverage.toString()).toString(),
        leverageMode === LeverageMode.SHORT
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
        `Opened position for ${selectedFundingAsset.underlyingSymbol}/${selectedSecondaryAsset.underlyingSymbol}`
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
      <div className="mb-2 flex justify-center rounded-2xl text-center p-1 bg-grayone">
        <div
          className={`rounded-xl transition-all cursor-pointer py-2 px-4 ${
            leverageMode === LeverageMode.LONG
              ? 'bg-darkone text-accent font-bold'
              : 'text-white/40'
          }`}
          onClick={() => setLeverageMode(LeverageMode.LONG)}
        >
          LONG
        </div>

        <div
          className={`rounded-xl transition-all cursor-pointer py-2 px-4 ${
            leverageMode === LeverageMode.SHORT
              ? 'bg-darkone text-error font-bold'
              : 'text-white/40'
          }`}
          onClick={() => setLeverageMode(LeverageMode.SHORT)}
        >
          SHORT
        </div>
      </div>

      <Amount
        amount={primaryAmount}
        availableAssets={availableAssets}
        handleInput={() => {}}
        isLoading={false}
        mainText={leverageMode === LeverageMode.LONG ? 'Long' : 'Short'}
        readonly
        selectedMarketData={selectedPrimaryAsset}
        setSelectedAsset={(asset: MarketData) => setSelectedPrimaryAsset(asset)}
        symbol={selectedPrimaryAsset.underlyingSymbol}
      />

      <div className="separator" />

      <Amount
        amount={fundingAmount}
        availableAssets={availableAssets}
        handleInput={(val?: string) => setFundingAmount(val)}
        isLoading={isLoadingMaxSupplyAmount}
        mainText="Funding"
        max={formatUnits(
          maxSupplyAmount?.value ?? '0',
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
            {[1, 5, 10, 20, 30, 40, 50].map((label) => (
              <span
                className={`absolute top-0 cursor-pointer translate-x-[-50%] ${
                  currentLeverage === label && 'text-accent'
                }`}
                key={`label-${label}`}
                onClick={() => setCurrentLeverage(label)}
                style={{
                  left: `${
                    (label /
                      (maxLeverage ? Number(formatEther(maxLeverage)) : 50)) *
                    100
                  }%`
                }}
              >
                {label}x
              </span>
            ))}
          </div>

          <Range
            currentValue={currentLeverage}
            max={Number(maxLeverage ? formatEther(maxLeverage) : '50')}
            min={1}
            setCurrentValue={(val: number) => setCurrentLeverage(val)}
            step={1}
          />
        </div>
      </div>

      <div className="separator" />

      <div
        className={`flex w-full items-center justify-between mb-1 hint-text-uppercase`}
      >
        <span className={``}>
          {leverageMode === LeverageMode.LONG ? 'Borrowed' : 'Collateral'} asset
        </span>
        <div className={`relative font-bold pl-2 text-white `}>
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setSecondarySelectOpen(!secondarySelectOpen)}
          >
            <Image
              alt="link"
              className="mr-1"
              height="20"
              src={`/img/symbols/32/color/${selectedSecondaryAsset.underlyingSymbol.toLowerCase()}.png`}
              width="20"
            />

            {selectedSecondaryAsset.underlyingSymbol}

            <Image
              alt="link"
              height="24"
              src={`/images/chevron-down.png`}
              width="24"
            />
          </div>

          <AssetsList
            availableAssets={secondaryAssets}
            isOpen={secondarySelectOpen}
            onChange={(asset) => {
              setSelectedSecondaryAsset(asset);
              setSecondarySelectOpen(false);
            }}
          />
        </div>
      </div>

      <div className="separator" />

      <div
        className={`flex w-full items-center justify-between mb-1 hint-text-uppercase`}
      >
        <span className={``}>POSITION VALUE</span>
        <span className={`font-bold pl-2 text-white`}>
          $
          {positionValue.toLocaleString('en-US', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
          })}
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
            {borrowRates?.get(
              leverageMode === LeverageMode.LONG
                ? selectedPrimaryAsset.underlyingToken
                : selectedSecondaryAsset.underlyingToken
            )}
          </ResultHandler>
        </span>
      </div>

      <div
        className={`flex w-full items-center justify-between mb-1 hint-text-uppercase`}
      >
        <span className={``}>Debt value</span>
        <span className={`font-bold pl-2 text-white`}>
          $
          {debtValue.toLocaleString('en-US', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
          })}
        </span>
      </div>

      <div
        className={`flex w-full items-center justify-between mb-1 hint-text-uppercase`}
      >
        <span className={``}>Entry price</span>
        <span className={`font-bold pl-2 text-white`}>
          <ResultHandler
            height="16"
            isLoading={isLoadingLiquidationThreshold}
            width="16"
          >
            $
            {currentPrimaryAssetPriceInUSD.toLocaleString('en-US', {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2
            })}
          </ResultHandler>
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
            {currentLiquidationPriceInUSD}
          </ResultHandler>
        </span>
      </div>

      <div
        className={`flex w-full items-center justify-between mb-1 hint-text-uppercase`}
      >
        <span className={``}>Health ratio</span>
        <span className={`font-bold pl-2 text-white`}>
          <ResultHandler
            height="16"
            isLoading={isLoadingLiquidationThreshold}
            width="16"
          >
            {healthRatio.toFixed(3)}
          </ResultHandler>
        </span>
      </div>

      <div className="separator" />

      <div className="text-center">
        {transactionSteps.length > 0 ? (
          <div className="flex justify-center">
            <TransactionStepsHandler
              chainId={chainId}
              resetTransactionSteps={() => {
                queryClient.invalidateQueries(['positions']);
                refetchBalance();
                upsertTransactionStep(undefined);
              }}
              transactionSteps={transactionSteps}
            />
          </div>
        ) : (
          <>
            <button
              className="btn-green"
              disabled={
                !fundingAmount ||
                (!!fundingAmount && Number(fundingAmount) === 0) ||
                healthRatio < 1.1
              }
              onClick={openPosition}
            >
              OPEN POSITION
            </button>

            {healthRatio < 1.1 && healthRatio !== 0 && (
              <p className="mt-2 text-xs text-error">Health ratio too low</p>
            )}

            <p className="mt-4 text-xs">
              Powered by{' '}
              <a
                href="https://app.levato.xyz/"
                target="_blank"
              >
                <Image
                  alt="Levato logo"
                  className="m-auto"
                  height="30"
                  src="/img/levato-logo.png"
                  width="90"
                />
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
