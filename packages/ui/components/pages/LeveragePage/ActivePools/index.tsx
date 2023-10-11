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
import type { LeveredPosition } from '@ionicprotocol/types';
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

import { Apr } from './Apr';
import { BorrowAsset } from './BorrowAsset';
import { CollateralAsset } from './CollateralAsset';
import { Farm } from './Farm';
import { Leverage } from './Leverage';
import { Network } from './Network';
import { NetworkFilterDropdown } from './NetworkFilterDropdown';
import { TotalSupply } from './TotalSupply';

import { Banner } from '@ui/components/shared/Banner';
import { CIconButton } from '@ui/components/shared/Button';
import { CardBox } from '@ui/components/shared/IonicBox';
import { SearchInput } from '@ui/components/shared/SearchInput';
import { TableHeaderCell } from '@ui/components/shared/TableHeaderCell';
import {
  ALL_NETWORKS,
  APR,
  BORROW_ASSET,
  BORROWABLE_ASSET,
  COLLATERAL_ASSET,
  FARM,
  IONIC_LOCALSTORAGE_KEYS,
  LEVERAGE,
  NETWORK,
  NEW_POSITION_COLUMNS,
  NEW_POSITIONS_PER_PAGE,
  POOLS_COUNT_PER_PAGE,
  SEARCH,
  TVL
} from '@ui/constants/index';
import { useNewPositions } from '@ui/hooks/leverage/useNewPositions';
import { usePositionLoadingStatusPerChain } from '@ui/hooks/leverage/usePositionLoadingStatusPerChain';
import { usePositionsPerChain } from '@ui/hooks/leverage/usePositionsPerChain';
import { useEnabledChains } from '@ui/hooks/useChainConfig';
import { useColors } from '@ui/hooks/useColors';
import type { NetworkFilter, PositionFilter } from '@ui/types/ComponentPropsType';

export type NewPositionRowData = {
  apr: LeveredPosition;
  borrowAsset: LeveredPosition;
  collateralAsset: LeveredPosition;
  leverage: LeveredPosition;
  network: LeveredPosition;
  tvl: LeveredPosition;
  yourPosition: LeveredPosition;
};

