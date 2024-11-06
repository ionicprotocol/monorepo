'use client';

import React, { useState, useMemo } from 'react';

import Image from 'next/image';

import { VotingContext } from '@ui/app/contexts/VotingContext';
import { Checkbox } from '@ui/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@ui/components/ui/select';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useToast } from '@ui/hooks/use-toast';
import { MarketSide, useVeIONVote } from '@ui/hooks/veion/useVeIONVote';
import type { VoteMarket } from '@ui/utils/voteMarkets';
import { voteMarkets } from '@ui/utils/voteMarkets';

import EmissionsManagementFooter from './EmissionsManagementFooter';
import CommonTable from '../CommonTable';

import type { ColumnDef } from '@tanstack/react-table';

interface EmissionsManagementTableProps {
  tokenId: number;
}

function EmissionsManagementTable({ tokenId }: EmissionsManagementTableProps) {
  const { currentChain } = useVeIONContext();
  const { toast } = useToast();
  const [selectedRows, setSelectedRows] = useState<Record<string, string>>({});
  const [autoRepeat, setAutoRepeat] = useState(false);
  const [poolType, setPoolType] = useState<'0' | '1'>('0');

  const { addVote, removeVote, submitVote, isVoting } =
    useVeIONVote(currentChain);

  const filteredVotingData = useMemo(() => {
    return voteMarkets[+currentChain]?.[poolType] ?? [];
  }, [currentChain, poolType]);

  const handleVoteChange = (id: string, side: MarketSide, value: string) => {
    setSelectedRows((prev) => {
      const newRows = { ...prev };
      const market = filteredVotingData.find((m) => m.marketAddress === id);

      if (market) {
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue)) {
          addVote(id, side, numericValue);
          newRows[`${id}-${side === MarketSide.Supply ? 'supply' : 'borrow'}`] =
            value;
        } else {
          removeVote(id);
          delete newRows[
            `${id}-${side === MarketSide.Supply ? 'supply' : 'borrow'}`
          ];
        }
      }
      return newRows;
    });
  };

  const handleSubmitVotes = async () => {
    try {
      const totalSupplyWeight = Object.entries(selectedRows)
        .filter(([key]) => key.endsWith('-supply'))
        .reduce((sum, [, value]) => sum + (parseFloat(value) || 0), 0);

      const totalBorrowWeight = Object.entries(selectedRows)
        .filter(([key]) => key.endsWith('-borrow'))
        .reduce((sum, [, value]) => sum + (parseFloat(value) || 0), 0);

      if (
        Math.abs(totalSupplyWeight - 100) > 0.01 ||
        Math.abs(totalBorrowWeight - 100) > 0.01
      ) {
        throw new Error(
          'Total vote weight for both supply and borrow must equal 100'
        );
      }

      const success = await submitVote(tokenId);

      if (success) {
        toast({
          title: 'Success',
          description: 'Votes submitted successfully'
        });

        if (!autoRepeat) {
          handleReset();
        }
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  const handleReset = () => {
    setSelectedRows({});
    setAutoRepeat(false);
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
          <input
            type="number"
            className="w-20 px-2 py-1 text-sm bg-gray-700 rounded border border-gray-600"
            value={selectedRows[`${row.original.marketAddress}-supply`] || ''}
            onChange={(e) =>
              handleVoteChange(row.original.marketAddress, 0, e.target.value)
            }
            disabled={isVoting}
            min="0"
            max="100"
            step="0.1"
          />
        )
      },
      {
        accessorKey: 'borrow',
        header: 'BORROW %',
        cell: ({ row }) => (
          <input
            type="number"
            className="w-20 px-2 py-1 text-sm bg-gray-700 rounded border border-gray-600"
            value={selectedRows[`${row.original.marketAddress}-borrow`] || ''}
            onChange={(e) =>
              handleVoteChange(row.original.marketAddress, 1, e.target.value)
            }
            disabled={isVoting}
            min="0"
            max="100"
            step="0.1"
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedRows, isVoting]
  );

  const votingContextValue = useMemo(
    () => ({
      selectedRows,
      onVoteChange: handleVoteChange
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedRows]
  );

  return (
    <VotingContext.Provider value={votingContextValue}>
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
        />

        <EmissionsManagementFooter
          autoRepeat={autoRepeat}
          setAutoRepeat={setAutoRepeat}
          selectedRows={selectedRows}
          handleReset={handleReset}
          onSubmitVotes={handleSubmitVotes}
          isVoting={isVoting}
        />
      </div>
    </VotingContext.Provider>
  );
}

export default EmissionsManagementTable;
