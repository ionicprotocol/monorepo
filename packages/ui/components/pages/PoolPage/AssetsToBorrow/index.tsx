import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  Center,
  Divider,
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
import type {
  ColumnDef,
  FilterFn,
  PaginationState,
  SortingFn,
  SortingState
} from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import * as React from 'react';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';

import { AprStable } from '@ui/components/pages/PoolPage/AssetsToBorrow/AprStable';
import { AprVariable } from '@ui/components/pages/PoolPage/AssetsToBorrow/AprVariable';
import { Asset } from '@ui/components/pages/PoolPage/AssetsToBorrow/Asset';
import { Available } from '@ui/components/pages/PoolPage/AssetsToBorrow/Available';
import { Borrow } from '@ui/components/pages/PoolPage/AssetsToBorrow/Borrow';
import { Details } from '@ui/components/pages/PoolPage/AssetsToBorrow/Details';
import { CIconButton } from '@ui/components/shared/Button';
import { SearchInput } from '@ui/components/shared/SearchInput';
import { TableHeaderCell } from '@ui/components/shared/TableHeaderCell';
import {
  APR_STABLE,
  APR_VARIABLE,
  ASSET,
  AVAILABLE,
  BORROW,
  MARKETS_COUNT_PER_PAGE,
  POOLS_COUNT_PER_PAGE,
  SEARCH
} from '@ui/constants/index';
import { useAssetsToBorrowData } from '@ui/hooks/assetsToBorrow/useAssetsToBorrowData';
import { useBorrowAPYs } from '@ui/hooks/useBorrowAPYs';
import { useColors } from '@ui/hooks/useColors';
import { useMaxBorrowAmounts } from '@ui/hooks/useMaxBorrowAmount';
import type { MarketData, PoolData } from '@ui/types/TokensDataMap';

export type AssetToBorrowRowData = {
  aprStable: MarketData;
  aprVariable: MarketData;
  asset: MarketData;
  available: MarketData;
};

