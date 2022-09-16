import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { HStack, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import * as React from 'react';
import { Fragment } from 'react';

import { useColors } from '@ui/hooks/useColors';

export type DataTableProps<Data extends object> = {
  data: Data[];
  columns: ColumnDef<Data>[];
  renderSubComponent: (props: { row: Row<Data> }) => React.ReactElement;
  getRowCanExpand: (row: Row<Data>) => boolean;
};

export function DataTable<Data extends object>({
  data,
  columns,
  renderSubComponent,
  getRowCanExpand,
}: DataTableProps<Data>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const table = useReactTable({
    columns,
    data,
    getRowCanExpand,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    state: {
      sorting,
    },
  });

  const { cCard } = useColors();

  return (
    <Table>
      <Thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <Tr key={headerGroup.id} borderColor={cCard.dividerColor} borderBottomWidth={1}>
            {headerGroup.headers.map((header) => {
              return (
                <Th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  border="none"
                  color={cCard.txtColor}
                  fontSize={16}
                  textTransform="capitalize"
                  py={4}
                >
                  <HStack gap={1} justifyContent={header.index === 0 ? 'flex-start' : 'flex-end'}>
                    <>{flexRender(header.column.columnDef.header, header.getContext())}</>
                    <>
                      {header.column.getIsSorted() ? (
                        header.column.getIsSorted() === 'desc' ? (
                          <TriangleDownIcon aria-label="sorted descending" />
                        ) : (
                          <TriangleUpIcon aria-label="sorted ascending" />
                        )
                      ) : null}
                    </>
                  </HStack>
                </Th>
              );
            })}
          </Tr>
        ))}
      </Thead>
      <Tbody>
        {table.getRowModel().rows.map((row) => (
          <Fragment key={row.id}>
            <Tr
              key={row.id}
              borderColor={cCard.dividerColor}
              borderTopWidth={row.getIsExpanded() ? 4 : 1}
              background={row.getIsExpanded() ? cCard.hoverBgColor : cCard.bgColor}
              _hover={{ bg: cCard.hoverBgColor }}
            >
              {row.getVisibleCells().map((cell) => {
                return (
                  <Td key={cell.id} border="none">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Td>
                );
              })}
            </Tr>
            {row.getIsExpanded() && (
              <Tr
                borderColor={cCard.dividerColor}
                borderBottomWidth={row.getIsExpanded() ? 6 : 0}
                background={row.getIsExpanded() ? cCard.hoverBgColor : cCard.bgColor}
              >
                {/* 2nd row is a custom 1 cell row */}
                <Td border="none" colSpan={row.getVisibleCells().length}>
                  {renderSubComponent({ row })}
                </Td>
              </Tr>
            )}
          </Fragment>
        ))}
      </Tbody>
    </Table>
  );
}
