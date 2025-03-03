import { useState, useCallback } from 'react';

import { parseUnits } from 'viem';
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt
} from 'wagmi';

import { erc20Abi, bribeRewardsAbi } from '@ionicprotocol/sdk';

type IncentiveSubmissionProps = {
  bribeAddress: `0x${string}`;
  tokenAddress: `0x${string}`;
  amount: string;
  tokenDecimals?: number;
};

export const useIncentiveSubmission = () => {
  const { address } = useAccount();

  const [isApproving, setIsApproving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [approveTxHash, setApproveTxHash] = useState<`0x${string}` | null>(
    null
  );
  const [notifyTxHash, setNotifyTxHash] = useState<`0x${string}` | null>(null);

  // Contract writes
  const { writeContractAsync: writeApprove } = useWriteContract();
  const { writeContractAsync: writeNotifyReward } = useWriteContract();

  // Approval transaction watcher
  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } =
    useWaitForTransactionReceipt({
      hash: approveTxHash || undefined,
      query: {
        enabled: !!approveTxHash
      }
    });

  // Notify transaction watcher
  const { isLoading: isNotifyConfirming, isSuccess: isNotifyConfirmed } =
    useWaitForTransactionReceipt({
      hash: notifyTxHash || undefined,
      query: {
        enabled: !!notifyTxHash
      }
    });

  // Derived state for component consumption
  const isConfirming = isApproveConfirming || isNotifyConfirming;
  const isConfirmed = isNotifyConfirmed;

  // Reset state when unmounting or when needed
  const resetState = useCallback(() => {
    setError(null);
    setApproveTxHash(null);
    setNotifyTxHash(null);
    setTxHash(null);
    setIsApproving(false);
    setIsSubmitting(false);
  }, []);

  const submitIncentive = async ({
    bribeAddress,
    tokenAddress,
    amount,
    tokenDecimals = 18
  }: IncentiveSubmissionProps) => {
    if (!address || !bribeAddress || !amount || !tokenAddress) {
      setError('Missing required parameters');
      return { success: false, error: 'Missing required parameters' };
    }

    try {
      resetState();

      // Use provided decimals or default to 18
      const parsedAmount = parseUnits(amount, tokenDecimals);

      // Approve tokens
      setIsApproving(true);

      try {
        const approveTx = await writeApprove({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'approve',
          args: [bribeAddress, parsedAmount]
        });

        setApproveTxHash(approveTx);
        setTxHash(approveTx); // Set the current active txHash for UI

        // Wait for the approval to be confirmed using a timeout
        let approvalConfirmed = false;
        const startTime = Date.now();
        const timeoutDuration = 60000; // 1 minute timeout

        while (!approvalConfirmed && Date.now() - startTime < timeoutDuration) {
          if (isApproveConfirmed) {
            approvalConfirmed = true;
            break;
          }
          // Non-blocking delay
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        if (!approvalConfirmed) {
          throw new Error('Approval transaction timed out');
        }
      } catch (approveError) {
        setIsApproving(false);
        throw new Error(`Approval failed: ${approveError}`);
      }

      setIsApproving(false);

      // Submit the incentive
      setIsSubmitting(true);

      const notifyTx = await writeNotifyReward({
        address: bribeAddress,
        abi: bribeRewardsAbi,
        functionName: 'notifyRewardAmount',
        args: [tokenAddress, parsedAmount]
      });

      setNotifyTxHash(notifyTx);
      setTxHash(notifyTx); // Update the current active txHash
      setIsSubmitting(false);

      return { success: true, txHash: notifyTx };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setIsApproving(false);
      setIsSubmitting(false);
      return { success: false, error: errorMessage };
    }
  };

  return {
    submitIncentive,
    isApproving,
    isSubmitting,
    isConfirming,
    isConfirmed,
    error,
    txHash,
    resetState
  };
};
