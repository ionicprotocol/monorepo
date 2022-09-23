import { ArrowDownIcon, ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
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
  VStack,
} from '@chakra-ui/react';
import { FlywheelMarketRewardsInfo } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
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

import { AdditionalInfo } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/AdditionalInfo';
import { BorrowApy } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/BorrowApy';
import { BorrowBalance } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/BorrowBalance';
import { Collateral } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/Collateral';
import { Liquidity } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/Liquidity';
import { SupplyApy } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/SupplyApy';
import { SupplyBalance } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/SupplyBalance';
import { TokenName } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/TokenName';
import { GlowingBox } from '@ui/components/shared/GlowingBox';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import {
  BORROWABLE,
  COLLATERAL,
  DOWN_LIMIT,
  MARKETS_COUNT_PER_PAGE,
  PROTECTED,
  REWARDS,
  UP_LIMIT,
} from '@ui/constants/index';
import { useMidas } from '@ui/context/MidasContext';
import { useAssetsClaimableRewards } from '@ui/hooks/rewards/useAssetClaimableRewards';
import { useColors } from '@ui/hooks/useColors';
import { useIsMobile } from '@ui/hooks/useScreenSize';
import { MarketData } from '@ui/types/TokensDataMap';
import { smallUsdFormatter } from '@ui/utils/bigUtils';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

export type Market = {
  market: MarketData;
  supplyApy: MarketData;
  supplyBalance: MarketData;
  collateral: MarketData;
  borrowApy: MarketData;
  borrowBalance: MarketData;
  liquidity: MarketData;
};

