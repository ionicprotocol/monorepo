import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  Center,
  Divider,
  Flex,
  Hide,
  HStack,
  Select,
  Skeleton,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react';
import type { SupportedChains } from '@ionicprotocol/types';
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
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { useRouter } from 'next/router';
import * as React from 'react';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Assets } from '@ui/components/pages/PoolsPage/PoolsList/Assets';
import { BorrowBalance } from '@ui/components/pages/PoolsPage/PoolsList/BorrowBalance';
import { PoolName } from '@ui/components/pages/PoolsPage/PoolsList/PoolName';
import { SupplyBalance } from '@ui/components/pages/PoolsPage/PoolsList/SupplyBalance';
import { TotalBorrow } from '@ui/components/pages/PoolsPage/PoolsList/TotalBorrow';
import { TotalSupply } from '@ui/components/pages/PoolsPage/PoolsList/TotalSupply';
import { Banner } from '@ui/components/shared/Banner';
import { CIconButton } from '@ui/components/shared/Button';
import { CardBox } from '@ui/components/shared/IonicBox';
import { SearchInput } from '@ui/components/shared/SearchInput';
import { TableHeaderCell } from '@ui/components/shared/TableHeaderCell';
import {
  ALL,
  ASSETS,
  BORROW_BALANCE,
  IONIC_LOCALSTORAGE_KEYS,
  POOL_NAME,
  POOLS_COLUMNS,
  POOLS_COUNT_PER_PAGE,
  SEARCH,
  SUPPLY_BALANCE,
  TOTAL_BORROW,
  TOTAL_SUPPLY
} from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useCrossPools } from '@ui/hooks/ionic/useCrossPools';
import { useAllPoolsData } from '@ui/hooks/poolsList/useAllPoolsData';
import { useEnabledChains } from '@ui/hooks/useChainConfig';
import { useColors } from '@ui/hooks/useColors';
import type { PoolData } from '@ui/types/TokensDataMap';

export type BorrowsRowData = {
  borrowApr: PoolData;
  borrowingAssets: PoolData;
  collateralApr: PoolData;
  collateralAssets: PoolData;
  myBorrow: PoolData;
  myCollateral: PoolData;
  network: PoolData;
  rewardsApr: PoolData;
  utilization: PoolData;
};