export const ActivePools = () => {
  const enabledChains = useEnabledChains();
  const {
    isLoading: isAllLoading,
    error,
    positionsPerChain,
    allPositions
  } = usePositionsPerChain([...enabledChains]);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredNewPositions, setFilteredNewPositions] = useState<LeveredPosition[]>([]);
  const [sorting, setSorting] = useState<SortingState>([{ desc: true, id: TVL }]);
  const [pagination, onPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: NEW_POSITIONS_PER_PAGE[0]
  });
  const [networkFilter, setNetworkFilter] = useState<NetworkFilter[]>([ALL_NETWORKS]);
  const [globalFilter, setGlobalFilter] = useState<PositionFilter[]>(networkFilter);
  const [searchText, setSearchText] = useState('');
  const mounted = useRef(false);

  const loadingStatusPerChain = usePositionLoadingStatusPerChain(positionsPerChain);

  useQuery(
    [
      'filteredNewPositions',
      globalFilter,
      allPositions.map((position) => position.borrowable.cToken),
      Object.values(positionsPerChain).map(
        (query) => query.data?.map((position) => position.borrowable.cToken)
      )
    ],
    () => {
      const newPositions: LeveredPosition[] = [];

      if (globalFilter.includes(ALL_NETWORKS)) {
        setFilteredNewPositions([...allPositions]);
      } else {
        globalFilter.map((filter) => {
          const data = positionsPerChain[filter.toString()]?.data;

          if (data) {
            newPositions.push(...data);
          }
        });

        setFilteredNewPositions(newPositions);
      }

      return null;
    },
    {
      enabled: Object.values(positionsPerChain).length > 0 && allPositions.length > 0
    }
  );

  const globalFilterFn: FilterFn<NewPositionRowData> = useCallback(
    (row, columnId, value) => {
      const position = row.original.network;

      if (
        !searchText ||
        (value.includes(SEARCH) &&
          (position.collateral.symbol.toLowerCase().includes(searchText.toLowerCase()) ||
            position.borrowable.symbol.toLowerCase().includes(searchText.toLowerCase())))
      ) {
        if (value.includes(ALL_NETWORKS) || value.includes(position.chainId)) {
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

  const newPositionSort: SortingFn<NewPositionRowData> = (rowA, rowB, columnId) => {
    if (columnId === NETWORK) {
      return rowB.original.network.chainId > rowA.original.network.chainId ? 1 : -1;
    } else if (columnId === COLLATERAL_ASSET) {
      return rowB.original.network.collateral.symbol.localeCompare(
        rowA.original.network.collateral.symbol
      );
    } else if (columnId === BORROWABLE_ASSET) {
      return rowB.original.network.borrowable.symbol.localeCompare(
        rowA.original.network.borrowable.symbol
      );
    } else {
      return 1;
    }
  };

  const data: NewPositionRowData[] = useNewPositions(allPositions);

  const columns: ColumnDef<NewPositionRowData>[] = useMemo(() => {
    return [
      {
        accessorFn: (row) => row.network,
        cell: ({ getValue }) => <Network chainId={getValue<LeveredPosition>().chainId} />,
        enableHiding: false,
        filterFn: globalFilterFn,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{NETWORK}</TableHeaderCell>,
        id: NETWORK,
        sortingFn: newPositionSort
      },
      {
        accessorFn: (row) => row.collateralAsset,
        cell: ({ getValue }) => <CollateralAsset position={getValue<LeveredPosition>()} />,
        enableHiding: false,
        footer: (props) => props.column.id,
        header: (context) => (
          <TableHeaderCell context={context}>{COLLATERAL_ASSET}</TableHeaderCell>
        ),
        id: COLLATERAL_ASSET,
        sortingFn: newPositionSort
      },
      {
        accessorFn: (row) => row.borrowAsset,
        cell: ({ getValue }) => <BorrowAsset position={getValue<LeveredPosition>()} />,
        enableSorting: false,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{BORROW_ASSET}</TableHeaderCell>,
        id: BORROW_ASSET,
        sortingFn: newPositionSort
      },
      {
        accessorFn: (row) => row.leverage,
        cell: ({ getValue }) => <Leverage position={getValue<LeveredPosition>()} />,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{LEVERAGE}</TableHeaderCell>,
        id: LEVERAGE,
        sortingFn: newPositionSort
      },
      {
        accessorFn: (row) => row.apr,
        cell: ({ getValue }) => <Apr position={getValue<LeveredPosition>()} />,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{APR}</TableHeaderCell>,
        id: APR,
        sortingFn: newPositionSort
      },
      {
        accessorFn: (row) => row.tvl,
        cell: ({ getValue }) => <TotalSupply position={getValue<LeveredPosition>()} />,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{TVL}</TableHeaderCell>,
        id: TVL,
        sortingFn: newPositionSort
      },
      {
        cell: ({ row }) => {
          return <Farm position={row.getValue(NETWORK)} />;
        },
        header: () => null,
        id: FARM
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

  const { data: tableData } = useQuery(['NewPositionsTableData', table], () => {
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
      const data = {
        ...oldObj,
        newPositionFilter: globalFilter,
        newPositionSearch: searchText,
        newPositionSorting: sorting
      };
      localStorage.setItem(IONIC_LOCALSTORAGE_KEYS, JSON.stringify(data));
    }
  }, [searchText, globalFilter, sorting]);

  useQuery(
    [
      'statusPerChain',
      globalFilter,
      isAllLoading,
      Object.values(positionsPerChain).map((query) => {
        return [query.data?.map((position) => position.collateral.cToken), query.isLoading];
      })
    ],
    () => {
      const selectedChainIds = Object.keys(positionsPerChain).filter((chainId) =>
        globalFilter.includes(Number(chainId))
      );
      if (selectedChainIds.length > 0) {
        let _isLoading = true;
        selectedChainIds.map((chainId) => {
          _isLoading = _isLoading && positionsPerChain[chainId].isLoading;
        });
        setIsLoading(_isLoading);
      } else {
        setIsLoading(isAllLoading);
      }

      return null;
    },
    {
      enabled: Object.values(positionsPerChain).length > 0
    }
  );

  useEffect(() => {
    mounted.current = true;

    const data = localStorage.getItem(IONIC_LOCALSTORAGE_KEYS);
    if (data && mounted.current) {
      const obj = JSON.parse(data);
      const _globalFilter = (obj.newPositionFilter as PositionFilter[]) || [ALL_NETWORKS];
      setGlobalFilter(_globalFilter);

      if (
        obj &&
        obj.newPositionSorting &&
        NEW_POSITION_COLUMNS.includes(obj.newPositionSorting[0].id)
      ) {
        setSorting(obj.newPositionSorting);
      } else {
        setSorting([{ desc: true, id: TVL }]);
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
            text: `Unable to retrieve Positions. Please try again later.`
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
          <Text size="xl">New Positions</Text>
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
            <HStack>
              <Text size="md" width="max-content">
                Sort by
              </Text>
              <ChevronDownIcon />
            </HStack>
          </Flex>
        </Flex>
        <Flex
          alignItems="center"
          flexWrap="wrap"
          gap={4}
          justifyContent={['center', 'center', 'space-between']}
          width="100%"
        >
          <Flex gap={{ base: '20px' }}>
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
                  ) : filteredNewPositions.length === 0 ? (
                    <Tr>
                      <Td border="none" colSpan={tableData.headerGroups[0].headers.length}>
                        <Center py={8}>There are no positions.</Center>
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
                  <Text size="md">Positions Per Page</Text>
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
