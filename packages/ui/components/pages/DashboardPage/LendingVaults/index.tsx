import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
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
import * as React from 'react';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Assets } from './Assets';
import { Claim } from './Claim';
import { Liquidity } from './Liquidity';
import { LendingManage } from './Manage';
import { Network } from './Network';
import { NetworkFilterDropdown } from './NetworkFilterDropdown';
import { PoolName } from './PoolName';
import { SupplyBalance } from './SupplyBalance';
import { TotalSupply } from './TotalSupply';

import { Banner } from '@ui/components/shared/Banner';
import { CIconButton } from '@ui/components/shared/Button';
import { CardBox } from '@ui/components/shared/IonicBox';
import { SearchInput } from '@ui/components/shared/SearchInput';
import { TableHeaderCell } from '@ui/components/shared/TableHeaderCell';
import {
  ALL_NETWORKS,
  ALL_POOLS,
  ASSETS,
  IONIC_LOCALSTORAGE_KEYS,
  LIQUIDITY,
  NETWORK,
  POOL_NAME,
  POOLS_COLUMNS,
  POOLS_COUNT_PER_PAGE,
  SEARCH,
  SIMPLE_MODE,
  SUPPLY,
  SUPPLY_BALANCE,
  TOTAL_SUPPLY,
  YOUR_BALANCE
} from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useCrossPools } from '@ui/hooks/ionic/useCrossPools';
import { useLendingPools } from '@ui/hooks/lend/useLendingPools';
import { useLoadingStatusPerChain } from '@ui/hooks/pools/useLoadingStatusPerChain';
import { useEnabledChains } from '@ui/hooks/useChainConfig';
import { useColors } from '@ui/hooks/useColors';
import type { LendingFilter, NetworkFilter } from '@ui/types/ComponentPropsType';
import type { PoolData } from '@ui/types/TokensDataMap';

export type PoolRowData = {
  assets: PoolData;
  liquidity: PoolData;
  network: PoolData;
  poolName: PoolData;
  supplyBalance: PoolData;
  totalSupply: PoolData;
};

