import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  Center,
  Flex,
  Hide,
  HStack,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import type { ColumnDef, PaginationState, SortingFn, SortingState } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { colord, extend } from 'colord';
import mixPlugin from 'colord/plugins/mix';
import * as React from 'react';
import { Fragment, useCallback, useMemo, useState } from 'react';

import { Asset } from './Asset';
import { BorrowApy } from './BorrowApy';
import { PercentInPortFolio } from './PercentInPortFolio';
import { TotalBorrow } from './TotalBorrow';
import { TotalBorrowBar } from './TotalBorrowBar';
import { UtilizationRate } from './UtilizationRate';

import { CIconButton } from '@ui/components/shared/Button';
import { TableHeaderCell } from '@ui/components/shared/TableHeaderCell';
import {
  APY,
  BORROW_ASSET,
  MARKETS_COUNT_PER_PAGE,
  PERCENT_IN_PORTFOLIO,
  POOLS_COUNT_PER_PAGE,
  TOTAL_BORROW,
  UTILIZATION_RATE
} from '@ui/constants/index';
import { useBorrowAssets } from '@ui/hooks/borrow/useBorrowAssets';
import { useBorrowAPYs } from '@ui/hooks/useBorrowAPYs';
import { useColors } from '@ui/hooks/useColors';
import type { MarketData, PoolData } from '@ui/types/TokensDataMap';

extend([mixPlugin]);

export type BorrowAssetRowData = {
  apy: MarketData;
  borrowAsset: MarketData;
  percentInPortfolio: MarketData;
  totalBorrow: MarketData;
  utilizationRate: MarketData;
};

