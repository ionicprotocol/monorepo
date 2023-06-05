import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  Box,
  Center,
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
  Tr,
} from '@chakra-ui/react';
import type { CreatedPosition, SupportedChains } from '@midas-capital/types';
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
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import * as React from 'react';

import { Chain } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/Chain';
import { AdditionalInfo } from '@ui/components/pages/LeveragePage/LeverageList/CreatedPosition/AdditionalInfo/index';
import { BorrowableAssets } from '@ui/components/pages/LeveragePage/LeverageList/CreatedPosition/BorrowableAssets';
import { SupplyApy } from '@ui/components/pages/LeveragePage/LeverageList/CreatedPosition/SupplyApy';
import { TokenName } from '@ui/components/pages/VaultsPage/VaultsList/TokenName';
import { Banner } from '@ui/components/shared/Banner';
import { MidasBox } from '@ui/components/shared/Box';
import { CIconButton } from '@ui/components/shared/Button';
import { TableHeaderCell } from '@ui/components/shared/TableHeaderCell';
import {
  ALL,
  BORROWABLE_ASSET,
  CHAIN,
  COLLATERAL_ASSET,
  CREATED_POSITION_PER_PAGE,
  HIDDEN,
  MARKETS_COUNT_PER_PAGE,
  MIDAS_LOCALSTORAGE_KEYS,
  SEARCH,
  SUPPLY_APY,
} from '@ui/constants/index';
import { useColors } from '@ui/hooks/useColors';
import type { Err, LeveragesPerChainStatus } from '@ui/types/ComponentPropsType';
import { sortLeverages } from '@ui/utils/sorts';

export type LeverageRowData = {
  borrowableAsset: CreatedPosition;
  chain: CreatedPosition;
  collateralAsset: CreatedPosition;
  supplyApy: CreatedPosition;
};

