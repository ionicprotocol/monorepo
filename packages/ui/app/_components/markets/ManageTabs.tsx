import millify from 'millify';
import { formatUnits } from 'viem';

import { Alert, AlertDescription } from '@ui/components/ui/alert';
import { Button } from '@ui/components/ui/button';
import { Switch } from '@ui/components/ui/switch';
import { type MarketData } from '@ui/types/TokensDataMap';

import Amount from '../popup/Amount';
import MemoizedDonutChart from '../popup/DonutChart';
import SliderComponent from '../popup/Slider';
import TransactionStepsHandler from '../popup/TransactionStepsHandler';
import ResultHandler from '../ResultHandler';

import type { HFPStatus } from '../popup/page';

interface BaseTabProps {
  selectedMarketData: MarketData;
  amount?: string;
  setAmount: (amount?: string) => void;
  currentUtilizationPercentage: number;
  handleUtilization: (percentage: number) => void;
  hfpStatus: HFPStatus;
  isLoadingUpdatedAssets: boolean;
  transactionSteps: any[];
  resetTransactionSteps: () => void;
  chainId: number;
  maxAmount: bigint;
  onAction: () => Promise<void>;
  isLoadingMax: boolean;
  isDisabled: boolean;
  updatedValues: {
    balanceFrom?: string;
    balanceTo?: string;
    aprFrom?: number;
    aprTo?: number;
    collateralApr?: number;
  };
  enableCollateral?: boolean;
  onCollateralToggle?: () => void;
  totalStats?: {
    capAmount: number;
    totalAmount: number;
    capFiat: number;
    totalFiat: number;
  };
  healthFactor?: {
    current: string;
    predicted: string;
  };
}

type SupplyTabProps = BaseTabProps & {
  totalStats?: {
    capAmount: number;
    totalAmount: number;
    capFiat: number;
    totalFiat: number;
  };
  setSwapWidgetOpen: (open: boolean) => void;
};

type WithdrawTabProps = BaseTabProps & {
  healthFactor: {
    current: string;
    predicted: string;
  };
  setSwapWidgetOpen: (open: boolean) => void;
};

type BorrowTabProps = BaseTabProps & {
  borrowLimits: {
    min: string;
    max: string;
  };
  totalStats?: {
    capAmount: number;
    totalAmount: number;
    capFiat: number;
    totalFiat: number;
  };
  healthFactor: {
    current: string;
    predicted: string;
  };
};

type RepayTabProps = BaseTabProps & {
  healthFactor: {
    current: string;
    predicted: string;
  };
};

