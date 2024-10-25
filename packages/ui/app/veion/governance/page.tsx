/* eslint-disable @next/next/no-img-element */
'use client';

import { useSearchParams } from 'next/navigation';

import { useChainId } from 'wagmi';

import NetworkSelector from '@ui/app/_components/markets/NetworkSelector';
import FlatMap from '@ui/app/_components/points_comp/FlatMap';
import ToggleLinks from '@ui/app/_components/ToggleLink';
import InfoPopover from '@ui/app/_components/veion/InfoPopover';
import VeionRow from '@ui/app/_components/veion/VeionRow';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@ui/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell
} from '@ui/components/ui/table';
import { lockedData, lockedDataWithDelegate } from '@ui/constants/mock';

export default function Governance() {
  const searchParams = useSearchParams();
  const chainId = useChainId();

  const querywatch = searchParams.get('watch');
  const querychain = searchParams.get('chain');
  const queryview = searchParams.get('view');
  const chain = querychain ?? String(chainId);
  const watch = querywatch ?? 'overview';
  const view = queryview ?? 'MyVeion';

  const infoBlocks = [
    {
      label: 'Ion Wallet Balance',
      value: watch === 'overview' ? '78942387 ION' : '6376 ION',
      infoContent: 'This is the amount of ION you have in your wallet.',
      icon: '/img/symbols/32/color/ion.png'
    },
    {
      label: 'Total veION',
      value: watch === 'overview' ? '5674 veION' : '63754 veION',
      infoContent: 'This is the amount of veION you have in your wallet.',
      icon: '/img/symbols/32/color/ion.png'
    }
  ];

  return (
    <div className="w-full flex flex-col items-start py-4 gap-y-2 bg-darkone">
      {/* First Card */}
      <Card className="w-full">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>
            {watch === 'overview' ? 'veION Overview' : 'My VeION'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-x-3">
            {infoBlocks.map((block) => (
              <div
                key={block.label}
                className="flex flex-col gap-1 mt-3"
              >
                <div className="text-white/60 text-xs flex items-center">
                  {block.label}
                  <InfoPopover content={block.infoContent} />
                </div>
                <div className="text-white/60 text-xs flex items-center">
                  <img
                    alt="ion logo"
                    className="w-6 h-6 inline-block"
                    src={block.icon}
                  />
                  <span className="text-white text-sm ml-1">{block.value}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <NetworkSelector
        nopool={true}
        dropdownSelectedChain={+chain}
      />

      {/* Second Card */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex w-full items-center justify-between mb-4">
            <span className="text-lg font-semibold">5 veION</span>
            <span className="text-xs flex flex-col">
              My Voting Power : 1134
              <span className="text-white/50 text-xs">10% of all veION</span>
            </span>
          </div>
          <div className="my-3 w-full">
            <FlatMap />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-start">
            <div className="bg-grayUnselect rounded-md mb-3 inline-block">
              <ToggleLinks
                arrText={['MyVeion', 'Delegate veION']}
                baseUrl="/veion/governance"
              />
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>TOKENS LOCKED</TableCell>
                <TableCell>LOCKED BLP</TableCell>
                <TableCell>LOCK EXPIRES</TableCell>
                <TableCell>VOTING POWER</TableCell>
                {view === 'Delegate veION' && (
                  <TableCell>DELEGATED TO</TableCell>
                )}
                <TableCell>NETWORK</TableCell>
                <TableCell>ACTION</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {view === 'MyVeion' &&
                lockedData.map((data, idx) => (
                  <VeionRow
                    key={`${data.id}-${idx}`}
                    data={data}
                    viewType="MyVeion"
                  />
                ))}
              {view === 'Delegate veION' &&
                lockedDataWithDelegate.map((data, idx) => (
                  <VeionRow
                    key={`${data.id}-${idx}`}
                    data={data}
                    viewType="Delegate veION"
                  />
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
