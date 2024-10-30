'use client';

import { useState } from 'react';

import dynamic from 'next/dynamic';

import { formatEther, type Address } from 'viem';
import { useChainId } from 'wagmi';

import { REWARDS_TO_SYMBOL } from '@ui/constants/index';
import { useSdk } from '@ui/hooks/ionic/useSdk';
import { useFlywheelRewards } from '@ui/hooks/useFlyWheelRewards';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import ResultHandler from '../ResultHandler';

import { type FlywheelReward } from '@ionicprotocol/types';

type FlyWheelRewardsProps = {
  cToken: Address;
  pool: Address;
  poolChainId: number;
  type: 'borrow' | 'supply';
  rewards?: FlywheelReward[];
  className?: string;
};

const FlyWheelRewards = ({
  cToken,
  pool,
  poolChainId,
  type,
  rewards,
  className
}: FlyWheelRewardsProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chainId = useChainId();
  const sdk = useSdk(poolChainId);

  const { filteredRewards, totalRewards, combinedRewards } = useFlywheelRewards(
    poolChainId,
    cToken,
    pool,
    type
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
      {(totalRewards > 0 || combinedRewards.length > 0) && (
        <div className="py-4">
          {combinedRewards.map((rewards, index) => (
            <div
              className={`flex ${className ?? 'none'}`}
              key={index}
            >
              <img
                alt=""
                className="size-4 rounded mr-1"
                src={`/img/symbols/32/color/${REWARDS_TO_SYMBOL[poolChainId]?.[rewards?.rewardToken]?.toLowerCase()}.png`}
              />
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
                className="rounded-md bg-accent text-black py-1 px-3 uppercase truncate"
                onClick={claimRewards}
              >
                <ResultHandler
                  isLoading={isLoading}
                  height="20"
                  width="20"
                  color="#000000"
                >
                  Claim Rewards
                </ResultHandler>
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default dynamic(() => Promise.resolve(FlyWheelRewards), { ssr: false });
