'use client';

import React, { useMemo, useState } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { base, optimism, mode } from 'viem/chains';

import NetworkSelector from '@ui/app/_components/markets/NetworkSelector';
import FlatMap from '@ui/app/_components/points_comp/FlatMap';
import { InfoBlock, EmissionsManagementTable } from '@ui/app/_components/veion';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@ui/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from '@ui/components/ui/select';
import { Switch } from '@ui/components/ui/switch';
import { lockedData } from '@ui/constants/mock';
import { useVeIONContext } from '@ui/context/VeIonContext';

const Vote: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || lockedData[0].id;

  const [showPendingOnly, setShowPendingOnly] = useState<boolean>(false);
  const [showAutoOnly, setShowAutoOnly] = useState<boolean>(false);
  const [selectedProposal, setSelectedProposal] = useState(initialId);
  const { currentChain } = useVeIONContext();

  const selectedData = useMemo(
    () => lockedData.find((item) => item.id === selectedProposal),
    [selectedProposal]
  );

  const handleProposalChange = (value: string) => {
    setSelectedProposal(value);

    // Create new URLSearchParams object with current params
    const params = new URLSearchParams(searchParams);
    // Update the id parameter
    params.set('id', value);

    // Update the URL without refreshing the page
    router.replace(`${pathname}?${params.toString()}`);
  };

  const infoBlocksData = useMemo(
    () => [
      {
        label: 'Tokens Locked',
        value: selectedData?.tokensLocked || '',
        icon: null,
        infoContent: `This is the amount of ${selectedProposal} veION you have locked.`
      },
      {
        label: 'Locked Until',
        value: selectedData?.lockExpires.date || '',
        secondaryValue: selectedData?.lockExpires.timeLeft || '',
        icon: null,
        infoContent: `This is the date until your ${selectedProposal} veION is locked.`
      },
      {
        label: 'Voting Power',
        value: selectedData?.votingPower || '',
        icon: '/img/logo/ion.svg',
        infoContent: 'This is your current voting power.'
      }
    ],
    [selectedData, selectedProposal]
  );

  return (
    <div className="w-full flex flex-col items-start gap-y-4">
      <Card className="w-full bg-grayone">
        <CardHeader>
          <div className="w-fit">
            <Select
              value={selectedProposal}
              onValueChange={handleProposalChange}
            >
              <SelectTrigger className="border-0 outline-none p-0 bg-transparent hover:bg-transparent">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-semibold">{selectedData?.id}</h2>
                </div>
              </SelectTrigger>
              <SelectContent
                className="bg-grayUnselect border-white/10 min-w-[200px] w-fit"
                align="start"
              >
                {lockedData.map((option) => (
                  <SelectItem
                    key={option.id}
                    value={option.id}
                    className="focus:bg-accent/20 focus:text-white"
                  >
                    <span className="text-xl font-semibold">{option.id}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

      <NetworkSelector
        nopool={true}
        dropdownSelectedChain={+currentChain}
        enabledChains={[mode.id, base.id, optimism.id]}
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
              Auto vote only
            </label>
            <Switch
              id="pending-votes"
              checked={showAutoOnly}
              onCheckedChange={setShowAutoOnly}
              className="data-[state=checked]:bg-green-500 "
              aria-label="Toggle pending votes only"
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
          <div className="my-3 w-full">
            <FlatMap />
          </div>
          <EmissionsManagementTable tokenId={0} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Vote;
