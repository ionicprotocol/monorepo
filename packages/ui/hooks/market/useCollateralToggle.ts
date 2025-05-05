import { useState } from 'react';

import { toast } from 'react-hot-toast';

import { useTransactionSteps } from '@ui/components/dialogs/ManageMarket/TransactionStepsHandler';
import { INFO_MESSAGES } from '@ui/constants';
import {
  TransactionType,
  useManageDialogContext
} from '@ui/context/ManageDialogContext';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import type { MarketData } from '@ui/types/TokensDataMap';
import { errorCodeToMessage } from '@ui/utils/errorCodeToMessage';

import type { Address } from 'viem';

interface UseCollateralToggleProps {
  selectedMarketData: MarketData;
  comptrollerAddress: Address;
  onSuccess: () => Promise<void>;
}

export const useCollateralToggle = ({
  selectedMarketData,
  comptrollerAddress,
  onSuccess
}: UseCollateralToggleProps) => {
  const [enableCollateral, setEnableCollateral] = useState<boolean>(
    selectedMarketData.membership && selectedMarketData.supplyBalance > 0n
  );

  const { currentSdk } = useMultiIonic();
  const { addStepsForType, upsertStepForType } = useManageDialogContext();
  const { transactionSteps } = useTransactionSteps();

  const handleCollateralToggle = async () => {
    if (!transactionSteps.length) {
      if (currentSdk && selectedMarketData.supplyBalance > 0n) {
        const currentTransactionStep = 0;

        try {
          let tx;

          if (enableCollateral) {
            const comptrollerContract = currentSdk.createComptroller(
              comptrollerAddress,
              currentSdk.publicClient
            );

            const exitCode = (
              await comptrollerContract.simulate.exitMarket(
                [selectedMarketData.cToken],
                { account: currentSdk.walletClient!.account!.address }
              )
            ).result;

            if (exitCode !== 0n) {
              toast.error(errorCodeToMessage(Number(exitCode)));
              return;
            }

            addStepsForType(TransactionType.COLLATERAL, [
              {
                error: false,
                message: INFO_MESSAGES.COLLATERAL.DISABLE,
                success: false
              }
            ]);

            tx = await comptrollerContract.write.exitMarket(
              [selectedMarketData.cToken],
              {
                account: currentSdk.walletClient!.account!.address,
                chain: currentSdk.publicClient.chain
              }
            );

            upsertStepForType(TransactionType.COLLATERAL, {
              index: currentTransactionStep,
              transactionStep: {
                error: false,
                message: INFO_MESSAGES.COLLATERAL.DISABLE,
                txHash: tx,
                success: false
              }
            });

            await currentSdk.publicClient.waitForTransactionReceipt({
              hash: tx
            });

            setEnableCollateral(false);

            upsertStepForType(TransactionType.COLLATERAL, {
              index: currentTransactionStep,
              transactionStep: {
                error: false,
                message: INFO_MESSAGES.COLLATERAL.DISABLE,
                txHash: tx,
                success: true
              }
            });
          } else {
            addStepsForType(TransactionType.COLLATERAL, [
              {
                error: false,
                message: INFO_MESSAGES.COLLATERAL.ENABLE,
                success: false
              }
            ]);

            tx = await currentSdk.enterMarkets(
              selectedMarketData.cToken,
              comptrollerAddress
            );

            upsertStepForType(TransactionType.COLLATERAL, {
              index: currentTransactionStep,
              transactionStep: {
                error: false,
                message: INFO_MESSAGES.COLLATERAL.ENABLE,
                txHash: tx,
                success: false
              }
            });

            await currentSdk.publicClient.waitForTransactionReceipt({
              hash: tx
            });

            setEnableCollateral(true);

            upsertStepForType(TransactionType.COLLATERAL, {
              index: currentTransactionStep,
              transactionStep: {
                error: false,
                message: INFO_MESSAGES.COLLATERAL.ENABLE,
                txHash: tx,
                success: true
              }
            });
          }

          await onSuccess();
          return;
        } catch (error) {
          console.error(error);

          upsertStepForType(TransactionType.COLLATERAL, {
            index: currentTransactionStep,
            transactionStep: {
              error: true,
              message: enableCollateral
                ? INFO_MESSAGES.COLLATERAL.DISABLE
                : INFO_MESSAGES.COLLATERAL.ENABLE,
              success: false
            }
          });

          toast.error(
            `Error while ${
              enableCollateral ? 'disabling' : 'enabling'
            } collateral!`
          );
        }
      }

      setEnableCollateral(!enableCollateral);
    }
  };

  return {
    enableCollateral,
    handleCollateralToggle,
    transactionSteps
  };
};
