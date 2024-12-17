import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';

import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent
} from '@ui/components/ui/hover-card';
import { pools } from '@ui/constants';
import { useAPRCell } from '@ui/hooks/market/useAPRCell';
import { cn } from '@ui/lib/utils';

import { AssetIcons } from '../AssetIcons';

import type { Address, Hex } from 'viem';

import type { FlywheelReward } from '@ionicprotocol/types';

export type APRCellProps = {
  type: 'borrow' | 'supply';
  baseAPR: number;
  asset: string;
  cToken: Address;
  dropdownSelectedChain: number;
  pool: Address;
  selectedPoolId: string;
  rewards?: FlywheelReward[];
  nativeAssetYield?: number;
  underlyingToken: Hex;
  aprTotal?: number;
};

const FlyWheelRewards = dynamic(() => import('./FlyWheelRewards'), {
  ssr: false
});

const RewardRow = ({ icon, text }: { icon: string; text: string }) => (
  <div className="flex items-center gap-2 py-0.5">
    <Image
      alt=""
      src={icon}
      width={16}
      height={16}
      className="size-4 rounded"
    />
    <span className="text-3xs">{text}</span>
  </div>
);

export default function APRCell(props: APRCellProps) {
  const {
    baseAPRFormatted,
    effectiveNativeYield,
    showRewardsBadge,
    showIonBadge,
    config,
    merklAprFormatted,
    rewardIcons,
    additionalRewards
  } = useAPRCell(props);

  const { dropdownSelectedChain, asset, cToken, pool, type, rewards } = props;

  const showFlywheel =
    config?.flywheel && (rewards || []).filter((r) => r.apy).length > 0;

  return (
    <HoverCard openDelay={50}>
      <HoverCardTrigger asChild>
        <div className="flex flex-col items-start cursor-pointer">
          <span>{props.aprTotal?.toFixed(2)}%</span>
          <div className="flex flex-col items-start gap-1">
            <span
              className={cn(
                'rounded-md w-max text-[10px] py-[3px] px-1.5 flex items-center gap-1',
                showIonBadge
                  ? 'bg-accent text-green-900'
                  : 'bg-accent/50 text-green-900'
              )}
            >
              + ION APR
              <Image
                src="/img/ionic-green-on-black.png"
                alt="ION"
                width={16}
                height={16}
                className={cn('rounded-full', !showIonBadge && 'opacity-50')}
              />
            </span>

            {(showRewardsBadge || effectiveNativeYield !== undefined) && (
              <div
                className={cn(
                  'rounded-md w-max py-[3px] px-1.5 flex items-center gap-1 text-[10px]',
                  pools[dropdownSelectedChain].text,
                  pools[dropdownSelectedChain].bg
                )}
              >
                <span>+ Rewards</span>
                <AssetIcons rewards={rewardIcons} />
              </div>
            )}

            {(config?.turtle || config?.kelp) && (
              <span className="text-darkone rounded-md w-max md:ml-0 text-center">
                <a
                  className="text-darkone bg-white rounded-md w-max ml-1 md:ml-0 text-center py-[3px] md:px-1 lg:px-1.5 px-1 flex items-center justify-center gap-1 md:text-[10px] text-[8px]"
                  href="https://turtle.club/dashboard/?ref=IONIC"
                  target="_blank"
                  rel="noreferrer"
                >
                  + TURTLE{' '}
                  <Image
                    src={
                      asset === 'STONE'
                        ? '/img/symbols/32/color/stone.png'
                        : config?.kelp
                          ? '/images/turtle-kelp.png'
                          : '/images/turtle-ionic.png'
                    }
                    alt="Turtle"
                    className="white rounded-full"
                    width={16}
                    height={16}
                  />
                  <Image
                    alt="external-link"
                    src="https://img.icons8.com/material-outlined/24/external-link.png"
                    width={16}
                    height={16}
                  />
                </a>
              </span>
            )}
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        className="w-64 bg-grayUnselect border-accent p-3"
        align="center"
      >
        <div className="flex flex-col space-y-1">
          <div className="flex items-center justify-between py-0.5">
            <span>Base APR: {baseAPRFormatted}%</span>
          </div>
          {config?.op && (
            <Link
              href="https://app.merkl.xyz/?chain=34443"
              target="_blank"
              className="flex items-center py-0.5 text-white hover:underline"
            >
              <Image
                src="/images/op-logo-red.svg"
                alt="OP"
                width={16}
                height={16}
                className="size-4 mr-2"
              />
              <span className="text-xs">
                + OP Rewards: {merklAprFormatted}%
              </span>
            </Link>
          )}
          {effectiveNativeYield !== undefined && (
            <p className="py-0.5 text-xs">
              Native Asset Yield: +
              {effectiveNativeYield.toLocaleString('en-US', {
                maximumFractionDigits: 2
              })}
              %
            </p>
          )}
          {showFlywheel && (
            <div className="py-0.5">
              <FlyWheelRewards
                cToken={cToken}
                pool={pool}
                poolChainId={dropdownSelectedChain}
                type={type}
                rewards={rewards}
              />
            </div>
          )}
          {additionalRewards.map((reward) => (
            <RewardRow
              key={reward.name}
              icon={reward.icon}
              text={reward.text ?? ''}
            />
          ))}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
