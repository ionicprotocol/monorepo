'use client';

import { useState } from 'react';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

import { ExternalLink, LockIcon } from 'lucide-react';
import { base, mode, optimism } from 'viem/chains';
import { useChainId } from 'wagmi';

import { Card, CardContent, CardHeader } from '@ui/components/ui/card';

import {
  GetVeIonDialog,
  LPRow,
  InfoCard,
  AddLiquidityDialog,
  MigrateIonDialog
} from '../_components/veion';
import { Button } from '@ui/components/ui/button';
import Link from 'next/link';

const NetworkSelector = dynamic(
  () => import('../_components/markets/NetworkSelector'),
  {
    ssr: false
  }
);

export default function VeIon() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddLiquidityOpen, setIsAddLiquidityOpen] = useState(false);
  const [isMigrateOpen, setIsMigrateOpen] = useState(false);

  const chainId = useChainId();
  const searchParams = useSearchParams();
  const querychain = searchParams.get('chain');
  const queryToken = searchParams.get('token');
  const selectedtoken = queryToken ?? 'eth';
  const chain = querychain ? querychain : String(chainId);

  return (
    <Card className="lg:w-[60%] w-[80%] lg:p-8 text-white bg-grayone mx-auto my-6">
      <CardHeader className="xl:text-xl text-2xl font-semibold space-y-5 p-0">
        <div className="flex items-center justify-between w-full">
          <Image
            className="size-16"
            src="/img/assets/db.svg"
            alt="ion logo"
            width={32}
            height={32}
          />

          <div className="flex gap-2">
            <Button
              asChild
              className="col-span-3 bg-accent text-black hover:-translate-y-1 hover:bg-accent/90"
            >
              <Link href="/veion/governance?watch=myveion">Governance</Link>
            </Button>
            <NetworkSelector
              dropdownSelectedChain={+chain}
              nopool={true}
              enabledChains={[mode.id, base.id, optimism.id]}
            />
          </div>
        </div>

        <div className="flex items-center gap-1 text-2xl">
          Participate in{' '}
          <span className="text-accent flex items-center">
            Emissions{' '}
            <ExternalLink
              className="ml-1"
              size={24}
            />
          </span>
        </div>
      </CardHeader>
      <CardContent className="h-full text-white/60 grid grid-cols-6 xl:gap-4 gap-3 md:gap-y-7 gap-y-3 *:text-xs p-0 pt-6">
        {/* Info Cards */}
        <InfoCard
          text="Incentivize Markets on your favorite Chain with Liquidity Gauges"
          href={`/veion/incentives?chain=${chain}&token=${selectedtoken}`}
        />
        <InfoCard text="Significantly boost your collateral pool depth with bribes" />
        <InfoCard text="Increase Emissions and earn POL for your Treasury" />

        {/* LP Rows */}
        <div className="col-span-6 space-y-4">
          <LPRow
            summary={{
              title: 'TOTAL LP',
              amount: '$1,234,432.21'
            }}
            detail={{
              title: 'PROVIDE LP ON DEX',
              buttonText: 'Add Liquidity',
              onClick: () => setIsAddLiquidityOpen(true),
              get: 'vAMM'
            }}
          />

          <LPRow
            summary={{
              title: 'STAKED LP',
              amount: '$1,234,432.21',
              Icon: <LockIcon className="size-4 inline-block" />
            }}
            detail={{
              title: 'MIGRATE YOUR STAKED LP',
              buttonText: 'Migrate LP',
              onClick: () => setIsMigrateOpen(true),
              get: 'vAMM'
            }}
          />

          <LPRow
            summary={{
              title: 'LOCKED LP',
              amount: '$113,029.98'
            }}
            detail={{
              title: 'LOCK YOUR ION LP',
              buttonText: 'Lock and Get',
              onClick: () => setIsDialogOpen(true),
              get: 'veION'
            }}
          />
        </div>
      </CardContent>

      <GetVeIonDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        chain={+chain}
        selectedToken={selectedtoken as 'eth' | 'mode' | 'weth'}
      />
      <AddLiquidityDialog
        isOpen={isAddLiquidityOpen}
        onOpenChange={setIsAddLiquidityOpen}
        chain={+chain}
        selectedToken={selectedtoken as 'eth' | 'mode' | 'weth'}
      />

      <MigrateIonDialog
        isOpen={isMigrateOpen}
        onOpenChange={setIsMigrateOpen}
        chain={chain}
      />
    </Card>
  );
}
