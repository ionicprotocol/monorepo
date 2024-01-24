import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  Center,
  Flex,
  Hide,
  HStack,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import type { ColumnDef, PaginationState, SortingFn, SortingState } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { colord, extend } from 'colord';
import mixPlugin from 'colord/plugins/mix';
import * as React from 'react';
import { Fragment, useCallback, useMemo, useState } from 'react';

import { Asset } from './Asset';
import { Collateral } from './Collateral';
import { PercentInPortFolio } from './PercentInPortFolio';
import { SupplyApy } from './SupplyApy';
import { TotalSupply } from './TotalSupply';
import { TotalSupplyBar } from './TotalSupplyBar';
import { UtilizationRate } from './UtilizationRate';

import { CIconButton } from '@ui/components/shared/Button';
import { TableHeaderCell } from '@ui/components/shared/TableHeaderCell';
import {
  APY,
  COLLATERAL,
  MARKETS_COUNT_PER_PAGE,
  PERCENT_IN_PORTFOLIO,
  POOLS_COUNT_PER_PAGE,
  SUPPLY_ASSET,
  TOTAL_SUPPLY,
  UTILIZATION_RATE
} from '@ui/constants/index';
import { useLendingAssets } from '@ui/hooks/lend/useLendingAssets';
import { useAssets } from '@ui/hooks/useAssets';
import { useColors } from '@ui/hooks/useColors';
import { useRewards } from '@ui/hooks/useRewards';
import { useTotalSupplyAPYs } from '@ui/hooks/useTotalSupplyAPYs';
import type { MarketData, PoolData } from '@ui/types/TokensDataMap';

extend([mixPlugin]);

export type LendingAssetRowData = {
  apy: MarketData;
  collateral: MarketData;
  percentInPortfolio: MarketData;
  supplyAsset: MarketData;
  totalSupply: MarketData;
  utilizationRate: MarketData;
  walletBalance: MarketData;
};

