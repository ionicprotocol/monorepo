import { useQuery, useQueryClient } from '@tanstack/react-query';
import { formatUnits } from 'viem';
import { useWalletClient, useWriteContract } from 'wagmi';

import { REWARDS_TO_SYMBOL } from '@ui/constants';
import { VEION_CONTRACTS } from '@ui/constants/veIon';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { getAvailableStakingToken } from '@ui/utils/getStakingTokens';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import { useBribeRewards, type BribeReward } from './useBribeRewards';
import { useMarketRewards } from './useMarketRewards';
import { useStakingRewards } from './useStakingRewards';

import type { Address, Hex } from 'viem';

import { bribeRewardsAbi, veIonFirstExtensionAbi } from '@ionicprotocol/sdk';
import type { SupportedChains } from '@ionicprotocol/types';

export interface BaseReward {
  amount: bigint;
  chainId: SupportedChains;
  rewardToken: Hex;
}

export interface FormattedReward {
  id: string;
  token: string;
  tokenSymbol: string;
  amount: string;
  network: string;
  section: 'Locked LP Emissions' | 'Market Emissions' | 'Protocol Bribes';
  chainId: number;
  rewardToken: Hex;
  tokenId?: bigint; // Optional tokenId for bribe rewards
}

export const getNetworkName = (chainId: number): string => {
  switch (chainId) {
    case 8453:
      return 'Base';
    case 34443:
      return 'Mode';
    case 10:
      return 'Optimism';
    default:
      return 'Unknown';
  }
};