export const SupplyTab = ({
  isLoadingUpdatedAssets,
  selectedMarketData,
  amount,
  setAmount,
  currentUtilizationPercentage,
  handleUtilization,
  maxAmount,
  isLoadingMax,
  transactionSteps,
  resetTransactionSteps,
  chainId,
  onAction,
  isDisabled,
  updatedValues,
  totalStats,
  setSwapWidgetOpen,
  enableCollateral,
  onCollateralToggle
}: SupplyTabProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Button
          className="w-full text-xs uppercase mr-2"
          onClick={() => setSwapWidgetOpen(true)}
        >
          Get {selectedMarketData.underlyingSymbol}
        </Button>
      </div>

      <Amount
        amount={amount}
        handleInput={setAmount}
        isLoading={isLoadingMax}
        max={formatUnits(maxAmount, selectedMarketData.underlyingDecimals)}
        selectedMarketData={selectedMarketData}
        symbol={selectedMarketData.underlyingSymbol}
      />

      <SliderComponent
        currentUtilizationPercentage={currentUtilizationPercentage}
        handleUtilization={handleUtilization}
      />

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-400">
          <span>COLLATERAL APR</span>
          <span className="font-bold">{updatedValues.collateralApr}%</span>
        </div>

        <div className="flex justify-between text-xs text-gray-400 uppercase">
          <span>Market Supply Balance</span>
          <div className="flex items-center">
            <span>{updatedValues.balanceFrom}</span>
            <span className="mx-1">→</span>
            <ResultHandler isLoading={isLoadingUpdatedAssets}>
              {updatedValues.balanceTo}
            </ResultHandler>
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-400 uppercase">
          <span>Market Supply APR</span>
          <div className="flex items-center">
            <span>{updatedValues.aprFrom}%</span>
            <span className="mx-1">→</span>
            <ResultHandler isLoading={isLoadingUpdatedAssets}>
              {updatedValues.aprTo}%
            </ResultHandler>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400 uppercase">
            Enable Collateral
          </span>
          <Switch
            checked={enableCollateral}
            onCheckedChange={onCollateralToggle}
            disabled={
              transactionSteps.length > 0 || !selectedMarketData.supplyBalance
            }
          />
        </div>
      </div>

      {totalStats && (
        <div className="flex items-center justify-center">
          <div className="w-20 mr-4">
            <MemoizedDonutChart
              max={totalStats.capAmount}
              value={totalStats.totalAmount}
            />
          </div>
          <div>
            <div className="text-gray-400">Total Supplied:</div>
            <div className="text-white">
              <strong>
                {millify(totalStats.totalAmount)} of{' '}
                {millify(totalStats.capAmount)}{' '}
                {selectedMarketData.underlyingSymbol}
              </strong>
            </div>
            <div className="text-sm text-gray-300">
              ${millify(totalStats.totalFiat)} of ${millify(totalStats.capFiat)}
            </div>
          </div>
        </div>
      )}

      {transactionSteps.length > 0 ? (
        <TransactionStepsHandler
          chainId={chainId}
          resetTransactionSteps={resetTransactionSteps}
          transactionSteps={transactionSteps}
        />
      ) : (
        <Button
          className="w-full"
          disabled={isDisabled}
          onClick={onAction}
        >
          Supply {selectedMarketData.underlyingSymbol}
        </Button>
      )}
    </div>
  );
};

