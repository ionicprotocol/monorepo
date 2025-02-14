'use client';

import { useState } from 'react';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';

import { ExternalLink } from 'lucide-react';
import { base, mode } from 'viem/chains';

import { Button } from '@ui/components/ui/button';
import { Card, CardContent, CardHeader } from '@ui/components/ui/card';
import {
  GetVeIONDialog,
  LPRow,
  AddLiquidityDialog,
  UnstakeIonDialog
} from '@ui/components/veion';
import InfoCardsSection from '@ui/components/veion/InfoCard';
import { useVeIONContext } from '@ui/context/VeIonContext';

const NetworkSelector = dynamic(
  () => import('@ui/components/markets/NetworkSelector'),
  { ssr: false }
);

export default function EnhancedVeIon() {
  const { liquidity, currentChain } = useVeIONContext();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddLiquidityOpen, setIsAddLiquidityOpen] = useState(false);
  const [isMigrateOpen, setIsMigrateOpen] = useState(false);

  const selectedtoken = currentChain === 8453 ? 'eth' : 'mode';

  return (
    <div className="min-h-screen py-12">
      <Card className="lg:w-[60%] w-[80%] lg:p-8 text-white bg-gradient-to-br from-grayone to-black backdrop-blur-lg mx-auto my-6 border border-white/10 shadow-2xl">
        <CardHeader className="xl:text-xl text-2xl font-semibold space-y-5 p-0">
          <div className="flex items-center justify-between w-full">
            <div className="relative">
              <Image
                className="size-16 relative transform transition-all duration-500 hover:scale-110"
                src="/img/assets/db.svg"
                alt="ion logo"
                width={32}
                height={32}
              />
            </div>
          </div>

          <div className="flex justify-between gap-2 items-center">
            <div className="flex items-center gap-1 text-2xl">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-accent font-bold">
                Participate in
              </span>{' '}
              <Link
                href="https://doc.ionic.money/ionic-documentation/tokenomics/stage-2-usdion/veion"
                className="text-accent flex items-center hover:underline group"
                target="_blank"
              >
                Emissions
                <ExternalLink
                  className="ml-1 group-hover:translate-x-1 transition-transform duration-300"
                  size={24}
                />
              </Link>
            </div>
            <NetworkSelector
              dropdownSelectedChain={currentChain}
              nopool={true}
              enabledChains={[mode.id, base.id]}
            />
          </div>
        </CardHeader>

        <CardContent className="h-full text-white/60 grid grid-cols-6 xl:gap-4 gap-3 md:gap-y-7 gap-y-3 *:text-xs p-0 pt-6">
          <InfoCardsSection />

          <div className="col-span-6 space-y-6">
            <LPRow
              summary={{
                title: 'TOTAL LP',
                amount: liquidity.total.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              }}
              detail={{
                title: 'PROVIDE LP ON DEX',
                buttonText: 'Add Liquidity',
                onClick: () => setIsAddLiquidityOpen(true),
                get: 'vAMM'
              }}
              chain={currentChain}
            />

            <LPRow
              summary={{
                title: 'STAKED LP',
                amount: liquidity.staked.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              }}
              detail={{
                title: 'UNSTAKE YOUR LP',
                buttonText: 'Unstake LP',
                onClick: () => setIsMigrateOpen(true),
                get: 'vAMM'
              }}
              chain={currentChain}
            />

            <LPRow
              summary={{
                title: 'LOCKED LP',
                amount: liquidity.locked.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              }}
              detail={{
                title: 'Restake and Lock your ION LP',
                buttonText: 'Get veION',
                onClick: () => setIsDialogOpen(true),
                get: 'veION'
              }}
              chain={currentChain}
            />
          </div>
        </CardContent>

        <Link
          href="/veion/governance"
          className="mt-8 block"
        >
          <Button className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-lg font-semibold py-6 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
            My veION
          </Button>
        </Link>

        <AddLiquidityDialog
          isOpen={isAddLiquidityOpen}
          onOpenChange={setIsAddLiquidityOpen}
          selectedToken={selectedtoken as 'eth' | 'mode' | 'weth'}
        />
        <UnstakeIonDialog
          isOpen={isMigrateOpen}
          onOpenChange={setIsMigrateOpen}
          selectedToken={selectedtoken as 'eth' | 'mode' | 'weth'}
        />
        <GetVeIONDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          selectedToken={selectedtoken as 'eth' | 'mode' | 'weth'}
        />
      </Card>
    </div>
  );
}