export const useRewardsAggregator = () => {
  const { getSdk } = useMultiIonic();
  const { currentChain } = useVeIONContext();
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient({ chainId: currentChain });
  const { writeContractAsync } = useWriteContract();

  const { data: marketRewards, isLoading: isLoadingMarket } = useMarketRewards([
    currentChain
  ]);
  const {
    data: stakingRewards,
    isLoading: isLoadingStaking,
    claimRewards: claimStakingRewards
  } = useStakingRewards(currentChain);

  const { bribeRewards, isLoading: isLoadingBribes } = useBribeRewards();

  const { data: formattedRewards, isLoading: isProcessing } = useQuery({
    queryKey: [
      'formattedRewards',
      marketRewards,
      stakingRewards,
      bribeRewards,
      currentChain
    ],
    queryFn: async () => {
      const rewards: FormattedReward[] = [];

      // Market Emissions
      if (marketRewards) {
        marketRewards.forEach((reward: BaseReward) => {
          const tokenSymbol =
            REWARDS_TO_SYMBOL[reward.chainId][reward.rewardToken] || 'Unknown';
          rewards.push({
            id: `market-${reward.chainId}-${reward.rewardToken}`,
            token: tokenSymbol.toLowerCase(),
            tokenSymbol,
            amount: formatUnits(reward.amount, 18),
            network: getNetworkName(reward.chainId),
            section: 'Market Emissions',
            chainId: reward.chainId,
            rewardToken: reward.rewardToken
          });
        });
      }

      // Protocol Bribes
      if (bribeRewards) {
        bribeRewards.forEach((reward: BribeReward) => {
          const tokenSymbol =
            REWARDS_TO_SYMBOL[reward.chainId][reward.rewardToken] || 'Unknown';
          rewards.push({
            id: `bribe-${reward.chainId}-${reward.rewardToken}-${reward.bribeAddress}-${reward.tokenId}`,
            token: tokenSymbol.toLowerCase(),
            tokenSymbol,
            amount: formatUnits(reward.amount, 18),
            network: getNetworkName(reward.chainId),
            section: 'Protocol Bribes',
            chainId: reward.chainId,
            rewardToken: reward.rewardToken,
            tokenId: reward.tokenId
          });
        });
      }

      // Locked LP Emissions
      if (stakingRewards) {
        rewards.push({
          id: `staking-${stakingRewards.chainId}-${stakingRewards.rewardToken}`,
          token: currentChain === 8453 ? 'aero' : 'velo',
          tokenSymbol: currentChain === 8453 ? 'AERO' : 'VELO',
          amount: formatUnits(stakingRewards.amount, 18),
          network: getNetworkName(stakingRewards.chainId),
          section: 'Locked LP Emissions',
          chainId: stakingRewards.chainId,
          rewardToken: stakingRewards.rewardToken
        });
      }

      return rewards;
    },
    enabled: !!marketRewards || !!stakingRewards || !!bribeRewards
  });

  const claimRewards = async (selectedIds?: string[]) => {
    if (!formattedRewards || !currentChain) return;

    const rewardsToProcess = selectedIds
      ? formattedRewards.filter((r) => selectedIds.includes(r.id))
      : formattedRewards;

    const rewardsByChain = rewardsToProcess.reduce(
      (acc, reward) => {
        if (!acc[reward.chainId]) {
          acc[reward.chainId] = {
            market: [] as Hex[],
            staking: [] as Hex[],
            bribes: [] as {
              token: Hex;
              bribeAddress: Address;
              tokenId: bigint;
            }[]
          };
        }

        if (reward.section === 'Market Emissions') {
          acc[reward.chainId].market.push(reward.rewardToken);
        } else if (reward.section === 'Locked LP Emissions') {
          acc[reward.chainId].staking.push(reward.rewardToken);
        } else if (reward.section === 'Protocol Bribes') {
          const bribeReward = bribeRewards?.find(
            (br) =>
              br.rewardToken === reward.rewardToken &&
              br.chainId === reward.chainId &&
              br.tokenId === reward.tokenId
          );
          if (bribeReward) {
            acc[reward.chainId].bribes.push({
              token: reward.rewardToken,
              bribeAddress: bribeReward.bribeAddress,
              tokenId: bribeReward.tokenId
            });
          }
        }

        return acc;
      },
      {} as Record<
        number,
        {
          market: Hex[];
          staking: Hex[];
          bribes: { token: Hex; bribeAddress: Address; tokenId: bigint }[];
        }
      >
    );

    const sdk = getSdk(currentChain);
    if (!sdk) return;

    try {
      // Since we're only dealing with currentChain, no need to loop over chains
      const { market, staking, bribes } = rewardsByChain[currentChain] || {
        market: [],
        staking: [],
        bribes: []
      };

      // Claim market rewards
      if (market.length > 0) {
        if (market.length === 1) {
          await sdk.claimRewardsForRewardToken(market[0]);
        } else {
          await sdk.claimAllRewards();
        }
        await queryClient.invalidateQueries({ queryKey: ['marketRewards'] });
      }

      // Claim staking rewards (Locked LP Emissions - AERO/VELO)
      if (staking.length > 0) {
        const veIonFirstExtensionAddress =
          VEION_CONTRACTS[currentChain as keyof typeof VEION_CONTRACTS];
        if (veIonFirstExtensionAddress) {
          const isSwitched = await handleSwitchOriginChain(
            currentChain,
            currentChain
          );
          if (!isSwitched) return;

          // Use veIonFirstExtension.claimEmissions for Locked LP Emissions (AERO/VELO)
          // Get the token type for the current chain
          const tokenType = currentChain === 34443 ? 'mode' : 'eth';

          // Get the LP token address directly using the utility function
          const lpTokenAddress = getAvailableStakingToken(
            currentChain,
            tokenType
          );

          if (
            lpTokenAddress &&
            lpTokenAddress !== '0x0000000000000000000000000000000000000000'
          ) {
            // Now we have the LP token address, we can call claimEmissions
            await writeContractAsync({
              address: veIonFirstExtensionAddress,
              abi: veIonFirstExtensionAbi,
              functionName: 'claimEmissions',
              args: [lpTokenAddress],
              chainId: currentChain
            });
          } else {
            // Fallback to the original method
            console.warn(
              `Could not get valid LP token address for chain ${currentChain}, falling back to original method`
            );
            await claimStakingRewards();
          }
        } else {
          // Fallback to the old method if extension address is not available
          await claimStakingRewards();
        }
        await queryClient.invalidateQueries({ queryKey: ['stakingRewards'] });
      }

      // Claim bribe rewards
      if (bribes.length > 0 && walletClient) {
        for (const bribe of bribes) {
          await walletClient.writeContract({
            address: bribe.bribeAddress,
            abi: bribeRewardsAbi,
            functionName: 'getReward',
            args: [bribe.tokenId, [bribe.token]]
          });
        }
        await queryClient.invalidateQueries({ queryKey: ['bribeRewards'] });
      }

      await queryClient.invalidateQueries({ queryKey: ['formattedRewards'] });
    } catch (error) {
      console.error(`Error claiming rewards for chain ${currentChain}:`, error);
      throw error;
    }
  };

  return {
    rewards: formattedRewards ?? [],
    isLoading:
      isLoadingMarket || isLoadingStaking || isLoadingBribes || isProcessing,
    claimRewards
  };
};
