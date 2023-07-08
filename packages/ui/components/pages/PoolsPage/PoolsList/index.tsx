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
  Switch,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import type { SupportedChains } from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';
import type {
  ColumnDef,
  FilterFn,
  PaginationState,
  SortingFn,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useRouter } from 'next/router';
import * as React from 'react';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';

import { useAllPoolsData } from './useAllPoolsData';
import { useLoadingStatusPerChain } from './useLoadingStatusPerChain';

import { AdditionalInfo } from '@ui/components/pages/PoolsPage/PoolsList/AdditionalInfo';
import { Assets } from '@ui/components/pages/PoolsPage/PoolsList/Assets';
import { BorrowBalance } from '@ui/components/pages/PoolsPage/PoolsList/BorrowBalance';
import { Chain } from '@ui/components/pages/PoolsPage/PoolsList/Chain';
import { ChainFilterButtons } from '@ui/components/pages/PoolsPage/PoolsList/ChainFilterButtons';
import { ChainFilterDropdown } from '@ui/components/pages/PoolsPage/PoolsList/ChainFilterDropdown';
import { ExpanderArrow } from '@ui/components/pages/PoolsPage/PoolsList/ExpanderArrow';
import { PoolName } from '@ui/components/pages/PoolsPage/PoolsList/PoolName';
import { SupplyBalance } from '@ui/components/pages/PoolsPage/PoolsList/SupplyBalance';
import { TotalBorrow } from '@ui/components/pages/PoolsPage/PoolsList/TotalBorrow';
import { TotalSupply } from '@ui/components/pages/PoolsPage/PoolsList/TotalSupply';
import { Banner } from '@ui/components/shared/Banner';
import { CIconButton } from '@ui/components/shared/Button';
import { IonicBox } from '@ui/components/shared/IonicBox';
import { SearchInput } from '@ui/components/shared/SearchInput';
import { TableHeaderCell } from '@ui/components/shared/TableHeaderCell';
import {
  ALL,
  ASSETS,
  BORROW_BALANCE,
  CHAIN,
  EXPANDER,
  MIDAS_LOCALSTORAGE_KEYS,
  POOL_NAME,
  POOLS_COLUMNS,
  POOLS_COUNT_PER_PAGE,
  SEARCH,
  SUPPLY_BALANCE,
  TOTAL_BORROW,
  TOTAL_SUPPLY,
} from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useCrossFusePools } from '@ui/hooks/fuse/useCrossFusePools';
import { useEnabledChains } from '@ui/hooks/useChainConfig';
import { useColors } from '@ui/hooks/useColors';
import type { Err } from '@ui/types/ComponentPropsType';
import type { PoolData } from '@ui/types/TokensDataMap';

export type PoolRowData = {
  assets: PoolData;
  borrowBalance: PoolData;
  chain: PoolData;
  poolName: PoolData;
  supplyBalance: PoolData;
  totalBorrow: PoolData;
  totalSupply: PoolData;
};

