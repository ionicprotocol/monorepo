'use client';

import React, { useState } from 'react';

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
import { infoBlocks } from '@ui/constants/mock';
import { useVeIONContext } from '@ui/context/VeIonContext';

const PLACEHOLDER_OPTIONS = [
  { id: 1, label: 'veION #21', value: '21' },
  { id: 2, label: 'veION #22', value: '22' },
  { id: 3, label: 'veION #23', value: '23' }
];

const Vote: React.FC = () => {
  const [showPendingOnly, setShowPendingOnly] = useState<boolean>(false);
  const [selectedProposal, setSelectedProposal] = useState(
    PLACEHOLDER_OPTIONS[0].value
  );
  const { currentChain } = useVeIONContext();

  return (
    <div className="w-full flex flex-col items-start gap-y-4">
      <Card className="w-full bg-grayone">
        <CardHeader>
          <div className="w-fit">
            <Select
              value={selectedProposal}
              onValueChange={(value) => setSelectedProposal(value)}
            >
              <SelectTrigger className="border-0 outline-none p-0 bg-transparent hover:bg-transparent">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-semibold">
                    {
                      PLACEHOLDER_OPTIONS.find(
                        (opt) => opt.value === selectedProposal
                      )?.label
                    }
                  </h2>
                </div>
              </SelectTrigger>
              <SelectContent
                className="bg-grayUnselect border-white/10 min-w-[200px] w-fit"
                align="start"
              >
                {PLACEHOLDER_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.id}
                    value={option.value}
                    className="focus:bg-accent/20 focus:text-white"
                  >
                    <span className="text-xl font-semibold">
                      {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
