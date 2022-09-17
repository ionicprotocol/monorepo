import {
  ChevronLeftIcon,
  ChevronRightIcon,
  TriangleDownIcon,
  TriangleUpIcon,
} from '@chakra-ui/icons';
import {
  Box,
  Center,
  Flex,
  HStack,
  IconButton,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { FlywheelMarketRewardsInfo } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import * as React from 'react';
import { Fragment, useMemo } from 'react';

import { AdditionalInfo } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/AdditionalInfo';
import { BorrowApy } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/BorrowApy';
import { BorrowBalance } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/BorrowBalance';
import { Collateral } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/Collateral';
import { ExpanderButton } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/ExpanderButton';
import { Liquidity } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/Liquidity';
import { Ltv } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/Ltv';
import { Market } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/Market';
import { SupplyApy } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/SupplyApy';
import { SupplyBalance } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/SupplyBalance';
import { Tvl } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/Tvl';
import { FilterButton } from '@ui/components/shared/Button';
import { MARKETS_COUNT_PER_PAGE } from '@ui/constants/index';
import { useColors } from '@ui/hooks/useColors';
import { MarketData } from '@ui/types/TokensDataMap';
import { sortAssets } from '@ui/utils/sortAssets';

export type Market = {
  market: MarketData;
  supplyApy: MarketData;
  supplyBalance: MarketData;
  collateral: MarketData;
  borrowApy: MarketData;
  tvl: MarketData;
  ltv: MarketData;
  borrowBalance: MarketData;
  liquidity: MarketData;
};

export const MarketsList = ({
  assets,
  rewards = [],
  comptrollerAddress,
}: {
  assets: MarketData[];
  rewards?: FlywheelMarketRewardsInfo[];
  comptrollerAddress: string;
}) => {
  const suppliedAssets = useMemo(
    () => sortAssets(assets).filter((asset) => asset.supplyBalance.gt(0)),
    [assets]
  );
  const nonSuppliedAssets = useMemo(
    () => sortAssets(assets).filter((asset) => asset.supplyBalance.eq(0)),
    [assets]
  );

  const data: Market[] = useMemo(() => {
    return [...suppliedAssets, ...nonSuppliedAssets].map((asset) => {
      return {
        market: asset,
        supplyApy: asset,
        supplyBalance: asset,
        collateral: asset,
        borrowApy: asset,
        tvl: asset,
        ltv: asset,
        borrowBalance: asset,
        liquidity: asset,
      };
    });
  }, [suppliedAssets, nonSuppliedAssets]);

  const columns: ColumnDef<Market>[] = useMemo(() => {
    return [
      {
        accessorKey: 'market',
        header: () => (
          <Text textAlign="start" py={2}>
            Market
          </Text>
        ),
        cell: ({ getValue }) => <Market asset={getValue<MarketData>()} />,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.ltv,
        id: 'LTV',
        cell: ({ getValue }) => <Ltv asset={getValue<MarketData>()} />,
        header: () => (
          <Text textAlign="end" py={2}>
            LTV
          </Text>
        ),
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.supplyApy,
        id: 'supplyApy',
        cell: ({ getValue }) => <SupplyApy asset={getValue<MarketData>()} rewards={rewards} />,
        header: () => (
          <Text textAlign="end" py={2}>
            Supply APY
          </Text>
        ),
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.borrowApy,
        id: 'borrowApy',
        cell: ({ getValue }) => <BorrowApy asset={getValue<MarketData>()} />,
        header: () => (
          <Text textAlign="end" py={2}>
            Borrow Apy
          </Text>
        ),
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.tvl,
        id: 'tvl',
        cell: ({ getValue }) => <Tvl asset={getValue<MarketData>()} />,
        header: () => (
          <Text textAlign="end" py={2}>
            TVL
          </Text>
        ),
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.supplyBalance,
        id: 'supplyBalance',
        cell: ({ getValue }) => <SupplyBalance asset={getValue<MarketData>()} />,
        header: () => (
          <Text textAlign="end" py={2}>
            Supply Balance
          </Text>
        ),
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.borrowBalance,
        id: 'borrowBalance',
        cell: ({ getValue }) => <BorrowBalance asset={getValue<MarketData>()} />,
        header: () => (
          <Text textAlign="end" py={2}>
            Borrow Balance
          </Text>
        ),
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.liquidity,
        id: 'liquidity',
        cell: ({ getValue }) => <Liquidity asset={getValue<MarketData>()} />,
        header: () => (
          <Text textAlign="end" py={2}>
            Liquidity
          </Text>
        ),
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.collateral,
        id: 'collateral',
        cell: ({ getValue }) => (
          <Collateral asset={getValue<MarketData>()} comptrollerAddress={comptrollerAddress} />
        ),
        header: () => (
          <Text textAlign="end" py={2}>
            Collateral
          </Text>
        ),
        footer: (props) => props.column.id,
      },
      {
        id: 'expander',
        header: () => null,
        cell: ({ row }) => {
          return (
            <ExpanderButton
              getToggleExpandedHandler={row.getToggleExpandedHandler()}
              isExpanded={row.getIsExpanded()}
              canExpand={row.getCanExpand()}
            />
          );
        },
      },
    ];
  }, [rewards, comptrollerAddress]);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, onPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const table = useReactTable({
    columns,
    data,
    getRowCanExpand: () => true,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: onPagination,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    state: {
      sorting,
      pagination,
    },
  });

  const { cCard } = useColors();

  return (
    <Box overflowX="auto">
      <Flex justifyContent="space-between" px="4" py="8">
        <HStack className="pagination" gap={4}>
          <Text fontSize={24}>Assets</Text>
          <FilterButton
            variant="filter"
            isSelected={true}
            onClick={() => {
              // setSelectedAsset(asset);
              // setSelectedIndex(index);
            }}
            px={2}
          >
            <Center px={1} fontWeight="bold">
              Collateral
            </Center>
          </FilterButton>
        </HStack>
        <HStack className="pagination" gap={4}>
          <HStack>
            <Text>Rows Per Page :</Text>
            <Select
              value={pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              maxW="max-content"
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
              {pagination.pageIndex * pagination.pageSize + 1} -{' '}
              {(pagination.pageIndex + 1) * pagination.pageSize >
              table.getCoreRowModel().rows.length
                ? table.getCoreRowModel().rows.length
                : (pagination.pageIndex + 1) * pagination.pageSize}{' '}
              of {table.getCoreRowModel().rows.length}
            </Text>
            <HStack>
              <IconButton
                variant="outline"
                aria-label="toPrevious"
                icon={<ChevronLeftIcon fontSize={30} />}
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                isRound
              />
              <IconButton
                variant="outline"
                aria-label="toNext"
                icon={<ChevronRightIcon fontSize={30} />}
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                isRound
              />
            </HStack>
          </HStack>
        </HStack>
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
                    fontSize={16}
                    textTransform="capitalize"
                    py={4}
                  >
                    <HStack gap={1} justifyContent={header.index === 0 ? 'flex-start' : 'flex-end'}>
                      <>{flexRender(header.column.columnDef.header, header.getContext())}</>
                      <>
                        {header.column.getIsSorted() ? (
                          header.column.getIsSorted() === 'desc' ? (
                            <TriangleDownIcon aria-label="sorted descending" />
                          ) : (
                            <TriangleUpIcon aria-label="sorted ascending" />
                          )
                        ) : null}
                      </>
                    </HStack>
                  </Th>
                );
              })}
            </Tr>
          ))}
        </Thead>
        <Tbody>
          {table.getRowModel().rows.map((row) => (
            <Fragment key={row.id}>
              <Tr
                key={row.id}
                borderColor={cCard.dividerColor}
                borderTopWidth={row.getIsExpanded() ? 4 : 1}
                background={row.getIsExpanded() ? cCard.hoverBgColor : cCard.bgColor}
                _hover={{ bg: cCard.hoverBgColor }}
              >
                {row.getVisibleCells().map((cell) => {
                  return (
                    <Td key={cell.id} border="none">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Td>
                  );
                })}
              </Tr>
              {row.getIsExpanded() && (
                <Tr
                  borderColor={cCard.dividerColor}
                  borderBottomWidth={row.getIsExpanded() ? 6 : 0}
                  background={row.getIsExpanded() ? cCard.hoverBgColor : cCard.bgColor}
                >
                  {/* 2nd row is a custom 1 cell row */}
                  <Td border="none" colSpan={row.getVisibleCells().length}>
                    <AdditionalInfo row={row} />
                  </Td>
                </Tr>
              )}
            </Fragment>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};
