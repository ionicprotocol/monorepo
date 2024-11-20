import toast from 'react-hot-toast';
import { formatUnits } from 'viem';

import { Alert, AlertDescription } from '@ui/components/ui/alert';
import { Button } from '@ui/components/ui/button';
import { INFO_MESSAGES } from '@ui/constants';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useManageDialogContext } from '@ui/context/ManageDialogContext';

import Amount from './Amount';
import SliderComponent from './Slider';
import TransactionStepsHandler, {
  useTransactionSteps
} from './TransactionStepsHandler';
import ResultHandler from '../ResultHandler';

interface WithdrawTabProps {
  isLoadingUpdatedAssets: boolean;
  maxAmount: bigint;
  isLoadingMax: boolean;
  isDisabled: boolean;
  updatedValues: {
    balanceFrom?: string;
    balanceTo?: string;
    aprFrom?: number;
    aprTo?: number;
  };
}

const WithdrawTab = ({
  isLoadingUpdatedAssets,
  maxAmount,
  isLoadingMax,
  isDisabled,
  updatedValues
}: WithdrawTabProps) => {
  const {
    selectedMarketData,
    amount,
    setAmount,
    currentUtilizationPercentage,
    handleUtilization,
    hfpStatus,
    transactionSteps,
    resetTransactionSteps,
    chainId,
    normalizedHealthFactor,
    normalizedPredictedHealthFactor,
    amountAsBInt
  } = useManageDialogContext();

  const healthFactor = {
    current: normalizedHealthFactor ?? '0',
    predicted: normalizedPredictedHealthFactor ?? '0'
  };
  const { currentSdk, address } = useMultiIonic();

  const { addStepsForAction, upsertTransactionStep } = useTransactionSteps();

  const withdrawAmount = async () => {
    if (
      !transactionSteps.length &&
      currentSdk &&
      address &&
      amount &&
      amountAsBInt > 0n &&
      maxAmount
    ) {
      const currentTransactionStep = 0;
      addStepsForAction([
        {
          error: false,
          message: INFO_MESSAGES.WITHDRAW.WITHDRAWING,
          success: false
        }
      ]);

      try {
        const amountToWithdraw = amountAsBInt;

        console.warn(
          'Withdraw params:',
          selectedMarketData.cToken,
          amountToWithdraw.toString()
        );
        let isMax = false;
        if (amountToWithdraw === maxAmount) {
          isMax = true;
        }

        const { tx, errorCode } = await currentSdk.withdraw(
          selectedMarketData.cToken,
          amountToWithdraw,
          isMax
        );

        if (errorCode) {
          console.error(errorCode);

          throw new Error('Error during withdrawing!');
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
          `Withdrawn ${amount} ${selectedMarketData.underlyingSymbol}`
        );
      } catch (error) {
        console.error(error);

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            error: true
          }
        });

        toast.error('Error while withdrawing!');
      }
    }
  };

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
          onClick={withdrawAmount}
        >
          Withdraw {selectedMarketData.underlyingSymbol}
        </Button>
      )}
    </div>
  );
};

export default WithdrawTab;
