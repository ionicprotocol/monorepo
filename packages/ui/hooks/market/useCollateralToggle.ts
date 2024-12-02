import { useState } from 'react';

import { toast } from 'react-hot-toast';

import { useTransactionSteps } from '@ui/app/_components/dialogs/manage/TransactionStepsHandler';
import { INFO_MESSAGES } from '@ui/constants';
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
  const { addStepsForAction, transactionSteps, upsertTransactionStep } =
    useTransactionSteps();

  const handleCollateralToggle = async () => {
    if (!transactionSteps.length) {
      if (currentSdk && selectedMarketData.supplyBalance > 0n) {
        const currentTransactionStep = 0;

        try {
          let tx;

          switch (enableCollateral) {
            case true: {
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

              addStepsForAction([
                {
                  error: false,
                  message: INFO_MESSAGES.COLLATERAL.DISABLE,
                  success: false
                }
              ]);

              upsertTransactionStep({
                index: currentTransactionStep,
                transactionStep: {
                  error: false,
                  message: INFO_MESSAGES.COLLATERAL.DISABLE,
                  success: false
                }
              });

              tx = await comptrollerContract.write.exitMarket(
                [selectedMarketData.cToken],
                {
                  account: currentSdk.walletClient!.account!.address,
                  chain: currentSdk.publicClient.chain
                }
              );

              upsertTransactionStep({
                index: currentTransactionStep,
                transactionStep: {
                  ...transactionSteps[currentTransactionStep],
                  txHash: tx
                }
              });

              await currentSdk.publicClient.waitForTransactionReceipt({
                hash: tx
              });

              setEnableCollateral(false);

              upsertTransactionStep({
                index: currentTransactionStep,
                transactionStep: {
                  ...transactionSteps[currentTransactionStep],
                  success: true
                }
              });

              break;
            }

            case false: {
              addStepsForAction([
                {
                  error: false,
                  message: INFO_MESSAGES.COLLATERAL.ENABLE,
                  success: false
                }
              ]);

              upsertTransactionStep({
                index: currentTransactionStep,
                transactionStep: {
                  error: false,
                  message: INFO_MESSAGES.COLLATERAL.ENABLE,
                  success: false
                }
              });

              tx = await currentSdk.enterMarkets(
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

              await currentSdk.publicClient.waitForTransactionReceipt({
                hash: tx
              });

              setEnableCollateral(true);

              upsertTransactionStep({
                index: currentTransactionStep,
                transactionStep: {
                  ...transactionSteps[currentTransactionStep],
                  success: true
                }
              });

              break;
            }
          }

          await onSuccess();
          return;
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
