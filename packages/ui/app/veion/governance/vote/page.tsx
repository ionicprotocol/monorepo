'use client';

import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { base, optimism, mode } from 'viem/chains';
import { ArrowLeft } from 'lucide-react';

import NetworkSelector from '@ui/components/markets/NetworkSelector';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@ui/components/ui/card';
import { Switch } from '@ui/components/ui/switch';
import { InfoBlock, EmissionsManagement } from '@ui/components/veion';
import PositionTitle from '@ui/components/veion/PositionTitle';
import { lockedData } from '@ui/constants/mock';
import { EmissionsProvider } from '@ui/context/EmissionsManagementContext';
import { useVeIONContext } from '@ui/context/VeIonContext';

const Vote: React.FC = () => {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || lockedData[0].id;

  const [showPendingOnly, setShowPendingOnly] = useState<boolean>(false);
  const [showAutoOnly, setShowAutoOnly] = useState<boolean>(false);
  const { currentChain } = useVeIONContext();

  const selectedData = useMemo(
    () => lockedData.find((item) => item.id === initialId),
    [initialId]
  );

  const infoBlocksData = useMemo(
    () => [
      {
        label: 'Tokens Locked',
        value: selectedData?.tokensLocked || '',
        icon: null,
        infoContent: `This is the amount of #${initialId} veION you have locked.`
      },
      {
        label: 'Locked Until',
        value: selectedData?.lockExpires.date || '',
        secondaryValue: selectedData?.lockExpires.timeLeft || '',
        icon: null,
        infoContent: `This is the date until your #${initialId} veION is locked.`
      },
      {
        label: 'My Total Voting power',
        value: selectedData?.votingPower || '',
        icon: '/img/logo/ion.svg',
        infoContent: 'This is your current voting power.'
      }
    ],
    [selectedData, initialId]
  );

  return (
    <div className="w-full flex flex-col items-start gap-y-4">
      {selectedData && (
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
                position={selectedData.position}
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
      )}

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
              Auto vote only
            </label>
            <Switch
              id="pending-votes"
              checked={showAutoOnly}
              onCheckedChange={setShowAutoOnly}
              className="data-[state=checked]:bg-green-500 "
              aria-label="Toggle auto votes only"
            />
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
        </CardHeader>
        <CardContent className="border-none">
          <EmissionsProvider>
            <EmissionsManagement
              tokenId={0}
              showAutoOnly={showAutoOnly}
              showPendingOnly={showPendingOnly}
            />
          </EmissionsProvider>
        </CardContent>
      </Card>
    </div>
  );
};

export default Vote;