export const MarketsList = ({
  assets,
  rewards = [],
  comptrollerAddress,
  supplyBalanceFiat,
  borrowBalanceFiat,
}: {
  assets: MarketData[];
  rewards?: FlywheelMarketRewardsInfo[];
  comptrollerAddress: string;
  supplyBalanceFiat: number;
  borrowBalanceFiat: number;
}) => {
  const { midasSdk, currentChain } = useMidas();

  const { data: allClaimableRewards } = useAssetsClaimableRewards({
    poolAddress: comptrollerAddress,
    assetsAddress: assets.map((asset) => asset.cToken),
  });

  const [collateralCounts, protectedCounts, borrowableCounts] = useMemo(() => {
    return [
      assets.filter((asset) => asset.membership).length,
      assets.filter((asset) => asset.isBorrowPaused).length,
      assets.filter((asset) => !asset.isBorrowPaused).length,
    ];
  }, [assets]);

  const assetFilter: FilterFn<Market> = (row, columnId, value) => {
    if (
      (value.includes(REWARDS) &&
        allClaimableRewards &&
        allClaimableRewards[row.original.market.cToken]) ||
      (value.includes(COLLATERAL) && row.original.market.membership) ||
      (value.includes(PROTECTED) && row.original.market.isBorrowPaused) ||
      (value.includes(BORROWABLE) && !row.original.market.isBorrowPaused)
    ) {
      return true;
    } else {
      return false;
    }
  };

  const assetSort: SortingFn<Market> = (rowA, rowB, columnId) => {
    if (columnId === 'market') {
      return rowB.original.market.underlyingSymbol.localeCompare(
        rowA.original.market.underlyingSymbol
      );
    } else if (columnId === 'supplyApy') {
      const rowASupplyAPY = midasSdk.ratePerBlockToAPY(
        rowA.original.market.supplyRatePerBlock,
        getBlockTimePerMinuteByChainId(currentChain.id)
      );
      const rowBSupplyAPY = midasSdk.ratePerBlockToAPY(
        rowB.original.market.supplyRatePerBlock,
        getBlockTimePerMinuteByChainId(currentChain.id)
      );
      return rowASupplyAPY > rowBSupplyAPY ? 1 : -1;
    } else if (columnId === 'borrowApy') {
      const rowABorrowAPY = midasSdk.ratePerBlockToAPY(
        rowA.original.market.borrowRatePerBlock,
        getBlockTimePerMinuteByChainId(currentChain.id)
      );
      const rowBBorrowAPY = midasSdk.ratePerBlockToAPY(
        rowB.original.market.borrowRatePerBlock,
        getBlockTimePerMinuteByChainId(currentChain.id)
      );
      return rowABorrowAPY > rowBBorrowAPY ? 1 : -1;
    } else if (columnId === 'supplyBalance') {
      return rowA.original.market.supplyBalanceFiat > rowB.original.market.supplyBalanceFiat
        ? 1
        : -1;
    } else if (columnId === 'borrowBalance') {
      return rowA.original.market.borrowBalanceFiat > rowB.original.market.borrowBalanceFiat
        ? 1
        : -1;
    } else if (columnId === 'liquidity') {
      return rowA.original.market.liquidityFiat > rowB.original.market.liquidityFiat ? 1 : -1;
    } else if (columnId === 'collateral') {
      return rowA.original.market.membership ? 1 : -1;
    } else {
      return 1;
    }
  };

  const data: Market[] = useMemo(() => {
    return assets.map((asset) => {
      return {
        market: asset,
        supplyApy: asset,
        supplyBalance: asset,
        collateral: asset,
        borrowApy: asset,
        borrowBalance: asset,
        liquidity: asset,
      };
    });
  }, [assets]);

  const columns: ColumnDef<Market>[] = useMemo(() => {
    return [
      {
        accessorKey: 'market',
        header: () => <Text py={2}>Market (LTV)</Text>,
        cell: ({ getValue }) => (
          <TokenName asset={getValue<MarketData>()} poolAddress={comptrollerAddress} />
        ),
        footer: (props) => props.column.id,
        filterFn: assetFilter,
        sortingFn: assetSort,
      },
      {
        accessorFn: (row) => row.supplyApy,
        id: 'supplyApy',
        cell: ({ getValue }) => <SupplyApy asset={getValue<MarketData>()} rewards={rewards} />,
        header: () => (
          <Box py={2} textAlign="end" alignItems="end">
            <Text lineHeight="1.4">Supply APY</Text>
          </Box>
        ),
        footer: (props) => props.column.id,
        sortingFn: assetSort,
      },
      {
        accessorFn: (row) => row.borrowApy,
        id: 'borrowApy',
        cell: ({ getValue }) => <BorrowApy asset={getValue<MarketData>()} />,
        header: () => (
          <Box py={2} textAlign="end" alignItems="end">
            <Text lineHeight="1.4">Borrow APY</Text>
          </Box>
        ),
        footer: (props) => props.column.id,
        sortingFn: assetSort,
      },
      {
        accessorFn: (row) => row.supplyBalance,
        id: 'supplyBalance',
        cell: ({ getValue }) => <SupplyBalance asset={getValue<MarketData>()} />,
        header: () => (
          <VStack py={2} textAlign="end" alignItems="end">
            <Text>Supply</Text>
            <Text>Balance</Text>
          </VStack>
        ),
        footer: (props) => props.column.id,
        sortingFn: assetSort,
      },
      {
        accessorFn: (row) => row.borrowBalance,
        id: 'borrowBalance',
        cell: ({ getValue }) => <BorrowBalance asset={getValue<MarketData>()} />,
        header: () => (
          <VStack py={2} textAlign="end" alignItems="end">
            <Text>Borrow</Text>
            <Text>Balance</Text>
          </VStack>
        ),
        footer: (props) => props.column.id,
        sortingFn: assetSort,
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
        sortingFn: assetSort,
      },
      {
        accessorFn: (row) => row.collateral,
        id: 'collateral',
        cell: ({ getValue }) => (
          <Collateral asset={getValue<MarketData>()} comptrollerAddress={comptrollerAddress} />
        ),
        header: () => <Text py={2}>Collateral</Text>,
        footer: (props) => props.column.id,
        sortingFn: assetSort,
        // enableSorting: false,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rewards, comptrollerAddress]);

  const [sorting, setSorting] = useState<SortingState>([{ id: 'market', desc: false }]);
  const [pagination, onPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: MARKETS_COUNT_PER_PAGE[0],
  });
  const isMobile = useIsMobile();

  const [isCollateralFiltered, setIsCollateralFiltered] = useState<boolean>(true);
  const [isRewardsFiltered, setIsRewardsFiltered] = useState<boolean>(true);
  const [isProtectedFiltered, setIsProtectedFiltered] = useState<boolean>(true);
  const [isBorrowableFiltered, setIsBorrowableFiltered] = useState<boolean>(true);
  const [globalFilter, setGlobalFilter] = useState<string[]>([
    REWARDS,
    COLLATERAL,
    PROTECTED,
    BORROWABLE,
  ]);
  const [columnVisibility, setColumnVisibility] = useState({});

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
    globalFilterFn: assetFilter,
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
    if (isMobile) {
      table.getColumn('collateral').toggleVisibility(false);
    } else {
      table.getColumn('collateral').toggleVisibility(true);
    }
  }, [isMobile, table]);

  const { cCard } = useColors();

  const onRewardsFiltered = () => {
    if (!isRewardsFiltered) {
      setGlobalFilter([...globalFilter, REWARDS]);
    } else {
      setGlobalFilter(globalFilter.filter((f) => f !== REWARDS));
    }

    setIsRewardsFiltered(!isRewardsFiltered);
  };

  const onCollateralFiltered = () => {
    if (!isCollateralFiltered) {
      setGlobalFilter([...globalFilter, COLLATERAL]);
    } else {
      setGlobalFilter(globalFilter.filter((f) => f !== COLLATERAL));
    }

    setIsCollateralFiltered(!isCollateralFiltered);
  };

  const onProtectedFiltered = () => {
    if (!isProtectedFiltered) {
      setGlobalFilter([...globalFilter, PROTECTED]);
    } else {
      setGlobalFilter(globalFilter.filter((f) => f !== PROTECTED));
    }

    setIsProtectedFiltered(!isProtectedFiltered);
  };

  const onBorrowableFiltered = () => {
    if (!isBorrowableFiltered) {
      setGlobalFilter([...globalFilter, BORROWABLE]);
    } else {
      setGlobalFilter(globalFilter.filter((f) => f !== BORROWABLE));
    }

    setIsBorrowableFiltered(!isBorrowableFiltered);
  };

  return (
    <Box>
      <Flex px="4" mt={6} gap={8}>
        <HStack>
          <Text>Your Supply Balance :</Text>
          <SimpleTooltip
            label={supplyBalanceFiat.toString()}
            isDisabled={supplyBalanceFiat === DOWN_LIMIT || supplyBalanceFiat > UP_LIMIT}
          >
            <Text fontSize={24}>
              {smallUsdFormatter(supplyBalanceFiat)}
              {supplyBalanceFiat > DOWN_LIMIT && supplyBalanceFiat < UP_LIMIT && '+'}
            </Text>
          </SimpleTooltip>
        </HStack>
        <HStack>
          <Text>Your Borrow Balance :</Text>
          <SimpleTooltip
            label={borrowBalanceFiat.toString()}
            isDisabled={borrowBalanceFiat === DOWN_LIMIT || borrowBalanceFiat > UP_LIMIT}
          >
            <Text fontSize={24}>
              {smallUsdFormatter(borrowBalanceFiat)}
              {borrowBalanceFiat > DOWN_LIMIT && borrowBalanceFiat < UP_LIMIT && '+'}
            </Text>
          </SimpleTooltip>
        </HStack>
      </Flex>
      <Flex justifyContent="space-between" px="4" py="8">
        <Flex className="pagination" flexDirection={{ base: 'column', lg: 'row' }} gap={4}>
          <Text fontSize={24}>Assets</Text>
          <Grid
            templateColumns={{
              base: 'repeat(1, 1fr)',
              lg: 'repeat(4, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
            gap={2}
          >
            <Button
              variant="ghost"
              onClick={onRewardsFiltered}
              p={0}
              minWidth="150px"
              disabled={!allClaimableRewards || Object.keys(allClaimableRewards).length === 0}
            >
              {isRewardsFiltered ? (
                <GlowingBox height="100%" width="100%">
                  <Center width="100%" height="100%" borderRadius="xl">
                    {`${
                      (allClaimableRewards && Object.keys(allClaimableRewards).length) || 0
                    } Rewards`}
                  </Center>
                </GlowingBox>
              ) : (
                <Center width="100%" height="100%" fontWeight="bold" borderRadius="xl">
                  {`${
                    (allClaimableRewards && Object.keys(allClaimableRewards).length) || 0
                  } Rewards`}
                </Center>
              )}
            </Button>
            <Button
              variant={isCollateralFiltered ? 'outline' : 'ghost'}
              colorScheme="cyan"
              onClick={onCollateralFiltered}
              minWidth="150px"
              disabled={collateralCounts === 0}
            >
              <Center fontWeight="bold">{`${collateralCounts} Collateral`}</Center>
            </Button>
            <Button
              variant={isProtectedFiltered ? 'outline' : 'ghost'}
              colorScheme="purple"
              onClick={onProtectedFiltered}
              minWidth="150px"
              disabled={protectedCounts === 0}
            >
              <Center fontWeight="bold">{`${protectedCounts} Protected`}</Center>
            </Button>
            <Button
              variant={isBorrowableFiltered ? 'outline' : 'ghost'}
              colorScheme="orange"
              onClick={onBorrowableFiltered}
              minWidth="150px"
              disabled={borrowableCounts === 0}
            >
              <Center fontWeight="bold">{`${borrowableCounts} Borrowable`}</Center>
            </Button>
          </Grid>
        </Flex>
        <Flex
          className="pagination"
          flexDirection={{ base: 'column', lg: 'row' }}
          gap={4}
          justifyContent="flex-end"
          alignItems="flex-end"
        >
          <HStack>
            {!isMobile && <Text>Rows Per Page :</Text>}
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
              <IconButton
                variant="_outline"
                aria-label="toPrevious"
                icon={<ChevronLeftIcon fontSize={30} />}
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                isRound
              />
              <IconButton
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
                    py={2}
                    cursor="pointer"
                    px={{ base: 2, lg: 4 }}
                  >
                    <HStack
                      gap={0}
                      justifyContent={
                        header.index === 0
                          ? 'flex-start'
                          : header.column.id === 'collateral'
                          ? 'center'
                          : 'flex-end'
                      }
                    >
                      <Box width={3} mb={1}>
                        <Box hidden={header.column.getIsSorted() ? false : true}>
                          {header.column.getIsSorted() === 'desc' ? (
                            <ArrowDownIcon aria-label="sorted descending" />
                          ) : (
                            <ArrowUpIcon aria-label="sorted ascending" />
                          )}
                        </Box>
                      </Box>
                      <>{flexRender(header.column.columnDef.header, header.getContext())}</>
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
                  onClick={() => row.toggleExpanded()}
                  cursor="pointer"
                >
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <Td key={cell.id} border="none" px={{ base: 2, lg: 4 }}>
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
                      <AdditionalInfo
                        row={row}
                        rows={table.getCoreRowModel().rows}
                        comptrollerAddress={comptrollerAddress}
                        supplyBalanceFiat={supplyBalanceFiat}
                      />
                    </Td>
                  </Tr>
                )}
              </Fragment>
            ))
          ) : assets.length === 0 ? (
            <Tr>
              <Td border="none" colSpan={table.getHeaderGroups()[0].headers.length}>
                <Center py={8}>There are no assets in this pool.</Center>
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
    </Box>
  );
};
