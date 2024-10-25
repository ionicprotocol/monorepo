'use client';

import React, { useState, useMemo } from 'react';

import Image from 'next/image';

import { VotingContext } from '@ui/app/contexts/VotingContext';
import type { VotingData } from '@ui/constants/mock';

import EmissionsManagementFooter from './EmissionsManagementFooter';
import VoteInput from './VoteInput';
import CommonTable from '../CommonTable';

import type { ColumnDef } from '@tanstack/react-table';

function EmissionsManagementTable({ data }: { data: VotingData[] }) {
  const [selectedRows, setSelectedRows] = useState<Record<string, string>>({});
  const [autoRepeat, setAutoRepeat] = useState(false);

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

    return data.reduce(
      (acc, row) => {
        acc[row.id] = colors[Math.floor(Math.random() * colors.length)];
        return acc;
      },
      {} as Record<string, string>
    );
  }, [data]);

  const handleVoteChange = (id: string, value: string) => {
    setSelectedRows((prev) => ({ ...prev, [id]: value }));
  };

  const handleReset = () => {
    setSelectedRows({});
    setAutoRepeat(false);
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
        accessorKey: 'network',
        header: 'NETWORK',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Image
              src={`/img/logo/${row.getValue<string>('network').toUpperCase()}.png`}
              alt={row.getValue('network')}
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <span className="text-xs font-semibold text-white/80">
              {row.getValue('network')}
            </span>
          </div>
        )
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
          <div className="flex justify-end">
            <VoteInput
              key={row.original.id}
              row={row}
            />
          </div>
        )
      }
    ],
    [rowColors] // only depending on rowColors now
  );

  const votingContextValue = useMemo(
    () => ({
      selectedRows,
      onVoteChange: handleVoteChange
    }),
    [selectedRows]
  );

  return (
    <VotingContext.Provider value={votingContextValue}>
      <div className="relative pb-12">
        <CommonTable
          columns={columns}
          data={data}
        />

        <EmissionsManagementFooter
          autoRepeat={autoRepeat}
          setAutoRepeat={setAutoRepeat}
          selectedRows={selectedRows}
          handleReset={handleReset}
        />
      </div>
    </VotingContext.Provider>
  );
}

export default EmissionsManagementTable;