export const CreatedPositionComp = ({
  initGlobalFilter,
  initColumnVisibility,
  initSorting,
  isLoading,
  leveragesPerChain,
  initSearchText,
}: {
  initColumnVisibility: VisibilityState;
  initGlobalFilter: (SupportedChains | string)[];
  initSearchText: string;
  initSorting: SortingState;
  isLoading: boolean;
  leveragesPerChain: LeveragesPerChainStatus;
}) => {
  const [err, setErr] = useState<Err | undefined>();
  const [isLoadingPerChain, setIsLoadingPerChain] = useState(false);
  const [selectedFilteredLeverages, setSelectedFilteredLeverages] = useState<CreatedPosition[]>([]);
  const [sorting, setSorting] = useState<SortingState>(initSorting);
  const [pagination, onPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: CREATED_POSITION_PER_PAGE[0],
  });

  const [globalFilter, setGlobalFilter] = useState<(SupportedChains | string)[]>(initGlobalFilter);
  const [columnVisibility, setColumnVisibility] = useState(initColumnVisibility);

  const allCreatedPositions = useMemo(() => {
    return Object.values(leveragesPerChain).reduce((res, leverages) => {
      if (leverages.data && leverages.data.createdPositions.length > 0) {
        res.push(...leverages.data.createdPositions);
      }

      return res;
    }, [] as CreatedPosition[]);
  }, [leveragesPerChain]);

  useEffect(() => {
    const leverages: CreatedPosition[] = [];

    if (globalFilter.includes(ALL)) {
      setSelectedFilteredLeverages([...allCreatedPositions]);
    } else {
      globalFilter.map((filter) => {
        const data = leveragesPerChain[filter.toString()]?.data?.createdPositions;

        if (data) {
          leverages.push(...data);
        }
      });

      setSelectedFilteredLeverages(leverages);
    }
  }, [globalFilter, leveragesPerChain, allCreatedPositions]);

  const leverageFilter: FilterFn<LeverageRowData> = useCallback(
    (row, columnId, value) => {
      if (
        (!initSearchText ||
          (value.includes(SEARCH) &&
            (row.original.collateralAsset.collateral.symbol
              .toLowerCase()
              .includes(initSearchText.toLowerCase()) ||
              row.original.collateralAsset.collateral.underlyingToken
                .toLowerCase()
                .includes(initSearchText.toLowerCase())))) &&
        !value.includes(HIDDEN)
      ) {
        if (value.includes(ALL) || value.includes(row.original.collateralAsset.chainId)) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    },
    [initSearchText]
  );

  const leverageSort: SortingFn<LeverageRowData> = useCallback((rowA, rowB, columnId) => {
    if (columnId === COLLATERAL_ASSET) {
      return rowB.original.collateralAsset.collateral.symbol.localeCompare(
        rowA.original.collateralAsset.collateral.symbol
      );
    } else if (columnId === CHAIN) {
      return Number(rowB.original.collateralAsset.chainId) >
        Number(rowA.original.collateralAsset.chainId)
        ? 1
        : -1;
    } else if (columnId === SUPPLY_APY) {
      return Number(rowB.original.collateralAsset.collateral.supplyRatePerBlock) >
        Number(rowA.original.collateralAsset.collateral.supplyRatePerBlock)
        ? 1
        : -1;
    } else {
      return 0;
    }
  }, []);

  const data: LeverageRowData[] = useMemo(() => {
    return sortLeverages(allCreatedPositions).map((leverage) => {
      return {
        borrowableAsset: leverage,
        chain: leverage,
        collateralAsset: leverage,
        supplyApy: leverage,
      };
    });
  }, [allCreatedPositions]);

  const columns: ColumnDef<LeverageRowData>[] = useMemo(() => {
    return [
      {
        accessorFn: (row) => row.chain,
        cell: ({ getValue }) => <Chain chainId={Number(getValue<CreatedPosition>().chainId)} />,
        enableHiding: false,
        footer: (props) => props.column.id,
        header: () => null,
        id: CHAIN,
        sortingFn: leverageSort,
      },
      {
        accessorFn: (row) => row.collateralAsset,
        cell: ({ getValue }) => (
          <TokenName
            chainId={Number(getValue<CreatedPosition>().chainId)}
            symbol={getValue<CreatedPosition>().collateral.symbol}
            underlying={getValue<CreatedPosition>().collateral.underlyingToken}
          />
        ),
        enableHiding: false,
        filterFn: leverageFilter,
        footer: (props) => props.column.id,
        header: (context) => (
          <TableHeaderCell context={context}>{COLLATERAL_ASSET}</TableHeaderCell>
        ),
        id: COLLATERAL_ASSET,
        sortingFn: leverageSort,
      },
      {
        accessorFn: (row) => row.supplyApy,
        cell: ({ getValue }) => <SupplyApy leverage={getValue<CreatedPosition>()} />,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{SUPPLY_APY}</TableHeaderCell>,
        id: SUPPLY_APY,
        sortingFn: leverageSort,
      },
      {
        accessorFn: (row) => row.borrowableAsset,
        cell: ({ getValue }) => <BorrowableAssets leverage={getValue<CreatedPosition>()} />,
        enableSorting: false,
        footer: (props) => props.column.id,
        header: (context) => (
          <TableHeaderCell context={context}>{BORROWABLE_ASSET}</TableHeaderCell>
        ),
        id: BORROWABLE_ASSET,
      },
    ];
  }, [leverageFilter, leverageSort]);

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
    globalFilterFn: leverageFilter,
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

  const { cCard } = useColors();

  useEffect(() => {
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
    const data = { ...oldObj, leverageColumnVisibility: arr, leverageSorting: sorting };
    localStorage.setItem(MIDAS_LOCALSTORAGE_KEYS, JSON.stringify(data));
  }, [sorting, columnVisibility]);

  useEffect(() => {
    const selectedChainId = Object.keys(leveragesPerChain).find((chainId) =>
      globalFilter.includes(Number(chainId))
    );
    if (selectedChainId) {
      setErr(leveragesPerChain[selectedChainId].error);
      setIsLoadingPerChain(leveragesPerChain[selectedChainId].isLoading);
    } else {
      setErr(undefined);
      setIsLoadingPerChain(isLoading);
    }
  }, [globalFilter, leveragesPerChain, isLoading]);

  return (
    <Box>
      <MidasBox overflowX="auto" width="100%">
        {err && err.code !== 'NETWORK_ERROR' ? (
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
                text: `Unable to retrieve Leverages. Please try again later.`,
              },
            ]}
            title={err.reason ? err.reason : 'Unexpected Error'}
          />
        ) : !isLoading && !isLoadingPerChain ? (
          <Table>
            <Thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr borderBottomWidth={1} borderColor={cCard.dividerColor} key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <Th
                        border="none"
                        color={cCard.txtColor}
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        px={{
                          base: header.column.id === COLLATERAL_ASSET ? 2 : 1,
                          lg: header.column.id === COLLATERAL_ASSET ? 4 : 2,
                        }}
                        py={6}
                        textTransform="capitalize"
                      >
                        <HStack
                          justifyContent={
                            header.column.id === CHAIN
                              ? 'center'
                              : header.column.id === COLLATERAL_ASSET
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
              {table.getRowModel().rows && table.getRowModel().rows.length !== 0 ? (
                table.getRowModel().rows.map((row) => (
                  <Fragment key={row.id}>
                    <Tr
                      _hover={{ bg: cCard.hoverBgColor }}
                      background={row.getIsExpanded() ? cCard.hoverBgColor : cCard.bgColor}
                      borderBottomWidth={row.getIsExpanded() ? 0 : 1}
                      borderColor={cCard.dividerColor}
                      className={row.original.collateralAsset.collateral.symbol}
                      cursor="pointer"
                      key={row.id}
                      onClick={() => row.toggleExpanded()}
                    >
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <Td border="none" key={cell.id} px={{ base: 2, lg: 4 }} py={2}>
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
              ) : selectedFilteredLeverages.length === 0 ? (
                <Tr>
                  <Td border="none" colSpan={table.getHeaderGroups()[0].headers.length}>
                    <Center py={8}>There are no assets to use leverage with on this chain.</Center>
                  </Td>
                </Tr>
              ) : (
                <Tr>
                  <Td border="none" colSpan={table.getHeaderGroups()[0].headers.length}>
                    <Center py={8}>No results</Center>
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
        {/* Pagination Elements */}
        <Flex alignItems="center" className="pagination" gap={4} justifyContent="flex-end" p={4}>
          <HStack>
            <Hide below="lg">
              <Text>Assets Per Page</Text>
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
            <Text>
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
      </MidasBox>
    </Box>
  );
};
