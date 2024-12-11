import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';

import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent
} from '@ui/components/ui/hover-card';
import { pools } from '@ui/constants';
import { useRewardsBadge } from '@ui/hooks/useRewardsBadge';
import { cn } from '@ui/lib/utils';
import { multipliers } from '@ui/utils/multipliers';

import { RewardIcons } from './RewardsIcon';

import type { Address, Hex } from 'viem';

import type { FlywheelReward } from '@ionicprotocol/types';
import { useMerklData } from '@ui/hooks/useMerklData';

const FlyWheelRewards = dynamic(() => import('./FlyWheelRewards'), {
  ssr: false
});

export type APRCellProps = {
  type: 'borrow' | 'supply';
  aprTotal: number | undefined;
  baseAPR: number;
  asset: string;
  cToken: Address;
  dropdownSelectedChain: number;
  pool: Address;
  selectedPoolId: string;
  rewards?: FlywheelReward[];
  nativeAssetYield?: number;
  underlyingToken: Hex;
};

export default function APRCell({
  type,
  aprTotal,
  baseAPR,
  asset,
  cToken,
  dropdownSelectedChain,
  pool,
  selectedPoolId,
  rewards,
  nativeAssetYield,
  underlyingToken
}: APRCellProps) {
  const { data: merklApr } = useMerklData();
  const merklAprForToken = merklApr?.find(
    (a) => Object.keys(a)[0].toLowerCase() === underlyingToken.toLowerCase()
  )?.[underlyingToken];

  const config =
    multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]?.[type];
  const showRewardsBadge = useRewardsBadge(
    dropdownSelectedChain,
    selectedPoolId,
    asset,
    type,
    rewards
  );

  const effectiveNativeYield =
    nativeAssetYield !== undefined
      ? nativeAssetYield * 100
      : config?.underlyingAPR;

  const formatBaseAPR = () => {
    if (type === 'borrow' && baseAPR > 0)
      return (
        '-' + baseAPR.toLocaleString('en-US', { maximumFractionDigits: 2 })
      );
    return (
      (type === 'supply' ? '+' : '') +
      baseAPR.toLocaleString('en-US', { maximumFractionDigits: 2 })
    );
  };

  const formatTotalAPR = () => {
    let total = aprTotal ?? 0;
    // Add native yield to total if it exists
    if (effectiveNativeYield) {
      total += effectiveNativeYield;
    }

    const prefix = type === 'supply' || total > 0 ? '+' : '';
    return (
      prefix +
      total.toLocaleString('en-US', {
        maximumFractionDigits: 2
      })
    );
  };

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

  const getRewardIcons = () => {
    const icons: string[] = [];

    // Add asset logo as the first icon if showing rewards badge or native yield
    if (effectiveNativeYield !== undefined) {
      icons.push(asset.toLowerCase());
    }

    if (config?.op) icons.push('op');
    if (config?.ionic) icons.push('ionic');
    if (config?.etherfi) icons.push('etherfi');
    if (config?.kelp) icons.push('kelp');
    if (config?.eigenlayer) icons.push('eigen');
    if (config?.spice) icons.push('spice');

    return icons;
  };

  return (
    <HoverCard openDelay={50}>
      <HoverCardTrigger asChild>
        <div className="flex flex-col items-start cursor-pointer">
          <span>{formatTotalAPR()}%</span>
          <div className="flex flex-col items-start gap-1">
            <span
              className={cn(
                'rounded-md w-max text-[10px] py-[3px] px-1.5 flex items-center gap-1',
                config?.ionAPR
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
                className="rounded-full"
              />
            </span>

            {(showRewardsBadge || nativeAssetYield !== undefined) && (
              <div
                className={cn(
                  'rounded-md w-max py-[3px] px-1.5 flex items-center gap-1 text-[10px]',
                  pools[dropdownSelectedChain].text,
                  pools[dropdownSelectedChain].bg
                )}
              >
                <span>+ Rewards</span>
                <RewardIcons rewards={getRewardIcons()} />
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
            <span>Base APR: {formatBaseAPR()}%</span>
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
                + OP Rewards:{' '}
                {merklAprForToken?.toLocaleString('en-US', {
                  maximumFractionDigits: 2
                })}
                %
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
          {config?.flywheel && (
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
          {(config?.ionic ?? 0) > 0 && (
            <>
              <RewardRow
                icon="/img/ionic-green-on-black.png"
                text={`+ ${config?.ionic}x Ionic Points`}
              />
              <RewardRow
                icon="/images/turtle-ionic.png"
                text="+ Turtle Ionic Points"
              />
            </>
          )}
          {config?.turtle && asset === 'STONE' && (
            <RewardRow
              icon="/img/symbols/32/color/stone.png"
              text="+ Stone Turtle Points"
            />
          )}
          {config?.etherfi && (
            <RewardRow
              icon="/images/etherfi.png"
              text={`+ ${config.etherfi}x ether.fi Points`}
            />
          )}
          {config?.kelp && (
            <>
              <RewardRow
                icon="/images/kelpmiles.png"
                text={`+ ${config.kelp}x Kelp Miles`}
              />
              <RewardRow
                icon="/images/turtle-kelp.png"
                text="+ Turtle Kelp Points"
              />
            </>
          )}
          {config?.eigenlayer && (
            <RewardRow
              icon="/images/eigen.png"
              text="+ EigenLayer Points"
            />
          )}
          {config?.spice && (
            <RewardRow
              icon="/img/symbols/32/color/bob.png"
              text="+ Spice Points"
            />
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
