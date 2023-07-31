import { ChevronLeftIcon, ChevronRightIcon, InfoOutlineIcon } from '@chakra-ui/icons';
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
  Tr,
  VStack
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
import { utils } from 'ethers';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import * as React from 'react';

import { Apr } from '@ui/components/pages/PoolPage/YourBorrows/Apr';
import { AprType } from '@ui/components/pages/PoolPage/YourBorrows/AprType';
import { Asset } from '@ui/components/pages/PoolPage/YourBorrows/Asset';
import { Borrow } from '@ui/components/pages/PoolPage/YourBorrows/Borrow';
import { Debt } from '@ui/components/pages/PoolPage/YourBorrows/Debt';
import { Repay } from '@ui/components/pages/PoolPage/YourBorrows/Repay';
import { CIconButton } from '@ui/components/shared/Button';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { SearchInput } from '@ui/components/shared/SearchInput';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { TableHeaderCell } from '@ui/components/shared/TableHeaderCell';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import {
  APR,
  APR_TYPE,
  ASSET,
  BORROW,
  COLLATERAL,
  DEBT,
  MARKETS_COUNT_PER_PAGE,
  REPAY,
  SEARCH,
  YOUR_BALANCE
} from '@ui/constants/index';
import { useBorrowAPYs } from '@ui/hooks/useBorrowAPYs';
import { useColors } from '@ui/hooks/useColors';
import { useYourBorrowsRowData } from '@ui/hooks/yourBorrows/useYourBorrowsRowData';
import type { MarketData, PoolData } from '@ui/types/TokensDataMap';
import { smallFormatter, smallUsdFormatter } from '@ui/utils/bigUtils';

export type YourBorrowRowData = {
  apr: MarketData;
  aprType: MarketData;
  asset: MarketData;
  debt: MarketData;
};

