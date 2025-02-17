import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http } from 'viem';
import { base, mode, optimism } from 'viem/chains';
import { useAccount, useChainId, useWriteContract } from 'wagmi';

import { getStakingToContract } from '@ui/utils/getStakingTokens';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import type { BaseReward } from './useRewardsAggregator';

import { iVeloIonModeStakingAbi } from '@ionicprotocol/sdk';

const publicClients = {
  [mode.id]: createPublicClient({
    chain: mode,
    transport: http()
  }),
  [base.id]: createPublicClient({
    chain: base,
    transport: http()
  })
};

export const useStakingRewards = (chainId: number) => {
  const { address } = useAccount();
  const currentChainId = useChainId();
  const { writeContractAsync } = useWriteContract();

  const getTokenType = (chain: number) => {
    if (chain === mode.id) return 'mode';
    if (chain === base.id) return 'eth';
    if (chain === optimism.id) return 'eth';
    return 'eth';
  };

  const claimRewards = async () => {
    if (!address) return;

    const tokenType = getTokenType(chainId);
    const contractAddress = getStakingToContract(chainId, tokenType);

    const isSwitched = await handleSwitchOriginChain(chainId, currentChainId);
    if (!isSwitched) return;

    try {
      const tx = await writeContractAsync({
        abi: iVeloIonModeStakingAbi,
        address: contractAddress,
        args: [address],
        functionName: 'getReward',
        chainId: chainId
      });

      return tx;
    } catch (err) {
      console.error('Error claiming staking rewards:', err);
      throw err;
    }
  };

  const query = useQuery({
    queryKey: ['stakingRewards', chainId, address],
    queryFn: async () => {
      if (!address) return null;

      const publicClient = publicClients[chainId as keyof typeof publicClients];
      if (!publicClient) {
        console.error('No public client available for chain:', chainId);
        return null;
      }

      const tokenType = getTokenType(chainId);
      const contractAddress = getStakingToContract(chainId, tokenType);

      try {
        const [earned, rewardToken] = await Promise.all([
          publicClient.readContract({
            address: contractAddress,
            abi: iVeloIonModeStakingAbi,
            functionName: 'earned',
            args: [address]
          }),
          publicClient.readContract({
            address: contractAddress,
            abi: iVeloIonModeStakingAbi,
            functionName: 'rewardToken'
          })
        ]);

        return {
          amount: earned,
          chainId,
          rewardToken
        } as BaseReward;
      } catch (error) {
        console.error('Error fetching staking rewards:', error);
        return null;
      }
    },
    enabled: !!address
  });

  return {
    ...query,
    claimRewards
  };
};
