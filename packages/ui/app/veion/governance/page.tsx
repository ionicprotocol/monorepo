'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useChainId } from 'wagmi';

import NetworkSelector from '@ui/app/_components/markets/NetworkSelector';
import FlatMap from '@ui/app/_components/points_comp/FlatMap';
import ToggleLinks from '@ui/app/_components/ToggleLink';
import {
  MyVeionTable,
  DelegateVeIonTable,
  GovernanceHeader,
  UniversalClaim
} from '@ui/app/_components/veion';
import { Card, CardHeader, CardContent } from '@ui/components/ui/card';
import { lockedData, lockedDataWithDelegate } from '@ui/constants/mock';
import { base, optimism, mode } from 'viem/chains';

export default function Governance() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chainId = useChainId();

  const querychain = searchParams.get('chain');
  const queryview = searchParams.get('view');
  const chain = querychain ?? String(chainId);
  const view = queryview ?? 'My veION';

  useEffect(() => {
    if (!querychain) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('chain', String(chainId));

      if (queryview) {
        newSearchParams.set('view', queryview);
      }

      router.replace(`/veion/governance?${newSearchParams.toString()}`);
    }
  }, [chainId, querychain, queryview, router, searchParams]);

  return (
    <div className="w-full flex flex-col items-start gap-y-4">
      {/* First Card - Now with VeIONHeader */}
      <GovernanceHeader view={view} />

      <NetworkSelector
        nopool={true}
        dropdownSelectedChain={+chain}
        enabledChains={[mode.id, base.id, optimism.id]}
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
          <div className="w-full flex justify-between items-center">
            <div className="bg-grayUnselect rounded-md mb-3 inline-block">
              <ToggleLinks
                arrText={['My veION', 'Delegate veION']}
                baseUrl="/veion/governance"
                currentChain={chain}
              />
            </div>
            {view === 'My veION' && <UniversalClaim />}
          </div>

          {view === 'My veION' ? (
            <MyVeionTable data={lockedData} />
          ) : (
            <DelegateVeIonTable data={lockedDataWithDelegate} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
