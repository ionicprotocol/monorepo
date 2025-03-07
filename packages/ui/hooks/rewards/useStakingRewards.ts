import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http } from 'viem';
import { base, mode, optimism } from 'viem/chains';
import { useAccount, useChainId, useWriteContract } from 'wagmi';

import { getStakingToContract } from '@ui/utils/getStakingTokens';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import type { BaseReward } from './useRewardsAggregator';

import { iVeloIonModeStakingAbi } from '@ionicprotocol/sdk';

// ABI for the VeloAeroStakingStrategy contract
const veloAeroStakingStrategyAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    name: 'userStakingWallet',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

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

// Map chains to VeloAeroStakingStrategy addresses
const veloAeroStakingStrategyAddresses: Record<number, `0x${string}`> = {
  [base.id]: '0x8b4352493077D2B04b033DE83516Dc2d53d09931',
  [mode.id]: '0x8ff8b21a0736738b25597D32d8f7cf658f39f157'
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

  // Query to get the user's staking wallet
  const { data: stakingWallet } = useQuery({
    queryKey: ['stakingWallet', chainId, address],
    queryFn: async () => {
      if (!address) return null;

      const publicClient = publicClients[chainId as keyof typeof publicClients];
      if (!publicClient) {
        console.error('No public client available for chain:', chainId);
        return null;
      }

      const strategyAddress = veloAeroStakingStrategyAddresses[chainId];
      if (!strategyAddress) {
        console.error('No staking strategy address for chain:', chainId);
        return null;
      }

      try {
        const wallet = await publicClient.readContract({
          address: strategyAddress,
          abi: veloAeroStakingStrategyAbi,
          functionName: 'userStakingWallet',
          args: [address]
        });

        console.log(
          `Staking wallet for ${address} on chain ${chainId}: ${wallet}`
        );

        return wallet;
      } catch (error) {
        console.error('Error fetching staking wallet:', error);
        return null;
      }
    },
    enabled:
      !!address &&
      !!chainId &&
      Object.keys(veloAeroStakingStrategyAddresses).includes(chainId.toString())
  });

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
    queryKey: ['stakingRewards', chainId, address, stakingWallet],
    queryFn: async () => {
      if (!address || !stakingWallet) return null;

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
            args: [stakingWallet]
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
    claimRewards,
    stakingWallet
  };
};