const PoolsList = () => {
  const enabledChains = useEnabledChains();
  const { isLoading, poolsPerChain, allPools, error } = useCrossFusePools([...enabledChains]);
  const { address, setGlobalLoading } = useMultiMidas();
  const [err, setErr] = useState<Err | undefined>();
  const [isLoadingPerChain, setIsLoadingPerChain] = useState(false);
  const [selectedFilteredPools, setSelectedFilteredPools] = useState<PoolData[]>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { desc: true, id: address ? SUPPLY_BALANCE : TOTAL_SUPPLY },
  ]);
  const [pagination, onPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: POOLS_COUNT_PER_PAGE[0],
  });
  const [globalFilter, setGlobalFilter] = useState<(SupportedChains | string)[]>([ALL]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [searchText, setSearchText] = useState('');
  const mounted = useRef(false);
  const router = useRouter();

  const loadingStatusPerChain = useLoadingStatusPerChain(poolsPerChain);

  useQuery(
    [
      'selectedFilteredPools',
      globalFilter,
      allPools.map((pool) => pool.comptroller),
      Object.values(poolsPerChain).map((query) => query.data?.map((pool) => pool.comptroller)),
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
      enabled: Object.values(poolsPerChain).length > 0 && allPools.length > 0,
    }
  );

  const poolFilter: FilterFn<PoolRowData> = (row, columnId, value) => {
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
  };

  const poolSort: SortingFn<PoolRowData> = (rowA, rowB, columnId) => {
    if (columnId === CHAIN) {
      return rowB.original.poolName.chainId > rowA.original.poolName.chainId ? 1 : -1;
    } else if (columnId === POOL_NAME) {
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

  const data: PoolRowData[] = useAllPoolsData(allPools);

  const columns: ColumnDef<PoolRowData>[] = useMemo(() => {
    return [
      {
        accessorFn: (row) => row.chain,
        cell: ({ getValue }) => <Chain chainId={getValue<PoolData>().chainId} />,
        enableHiding: false,
        enableSorting: false,
        footer: (props) => props.column.id,
        header: () => null,
        id: CHAIN,
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
        filterFn: poolFilter,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>Pool Name</TableHeaderCell>,
        id: POOL_NAME,
        sortingFn: poolSort,
      },
      {
        accessorFn: (row) => row.assets,
        cell: ({ getValue }) => <Assets pool={getValue<PoolData>()} />,
        enableSorting: false,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>Assets</TableHeaderCell>,
        id: ASSETS,
      },
      {
        accessorFn: (row) => row.supplyBalance,
        cell: ({ getValue }) => <SupplyBalance pool={getValue<PoolData>()} />,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>Supply Balance</TableHeaderCell>,
        id: SUPPLY_BALANCE,
        sortingFn: poolSort,
      },
      {
        accessorFn: (row) => row.borrowBalance,
        cell: ({ getValue }) => <BorrowBalance pool={getValue<PoolData>()} />,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>Borrow Balance</TableHeaderCell>,
        id: BORROW_BALANCE,
        sortingFn: poolSort,
      },
      {
        accessorFn: (row) => row.totalSupply,
        cell: ({ getValue }) => <TotalSupply pool={getValue<PoolData>()} />,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>Total Supply</TableHeaderCell>,
        id: TOTAL_SUPPLY,
        sortingFn: poolSort,
      },
      {
        accessorFn: (row) => row.totalBorrow,
        cell: ({ getValue }) => <TotalBorrow pool={getValue<PoolData>()} />,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>Total Borrow</TableHeaderCell>,
        id: TOTAL_BORROW,
        sortingFn: poolSort,
      },
      {
        cell: ({ row }) => {
          return (
            <ExpanderArrow
              canExpand={row.getCanExpand()}
              getToggleExpandedHandler={row.getToggleExpandedHandler()}
              isExpanded={row.getIsExpanded()}
            />
          );
        },
        enableHiding: false,
        header: () => null,
        id: EXPANDER,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: onPagination,
    onSortingChange: setSorting,
    state: {
      columnVisibility,
      globalFilter,
      pagination,
      sorting,
    },
  });

  const { cCard, cIPage } = useColors();

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
      const oldData = localStorage.getItem(MIDAS_LOCALSTORAGE_KEYS);
      let oldObj;
      if (oldData) {
        oldObj = JSON.parse(oldData);
      }
      const arr: string[] = [];
      Object.entries(columnVisibility).map(([key, value]) => {
        if (value) {
          arr.push(key);
        }
      });
      const data = { ...oldObj, globalFilter, poolsListColumnVisibility: arr, searchText, sorting };
      localStorage.setItem(MIDAS_LOCALSTORAGE_KEYS, JSON.stringify(data));
    }
  }, [searchText, globalFilter, sorting, columnVisibility]);

  useQuery(
    [
      'statusPerChain',
      globalFilter,
      Object.values(poolsPerChain).map((query) => query.data?.map((pool) => pool.comptroller)),
    ],
    () => {
      const selectedChainId = Object.keys(poolsPerChain).find((chainId) =>
        globalFilter.includes(Number(chainId))
      );
      if (selectedChainId) {
        setErr(poolsPerChain[selectedChainId].error);
        setIsLoadingPerChain(poolsPerChain[selectedChainId].isLoading);
      } else {
        setErr(undefined);
        setIsLoadingPerChain(false);
      }

      return null;
    },
    {
      enabled: Object.values(poolsPerChain).length > 0,
    }
  );

  useEffect(() => {
    mounted.current = true;

    const data = localStorage.getItem(MIDAS_LOCALSTORAGE_KEYS);
    if (data && mounted.current) {
      const obj = JSON.parse(data);
      const _globalFilter = (obj.globalFilter as (SupportedChains | string)[]) || [ALL];
      setGlobalFilter(_globalFilter);

      if (obj && obj.sorting && POOLS_COLUMNS.includes(obj.sorting[0].id)) {
        setSorting(obj.sorting);
      } else {
        setSorting([{ desc: true, id: TOTAL_SUPPLY }]);
      }

      const columnVisibility: VisibilityState = {};

      if (obj.poolsListColumnVisibility && obj.poolsListColumnVisibility.length > 0) {
        POOLS_COLUMNS.map((columnId) => {
          if (obj.poolsListColumnVisibility.includes(columnId)) {
            columnVisibility[columnId] = true;
          } else {
            columnVisibility[columnId] = false;
          }
        });
      } else {
        POOLS_COLUMNS.map((columnId) => {
          columnVisibility[columnId] = true;
        });
      }

      setColumnVisibility(columnVisibility);
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
          textAlign: 'center',
        }}
        descriptions={[
          {
            text: `Unable to retrieve Pools. Please try again later.`,
          },
        ]}
        title={error.reason ? error.reason : 'Unexpected Error'}
      />
    );
  }

  return (
    <IonicBox mt={{ base: '24px' }} overflowX="auto" width="100%">
      <Flex
        alignItems="center"
        flexWrap="wrap-reverse"
        gap={3}
        justifyContent={['center', 'center', 'space-between']}
        mb={3}
        width="100%"
      >
        <ChainFilterButtons
          globalFilter={globalFilter}
          isLoading={isLoading}
          loadingStatusPerChain={loadingStatusPerChain}
          onFilter={onFilter}
          props={{ display: { base: 'none', lg: 'inline-flex' } }}
        />
        <ChainFilterDropdown
          globalFilter={globalFilter}
          isLoading={isLoading}
          loadingStatusPerChain={loadingStatusPerChain}
          onFilter={onFilter}
          props={{ display: { base: 'inline-flex', lg: 'none' } }}
        />
        <Flex
          alignItems="flex-end"
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
          <Center height={6}>
            <Divider bg={cIPage.dividerColor} orientation="vertical" width="2px" />
          </Center>
          <HStack>
            <Text size="md" width="max-content">
              Best APR
            </Text>
            <Switch
              h="20px"
              // isChecked={true}
              // isDisabled={isUpdating || !isEditableAdmin}
              ml="auto"
              // onChange={toggleBorrowState}
            />
          </HStack>
        </Flex>
      </Flex>
      {!isLoading && !isLoadingPerChain ? (
        <Table>
          <Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr borderBottomWidth={1} borderColor={cCard.dividerColor} key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <Th
                      border="none"
                      color={cCard.txtColor}
                      height={16}
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      px={table.getRowModel().rows && table.getRowModel().rows.length !== 0 ? 0 : 3}
                      py={4}
                      textTransform="capitalize"
                    >
                      <HStack
                        justifyContent={
                          header.column.id === POOL_NAME || header.column.id === ASSETS
                            ? 'flex-start'
                            : 'flex-end'
                        }
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
            {err && err.code !== 'NETWORK_ERROR' ? (
              <Tr>
                <Td border="none" colSpan={table.getHeaderGroups()[0].headers.length}>
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
                      textAlign: 'center',
                    }}
                    descriptions={[
                      {
                        text: `Unable to retrieve Pools. Please try again later.`,
                      },
                    ]}
                    title={err.reason ? err.reason : 'Unexpected Error'}
                  />
                </Td>
              </Tr>
            ) : table.getRowModel().rows && table.getRowModel().rows.length !== 0 ? (
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <Tr
                    _hover={{ bg: cCard.hoverBgColor }}
                    background={row.getIsExpanded() ? cCard.hoverBgColor : cCard.bgColor}
                    borderBottomWidth={row.getIsExpanded() ? 0 : 1}
                    borderColor={cCard.dividerColor}
                    cursor="pointer"
                    key={row.id}
                    onClick={() => {
                      setGlobalLoading(true);
                      router.push(
                        `/${row.original.poolName.chainId}/pool/${row.original.poolName.id}`
                      );
                    }}
                  >
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <Td
                          border="none"
                          height={16}
                          key={cell.id}
                          minW={10}
                          px={{
                            base: cell.column.id === POOL_NAME || cell.column.id === ASSETS ? 0 : 2,
                          }}
                          py={0}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </Td>
                      );
                    })}
                  </Tr>
                  {row.getIsExpanded() && (
                    <Tr
                      background={row.getIsExpanded() ? cCard.hoverBgColor : cCard.bgColor}
                      borderBottomStyle="solid"
                      borderBottomWidth={1}
                      borderColor={cCard.dividerColor}
                      borderTopStyle="dashed"
                      borderTopWidth={1}
                    >
                      {/* 2nd row is a custom 1 cell row */}
                      <Td border="none" colSpan={row.getVisibleCells().length}>
                        <AdditionalInfo row={row} />
                      </Td>
                    </Tr>
                  )}
                </Fragment>
              ))
            ) : selectedFilteredPools.length === 0 ? (
              <Tr>
                <Td border="none" colSpan={table.getHeaderGroups()[0].headers.length}>
                  <Center py={8}>There are no pools.</Center>
                </Td>
              </Tr>
            ) : (
              <Tr>
                <Td border="none" colSpan={table.getHeaderGroups()[0].headers.length}>
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
            {table.getFilteredRowModel().rows.length === 0
              ? 0
              : pagination.pageIndex * pagination.pageSize + 1}{' '}
            -{' '}
            {(pagination.pageIndex + 1) * pagination.pageSize >
            table.getFilteredRowModel().rows.length
              ? table.getFilteredRowModel().rows.length
              : (pagination.pageIndex + 1) * pagination.pageSize}{' '}
            of {table.getFilteredRowModel().rows.length}
          </Text>
          <HStack>
            <CIconButton
              aria-label="toPrevious"
              icon={<ChevronLeftIcon fontSize={30} />}
              isDisabled={!table.getCanPreviousPage()}
              isRound
              onClick={() => table.previousPage()}
              variant="_outline"
            />
            <CIconButton
              aria-label="toNext"
              icon={<ChevronRightIcon fontSize={30} />}
              isDisabled={!table.getCanNextPage()}
              isRound
              onClick={() => table.nextPage()}
              variant="_outline"
            />
          </HStack>
        </HStack>
      </Flex>
    </IonicBox>
  );
};

export default PoolsList;
