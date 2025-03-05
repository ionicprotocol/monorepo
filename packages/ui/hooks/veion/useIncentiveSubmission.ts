import { useState, useCallback } from 'react';

import { parseUnits } from 'viem';
import { useAccount, useWriteContract, usePublicClient } from 'wagmi';

import { useToast } from '@ui/hooks/use-toast';

import { erc20Abi, bribeRewardsAbi } from '@ionicprotocol/sdk';

type IncentiveSubmissionProps = {
  bribeAddress: `0x${string}`;
  tokenAddress: `0x${string}`;
  amount: string;
  tokenDecimals?: number;
};

export const useIncentiveSubmission = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { toast } = useToast();

  const [isApproving, setIsApproving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  // Contract writes
  const { writeContractAsync } = useWriteContract();

  // Reset state when unmounting or when needed
  const resetState = useCallback(() => {
    setError(null);
    setTxHash(null);
    setIsApproving(false);
    setIsSubmitting(false);
    setIsConfirming(false);
  }, []);

  const submitIncentive = async ({
    bribeAddress,
    tokenAddress,
    amount,
    tokenDecimals = 18
  }: IncentiveSubmissionProps) => {
    if (
      !address ||
      !bribeAddress ||
      !amount ||
      !tokenAddress ||
      !publicClient
    ) {
      const errorMsg = 'Missing required parameters or publicClient';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      resetState();

      // Parse amount
      const parsedAmount = parseUnits(amount, tokenDecimals);

      // Step 1: Approval - follow pattern from createLock
      setIsApproving(true);

      try {
        // Simulate approval first to catch any potential issues
        const { request: approvalRequest } =
          await publicClient.simulateContract({
            abi: erc20Abi,
            address: tokenAddress,
            functionName: 'approve',
            account: address,
            args: [bribeAddress, parsedAmount]
          });

        // If simulation succeeds, execute approval
        const approvalTx = await writeContractAsync(approvalRequest);
        setTxHash(approvalTx);

        // Wait for approval transaction to complete
        setIsConfirming(true);
        await publicClient.waitForTransactionReceipt({
          hash: approvalTx
        });

        setIsApproving(false);
        setIsConfirming(false);
      } catch (error) {
        console.error('Approval failed:', error);
        setIsApproving(false);
        setIsConfirming(false);
        throw new Error('Token approval failed');
      }

      // Step 2: Submit incentive
      setIsSubmitting(true);

      try {
        // Simulate transaction first
        const { request: incentiveRequest } =
          await publicClient.simulateContract({
            abi: bribeRewardsAbi,
            address: bribeAddress,
            functionName: 'notifyRewardAmount',
            account: address,
            args: [tokenAddress, parsedAmount]
          });

        // If simulation succeeds, execute transaction
        const incentiveTx = await writeContractAsync(incentiveRequest);
        setTxHash(incentiveTx);

        // Wait for incentive transaction to complete
        setIsConfirming(true);
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: incentiveTx
        });

        setIsSubmitting(false);
        setIsConfirming(false);

        toast({
          title: 'Success',
          description: 'Incentive successfully submitted',
          variant: 'default'
        });

        return { success: true, txHash: incentiveTx };
      } catch (error) {
        console.error('Incentive submission failed:', error);
        setIsSubmitting(false);
        setIsConfirming(false);
        throw new Error('Incentive submission failed');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setIsApproving(false);
      setIsSubmitting(false);
      setIsConfirming(false);

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });

      return { success: false, error: errorMessage };
    }
  };

  const isConfirmed =
    !isApproving &&
    !isSubmitting &&
    !isConfirming &&
    txHash !== null &&
    error === null;

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
