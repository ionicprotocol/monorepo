'use client';

import React, { useMemo, useState } from 'react';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { ArrowLeft } from 'lucide-react';

import { Badge } from '@ui/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@ui/components/ui/card';
import { Switch } from '@ui/components/ui/switch';
import { InfoBlock, VotesManagement } from '@ui/components/veion';
import PositionTitle from '@ui/components/veion/PositionTitle';
import {
  MarketDataProvider,
  useMarketData
} from '@ui/context/MarketDataContext';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { VotesProvider } from '@ui/context/VotesContext';

const Vote = () => {
  const searchParams = useSearchParams();
  const { locks } = useVeIONContext();
  const initialId = searchParams.get('id');

  const [showPendingOnly, setShowPendingOnly] = useState(false);

  const selectedData = useMemo(() => {
    if (!initialId) return locks.myLocks[0];
    return (
      locks.myLocks.find((lock) => lock.id === initialId) || locks.myLocks[0]
    );
  }, [initialId, locks.myLocks]);

  const infoBlocksData = useMemo(() => {
    if (!selectedData) return [];

    return [
      {
        label: 'Tokens Locked',
        value: selectedData.tokensLocked,
        icon: null,
        infoContent: `This is the amount of #${selectedData.id} veION you have locked.`
      },
      {
        label: 'Locked Until',
        value: selectedData.lockExpires.isPermanent ? (
          <Badge className="text-xs font-medium">Permanent</Badge>
        ) : (
          selectedData.lockExpires.date
        ),
        secondaryValue: !selectedData.lockExpires.isPermanent
          ? selectedData.lockExpires.timeLeft
          : undefined,
        icon: null,
        infoContent: `This is the date until your #${selectedData.id} veION is locked.`
      },
      {
        label: 'My Total Voting power',
        value: selectedData.votingPower.toString(),
        icon: '/img/logo/ion.svg',
        infoContent: 'This is your current voting power.'
      }
    ];
  }, [selectedData]);

  if (locks.isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-48">
        Loading...
      </div>
    );
  }

  if (!selectedData) {
    return (
      <div className="w-full flex justify-center items-center h-48">
        No locks found
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-start gap-y-4">
      <Card className="w-full bg-grayone">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Link
              href="/veion/governance"
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-700/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white/80" />
            </Link>
            <PositionTitle
              chainId={selectedData.chainId}
              position={selectedData.id}
              size="lg"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            {infoBlocksData.map((block) => (
              <InfoBlock
                key={block.label}
                block={block}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <VotingManagementWrapper tokenId={+selectedData.id} />
    </div>
  );
};

const VotingManagementWrapper = ({ tokenId }: { tokenId: number }) => {
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const { votingPeriod, isLoading } = useMarketData();

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-48">
        Loading...
      </div>
    );
  }

  // Only show the toggle if there's an active voting period
  const showToggle =
    votingPeriod && !votingPeriod.hasVoted && votingPeriod.nextVotingDate;

  return (
    <Card
      className="w-full"
      style={{ backgroundColor: '#212126ff' }}
    >
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
        <CardTitle>Emissions Management</CardTitle>
        {showToggle && (
          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            <label
              htmlFor="pending-votes"
              className="text-sm text-white/80 pl-4"
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
        )}
      </CardHeader>
      <CardContent className="border-none">
        <MarketDataProvider tokenId={tokenId}>
          <VotesProvider>
            <VotesManagement
              tokenId={tokenId}
              showPendingOnly={showPendingOnly}
            />
          </VotesProvider>
        </MarketDataProvider>
      </CardContent>
    </Card>
  );
};

export default Vote;
