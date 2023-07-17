import { ChevronLeftIcon, ChevronRightIcon, SettingsIcon, ViewOffIcon } from '@chakra-ui/icons';
import {
  Box,
  ButtonGroup,
  Center,
  Checkbox,
  Flex,
  Hide,
  HStack,
  IconButton,
  Input,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack
} from '@chakra-ui/react';
import type {
  ColumnDef,
  FilterFn,
  PaginationState,
  SortingFn,
  SortingState,
  VisibilityState
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
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';

import { CollateralRatioBar } from '@ui/components/pages/PoolPage/CollateralRatioBar/index';
import { AdditionalInfo } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/index';
import { BorrowApy } from '@ui/components/pages/PoolPage/MarketsList/BorrowApy';
import { BorrowBalance } from '@ui/components/pages/PoolPage/MarketsList/BorrowBalance';
import { Liquidity } from '@ui/components/pages/PoolPage/MarketsList/Liquidity';
import { SupplyApy } from '@ui/components/pages/PoolPage/MarketsList/SupplyApy';
import { SupplyBalance } from '@ui/components/pages/PoolPage/MarketsList/SupplyBalance';
import { TokenName } from '@ui/components/pages/PoolPage/MarketsList/TokenName';
import { TotalBorrow } from '@ui/components/pages/PoolPage/MarketsList/TotalBorrow';
import { TotalSupply } from '@ui/components/pages/PoolPage/MarketsList/TotalSupply';
import { UserStats } from '@ui/components/pages/PoolPage/UserStats';
import { CButton, CIconButton } from '@ui/components/shared/Button';
import { GradientButton } from '@ui/components/shared/GradientButton';
import { GradientText } from '@ui/components/shared/GradientText';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { TableHeaderCell } from '@ui/components/shared/TableHeaderCell';
import {
  ALL,
  BORROW_APY,
  BORROW_BALANCE,
  BORROWABLE,
  COLLATERAL,
  HIDDEN,
  IONIC_LOCALSTORAGE_KEYS,
  LIQUIDITY,
  MARKET_LTV,
  MARKETS_COUNT_PER_PAGE,
  PAUSED,
  PROTECTED,
  REWARDS,
  SEARCH,
  SUPPLY_APY,
  SUPPLY_BALANCE,
  TOTAL_BORROW,
  TOTAL_SUPPLY
} from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useAssetsClaimableRewards } from '@ui/hooks/rewards/useAssetClaimableRewards';
import { useAssets } from '@ui/hooks/useAssets';
import { useBorrowAPYs } from '@ui/hooks/useBorrowAPYs';
import { useColors } from '@ui/hooks/useColors';
import { useDebounce } from '@ui/hooks/useDebounce';
import type { UseRewardsData } from '@ui/hooks/useRewards';
import { useIsMobile, useIsSemiSmallScreen } from '@ui/hooks/useScreenSize';
import { useTotalSupplyAPYs } from '@ui/hooks/useTotalSupplyAPYs';
import type { MarketData, PoolData } from '@ui/types/TokensDataMap';
import { sortAssets } from '@ui/utils/sorts';

export type Market = {
  borrowApy: MarketData;
  borrowBalance: MarketData;
  liquidity: MarketData;
  market: MarketData;
  supplyApy: MarketData;
  supplyBalance: MarketData;
  totalBorrow: MarketData;
  totalSupply: MarketData;
};