export const AssetsList = ({ poolData }: { poolData: PoolData }) => {
  const { id: poolId, chainId, comptroller, assets, totalSuppliedFiat } = poolData;
  const [sorting, setSorting] = useState<SortingState>([{ desc: true, id: SUPPLY_ASSET }]);
  const [pagination, onPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: POOLS_COUNT_PER_PAGE[0]
  });
  const { data: allRewards } = useRewards({ chainId, poolId: poolId.toString() });
  const { data: assetInfos } = useAssets(chainId ? [chainId] : []);
  const { data: totalSupplyApyPerAsset } = useTotalSupplyAPYs(
    assets,
    chainId,
    allRewards,
    assetInfos
  );

  const mixedColor = useCallback((ratio: number) => {
    let color1 = '';
    let color2 = '';
    let _ratio = 0;
    if (ratio < 0.5) {
      color1 = '#FF3864'; // iRed
      color2 = '#F1F996'; // iYellow
      _ratio = ratio * 2;
    } else {
      _ratio = (ratio - 0.5) * 2;
      color1 = '#F1F996'; // iYellow
      color2 = '#39FF88'; // iGreen
    }

    return colord(color1).mix(color2, _ratio).toHex();
  }, []);

  const assetSort: SortingFn<LendingAssetRowData> = useCallback(
    (rowA, rowB, columnId) => {
      if (columnId === SUPPLY_ASSET) {
        return rowB.original.supplyAsset.underlyingSymbol.localeCompare(
          rowA.original.supplyAsset.underlyingSymbol
        );
      } else if (columnId === TOTAL_SUPPLY || columnId === PERCENT_IN_PORTFOLIO) {
        return rowB.original.supplyAsset.totalSupplyFiat > rowA.original.supplyAsset.totalSupplyFiat
          ? 1
          : -1;
      } else if (columnId === APY) {
        const rowAAPY =
          totalSupplyApyPerAsset && totalSupplyApyPerAsset[rowA.original.supplyAsset.cToken]
            ? totalSupplyApyPerAsset[rowA.original.supplyAsset.cToken].totalApy
            : 0;
        const rowBSupplyAPY =
          totalSupplyApyPerAsset && totalSupplyApyPerAsset[rowA.original.supplyAsset.cToken]
            ? totalSupplyApyPerAsset[rowB.original.supplyAsset.cToken].totalApy
            : 0;
        return rowAAPY > rowBSupplyAPY ? 1 : -1;
      } else if (columnId === UTILIZATION_RATE) {
        return rowB.original.supplyAsset.utilization > rowA.original.supplyAsset.utilization
          ? 1
          : -1;
      } else {
        return 1;
      }
    },
    [totalSupplyApyPerAsset]
  );

  const data = useLendingAssets(assets);

  const columns: ColumnDef<LendingAssetRowData>[] = useMemo(() => {
    return [
      {
        accessorFn: (row) => row.supplyAsset,
        cell: ({ getValue }) => (
          <Asset
            asset={getValue<MarketData>()}
            mixedColor={mixedColor}
            poolChainId={chainId}
            totalSuppliedFiat={totalSuppliedFiat}
          />
        ),
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{SUPPLY_ASSET}</TableHeaderCell>,
        id: SUPPLY_ASSET,
        sortingFn: assetSort
      },
      {
        accessorFn: (row) => row.apy,
        cell: ({ getValue }) => (
          <SupplyApy
            asset={getValue<MarketData>()}
            poolChainId={chainId}
            rewards={allRewards}
            totalApy={
              totalSupplyApyPerAsset
                ? totalSupplyApyPerAsset[getValue<MarketData>().cToken]?.totalApy
                : undefined
            }
          />
        ),
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{APY}</TableHeaderCell>,
        id: APY,
        sortingFn: assetSort
      },
      {
        accessorFn: (row) => row.collateral,
        cell: ({ getValue }) => (
          <Collateral
            asset={getValue<MarketData>()}
            assets={assets}
            chainId={chainId}
            comptroller={comptroller}
          />
        ),
        enableSorting: false,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{COLLATERAL}</TableHeaderCell>,
        id: COLLATERAL,
        sortingFn: assetSort
      },
      {
        accessorFn: (row) => row.totalSupply,
        cell: ({ getValue }) => (
          <TotalSupply asset={getValue<MarketData>()} chainId={chainId} comptroller={comptroller} />
        ),
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{TOTAL_SUPPLY}</TableHeaderCell>,
        id: TOTAL_SUPPLY,
        sortingFn: assetSort
      },
      {
        accessorFn: (row) => row.utilizationRate,
        cell: ({ getValue }) => <UtilizationRate asset={getValue<MarketData>()} />,
        footer: (props) => props.column.id,
        header: (context) => (
          <TableHeaderCell context={context}>{UTILIZATION_RATE}</TableHeaderCell>
        ),
        id: UTILIZATION_RATE,
        sortingFn: assetSort
      },
      {
        accessorFn: (row) => row.percentInPortfolio,
        cell: ({ getValue }) => (
          <PercentInPortFolio
            asset={getValue<MarketData>()}
            mixedColor={mixedColor}
            totalSuppliedFiat={totalSuppliedFiat}
          />
        ),
        footer: (props) => props.column.id,
        header: (context) => (
          <TableHeaderCell context={context}>{PERCENT_IN_PORTFOLIO}</TableHeaderCell>
        ),
        id: PERCENT_IN_PORTFOLIO,
        sortingFn: assetSort
      }
    ];
  }, [
    assetSort,
    mixedColor,
    chainId,
    totalSuppliedFiat,
    allRewards,
    totalSupplyApyPerAsset,
    assets,
    comptroller
  ]);

  const table = useReactTable({
    columns,
    data,
    enableSortingRemoval: false,
    getColumnCanGlobalFilter: () => true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: onPagination,
    onSortingChange: setSorting,
    state: {
      pagination,
      sorting
    }
  });

  const { data: tableData } = useQuery(['LendingAssetsTableData', table], () => {
    return {
      canNextPage: table.getCanNextPage(),
      canPreviousPage: table.getCanPreviousPage(),
      filteredRows: table.getFilteredRowModel().rows,
      headerGroups: table.getHeaderGroups(),
      rows: table.getRowModel().rows
    };
  });

  const { cCard, cIRow } = useColors();

  return (
    <Flex direction="column" gap="24px" overflowX={'auto'}>
      <Flex
        alignItems="center"
        flexWrap="wrap"
        gap={4}
        justifyContent={['center', 'center', 'space-between']}
        width="100%"
      >
        <Text size="xl">Vault Strategies</Text>
      </Flex>
      {data.length === 0 ? (
        <Flex>
          <Text color={'iGray'}>No assets to supply</Text>
        </Flex>
      ) : tableData ? (
        <>
          <TotalSupplyBar assets={assets} mixedColor={mixedColor} />
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
              {tableData.rows && tableData.rows.length > 0 ? (
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
              ) : assets.length === 0 ? (
                <Tr>
                  <Td border="none" colSpan={tableData.headerGroups[0].headers.length}>
                    <Center py={8}>There are no assets to supply.</Center>
                  </Td>
                </Tr>
              ) : (
                <Tr>
                  <Td border="none" colSpan={tableData.headerGroups[0].headers.length}>
                    <Center py={8}>There are no search results</Center>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
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
                <Text size="md">Assets Per Page</Text>
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
              <Text size="md">
                {tableData.filteredRows.length === 0
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
  );
};
