import type { ReactNode } from 'react';
import { useState } from 'react';

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon
} from '@radix-ui/react-icons';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
  type SortingState
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@ui/components/ui/table';

import ResultHandler from './ResultHandler';

// Sorting functions
export const sortingFunctions = {
  numerical: (a: any, b: any) => {
    const aValue = parseFloat(String(a).replace(/[^0-9.-]+/g, '')) || 0;
    const bValue = parseFloat(String(b).replace(/[^0-9.-]+/g, '')) || 0;
    return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
  },
  alphabetical: (a: any, b: any) => String(a).localeCompare(String(b)),
  percentage: (a: any, b: any) => {
    const aValue = parseFloat(String(a).replace('%', '')) || 0;
    const bValue = parseFloat(String(b).replace('%', '')) || 0;
    return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
  }
};

type SortingType = keyof typeof sortingFunctions;

export type EnhancedColumnDef<T> = Omit<ColumnDef<T>, 'sortingFn'> & {
  id: string;
  header: string;
  sortingFn?: SortingType | ((rowA: any, rowB: any) => number);
  enableSorting?: boolean;
};

interface CommonTableProps<T> {
  data: T[];
  columns: EnhancedColumnDef<T>[];
  isLoading?: boolean;
  renderRow?: (row: Row<T>) => ReactNode;
}

const SortableHeader = ({
  column,
  children
}: {
  column: any;
  children: ReactNode;
}) => {
  const isSortable = column.getCanSort();
  const sorted = column.getIsSorted();

  return (
    <button
      className={`flex items-center gap-2 hover:text-white ${!isSortable ? 'cursor-default' : ''}`}
      onClick={() => isSortable && column.toggleSorting(sorted === 'desc')}
      disabled={!isSortable}
    >
      {children}
      {isSortable && (
        <span className="ml-1">
          {sorted === 'asc' ? (
            <ArrowUpIcon className="w-4 h-4" />
          ) : sorted === 'desc' ? (
            <ArrowDownIcon className="w-4 h-4" />
          ) : (
            <CaretSortIcon className="w-4 h-4 text-white/40" />
          )}
        </span>
      )}
    </button>
  );
};

function CommonTable<T extends object>({
  data,
  columns,
  isLoading = false,
  renderRow
}: CommonTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const processedColumns = columns.map(
    (col): ColumnDef<T> => ({
      ...col,
      accessorFn: (row: T) => (row as any)[col.id],
      header: ({ column }) => (
        <SortableHeader column={column}>{col.header}</SortableHeader>
      ),
      sortingFn:
        typeof col.sortingFn === 'string'
          ? (rowA: any, rowB: any) => {
              const sortFn = sortingFunctions[col.sortingFn as SortingType];
              return sortFn(rowA.original[col.id], rowB.original[col.id]);
            }
          : col.sortingFn
    })
  );

  const table = useReactTable({
    data,
    columns: processedColumns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting }
  });

  return (
    <ResultHandler isLoading={isLoading}>
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
            table.getRowModel().rows.map((row) =>
              renderRow ? (
                renderRow(row)
              ) : (
                <TableRow
                  key={row.id}
                  className="hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl [&>td:first-child]:rounded-l-xl [&>td:last-child]:rounded-r-xl border-none"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              )
            )
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
    </ResultHandler>
  );
}

export default CommonTable;