export const Borrows = () => {
  const enabledChains = useEnabledChains();
  const { isAllLoading, poolsPerChain, allPools, error } = useCrossPools([...enabledChains]);
  const { address, setGlobalLoading } = useMultiIonic();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilteredPools, setSelectedFilteredPools] = useState<PoolData[]>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { desc: true, id: address ? SUPPLY_BALANCE : TOTAL_SUPPLY }
  ]);
  const [pagination, onPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: POOLS_COUNT_PER_PAGE[0]
  });
  const [globalFilter, setGlobalFilter] = useState<(SupportedChains | string)[]>([ALL]);
  const [searchText, setSearchText] = useState('');
  const mounted = useRef(false);
  const router = useRouter();

  useQuery(
    [
      'selectedFilteredPools',
      globalFilter,
      allPools.map((pool) => pool.comptroller),
      Object.values(poolsPerChain).map((query) => query.data?.map((pool) => pool.comptroller))
    ],
    () => {
      const pools: PoolData[] = [];

      if (globalFilter.includes(ALL)) {
        setSelectedFilteredPools([...allPools]);
      } else {
        globalFilter.map((filter) => {
          const data = poolsPerChain[filter.toString()]?.data;
          if (data) {
            pools.push(...data);
          }
        });

        setSelectedFilteredPools(pools);
      }

      return null;
    },
    {
      enabled: Object.values(poolsPerChain).length > 0 && allPools.length > 0
    }
  );

  const poolFilter: FilterFn<BorrowsRowData> = useCallback(
    (row, columnId, value) => {
      const pool = row.original.poolName;
      const namesAndSymbols: string[] = [];
      pool.assets.map((asset) => {
        namesAndSymbols.push(
          asset.underlyingName.toLowerCase(),
          asset.underlyingSymbol.toLowerCase()
        );
      });
      if (
        !searchText ||
        (value.includes(SEARCH) &&
          (pool.comptroller.toLowerCase().includes(searchText.toLowerCase()) ||
            pool.name.toLowerCase().includes(searchText.toLowerCase()) ||
            namesAndSymbols.some((ns) => ns.includes(searchText.toLowerCase()))))
      ) {
        if (value.includes(ALL) || value.includes(pool.chainId)) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    },
    [searchText]
  );

  const poolSort: SortingFn<BorrowsRowData> = (rowA, rowB, columnId) => {
    if (columnId === POOL_NAME) {
      return rowB.original.poolName.name.localeCompare(rowA.original.poolName.name);
    } else if (columnId === SUPPLY_BALANCE) {
      return rowA.original.poolName.totalSupplyBalanceFiat >
        rowB.original.poolName.totalSupplyBalanceFiat
        ? 1
        : -1;
    } else if (columnId === BORROW_BALANCE) {
      return rowA.original.poolName.totalBorrowBalanceFiat >
        rowB.original.poolName.totalBorrowBalanceFiat
        ? 1
        : -1;
    } else if (columnId === TOTAL_SUPPLY) {
      return rowA.original.poolName.totalSuppliedFiat > rowB.original.poolName.totalSuppliedFiat
        ? 1
        : -1;
    } else if (columnId === TOTAL_BORROW) {
      return rowA.original.poolName.totalBorrowedFiat > rowB.original.poolName.totalBorrowedFiat
        ? 1
        : -1;
    } else {
      return 1;
    }
  };

  const data: BorrowsRowData[] = useAllPoolsData(allPools);

  const columns: ColumnDef<BorrowsRowData>[] = useMemo(() => {
    return [
      {
        accessorFn: (row) => row.poolName,
        cell: ({ getValue }) => (
          <PoolName
            chainId={getValue<PoolData>().chainId}
            comptroller={getValue<PoolData>().comptroller}
            poolId={getValue<PoolData>().id}
            poolName={getValue<PoolData>().name}
          />
        ),
        enableHiding: false,
        filterFn: poolFilter,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{POOL_NAME}</TableHeaderCell>,
        id: POOL_NAME,
        sortingFn: poolSort
      },
      {
        accessorFn: (row) => row.assets,
        cell: ({ getValue }) => <Assets pool={getValue<PoolData>()} />,
        enableSorting: false,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{ASSETS}</TableHeaderCell>,
        id: ASSETS
      },
      {
        accessorFn: (row) => row.supplyBalance,
        cell: ({ getValue }) => <SupplyBalance pool={getValue<PoolData>()} />,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{SUPPLY_BALANCE}</TableHeaderCell>,
        id: SUPPLY_BALANCE,
        sortingFn: poolSort
      },
      {
        accessorFn: (row) => row.borrowBalance,
        cell: ({ getValue }) => <BorrowBalance pool={getValue<PoolData>()} />,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{BORROW_BALANCE}</TableHeaderCell>,
        id: BORROW_BALANCE,
        sortingFn: poolSort
      },
      {
        accessorFn: (row) => row.totalSupply,
        cell: ({ getValue }) => <TotalSupply pool={getValue<PoolData>()} />,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{TOTAL_SUPPLY}</TableHeaderCell>,
        id: TOTAL_SUPPLY,
        sortingFn: poolSort
      },
      {
        accessorFn: (row) => row.totalBorrow,
        cell: ({ getValue }) => <TotalBorrow pool={getValue<PoolData>()} />,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{TOTAL_BORROW}</TableHeaderCell>,
        id: TOTAL_BORROW,
        sortingFn: poolSort
      }
    ];
  }, [poolFilter]);

  const table = useReactTable({
    columns,
    data,
    enableSortingRemoval: false,
    getColumnCanGlobalFilter: () => true,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowCanExpand: () => true,
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: poolFilter,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: onPagination,
    onSortingChange: setSorting,
    state: {
      globalFilter,
      pagination,
      sorting
    }
  });

  const { data: tableData } = useQuery(['PoolsTableData', table], () => {
    return {
      canNextPage: table.getCanNextPage(),
      canPreviousPage: table.getCanPreviousPage(),
      filteredRows: table.getFilteredRowModel().rows,
      headerGroups: table.getHeaderGroups(),
      rows: table.getRowModel().rows
    };
  });

  const { cCard, cIPage, cIRow } = useColors();

  const onFilter = (filter: SupportedChains | string) => {
    let _globalFilter: (SupportedChains | string)[] = [];

    if (globalFilter.includes(filter)) {
      if (filter === ALL) {
        _globalFilter = [enabledChains[0]];
      } else {
        _globalFilter = globalFilter.filter((f) => f !== filter);

        if (_globalFilter.length === 0) {
          _globalFilter = [ALL];
        }
      }
    } else {
      if (globalFilter.includes(ALL)) {
        _globalFilter = [filter];
      } else if (
        filter === ALL ||
        enabledChains.length === globalFilter.filter((f) => f !== ALL && f != SEARCH).length + 1
      ) {
        _globalFilter = [ALL];
      } else {
        _globalFilter = [...globalFilter, filter];
      }
    }

    if (globalFilter.includes(SEARCH)) {
      setGlobalFilter([..._globalFilter, SEARCH]);
    } else {
      setGlobalFilter([..._globalFilter]);
    }
  };

  useEffect(() => {
    if (searchText) {
      setGlobalFilter([...globalFilter, SEARCH]);
    } else {
      setGlobalFilter(globalFilter.filter((f) => f !== SEARCH));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  useEffect(() => {
    if (mounted.current) {
      const oldData = localStorage.getItem(IONIC_LOCALSTORAGE_KEYS);
      let oldObj;
      if (oldData) {
        oldObj = JSON.parse(oldData);
      }
      const data = { ...oldObj, globalFilter, searchText, sorting };
      localStorage.setItem(IONIC_LOCALSTORAGE_KEYS, JSON.stringify(data));
    }
  }, [searchText, globalFilter, sorting]);

  useQuery(
    [
      'statusPerChain',
      globalFilter,
      isAllLoading,
      Object.values(poolsPerChain).map((query) => {
        return [query.data?.map((pool) => pool.comptroller), query.isLoading];
      })
    ],
    () => {
      const selectedChainIds = Object.keys(poolsPerChain).filter((chainId) =>
        globalFilter.includes(Number(chainId))
      );
      if (selectedChainIds.length > 0) {
        let _isLoading = true;
        selectedChainIds.map((chainId) => {
          _isLoading = _isLoading && poolsPerChain[chainId].isLoading;
        });
        setIsLoading(_isLoading);
      } else {
        setIsLoading(isAllLoading);
      }

      return null;
    },
    {
      enabled: Object.values(poolsPerChain).length > 0
    }
  );

  useEffect(() => {
    mounted.current = true;

    const data = localStorage.getItem(IONIC_LOCALSTORAGE_KEYS);
    if (data && mounted.current) {
      const obj = JSON.parse(data);
      const _globalFilter = (obj.globalFilter as (SupportedChains | string)[]) || [ALL];
      setGlobalFilter(_globalFilter);

      if (obj && obj.sorting && POOLS_COLUMNS.includes(obj.sorting[0].id)) {
        setSorting(obj.sorting);
      } else {
        setSorting([{ desc: true, id: TOTAL_SUPPLY }]);
      }
    }

    return () => {
      mounted.current = false;
    };
  }, []);

  return (
    <CardBox overflowX="auto" width="100%">
      <Flex direction="column" gap="24px">
        <Flex
          alignItems="center"
          flexWrap="wrap"
          gap={4}
          justifyContent={['center', 'center', 'space-between']}
          width="100%"
        >
          <Text size="xl">Borrows</Text>
          <Flex
            alignItems="center"
            className="searchAsset"
            direction="row"
            gap={2}
            justifyContent="center"
          >
            <SearchInput
              inputProps={{ width: '220px' }}
              onSearch={(searchText) => setSearchText(searchText)}
              placeholder="Search by asset name, symbol or address"
            />
            <Center height={5}>
              <Divider bg={cIPage.dividerColor} orientation="vertical" width="2px" />
            </Center>
            <HStack>
              <Text size="md" width="max-content">
                All Networks
              </Text>
              <ChevronDownIcon />
            </HStack>
          </Flex>
        </Flex>
        {error && error.code !== 'NETWORK_ERROR' ? (
          <Banner
            alertDescriptionProps={{ fontSize: 'lg' }}
            alertIconProps={{ boxSize: 12 }}
            alertProps={{
              alignItems: 'center',
              flexDirection: 'column',
              gap: 4,
              height: '2xs',
              justifyContent: 'center',
              status: 'warning',
              textAlign: 'center'
            }}
            descriptions={[
              {
                text: `Fetching borrows error. Please try again later.`
              }
            ]}
            title={error.reason ? error.reason : 'Unexpected Error'}
          />
        ) : null}
        {tableData ? (
          <>
            {!isLoading ? (
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
                  {tableData.rows && tableData.rows.length !== 0 ? (
                    tableData.rows.map((row) => (
                      <Fragment key={row.id}>
                        <Tr
                          _hover={{ bg: cIRow.bgColor }}
                          borderRadius={{ base: '20px' }}
                          cursor="pointer"
                          key={row.id}
                          onClick={() => {
                            setGlobalLoading(true);
                            router.push(
                              `/${row.original.poolName.chainId}/pool/${row.original.poolName.id}`
                            );
                          }}
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
                  ) : selectedFilteredPools.length === 0 ? (
                    <Tr>
                      <Td border="none" colSpan={tableData.headerGroups[0].headers.length}>
                        <Center py={8}>There are no pools.</Center>
                      </Td>
                    </Tr>
                  ) : (
                    <Tr>
                      <Td border="none" colSpan={tableData.headerGroups[0].headers.length}>
                        <Center py={8}>There are no results</Center>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            ) : (
              <Stack>
                <Skeleton height={16} />
                <Skeleton height={60} />
              </Stack>
            )}
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
                  <Text size="md">Borrows Per Page</Text>
                </Hide>
                <Select
                  maxW="max-content"
                  onChange={(e) => {
                    table.setPageSize(Number(e.target.value));
                  }}
                  value={pagination.pageSize}
                >
                  {POOLS_COUNT_PER_PAGE.map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </Select>
              </HStack>
              <HStack gap={2}>
                <Text size="md">
                  {!tableData || tableData.filteredRows.length === 0
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
    </CardBox>
  );
};
