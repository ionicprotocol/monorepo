import { useState } from 'react';

import dynamic from 'next/dynamic';
import Image from 'next/image';

import { formatEther, type Address } from 'viem';
import { useChainId } from 'wagmi';

import { Button } from '@ui/components/ui/button';
import { Card } from '@ui/components/ui/card';
import { REWARDS_TO_SYMBOL } from '@ui/constants/index';
import { useSdk } from '@ui/hooks/ionic/useSdk';
import { useFlywheelRewards } from '@ui/hooks/useFlyWheelRewards';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import ResultHandler from '../ResultHandler';

import type { FlywheelReward } from '@ionicprotocol/types';

type FlyWheelRewardsProps = {
  cToken: Address;
  pool: Address;
  poolChainId: number;
  type: 'borrow' | 'supply';
  rewards?: FlywheelReward[];
  maxButtonWidth?: string;
};

const FlyWheelRewards = ({
  cToken,
  pool,
  poolChainId,
  type,
  rewards = []
}: FlyWheelRewardsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const chainId = useChainId();
  const sdk = useSdk(poolChainId);
  const { filteredRewards, totalRewards, combinedRewards } = useFlywheelRewards(
    poolChainId,
    cToken,
    pool,
    type
  );

  const handleClaim = async () => {
    try {
      const canSwitch = await handleSwitchOriginChain(poolChainId, chainId);
      if (!canSwitch || !sdk) return;

      setIsLoading(true);
      await sdk.claimRewardsForMarket(
        cToken,
        filteredRewards?.map((r) => r.flywheel!) ?? []
      );
    } catch (err) {
      console.warn(err);
    } finally {
      setIsLoading(false);
    }
  };

  const rewardsSymbols = REWARDS_TO_SYMBOL[poolChainId] ?? {};

  const hasClaimableRewards = combinedRewards.some(
    (reward) => Number(formatEther(reward.amount)) > 0
  );

  return (
    <div className="flex flex-col gap-1 w-full">
      {/* APR Rewards */}
      {rewards.map((reward, index) => (
        <div
          key={index}
          className="flex justify-between items-center gap-4"
        >
          <div className="flex items-center gap-2">
            <Image
              alt=""
              src={`/img/symbols/32/color/${rewardsSymbols[reward?.token].toLowerCase()}.png`}
              width={16}
              height={16}
              className="w-4 h-4 rounded"
            />
            <span className="text-xs text-gray-400">
              {rewardsSymbols[reward?.token]} Rewards
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
      {(totalRewards > 0 || combinedRewards.length > 0) && (
        <Card className="flex flex-col gap-1 bg-transparent border-none shadow-none p-0">
          {combinedRewards.map((reward, index) => (
            <div
              key={index}
              className="flex justify-between items-center gap-4"
            >
              <div className="flex items-center gap-2">
                <Image
                  alt=""
                  src={`/img/symbols/32/color/${rewardsSymbols[reward.rewardToken].toLowerCase()}.png`}
                  width={16}
                  height={16}
                  className="w-4 h-4 rounded"
                />
                <span className="text-xs text-gray-400">
                  Available to Claim
                </span>
              </div>
              <span className="text-xs font-medium text-white">
                {Number(formatEther(reward.amount)).toLocaleString('en-US', {
                  maximumFractionDigits: 2
                })}{' '}
                {rewardsSymbols[reward.rewardToken]}
              </span>
            </div>
          ))}

          {totalRewards > 0n && (
            <Button
              variant="secondary"
              className="uppercase font-medium bg-accent hover:bg-accent/90 text-black h-6 text-[10px] px-2 rounded-md mt-1 w-full"
              onClick={handleClaim}
              disabled={isLoading || !hasClaimableRewards}
            >
              <ResultHandler
                isLoading={isLoading}
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

export default dynamic(() => Promise.resolve(FlyWheelRewards), { ssr: false });
