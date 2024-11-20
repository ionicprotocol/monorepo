import millify from 'millify';
import toast from 'react-hot-toast';
import { formatUnits } from 'viem';

import { Button } from '@ui/components/ui/button';
import { Switch } from '@ui/components/ui/switch';
import { INFO_MESSAGES } from '@ui/constants';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useManageDialogContext } from '@ui/context/ManageDialogContext';

import Amount from './Amount';
import MemoizedDonutChart from './DonutChart';
import SliderComponent from './Slider';
import TransactionStepsHandler, {
  useTransactionSteps
} from './TransactionStepsHandler';
import ResultHandler from '../ResultHandler';

interface SupplyTabProps {
  isLoadingUpdatedAssets: boolean;
  maxAmount: bigint;
  isLoadingMax: boolean;
  isDisabled: boolean;
  updatedValues: {
    balanceFrom?: string;
    balanceTo?: string;
    aprFrom?: number;
    aprTo?: number;
    collateralApr?: number;
  };
  totalStats?: {
    capAmount: number;
    totalAmount: number;
    capFiat: number;
    totalFiat: number;
  };
  setSwapWidgetOpen: (open: boolean) => void;
}

const SupplyTab = ({
  isLoadingUpdatedAssets,
  maxAmount,
  isLoadingMax,
  isDisabled,
  updatedValues,
  totalStats,
  setSwapWidgetOpen
}: SupplyTabProps) => {
  const {
    selectedMarketData,
    amount,
    setAmount,
    currentUtilizationPercentage,
    handleUtilization,
    enableCollateral,
    transactionSteps,
    resetTransactionSteps,
    chainId,
    amountAsBInt,
    comptrollerAddress,
    handleCollateralToggle
  } = useManageDialogContext();

  const { currentSdk, address } = useMultiIonic();
  const { addStepsForAction, upsertTransactionStep } = useTransactionSteps();

  const supplyAmount = async () => {
    if (
      !transactionSteps.length &&
      currentSdk &&
      address &&
      amount &&
      amountAsBInt > 0n &&
      amountAsBInt <= maxAmount
    ) {
      let currentTransactionStep = 0;
      addStepsForAction([
        {
          error: false,
          message: INFO_MESSAGES.SUPPLY.APPROVE,
          success: false
        },
        ...(enableCollateral && !selectedMarketData.membership
          ? [
              {
                error: false,
                message: INFO_MESSAGES.SUPPLY.COLLATERAL,
                success: false
              }
            ]
          : []),
        {
          error: false,
          message: INFO_MESSAGES.SUPPLY.SUPPLYING,
          success: false
        }
      ]);

      try {
        const token = currentSdk.getEIP20TokenInstance(
          selectedMarketData.underlyingToken,
          currentSdk.publicClient as any
        );
        const hasApprovedEnough =
          (await token.read.allowance([address, selectedMarketData.cToken])) >=
          amountAsBInt;

        if (!hasApprovedEnough) {
          const tx = await currentSdk.approve(
            selectedMarketData.cToken,
            selectedMarketData.underlyingToken,
            (amountAsBInt * 105n) / 100n
          );

          upsertTransactionStep({
            index: currentTransactionStep,
            transactionStep: {
              ...transactionSteps[currentTransactionStep],
              txHash: tx
            }
          });

          await currentSdk.publicClient.waitForTransactionReceipt({
            hash: tx,
            confirmations: 2
          });

          // wait for 5 seconds to resolve timing issue
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            success: true
          }
        });

        currentTransactionStep++;

        if (enableCollateral && !selectedMarketData.membership) {
          const tx = await currentSdk.enterMarkets(
            selectedMarketData.cToken,
            comptrollerAddress
          );

          upsertTransactionStep({
            index: currentTransactionStep,
            transactionStep: {
              ...transactionSteps[currentTransactionStep],
              txHash: tx
            }
          });

          await currentSdk.publicClient.waitForTransactionReceipt({ hash: tx });

          upsertTransactionStep({
            index: currentTransactionStep,
            transactionStep: {
              ...transactionSteps[currentTransactionStep],
              success: true
            }
          });

          currentTransactionStep++;
        }

        const { tx, errorCode } = await currentSdk.mint(
          selectedMarketData.cToken,
          amountAsBInt
        );

        if (errorCode) {
          console.error(errorCode);

          throw new Error('Error during supplying!');
        }

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            txHash: tx
          }
        });

        tx &&
          (await currentSdk.publicClient.waitForTransactionReceipt({
            hash: tx
          }));

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            success: true
          }
        });

        toast.success(
          `Supplied ${amount} ${selectedMarketData.underlyingSymbol}`
        );
      } catch (error) {
        toast.error('Error while supplying!');

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            error: true
          }
        });
      }
    }
  };

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
            onCheckedChange={handleCollateralToggle}
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
          onClick={supplyAmount}
        >
          Supply {selectedMarketData.underlyingSymbol}
        </Button>
      )}
    </div>
  );
};

export default SupplyTab;
