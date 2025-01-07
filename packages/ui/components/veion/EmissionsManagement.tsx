'use client';

import React, { useMemo } from 'react';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

import { mode } from 'viem/chains';
import { useChainId } from 'wagmi';

import { Checkbox } from '@ui/components/ui/checkbox';
import type { VoteMarket } from '@ui/context/EmissionsManagementContext';
import { useEmissionsContext } from '@ui/context/EmissionsManagementContext';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useToast } from '@ui/hooks/use-toast';
import { MarketSide, useVeIONVote } from '@ui/hooks/veion/useVeIONVote';

import EmissionsManagementFooter from './EmissionsManagementFooter';
import VoteInput from './VoteInput';
import CommonTable from '../CommonTable';
import PoolToggle from '../markets/PoolToggle';

import type { EnhancedColumnDef } from '../CommonTable';

interface EmissionsManagementTableProps {
  tokenId: number;
  showAutoOnly: boolean;
  showPendingOnly: boolean;
}

function EmissionsManagement({
  tokenId,
  showAutoOnly,
  showPendingOnly
}: EmissionsManagementTableProps) {
  const { currentChain } = useVeIONContext();
  const { markets, isLoading, error } = useEmissionsContext();
  const { toast } = useToast();
  const { submitVote, isVoting } = useVeIONVote(currentChain);
  const searchParams = useSearchParams();
  const querychain = searchParams.get('chain');
  const querypool = searchParams.get('pool');
  const selectedPool = querypool ?? '0';
  const chain = querychain ? querychain : mode.id.toString();

  const filteredVotingData = useMemo(() => {
    const baseData = markets[selectedPool] ?? [];

    return baseData.filter((market) => {
      // Filter for auto votes if showAutoOnly is true
      if (showAutoOnly && !market.autoVote) {
        return false;
      }

      // Filter for pending votes if showPendingOnly is true
      if (showPendingOnly) {
        const hasSupplyVote = market.supplyVote !== '';
        const hasBorrowVote = market.borrowVote !== '';
        if (!hasSupplyVote && !hasBorrowVote) {
          return true;
        } else {
          return false;
        }
      }

      return true;
    });
  }, [markets, selectedPool, showAutoOnly, showPendingOnly]);

  const handleSubmitVotes = async () => {
    try {
      const success = await submitVote(tokenId);

      if (success) {
        toast({
          title: 'Success',
          description: 'Votes submitted successfully'
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  const columns = useMemo<EnhancedColumnDef<VoteMarket>[]>(
    () => [
      {
        id: 'asset',
        header: 'ASSET',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Image
              src={`/img/symbols/32/color/${row.original.asset.toLocaleLowerCase()}.png`}
              alt={row.original.asset}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="text-xs font-semibold text-white/80">
              {row.original.asset}
            </span>
          </div>
        )
      },
      {
        id: 'totalVotes',
        header: 'TOTAL VOTES',
        cell: ({ row }) => {
          const totalVotes = row.original.totalVotes;
          return (
            <div className="flex flex-col">
              <div className="text-xs font-semibold text-white/80">
                {totalVotes.percentage}
              </div>
              <div className="text-xs font-semibold text-white/40">
                {totalVotes.limit}
              </div>
            </div>
          );
        }
      },
      {
        id: 'myVotes',
        header: 'MY VOTES',
        cell: ({ row }) => {
          const myVotes = row.original.myVotes;
          return (
            <div className="flex flex-col">
              <div className="text-xs font-semibold text-white/80">
                {myVotes.percentage}
              </div>
              <div className="text-xs font-semibold text-white/40">
                {myVotes.value}
              </div>
            </div>
          );
        }
      },
      {
        id: 'supply',
        header: 'SUPPLY %',
        cell: ({ row }) => (
          <VoteInput
            marketAddress={row.original.marketAddress}
            side={MarketSide.Supply}
            isDisabled={isVoting}
          />
        )
      },
      {
        id: 'borrow',
        header: 'BORROW %',
        cell: ({ row }) => (
          <VoteInput
            marketAddress={row.original.marketAddress}
            side={MarketSide.Borrow}
            isDisabled={isVoting}
          />
        )
      },
      {
        id: 'autoVote',
        header: 'AUTO VOTE',
        cell: ({ row }) => (
          <Checkbox
            checked={row.original.autoVote}
            disabled={isVoting}
            className="data-[state=checked]:bg-green-500"
          />
        )
      }
    ],
    [isVoting]
  );

  // Show error state if there's an error
  if (error) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center">
        <div className="text-red-500">Error loading data: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="relative pb-12">
      <PoolToggle
        chain={+chain}
        pool={selectedPool}
      />

      <CommonTable
        columns={columns}
        data={filteredVotingData}
        isLoading={isLoading}
      />

      <EmissionsManagementFooter
        onSubmitVotes={handleSubmitVotes}
        isVoting={isVoting}
      />
    </div>
  );
}

export default EmissionsManagement;
