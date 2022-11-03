import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SettingsIcon,
} from '@chakra-ui/icons';
import {
  Box,
  ButtonGroup,
  Center,
  Checkbox,
  Flex,
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

import { AdditionalInfo } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/AdditionalInfo';
import { BorrowApy } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/BorrowApy';
import { BorrowBalance } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/BorrowBalance';
import { Collateral } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/Collateral';
import { Liquidity } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/Liquidity';
import { SupplyApy } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/SupplyApy';
import { SupplyBalance } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/SupplyBalance';
import { TokenName } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/TokenName';
import { TotalBorrow } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/TotalBorrow';
import { TotalSupply } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/TotalSupply';
import { CButton, CIconButton } from '@ui/components/shared/Button';
import { GradientButton } from '@ui/components/shared/GradientButton';
import { GradientText } from '@ui/components/shared/GradientText';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import {
  ALL,
  BORROW_APY,
  BORROW_BALANCE,
  BORROWABLE,
  COLLATERAL,
  DEPRECATED,
  DOWN_LIMIT,
  LIQUIDITY,
  MARKET_LTV,
  MARKETS_COUNT_PER_PAGE,
  MIDAS_LOCALSTORAGE_KEYS,
  PROTECTED,
  REWARDS,
  SEARCH,
  SUPPLY_APY,
  SUPPLY_BALANCE,
  TOTAL_BORROW,
  TOTAL_SUPPLY,
  UP_LIMIT,
} from '@ui/constants/index';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useAssetsClaimableRewards } from '@ui/hooks/rewards/useAssetClaimableRewards';
import { useColors } from '@ui/hooks/useColors';
import { useDebounce } from '@ui/hooks/useDebounce';
import { UseRewardsData } from '@ui/hooks/useRewards';
import { useIsMobile, useIsSemiSmallScreen } from '@ui/hooks/useScreenSize';
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
  totalSupply: MarketData;
  totalBorrow: MarketData;
  liquidity: MarketData;
};

