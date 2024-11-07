'use client';

import React, { useState, useMemo } from 'react';

import Image from 'next/image';

import { VotingProvider } from '@ui/app/contexts/VotingContext';
import { Checkbox } from '@ui/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@ui/components/ui/select';
import type { VoteMarket } from '@ui/context/EmissionsManagementContext';
import { useEmissionsContext } from '@ui/context/EmissionsManagementContext';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useToast } from '@ui/hooks/use-toast';
import { MarketSide, useVeIONVote } from '@ui/hooks/veion/useVeIONVote';

import EmissionsManagementFooter from './EmissionsManagementFooter';
import VoteInput from './VoteInput';
import CommonTable from '../CommonTable';

import type { ColumnDef } from '@tanstack/react-table';

interface EmissionsManagementTableProps {
  tokenId: number;
}

function EmissionsManagement({ tokenId }: EmissionsManagementTableProps) {
  const { currentChain } = useVeIONContext();
  const { markets, isLoading, error } = useEmissionsContext();
  const { toast } = useToast();
  const { addVote, removeVote, submitVote, isVoting } =
    useVeIONVote(currentChain);
  const [poolType, setPoolType] = useState<'0' | '1'>('0');

  const filteredVotingData = markets[poolType] ?? [];

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

  const columns = useMemo<ColumnDef<VoteMarket>[]>(
    () => [
      {
        accessorKey: 'asset',
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
        accessorKey: 'totalVotes',
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
        accessorKey: 'myVotes',
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
        accessorKey: 'supply',
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
        accessorKey: 'borrow',
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
        accessorKey: 'autoVote',
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
    <VotingProvider
      markets={markets}
      onVoteAdd={addVote}
      onVoteRemove={removeVote}
    >
      <div className="relative pb-12">
        <div className="mb-4">
          <Select
            value={poolType}
            onValueChange={(value: '0' | '1') => setPoolType(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select pool type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Regular Pool</SelectItem>
              <SelectItem value="1">Native Pool</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
    </VotingProvider>
  );
}

export default EmissionsManagement;
