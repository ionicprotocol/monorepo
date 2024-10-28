'use client';

import { useSearchParams } from 'next/navigation';
import { useChainId } from 'wagmi';
import CustomTooltip from '@ui/app/_components/CustomTooltip';
import NetworkSelector from '@ui/app/_components/markets/NetworkSelector';
import FlatMap from '@ui/app/_components/points_comp/FlatMap';
import ToggleLinks from '@ui/app/_components/ToggleLink';
import {
  MyVeionTable,
  DelegateVeIonTable,
  GovernanceHeader
} from '@ui/app/_components/veion';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@ui/components/ui/card';
import { lockedData, lockedDataWithDelegate } from '@ui/constants/mock';

export default function Governance() {
  const searchParams = useSearchParams();
  const chainId = useChainId();
  const querychain = searchParams.get('chain');
  const queryview = searchParams.get('view');
  const chain = querychain ?? String(chainId);
  const view = queryview ?? 'MyVeion';

  const infoBlocks = [
    {
      label: 'Ion Wallet Balance',
      value: view === 'MyVeion' ? 78942387 : 6376,
      token: 'ION',
      infoContent: 'This is the amount of ION you have in your wallet.',
      icon: '/img/symbols/32/color/ion.png'
    },
    {
      label: 'Total veION',
      value: view === 'MyVeion' ? 5674 : 63754,
      token: 'veION',
      infoContent: 'This is the amount of veION you have in your wallet.',
      icon: '/img/symbols/32/color/ion.png'
    }
  ];

  return (
    <div className="w-full flex flex-col items-start gap-y-4">
      {/* First Card - Now with VeIONHeader */}
      <GovernanceHeader view={view} />

      <NetworkSelector
        nopool={true}
        dropdownSelectedChain={+chain}
      />

      {/* Second Card */}
      <Card className="w-full bg-grayone">
        <CardHeader>
          <div className="flex w-full items-center justify-between mb-4">
            <span className="text-lg font-semibold">5 veION</span>
            <span className="text-xs flex flex-col text-right">
              My Voting Power : 1134
              <span className="text-white/50 text-xs">10% of all veION</span>
            </span>
          </div>
          <div className="my-3 w-full">
            <FlatMap />
          </div>
        </CardHeader>
        <CardContent className="border-none">
          <div className="flex justify-start">
            <div className="bg-grayUnselect rounded-md mb-3 inline-block">
              <ToggleLinks
                arrText={['MyVeion', 'Delegate veION']}
                baseUrl="/veion/governance"
                currentChain={chain}
              />
            </div>
          </div>

          {view === 'MyVeion' ? (
            <MyVeionTable data={lockedData} />
          ) : (
            <DelegateVeIonTable data={lockedDataWithDelegate} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
