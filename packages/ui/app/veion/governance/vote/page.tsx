'use client';

import React, { useEffect } from 'react';

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
import { InfoBlock } from '@ui/components/veion';
import PositionTitle from '@ui/components/veion/PositionTitle';
import VotesManagement from '@ui/components/veion/VotesManagement';
import { useVeIONContext } from '@ui/context/VeIonContext';
import {
  useVeIonVoteContext,
  VeIonVoteProvider
} from '@ui/context/VeIonVoteContext';
import { VotesProvider } from '@ui/context/VotesContext';

const Vote = () => {
  const searchParams = useSearchParams();
  const { locks, selectedManagePosition, setSelectedManagePosition } =
    useVeIONContext();

  const initialId = searchParams.get('id');

  // Set initial position when component mounts or when locks/initialId changes
  useEffect(() => {
    if (
      (!selectedManagePosition && locks.myLocks.length > 0) ||
      selectedManagePosition?.id !== initialId
    ) {
      const position = initialId
        ? locks.myLocks.find((lock) => lock.id === initialId)
        : locks.myLocks[0];

      if (position) {
        setSelectedManagePosition(position);
      }
    }
  }, [
    initialId,
    locks.myLocks,
    selectedManagePosition,
    setSelectedManagePosition
  ]);

  const infoBlocksData = React.useMemo(() => {
    if (!selectedManagePosition) return [];

    return [
      {
        label: 'Tokens Locked',
        value: selectedManagePosition.tokensLocked,
        icon: null,
        infoContent: `This is the amount of #${selectedManagePosition.id} veION you have locked.`
      },
      {
        label: 'Locked Until',
        value: selectedManagePosition.lockExpires.isPermanent ? (
          <Badge className="text-xs font-medium">Permanent</Badge>
        ) : (
          selectedManagePosition.lockExpires.date
        ),
        secondaryValue: !selectedManagePosition.lockExpires.isPermanent
          ? selectedManagePosition.lockExpires.timeLeft
          : undefined,
        icon: null,
        infoContent: `This is the date until your #${selectedManagePosition.id} veION is locked.`
      },
      {
        label: 'My Total Voting power',
        value: selectedManagePosition.votingPower.toString(),
        icon: '/img/logo/ion.svg',
        infoContent: 'This is your current voting power.'
      }
    ];
  }, [selectedManagePosition]);

  if (locks.isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-48">
        Loading positions...
      </div>
    );
  }

  if (!selectedManagePosition && locks.myLocks.length === 0) {
    return (
      <div className="w-full flex justify-center items-center h-48">
        No locks found
      </div>
    );
  }

  if (!selectedManagePosition) {
    return (
      <div className="w-full flex justify-center items-center h-48">
        Loading position details...
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-start gap-y-4">
      <Card className="w-full bg-grayone">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Link
              href={`/veion/governance?chain=${selectedManagePosition.chainId}`}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-700/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white/80" />
            </Link>
            <PositionTitle
              chainId={selectedManagePosition.chainId}
              position={selectedManagePosition.id}
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

      <VotingManagementWrapper tokenId={+selectedManagePosition.id} />
    </div>
  );
};

const VotingManagementWrapper = ({ tokenId }: { tokenId: number }) => {
  const [showPendingOnly, setShowPendingOnly] = React.useState(false);
  const { votingPeriod } = useVeIonVoteContext();

  if (votingPeriod.isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-48">
        Loading voting data...
      </div>
    );
  }

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
        <VeIonVoteProvider tokenId={tokenId}>
          <VotesProvider>
            <VotesManagement
              tokenId={tokenId}
              showPendingOnly={showPendingOnly}
            />
          </VotesProvider>
        </VeIonVoteProvider>
      </CardContent>
    </Card>
  );
};

export default Vote;
