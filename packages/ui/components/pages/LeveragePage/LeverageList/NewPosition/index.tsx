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
  VStack,
} from '@chakra-ui/react';
import type { LeveredBorrowable, NewPosition, SupportedChains } from '@ionicprotocol/types';
import type {
  ColumnDef,
  FilterFn,
  PaginationState,
  SortingFn,
  SortingState,
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
import { AdditionalInfo } from '@ui/components/pages/LeveragePage/LeverageList/NewPosition/AdditionalInfo/index';
import { BorrowableAssets } from '@ui/components/pages/LeveragePage/LeverageList/NewPosition/BorrowableAssets';
import { SupplyApy } from '@ui/components/pages/LeveragePage/LeverageList/NewPosition/SupplyApy';
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
  HIDDEN,
  MARKETS_COUNT_PER_PAGE,
  MIDAS_LOCALSTORAGE_KEYS,
  POSITION_CREATION_PER_PAGE,
  SEARCH,
  SUPPLY_APY,
} from '@ui/constants/index';
import { useColors } from '@ui/hooks/useColors';
import type { Err, PositionsPerChainStatus } from '@ui/types/ComponentPropsType';
import { sortPositions } from '@ui/utils/sorts';

export type NewPositionRowData = {
  borrowableAsset: NewPosition;
  chain: NewPosition;
  collateralAsset: NewPosition;
  supplyApy: NewPosition;
};

