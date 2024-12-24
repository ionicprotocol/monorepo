'use client';

import { useEffect, useState } from 'react';

import { useSearchParams, useRouter } from 'next/navigation';

import { formatEther } from 'viem';
import { base, optimism, mode } from 'viem/chains';
import { useChainId } from 'wagmi';

import NetworkSelector from '@ui/components/markets/NetworkSelector';
import FlatMap from '@ui/components/points_comp/FlatMap';
import ToggleLinks from '@ui/components/ToggleLink';
import { Button } from '@ui/components/ui/button';
import { Card, CardHeader, CardContent } from '@ui/components/ui/card';
import UniversalClaimDialog from '@ui/components/UniversalClaimDialog';
import {
  MyVeionTable,
  DelegateVeIonTable,
  GovernanceHeader
} from '@ui/components/veion';
import { lockedData, lockedDataWithDelegate } from '@ui/constants/mock';
import { useAllClaimableRewards } from '@ui/hooks/rewards/useAllClaimableRewards';

export default function Governance() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chainId = useChainId();
  const [isUniversalClaimOpen, setIsUniversalClaimOpen] =
    useState<boolean>(false);

  const querychain = searchParams.get('chain');
  const queryview = searchParams.get('view');
  const chain = querychain ?? String(chainId);
  const view = queryview ?? 'My veION';

  const allChains = [8453, 34443, 10];
  const { data: claimableRewards, isLoading: isLoadingRewards } =
    useAllClaimableRewards(allChains);
  const totalRewards =
    claimableRewards?.reduce((acc, reward) => acc + reward.amount, 0n) ?? 0n;

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
      <GovernanceHeader view={view} />

      <NetworkSelector
        nopool={true}
        dropdownSelectedChain={+chain}
        enabledChains={[mode.id, base.id, optimism.id]}
      />

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
            {view === 'My veION' && (
              <>
                <Button
                  className="bg-accent text-black hover:bg-accent/90 rounded-xl px-4 py-2 text-sm font-medium"
                  onClick={() => setIsUniversalClaimOpen(true)}
                  disabled={isLoadingRewards || totalRewards === 0n}
                >
                  {isLoadingRewards ? (
                    'Loading...'
                  ) : (
                    <>
                      Claim Rewards (
                      {Math.round(+formatEther(totalRewards)).toLocaleString()})
                    </>
                  )}
                </Button>
                <UniversalClaimDialog
                  isOpen={isUniversalClaimOpen}
                  onClose={() => setIsUniversalClaimOpen(false)}
                  chainIds={allChains}
                  mode="selective"
                />
              </>
            )}
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