export const YourBorrows = ({ poolData }: { poolData: PoolData }) => {
  const { chainId, assets, totalBorrowBalanceNative, totalBorrowBalanceFiat, comptroller } =
    poolData;
  const [sorting, setSorting] = useState<SortingState>([{ desc: true, id: ASSET }]);
  const [pagination, onPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: MARKETS_COUNT_PER_PAGE[0]
  });
  const [globalFilter, setGlobalFilter] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const { data: borrowApyPerAsset } = useBorrowAPYs(assets, chainId);

  const totalBorrowApy = useMemo(() => {
    if (borrowApyPerAsset) {
      if (totalBorrowBalanceNative === 0)
        return { estimatedPerAsset: [], estimatedUsd: 0, totalApy: 0, totalBorrowed: 0 };

      let _totalApy = 0;
      const _estimatedPerAsset: {
        apy: number;
        borrowed: string;
        estimated: number;
        symbol: string;
        underlying: string;
      }[] = [];

      assets.map((asset) => {
        _totalApy +=
          (borrowApyPerAsset[asset.cToken] * asset.borrowBalanceNative) / totalBorrowBalanceNative;

        if (asset.borrowBalanceNative !== 0) {
          const borrowedNum = parseFloat(
            utils.formatUnits(asset.borrowBalance, asset.underlyingDecimals.toNumber())
          );
          _estimatedPerAsset.push({
            apy: borrowApyPerAsset[asset.cToken] * 100,
            borrowed: smallFormatter(borrowedNum),
            estimated: borrowApyPerAsset[asset.cToken] * borrowedNum,
            symbol: asset.underlyingSymbol,
            underlying: asset.underlyingToken
          });
        }
      });

      const _estimatedUsd = totalBorrowBalanceFiat * _totalApy;

      return {
        estimatedPerAsset: _estimatedPerAsset,
        estimatedUsd: _estimatedUsd,
        totalApy: _totalApy * 100,
        totalBorrowed: totalBorrowBalanceFiat
      };
    }

    return undefined;
  }, [assets, totalBorrowBalanceNative, totalBorrowBalanceFiat, borrowApyPerAsset]);

  const assetFilter: FilterFn<YourBorrowRowData> = useCallback(
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

  const assetSort: SortingFn<YourBorrowRowData> = useCallback(
    (rowA, rowB, columnId) => {
      if (columnId === ASSET) {
        return rowB.original.asset.underlyingSymbol.localeCompare(
          rowA.original.asset.underlyingSymbol
        );
      } else if (columnId === DEBT) {
        return rowA.original.asset.borrowBalanceFiat > rowB.original.asset.borrowBalanceFiat
          ? 1
          : -1;
      } else if (columnId === APR) {
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
    [borrowApyPerAsset]
  );

  const data = useYourBorrowsRowData(assets);

  const columns: ColumnDef<YourBorrowRowData>[] = useMemo(() => {
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
        accessorFn: (row) => row.debt,
        cell: ({ getValue }) => <Debt asset={getValue<MarketData>()} chainId={chainId} />,
        enableSorting: false,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{YOUR_BALANCE}</TableHeaderCell>,
        id: YOUR_BALANCE
      },
      {
        accessorFn: (row) => row.apr,
        cell: ({ getValue }) => (
          <Apr asset={getValue<MarketData>()} borrowApyPerAsset={borrowApyPerAsset} />
        ),
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{APR}</TableHeaderCell>,
        id: APR,
        sortingFn: assetSort
      },
      {
        accessorFn: (row) => row.aprType,
        cell: ({ getValue }) => <AprType asset={getValue<MarketData>()} />,
        enableSorting: false,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{APR_TYPE}</TableHeaderCell>,
        id: APR_TYPE,
        sortingFn: assetSort
      },
      {
        cell: ({ row }) => {
          return (
            <Repay
              asset={row.getValue(ASSET)}
              assets={assets}
              chainId={chainId}
              comptroller={comptroller}
            />
          );
        },
        header: () => null,
        id: REPAY
      },
      {
        cell: ({ row }) => {
          return <Borrow asset={row.getValue(ASSET)} />;
        },
        header: () => null,
        id: BORROW
      }
    ];
  }, [assetFilter, assetSort, assets, borrowApyPerAsset, chainId, comptroller]);

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

  const { data: tableData } = useQuery(['YourBorrowsTableData', table], () => {
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
        <Text size="xl">Your Borrows</Text>
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
        </Flex>
      </Flex>
      {totalBorrowBalanceNative === 0 ? (
        <Flex>
          <Text color={'iGray'}>Nothing borrowed yet</Text>
        </Flex>
      ) : (
        <>
          <Flex flexWrap="wrap" gap="32px">
            <VStack alignItems="flex-start">
              <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                Balance
              </Text>
              <Text color={'iWhite'} size="lg">
                {smallUsdFormatter(totalBorrowBalanceFiat, true)}
              </Text>
            </VStack>
            <VStack alignItems="flex-start">
              <Flex direction="row" gap={1} height="18px">
                <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                  APR
                </Text>
                <SimpleTooltip
                  label={
                    'The expected annual percentage yield(APY) on borrowed assets received by this account, assuming the current variable interest rates on all borrowed assets remains constant'
                  }
                >
                  <InfoOutlineIcon
                    color={'iLightGray'}
                    height="fit-content"
                    ml={1}
                    verticalAlign="baseLine"
                  />
                </SimpleTooltip>
              </Flex>

              <PopoverTooltip
                body={
                  <VStack alignItems="flex-start">
                    {totalBorrowApy && totalBorrowApy.estimatedPerAsset.length > 0 ? (
                      <VStack pt={2} width="100%">
                        <Divider bg={cCard.dividerColor} />

                        <VStack alignItems="flex-start" pt={2} width="100%">
                          {totalBorrowApy.estimatedPerAsset.map((data) => {
                            return (
                              <HStack key={data.underlying}>
                                <TokenIcon
                                  address={data.underlying}
                                  chainId={poolData.chainId}
                                  size="sm"
                                />
                                <Text whiteSpace="nowrap">
                                  {data.borrowed} {data.symbol} at {data.apy.toFixed(2)}% APY yield{' '}
                                  <b>
                                    {smallFormatter(data.estimated)} {data.symbol}/year
                                  </b>
                                </Text>
                              </HStack>
                            );
                          })}
                          <Divider bg={cCard.borderColor} />
                          <HStack alignSelf="self-end">
                            <Text whiteSpace="nowrap">
                              {smallFormatter(totalBorrowApy.totalBorrowed)} USD at{' '}
                              {totalBorrowApy.totalApy.toFixed(2)}% APY yield{' '}
                              <b>{smallFormatter(totalBorrowApy.estimatedUsd)} USD/year</b>
                            </Text>
                          </HStack>
                        </VStack>
                      </VStack>
                    ) : null}
                  </VStack>
                }
                contentProps={{ minWidth: { base: '300px', sm: '350px' }, p: 2 }}
              >
                <Text size={'lg'}>
                  {totalBorrowApy ? totalBorrowApy.totalApy.toFixed(2) + '%' : '-'}
                </Text>
              </PopoverTooltip>
            </VStack>
            <VStack alignItems="flex-start">
              <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                Borrow Power Used
              </Text>
              <Text color={'iWhite'} size="lg">
                68.52%
              </Text>
            </VStack>
          </Flex>
          <Center>
            <Divider bg={cIPage.dividerColor} orientation="horizontal" />
          </Center>
          {tableData ? (
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
                            <HStack
                              justifyContent={header.id === COLLATERAL ? 'center' : 'flex-start'}
                            >
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
                  ) : poolData.assets.length === 0 ? (
                    <Tr>
                      <Td border="none" colSpan={tableData.headerGroups[0].headers.length}>
                        <Center py={8}>There are no assets to supply.</Center>
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
                    {(pagination.pageIndex + 1) * pagination.pageSize >
                    tableData.filteredRows.length
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
        </>
      )}
    </Flex>
  );
};
