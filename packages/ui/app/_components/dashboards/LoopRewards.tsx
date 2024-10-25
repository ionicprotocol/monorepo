'use client';

import dynamic from 'next/dynamic';

import toast from 'react-hot-toast';
import { formatEther, type Address } from 'viem';
import { useChainId, useWriteContract } from 'wagmi';

import { REWARDS_TO_SYMBOL } from '@ui/constants/index';
import { useAllClaimableRewards } from '@ui/hooks/rewards/useAllClaimableRewards';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import ResultHandler from '../ResultHandler';

import {
  leveredPositionAbi,
  type FlywheelClaimableRewards
} from '@ionicprotocol/sdk';
import { type FlywheelReward } from '@ionicprotocol/types';

type LoopRewardsProps = {
  positionAddress: Address;
  poolChainId: number;
  rewards?: FlywheelReward[];
  className?: string;
};
const LoopRewards = ({
  positionAddress,
  poolChainId,
  rewards,
  className
}: LoopRewardsProps) => {
  const { writeContractAsync, isPending } = useWriteContract();
  const chainId = useChainId();

  const { data: rewardsData } = useAllClaimableRewards(
    [poolChainId],
    positionAddress
  );

  const claimRewards = async () => {
    const result = await handleSwitchOriginChain(poolChainId, chainId);
    if (result) {
      const tx = await writeContractAsync({
        address: positionAddress,
        abi: leveredPositionAbi,
        functionName: 'claimRewards',
        args: []
      });
      console.warn('claim tx: ', tx);
      toast.success('Rewards claimed successfully');
    }
  };

  const totalRewards =
    rewardsData?.reduce((acc, reward) => acc + reward.amount, 0n) ?? 0n;

  // combine rewards for asset
  const combinedRewards = rewardsData?.reduce((acc, reward) => {
    const el = acc.find((a) => a.rewardToken === reward.rewardToken);
    if (el) {
      el.amount += reward.amount;
    } else {
      acc.push({
        rewardToken: reward.rewardToken as Address,
        amount: reward.amount
      });
    }
    return acc;
  }, [] as FlywheelClaimableRewards[]);

  return (
    <>
      {rewards?.map((rewards, index) => (
        <div key={index}>
          {REWARDS_TO_SYMBOL[poolChainId]?.[rewards?.token]} Rewards APR: +
          {rewards.apy
            ? rewards.apy.toLocaleString('en-US', { maximumFractionDigits: 2 })
            : '-'}
          %
        </div>
      ))}
      <div className="py-4">
        {combinedRewards?.map((rewards, index) => (
          <div
            className={`flex ${className ?? 'none'}`}
            key={index}
          >
            <img
              alt=""
              className="size-4 rounded mr-1"
              src={`/img/symbols/32/color/${REWARDS_TO_SYMBOL[poolChainId]?.[rewards?.rewardToken]?.toLowerCase()}.png`}
            />{' '}
            +{' '}
            {Number(formatEther(rewards.amount)).toLocaleString('en-US', {
              maximumFractionDigits: 1
            })}{' '}
            {REWARDS_TO_SYMBOL[poolChainId][rewards.rewardToken]}
          </div>
        ))}
        {totalRewards > 0n && (
          <div className="flex justify-center pt-1">
            <button
              className={`rounded-md bg-accent text-black py-1 px-3 uppercase truncate `}
              onClick={claimRewards}
            >
              <ResultHandler
                isLoading={isPending}
                height="20"
                width="20"
                color={'#000000'}
              >
                Claim Rewards
              </ResultHandler>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default dynamic(() => Promise.resolve(LoopRewards), { ssr: false });
