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
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }
    const aValue = parseFloat(String(a).replace(/[^0-9.-]+/g, '')) || 0;
    const bValue = parseFloat(String(b).replace(/[^0-9.-]+/g, '')) || 0;
    return aValue - bValue;
  },
  alphabetical: (a: any, b: any) => String(a).localeCompare(String(b)),
  percentage: (a: any, b: any) => {
    const aValue = parseFloat(String(a).replace('%', '')) || 0;
    const bValue = parseFloat(String(b).replace('%', '')) || 0;
    return aValue - bValue;
  }
};

type SortingType = keyof typeof sortingFunctions;

export type EnhancedColumnDef<T> = Omit<
  ColumnDef<T, unknown>,
  'header' | 'sortingFn'
> & {
  id: string;
  header: ReactNode | string;
  sortingFn?: SortingType | ((rowA: any, rowB: any) => number);
  enableSorting?: boolean;
  accessorFn?: (row: T) => any;
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
      onClick={() => {
        if (isSortable) {
          const nextSortingOrder =
            sorted === false ? 'asc' : sorted === 'asc' ? 'desc' : false;
          column.toggleSorting(nextSortingOrder === 'desc', false);
        }
      }}
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
  isLoading: externalIsLoading = false,
  renderRow
}: CommonTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Consider the table as loading if it hasn't initialized yet or if external loading state is true
  const isLoading = !hasInitialized || externalIsLoading;

  // Once we get data for the first time, mark as initialized
  if (!hasInitialized && data.length > 0) {
    setHasInitialized(true);
  }

  const processedColumns = columns.map(
    (col): ColumnDef<T> => ({
      ...col,
      accessorFn: col.accessorFn || ((row: T) => (row as any)[col.id]),
      header: ({ column }) => (
        <SortableHeader column={column}>{col.header}</SortableHeader>
      ),
      sortingFn:
        typeof col.sortingFn === 'string'
          ? (rowA: any, rowB: any) => {
              const sortFn = sortingFunctions[col.sortingFn as SortingType];
              return sortFn(rowA.getValue(col.id), rowB.getValue(col.id));
            }
          : col.sortingFn,
      enableSorting: col.enableSorting !== false
    })
  );

  const table = useReactTable({
    data,
    columns: processedColumns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    enableMultiSort: false
  });

  return (
    <ResultHandler
      isLoading={isLoading}
      center
      height={80}
    >
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
          {!isLoading && table.getRowModel().rows?.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          ) : (
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
          )}
        </TableBody>
      </Table>
    </ResultHandler>
  );
}

export default CommonTable;
