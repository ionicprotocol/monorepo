import { useState } from 'react';

import Link from 'next/link';

import ExtendVeion from './ExtendVeion';
import ManagePopup from './ManagePopup';
import TimeRemaining from './TimeRemaining';
import VeionClaim from './VeionClaim';
import CommonTable from '../CommonTable';
import { TableActionButton } from '../TableActionButton';
import TokenPair from '../TokenPair';

import type { ColumnDef } from '@tanstack/react-table';

type BaseVeionData = {
  id: string;
  tokensLocked: string;
  lockedBLP: {
    amount: string;
    value: string;
  };
  lockExpires: {
    date: string;
    timeLeft: string;
  };
  votingPower: string;
};

type MyVeionData = BaseVeionData & {
  enableClaim?: boolean;
};

function MyVeionTable({ data }: { data: MyVeionData[] }) {
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [isExtendOpen, setIsExtendOpen] = useState(false);

  const getRandomColor = () => {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEEAD',
      '#D4A5A5',
      '#9B59B6'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const columns: ColumnDef<MyVeionData>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: getRandomColor() }}
          />
          <div className="text-xs font-semibold text-white/80">
            {row.getValue('id')}
          </div>
        </div>
      )
    },
    {
      accessorKey: 'tokensLocked',
      header: 'TOKENS LOCKED',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <TokenPair
            token1="ion"
            token2="eth"
            size={24}
          />
          <div className="flex flex-col">
            <div className="text-xs font-semibold text-white/80">
              {row.getValue('tokensLocked')}
            </div>
            <div className="text-xs font-semibold text-white/40">
              Balancer LP
            </div>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'lockedBLP.amount',
      header: 'LP',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <div className="text-xs font-semibold text-white/80">
            {row.original.lockedBLP.amount}
          </div>
          <div className="text-xs font-semibold text-white/40">$400.32</div>
        </div>
      )
    },
    {
      accessorKey: 'lockExpires.date',
      header: 'LOCK EXPIRES',
      cell: ({ row }) => (
        <TimeRemaining lockExpiryDate={row.original.lockExpires.date} />
      )
    },
    {
      accessorKey: 'votingPower',
      header: 'VOTING POWER',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <div className="text-xs font-semibold text-white/80">
            {row.getValue('votingPower')}
          </div>
          <div className="text-xs font-semibold text-white/40">
            1.67% of all
          </div>
        </div>
      )
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const data = row.original;
        return data.enableClaim ? (
          <div className="flex gap-2 justify-end">
            <TableActionButton onClick={() => setIsClaimOpen(true)}>
              Claim LP
            </TableActionButton>
            <TableActionButton onClick={() => setIsExtendOpen(true)}>
              Extend
            </TableActionButton>
          </div>
        ) : (
          <div className="flex gap-2 justify-end">
            <Link href="/veion/governance/vote">
              <TableActionButton variant="secondary">Vote</TableActionButton>
            </Link>
            <TableActionButton
              variant="secondary"
              onClick={() => setIsManageOpen(true)}
            >
              Manage
            </TableActionButton>
          </div>
        );
      }
    }
  ];

  return (
    <div>
      {/* Modals */}
      <VeionClaim
        isOpen={isClaimOpen}
        onOpenChange={setIsClaimOpen}
      />
      <ExtendVeion
        isOpen={isExtendOpen}
        onOpenChange={setIsExtendOpen}
      />
      <ManagePopup
        isOpen={isManageOpen}
        onOpenChange={setIsManageOpen}
      />

      <CommonTable
        data={data}
        columns={columns}
      />
    </div>
  );
}

export default MyVeionTable;
