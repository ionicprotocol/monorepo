import { ArrowDownIcon, ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  Box,
  ButtonGroup,
  Center,
  Flex,
  HStack,
  Img,
  Input,
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
import { TotalBorrowed } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/TotalBorrowed';
import { TotalSupplied } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/TotalSupplied';
import { AlertHero } from '@ui/components/shared/Alert';
import { MidasBox } from '@ui/components/shared/Box';
import { CButton, CIconButton } from '@ui/components/shared/Button';
import { ALL, MIDAS_LOCALSTORAGE_KEYS, POOLS_COUNT_PER_PAGE, SEARCH } from '@ui/constants/index';
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
  totalSupplied: PoolData;
  totalBorrowed: PoolData;
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
  const [sorting, setSorting] = useState<SortingState>([
    { id: address ? 'supplyBalance' : 'totalSupplied', desc: true },
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

  const poolFilter: FilterFn<PoolRowData> = (row, columnId, value) => {
    if (
      !searchText ||
      (value.includes(SEARCH) &&
        (row.original.poolName.comptroller.toLowerCase().includes(searchText.toLowerCase()) ||
          row.original.poolName.name.toLowerCase().includes(searchText.toLowerCase())))
    ) {
      if (value.includes(ALL) || value.includes(row.original.chain.chainId)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  const poolSort: SortingFn<PoolRowData> = (rowA, rowB, columnId) => {
    if (columnId === 'chain') {
      return rowB.original.poolName.chainId > rowA.original.poolName.chainId ? 1 : -1;
    } else if (columnId === 'poolName') {
      return rowB.original.poolName.name.localeCompare(rowA.original.poolName.name);
    } else if (columnId === 'supplyBalance') {
      return rowA.original.poolName.totalSupplyBalanceFiat >
        rowB.original.poolName.totalSupplyBalanceFiat
        ? 1
        : -1;
    } else if (columnId === 'borrowBalance') {
      return rowA.original.poolName.totalBorrowBalanceFiat >
        rowB.original.poolName.totalBorrowBalanceFiat
        ? 1
        : -1;
    } else if (columnId === 'totalSupplied') {
      return rowA.original.poolName.totalSuppliedFiat > rowB.original.poolName.totalSuppliedFiat
        ? 1
        : -1;
    } else if (columnId === 'totalBorrowed') {
      return rowA.original.poolName.totalBorrowedFiat > rowB.original.poolName.totalBorrowedFiat
        ? 1
        : -1;
    } else {
      return 1;
    }
  };

  const allPools = useMemo(() => {
    return Object.values(poolsPerChain).reduce((res, pools) => {
      if (pools.data && pools.data.length > 0) {
        res.push(...pools.data);
      }
      return res;
    }, [] as PoolData[]);
  }, [poolsPerChain]);

  const data: PoolRowData[] = useMemo(() => {
    return poolSortByAddress(allPools).map((pool) => {
      return {
        chain: pool,
        poolName: pool,
        assets: pool,
        supplyBalance: pool,
        borrowBalance: pool,
        totalSupplied: pool,
        totalBorrowed: pool,
      };
    });
  }, [allPools]);

  const columns: ColumnDef<PoolRowData>[] = useMemo(() => {
    return [
      {
        accessorKey: 'chain',
        header: () => null,
        cell: ({ getValue }) => <Chain pool={getValue<PoolData>()} />,
        footer: (props) => props.column.id,
        enableSorting: false,
      },
      {
        accessorKey: 'poolName',
        header: () => (
          <Text variant="smText" fontWeight="bold" py={2}>
            Pool Name
          </Text>
        ),
        cell: ({ getValue }) => (
          <PoolName pool={getValue<PoolData>()} globalFilter={globalFilter} />
        ),
        footer: (props) => props.column.id,
        filterFn: poolFilter,
        sortingFn: poolSort,
      },
      {
        accessorFn: (row) => row.assets,
        id: 'assets',
        cell: ({ getValue }) => <Assets pool={getValue<PoolData>()} />,
        header: () => (
          <Box py={2} textAlign="end" alignItems="end">
            <Text variant="smText" fontWeight="bold" lineHeight={6}>
              Assets
            </Text>
          </Box>
        ),
        footer: (props) => props.column.id,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.supplyBalance,
        id: 'supplyBalance',
        cell: ({ getValue }) => <SupplyBalance pool={getValue<PoolData>()} />,
        header: () => (
          <Box py={2} textAlign="end" alignItems="end">
            <Text variant="smText" fontWeight="bold" lineHeight={5}>
              Supply
            </Text>
            <Text variant="smText" fontWeight="bold" lineHeight={5}>
              Balance
            </Text>
          </Box>
        ),
        footer: (props) => props.column.id,
        sortingFn: poolSort,
      },
      {
        accessorFn: (row) => row.borrowBalance,
        id: 'borrowBalance',
        cell: ({ getValue }) => <BorrowBalance pool={getValue<PoolData>()} />,
        header: () => (
          <VStack py={2} textAlign="end" alignItems="end" spacing={0}>
            <Text variant="smText" fontWeight="bold" lineHeight={5}>
              Borrow
            </Text>
            <Text variant="smText" fontWeight="bold" lineHeight={5}>
              Balance
            </Text>
          </VStack>
        ),
        footer: (props) => props.column.id,
        sortingFn: poolSort,
      },
      {
        accessorFn: (row) => row.totalSupplied,
        id: 'totalSupplied',
        cell: ({ getValue }) => <TotalSupplied pool={getValue<PoolData>()} />,
        header: () => (
          <VStack py={2} textAlign="end" alignItems="end" spacing={0}>
            <Text variant="smText" fontWeight="bold" lineHeight={5}>
              Total
            </Text>
            <Text variant="smText" fontWeight="bold" lineHeight={5}>
              Supply
            </Text>
          </VStack>
        ),
        footer: (props) => props.column.id,
        sortingFn: poolSort,
      },
      {
        accessorFn: (row) => row.totalBorrowed,
        id: 'totalBorrowed',
        cell: ({ getValue }) => <TotalBorrowed pool={getValue<PoolData>()} />,
        header: () => (
          <VStack py={2} textAlign="end" alignItems="end" spacing={0}>
            <Text variant="smText" fontWeight="bold" lineHeight={5}>
              Total
            </Text>
            <Text variant="smText" fontWeight="bold" lineHeight={5}>
              Borrow
            </Text>
          </VStack>
        ),
        footer: (props) => props.column.id,
        sortingFn: poolSort,
      },
      {
        id: 'expander',
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
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalFilter]);

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

  useEffect(() => {
    if (globalFilter.includes(ALL)) {
      table.getColumn('chain').toggleVisibility(true);
    } else {
      table.getColumn('chain').toggleVisibility(false);
    }
  }, [globalFilter, table]);

  useEffect(() => {
    if (address) {
      table.getColumn('supplyBalance').toggleVisibility(true);
      table.getColumn('borrowBalance').toggleVisibility(true);
    } else {
      table.getColumn('supplyBalance').toggleVisibility(false);
      table.getColumn('borrowBalance').toggleVisibility(false);
    }
  }, [address, table]);

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
      const data = { searchText, globalFilter, sorting };
      localStorage.setItem(MIDAS_LOCALSTORAGE_KEYS, JSON.stringify(data));
    }
  }, [searchText, globalFilter, sorting]);

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
      const _sorting = (obj.sorting as SortingState) || [{ id: 'totalSupplied', desc: true }];

      setGlobalFilter(_globalFilter);
      setSorting(_sorting);
    }

    return () => {
      mounted.current = false;
    };
  }, []);

  return (
    <MidasBox overflowX="auto" width="100%" mb="4">
      <Flex
        justifyContent="space-between"
        p={4}
        flexDirection={{ base: 'column', sm: 'row' }}
        gap={4}
      >
        <Flex className="pagination">
          <ButtonGroup
            isAttached={!isSmallScreen ? true : false}
            gap={!isSmallScreen ? 0 : 2}
            spacing={0}
            flexFlow={'row wrap'}
            justifyContent="flex-start"
            mx={2}
            mt={2}
          >
            <CButton
              isSelected={globalFilter.includes(ALL)}
              onClick={() => onFilter(ALL)}
              variant="filter"
              disabled={isLoading}
              px={2}
            >
              <HStack>
                <Text pt="2px">All Pools</Text>
              </HStack>
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
        </Flex>
        <Flex className="searchAsset" justifyContent="center" alignItems="flex-end">
          <ControlledSearchInput onUpdate={(searchText) => setSearchText(searchText)} />
        </Flex>
      </Flex>
      {!isLoading && !isLoadingPerChain ? (
        <Table>
          <Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr
                key={headerGroup.id}
                borderColor={cCard.dividerColor}
                borderBottomWidth={1}
                borderTopWidth={2}
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <Th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      border="none"
                      color={cCard.txtColor}
                      textTransform="capitalize"
                      py={2}
                      cursor="pointer"
                      px={
                        (globalFilter.includes(ALL) && header.column.id === 'poolName') ||
                        header.column.id === 'chain'
                          ? 0
                          : { base: 2, lg: 4 }
                      }
                    >
                      <HStack
                        spacing={header.column.id === 'assets' ? 0 : 2}
                        justifyContent={
                          header.column.id === 'chain' ||
                          header.column.id === 'poolName' ||
                          header.column.id === 'assets'
                            ? 'flex-start'
                            : 'flex-end'
                        }
                      >
                        <Box width={header.column.id === 'assets' ? 0 : 4} mb={1}>
                          <Box hidden={header.column.getIsSorted() ? false : true}>
                            {header.column.getIsSorted() === 'desc' ? (
                              <ArrowDownIcon fontSize={16} aria-label="sorted descending" />
                            ) : (
                              <ArrowUpIcon fontSize={16} aria-label="sorted ascending" />
                            )}
                          </Box>
                        </Box>
                        <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
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
            ) : allPools.length === 0 ? (
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
        flexDirection={{ base: 'column', lg: 'row' }}
        gap={4}
        justifyContent="flex-end"
        alignItems="flex-end"
        p={4}
      >
        <HStack>
          <Text variant="smText">Pools Per Page</Text>
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

  return chainConfig ? (
    <CButton
      isSelected={globalFilter.includes(chainId)}
      onClick={() => onFilter(chainId)}
      variant="filter"
      disabled={isLoading}
      px={2}
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

        <Text pt="2px">{chainConfig.specificParams.metadata.shortName}</Text>
      </HStack>
    </CButton>
  ) : null;
};

export default PoolsRowList;
