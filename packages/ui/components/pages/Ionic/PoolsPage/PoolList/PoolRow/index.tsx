import { ChevronLeftIcon, ChevronRightIcon, SettingsIcon } from '@chakra-ui/icons';
import {
  Center,
  Checkbox,
  Flex,
  Hide,
  HStack,
  IconButton,
  Input,
  Select,
  Skeleton,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack
} from '@chakra-ui/react';
import type { SupportedChains } from '@ionicprotocol/types';
import type {
  ColumnDef,
  FilterFn,
  PaginationState,
  SortingFn,
  SortingState,
  VisibilityState
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
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import * as React from 'react';

import { AdditionalInfo } from '@ui/components/pages/Ionic/PoolsPage/PoolList/PoolRow/AdditionalInfo';
import { Assets } from '@ui/components/pages/Ionic/PoolsPage/PoolList/PoolRow/Assets';
import { BorrowBalance } from '@ui/components/pages/Ionic/PoolsPage/PoolList/PoolRow/BorrowBalance';
import { Chain } from '@ui/components/pages/Ionic/PoolsPage/PoolList/PoolRow/Chain';
import { ChainFilterButtons } from '@ui/components/pages/Ionic/PoolsPage/PoolList/PoolRow/ChainFilterButtons';
import { ChainFilterDropdown } from '@ui/components/pages/Ionic/PoolsPage/PoolList/PoolRow/ChainFilterDropdown';
import { ExpanderArrow } from '@ui/components/pages/Ionic/PoolsPage/PoolList/PoolRow/ExpanderArrow';
import { PoolName } from '@ui/components/pages/Ionic/PoolsPage/PoolList/PoolRow/PoolName';
import { SupplyBalance } from '@ui/components/pages/Ionic/PoolsPage/PoolList/PoolRow/SupplyBalance';
import { TotalBorrow } from '@ui/components/pages/Ionic/PoolsPage/PoolList/PoolRow/TotalBorrow';
import { TotalSupply } from '@ui/components/pages/Ionic/PoolsPage/PoolList/PoolRow/TotalSupply';
import { Banner } from '@ui/components/shared/Banner';
import { CIconButton } from '@ui/components/shared/Button';
import { CardBox } from '@ui/components/shared/IonicBox';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { TableHeaderCell } from '@ui/components/shared/TableHeaderCell';
import {
  ALL,
  ASSETS,
  BORROW_BALANCE,
  CHAIN,
  EXPANDER,
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
import { useEnabledChains } from '@ui/hooks/useChainConfig';
import { useColors } from '@ui/hooks/useColors';
import { useDebounce } from '@ui/hooks/useDebounce';
import { useIsMobile } from '@ui/hooks/useScreenSize';
import type { Err, PoolsPerChainStatus } from '@ui/types/ComponentPropsType';
import type { PoolData } from '@ui/types/TokensDataMap';
import { poolSortByAddress } from '@ui/utils/sorts';

export type PoolRowData = {
  assets: PoolData;
  borrowBalance: PoolData;
  chain: PoolData;
  poolName: PoolData;
  supplyBalance: PoolData;
  totalBorrow: PoolData;
  totalSupply: PoolData;
};

const PoolsRowList = ({
  poolsPerChain,
  isLoading
}: {
  isLoading: boolean;
  poolsPerChain: PoolsPerChainStatus;
}) => {
  const { address, setGlobalLoading } = useMultiIonic();
  const [err, setErr] = useState<Err | undefined>();
  const [isLoadingPerChain, setIsLoadingPerChain] = useState(false);
  const [selectedFilteredPools, setSelectedFilteredPools] = useState<PoolData[]>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { desc: true, id: address ? SUPPLY_BALANCE : TOTAL_SUPPLY }
  ]);
  const [pagination, onPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: POOLS_COUNT_PER_PAGE[0]
  });
  const [globalFilter, setGlobalFilter] = useState<(SupportedChains | string)[]>([ALL]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [searchText, setSearchText] = useState('');
  const mounted = useRef(false);
  const router = useRouter();
  const allPools = useMemo(() => {
    return Object.values(poolsPerChain).reduce((res, pools) => {
      if (pools.data && pools.data.length > 0) {
        res.push(...pools.data);
      }
      return res;
    }, [] as PoolData[]);
  }, [poolsPerChain]);

  const loadingStatusPerChain = useMemo(() => {
    const _loadingStatusPerChain: { [chainId: string]: boolean } = {};

    Object.entries(poolsPerChain).map(([chainId, pools]) => {
      _loadingStatusPerChain[chainId] = pools.isLoading;
    });

    return _loadingStatusPerChain;
  }, [poolsPerChain]);

  const enabledChains = useEnabledChains();

  useEffect(() => {
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
  }, [globalFilter, poolsPerChain, allPools]);

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

  const data: PoolRowData[] = useMemo(() => {
    return poolSortByAddress(allPools).map((pool) => {
      return {
        assets: pool,
        borrowBalance: pool,
        chain: pool,
        poolName: pool,
        supplyBalance: pool,
        totalBorrow: pool,
        totalSupply: pool
      };
    });
  }, [allPools]);

  const columns: ColumnDef<PoolRowData>[] = useMemo(() => {
    return [
      {
        accessorFn: (row) => row.chain,
        cell: ({ getValue }) => <Chain chainId={getValue<PoolData>().chainId} />,
        enableHiding: false,
        enableSorting: false,
        footer: (props) => props.column.id,
        header: () => null,
        id: CHAIN
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
        sortingFn: poolSort
      },
      {
        accessorFn: (row) => row.assets,
        cell: ({ getValue }) => <Assets pool={getValue<PoolData>()} />,
        enableSorting: false,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>Assets</TableHeaderCell>,
        id: ASSETS
      },
      {
        accessorFn: (row) => row.supplyBalance,
        cell: ({ getValue }) => <SupplyBalance pool={getValue<PoolData>()} />,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>Supply Balance</TableHeaderCell>,
        id: SUPPLY_BALANCE,
        sortingFn: poolSort
      },
      {
        accessorFn: (row) => row.borrowBalance,
        cell: ({ getValue }) => <BorrowBalance pool={getValue<PoolData>()} />,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>Borrow Balance</TableHeaderCell>,
        id: BORROW_BALANCE,
        sortingFn: poolSort
      },
      {
        accessorFn: (row) => row.totalSupply,
        cell: ({ getValue }) => <TotalSupply pool={getValue<PoolData>()} />,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>Total Supply</TableHeaderCell>,
        id: TOTAL_SUPPLY,
        sortingFn: poolSort
      },
      {
        accessorFn: (row) => row.totalBorrow,
        cell: ({ getValue }) => <TotalBorrow pool={getValue<PoolData>()} />,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>Total Borrow</TableHeaderCell>,
        id: TOTAL_BORROW,
        sortingFn: poolSort
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
        id: EXPANDER
      }
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
      sorting
    }
  });

  const { cCard } = useColors();

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
      const arr: string[] = [];
      Object.entries(columnVisibility).map(([key, value]) => {
        if (value) {
          arr.push(key);
        }
      });
      const data = { ...oldObj, globalFilter, poolsListColumnVisibility: arr, searchText, sorting };
      localStorage.setItem(IONIC_LOCALSTORAGE_KEYS, JSON.stringify(data));
    }
  }, [searchText, globalFilter, sorting, columnVisibility]);

  useEffect(() => {
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
  }, [globalFilter, poolsPerChain]);

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

  return (
    <>
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
        <Flex alignItems="flex-end" className="searchAsset" gap={2} justifyContent="center">
          <ControlledSearchInput onUpdate={(searchText) => setSearchText(searchText)} />
          <PopoverTooltip
            body={
              <VStack alignItems="flex-start">
                <Text>Show/Hide Columns</Text>
                <Checkbox
                  isChecked={table.getIsAllColumnsVisible()}
                  onChange={table.getToggleAllColumnsVisibilityHandler()}
                >
                  All
                </Checkbox>
                {table.getAllColumns().map((column) => {
                  if (column.getCanHide()) {
                    return (
                      <Checkbox
                        isChecked={column.getIsVisible()}
                        key={column.id}
                        onChange={column.getToggleVisibilityHandler()}
                      >
                        {column.id}
                      </Checkbox>
                    );
                  }
                })}
              </VStack>
            }
          >
            <IconButton
              aria-label="Column Settings"
              icon={<SettingsIcon fontSize={20} />}
              maxWidth={10}
              variant="_outline"
            />
          </PopoverTooltip>
        </Flex>
      </Flex>
      <CardBox overflowX="auto" width="100%">
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
                        px={
                          table.getRowModel().rows && table.getRowModel().rows.length !== 0 ? 0 : 3
                        }
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
                        textAlign: 'center'
                      }}
                      descriptions={[
                        {
                          text: `Unable to retrieve Pools. Please try again later.`
                        }
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
                              base:
                                cell.column.id === POOL_NAME || cell.column.id === ASSETS ? 0 : 2
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
      </CardBox>
    </>
  );
};

const ControlledSearchInput = ({ onUpdate }: { onUpdate: (value: string) => void }) => {
  const [searchText, setSearchText] = useState('');
  const isMobile = useIsMobile();
  const mounted = useRef(false);
  const debouncedText = useDebounce(searchText, 400);

  useEffect(() => {
    onUpdate(debouncedText);
  }, [debouncedText, onUpdate]);

  useEffect(() => {
    mounted.current = true;

    const data = localStorage.getItem(IONIC_LOCALSTORAGE_KEYS);
    if (data && mounted.current) {
      const obj = JSON.parse(data);
      const _searchText = obj.searchText || '';

      setSearchText(_searchText);
    }

    return () => {
      mounted.current = false;
    };
  }, []);

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  return (
    <HStack>
      {!isMobile && <Text>Search</Text>}
      <Input
        _focusVisible={{}}
        maxW={80}
        onChange={onSearch}
        placeholder="Asset, Pool Name"
        type="text"
        value={searchText}
      />
    </HStack>
  );
};

export default PoolsRowList;
