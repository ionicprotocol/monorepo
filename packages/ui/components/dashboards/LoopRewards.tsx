import dynamic from 'next/dynamic';
import Image from 'next/image';

import toast from 'react-hot-toast';
import { formatEther, type Address } from 'viem';
import { useChainId, useWriteContract } from 'wagmi';

import { Button } from '@ui/components/ui/button';
import { Card } from '@ui/components/ui/card';
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
};

const LoopRewards = ({
  positionAddress,
  poolChainId,
  rewards
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

  const hasClaimableRewards = combinedRewards?.some(
    (reward) => Number(formatEther(reward.amount)) > 0
  );

  return (
    <div className="flex flex-col gap-1 w-full max-w-[200px]">
      {/* APR Rewards */}
      {rewards?.map((reward, index) => (
        <div
          key={index}
          className="flex justify-between items-center gap-4"
        >
          <div className="flex items-center gap-2">
            <Image
              alt=""
              src={`/img/symbols/32/color/${REWARDS_TO_SYMBOL[poolChainId]?.[reward?.token].toLowerCase()}.png`}
              width={16}
              height={16}
              className="w-4 h-4 rounded"
            />
            <span className="text-xs text-gray-400">
              {REWARDS_TO_SYMBOL[poolChainId]?.[reward?.token]} Rewards
            </span>
          </div>
          <span className="text-xs font-medium text-green-400">
            +
            {reward.apy?.toLocaleString('en-US', {
              maximumFractionDigits: 2
            }) ?? '-'}
            %
          </span>
        </div>
      ))}

      {/* Claimable Rewards */}
      {(totalRewards > 0n ||
        (combinedRewards && combinedRewards.length > 0)) && (
        <Card className="flex flex-col gap-1 bg-transparent border-none shadow-none p-0">
          {combinedRewards?.map((reward, index) => (
            <div
              key={index}
              className="flex items-center justify-center gap-2"
            >
              <Image
                alt=""
                src={`/img/symbols/32/color/${REWARDS_TO_SYMBOL[poolChainId]?.[reward.rewardToken].toLowerCase()}.png`}
                width={16}
                height={16}
                className="w-4 h-4 rounded"
              />
              <span className="text-xs font-medium text-white">
                +{' '}
                {Number(formatEther(reward.amount)).toLocaleString('en-US', {
                  maximumFractionDigits: 1
                })}{' '}
                {REWARDS_TO_SYMBOL[poolChainId][reward.rewardToken]}
              </span>
            </div>
          ))}

          {totalRewards > 0n && (
            <Button
              variant="secondary"
              className="uppercase font-medium bg-accent hover:bg-accent/90 text-black h-6 text-[10px] px-2 rounded-md mt-1 disabled:opacity-50"
              onClick={claimRewards}
              disabled={isPending || !hasClaimableRewards}
            >
              <ResultHandler
                isLoading={isPending}
                height="14"
                width="14"
                color="#000000"
              >
                Claim Rewards
              </ResultHandler>
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};

export default dynamic(() => Promise.resolve(LoopRewards), { ssr: false });
