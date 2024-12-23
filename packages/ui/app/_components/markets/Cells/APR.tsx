import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';

import { Sparkles, TrendingUp, ExternalLink } from 'lucide-react';

import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent
} from '@ui/components/ui/hover-card';
import { chainsArr, pools } from '@ui/constants';
import { useAPRCell } from '@ui/hooks/market/useAPRCell';
import { cn } from '@ui/lib/utils';

import { AssetIcons } from '../../AssetIcons';

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

const FlyWheelRewards = dynamic(() => import('../FlyWheelRewards'), {
  ssr: false
});

export default function APR(props: APRCellProps) {
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
        <div className="flex flex-col items-start cursor-help">
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

            {/* {showIonBadge && (
              <span className="rounded-md w-max text-[10px] py-[3px] px-1.5 flex items-center gap-1 bg-accent text-green-900">
                + ION APR
                <Image
                  src="/img/ionic-green-on-black.png"
                  alt="ION"
                  width={16}
                  height={16}
                  className="rounded-full"
                />
              </span>
            )} */}

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
        className="flex flex-col gap-2 p-3 bg-grayone border border-accent rounded-lg shadow-lg"
        align="center"
      >
        <div className="text-sm font-medium text-gray-300 text-left">
          APR Breakdown
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Base APR</span>
            </div>
            <span className="text-xs font-medium">{baseAPRFormatted}%</span>
          </div>

          {config?.op && (
            <div className="flex justify-between items-center gap-4">
              <Link
                href="https://app.merkl.xyz/?chain=34443"
                target="_blank"
                className="flex items-center gap-2 text-white hover:underline"
              >
                <Image
                  src="/images/op-logo-red.svg"
                  alt="OP"
                  width={16}
                  height={16}
                  className="w-4 h-4"
                />
                <span className="text-xs text-gray-400">OP Rewards</span>
              </Link>
              <span className="text-xs font-medium text-red-400">
                +{merklAprFormatted}%
              </span>
            </div>
          )}

          {effectiveNativeYield !== undefined && (
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <Image
                  src={`/img/symbols/32/color/${chainsArr[props.dropdownSelectedChain].toUpperCase()}.png`}
                  alt="Native Asset"
                  width={16}
                  height={16}
                  className="w-4 h-4"
                />
                <span className="text-xs text-gray-400">Native Yield</span>
              </div>
              <span className="text-xs font-medium text-blue-400">
                +
                {effectiveNativeYield.toLocaleString('en-US', {
                  maximumFractionDigits: 2
                })}
                %
              </span>
            </div>
          )}

          {additionalRewards.map((reward) => (
            <div
              key={reward.name}
              className="flex justify-between items-center gap-4"
            >
              <div className="flex items-center gap-2">
                <Image
                  src={reward.icon}
                  alt={reward.name}
                  width={16}
                  height={16}
                  className="w-4 h-4 rounded"
                />
                <span className="text-xs text-gray-400">{reward.text}</span>
              </div>
            </div>
          ))}

          {(config?.turtle || config?.kelp) && (
            <Link
              href="https://turtle.club/dashboard/?ref=IONIC"
              target="_blank"
              className="flex justify-between items-center gap-4"
            >
              <div className="flex items-center gap-2">
                <Image
                  src={
                    asset === 'STONE'
                      ? '/img/symbols/32/color/stone.png'
                      : config?.kelp
                        ? '/images/turtle-kelp.png'
                        : '/images/turtle-ionic.png'
                  }
                  alt="Turtle"
                  width={16}
                  height={16}
                  className="w-4 h-4 rounded-full"
                />
                <span className="text-xs text-gray-400">TURTLE Rewards</span>
              </div>
              <div className="flex items-center gap-1">
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </div>
            </Link>
          )}

          {showFlywheel && (
            <div className="flex justify-between items-center gap-4">
              <FlyWheelRewards
                cToken={cToken}
                pool={pool}
                poolChainId={dropdownSelectedChain}
                type={type}
                rewards={rewards}
              />
            </div>
          )}

          <div className="h-px bg-gray-700 my-1" />

          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-medium text-gray-300">
                Total APR
              </span>
            </div>
            <span className="text-xs font-medium text-white">
              {props.aprTotal?.toFixed(2)}%
            </span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
