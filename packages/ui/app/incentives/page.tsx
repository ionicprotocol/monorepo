'use client';

import { useState } from 'react';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

import { base } from 'wagmi/chains';

import { Card, CardContent } from '@ui/components/ui/card';
import EpochInfo from '@ui/components/veion/EpochInfo';
import MarketSelector from '@ui/components/veion/MarketSelector';

export default function IncentivesPage() {
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const searchParams = useSearchParams();
  const queryChain = searchParams.get('chain');
  const chain = queryChain || base.id.toString();

  return (
    <div className="min-h-screen">
      <Card className="w-[80%] lg:p-8 text-white bg-gradient-to-br from-grayone to-black backdrop-blur-lg mx-auto my-6 border border-white/10 shadow-2xl">
        <CardContent className="p-0 pt-6 space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <Image
              src="/img/logo/ion.svg"
              alt="ION"
              width={48}
              height={48}
              className="rounded-full transform transition-all duration-500 hover:scale-110"
            />
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-accent">
              Incentivize Markets
            </h1>
            <p className="text-white/60 text-center max-w-md text-sm">
              Add incentives to attract votes to your chosen market or pool and
              boost governance influence.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <MarketSelector isAcknowledged={isAcknowledged} />
            <EpochInfo
              isAcknowledged={isAcknowledged}
              setIsAcknowledged={setIsAcknowledged}
              chain={chain}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
