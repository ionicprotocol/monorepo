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
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
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
  VisibilityState,
} from '@tanstack/react-table';
import * as React from 'react';
import { Fragment, useEffect, useMemo, useState } from 'react';

import { CollateralRatioBar } from '../CollateralRatioBar';

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
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { TableHeaderCell } from '@ui/components/shared/TableHeaderCell';
import {
  ALL,
  BORROW_APY,
  BORROW_BALANCE,
  BORROWABLE,
  COLLATERAL,
  HIDDEN,
  LIQUIDITY,
  MARKET_LTV,
  MARKETS_COUNT_PER_PAGE,
  MIDAS_LOCALSTORAGE_KEYS,
  PAUSED,
  PROTECTED,
  REWARDS,
  SEARCH,
  SUPPLY_APY,
  SUPPLY_BALANCE,
  TOTAL_BORROW,
  TOTAL_SUPPLY,
} from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useAssetsClaimableRewards } from '@ui/hooks/rewards/useAssetClaimableRewards';
import { useAssets } from '@ui/hooks/useAssets';
import { useColors } from '@ui/hooks/useColors';
import { useDebounce } from '@ui/hooks/useDebounce';
import { UseRewardsData } from '@ui/hooks/useRewards';
import { useIsMobile, useIsSemiSmallScreen } from '@ui/hooks/useScreenSize';
import { useBorrowApyPerAsset, useTotalSupplyApyPerAsset } from '@ui/hooks/useTotalApy';
import { MarketData, PoolData } from '@ui/types/TokensDataMap';
import { sortAssets } from '@ui/utils/sorts';

export type Market = {
  market: MarketData;
  supplyApy: MarketData;
  supplyBalance: MarketData;
  borrowApy: MarketData;
  borrowBalance: MarketData;
  totalSupply: MarketData;
  totalBorrow: MarketData;
  liquidity: MarketData;
};

