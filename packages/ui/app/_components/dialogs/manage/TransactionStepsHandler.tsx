'use client';

import type { Dispatch } from 'react';
import { useReducer } from 'react';

import { ThreeCircles } from 'react-loader-spinner';

import { getScanUrlByChainId } from '@ui/utils/networkData';
import { ArrowRight } from 'lucide-react';
import { Button } from '@ui/components/ui/button';

export type TransactionStep = {
  error: boolean;
  message: string;
  success: boolean;
  txHash?: string;
};
export type TransactionStepsHandlerProps = {
  chainId: number;
  resetTransactionSteps: () => void;
  transactionSteps: TransactionStep[];
};
export type UseTransactionSteps = {
  addStepsForAction: (steps: TransactionStep[]) => void;
  transactionSteps: TransactionStep[];
  upsertTransactionStep: Dispatch<
    | {
        index: number;
        transactionStep: TransactionStep;
      }
    | undefined
  >;
};

export const useTransactionSteps = (): UseTransactionSteps => {
  const [transactionSteps, upsertTransactionStep] = useReducer(
    (
      prevState: TransactionStep[],
      updatedStep:
        | { index: number; transactionStep: TransactionStep }
        | undefined
    ): TransactionStep[] => {
      if (!updatedStep) {
        return [];
      }

      const currentSteps = prevState.slice();

      currentSteps[updatedStep.index] = {
        ...currentSteps[updatedStep.index],
        ...updatedStep.transactionStep
      };

      if (
        updatedStep.transactionStep.error &&
        updatedStep.index + 1 < currentSteps.length
      ) {
        for (let i = updatedStep.index + 1; i < currentSteps.length; i++) {
          currentSteps[i] = {
            ...currentSteps[i],
            error: true
          };
        }
      }

      return currentSteps;
    },
    []
  );

  const addStepsForAction = (steps: TransactionStep[]) => {
    steps.forEach((step, i) =>
      upsertTransactionStep({ index: i, transactionStep: step })
    );
  };

  return {
    addStepsForAction,
    transactionSteps,
    upsertTransactionStep
  };
};

function TransactionStepsHandler({
  transactionSteps,
  resetTransactionSteps,
  chainId
}: TransactionStepsHandlerProps) {
  return (
    <div className="w-full">
      {transactionSteps.map((transactionStep, i) => (
        <div
          key={`transaction-step-${i}`}
          className="flex flex-col items-center mt-2 justify-center"
        >
          <div
            className={`flex align-center mt-2 ${
              !transactionStep.error && !transactionStep.success && 'text-white'
            } ${transactionStep.success && 'text-accent'} ${
              transactionStep.error && 'text-error'
            }`}
          >
            {!transactionStep.error && !transactionStep.success && (
              <ThreeCircles
                ariaLabel="three-circles-loading"
                color="#39ff88"
                height="20"
                visible={true}
                width="20"
              />
            )}

            {transactionStep.error && <span className="error-icon" />}

            {transactionStep.success && <span className="success-icon" />}

            <span className="ml-1">{transactionStep.message}</span>
          </div>

          {transactionStep.txHash && (
            <div className="pl-6 text-cyan-400">
              <a
                href={`${getScanUrlByChainId(chainId)}/tx/${transactionStep.txHash}`}
                target="_blank"
              >
                0x{transactionStep.txHash.slice(2, 4)}...
                {transactionStep.txHash.slice(-6)}
              </a>
            </div>
          )}
        </div>
      ))}

      {(transactionSteps.filter((step) => step.success).length ===
        transactionSteps.length ||
        transactionSteps.find((step) => step.error) !== undefined) && (
        <div className="text-center">
          <Button
            onClick={resetTransactionSteps}
            className="mt-4 bg-accent hover:bg-accent/80 font-light py-0 px-3 transition-colors duration-200 flex items-center gap-2 uppercase text-[12px] w-full"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default TransactionStepsHandler;
