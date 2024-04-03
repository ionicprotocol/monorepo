'use client';

import { Dispatch, useReducer } from 'react';
import { ThreeCircles } from 'react-loader-spinner';

export type TransactionStep = {
  error: boolean;
  message: string;
  success: boolean;
  txHash?: string;
};
export type TransactionStepsHandlerProps = {
  resetTransactionSteps: () => void;
  transactionSteps: TransactionStep[];
};
export type UseTransactionSteps = {
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

  return {
    transactionSteps,
    upsertTransactionStep
  };
};

function TransactionStepsHandler({
  transactionSteps,
  resetTransactionSteps
}: TransactionStepsHandlerProps) {
  return (
    <div className="mx-auto text-sm">
      {transactionSteps.map((transactionStep, i) => (
        <div key={`transaction-step-${i}`}>
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
                href={`https://explorer.mode.network/tx/${transactionStep.txHash}`}
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
          <button
            className="mt-4 btn-green uppercase"
            onClick={resetTransactionSteps}
          >
            CONTINUE
          </button>
        </div>
      )}
    </div>
  );
}

export default TransactionStepsHandler;
