'use client';

import { useState } from 'react';

import dynamic from 'next/dynamic';

import { formatEther, type Address } from 'viem';
import { useChainId } from 'wagmi';

import { Button } from '@ui/components/ui/button';
import { Card } from '@ui/components/ui/card';
import { REWARDS_TO_SYMBOL } from '@ui/constants/index';
import { useSdk } from '@ui/hooks/ionic/useSdk';
import { useFlywheelRewards } from '@ui/hooks/useFlyWheelRewards';
import { cn } from '@ui/lib/utils';
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
  isStandalone?: boolean;
};

const RewardRow = ({
  symbol,
  value,
  isStandalone
}: {
  symbol: string;
  value: string;
  isStandalone?: boolean;
}) => (
  <div
    className={cn(
      'flex items-center gap-2 py-0.5',
      isStandalone && 'justify-center'
    )}
  >
    <img
      alt=""
      className="size-4 rounded"
      src={`/img/symbols/32/color/${symbol.toLowerCase()}.png`}
    />
    <span className="text-3xs font-light">{value}</span>
  </div>
);

const FlyWheelRewards = ({
  cToken,
  pool,
  poolChainId,
  type,
  rewards = [],
  maxButtonWidth = 'max-w-[160px]',
  isStandalone = false
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

  return (
    <div
      className={cn('flex flex-col space-y-1', isStandalone && 'items-center')}
    >
      {rewards.map((reward, index) => (
        <RewardRow
          key={index}
          symbol={rewardsSymbols[reward?.token]}
          value={`${rewardsSymbols[reward?.token]} Rewards APR: +${
            reward.apy?.toLocaleString('en-US', { maximumFractionDigits: 2 }) ??
            '-'
          }%`}
          isStandalone={isStandalone}
        />
      ))}

      {(totalRewards > 0 || combinedRewards.length > 0) && (
        <Card
          className={cn(
            'flex flex-col space-y-1 bg-transparent border-none shadow-none p-0',
            isStandalone && 'items-center w-full'
          )}
        >
          {combinedRewards.map((reward, index) => (
            <RewardRow
              key={index}
              symbol={rewardsSymbols[reward.rewardToken]}
              value={`+ ${Number(formatEther(reward.amount)).toLocaleString(
                'en-US',
                {
                  maximumFractionDigits: 1
                }
              )} ${rewardsSymbols[reward.rewardToken]}`}
              isStandalone={isStandalone}
            />
          ))}

          {totalRewards > 0n && (
            <div
              className={cn(
                'flex w-full',
                isStandalone ? 'justify-center' : 'justify-start'
              )}
            >
              <Button
                variant="secondary"
                className={cn(
                  'uppercase font-medium bg-accent hover:bg-accent/90 text-black h-5 text-[10px] px-2 rounded-md',
                  maxButtonWidth,
                  !isStandalone && 'mt-1'
                )}
                onClick={handleClaim}
                disabled={isLoading}
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
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default dynamic(() => Promise.resolve(FlyWheelRewards), { ssr: false });