export const WithdrawTab = ({
  isLoadingUpdatedAssets,
  selectedMarketData,
  amount,
  setAmount,
  currentUtilizationPercentage,
  handleUtilization,
  hfpStatus,
  maxAmount,
  isLoadingMax,
  transactionSteps,
  resetTransactionSteps,
  chainId,
  onAction,
  isDisabled,
  updatedValues,
  healthFactor
}: WithdrawTabProps) => {
  return (
    <div className="space-y-4">
      <Amount
        amount={amount}
        handleInput={setAmount}
        isLoading={isLoadingMax}
        max={formatUnits(maxAmount, selectedMarketData.underlyingDecimals)}
        selectedMarketData={selectedMarketData}
        symbol={selectedMarketData.underlyingSymbol}
      />

      <SliderComponent
        currentUtilizationPercentage={currentUtilizationPercentage}
        handleUtilization={handleUtilization}
      />

      {hfpStatus === 'WARNING' && (
        <Alert variant="default">
          <AlertDescription>
            You are close to the liquidation threshold. Manage your health
            factor carefully.
          </AlertDescription>
        </Alert>
      )}

      {hfpStatus === 'CRITICAL' && (
        <Alert variant="destructive">
          <AlertDescription>Health factor too low.</AlertDescription>
        </Alert>
      )}

      {hfpStatus === 'UNKNOWN' && (
        <Alert variant="default">
          <AlertDescription>
            Unable to calculate health factor.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-400 uppercase">
          <span>Market Supply Balance</span>
          <div className="flex items-center">
            <span>{updatedValues.balanceFrom}</span>
            <span className="mx-1">→</span>
            <ResultHandler isLoading={isLoadingUpdatedAssets}>
              {updatedValues.balanceTo}
            </ResultHandler>
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-400 uppercase">
          <span>Market Supply APR</span>
          <div className="flex items-center">
            <span>{updatedValues.aprFrom}%</span>
            <span className="mx-1">→</span>
            <ResultHandler isLoading={isLoadingUpdatedAssets}>
              {updatedValues.aprTo}%
            </ResultHandler>
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-400 uppercase">
          <span>Health Factor</span>
          <div className="flex items-center">
            <span>{healthFactor.current}</span>
            <span className="mx-1">→</span>
            <ResultHandler isLoading={isLoadingUpdatedAssets}>
              {healthFactor.predicted}
            </ResultHandler>
          </div>
        </div>
      </div>

      {transactionSteps.length > 0 ? (
        <TransactionStepsHandler
          chainId={chainId}
          resetTransactionSteps={resetTransactionSteps}
          transactionSteps={transactionSteps}
        />
      ) : (
        <Button
          className="w-full"
          disabled={isDisabled}
          onClick={onAction}
        >
          Withdraw {selectedMarketData.underlyingSymbol}
        </Button>
      )}
    </div>
  );
};

export const BorrowTab = ({
  isLoadingUpdatedAssets,
  selectedMarketData,
  amount,
  setAmount,
  currentUtilizationPercentage,
  handleUtilization,
  hfpStatus,
  maxAmount,
  isLoadingMax,
  transactionSteps,
  resetTransactionSteps,
  chainId,
  onAction,
  isDisabled,
  updatedValues,
  borrowLimits,
  totalStats,
  healthFactor
}: BorrowTabProps) => {
  const isUnderMinBorrow =
    amount &&
    borrowLimits.min &&
    parseFloat(amount) < parseFloat(borrowLimits.min);

  return (
    <div className="space-y-4">
      <Amount
        amount={amount}
        handleInput={setAmount}
        isLoading={isLoadingMax}
        max={formatUnits(maxAmount, selectedMarketData.underlyingDecimals)}
        selectedMarketData={selectedMarketData}
        symbol={selectedMarketData.underlyingSymbol}
      />

      <SliderComponent
        currentUtilizationPercentage={currentUtilizationPercentage}
        handleUtilization={handleUtilization}
      />

      {isUnderMinBorrow && (
        <Alert variant="default">
          <AlertDescription>
            Amount must be greater than minimum borrow amount (
            {borrowLimits.min} {selectedMarketData.underlyingSymbol})
          </AlertDescription>
        </Alert>
      )}

      {hfpStatus === 'UNKNOWN' && (
        <Alert variant="default">
          <AlertDescription>
            Unable to calculate health factor.
          </AlertDescription>
        </Alert>
      )}

      {hfpStatus === 'WARNING' && (
        <Alert>
          <AlertDescription>
            You are close to the liquidation threshold. Manage your health
            factor carefully.
          </AlertDescription>
        </Alert>
      )}

      {hfpStatus === 'CRITICAL' && (
        <Alert variant="destructive">
          <AlertDescription>Health factor too low.</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-400">
          <span>MIN BORROW</span>
          <span>{borrowLimits.min}</span>
        </div>

        <div className="flex justify-between text-xs text-gray-400">
          <span>MAX BORROW</span>
          <span>{borrowLimits.max}</span>
        </div>

        <div className="flex justify-between text-xs text-gray-400">
          <span>CURRENTLY BORROWING</span>
          <div className="flex items-center">
            <span>{updatedValues.balanceFrom}</span>
            <span className="mx-1">→</span>
            <ResultHandler isLoading={isLoadingUpdatedAssets}>
              {updatedValues.balanceTo}
            </ResultHandler>
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-400 uppercase">
          <span>Market Borrow APR</span>
          <div className="flex items-center">
            <span>{updatedValues.aprFrom}%</span>
            <span className="mx-1">→</span>
            <ResultHandler isLoading={isLoadingUpdatedAssets}>
              {updatedValues.aprTo}%
            </ResultHandler>
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-400 uppercase">
          <span>Health Factor</span>
          <div className="flex items-center">
            <span>{healthFactor.current}</span>
            <span className="mx-1">→</span>
            <ResultHandler isLoading={isLoadingUpdatedAssets}>
              {healthFactor.predicted}
            </ResultHandler>
          </div>
        </div>
      </div>

      {totalStats && (
        <div className="flex items-center justify-center">
          <div className="w-20 mr-4">
            <MemoizedDonutChart
              max={totalStats.capAmount}
              value={totalStats.totalAmount}
            />
          </div>
          <div>
            <div className="text-gray-400">Total Borrowed:</div>
            <div className="text-white">
              <strong>
                {millify(totalStats.totalAmount)} of{' '}
                {millify(totalStats.capAmount)}{' '}
                {selectedMarketData.underlyingSymbol}
              </strong>
            </div>
            <div className="text-sm text-gray-300">
              ${millify(totalStats.totalFiat)} of ${millify(totalStats.capFiat)}
            </div>
          </div>
        </div>
      )}

      {transactionSteps.length > 0 ? (
        <TransactionStepsHandler
          chainId={chainId}
          resetTransactionSteps={resetTransactionSteps}
          transactionSteps={transactionSteps}
        />
      ) : (
        <Button
          className="w-full"
          disabled={isDisabled || !!isUnderMinBorrow}
          onClick={onAction}
        >
          Borrow {selectedMarketData.underlyingSymbol}
        </Button>
      )}
    </div>
  );
};

export const RepayTab = ({
  isLoadingUpdatedAssets,
  selectedMarketData,
  amount,
  setAmount,
  currentUtilizationPercentage,
  handleUtilization,
  hfpStatus,
  maxAmount,
  isLoadingMax,
  transactionSteps,
  resetTransactionSteps,
  chainId,
  onAction,
  isDisabled,
  updatedValues,
  healthFactor
}: RepayTabProps) => {
  return (
    <div className="space-y-4">
      <Amount
        amount={amount}
        handleInput={setAmount}
        isLoading={isLoadingMax}
        max={formatUnits(maxAmount, selectedMarketData.underlyingDecimals)}
        selectedMarketData={selectedMarketData}
        symbol={selectedMarketData.underlyingSymbol}
      />

      <SliderComponent
        currentUtilizationPercentage={currentUtilizationPercentage}
        handleUtilization={handleUtilization}
      />

      {hfpStatus === 'CRITICAL' && (
        <Alert variant="destructive">
          <AlertDescription>Health factor too low.</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-400">
          <span>CURRENTLY BORROWING</span>
          <div className="flex items-center">
            <span className="text-error">{updatedValues.balanceFrom}</span>
            <span className="mx-1">→</span>
            <ResultHandler isLoading={isLoadingUpdatedAssets}>
              <span className="text-accent">{updatedValues.balanceTo}</span>
            </ResultHandler>
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-400 uppercase">
          <span>Market Borrow APR</span>
          <div className="flex items-center">
            <span>{updatedValues.aprFrom}%</span>
            <span className="mx-1">→</span>
            <ResultHandler isLoading={isLoadingUpdatedAssets}>
              {updatedValues.aprTo}%
            </ResultHandler>
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-400 uppercase">
          <span>Health Factor</span>
          <div className="flex items-center">
            <span>{healthFactor.current}</span>
            <span className="mx-1">→</span>
            <ResultHandler isLoading={isLoadingUpdatedAssets}>
              {healthFactor.predicted}
            </ResultHandler>
          </div>
        </div>
      </div>

      {transactionSteps.length > 0 ? (
        <TransactionStepsHandler
          chainId={chainId}
          resetTransactionSteps={resetTransactionSteps}
          transactionSteps={transactionSteps}
        />
      ) : (
        <Button
          className="w-full"
          disabled={isDisabled}
          onClick={onAction}
        >
          Repay {selectedMarketData.underlyingSymbol}
        </Button>
      )}
    </div>
  );
};