export const MarketsList = ({
  assets,
  rewards = {},
  comptrollerAddress,
  supplyBalanceFiat,
  borrowBalanceFiat,
  poolChainId,
  initSorting,
  initColumnVisibility,
}: {
  assets: MarketData[];
  rewards?: UseRewardsData;
  comptrollerAddress: string;
  supplyBalanceFiat: number;
  borrowBalanceFiat: number;
  poolChainId: number;
  initSorting: SortingState;
  initColumnVisibility: VisibilityState;
}) => {
  const sdk = useSdk(poolChainId);

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

  const totalApy = useMemo(() => {
    if (!sdk) return undefined;

    const result: { [market: string]: number } = {};
    for (const asset of assets) {
      let marketTotalAPY =
        sdk.ratePerBlockToAPY(
          asset.supplyRatePerBlock,
          getBlockTimePerMinuteByChainId(poolChainId)
        ) / 100;

      if (rewards[asset.cToken]) {
        marketTotalAPY += rewards[asset.cToken].reduce((acc, cur) => acc + cur.apy, 0);
      }
      result[asset.cToken] = marketTotalAPY;
    }

    return result;
  }, [rewards, assets, poolChainId, sdk]);

  const assetFilter: FilterFn<Market> = (row, columnId, value) => {
    if (
      !searchText ||
      (value.includes(SEARCH) &&
        (row.original.market.underlyingName.toLowerCase().includes(searchText.toLowerCase()) ||
          row.original.market.underlyingSymbol.toLowerCase().includes(searchText.toLowerCase()) ||
          row.original.market.cToken.toLowerCase().includes(searchText.toLowerCase())))
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

  const assetSort: SortingFn<Market> = React.useCallback(
    (rowA, rowB, columnId) => {
      if (!sdk) return 0;

      if (columnId === MARKET_LTV) {
        return rowB.original.market.underlyingSymbol.localeCompare(
          rowA.original.market.underlyingSymbol
        );
      } else if (columnId === SUPPLY_APY) {
        const rowASupplyAPY = totalApy ? totalApy[rowA.original.market.cToken] : 0;
        const rowBSupplyAPY = totalApy ? totalApy[rowB.original.market.cToken] : 0;
        return rowASupplyAPY > rowBSupplyAPY ? 1 : -1;
      } else if (columnId === BORROW_APY) {
        const rowABorrowAPY = !rowA.original.market.isBorrowPaused
          ? sdk.ratePerBlockToAPY(
              rowA.original.market.borrowRatePerBlock,
              getBlockTimePerMinuteByChainId(poolChainId)
            )
          : -1;
        const rowBBorrowAPY = !rowB.original.market.isBorrowPaused
          ? sdk.ratePerBlockToAPY(
              rowB.original.market.borrowRatePerBlock,
              getBlockTimePerMinuteByChainId(poolChainId)
            )
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
      } else if (columnId === COLLATERAL) {
        return rowA.original.market.membership ? 1 : -1;
      } else {
        return 0;
      }
    },
    [totalApy, poolChainId, sdk]
  );

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
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.supplyApy,
        id: SUPPLY_APY,
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
        enableSorting: !!totalApy,
      },
      {
        accessorFn: (row) => row.borrowApy,
        id: BORROW_APY,
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
        id: SUPPLY_BALANCE,
        cell: ({ getValue }) => (
          <SupplyBalance asset={getValue<MarketData>()} poolChainId={poolChainId} />
        ),
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
        id: BORROW_BALANCE,
        cell: ({ getValue }) => (
          <BorrowBalance asset={getValue<MarketData>()} poolChainId={poolChainId} />
        ),
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
        accessorFn: (row) => row.totalSupply,
        id: TOTAL_SUPPLY,
        cell: ({ getValue }) => (
          <TotalSupply asset={getValue<MarketData>()} poolChainId={poolChainId} />
        ),
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
        sortingFn: assetSort,
      },
      {
        accessorFn: (row) => row.totalBorrow,
        id: TOTAL_BORROW,
        cell: ({ getValue }) => (
          <TotalBorrow asset={getValue<MarketData>()} poolChainId={poolChainId} />
        ),
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
        sortingFn: assetSort,
      },
      {
        accessorFn: (row) => row.liquidity,
        id: LIQUIDITY,
        cell: ({ getValue }) => (
          <Liquidity asset={getValue<MarketData>()} poolChainId={poolChainId} />
        ),
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
        id: COLLATERAL,
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
  }, [rewards, comptrollerAddress, totalApy]);

  const [sorting, setSorting] = useState<SortingState>(initSorting);
  const [pagination, onPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: MARKETS_COUNT_PER_PAGE[0],
  });
  const isMobile = useIsMobile();
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
    if (globalFilter.includes(SEARCH)) {
      setGlobalFilter([filter, SEARCH]);
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
        flexDirection={{ base: 'column', md: 'row' }}
        gap={4}
      >
        <Flex className="pagination" flexDirection={{ base: 'column', lg: 'row' }} gap={4}>
          <Text paddingTop="2px" variant="title">
            Assets
          </Text>
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
              <PopoverTooltip
                body={
                  <VStack alignItems="flex-start" whiteSpace="pre-wrap">
                    <Text variant="mdText">All Assets</Text>
                    <Text variant="smText">Assets that are available in this pool.</Text>
                    <Text variant="smText">Click to filter</Text>
                  </VStack>
                }
                width="100%"
                height="100%"
              >
                <Center
                  width="100%"
                  height="100%"
                  fontWeight="bold"
                  pt="2px"
                >{`${data.length} All`}</Center>
              </PopoverTooltip>
            </CButton>
            {allClaimableRewards && Object.keys(allClaimableRewards).length !== 0 && (
              <GradientButton
                isSelected={globalFilter.includes(REWARDS)}
                onClick={() => onFilter(REWARDS)}
                borderWidth={globalFilter.includes(REWARDS) ? 0 : 2}
                mr="-px"
                width="115px"
              >
                <PopoverTooltip
                  body={
                    <VStack alignItems="flex-start" whiteSpace="pre-wrap">
                      <Text variant="mdText" fontWeight="bold">
                        Rewards Asset
                      </Text>
                      <Text variant="smText">Assets that have rewards.</Text>
                      <Text variant="smText">Click to filter</Text>
                    </VStack>
                  }
                  width="100%"
                  height="100%"
                >
                  <Center width="100%" height="100%" fontWeight="bold" pt="2px">
                    <GradientText isEnabled={!globalFilter.includes(REWARDS)} color={cCard.bgColor}>
                      {`${
                        (allClaimableRewards && Object.keys(allClaimableRewards).length) || 0
                      } Rewards`}
                    </GradientText>
                  </Center>
                </PopoverTooltip>
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
                <PopoverTooltip
                  body={
                    <VStack alignItems="flex-start" whiteSpace="pre-wrap">
                      <Text variant="mdText">Collateral Asset</Text>
                      <Text variant="smText">
                        Assets that can be deposited as collateral to borrow other assets.
                      </Text>
                      <Text variant="smText">Click to filter</Text>
                    </VStack>
                  }
                  width="100%"
                  height="100%"
                >
                  <Center
                    width="100%"
                    height="100%"
                    fontWeight="bold"
                    pt="2px"
                  >{`${collateralCounts} Collateral`}</Center>
                </PopoverTooltip>
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
                <PopoverTooltip
                  body={
                    <VStack alignItems="flex-start" whiteSpace="pre-wrap">
                      <Text variant="mdText">Borrowable Asset</Text>
                      <Text variant="smText">Assets that can be borrowed.</Text>
                      <Text variant="smText">Click to filter</Text>
                    </VStack>
                  }
                  width="100%"
                  height="100%"
                >
                  <Center
                    width="100%"
                    height="100%"
                    pt="2px"
                    fontWeight="bold"
                  >{`${borrowableCounts} Borrowable`}</Center>
                </PopoverTooltip>
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
                <PopoverTooltip
                  body={
                    <VStack alignItems="flex-start" whiteSpace="pre-wrap">
                      <Text variant="mdText">Protected Asset</Text>
                      <Text variant="smText">Assets that cannot be borrowed.</Text>
                      <Text variant="smText">Click to filter</Text>
                    </VStack>
                  }
                  width="100%"
                  height="100%"
                >
                  <Center
                    fontWeight="bold"
                    width="100%"
                    height="100%"
                    pt="2px"
                  >{`${protectedCounts} Protected`}</Center>
                </PopoverTooltip>
              </CButton>
            )}
            {deprecatedCounts !== 0 && (
              <CButton
                isSelected={globalFilter.includes(DEPRECATED)}
                variant="filter"
                color="gray"
                onClick={() => onFilter(DEPRECATED)}
                width="140px"
                p={0}
              >
                <PopoverTooltip
                  body={
                    <VStack alignItems="flex-start" whiteSpace="pre-wrap">
                      <Text variant="mdText">Deprecated Asset</Text>
                      <Text variant="smText">Assets that cannot be supplied and borrowed.</Text>
                      <Text variant="smText">Click to filter</Text>
                    </VStack>
                  }
                  width="100%"
                  height="100%"
                >
                  <Center
                    fontWeight="bold"
                    width="100%"
                    height="100%"
                    pt="2px"
                    whiteSpace="nowrap"
                  >{`${deprecatedCounts} Deprecated`}</Center>
                </PopoverTooltip>
              </CButton>
            )}
          </ButtonGroup>
        </Flex>
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
                          : header.column.id === COLLATERAL
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
          {!isMobile && <Text variant="smText">Markets Per Page</Text>}
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
    <HStack width="100%">
      {!isMobile && <Text>Search</Text>}
      <Input
        type="text"
        value={searchText}
        onChange={onSearch}
        placeholder="Symbol, Token Name"
        maxWidth={{ base: '100%', lg: 60, md: 60, sm: 290 }}
        _focusVisible={{}}
      />
    </HStack>
  );
};
