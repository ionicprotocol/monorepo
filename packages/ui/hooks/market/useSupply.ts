import { useState } from 'react';

import { toast } from 'react-hot-toast';

import { useTransactionSteps } from '@ui/app/_components/dialogs/manage/TransactionStepsHandler';
import { INFO_MESSAGES } from '@ui/constants';
import { useManageDialogContext } from '@ui/context/ManageDialogContext';
import { useMultiIonic } from '@ui/context/MultiIonicContext';

import { useBalancePolling } from '../useBalancePolling';
import { useMaxSupplyAmount } from '../useMaxSupplyAmount';

import type { Address } from 'viem';

interface UseSupplyProps {
  maxAmount: bigint;
  enableCollateral: boolean;
}

export const useSupply = ({ maxAmount, enableCollateral }: UseSupplyProps) => {
  const [txHash, setTxHash] = useState<Address>();
  const [isWaitingForIndexing, setIsWaitingForIndexing] = useState(false);

  const { addStepsForAction, transactionSteps, upsertTransactionStep } =
    useTransactionSteps();
  const { currentSdk, address } = useMultiIonic();

  const {
    selectedMarketData,
    amount,
    amountAsBInt,
    comptrollerAddress,
    chainId
  } = useManageDialogContext();

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

        if (tx) {
          await currentSdk.publicClient.waitForTransactionReceipt({ hash: tx });
          setTxHash(tx);
          setIsWaitingForIndexing(true);

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
        }
      } catch (error) {
        console.error(error);
        setIsWaitingForIndexing(false);
        setTxHash(undefined);

        upsertTransactionStep({
          index: currentTransactionStep,
          transactionStep: {
            ...transactionSteps[currentTransactionStep],
            error: true
          }
        });

        toast.error('Error while supplying!');
      }
    }
  };

  const { refetch: refetchMaxSupply } = useMaxSupplyAmount(
    selectedMarketData,
    comptrollerAddress,
    chainId
  );

  const { isPolling } = useBalancePolling({
    address,
    chainId,
    txHash,
    enabled: isWaitingForIndexing,
    onSuccess: () => {
      setIsWaitingForIndexing(false);
      setTxHash(undefined);
      refetchMaxSupply();
      toast.success(
        `Supplied ${amount} ${selectedMarketData.underlyingSymbol}`
      );
    }
  });

  return {
    isWaitingForIndexing,
    supplyAmount,
    transactionSteps,
    isPolling
  };
};
