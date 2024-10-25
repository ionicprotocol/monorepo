import { useState } from 'react';

import Link from 'next/link';

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@ui/components/ui/table';

import ExtendVeion from './ExtendVeion';
import ManagePopup from './ManagePopup';
import VeionClaim from './VeionClaim';
import { TableActionButton } from '../TableActionButton';

import type { ColumnDef, SortingState } from '@tanstack/react-table';

// Types
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

// MyVeionTable Component
function MyVeionTable({ data }: { data: MyVeionData[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [isExtendOpen, setIsExtendOpen] = useState(false);

  const columns: ColumnDef<MyVeionData>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => (
        <div className="text-xs font-semibold text-white/80">
          {row.getValue('id')}
        </div>
      )
    },
    {
      accessorKey: 'tokensLocked',
      header: 'TOKENS LOCKED',
      cell: ({ row }) => (
        <div className="text-xs font-semibold text-white/80">
          {row.getValue('tokensLocked')}
        </div>
      )
    },
    {
      accessorKey: 'lockedBLP.amount',
      header: 'LP',
      cell: ({ row }) => (
        <div className="text-xs font-semibold text-white/80">
          {row.original.lockedBLP.amount}
        </div>
      )
    },
    {
      accessorKey: 'lockExpires.date',
      header: 'LOCK EXPIRES',
      cell: ({ row }) => (
        <div className="text-xs font-semibold text-white/80">
          {row.original.lockExpires.date}
        </div>
      )
    },
    {
      accessorKey: 'votingPower',
      header: 'VOTING POWER',
      cell: ({ row }) => (
        <div className="text-xs font-semibold text-white/80">
          {row.getValue('votingPower')}
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
            <Link href="/veion/vote">
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

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting
    }
  });

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

      <Table className="w-full border-separate border-spacing-y-3">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-none hover:bg-transparent"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-white/60 text-xs font-semibold h-8"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl [&>td:first-child]:rounded-l-xl [&>td:last-child]:rounded-r-xl border-none"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default MyVeionTable;
