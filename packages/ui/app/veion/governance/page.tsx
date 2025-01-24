'use client';

import { useEffect, useState } from 'react';

import { useSearchParams, useRouter } from 'next/navigation';

import { formatEther } from 'viem';
import { base, optimism, mode } from 'viem/chains';

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
import { lockedDataWithDelegate } from '@ui/constants/mock';
import { useAllClaimableRewards } from '@ui/hooks/rewards/useAllClaimableRewards';

export default function Governance() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isUniversalClaimOpen, setIsUniversalClaimOpen] =
    useState<boolean>(false);

  const querychain = searchParams.get('chain');
  const queryview = searchParams.get('view');
  const view = queryview ?? 'My veION';
  const chain = querychain ?? '0'; // Default to ALL_CHAINS_VALUE (0)

  const allChains = [8453, 34443, 10];
  const { data: claimableRewards, isLoading: isLoadingRewards } =
    useAllClaimableRewards(allChains);
  const totalRewards =
    claimableRewards?.reduce((acc, reward) => acc + reward.amount, 0n) ?? 0n;

  useEffect(() => {
    if (!querychain) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('chain', '0'); // Set to ALL_CHAINS_VALUE
      if (queryview) {
        newSearchParams.set('view', queryview);
      }
      router.replace(`/veion/governance?${newSearchParams.toString()}`);
    }
  }, [querychain, queryview, router, searchParams]);

  return (
    <div className="w-full flex flex-col items-start gap-y-4">
      <GovernanceHeader view={view} />

      <NetworkSelector
        nopool
        dropdownSelectedChain={+chain}
        enabledChains={[mode.id, base.id, optimism.id]}
        showAll
      />

      <Card className="w-full bg-grayone">
        <CardHeader className="px-6 pt-6 pb-2">
          <div className="flex w-full items-center justify-between">
            <div className="bg-grayUnselect rounded-md">
              <ToggleLinks
                arrText={['My veION', 'Delegated veION']}
                baseUrl="/veion/governance"
                currentChain={chain}
              />
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex flex-col text-right min-w-[160px] justify-center">
                <span className="text-xs whitespace-nowrap">
                  My Voting Power : <span className="font-medium">1134</span>
                </span>
                <span className="text-white/50 text-xs whitespace-nowrap">
                  10% of all veION
                </span>
              </div>
              {view === 'My veION' && (
                <>
                  <ActionButton
                    action={() => setIsUniversalClaimOpen(true)}
                    disabled={isLoadingRewards || totalRewards === 0n}
                    className="text-[12px] text-black"
                    label={
                      isLoadingRewards ? (
                        'Loading...'
                      ) : (
                        <>
                          Claim Rewards (
                          {Math.round(
                            +formatEther(totalRewards)
                          ).toLocaleString()}
                          )
                        </>
                      )
                    }
                  />
                  <UniversalClaimDialog
                    isOpen={isUniversalClaimOpen}
                    onClose={() => setIsUniversalClaimOpen(false)}
                    chainIds={allChains}
                    mode="selective"
                  />
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="border-none">
          {view === 'My veION' ? (
            <MyVeionTable />
          ) : (
            <DelegateVeIonTable
              data={lockedDataWithDelegate.filter(
                (position) => +chain === 0 || position.chainId === +chain
              )}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