export const AssetsList = ({ poolData }: { poolData: PoolData }) => {
  const { chainId, comptroller, assets, totalBorrowedFiat } = poolData;
  const [sorting, setSorting] = useState<SortingState>([{ desc: true, id: BORROW_ASSET }]);
  const [pagination, onPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: POOLS_COUNT_PER_PAGE[0]
  });
  const { data: borrowApys } = useBorrowAPYs(assets, chainId);

  const mixedColor = useCallback((ratio: number) => {
    let color1 = '';
    let color2 = '';
    let _ratio = 0;
    if (ratio < 0.5) {
      color1 = '#FF3864'; // iRed
      color2 = '#F1F996'; // iYellow
      _ratio = ratio * 2;
    } else {
      _ratio = (ratio - 0.5) * 2;
      color1 = '#F1F996'; // iYellow
      color2 = '#39FF88'; // iGreen
    }

    return colord(color1).mix(color2, _ratio).toHex();
  }, []);

  const assetSort: SortingFn<BorrowAssetRowData> = useCallback(
    (rowA, rowB, columnId) => {
      if (columnId === BORROW_ASSET) {
        return rowB.original.borrowAsset.underlyingSymbol.localeCompare(
          rowA.original.borrowAsset.underlyingSymbol
        );
      } else if (columnId === TOTAL_BORROW || columnId === PERCENT_IN_PORTFOLIO) {
        return rowB.original.borrowAsset.totalBorrowFiat > rowA.original.borrowAsset.totalBorrowFiat
          ? 1
          : -1;
      } else if (columnId === APY) {
        const rowAAPY =
          borrowApys && borrowApys[rowA.original.borrowAsset.cToken]
            ? borrowApys[rowA.original.borrowAsset.cToken]
            : 0;
        const rowBAPY =
          borrowApys && borrowApys[rowA.original.borrowAsset.cToken]
            ? borrowApys[rowB.original.borrowAsset.cToken]
            : 0;
        return rowAAPY > rowBAPY ? 1 : -1;
      } else if (columnId === UTILIZATION_RATE) {
        return rowB.original.borrowAsset.utilization > rowA.original.borrowAsset.utilization
          ? 1
          : -1;
      } else {
        return 1;
      }
    },
    [borrowApys]
  );

  const data = useBorrowAssets(assets);

  const columns: ColumnDef<BorrowAssetRowData>[] = useMemo(() => {
    return [
      {
        accessorFn: (row) => row.borrowAsset,
        cell: ({ getValue }) => (
          <Asset
            asset={getValue<MarketData>()}
            mixedColor={mixedColor}
            poolChainId={chainId}
            totalBorrowedFiat={totalBorrowedFiat}
          />
        ),
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{BORROW_ASSET}</TableHeaderCell>,
        id: BORROW_ASSET,
        sortingFn: assetSort
      },
      {
        accessorFn: (row) => row.apy,
        cell: ({ getValue }) => (
          <BorrowApy asset={getValue<MarketData>()} borrowApys={borrowApys} />
        ),
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{APY}</TableHeaderCell>,
        id: APY,
        sortingFn: assetSort
      },
      {
        accessorFn: (row) => row.totalBorrow,
        cell: ({ getValue }) => (
          <TotalBorrow asset={getValue<MarketData>()} chainId={chainId} comptroller={comptroller} />
        ),
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{TOTAL_BORROW}</TableHeaderCell>,
        id: TOTAL_BORROW,
        sortingFn: assetSort
      },
      {
        accessorFn: (row) => row.utilizationRate,
        cell: ({ getValue }) => <UtilizationRate asset={getValue<MarketData>()} />,
        footer: (props) => props.column.id,
        header: (context) => (
          <TableHeaderCell context={context}>{UTILIZATION_RATE}</TableHeaderCell>
        ),
        id: UTILIZATION_RATE,
        sortingFn: assetSort
      },
      {
        accessorFn: (row) => row.percentInPortfolio,
        cell: ({ getValue }) => (
          <PercentInPortFolio
            asset={getValue<MarketData>()}
            mixedColor={mixedColor}
            totalBorrowedFiat={totalBorrowedFiat}
          />
        ),
        footer: (props) => props.column.id,
        header: (context) => (
          <TableHeaderCell context={context}>{PERCENT_IN_PORTFOLIO}</TableHeaderCell>
        ),
        id: PERCENT_IN_PORTFOLIO,
        sortingFn: assetSort
      }
    ];
  }, [assetSort, mixedColor, chainId, totalBorrowedFiat, borrowApys, comptroller]);

  const table = useReactTable({
    columns,
    data,
    enableSortingRemoval: false,
    getColumnCanGlobalFilter: () => true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: onPagination,
    onSortingChange: setSorting,
    state: {
      pagination,
      sorting
    }
  });

  const { data: tableData } = useQuery(['LendingAssetsTableData', table], () => {
    return {
      canNextPage: table.getCanNextPage(),
      canPreviousPage: table.getCanPreviousPage(),
      filteredRows: table.getFilteredRowModel().rows,
      headerGroups: table.getHeaderGroups(),
      rows: table.getRowModel().rows
    };
  });

  const { cCard, cIRow } = useColors();

  return (
    <Flex direction="column" gap="24px" overflowX={'auto'}>
      <Flex
        alignItems="center"
        flexWrap="wrap"
        gap={4}
        justifyContent={['center', 'center', 'space-between']}
        width="100%"
      >
        <Text size="xl">Vault Strategies</Text>
      </Flex>
      {data.length === 0 ? (
        <Flex>
          <Text color={'iGray'}>No assets to borrow</Text>
        </Flex>
      ) : tableData ? (
        <>
          <TotalBorrowBar assets={assets} mixedColor={mixedColor} />
          <Table style={{ borderCollapse: 'separate', borderSpacing: '0 16px' }}>
            <Thead>
              {tableData.headerGroups.map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <Th
                        border="none"
                        color={cCard.txtColor}
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        px={{ base: '16px' }}
                        textTransform="capitalize"
                      >
                        <HStack justifyContent={'flex-start'}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </HStack>
                      </Th>
                    );
                  })}
                </Tr>
              ))}
            </Thead>
            <Tbody>
              {tableData.rows && tableData.rows.length > 0 ? (
                tableData.rows.map((row) => (
                  <Fragment key={row.id}>
                    <Tr
                      _hover={{ bg: cIRow.bgColor }}
                      borderRadius={{ base: '20px' }}
                      cursor="pointer"
                      key={row.id}
                    >
                      {row.getVisibleCells().map((cell, index) => {
                        return (
                          <Td
                            background={cIRow.bgColor}
                            border="none"
                            borderLeftRadius={index === 0 ? '20px' : 0}
                            borderRightRadius={
                              index === row.getVisibleCells().length - 1 ? '20px' : 0
                            }
                            // height={16}
                            key={cell.id}
                            minW={10}
                            px={{ base: '16px' }}
                            py={{ base: '16px' }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </Td>
                        );
                      })}
                    </Tr>
                  </Fragment>
                ))
              ) : assets.length === 0 ? (
                <Tr>
                  <Td border="none" colSpan={tableData.headerGroups[0].headers.length}>
                    <Center py={8}>There are no assets to borrow.</Center>
                  </Td>
                </Tr>
              ) : (
                <Tr>
                  <Td border="none" colSpan={tableData.headerGroups[0].headers.length}>
                    <Center py={8}>There are no search results</Center>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
          <Flex
            alignItems="center"
            className="pagination"
            gap={4}
            justifyContent="flex-end"
            px={3}
            py={4}
            width={'100%'}
          >
            <HStack>
              <Hide below="lg">
                <Text size="md">Assets Per Page</Text>
              </Hide>
              <Select
                maxW="max-content"
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value));
                }}
                value={pagination.pageSize}
              >
                {MARKETS_COUNT_PER_PAGE.map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </Select>
            </HStack>
            <HStack gap={2}>
              <Text size="md">
                {tableData.filteredRows.length === 0
                  ? 0
                  : pagination.pageIndex * pagination.pageSize + 1}{' '}
                -{' '}
                {(pagination.pageIndex + 1) * pagination.pageSize > tableData.filteredRows.length
                  ? tableData.filteredRows.length
                  : (pagination.pageIndex + 1) * pagination.pageSize}{' '}
                of {tableData.filteredRows.length}
              </Text>
              <HStack>
                <CIconButton
                  aria-label="toPrevious"
                  icon={<ChevronLeftIcon fontSize={30} />}
                  isDisabled={!tableData.canPreviousPage}
                  isRound
                  onClick={() => table.previousPage()}
                  variant="_outline"
                />
                <CIconButton
                  aria-label="toNext"
                  icon={<ChevronRightIcon fontSize={30} />}
                  isDisabled={!tableData.canNextPage}
                  isRound
                  onClick={() => table.nextPage()}
                  variant="_outline"
                />
              </HStack>
            </HStack>
          </Flex>
        </>
      ) : null}
    </Flex>
  );
};
