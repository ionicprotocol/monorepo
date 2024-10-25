import { useState } from 'react';

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender
} from '@tanstack/react-table';

import { Button } from '@ui/components/ui/button';
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table
} from '@ui/components/ui/table';

import type { SortingState, ColumnDef } from '@tanstack/react-table';
import { TableActionButton } from '../TableActionButton';

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

type DelegateVeionData = BaseVeionData & {
  delegatedTo: string;
  readyToDelegate: boolean;
};

function DelegateVeionTable({ data }: { data: DelegateVeionData[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<DelegateVeionData>[] = [
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
      accessorKey: 'delegatedTo',
      header: 'DELEGATED TO',
      cell: ({ row }) => (
        <div className="text-xs font-semibold text-white/80">
          {row.getValue('delegatedTo') || '-'}
        </div>
      )
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const data = row.original;
        return data.readyToDelegate ? (
          <TableActionButton>Undelegate</TableActionButton>
        ) : (
          <TableActionButton
            variant="secondary"
            width="100px"
            disabled
          >
            {data.lockExpires.timeLeft}
          </TableActionButton>
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

export default DelegateVeionTable;
