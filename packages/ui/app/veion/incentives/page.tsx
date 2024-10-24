// app/veion/incentives/page.tsx
'use client';

import { useState } from 'react';

import Image from 'next/image';

import { MarketSelector, EpochInfo } from '@ui/app/_components/veion';
import { Card, CardContent } from '@ui/components/ui/card';

export default function IncentivesPage() {
  const [isAcknowledged, setIsAcknowledged] = useState(false);

  return (
    <div className="container mx-auto my-6 space-y-6">
      <Card className="bg-grayone">
        <CardContent className="flex flex-col items-center p-6 space-y-2">
          <h1 className="text-2xl font-semibold flex items-center justify-center gap-2">
            <Image
              src="/img/logo/ION.png"
              alt="ION"
              width={32}
              height={32}
              className="rounded-full"
            />
            Incentivize
          </h1>
          <p className="text-white/60 text-center">
            ADD INCENTIVES TO ATTRACT TO MORE VOTES TOWARDS THE MARKET AND/OR
            POOL OF YOUR CHOICE.
          </p>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <MarketSelector isAcknowledged={isAcknowledged} />
        <EpochInfo
          isAcknowledged={isAcknowledged}
          setIsAcknowledged={setIsAcknowledged}
        />
      </div>
    </div>
  );
}
