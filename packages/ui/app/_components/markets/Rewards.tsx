'use client';

import { type FlywheelReward } from '@ionicprotocol/types';
import { useMemo, useState } from 'react';
import { formatEther, type Address } from 'viem';
// import { base } from 'viem/chains';
import { useChainId } from 'wagmi';

import ResultHandler from '../ResultHandler';

import { FLYWHEEL_TYPE_MAP, REWARDS_TO_SYMBOL } from '@ui/constants/index';
import { useSdk } from '@ui/hooks/ionic/useSdk';
import { useAssetClaimableRewards } from '@ui/hooks/rewards/useAssetClaimableRewards';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

type RewardsProps = {
  cToken: Address;
  pool: Address;
  poolChainId: number;
  type: 'borrow' | 'supply';
  rewards?: FlywheelReward[];
};
export const Rewards = ({
  cToken,
  pool,
  poolChainId,
  type,
  rewards
}: RewardsProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { data: rewardsData } = useAssetClaimableRewards(
    cToken,
    pool,
    poolChainId
  );
  const chainId = useChainId();
  const sdk = useSdk(poolChainId);

  const filteredRewards = useMemo(
    () =>
      rewardsData?.filter((reward) =>
        FLYWHEEL_TYPE_MAP[poolChainId][type]
          .map((f) => f.toLowerCase())
          .includes(reward.flywheel?.toLowerCase() ?? '')
      ) ?? [],
    [poolChainId, rewardsData, type]
  );

  const claimRewards = async () => {
    try {
      const result = await handleSwitchOriginChain(poolChainId, chainId);
      if (result) {
        setIsLoading(true);
        const tx = await sdk?.claimRewardsForMarket(
          cToken,
          filteredRewards?.map((r) => r.flywheel!) ?? []
        );
        setIsLoading(false);
        console.warn('claim tx: ', tx);
      }
    } catch (err) {
      setIsLoading(false);
      console.warn(err);
    } finally {
      setIsLoading(false);
    }
  };

  const totalRewards =
    filteredRewards.reduce((acc, reward) => acc + reward.amount, 0n) ?? 0n;

  return (
    <>
      {rewards?.map((rewards, index) => (
        <div key={index}>
          {REWARDS_TO_SYMBOL[poolChainId]?.[rewards.token]} Rewards APR: +
          {rewards.apy
            ? rewards.apy.toLocaleString('en-US', { maximumFractionDigits: 2 })
            : '-'}
          %
        </div>
      ))}
      <div className="py-4">
        {filteredRewards.map((rewards, index) => (
          <div
            className="flex"
            key={index}
          >
            <img
              alt=""
              className="size-4 rounded mr-1"
              src={`/img/symbols/32/color/${REWARDS_TO_SYMBOL[poolChainId][rewards.rewardToken]?.toLowerCase()}.png`}
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
                isLoading={isLoading}
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
