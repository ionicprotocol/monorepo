import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SettingsIcon,
} from '@chakra-ui/icons';
import {
  Box,
  ButtonGroup,
  Center,
  Checkbox,
  Flex,
  Hide,
  HStack,
  IconButton,
  Img,
  Input,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Select,
  Skeleton,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react';
import { SupportedChains } from '@midas-capital/types';
import {
  ColumnDef,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingFn,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { useRouter } from 'next/router';
import * as React from 'react';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';

import { AdditionalInfo } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/AdditionalInfo';
import { Assets } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/Assets';
import { BorrowBalance } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/BorrowBalance';
import { Chain } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/Chain';
import { ExpanderArrow } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/ExpanderArrow';
import { PoolName } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/PoolName';
import { SupplyBalance } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/SupplyBalance';
import { TotalBorrow } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/TotalBorrow';
import { TotalSupply } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/TotalSupply';
import { AlertHero } from '@ui/components/shared/Alert';
import { MidasBox } from '@ui/components/shared/Box';
import { CButton, CIconButton } from '@ui/components/shared/Button';
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
import { useChainConfig, useEnabledChains } from '@ui/hooks/useChainConfig';
import { useColors } from '@ui/hooks/useColors';
import { useDebounce } from '@ui/hooks/useDebounce';
import { useIsMobile, useIsSmallScreen } from '@ui/hooks/useScreenSize';
import { Err, PoolsPerChainStatus } from '@ui/types/ComponentPropsType';
import { PoolData } from '@ui/types/TokensDataMap';
import { poolSortByAddress } from '@ui/utils/sorts';

export type PoolRowData = {
  chain: PoolData;
  poolName: PoolData;
  assets: PoolData;
  supplyBalance: PoolData;
  borrowBalance: PoolData;
  totalSupply: PoolData;
  totalBorrow: PoolData;
};

const PoolsRowList = ({
  poolsPerChain,
  isLoading,
}: {
  poolsPerChain: PoolsPerChainStatus;
  isLoading: boolean;
}) => {
  const enabledChains = useEnabledChains();
  const { address, setGlobalLoading } = useMultiMidas();
  const [err, setErr] = useState<Err | undefined>();
  const [isLoadingPerChain, setIsLoadingPerChain] = useState(false);
  const [selectedFilteredPools, setSelectedFilteredPools] = useState<PoolData[]>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: address ? SUPPLY_BALANCE : TOTAL_SUPPLY, desc: true },
  ]);
  const [pagination, onPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: POOLS_COUNT_PER_PAGE[0],
  });
  const [globalFilter, setGlobalFilter] = useState<(SupportedChains | string)[]>([ALL]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [searchText, setSearchText] = useState('');
  const isSmallScreen = useIsSmallScreen();
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
        chain: pool,
        poolName: pool,
        assets: pool,
        supplyBalance: pool,
        borrowBalance: pool,
        totalSupply: pool,
        totalBorrow: pool,
      };
    });
  }, [allPools]);

  const columns: ColumnDef<PoolRowData>[] = useMemo(() => {
    return [
      {
        accessorFn: (row) => row.chain,
        id: CHAIN,
        header: () => null,
        cell: ({ getValue }) => <Chain pool={getValue<PoolData>()} />,
        footer: (props) => props.column.id,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.poolName,
        id: POOL_NAME,
        header: () => <Text textAlign="left">Pool Name</Text>,
        cell: ({ getValue }) => <PoolName pool={getValue<PoolData>()} />,
        footer: (props) => props.column.id,
        filterFn: poolFilter,
        sortingFn: poolSort,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.assets,
        id: ASSETS,
        cell: ({ getValue }) => <Assets pool={getValue<PoolData>()} />,
        header: () => <Text textAlign="left">Assets</Text>,
        footer: (props) => props.column.id,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.supplyBalance,
        id: SUPPLY_BALANCE,
        cell: ({ getValue }) => <SupplyBalance pool={getValue<PoolData>()} />,
        header: () => (
          <Text
            textAlign="right"
            textOverflow={'ellipsis'}
            whiteSpace="nowrap"
            title="Supply Balance"
          >
            Supply Balance
          </Text>
        ),
        footer: (props) => props.column.id,
        sortingFn: poolSort,
      },
      {
        accessorFn: (row) => row.borrowBalance,
        id: BORROW_BALANCE,
        cell: ({ getValue }) => <BorrowBalance pool={getValue<PoolData>()} />,
        header: () => (
          <Text
            textAlign="right"
            textOverflow={'ellipsis'}
            whiteSpace="nowrap"
            title="Borrow Balance"
          >
            Borrow Balance
          </Text>
        ),
        footer: (props) => props.column.id,
        sortingFn: poolSort,
      },
      {
        accessorFn: (row) => row.totalSupply,
        id: TOTAL_SUPPLY,
        cell: ({ getValue }) => <TotalSupply pool={getValue<PoolData>()} />,
        header: () => (
          <Text
            textAlign="right"
            title="Total Supply"
            textOverflow={'ellipsis'}
            whiteSpace="nowrap"
          >
            Total Supply
          </Text>
        ),
        footer: (props) => props.column.id,
        sortingFn: poolSort,
      },
      {
        accessorFn: (row) => row.totalBorrow,
        id: TOTAL_BORROW,
        cell: ({ getValue }) => <TotalBorrow pool={getValue<PoolData>()} />,
        header: () => (
          <Text textAlign="left" title="Total Borrow" textOverflow={'ellipsis'} whiteSpace="nowrap">
            Total Borrow
          </Text>
        ),
        footer: (props) => props.column.id,
        sortingFn: poolSort,
      },
      {
        id: EXPANDER,
        header: () => null,
        cell: ({ row }) => {
          return (
            <ExpanderArrow
              getToggleExpandedHandler={row.getToggleExpandedHandler()}
              isExpanded={row.getIsExpanded()}
              canExpand={row.getCanExpand()}
            />
          );
        },
        enableHiding: false,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const table = useReactTable({
    columns,
    data,
    getRowCanExpand: () => true,
    getColumnCanGlobalFilter: () => true,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: onPagination,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    enableSortingRemoval: false,
    getExpandedRowModel: getExpandedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: poolFilter,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      pagination,
      globalFilter,
      columnVisibility,
    },
  });

  const { cCard } = useColors();

  const onFilter = (filter: SupportedChains | string) => {
    if (globalFilter.includes(SEARCH)) {
      setGlobalFilter([filter, SEARCH]);
    } else {
      setGlobalFilter([filter]);
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
      const data = { ...oldObj, searchText, globalFilter, sorting, poolsListColumnVisibility: arr };
      localStorage.setItem(MIDAS_LOCALSTORAGE_KEYS, JSON.stringify(data));
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

    const data = localStorage.getItem(MIDAS_LOCALSTORAGE_KEYS);
    if (data && mounted.current) {
      const obj = JSON.parse(data);
      const _globalFilter = (obj.globalFilter as (string | SupportedChains)[]) || [ALL];
      setGlobalFilter(_globalFilter);

      if (obj && obj.sorting && POOLS_COLUMNS.includes(obj.sorting[0].id)) {
        setSorting(obj.sorting);
      } else {
        setSorting([{ id: TOTAL_SUPPLY, desc: true }]);
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
        justifyContent={['center', 'center', 'space-between']}
        alignItems="center"
        flexWrap="wrap-reverse"
        mb={3}
        gap={4}
        width="100%"
      >
        <ButtonGroup
          isAttached
          gap={0}
          spacing={0}
          flexFlow={'row wrap'}
          justifyContent="flex-start"
        >
          <CButton
            isSelected={globalFilter.includes(ALL)}
            onClick={() => onFilter(ALL)}
            variant="filter"
            disabled={isLoading}
            px={4}
          >
            <Text>{isSmallScreen ? 'All' : 'All Chains'}</Text>
          </CButton>
          {enabledChains.map((chainId) => {
            return (
              <ChainFilterButton
                key={chainId}
                chainId={chainId}
                globalFilter={globalFilter}
                onFilter={onFilter}
                isLoading={poolsPerChain[chainId.toString()].isLoading}
              />
            );
          })}
        </ButtonGroup>

        <Flex className="searchAsset" justifyContent="center" alignItems="flex-end" gap={2}>
          <ControlledSearchInput onUpdate={(searchText) => setSearchText(searchText)} />
          <Popover placement="bottom-end">
            <PopoverTrigger>
              <IconButton
                variant="_outline"
                icon={<SettingsIcon fontSize={20} />}
                aria-label="Column Settings"
                maxWidth={10}
              />
            </PopoverTrigger>
            <PopoverContent width="200px">
              <PopoverBody>
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
                          key={column.id}
                          isChecked={column.getIsVisible()}
                          onChange={column.getToggleVisibilityHandler()}
                        >
                          {column.id}
                        </Checkbox>
                      );
                    }
                  })}
                </VStack>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </Flex>
      </Flex>
      <MidasBox overflowX="auto" width="100%">
        {!isLoading && !isLoadingPerChain ? (
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
                        textTransform="capitalize"
                        height={'64px'}
                        py={0}
                        pr={4}
                        pl={0}
                        cursor="pointer"
                        lineHeight="unset"
                      >
                        <HStack
                          width={'100%'}
                          justifyContent={
                            header.column.id === ASSETS || header.column.id === POOL_NAME
                              ? 'flex-start'
                              : 'flex-end'
                          }
                        >
                          {header.column.id === ASSETS ? null : (
                            <Box opacity={header.column.getIsSorted() ? 1 : 0}>
                              {header.column.getIsSorted() === 'desc' ? (
                                <ArrowDownIcon fontSize={16} aria-label="sorted descending" />
                              ) : (
                                <ArrowUpIcon fontSize={16} aria-label="sorted ascending" />
                              )}
                            </Box>
                          )}
                          <Flex>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </Flex>
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
                    <AlertHero
                      status="warning"
                      variant="subtle"
                      title={err.reason ? err.reason : 'Unexpected Error'}
                      description="Unable to retrieve Pools. Please try again later."
                    />
                  </Td>
                </Tr>
              ) : table.getRowModel().rows && table.getRowModel().rows.length !== 0 ? (
                table.getRowModel().rows.map((row) => (
                  <Fragment key={row.id}>
                    <Tr
                      key={row.id}
                      borderColor={cCard.dividerColor}
                      borderBottomWidth={row.getIsExpanded() ? 0 : 1}
                      background={row.getIsExpanded() ? cCard.hoverBgColor : cCard.bgColor}
                      _hover={{ bg: cCard.hoverBgColor }}
                      cursor="pointer"
                      onClick={() => {
                        setGlobalLoading(true);
                        router.push(
                          `/${row.original.poolName.chainId}/pool/${row.original.poolName.id}`
                        );
                      }}
                    >
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <Td key={cell.id} border="none" p={0} height={16}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </Td>
                        );
                      })}
                    </Tr>
                    {row.getIsExpanded() && (
                      <Tr
                        borderColor={cCard.dividerColor}
                        borderBottomWidth={1}
                        borderTopWidth={1}
                        borderTopStyle="dashed"
                        borderBottomStyle="solid"
                        background={row.getIsExpanded() ? cCard.hoverBgColor : cCard.bgColor}
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
          className="pagination"
          gap={4}
          justifyContent="flex-end"
          alignItems="center"
          width={'100%'}
          py={4}
          px={3}
        >
          <HStack>
            <Hide below="lg">
              <Text variant="smText">Pools Per Page</Text>
            </Hide>
            <Select
              value={pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              maxW="max-content"
            >
              {POOLS_COUNT_PER_PAGE.map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </Select>
          </HStack>
          <HStack gap={2}>
            <Text variant="smText">
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
                variant="_outline"
                aria-label="toPrevious"
                icon={<ChevronLeftIcon fontSize={30} />}
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                isRound
              />
              <CIconButton
                variant="_outline"
                aria-label="toNext"
                icon={<ChevronRightIcon fontSize={30} />}
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                isRound
              />
            </HStack>
          </HStack>
        </Flex>
      </MidasBox>
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

    const data = localStorage.getItem(MIDAS_LOCALSTORAGE_KEYS);
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
        type="text"
        value={searchText}
        onChange={onSearch}
        placeholder="Asset, Pool Name"
        maxW={80}
        _focusVisible={{}}
      />
    </HStack>
  );
};

const ChainFilterButton = ({
  chainId,
  onFilter,
  globalFilter,
  isLoading,
}: {
  chainId: SupportedChains;
  onFilter: (chainId: SupportedChains) => void;
  globalFilter: (string | SupportedChains)[];
  isLoading: boolean;
}) => {
  const chainConfig = useChainConfig(chainId);
  const isSmallScreen = useIsSmallScreen();

  return chainConfig ? (
    <CButton
      isSelected={globalFilter.includes(chainId)}
      onClick={() => onFilter(chainId)}
      variant="filter"
      disabled={isLoading}
      px={4}
      mx={'-1px'}
    >
      <HStack>
        {isLoading ? (
          <Spinner />
        ) : (
          <Img
            width={6}
            height={6}
            borderRadius="50%"
            src={chainConfig.specificParams.metadata.img}
            alt=""
          />
        )}
        {!isSmallScreen && <Text pt="2px">{chainConfig.specificParams.metadata.shortName}</Text>}
      </HStack>
    </CButton>
  ) : null;
};

export default PoolsRowList;
