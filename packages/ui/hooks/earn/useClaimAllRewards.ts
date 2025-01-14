import React from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { type Address, type Hash, encodeFunctionData } from 'viem';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';

import { useToast } from '../use-toast';

const MULTICALL3_ADDRESS =
  '0xcA11bde05977b3631167028862bE2a173976CA11' as const;
const MULTICALL3_ABI = [
  {
    inputs: [
      {
        components: [
          { name: 'target', type: 'address' },
          { name: 'allowFailure', type: 'bool' },
          { name: 'callData', type: 'bytes' }
        ],
        name: 'calls',
        type: 'tuple[]'
      }
    ],
    name: 'aggregate3',
    outputs: [
      {
        components: [
          { name: 'success', type: 'bool' },
          { name: 'returnData', type: 'bytes' }
        ],
        name: 'returnData',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  }
] as const;

interface FormattedReward {
  token: string;
  amount: string;
  usdValue: number;
  distributorAddress: Address;
  txData: string;
  chainId: number;
}

type RewardsMap = Record<string, FormattedReward>;
type ChainRewardsMap = Record<number, FormattedReward[]>;

// Helper to group rewards by chain
function groupRewardsByChain(rewards: RewardsMap): ChainRewardsMap {
  return Object.values(rewards).reduce((acc: ChainRewardsMap, reward) => {
    const chainId = reward.chainId;
    if (!acc[chainId]) {
      acc[chainId] = [];
    }
    acc[chainId].push(reward);
    return acc;
  }, {});
}

export function useClaimAllRewards() {
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { toast } = useToast();
  const [isClaimLoading, setIsClaimLoading] = React.useState(false);

  const claimAllRewards = async (rewards: RewardsMap): Promise<boolean> => {
    if (!walletClient || !address || isClaimLoading || !publicClient)
      return false;

    setIsClaimLoading(true);
    try {
      // Group rewards by chain ID
      const rewardsByChain = groupRewardsByChain(rewards);

      // Process each chain's rewards
      for (const [chainId, chainRewards] of Object.entries(rewardsByChain)) {
        // Create multicall data
        const calls = chainRewards.map((reward) => ({
          target: reward.distributorAddress,
          allowFailure: false,
          callData: reward.txData as Hash
        }));

        // Encode multicall data
        const multicallData = encodeFunctionData({
          abi: MULTICALL3_ABI,
          functionName: 'aggregate3',
          args: [calls]
        });

        // Create and simulate transaction
        const txRequest = {
          account: address,
          to: MULTICALL3_ADDRESS,
          data: multicallData,
          chainId: parseInt(chainId)
        } as const;

        try {
          await publicClient.call({
            account: address,
            to: MULTICALL3_ADDRESS,
            data: multicallData,
            value: 0n
          });
        } catch (error) {
          console.error(`Simulation failed for chain ${chainId}:`, error);
          throw error;
        }

        // Send transaction and wait for confirmation
        const hash = await walletClient.sendTransaction(txRequest as any);
        await publicClient.waitForTransactionReceipt({ hash });
      }

      toast({
        title: 'Success!',
        description: 'Successfully claimed all rewards',
        duration: 5000
      });

      // Refetch rewards data
      await queryClient.invalidateQueries({
        queryKey: ['morphoRewards', address]
      });

      return true;
    } catch (error) {
      console.error('Failed to claim rewards:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to claim rewards. Please try again.',
        variant: 'destructive',
        duration: 5000
      });
      return false;
    } finally {
      setIsClaimLoading(false);
    }
  };

  return {
    claimAllRewards,
    isClaimLoading
  } as const;
}