export const MarketsList = ({
  poolData,
  rewards = {},
  initSorting,
  initColumnVisibility,
  initHidden
}: {
  initColumnVisibility: VisibilityState;
  initHidden: boolean;
  initSorting: SortingState;
  poolData: PoolData;
  rewards?: UseRewardsData;
}) => {
  const {
    assets,
    comptroller: comptrollerAddress,
    totalSupplyBalanceFiat: supplyBalanceFiat,
    totalBorrowBalanceFiat: borrowBalanceFiat,
    chainId: poolChainId
  } = poolData;
  const sdk = useSdk(poolChainId);
  const { address } = useMultiIonic();
  const [isHidden, setIsHidden] = useState<boolean>(initHidden);

  const { data: allClaimableRewards } = useAssetsClaimableRewards({
    assetsAddress: assets.map((asset) => asset.cToken).sort(),
    poolAddress: comptrollerAddress,
    poolChainId
  });

  const { data: assetInfos } = useAssets([poolChainId]);

  const [collateralCounts, protectedCounts, borrowableCounts, pausedCounts] = useMemo(() => {
    return [
      assets.filter((asset) => asset.membership).length,
      assets.filter((asset) => asset.isBorrowPaused && !asset.isSupplyPaused).length,
      assets.filter((asset) => !asset.isBorrowPaused).length,
      assets.filter((asset) => asset.isBorrowPaused && asset.isSupplyPaused).length
    ];
  }, [assets]);

  const { data: totalSupplyApyPerAsset } = useTotalSupplyAPYs(
    assets,
    poolChainId,
    rewards,
    assetInfos
  );
  const { data: borrowApyPerAsset } = useBorrowAPYs(assets, poolChainId);
  const [searchText, setSearchText] = useState('');

  const assetFilter: FilterFn<Market> = useCallback(
    (row, columnId, value) => {
      if (
        (!searchText ||
          (value.includes(SEARCH) &&
            (row.original.market.underlyingName.toLowerCase().includes(searchText.toLowerCase()) ||
              row.original.market.underlyingSymbol
                .toLowerCase()
                .includes(searchText.toLowerCase()) ||
              row.original.market.cToken.toLowerCase().includes(searchText.toLowerCase())))) &&
        (!value.includes(HIDDEN) ||
          (value.includes(HIDDEN) &&
            (!row.original.market.supplyBalance.isZero() ||
              !row.original.market.borrowBalance.isZero())))
      ) {
        if (
          value.includes(ALL) ||
          (value.includes(REWARDS) &&
            allClaimableRewards &&
            allClaimableRewards[row.original.market.cToken]) ||
          (value.includes(COLLATERAL) && row.original.market.membership) ||
          (value.includes(PROTECTED) &&
            row.original.market.isBorrowPaused &&
            !row.original.market.isSupplyPaused) ||
          (value.includes(BORROWABLE) && !row.original.market.isBorrowPaused) ||
          (value.includes(PAUSED) &&
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
    },
    [allClaimableRewards, searchText]
  );

  const assetSort: SortingFn<Market> = useCallback(
    (rowA, rowB, columnId) => {
      if (!sdk) return 0;

      if (columnId === MARKET_LTV) {
        return rowB.original.market.underlyingSymbol.localeCompare(
          rowA.original.market.underlyingSymbol
        );
      } else if (columnId === SUPPLY_APY) {
        const rowASupplyAPY =
          totalSupplyApyPerAsset && totalSupplyApyPerAsset[rowA.original.market.cToken]
            ? totalSupplyApyPerAsset[rowA.original.market.cToken].totalApy
            : 0;
        const rowBSupplyAPY =
          totalSupplyApyPerAsset && totalSupplyApyPerAsset[rowA.original.market.cToken]
            ? totalSupplyApyPerAsset[rowB.original.market.cToken].totalApy
            : 0;
        return rowASupplyAPY > rowBSupplyAPY ? 1 : -1;
      } else if (columnId === BORROW_APY) {
        const rowABorrowAPY =
          !rowA.original.market.isBorrowPaused && borrowApyPerAsset
            ? borrowApyPerAsset[rowA.original.market.cToken]
            : -1;
        const rowBBorrowAPY =
          !rowB.original.market.isBorrowPaused && borrowApyPerAsset
            ? borrowApyPerAsset[rowB.original.market.cToken]
            : -1;
        return rowABorrowAPY > rowBBorrowAPY ? 1 : -1;
      } else if (columnId === SUPPLY_BALANCE) {
        return rowA.original.market.supplyBalanceFiat > rowB.original.market.supplyBalanceFiat
          ? 1
          : -1;
      } else if (columnId === BORROW_BALANCE) {
        return (rowA.original.market.borrowBalance.isZero() &&
          rowA.original.market.isBorrowPaused) ||
          rowA.original.market.borrowBalanceFiat < rowB.original.market.borrowBalanceFiat
          ? -1
          : 1;
      } else if (columnId === TOTAL_SUPPLY) {
        return rowA.original.market.totalSupplyFiat > rowB.original.market.totalSupplyFiat ? 1 : -1;
      } else if (columnId === TOTAL_BORROW) {
        return (rowA.original.market.totalBorrowFiat === 0 &&
          rowA.original.market.isBorrowPaused) ||
          rowA.original.market.totalBorrowFiat < rowB.original.market.totalBorrowFiat
          ? -1
          : 1;
      } else if (columnId === LIQUIDITY) {
        const liquidityA = !rowA.original.market.isBorrowPaused
          ? rowA.original.market.liquidityFiat
          : -1;
        const liquidityB = !rowB.original.market.isBorrowPaused
          ? rowB.original.market.liquidityFiat
          : -1;
        return liquidityA > liquidityB ? 1 : -1;
      } else {
        return 0;
      }
    },
    [totalSupplyApyPerAsset, borrowApyPerAsset, sdk]
  );

  const data: Market[] = useMemo(() => {
    return sortAssets(assets).map((asset) => {
      return {
        borrowApy: asset,
        borrowBalance: asset,
        liquidity: asset,
        market: asset,
        supplyApy: asset,
        supplyBalance: asset,
        totalBorrow: asset,
        totalSupply: asset
      };
    });
  }, [assets]);

  const columns: ColumnDef<Market>[] = useMemo(() => {
    return [
      {
        accessorFn: (row) => row.market,
        cell: ({ getValue }) => (
          <TokenName
            asset={getValue<MarketData>()}
            assets={assets}
            poolAddress={comptrollerAddress}
            poolChainId={poolChainId}
          />
        ),
        enableHiding: false,
        filterFn: assetFilter,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>Market / LTV</TableHeaderCell>,
        id: MARKET_LTV,
        sortingFn: assetSort
      },
      {
        accessorFn: (row) => row.supplyApy,
        cell: ({ getValue }) => (
          <SupplyApy
            asset={getValue<MarketData>()}
            poolChainId={poolChainId}
            rewards={rewards}
            totalApy={
              totalSupplyApyPerAsset
                ? totalSupplyApyPerAsset[getValue<MarketData>().cToken]?.totalApy
                : undefined
            }
          />
        ),
        enableSorting: !!totalSupplyApyPerAsset,
        footer: (props) => props.column.id,

        header: (context) => <TableHeaderCell context={context}>Supply APY</TableHeaderCell>,
        id: SUPPLY_APY,
        sortingFn: assetSort
      },
      {
        accessorFn: (row) => row.borrowApy,
        cell: ({ getValue }) => (
          <BorrowApy asset={getValue<MarketData>()} borrowApyPerAsset={borrowApyPerAsset} />
        ),
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>Borrow APY</TableHeaderCell>,
        id: BORROW_APY,
        sortingFn: assetSort
      },
      {
        accessorFn: (row) => row.supplyBalance,
        cell: ({ getValue }) => (
          <SupplyBalance asset={getValue<MarketData>()} poolChainId={poolChainId} />
        ),
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>Supply Balance</TableHeaderCell>,

        id: SUPPLY_BALANCE,
        sortingFn: assetSort
      },
      {
        accessorFn: (row) => row.borrowBalance,
        cell: ({ getValue }) => (
          <BorrowBalance asset={getValue<MarketData>()} poolChainId={poolChainId} />
        ),
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>Borrow Balance</TableHeaderCell>,

        id: BORROW_BALANCE,
        sortingFn: assetSort
      },
      {
        accessorFn: (row) => row.totalSupply,
        cell: ({ getValue }) => (
          <TotalSupply
            asset={getValue<MarketData>()}
            comptrollerAddress={comptrollerAddress}
            poolChainId={poolChainId}
          />
        ),
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>Total Supply</TableHeaderCell>,

        id: TOTAL_SUPPLY,
        sortingFn: assetSort
      },
      {
        accessorFn: (row) => row.totalBorrow,
        cell: ({ getValue }) => (
          <TotalBorrow
            asset={getValue<MarketData>()}
            comptrollerAddress={comptrollerAddress}
            poolChainId={poolChainId}
          />
        ),
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>Total Borrow</TableHeaderCell>,

        id: TOTAL_BORROW,
        sortingFn: assetSort
      },
      {
        accessorFn: (row) => row.liquidity,
        cell: ({ getValue }) => (
          <Liquidity asset={getValue<MarketData>()} poolChainId={poolChainId} />
        ),
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>Liquidity</TableHeaderCell>,

        id: LIQUIDITY,
        sortingFn: assetSort
      }
    ];
  }, [
    rewards,
    comptrollerAddress,
    totalSupplyApyPerAsset,
    assetFilter,
    assetSort,
    assets,
    borrowApyPerAsset,
    poolChainId
  ]);

  const [sorting, setSorting] = useState<SortingState>(initSorting);
  const [pagination, onPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: MARKETS_COUNT_PER_PAGE[0]
  });
  const isSemiSmallScreen = useIsSemiSmallScreen();

  const [globalFilter, setGlobalFilter] = useState<string[]>([ALL]);
  const [columnVisibility, setColumnVisibility] = useState(initColumnVisibility);

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
    globalFilterFn: assetFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: onPagination,
    onSortingChange: setSorting,
    state: {
      columnVisibility,
      globalFilter,
      pagination,
      sorting
    }
  });

  const { cCard } = useColors();

  const onFilter = (filter: string) => {
    if (globalFilter.includes(SEARCH) && globalFilter.includes(HIDDEN)) {
      setGlobalFilter([filter, SEARCH, HIDDEN]);
    } else if (globalFilter.includes(SEARCH)) {
      setGlobalFilter([filter, SEARCH]);
    } else if (globalFilter.includes(HIDDEN)) {
      setGlobalFilter([filter, HIDDEN]);
    } else {
      setGlobalFilter([filter]);
    }
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

  useEffect(() => {
    if (isHidden) {
      setGlobalFilter([...globalFilter, HIDDEN]);
    } else {
      setGlobalFilter(globalFilter.filter((f) => f !== HIDDEN));
    }

    const oldData = localStorage.getItem(IONIC_LOCALSTORAGE_KEYS);
    let oldObj;
    if (oldData) {
      oldObj = JSON.parse(oldData);
    }

    const data = { ...oldObj, isHidden };
    localStorage.setItem(IONIC_LOCALSTORAGE_KEYS, JSON.stringify(data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHidden]);

  useEffect(() => {
    const oldData = localStorage.getItem(IONIC_LOCALSTORAGE_KEYS);
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
    const data = { ...oldObj, marketColumnVisibility: arr, marketSorting: sorting };
    localStorage.setItem(IONIC_LOCALSTORAGE_KEYS, JSON.stringify(data));
  }, [sorting, columnVisibility]);

  return (
    <Box>
      {address ? (
        <>
          {/* Supply & Borrow Balance */}
          <Flex
            flexDirection="row"
            flexWrap="wrap"
            gap={4}
            justifyContent={['center', 'center', 'flex-start']}
            mt={4}
            mx={4}
          >
            <UserStats poolData={poolData} />
          </Flex>
          {/* Borrow Limit */}
          <Flex mt={4} mx={4}>
            <CollateralRatioBar
              assets={assets}
              borrowFiat={borrowBalanceFiat}
              poolChainId={poolChainId}
            />
          </Flex>
        </>
      ) : null}

      {/* Table Filter and Search */}
      <Flex
        alignItems={'center'}
        flexDirection={'row'}
        flexWrap="wrap-reverse"
        gap={4}
        justifyContent={['center', 'center', 'space-between']}
        p={4}
      >
        <ButtonGroup
          flexFlow={'row wrap'}
          gap={isSemiSmallScreen ? 2 : 0}
          isAttached={!isSemiSmallScreen ? true : false}
          justifyContent="flex-start"
          spacing={0}
        >
          <CButton
            disabled={data.length === 0}
            isSelected={globalFilter.includes(ALL)}
            onClick={() => onFilter(ALL)}
            p={0}
            variant="filter"
            width="80px"
          >
            <Center fontWeight="bold" height="100%" width="100%">{`All (${data.length})`}</Center>
          </CButton>
          {allClaimableRewards && Object.keys(allClaimableRewards).length !== 0 && (
            <GradientButton
              borderWidth={globalFilter.includes(REWARDS) ? 0 : 2}
              height="52px"
              isSelected={globalFilter.includes(REWARDS)}
              mr="-px"
              onClick={() => onFilter(REWARDS)}
              width="115px"
            >
              <Center fontWeight="bold" height="100%" pt="2px" width="100%">
                <GradientText color={cCard.bgColor} isEnabled={!globalFilter.includes(REWARDS)}>
                  {`Rewards (${
                    (allClaimableRewards && Object.keys(allClaimableRewards).length) || 0
                  })`}
                </GradientText>
              </Center>
            </GradientButton>
          )}
          {collateralCounts !== 0 && (
            <CButton
              color="cyan"
              isSelected={globalFilter.includes(COLLATERAL)}
              onClick={() => onFilter(COLLATERAL)}
              p={0}
              variant="filter"
              width="125px"
            >
              <Center fontWeight="bold" height="100%" width="100%">
                {`Collateral (${collateralCounts})`}
              </Center>
            </CButton>
          )}
          {borrowableCounts !== 0 && (
            <CButton
              color="orange"
              isSelected={globalFilter.includes(BORROWABLE)}
              onClick={() => onFilter(BORROWABLE)}
              p={0}
              variant="filter"
              width="135px"
            >
              <Center fontWeight="bold" height="100%" width="100%">
                {`Borrowable (${borrowableCounts})`}
              </Center>
            </CButton>
          )}
          {protectedCounts !== 0 && (
            <CButton
              color="purple"
              isSelected={globalFilter.includes(PROTECTED)}
              onClick={() => onFilter(PROTECTED)}
              p={0}
              variant="filter"
              width="125px"
            >
              <Center fontWeight="bold" height="100%" width="100%">
                {`Protected (${protectedCounts})`}
              </Center>
            </CButton>
          )}
          {pausedCounts !== 0 && (
            <CButton
              color="gray"
              isSelected={globalFilter.includes(PAUSED)}
              onClick={() => onFilter(PAUSED)}
              p={0}
              variant="filter"
              width="140px"
            >
              <Center fontWeight="bold" height="100%" whiteSpace="nowrap" width="100%">
                {`Paused (${pausedCounts})`}
              </Center>
            </CButton>
          )}
        </ButtonGroup>

        <Flex alignItems="flex-end" className="searchAsset" gap={2} justifyContent="flex-start">
          <ControlledSearchInput onUpdate={(searchText) => setSearchText(searchText)} />
          <PopoverTooltip
            body={
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
                        isChecked={column.getIsVisible()}
                        key={column.id}
                        onChange={column.getToggleVisibilityHandler()}
                      >
                        {column.id}
                      </Checkbox>
                    );
                  }
                })}
              </VStack>
            }
            contentProps={{ width: '200px' }}
          >
            <IconButton
              aria-label="Column Settings"
              icon={<SettingsIcon fontSize={20} />}
              maxWidth={10}
              variant="_outline"
            />
          </PopoverTooltip>

          {address ? (
            <SimpleTooltip
              label="Hide markets you don't supply or borrow from"
              my={3}
              placement="top-end"
            >
              <span>
                <CIconButton
                  alignSelf="flex-end"
                  aria-label="detail View"
                  icon={<ViewOffIcon fontSize={20} />}
                  isSelected={isHidden}
                  onClick={() => {
                    setIsHidden(!isHidden);
                  }}
                  variant="filter"
                />
              </span>
            </SimpleTooltip>
          ) : null}
        </Flex>
      </Flex>

      {/* Market Table */}
      <Table>
        <Thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Tr
              borderBottomWidth={1}
              borderColor={cCard.dividerColor}
              borderTopWidth={2}
              key={headerGroup.id}
            >
              {headerGroup.headers.map((header) => {
                return (
                  <Th
                    border="none"
                    color={cCard.txtColor}
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    pl={header.column.id === MARKET_LTV ? '70px' : { base: 1, lg: 2 }}
                    pr={{ base: 1, lg: 2 }}
                    py={4}
                    textTransform="capitalize"
                  >
                    <HStack
                      justifyContent={header.column.id === MARKET_LTV ? 'flex-start' : 'flex-end'}
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
                  className={row.original.market.underlyingSymbol}
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
                        borrowBalanceFiat={borrowBalanceFiat}
                        comptrollerAddress={comptrollerAddress}
                        poolChainId={poolChainId}
                        row={row}
                        rows={table.getCoreRowModel().rows}
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

      {/* Pagination Elements */}
      <Flex alignItems="center" className="pagination" gap={4} justifyContent="flex-end" p={4}>
        <HStack>
          <Hide below="lg">
            <Text>Markets Per Page</Text>
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
    <HStack width="100%">
      {!isMobile && <Text>Search</Text>}
      <Input
        _focusVisible={{}}
        maxWidth={{ base: '100%', lg: 60, md: 60, sm: 290 }}
        onChange={onSearch}
        placeholder="Token, Name"
        type="text"
        value={searchText}
      />
    </HStack>
  );
};
