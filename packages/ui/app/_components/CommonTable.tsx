import { useState } from 'react';

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

import { TableLoader } from './TableLoader';

import type { ColumnDef, SortingState } from '@tanstack/react-table';

interface CommonTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  loadingRows?: number;
  showFooter?: boolean;
}

function CommonTable<T>({
  data,
  columns,
  isLoading = false,
  loadingRows = 5,
  showFooter = false
}: CommonTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);

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

  if (isLoading) {
    return (
      <TableLoader
        columns={columns}
        rows={loadingRows}
        showFooter={showFooter}
      />
    );
  }

  return (
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
  );
}

export default CommonTable;
