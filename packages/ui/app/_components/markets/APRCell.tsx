import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';

import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent
} from '@ui/components/ui/hover-card';
import { pools } from '@ui/constants';
import { useMerklApr } from '@ui/hooks/useMerklApr';
import { useRewardsBadge } from '@ui/hooks/useRewardsBadge';
import { cn } from '@ui/lib/utils';
import { multipliers } from '@ui/utils/multipliers';

import { RewardIcons } from './RewardsIcon';

import type { Address } from 'viem';

import type { FlywheelReward } from '@ionicprotocol/types';

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
  nativeAssetYield
}: APRCellProps) {
  const isMainModeMarket =
    dropdownSelectedChain === 34443 &&
    (asset === 'USDC' || asset === 'WETH') &&
    selectedPoolId === '0';

  const { data: merklApr } = useMerklApr();
  const merklAprForToken = merklApr?.find(
    (a) => Object.keys(a)[0].toLowerCase() === cToken.toLowerCase()
  )?.[cToken];

  const config =
    multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]?.[type];

  const effectiveNativeYield =
    nativeAssetYield !== undefined
      ? nativeAssetYield * 100
      : config?.underlyingAPR;

  const showRewardsBadge = useRewardsBadge(
    dropdownSelectedChain,
    selectedPoolId,
    asset,
    type,
    rewards
  );
  // console.log('asset', asset);
  // console.log('showRewardsBadge', showRewardsBadge);

  const showOPRewards = merklAprForToken || asset === 'dMBTC';

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

  const RewardRow = ({ icon, text }: { icon: string; text: string }) => (
    <div className="flex items-center gap-2 py-0.5">
      <Image
        alt=""
        src={icon}
        width={16}
        height={16}
        className="size-4 rounded"
      />
      <span className="text-sm">{text}</span>
    </div>
  );

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
        maximumFractionDigits: type === 'supply' ? 2 : 1
      })
    );
  };

  const getRewardIcons = () => {
    const icons: string[] = [];

    if (showOPRewards) icons.push('op');
    if (config?.ionic) icons.push('ionic');
    if (config?.turtle) icons.push('turtle');
    if (config?.etherfi) icons.push('etherfi');
    if (config?.kelp) icons.push('kelp');
    if (config?.eigenlayer) icons.push('eigen');
    if (config?.spice) icons.push('spice');
    if (type === 'supply') {
      if (config?.anzen) icons.push('anzen');
      if (config?.nektar) icons.push('nektar');
    }

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
                'rounded-md w-max text-[10px] py-[3px] px-1.5',
                config?.ionAPR
                  ? 'bg-accent text-green-900'
                  : 'bg-accent/50 text-green-900'
              )}
            >
              + ION APR
            </span>

            {(showRewardsBadge || nativeAssetYield !== undefined) && (
              <div
                className={cn(
                  'rounded-md w-max py-[3px] px-1.5 flex items-center gap-1',
                  'font-light text-[10px]',
                  pools[dropdownSelectedChain].text,
                  pools[dropdownSelectedChain].bg
                )}
              >
                <span>+ Rewards</span>
                <RewardIcons rewards={getRewardIcons()} />
              </div>
            )}

            {config?.turtle && !isMainModeMarket && (
              <span className="text-darkone rounded-md w-max md:ml-0 text-center">
                <a
                  className="text-darkone bg-white rounded-md w-max ml-1 md:ml-0 text-center py-[3px] md:px-1 lg:px-1.5 px-1 flex items-center justify-center gap-1 md:text-[10px] text-[8px]"
                  href="https://turtle.club/dashboard/?ref=IONIC"
                  target="_blank"
                  rel="noreferrer"
                >
                  + TURTLE{' '}
                  <Image
                    alt="external-link"
                    src="https://img.icons8.com/material-outlined/24/external-link.png"
                    width={12}
                    height={12}
                    className="w-3 h-3"
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

          {showOPRewards && (
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
                icon="/img/ionic-sq.png"
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
                icon="/images/turtle-renzo.png"
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

          {type === 'supply' && (
            <>
              {(config?.anzen ?? 0) > 0 && (
                <RewardRow
                  icon="/img/symbols/32/color/usdz.png"
                  text={`+ ${config?.anzen}x Anzen Points`}
                />
              )}

              {config?.nektar && (
                <RewardRow
                  icon="/img/symbols/32/color/nektar.png"
                  text="+ Nektar Points"
                />
              )}
            </>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
