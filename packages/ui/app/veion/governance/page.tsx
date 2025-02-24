'use client';

import { useEffect, useState } from 'react';

import { useSearchParams, useRouter } from 'next/navigation';

import { base, mode } from 'viem/chains';

import ActionButton from '@ui/components/ActionButton';
import NetworkSelector from '@ui/components/markets/NetworkSelector';
import ToggleLinks from '@ui/components/ToggleLink';
import { Card, CardHeader, CardContent } from '@ui/components/ui/card';
import UniversalClaimDialog from '@ui/components/UniversalClaimDialog';
import {
  MyVeionTable,
  DelegateVeIonTable,
  GovernanceHeader
} from '@ui/components/veion';
import DelegatedVeionInfo from '@ui/components/veion/DelegatedVeionInfo';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useRewardsAggregator } from '@ui/hooks/rewards/useRewardsAggregator';

export default function Governance() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isUniversalClaimOpen, setIsUniversalClaimOpen] =
    useState<boolean>(false);
  const { emissions } = useVeIONContext();

  const querychain = searchParams.get('chain');
  const queryview = searchParams.get('view');
  const view = queryview ?? 'My veION';
  const chain = querychain ?? '8453';

  const { rewards, isLoading } = useRewardsAggregator();

  const totalRewards = rewards?.length;

  useEffect(() => {
    if (!querychain) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('chain', '8453');
      if (queryview) {
        newSearchParams.set('view', queryview);
      }
      router.replace(`/veion/governance?${newSearchParams.toString()}`);
    }
  }, [querychain, queryview, router, searchParams]);

  return (
    <div className="w-full flex flex-col items-start gap-y-4">
      <GovernanceHeader
        view={view}
        chain={chain}
      />

      <NetworkSelector
        nopool
        dropdownSelectedChain={+chain}
        enabledChains={[base.id, mode.id]}
        upcomingChains={['Optimism']}
      />

      <Card className="w-full bg-grayone">
        <CardHeader className="px-6 pt-6 pb-2">
          <div className="flex w-full items-center justify-between">
            <div className="flex">
              <div className="bg-grayUnselect rounded-md">
                <ToggleLinks
                  arrText={['My veION', 'Delegated veION']}
                  baseUrl="/veion/governance"
                  currentChain={chain}
                />
              </div>
              {view === 'Delegated veION' && <DelegatedVeionInfo />}
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex flex-col text-right min-w-[160px] justify-center">
                <span className="text-xs whitespace-nowrap">
                  My Voting Power :{' '}
                  <span className="font-medium">
                    {emissions.lockedValue.amount.toFixed(3)}
                  </span>
                </span>
                {/* <span className="text-white/50 text-xs whitespace-nowrap">
                  {emissions.lockedValue.percentage.toFixed(2)}% of all veION
                </span> */}
              </div>
              {view === 'My veION' && (
                <>
                  <ActionButton
                    action={() => setIsUniversalClaimOpen(true)}
                    disabled={isLoading || totalRewards === 0}
                    className="text-[12px] text-black"
                    label={
                      isLoading ? (
                        'Loading...'
                      ) : (
                        <>Claim Rewards ({totalRewards})</>
                      )
                    }
                  />
                  <UniversalClaimDialog
                    isOpen={isUniversalClaimOpen}
                    onClose={() => setIsUniversalClaimOpen(false)}
                    mode="selective"
                  />
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="border-none">
          {view === 'My veION' ? <MyVeionTable /> : <DelegateVeIonTable />}
        </CardContent>
      </Card>
    </div>
  );
}