export const LendingVaults = () => {
  const enabledChains = useEnabledChains();
  const { isAllLoading, poolsPerChain, allPools, error } = useCrossPools([...enabledChains]);
  const { address } = useMultiIonic();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilteredPools, setSelectedFilteredPools] = useState<PoolData[]>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { desc: true, id: address ? SUPPLY_BALANCE : TOTAL_SUPPLY }
  ]);
  const [pagination, onPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: POOLS_COUNT_PER_PAGE[0]
  });
  const [networkFilter, setNetworkFilter] = useState<NetworkFilter[]>([ALL_NETWORKS]);
  const [globalFilter, setGlobalFilter] = useState<LendingFilter[]>([...networkFilter]);
  const [searchText, setSearchText] = useState('');
  const mounted = useRef(false);

  const loadingStatusPerChain = useLoadingStatusPerChain(poolsPerChain);

  useQuery(
    [
      'selectedFilteredPools',
      globalFilter,
      allPools.map((pool) => pool.comptroller),
      Object.values(poolsPerChain).map((query) => query.data?.map((pool) => pool.comptroller))
    ],
    () => {
      const pools: PoolData[] = [];

      if (globalFilter.includes(ALL_NETWORKS)) {
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

  const globalFilterFn: FilterFn<PoolRowData> = useCallback(
    (row, columnId, value) => {
      const pool = row.original.network;
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
        if (value.includes(ALL_NETWORKS) || value.includes(pool.chainId)) {
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

  const poolSort: SortingFn<PoolRowData> = (rowA, rowB, columnId) => {
    if (columnId === NETWORK) {
      return rowB.original.network.chainId > rowA.original.network.chainId ? 1 : -1;
    } else if (columnId === POOL_NAME) {
      return rowB.original.network.name.localeCompare(rowA.original.network.name);
    } else if (columnId === SUPPLY_BALANCE) {
      return rowA.original.network.totalSupplyBalanceFiat >
        rowB.original.network.totalSupplyBalanceFiat
        ? 1
        : -1;
    } else if (columnId === LIQUIDITY) {
      return rowA.original.network.totalLiquidityFiat > rowB.original.network.totalLiquidityFiat
        ? 1
        : -1;
    } else if (columnId === TOTAL_SUPPLY) {
      return rowA.original.network.totalSuppliedFiat > rowB.original.network.totalSuppliedFiat
        ? 1
        : -1;
    } else {
      return 1;
    }
  };

  const data: PoolRowData[] = useLendingPools(allPools);

  const columns: ColumnDef<PoolRowData>[] = useMemo(() => {
    return [
      {
        accessorFn: (row) => row.network,
        cell: ({ getValue }) => <Network chainId={getValue<PoolData>().chainId} />,
        enableHiding: false,
        filterFn: globalFilterFn,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{NETWORK}</TableHeaderCell>,
        id: NETWORK,
        sortingFn: poolSort
      },
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
        accessorFn: (row) => row.totalSupply,
        cell: ({ getValue }) => <TotalSupply pool={getValue<PoolData>()} />,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{TOTAL_SUPPLY}</TableHeaderCell>,
        id: TOTAL_SUPPLY,
        sortingFn: poolSort
      },
      {
        accessorFn: (row) => row.liquidity,
        cell: ({ getValue }) => <Liquidity pool={getValue<PoolData>()} />,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{LIQUIDITY}</TableHeaderCell>,
        id: LIQUIDITY,
        sortingFn: poolSort
      },
      {
        accessorFn: (row) => row.supplyBalance,
        cell: ({ getValue }) => <SupplyBalance pool={getValue<PoolData>()} />,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{YOUR_BALANCE}</TableHeaderCell>,
        id: YOUR_BALANCE,
        sortingFn: poolSort
      },
      {
        cell: ({ row }) => {
          return (
            <HStack>
              <Claim pool={row.getValue(NETWORK)} />
              <LendingManage poolData={row.getValue(NETWORK)} />
            </HStack>
          );
        },
        header: () => null,
        id: SUPPLY
      }
    ];
  }, [globalFilterFn]);

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
    globalFilterFn: globalFilterFn,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: onPagination,
    onSortingChange: setSorting,
    state: {
      globalFilter,
      pagination,
      sorting
    }
  });

  const { data: tableData } = useQuery(['LendingPoolsTableData', table], () => {
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
    if (globalFilter.includes(SEARCH)) {
      setGlobalFilter([...networkFilter, SEARCH]);
    } else {
      setGlobalFilter([...networkFilter]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkFilter]);

  const onNetworkFilter = (filter: NetworkFilter) => {
    let _networkFilter: NetworkFilter[] = [];

    if (networkFilter.includes(filter)) {
      if (filter === ALL_NETWORKS) {
        _networkFilter = [enabledChains[0]];
      } else {
        _networkFilter = networkFilter.filter((f) => f !== filter);

        if (_networkFilter.length === 0) {
          _networkFilter = [ALL_NETWORKS];
        }
      }
    } else {
      if (networkFilter.includes(ALL_NETWORKS)) {
        _networkFilter = [filter];
      } else if (
        filter === ALL_NETWORKS ||
        enabledChains.length === networkFilter.filter((f) => f !== ALL_NETWORKS).length + 1
      ) {
        _networkFilter = [ALL_NETWORKS];
      } else {
        _networkFilter = [...networkFilter, filter];
      }
    }

    setNetworkFilter(_networkFilter);
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
      const _globalFilter = (obj.globalFilter as LendingFilter[]) || [
        ALL_NETWORKS,
        ALL_POOLS,
        SIMPLE_MODE
      ];
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

  if (error && error.code !== 'NETWORK_ERROR') {
    return (
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
            text: `Unable to retrieve Pools. Please try again later.`
          }
        ]}
        title={error.reason ? error.reason : 'Unexpected Error'}
      />
    );
  }

  return (
    <CardBox mt={{ base: '24px' }} overflowX="auto" width="100%">
      <Flex direction="column" gap="24px">
        <Flex
          alignItems="center"
          flexWrap="wrap"
          gap={4}
          justifyContent={['center', 'center', 'space-between']}
          width="100%"
        >
          <Text size="xl">Lending Pools</Text>
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
              placeholder="Search by asset or pool name"
            />
            <Center height={5}>
              <Divider bg={cIPage.dividerColor} orientation="vertical" width="2px" />
            </Center>
            <NetworkFilterDropdown
              loadingStatusPerChain={loadingStatusPerChain}
              networkFilter={networkFilter}
              onNetworkFilter={onNetworkFilter}
            />
          </Flex>
        </Flex>
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
                  <Text size="md">Pools Per Page</Text>
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
