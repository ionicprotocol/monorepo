'use client';

import { useState } from 'react';
import { formatEther, type Address } from 'viem';
import { base } from 'viem/chains';
import { useChainId } from 'wagmi';

import ResultHandler from '../ResultHandler';

import { useSdk } from '@ui/hooks/ionic/useSdk';
import { useAssetClaimableRewards } from '@ui/hooks/rewards/useAssetClaimableRewards';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

const REWARDS_TO_SYMBOL: Record<number, Record<Address, string>> = {
  [base.id]: {
    '0x3eE5e23eEE121094f1cFc0Ccc79d6C809Ebd22e5': 'ION'
  }
};

type RewardsProps = {
  cToken: Address;
  comptrollerAddress: Address;
  poolChainId: number;
};
export default function Rewards({
  cToken,
  comptrollerAddress,
  poolChainId
}: RewardsProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { data: rewardsData } = useAssetClaimableRewards(
    cToken,
    comptrollerAddress,
    poolChainId
  );
  const chainId = useChainId();
  const sdk = useSdk(poolChainId);

  const claimRewards = async () => {
    try {
      const result = await handleSwitchOriginChain(poolChainId, chainId);
      if (result) {
        setIsLoading(true);
        const tx = await sdk?.claimRewardsForMarket(
          cToken,
          rewardsData?.map((r) => r.flywheel!) ?? []
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
    rewardsData?.reduce((acc, reward) => acc + reward.amount, 0n) ?? 0n;

  return (
    <div className="pb-4 flex flex-col items-center justify-center">
      {rewardsData?.map((rewards, index) => (
        <div
          className="flex"
          key={index}
        >
          <img
            alt=""
            className="size-4 rounded mr-1"
            src={`/img/symbols/32/color/${REWARDS_TO_SYMBOL[poolChainId][rewards.rewardToken].toLowerCase()}.png`}
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
  );
}
