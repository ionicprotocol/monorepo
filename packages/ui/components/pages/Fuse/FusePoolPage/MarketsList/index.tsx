import { ArrowDownIcon, ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  HStack,
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
import { CIconButton } from '@ui/components/shared/Button';
import { GlowingBox } from '@ui/components/shared/GlowingBox';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import {
  BORROWABLE,
  COLLATERAL,
  DEPRECATED,
  DOWN_LIMIT,
  MARKETS_COUNT_PER_PAGE,
  PROTECTED,
  REWARDS,
  SEARCH,
  UP_LIMIT,
} from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useAssetsClaimableRewards } from '@ui/hooks/rewards/useAssetClaimableRewards';
import { useColors } from '@ui/hooks/useColors';
import { useDebounce } from '@ui/hooks/useDebounce';
import { useIsMobile } from '@ui/hooks/useScreenSize';
import { MarketData } from '@ui/types/TokensDataMap';
import { smallUsdFormatter } from '@ui/utils/bigUtils';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';
import { sortAssets } from '@ui/utils/sorts';

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
  poolChainId,
}: {
  assets: MarketData[];
  rewards?: FlywheelMarketRewardsInfo[];
  comptrollerAddress: string;
  supplyBalanceFiat: number;
  borrowBalanceFiat: number;
  poolChainId: number;
}) => {
  const { currentSdk, currentChain } = useMultiMidas();

  const { data: allClaimableRewards } = useAssetsClaimableRewards({
    poolAddress: comptrollerAddress,
    assetsAddress: assets.map((asset) => asset.cToken),
  });

  const [collateralCounts, protectedCounts, borrowableCounts, deprecatedCounts] = useMemo(() => {
    const availableAssets = assets.filter(
      (asset) => !asset.isSupplyPaused || (asset.isSupplyPaused && asset.supplyBalanceFiat !== 0)
    );
    return [
      availableAssets.filter((asset) => asset.membership).length,
      availableAssets.filter((asset) => asset.isBorrowPaused && !asset.isSupplyPaused).length,
      availableAssets.filter((asset) => !asset.isBorrowPaused).length,
      availableAssets.filter((asset) => asset.isBorrowPaused && asset.isSupplyPaused).length,
    ];
  }, [assets]);

  const assetFilter: FilterFn<Market> = (row, columnId, value) => {
    if (
      !searchText ||
      (value.includes(SEARCH) &&
        (row.original.market.underlyingName.toLowerCase().includes(searchText.toLowerCase()) ||
          row.original.market.underlyingSymbol.toLowerCase().includes(searchText.toLowerCase()) ||
          row.original.market.cToken.toLowerCase().includes(searchText.toLowerCase())))
    ) {
      if (
        (value.includes(REWARDS) &&
          allClaimableRewards &&
          allClaimableRewards[row.original.market.cToken]) ||
        (value.includes(COLLATERAL) && row.original.market.membership) ||
        (value.includes(PROTECTED) &&
          row.original.market.isBorrowPaused &&
          !row.original.market.isSupplyPaused) ||
        (value.includes(BORROWABLE) && !row.original.market.isBorrowPaused) ||
        (value.includes(DEPRECATED) &&
          row.original.market.isBorrowPaused &&
          row.original.market.isSupplyPaused)
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  const assetSort: SortingFn<Market> = (rowA, rowB, columnId) => {
    if (!currentSdk || !currentChain) return 0;

    if (columnId === 'market') {
      return rowB.original.market.underlyingSymbol.localeCompare(
        rowA.original.market.underlyingSymbol
      );
    } else if (columnId === 'supplyApy') {
      const rowASupplyAPY = currentSdk.ratePerBlockToAPY(
        rowA.original.market.supplyRatePerBlock,
        getBlockTimePerMinuteByChainId(currentChain.id)
      );
      const rowBSupplyAPY = currentSdk.ratePerBlockToAPY(
        rowB.original.market.supplyRatePerBlock,
        getBlockTimePerMinuteByChainId(currentChain.id)
      );
      return rowASupplyAPY > rowBSupplyAPY ? 1 : -1;
    } else if (columnId === 'borrowApy') {
      const rowABorrowAPY = currentSdk.ratePerBlockToAPY(
        rowA.original.market.borrowRatePerBlock,
        getBlockTimePerMinuteByChainId(currentChain.id)
      );
      const rowBBorrowAPY = currentSdk.ratePerBlockToAPY(
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
    const availableAssets = assets.filter(
      (asset) => !asset.isSupplyPaused || (asset.isSupplyPaused && asset.supplyBalanceFiat !== 0)
    );
    return sortAssets(availableAssets).map((asset) => {
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
        header: () => (
          <Text variant="smText" fontWeight="bold" py={2}>
            Market / LTV
          </Text>
        ),
        cell: ({ getValue }) => (
          <TokenName
            asset={getValue<MarketData>()}
            poolAddress={comptrollerAddress}
            poolChainId={poolChainId}
          />
        ),
        footer: (props) => props.column.id,
        filterFn: assetFilter,
        sortingFn: assetSort,
      },
      {
        accessorFn: (row) => row.supplyApy,
        id: 'supplyApy',
        cell: ({ getValue }) => (
          <SupplyApy asset={getValue<MarketData>()} rewards={rewards} poolChainId={poolChainId} />
        ),
        header: () => (
          <Box py={2} textAlign="end" alignItems="end">
            <Text variant="smText" fontWeight="bold" lineHeight={5}>
              Supply APY
            </Text>
          </Box>
        ),
        footer: (props) => props.column.id,
        sortingFn: assetSort,
      },
      {
        accessorFn: (row) => row.borrowApy,
        id: 'borrowApy',
        cell: ({ getValue }) => (
          <BorrowApy asset={getValue<MarketData>()} poolChainId={poolChainId} />
        ),
        header: () => (
          <Box py={2} textAlign="end" alignItems="end">
            <Text variant="smText" fontWeight="bold" lineHeight={5}>
              Borrow APY
            </Text>
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
          <VStack py={2} textAlign="end" alignItems="end" spacing={0}>
            <Text variant="smText" fontWeight="bold" lineHeight={5}>
              Supply
            </Text>
            <Text variant="smText" fontWeight="bold" lineHeight={5}>
              Balance
            </Text>
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
        sortingFn: assetSort,
      },
      {
        accessorFn: (row) => row.liquidity,
        id: 'liquidity',
        cell: ({ getValue }) => <Liquidity asset={getValue<MarketData>()} />,
        header: () => (
          <Text textAlign="end" py={2} variant="smText" fontWeight="bold">
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
          <Collateral
            asset={getValue<MarketData>()}
            comptrollerAddress={comptrollerAddress}
            poolChainId={poolChainId}
          />
        ),
        header: () => (
          <Text py={2} variant="smText" fontWeight="bold">
            Collateral
          </Text>
        ),
        footer: (props) => props.column.id,
        sortingFn: assetSort,
        // enableSorting: false,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rewards, comptrollerAddress]);

  const [sorting, setSorting] = useState<SortingState>([{ id: 'market', desc: true }]);
  const [pagination, onPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: MARKETS_COUNT_PER_PAGE[0],
  });
  const isMobile = useIsMobile();

  const [isCollateralFiltered, setIsCollateralFiltered] = useState<boolean>(true);
  const [isRewardsFiltered, setIsRewardsFiltered] = useState<boolean>(true);
  const [isProtectedFiltered, setIsProtectedFiltered] = useState<boolean>(true);
  const [isDeprecatedFiltered, setIsDeprecatedFiltered] = useState<boolean>(true);
  const [isBorrowableFiltered, setIsBorrowableFiltered] = useState<boolean>(true);
  const [globalFilter, setGlobalFilter] = useState<string[]>([
    REWARDS,
    COLLATERAL,
    PROTECTED,
    BORROWABLE,
    DEPRECATED,
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

  const onDeprecatedFiltered = () => {
    if (!isDeprecatedFiltered) {
      setGlobalFilter([...globalFilter, DEPRECATED]);
    } else {
      setGlobalFilter(globalFilter.filter((f) => f !== DEPRECATED));
    }

    setIsDeprecatedFiltered(!isDeprecatedFiltered);
  };

  const onBorrowableFiltered = () => {
    if (!isBorrowableFiltered) {
      setGlobalFilter([...globalFilter, BORROWABLE]);
    } else {
      setGlobalFilter(globalFilter.filter((f) => f !== BORROWABLE));
    }

    setIsBorrowableFiltered(!isBorrowableFiltered);
  };

  const onSearchFiltered = () => {
    if (searchText) {
      setGlobalFilter([...globalFilter, SEARCH]);
    } else {
      setGlobalFilter(globalFilter.filter((f) => f !== SEARCH));
    }
  };

  useEffect(() => {
    onSearchFiltered();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  return (
    <Box>
      <Flex
        px="4"
        mt={6}
        justifyContent="space-between"
        flexDirection={{ base: 'column', sm: 'row' }}
        gap={4}
      >
        <Flex flexDirection={{ base: 'column', lg: 'row' }} gap={{ base: 4, lg: 8 }}>
          <HStack>
            <Text variant="mdText" width="max-content">
              Your Supply Balance :
            </Text>
            <SimpleTooltip
              label={supplyBalanceFiat.toString()}
              isDisabled={supplyBalanceFiat === DOWN_LIMIT || supplyBalanceFiat > UP_LIMIT}
            >
              <Text variant="lgText" fontWeight="bold">
                {smallUsdFormatter(supplyBalanceFiat)}
                {supplyBalanceFiat > DOWN_LIMIT && supplyBalanceFiat < UP_LIMIT && '+'}
              </Text>
            </SimpleTooltip>
          </HStack>
          <HStack>
            <Text variant="mdText" width="max-content">
              Your Borrow Balance :
            </Text>
            <SimpleTooltip
              label={borrowBalanceFiat.toString()}
              isDisabled={borrowBalanceFiat === DOWN_LIMIT || borrowBalanceFiat > UP_LIMIT}
            >
              <Text variant="lgText" fontWeight="bold">
                {smallUsdFormatter(borrowBalanceFiat)}
                {borrowBalanceFiat > DOWN_LIMIT && borrowBalanceFiat < UP_LIMIT && '+'}
              </Text>
            </SimpleTooltip>
          </HStack>
        </Flex>
      </Flex>
      <Flex
        justifyContent="space-between"
        px="4"
        py="8"
        flexDirection={{ base: 'column', sm: 'row' }}
        gap={4}
      >
        <Flex className="pagination" flexDirection={{ base: 'column', lg: 'row' }} gap={4}>
          <Text paddingTop="2px" variant="title">
            Assets
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
            <PopoverTooltip
              body={
                <VStack alignItems="flex-start">
                  <Text variant="mdText" fontWeight="bold">
                    Rewards Asset
                  </Text>
                  <Text variant="smText">Assets that have rewards.</Text>
                  <Text variant="smText">Click to filter</Text>
                </VStack>
              }
            >
              <Button
                variant="ghost"
                onClick={onRewardsFiltered}
                p={0}
                width="140px"
                disabled={!allClaimableRewards || Object.keys(allClaimableRewards).length === 0}
              >
                {isRewardsFiltered ? (
                  <GlowingBox height="100%" width="100%">
                    <Center width="100%" height="100%" borderRadius="xl" pt="2px">
                      {`${
                        (allClaimableRewards && Object.keys(allClaimableRewards).length) || 0
                      } Rewards`}
                    </Center>
                  </GlowingBox>
                ) : (
                  <Center width="100%" height="100%" fontWeight="bold" borderRadius="xl" pt="2px">
                    {`${
                      (allClaimableRewards && Object.keys(allClaimableRewards).length) || 0
                    } Rewards`}
                  </Center>
                )}
              </Button>
            </PopoverTooltip>
            <PopoverTooltip
              body={
                <VStack alignItems="flex-start">
                  <Text fontSize={18} fontWeight="bold">
                    Collateral Asset
                  </Text>
                  <Text>Assets that can be deposited as collateral to borrow other assets.</Text>
                  <Text>Click to filter</Text>
                </VStack>
              }
            >
              <Button
                variant={isCollateralFiltered ? 'outline' : 'ghost'}
                colorScheme="cyan"
                onClick={onCollateralFiltered}
                width="140px"
                disabled={collateralCounts === 0}
              >
                <Center fontWeight="bold" pt="2px">{`${collateralCounts} Collateral`}</Center>
              </Button>
            </PopoverTooltip>
            <PopoverTooltip
              body={
                <VStack alignItems="flex-start">
                  <Text fontSize={18} fontWeight="bold">
                    Borrowable Asset
                  </Text>
                  <Text>Assets that can be borrowed.</Text>
                  <Text>Click to filter</Text>
                </VStack>
              }
            >
              <Button
                variant={isBorrowableFiltered ? 'outline' : 'ghost'}
                colorScheme="orange"
                onClick={onBorrowableFiltered}
                width="140px"
                disabled={borrowableCounts === 0}
                pt="2px"
              >
                <Center fontWeight="bold">{`${borrowableCounts} Borrowable`}</Center>
              </Button>
            </PopoverTooltip>
            <PopoverTooltip
              body={
                <VStack alignItems="flex-start">
                  <Text fontSize={18} fontWeight="bold">
                    Protected Asset
                  </Text>
                  <Text>Assets that cannot be borrowed.</Text>
                  <Text>Click to filter</Text>
                </VStack>
              }
            >
              <Button
                variant={isProtectedFiltered ? 'outline' : 'ghost'}
                colorScheme="purple"
                onClick={onProtectedFiltered}
                width="140px"
                disabled={protectedCounts === 0}
              >
                <Center fontWeight="bold" pt="2px">{`${protectedCounts} Protected`}</Center>
              </Button>
            </PopoverTooltip>
            {deprecatedCounts !== 0 && (
              <PopoverTooltip
                body={
                  <VStack alignItems="flex-start">
                    <Text fontSize={18} fontWeight="bold">
                      Deprecated Asset
                    </Text>
                    <Text>Assets that cannot be supplied and borrowed.</Text>
                    <Text>Click to filter</Text>
                  </VStack>
                }
              >
                <Button
                  variant={isDeprecatedFiltered ? 'outline' : 'ghost'}
                  colorScheme="grey"
                  onClick={onDeprecatedFiltered}
                  width="140px"
                >
                  <Center fontWeight="bold" pt="2px">{`${deprecatedCounts} Deprecated`}</Center>
                </Button>
              </PopoverTooltip>
            )}
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
                  borderBottomWidth={row.getIsExpanded() ? 0 : 1}
                  background={row.getIsExpanded() ? cCard.hoverBgColor : cCard.bgColor}
                  _hover={{ bg: cCard.hoverBgColor }}
                  onClick={() => row.toggleExpanded()}
                  cursor="pointer"
                >
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <Td key={cell.id} border="none" px={{ base: 2, lg: 4 }} py={2}>
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
                        poolChainId={poolChainId}
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
      <Flex
        className="pagination"
        flexDirection={{ base: 'column', lg: 'row' }}
        gap={4}
        justifyContent="flex-end"
        alignItems="flex-end"
        p={4}
      >
        <HStack>
          {!isMobile && <Text variant="smText">Markets Per Page :</Text>}
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
    </Box>
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
        placeholder="token or symbol"
        maxWidth={60}
        _focusVisible={{}}
      />
    </HStack>
  );
};
