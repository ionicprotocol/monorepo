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

interface RowBadge {
  text: string;
  className?: string;
}

interface RowStyle {
  badge?: RowBadge;
  borderClassName?: string;
}

interface CommonTableProps<T extends object> {
  data: T[];
  columns: EnhancedColumnDef<T>[];
  isLoading?: boolean;
  getRowStyle?: (row: Row<T>) => RowStyle;
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

  const getSortIcon = () => {
    if (!isSortable) return null;
    if (sorted === 'asc') return <ArrowUpIcon className="w-4 h-4" />;
    if (sorted === 'desc') return <ArrowDownIcon className="w-4 h-4" />;
    return <CaretSortIcon className="w-4 h-4 text-white/40" />;
  };

  return (
    <button
      className={`flex items-center gap-2 ${!isSortable ? 'cursor-default' : 'hover:text-white'}`}
      onClick={() => isSortable && column.toggleSorting(sorted === 'asc')}
      disabled={!isSortable}
    >
      {children}
      {getSortIcon()}
    </button>
  );
};

function CommonTable<T extends object>({
  data,
  columns,
  isLoading: externalIsLoading = false,
  getRowStyle
}: CommonTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [hasInitialized, setHasInitialized] = useState(false);

  const isLoading = !hasInitialized || externalIsLoading;

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
      <Table className="pr-3.5 pl-[1px]">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              transparent
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
            table.getRowModel().rows.map((row) => {
              const rowStyle = getRowStyle ? getRowStyle(row) : {};

              return (
                <TableRow
                  key={row.id}
                  badge={rowStyle.badge}
                  borderClassName={rowStyle.borderClassName}
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
              );
            })
          )}
        </TableBody>
      </Table>
    </ResultHandler>
  );
}

export default CommonTable;
