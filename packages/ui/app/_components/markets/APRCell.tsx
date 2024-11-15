// components/APRCell.tsx
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

import type { Address } from 'viem';

import type { FlywheelReward } from '@ionicprotocol/types';

const Rewards = dynamic(() => import('./FlyWheelRewards'), { ssr: false });

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
  rewards
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
  const showRewardsBadge = useRewardsBadge(
    dropdownSelectedChain,
    selectedPoolId,
    asset,
    type,
    rewards
  );

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

  const formatTotalAPR = () => {
    const numericValue = aprTotal ?? 0;
    const prefix = type === 'supply' || numericValue > 0 ? '+' : '';
    return (
      prefix +
      numericValue.toLocaleString('en-US', {
        maximumFractionDigits: type === 'supply' ? 2 : 1
      })
    );
  };

  return (
    <HoverCard openDelay={50}>
      <HoverCardTrigger asChild>
        <div className="flex flex-col items-start cursor-pointer">
          <span>{formatTotalAPR()}%</span>
          <div className="flex flex-col items-start gap-1">
            <span
              className={cn(
                'rounded-md w-max text-[10px] py-[1px] px-3.5',
                config?.ionAPR
                  ? 'bg-accent text-green-900'
                  : 'bg-accent/50 text-green-900'
              )}
            >
              + ION APR
            </span>

            {showRewardsBadge && (
              <span
                className={cn(
                  'rounded-md w-max text-[10px] py-[1px] px-2.5',
                  pools[dropdownSelectedChain].text,
                  pools[dropdownSelectedChain].bg
                )}
              >
                {showOPRewards ? (
                  <div className="flex items-center">
                    +{' '}
                    <Image
                      src="/images/op-logo-red.svg"
                      alt="OP"
                      width={12}
                      height={12}
                      className="inline-block mx-[2px]"
                    />{' '}
                    REWARDS
                  </div>
                ) : (
                  '+ REWARDS'
                )}
              </span>
            )}

            {config?.turtle && !isMainModeMarket && (
              <span className="text-darkone rounded-md w-max md:ml-0 text-center">
                <a
                  className="text-darkone bg-white rounded-md w-max ml-1 md:ml-0 text-center py-[1px] md:px-1 lg:px-3.5 px-1 flex items-center justify-center gap-1 md:text-[10px] text-[8px]"
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
        className="w-80 bg-grayUnselect border-accent"
        align="center"
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span>Base APR: {formatBaseAPR()}%</span>
          </div>

          {showOPRewards && (
            <div className="flex items-center mt-1">
              <Image
                src="/images/op-logo-red.svg"
                alt="OP"
                width={16}
                height={16}
                className="w-4 h-4 mr-1"
              />
              <Link
                href="https://app.merkl.xyz/?chain=34443"
                target="_blank"
                className="text-white underline"
              >
                + OP Rewards:{' '}
                {merklAprForToken?.toLocaleString('en-US', {
                  maximumFractionDigits: 2
                })}
                %
              </Link>
            </div>
          )}

          {config?.underlyingAPR && (
            <p>
              Native Asset Yield: +
              {config.underlyingAPR.toLocaleString('en-US', {
                maximumFractionDigits: 2
              })}
              %
            </p>
          )}

          {config?.flywheel && (
            <Rewards
              cToken={cToken}
              pool={pool}
              poolChainId={dropdownSelectedChain}
              type={type}
              rewards={rewards}
            />
          )}

          {/* Common rewards sections */}
          {(config?.ionic ?? 0) > 0 && (
            <>
              <div className="flex mt-1">
                <Image
                  alt=""
                  src="/img/ionic-sq.png"
                  width={16}
                  height={16}
                  className="size-4 rounded mr-1"
                />
                + {config?.ionic}x Ionic Points
              </div>
              <div className="flex">
                <Image
                  alt=""
                  src="/images/turtle-ionic.png"
                  width={16}
                  height={16}
                  className="size-4 rounded mr-1"
                />
                + Turtle Ionic Points
              </div>
            </>
          )}

          {config?.turtle && asset === 'STONE' && (
            <div className="flex">
              <Image
                alt=""
                src="/img/symbols/32/color/stone.png"
                width={16}
                height={16}
                className="size-4 mr-1"
              />
              + Stone Turtle Points
            </div>
          )}

          {config?.etherfi && (
            <div className="flex">
              <Image
                alt=""
                src="/images/etherfi.png"
                width={16}
                height={16}
                className="size-4 mr-1"
              />
              + {config.etherfi}x ether.fi Points
            </div>
          )}

          {config?.kelp && (
            <>
              <div className="flex">
                <Image
                  alt=""
                  src="/images/kelpmiles.png"
                  width={16}
                  height={16}
                  className="size-4 mr-1"
                />
                + {config.kelp}x Kelp Miles
              </div>
              <div className="flex">
                <Image
                  alt=""
                  src="/images/turtle-renzo.png"
                  width={16}
                  height={16}
                  className="size-4 mr-1"
                />
                + Turtle Kelp Points
              </div>
            </>
          )}

          {config?.eigenlayer && (
            <div className="flex">
              <Image
                alt=""
                src="/images/eigen.png"
                width={16}
                height={16}
                className="size-4 mr-1"
              />
              + EigenLayer Points
            </div>
          )}

          {config?.spice && (
            <div className="flex">
              <Image
                alt=""
                src="/img/symbols/32/color/bob.png"
                width={16}
                height={16}
                className="size-4 mr-1"
              />
              + Spice Points
            </div>
          )}

          {/* Supply-specific rewards */}
          {type === 'supply' && (
            <>
              {(config?.anzen ?? 0) > 0 && (
                <div className="flex mt-1">
                  <Image
                    alt=""
                    src="/img/symbols/32/color/usdz.png"
                    width={16}
                    height={16}
                    className="size-4 rounded mr-1"
                  />
                  + {config?.anzen}x Anzen Points
                </div>
              )}

              {config?.nektar && (
                <div className="flex mt-1">
                  <Image
                    alt=""
                    src="/img/symbols/32/color/nektar.png"
                    width={16}
                    height={16}
                    className="size-4 mr-1"
                  />
                  + Nektar Points
                </div>
              )}
            </>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
