'use client';

import React, { useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { useChainId } from 'wagmi';

import NetworkSelector from '@ui/app/_components/markets/NetworkSelector';
import FlatMap from '@ui/app/_components/points_comp/FlatMap';
import { InfoBlock, EmissionsManagementTable } from '@ui/app/_components/veion';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@ui/components/ui/card';
import { Switch } from '@ui/components/ui/switch';
import { infoBlocks, votingData } from '@ui/constants/mock';

const Vote: React.FC = () => {
  const [showPendingOnly, setShowPendingOnly] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const chainId = useChainId();
  const querychain = searchParams.get('chain');
  const chain = querychain ?? String(chainId);

  return (
    <div className="w-full flex flex-col items-start gap-y-4">
      <Card className="w-full bg-grayone">
        <CardHeader>
          <CardTitle>Vote</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            {infoBlocks.map((block) => (
              <InfoBlock
                key={block.label}
                block={block}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <NetworkSelector
        nopool={true}
        dropdownSelectedChain={+chain}
      />

      <Card
        className="w-full"
        style={{ backgroundColor: '#212126ff' }}
      >
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
          <CardTitle>Emissions Management</CardTitle>
          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            <label
              htmlFor="pending-votes"
              className="text-sm text-white/80"
            >
              Pending votes only
            </label>
            <Switch
              id="pending-votes"
              checked={showPendingOnly}
              onCheckedChange={setShowPendingOnly}
              className="data-[state=checked]:bg-green-500"
              aria-label="Toggle pending votes only"
            />
          </div>
        </CardHeader>
        <CardContent className="border-none">
          <div className="my-3 w-full">
            <FlatMap />
          </div>
          <EmissionsManagementTable
            data={votingData}
            chainId={+chain}
            tokenId={0}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Vote;