export const MarketsList = ({
  poolData,
  rewards = {},
  initSorting,
  initColumnVisibility,
  initHidden,
}: {
  poolData: PoolData;
  rewards?: UseRewardsData;
  initSorting: SortingState;
  initColumnVisibility: VisibilityState;
  initHidden: boolean;
}) => {
  const {
    assets,
    comptroller: comptrollerAddress,
    totalSupplyBalanceFiat: supplyBalanceFiat,
    totalBorrowBalanceFiat: borrowBalanceFiat,
    chainId: poolChainId,
  } = poolData;
  const sdk = useSdk(poolChainId);
  const { address } = useMultiMidas();
  const [isHidden, setIsHidden] = useState<boolean>(initHidden);

  const { data: allClaimableRewards } = useAssetsClaimableRewards({
    poolAddress: comptrollerAddress,
    assetsAddress: assets.map((asset) => asset.cToken),
  });

  const { data: assetInfos } = useAssets(poolChainId);

  const [collateralCounts, protectedCounts, borrowableCounts, pausedCounts] = useMemo(() => {
    return [
      assets.filter((asset) => asset.membership).length,
      assets.filter((asset) => asset.isBorrowPaused && !asset.isSupplyPaused).length,
      assets.filter((asset) => !asset.isBorrowPaused).length,
      assets.filter((asset) => asset.isBorrowPaused && asset.isSupplyPaused).length,
    ];
  }, [assets]);

  const { data: totalSupplyApyPerAsset } = useTotalSupplyApyPerAsset(
    assets,
    poolChainId,
    rewards,
    assetInfos
  );
  const { data: borrowApyPerAsset } = useBorrowApyPerAsset(assets, poolChainId);

  const assetFilter: FilterFn<Market> = (row, columnId, value) => {
    if (
      (!searchText ||
        (value.includes(SEARCH) &&
          (row.original.market.underlyingName.toLowerCase().includes(searchText.toLowerCase()) ||
            row.original.market.underlyingSymbol.toLowerCase().includes(searchText.toLowerCase()) ||
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
  };

  const assetSort: SortingFn<Market> = React.useCallback(
    (rowA, rowB, columnId) => {
      if (!sdk) return 0;

      if (columnId === MARKET_LTV) {
        return rowB.original.market.underlyingSymbol.localeCompare(
          rowA.original.market.underlyingSymbol
        );
      } else if (columnId === SUPPLY_APY) {
        const rowASupplyAPY = totalSupplyApyPerAsset
          ? totalSupplyApyPerAsset[rowA.original.market.cToken]
          : 0;
        const rowBSupplyAPY = totalSupplyApyPerAsset
          ? totalSupplyApyPerAsset[rowB.original.market.cToken]
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
        return rowA.original.market.borrowBalanceFiat > rowB.original.market.borrowBalanceFiat
          ? 1
          : -1;
      } else if (columnId === TOTAL_SUPPLY) {
        return rowA.original.market.totalSupplyFiat > rowB.original.market.totalSupplyFiat ? 1 : -1;
      } else if (columnId === TOTAL_BORROW) {
        return rowA.original.market.totalBorrowFiat > rowB.original.market.totalBorrowFiat ? 1 : -1;
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
        market: asset,
        supplyApy: asset,
        supplyBalance: asset,
        borrowApy: asset,
        borrowBalance: asset,
        totalSupply: asset,
        totalBorrow: asset,
        liquidity: asset,
      };
    });
  }, [assets]);

  const columns: ColumnDef<Market>[] = useMemo(() => {
    return [
      {
        accessorFn: (row) => row.market,
        id: MARKET_LTV,
        header: (context) => <TableHeaderCell context={context}>Market / LTV</TableHeaderCell>,
        cell: ({ getValue }) => (
          <TokenName
            asset={getValue<MarketData>()}
            assets={assets}
            poolAddress={comptrollerAddress}
            poolChainId={poolChainId}
          />
        ),
        footer: (props) => props.column.id,
        filterFn: assetFilter,
        sortingFn: assetSort,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.supplyApy,
        id: SUPPLY_APY,
        cell: ({ getValue }) => (
          <SupplyApy asset={getValue<MarketData>()} rewards={rewards} poolChainId={poolChainId} />
        ),
        header: (context) => <TableHeaderCell context={context}>Supply APY</TableHeaderCell>,

        footer: (props) => props.column.id,
        sortingFn: assetSort,
        enableSorting: !!totalSupplyApyPerAsset,
      },
      {
        accessorFn: (row) => row.borrowApy,
        id: BORROW_APY,
        cell: ({ getValue }) => (
          <BorrowApy asset={getValue<MarketData>()} borrowApyPerAsset={borrowApyPerAsset} />
        ),
        header: (context) => <TableHeaderCell context={context}>Borrow APY</TableHeaderCell>,
        footer: (props) => props.column.id,
        sortingFn: assetSort,
      },
      {
        accessorFn: (row) => row.supplyBalance,
        id: SUPPLY_BALANCE,
        cell: ({ getValue }) => (
          <SupplyBalance asset={getValue<MarketData>()} poolChainId={poolChainId} />
        ),
        header: (context) => <TableHeaderCell context={context}>Supply Balance</TableHeaderCell>,

        footer: (props) => props.column.id,
        sortingFn: assetSort,
      },
      {
        accessorFn: (row) => row.borrowBalance,
        id: BORROW_BALANCE,
        cell: ({ getValue }) => (
          <BorrowBalance asset={getValue<MarketData>()} poolChainId={poolChainId} />
        ),
        header: (context) => <TableHeaderCell context={context}>Borrow Balance</TableHeaderCell>,

        footer: (props) => props.column.id,
        sortingFn: assetSort,
      },
      {
        accessorFn: (row) => row.totalSupply,
        id: TOTAL_SUPPLY,
        cell: ({ getValue }) => (
          <TotalSupply
            asset={getValue<MarketData>()}
            comptrollerAddress={comptrollerAddress}
            poolChainId={poolChainId}
          />
        ),
        header: (context) => <TableHeaderCell context={context}>Total Supply</TableHeaderCell>,

        footer: (props) => props.column.id,
        sortingFn: assetSort,
      },
      {
        accessorFn: (row) => row.totalBorrow,
        id: TOTAL_BORROW,
        cell: ({ getValue }) => (
          <TotalBorrow asset={getValue<MarketData>()} poolChainId={poolChainId} />
        ),
        header: (context) => <TableHeaderCell context={context}>Total Borrow</TableHeaderCell>,

        footer: (props) => props.column.id,
        sortingFn: assetSort,
      },
      {
        accessorFn: (row) => row.liquidity,
        id: LIQUIDITY,
        cell: ({ getValue }) => (
          <Liquidity asset={getValue<MarketData>()} poolChainId={poolChainId} />
        ),
        header: (context) => <TableHeaderCell context={context}>Liquidity</TableHeaderCell>,

        footer: (props) => props.column.id,
        sortingFn: assetSort,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rewards, comptrollerAddress, totalSupplyApyPerAsset, assets, borrowApyPerAsset, poolChainId]);

  const [sorting, setSorting] = useState<SortingState>(initSorting);
  const [pagination, onPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: MARKETS_COUNT_PER_PAGE[0],
  });
  const isSemiSmallScreen = useIsSemiSmallScreen();

  const [globalFilter, setGlobalFilter] = useState<string[]>([ALL]);
  const [columnVisibility, setColumnVisibility] = useState(initColumnVisibility);
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

    const oldData = localStorage.getItem(MIDAS_LOCALSTORAGE_KEYS);
    let oldObj;
    if (oldData) {
      oldObj = JSON.parse(oldData);
    }

    const data = { ...oldObj, isHidden };
    localStorage.setItem(MIDAS_LOCALSTORAGE_KEYS, JSON.stringify(data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHidden]);

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
    const data = { ...oldObj, marketSorting: sorting, marketColumnVisibility: arr };
    localStorage.setItem(MIDAS_LOCALSTORAGE_KEYS, JSON.stringify(data));
  }, [sorting, columnVisibility]);

  return (
    <Box>
      {address ? (
        <>
          {/* Supply & Borrow Balance */}
          <Flex
            mx={4}
            mt={4}
            gap={4}
            flexDirection="row"
            flexWrap="wrap"
            justifyContent={['center', 'center', 'flex-start']}
          >
            <UserStats poolData={poolData} />
          </Flex>
          {/* Borrow Limit */}
          <Flex mx={4} mt={4}>
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
        justifyContent={['center', 'center', 'space-between']}
        p={4}
        alignItems={'center'}
        flexDirection={'row'}
        flexWrap="wrap-reverse"
        gap={4}
      >
        <ButtonGroup
          isAttached={!isSemiSmallScreen ? true : false}
          gap={isSemiSmallScreen ? 2 : 0}
          spacing={0}
          flexFlow={'row wrap'}
          justifyContent="flex-start"
        >
          <CButton
            isSelected={globalFilter.includes(ALL)}
            onClick={() => onFilter(ALL)}
            disabled={data.length === 0}
            variant="filter"
            width="80px"
            p={0}
          >
            <Center width="100%" height="100%" fontWeight="bold">{`${data.length} All`}</Center>
          </CButton>
          {allClaimableRewards && Object.keys(allClaimableRewards).length !== 0 && (
            <GradientButton
              isSelected={globalFilter.includes(REWARDS)}
              onClick={() => onFilter(REWARDS)}
              borderWidth={globalFilter.includes(REWARDS) ? 0 : 2}
              mr="-px"
              width="115px"
              height="52px"
            >
              <Center width="100%" height="100%" fontWeight="bold" pt="2px">
                <GradientText isEnabled={!globalFilter.includes(REWARDS)} color={cCard.bgColor}>
                  {`${
                    (allClaimableRewards && Object.keys(allClaimableRewards).length) || 0
                  } Rewards`}
                </GradientText>
              </Center>
            </GradientButton>
          )}
          {collateralCounts !== 0 && (
            <CButton
              isSelected={globalFilter.includes(COLLATERAL)}
              variant="filter"
              color="cyan"
              onClick={() => onFilter(COLLATERAL)}
              width="125px"
              p={0}
            >
              <Center width="100%" height="100%" fontWeight="bold">
                {`${collateralCounts} Collateral`}
              </Center>
            </CButton>
          )}
          {borrowableCounts !== 0 && (
            <CButton
              isSelected={globalFilter.includes(BORROWABLE)}
              variant="filter"
              color="orange"
              onClick={() => onFilter(BORROWABLE)}
              width="135px"
              p={0}
            >
              <Center width="100%" height="100%" fontWeight="bold">
                {`${borrowableCounts} Borrowable`}
              </Center>
            </CButton>
          )}
          {protectedCounts !== 0 && (
            <CButton
              isSelected={globalFilter.includes(PROTECTED)}
              variant="filter"
              color="purple"
              onClick={() => onFilter(PROTECTED)}
              width="125px"
              p={0}
            >
              <Center fontWeight="bold" width="100%" height="100%">
                {`${protectedCounts} Protected`}
              </Center>
            </CButton>
          )}
          {pausedCounts !== 0 && (
            <CButton
              isSelected={globalFilter.includes(PAUSED)}
              variant="filter"
              color="gray"
              onClick={() => onFilter(PAUSED)}
              width="140px"
              p={0}
            >
              <Center fontWeight="bold" width="100%" height="100%" whiteSpace="nowrap">
                {`${pausedCounts} Paused`}
              </Center>
            </CButton>
          )}
        </ButtonGroup>

        <Flex className="searchAsset" justifyContent="flex-start" alignItems="flex-end" gap={2}>
          <ControlledSearchInput onUpdate={(searchText) => setSearchText(searchText)} />
          <Popover placement="bottom-end">
            <PopoverTrigger>
              <IconButton
                variant="_outline"
                icon={<SettingsIcon fontSize={20} />}
                aria-label="Column Settings"
                maxWidth={10}
              />
            </PopoverTrigger>
            <PopoverContent width="200px">
              <PopoverBody>
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
                          key={column.id}
                          isChecked={column.getIsVisible()}
                          onChange={column.getToggleVisibilityHandler()}
                        >
                          {column.id}
                        </Checkbox>
                      );
                    }
                  })}
                </VStack>
              </PopoverBody>
            </PopoverContent>
          </Popover>
          {address ? (
            <SimpleTooltip
              width={200}
              label="Hide markets you don't supply or borrow from"
              my={3}
              placement="top-end"
            >
              <span>
                <CIconButton
                  aria-label="detail View"
                  alignSelf="flex-end"
                  variant="filter"
                  isSelected={isHidden}
                  onClick={() => {
                    setIsHidden(!isHidden);
                  }}
                  icon={<ViewOffIcon fontSize={20} />}
                  // disabled={!canExpand ? true : false}
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
                    py={4}
                    px={{ base: 1, lg: 2 }}
                  >
                    <HStack
                      justifyContent={header.column.id === MARKET_LTV ? 'center' : 'flex-end'}
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
                  key={row.id}
                  className={row.original.market.underlyingSymbol}
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
                    borderBottomWidth={1}
                    borderTopWidth={1}
                    borderTopStyle="dashed"
                    borderBottomStyle="solid"
                    background={row.getIsExpanded() ? cCard.hoverBgColor : cCard.bgColor}
                  >
                    {/* 2nd row is a custom 1 cell row */}
                    <Td border="none" colSpan={row.getVisibleCells().length}>
                      <AdditionalInfo
                        row={row}
                        rows={table.getCoreRowModel().rows}
                        comptrollerAddress={comptrollerAddress}
                        supplyBalanceFiat={supplyBalanceFiat}
                        borrowBalanceFiat={borrowBalanceFiat}
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

      {/* Pagination Elements */}
      <Flex className="pagination" gap={4} justifyContent="flex-end" alignItems="center" p={4}>
        <HStack>
          <Hide below="lg">
            <Text>Markets Per Page</Text>
          </Hide>
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
            <CIconButton
              variant="_outline"
              aria-label="toPrevious"
              icon={<ChevronLeftIcon fontSize={30} />}
              onClick={() => table.previousPage()}
              isDisabled={!table.getCanPreviousPage()}
              isRound
            />
            <CIconButton
              variant="_outline"
              aria-label="toNext"
              icon={<ChevronRightIcon fontSize={30} />}
              onClick={() => table.nextPage()}
              isDisabled={!table.getCanNextPage()}
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
    <HStack width="100%">
      {!isMobile && <Text>Search</Text>}
      <Input
        type="text"
        value={searchText}
        onChange={onSearch}
        placeholder="Token, Name"
        maxWidth={{ base: '100%', lg: 60, md: 60, sm: 290 }}
        _focusVisible={{}}
      />
    </HStack>
  );
};