export const NewPositionComp = ({
  initGlobalFilter,
  initSorting,
  isLoading,
  positionsPerChain,
  initSearchText,
  setGlobalFilter,
}: {
  initGlobalFilter: (SupportedChains | string)[];
  initSearchText: string;
  initSorting: SortingState;
  isLoading: boolean;
  positionsPerChain: PositionsPerChainStatus;
  setGlobalFilter: (globalFilter: (SupportedChains | string)[]) => void;
}) => {
  const [err, setErr] = useState<Err | undefined>();
  const [isLoadingPerChain, setIsLoadingPerChain] = useState(false);
  const [selectedFilteredPositions, setSelectedFilteredPositions] = useState<NewPosition[]>([]);
  const [sorting, setSorting] = useState<SortingState>(initSorting);
  const [pagination, onPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: POSITION_CREATION_PER_PAGE[0],
  });

  const [selectedBorrowableAssets, setSelectedBorrowableAssets] = useState<{
    [collateral: string]: LeveredBorrowable;
  }>();

  const allNewPositions = useMemo(() => {
    return Object.values(positionsPerChain).reduce((res, positions) => {
      if (positions.data && positions.data.newPositions.length > 0) {
        positions.data.newPositions.map((position) => {
          if (position.borrowable.length > 0) {
            res.push(position);
          }
        });
      }

      return res;
    }, [] as NewPosition[]);
  }, [positionsPerChain]);

  useEffect(() => {
    const _selectedBorrowableAssets: {
      [collateral: string]: LeveredBorrowable;
    } = {};

    allNewPositions.map((newPosition) => {
      if (newPosition.borrowable.length > 0) {
        _selectedBorrowableAssets[newPosition.collateral.cToken] = newPosition.borrowable[0];
      }
    });

    setSelectedBorrowableAssets(_selectedBorrowableAssets);
  }, [allNewPositions]);

  useEffect(() => {
    const positions: NewPosition[] = [];

    if (initGlobalFilter.includes(ALL)) {
      setSelectedFilteredPositions([...allNewPositions]);
    } else {
      initGlobalFilter.map((filter) => {
        const data = positionsPerChain[filter.toString()]?.data?.newPositions;

        if (data) {
          positions.push(...data);
        }
      });

      setSelectedFilteredPositions(positions);
    }
  }, [initGlobalFilter, positionsPerChain, allNewPositions]);

  const positionFilter: FilterFn<NewPositionRowData> = useCallback(
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

  const positionSort: SortingFn<NewPositionRowData> = useCallback((rowA, rowB, columnId) => {
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

  const data: NewPositionRowData[] = useMemo(() => {
    return sortPositions(allNewPositions).map((position) => {
      return {
        borrowableAsset: position,
        chain: position,
        collateralAsset: position,
        supplyApy: position,
      };
    });
  }, [allNewPositions]);

  const columns: ColumnDef<NewPositionRowData>[] = useMemo(() => {
    return [
      {
        accessorFn: (row) => row.chain,
        cell: ({ getValue }) => <Chain chainId={Number(getValue<NewPosition>().chainId)} />,
        enableHiding: false,
        footer: (props) => props.column.id,
        header: () => null,
        id: CHAIN,
        sortingFn: positionSort,
      },
      {
        accessorFn: (row) => row.collateralAsset,
        cell: ({ getValue }) => (
          <TokenName
            chainId={Number(getValue<NewPosition>().chainId)}
            symbol={getValue<NewPosition>().collateral.symbol}
            underlying={getValue<NewPosition>().collateral.underlyingToken}
          />
        ),
        enableHiding: false,
        filterFn: positionFilter,
        footer: (props) => props.column.id,
        header: (context) => (
          <TableHeaderCell context={context}>{COLLATERAL_ASSET}</TableHeaderCell>
        ),
        id: COLLATERAL_ASSET,
        sortingFn: positionSort,
      },
      {
        accessorFn: (row) => row.supplyApy,
        cell: ({ getValue }) => <SupplyApy position={getValue<NewPosition>()} />,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{SUPPLY_APY}</TableHeaderCell>,
        id: SUPPLY_APY,
        sortingFn: positionSort,
      },
      {
        accessorFn: (row) => row.borrowableAsset,
        cell: ({ getValue }) => (
          <BorrowableAssets
            position={getValue<NewPosition>()}
            selectedBorrowableAssets={selectedBorrowableAssets}
            setSelectedBorrowableAssets={setSelectedBorrowableAssets}
          />
        ),
        enableSorting: false,
        footer: (props) => props.column.id,
        header: (context) => (
          <TableHeaderCell context={context}>{BORROWABLE_ASSET}</TableHeaderCell>
        ),
        id: BORROWABLE_ASSET,
      },
    ];
  }, [positionFilter, positionSort, selectedBorrowableAssets]);

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
    globalFilterFn: positionFilter,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: onPagination,
    onSortingChange: setSorting,
    state: {
      globalFilter: initGlobalFilter,
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

    const data = { ...oldObj, newPositionSorting: sorting };
    localStorage.setItem(MIDAS_LOCALSTORAGE_KEYS, JSON.stringify(data));
  }, [sorting]);

  useEffect(() => {
    const selectedChainId = Object.keys(positionsPerChain).find((chainId) =>
      initGlobalFilter.includes(Number(chainId))
    );
    if (selectedChainId) {
      setErr(positionsPerChain[selectedChainId].error);
      setIsLoadingPerChain(positionsPerChain[selectedChainId].isLoading);
    } else {
      setErr(undefined);
      setIsLoadingPerChain(isLoading);
    }
  }, [initGlobalFilter, positionsPerChain, isLoading]);

  return (
    <VStack borderRadius="xl" spacing={0}>
      <Box
        background={cCard.headingBgColor}
        borderColor={cCard.borderColor}
        borderTopRadius={12}
        borderWidth={2}
        height={14}
        px={4}
        width="100%"
      >
        <Text py={4} size="md" textAlign="center" width="100%">
          Create New Levered Position
        </Text>
      </Box>
      <MidasBox borderTop="none" borderTopRadius="none" overflowX="auto" width="100%">
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
                          <AdditionalInfo
                            row={row}
                            selectedBorrowableAssets={selectedBorrowableAssets}
                          />
                        </Td>
                      </Tr>
                    )}
                  </Fragment>
                ))
              ) : selectedFilteredPositions.length === 0 ? (
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
    </VStack>
  );
};
