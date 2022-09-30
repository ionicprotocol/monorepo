import { ArrowDownIcon, ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  HStack,
  Img,
  Input,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react';
import { FusePoolData, SupportedChains } from '@midas-capital/types';
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
import * as React from 'react';
import { Fragment, useEffect, useMemo, useState } from 'react';

import { AdditionalInfo } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/AdditionalInfo';
import { Assets } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/Assets';
import { BorrowBalance } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/BorrowBalance';
import { Chain } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/Chain';
import { ExpanderArrow } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/ExpanderArrow';
import { PoolName } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/PoolName';
import { SupplyBalance } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/SupplyBalance';
import { TotalBorrowed } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/TotalBorrowed';
import { TotalSupplied } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/TotalSupplied';
import { MidasBox } from '@ui/components/shared/Box';
import { CIconButton } from '@ui/components/shared/Button';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { POOLS_COUNT_PER_PAGE, SEARCH } from '@ui/constants/index';
import { useChainConfig, useEnabledChains } from '@ui/hooks/useChainConfig';
import { useColors } from '@ui/hooks/useColors';
import { useDebounce } from '@ui/hooks/useDebounce';
import { useIsMobile } from '@ui/hooks/useScreenSize';
import { poolSortByAddress } from '@ui/utils/sorts';

export type PoolRowData = {
  chain: FusePoolData;
  poolName: FusePoolData;
  assets: FusePoolData;
  supplyBalance: FusePoolData;
  borrowBalance: FusePoolData;
  totalSupplied: FusePoolData;
  totalBorrowed: FusePoolData;
};

export const PoolsRowList = ({ allPools }: { allPools: FusePoolData[] }) => {
  const enabledChains = useEnabledChains();
  const countsOf = useMemo(() => {
    const countsPerChain: { [key: string]: number } = {};

    enabledChains.map((chainId) => {
      countsPerChain[chainId.toString()] = allPools.filter(
        (pool) => pool.chainId === chainId
      ).length;
    });

    return countsPerChain;
  }, [allPools, enabledChains]);

  const poolFilter: FilterFn<PoolRowData> = (row, columnId, value) => {
    if (
      !searchText ||
      (value.includes(SEARCH) &&
        (row.original.poolName.comptroller.toLowerCase().includes(searchText.toLowerCase()) ||
          row.original.poolName.name.toLowerCase().includes(searchText.toLowerCase())))
    ) {
      if (value.includes(row.original.chain.chainId)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  const poolSort: SortingFn<PoolRowData> = (rowA, rowB, columnId) => {
    if (columnId === 'poolName') {
      return rowB.original.poolName.name.localeCompare(rowA.original.poolName.name);
    } else if (columnId === 'supplyBalance') {
      return rowA.original.poolName.totalSupplyBalanceNative >
        rowB.original.poolName.totalSupplyBalanceNative
        ? 1
        : -1;
    } else if (columnId === 'borrowBalance') {
      return rowA.original.poolName.totalBorrowBalanceNative >
        rowB.original.poolName.totalBorrowBalanceNative
        ? 1
        : -1;
    } else if (columnId === 'totalSupplied') {
      return rowA.original.poolName.totalSuppliedNative > rowB.original.poolName.totalSuppliedNative
        ? 1
        : -1;
    } else if (columnId === 'totalBorrowed') {
      return rowA.original.poolName.totalBorrowedNative > rowB.original.poolName.totalBorrowedNative
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
        totalSupplied: pool,
        totalBorrowed: pool,
      };
    });
  }, [allPools]);

  const columns: ColumnDef<PoolRowData>[] = useMemo(() => {
    return [
      {
        accessorKey: 'chain',
        header: () => (
          <Text variant="smText" fontWeight="bold" py={2}>
            Chain
          </Text>
        ),
        cell: ({ getValue }) => <Chain pool={getValue<FusePoolData>()} />,
        footer: (props) => props.column.id,
        filterFn: poolFilter,
        sortingFn: poolSort,
      },
      {
        accessorKey: 'poolName',
        header: () => (
          <Text variant="smText" fontWeight="bold" py={2}>
            Pool Name
          </Text>
        ),
        cell: ({ getValue }) => <PoolName pool={getValue<FusePoolData>()} />,
        footer: (props) => props.column.id,
        sortingFn: poolSort,
      },
      {
        accessorFn: (row) => row.assets,
        id: 'assets',
        cell: ({ getValue }) => <Assets pool={getValue<FusePoolData>()} />,
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
        cell: ({ getValue }) => <SupplyBalance pool={getValue<FusePoolData>()} />,
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
        cell: ({ getValue }) => <BorrowBalance pool={getValue<FusePoolData>()} />,
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
        cell: ({ getValue }) => <TotalSupplied pool={getValue<FusePoolData>()} />,
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
        cell: ({ getValue }) => <TotalBorrowed pool={getValue<FusePoolData>()} />,
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
  }, []);

  const [sorting, setSorting] = useState<SortingState>([{ id: 'poolName', desc: true }]);
  const [pagination, onPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: POOLS_COUNT_PER_PAGE[0],
  });
  const [globalFilter, setGlobalFilter] = useState<(SupportedChains | string)[]>([
    ...enabledChains,
  ]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [searchText, setSearchText] = useState('');

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

  const onSearchFiltered = () => {
    if (searchText) {
      setGlobalFilter([...globalFilter, SEARCH]);
    } else {
      setGlobalFilter(globalFilter.filter((f) => f !== SEARCH));
    }
  };

  const onFilter = (chainId: SupportedChains) => {
    if (!globalFilter.includes(chainId)) {
      setGlobalFilter([...globalFilter, chainId]);
    } else {
      setGlobalFilter(globalFilter.filter((f) => f !== chainId));
    }
  };

  useEffect(() => {
    onSearchFiltered();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  return (
    <MidasBox overflowX="auto" width="100%" mb="4">
      <Flex
        className="pagination"
        flexDirection={{ base: 'column', lg: 'row' }}
        gap={4}
        justifyContent="flex-end"
        alignItems="flex-end"
        p={4}
      >
        <HStack>
          <Text variant="smText">Rows Per Page :</Text>
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
      <Flex
        justifyContent="space-between"
        px="4"
        py="4"
        flexDirection={{ base: 'column', sm: 'row' }}
        gap={4}
      >
        <Flex className="pagination" flexDirection={{ base: 'column', lg: 'row' }} gap={4}>
          <Text paddingTop="2px" variant="title">
            Pools
          </Text>
          <Grid
            templateColumns={{
              base: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(5, 1fr)',
            }}
            gap={2}
          >
            {enabledChains.map((chainId) => {
              return (
                <ChainFilterButton
                  key={chainId}
                  chainId={chainId}
                  globalFilter={globalFilter}
                  onFilter={onFilter}
                  countsOf={countsOf}
                />
              );
            })}
          </Grid>
        </Flex>
        <Flex className="searchAsset" justifyContent="flex-end" alignItems="flex-end">
          <ControlledSearchInput onUpdate={(searchText) => setSearchText(searchText)} />
        </Flex>
      </Flex>
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
                    px={header.column.id === 'chain' ? 0 : { base: 2, lg: 4 }}
                  >
                    <HStack
                      justifyContent={
                        header.column.id === 'chain' ||
                        header.column.id === 'poolName' ||
                        header.column.id === 'assets'
                          ? 'flex-start'
                          : 'flex-end'
                      }
                    >
                      <Box width={header.column.id === 'assets' ? 0 : 3} mb={1}>
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
          {table.getRowModel().rows && table.getRowModel().rows.length !== 0 ? (
            table.getRowModel().rows.map((row) => (
              <Fragment key={row.id}>
                <Tr
                  key={row.id}
                  borderColor={cCard.dividerColor}
                  borderTopWidth={1}
                  background={row.getIsExpanded() ? cCard.hoverBgColor : cCard.bgColor}
                  _hover={{ bg: cCard.hoverBgColor }}
                  cursor="pointer"
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
                    borderBottomWidth={0}
                    borderTopWidth={1}
                    borderStyle="dashed"
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
    </MidasBox>
  );
};

const ControlledSearchInput = ({ onUpdate }: { onUpdate: (value: string) => void }) => {
  const [searchText, setSearchText] = useState('');
  const isMobile = useIsMobile();
  const debouncedText = useDebounce(searchText, 400);

  useEffect(() => {
    onUpdate(debouncedText);
  }, [debouncedText, onUpdate]);

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
        placeholder="Search pool name or address"
        _focusVisible={{}}
      />
    </HStack>
  );
};

const ChainFilterButton = ({
  chainId,
  onFilter,
  globalFilter,
  countsOf,
}: {
  chainId: SupportedChains;
  onFilter: (chainId: SupportedChains) => void;
  globalFilter: (string | SupportedChains)[];
  countsOf: { [key: string]: number };
}) => {
  const chainConfig = useChainConfig(chainId);

  return chainConfig ? (
    <SimpleTooltip key={chainId} label={chainConfig.specificParams.metadata.name}>
      <Button
        variant={globalFilter.includes(chainId) ? '_solid' : '_outline'}
        onClick={() => onFilter(chainId)}
        px={0}
        disabled={countsOf[chainId.toString()] === 0}
      >
        <Img
          width="25px"
          height="25px"
          borderRadius="50%"
          src={chainConfig.specificParams.metadata.img}
          alt=""
        />
      </Button>
    </SimpleTooltip>
  ) : null;
};
