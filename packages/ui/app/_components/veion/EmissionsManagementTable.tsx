'use client';

import React, { useState, useMemo } from 'react';

import { VotingContext } from '@ui/app/contexts/VotingContext';
import type { VotingData } from '@ui/constants/mock';
import { votingData } from '@ui/constants/mock';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useToast } from '@ui/hooks/use-toast';
import { MarketSide, useVeIONVote } from '@ui/hooks/veion/useVeIONVote';

import EmissionsManagementFooter from './EmissionsManagementFooter';
import VoteInput from './VoteInput';
import CommonTable from '../CommonTable';

import type { ColumnDef } from '@tanstack/react-table';

const MARKET_ADDRESSES: Record<string, `0x${string}`> = {
  '0012': '0x1234567890123456789012345678901234567890',
  '0014': '0x2345678901234567890123456789012345678901',
  '0015': '0x3456789012345678901234567890123456789012',
  '0016': '0x4567890123456789012345678901234567890123'
};

interface EmissionsManagementTableProps {
  tokenId: number;
}

function EmissionsManagementTable({ tokenId }: EmissionsManagementTableProps) {
  const { currentChain } = useVeIONContext();
  const { toast } = useToast();
  const [selectedRows, setSelectedRows] = useState<Record<string, string>>({});
  const [autoRepeat, setAutoRepeat] = useState(false);
  const [votingSide, setVotingSide] = useState<Record<string, MarketSide>>({});

  const { addVote, removeVote, submitVote, isVoting } =
    useVeIONVote(currentChain);

  const filteredVotingData = useMemo(() => {
    return votingData.filter((data) => data.networkId === +currentChain);
  }, [currentChain]);

  const rowColors = useMemo(() => {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEEAD',
      '#D4A5A5',
      '#9B59B6'
    ];

    return filteredVotingData.reduce(
      (acc, row) => {
        acc[row.id] = colors[Math.floor(Math.random() * colors.length)];
        return acc;
      },
      {} as Record<string, string>
    );
  }, [filteredVotingData]);

  const handleVoteChange = (id: string, value: string) => {
    setSelectedRows((prev) => {
      const newRows = { ...prev, [id]: value };
      // Update the votes in the hook
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        const marketAddress = MARKET_ADDRESSES[id];
        if (marketAddress) {
          addVote(
            marketAddress,
            votingSide[id] || MarketSide.Supply,
            numericValue
          );
        }
      } else {
        removeVote(id);
      }
      return newRows;
    });
  };

  const handleSideChange = (id: string, side: MarketSide) => {
    setVotingSide((prev) => {
      const newSides = { ...prev, [id]: side };
      const value = selectedRows[id];
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        const market = filteredVotingData.find((row) => row.id === id);
        if (market) {
          addVote(market.marketAddress, side, numericValue);
        }
      }
      return newSides;
    });
  };

  const handleReset = () => {
    setSelectedRows({});
    setVotingSide({});
    setAutoRepeat(false);
  };

  const handleSubmitVotes = async () => {
    try {
      const totalWeight = Object.values(selectedRows).reduce(
        (sum, value) => sum + (parseFloat(value) || 0),
        0
      );

      if (Math.abs(totalWeight - 100) > 0.01) {
        throw new Error('Total vote weight must equal 100');
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

  const columns = useMemo<ColumnDef<VotingData>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => {
          const id = row.getValue<string>('id');
          return (
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: rowColors[id] }}
              />
              <div className="text-xs font-semibold text-white/80">{id}</div>
            </div>
          );
        }
      },
      {
        accessorKey: 'supplyAsset',
        header: 'SUPPLY ASSET',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white/80">
              {row.getValue('supplyAsset')}
            </span>
          </div>
        )
      },
      {
        accessorKey: 'type',
        header: 'TYPE',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white/80">
              {row.getValue('type')}
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
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end items-center gap-2">
            <div className="flex items-center gap-1">
              <button
                className={`px-2 py-1 rounded ${
                  votingSide[row.original.id] === MarketSide.Supply
                    ? 'bg-green-500'
                    : 'bg-gray-700'
                }`}
                onClick={() =>
                  handleSideChange(row.original.id, MarketSide.Supply)
                }
                disabled={isVoting}
              >
                Supply
              </button>
              <button
                className={`px-2 py-1 rounded ${
                  votingSide[row.original.id] === MarketSide.Borrow
                    ? 'bg-red-500'
                    : 'bg-gray-700'
                }`}
                onClick={() =>
                  handleSideChange(row.original.id, MarketSide.Borrow)
                }
                disabled={isVoting}
              >
                Borrow
              </button>
            </div>
            <VoteInput
              key={row.original.id}
              row={row}
              disabled={isVoting}
            />
          </div>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rowColors, votingSide, isVoting]
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