export const AssetsToBorrow = ({ poolData }: { poolData: PoolData }) => {
  const { assets, chainId, comptroller, id: poolId } = poolData;
  const [sorting, setSorting] = useState<SortingState>([{ desc: true, id: ASSET }]);
  const [pagination, onPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: POOLS_COUNT_PER_PAGE[0]
  });
  const [globalFilter, setGlobalFilter] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const { data: borrowApyPerAsset } = useBorrowAPYs(assets, chainId);
  const { data: maxBorrowAmounts } = useMaxBorrowAmounts(assets, comptroller, chainId);

  const assetFilter: FilterFn<AssetToBorrowRowData> = useCallback(
    (row, columnId, value) => {
      const asset = row.original.asset;

      if (
        !searchText ||
        (value.includes(SEARCH) &&
          (asset.underlyingName.toLowerCase().includes(searchText.toLowerCase()) ||
            asset.underlyingSymbol.toLowerCase().includes(searchText.toLowerCase())))
      ) {
        return true;
      } else {
        return false;
      }
    },
    [searchText]
  );

  const assetSort: SortingFn<AssetToBorrowRowData> = useCallback(
    (rowA, rowB, columnId) => {
      if (columnId === ASSET) {
        return rowB.original.asset.underlyingSymbol.localeCompare(
          rowA.original.asset.underlyingSymbol
        );
      } else if (columnId === AVAILABLE) {
        const rowAValue =
          maxBorrowAmounts && maxBorrowAmounts[rowA.original.asset.cToken]
            ? maxBorrowAmounts[rowA.original.asset.cToken].number
            : 0;
        const rowBValue =
          maxBorrowAmounts && maxBorrowAmounts[rowB.original.asset.cToken]
            ? maxBorrowAmounts[rowB.original.asset.cToken].number
            : 0;
        return rowAValue > rowBValue ? 1 : -1;
      } else if (columnId === APR_VARIABLE) {
        const rowAValue =
          borrowApyPerAsset && borrowApyPerAsset[rowA.original.asset.cToken]
            ? borrowApyPerAsset[rowA.original.asset.cToken]
            : 0;
        const rowBValue =
          borrowApyPerAsset && borrowApyPerAsset[rowA.original.asset.cToken]
            ? borrowApyPerAsset[rowB.original.asset.cToken]
            : 0;
        return rowAValue > rowBValue ? 1 : -1;
      } else {
        return 1;
      }
    },
    [maxBorrowAmounts, borrowApyPerAsset]
  );

  const data = useAssetsToBorrowData(poolData?.assets);

  const columns: ColumnDef<AssetToBorrowRowData>[] = useMemo(() => {
    return [
      {
        accessorFn: (row) => row.asset,
        cell: ({ getValue }) => <Asset asset={getValue<MarketData>()} poolChainId={chainId} />,
        filterFn: assetFilter,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{ASSET}</TableHeaderCell>,
        id: ASSET,
        sortingFn: assetSort
      },
      {
        accessorFn: (row) => row.available,
        cell: ({ getValue }) => (
          <Available asset={getValue<MarketData>()} maxBorrowAmounts={maxBorrowAmounts} />
        ),
        enableSorting: false,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{AVAILABLE}</TableHeaderCell>,
        id: AVAILABLE
      },
      {
        accessorFn: (row) => row.aprVariable,
        cell: ({ getValue }) => (
          <AprVariable asset={getValue<MarketData>()} borrowApyPerAsset={borrowApyPerAsset} />
        ),
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{APR_VARIABLE}</TableHeaderCell>,
        id: APR_VARIABLE,
        sortingFn: assetSort
      },
      {
        accessorFn: (row) => row.aprStable,
        cell: ({ getValue }) => (
          <AprStable asset={getValue<MarketData>()} borrowApyPerAsset={borrowApyPerAsset} />
        ),
        enableSorting: false,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{APR_STABLE}</TableHeaderCell>,
        id: APR_STABLE,
        sortingFn: assetSort
      },
      {
        cell: ({ row }) => {
          return (
            <HStack justifyContent={'flex-end'}>
              <Borrow
                asset={row.getValue(ASSET)}
                assets={assets}
                chainId={chainId}
                comptroller={comptroller}
                maxBorrowAmounts={maxBorrowAmounts}
              />
              <Details asset={row.getValue(ASSET)} chainId={chainId} poolId={poolId} />
            </HStack>
          );
        },
        header: () => null,
        id: BORROW
      }
    ];
  }, [
    assetFilter,
    assetSort,
    assets,
    borrowApyPerAsset,
    chainId,
    comptroller,
    maxBorrowAmounts,
    poolId
  ]);

  const table = useReactTable({
    columns,
    data,
    enableSortingRemoval: false,
    getColumnCanGlobalFilter: () => true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: assetFilter,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: onPagination,
    onSortingChange: setSorting,
    state: {
      globalFilter,
      pagination,
      sorting
    }
  });

  const { data: tableData } = useQuery(['AssetsToBorrowTableData', table], () => {
    return {
      canNextPage: table.getCanNextPage(),
      canPreviousPage: table.getCanPreviousPage(),
      filteredRows: table.getFilteredRowModel().rows,
      headerGroups: table.getHeaderGroups(),
      rows: table.getRowModel().rows
    };
  });

  const { cCard, cIPage, cIRow } = useColors();

  useEffect(() => {
    if (searchText) {
      setGlobalFilter([...globalFilter, SEARCH]);
    } else {
      setGlobalFilter(globalFilter.filter((f) => f !== SEARCH));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  return (
    <Flex direction="column" gap="24px">
      <Flex
        alignItems="center"
        flexWrap="wrap"
        gap={4}
        justifyContent={['center', 'center', 'space-between']}
        width="100%"
      >
        <Text size="xl">Assets to Borrow</Text>
        <Flex
          alignItems="center"
          className="searchAsset"
          direction="row"
          gap={2}
          justifyContent="center"
        >
          <SearchInput
            inputProps={{ width: '120px' }}
            onSearch={(searchText) => setSearchText(searchText)}
            placeholder="Search by asset"
          />
          <Center height={5}>
            <Divider bg={cIPage.dividerColor} orientation="vertical" width="2px" />
          </Center>
          <HStack>
            <Text size="md" width="max-content">
              Sort by
            </Text>
            <ChevronDownIcon />
          </HStack>
        </Flex>
      </Flex>
      {data.length === 0 ? (
        <Flex>
          <Text color={'iGray'}>No assets to borrow</Text>
        </Flex>
      ) : tableData ? (
        <>
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
