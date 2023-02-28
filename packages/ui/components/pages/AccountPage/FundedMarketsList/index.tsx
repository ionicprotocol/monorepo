import { ChevronLeftIcon, ChevronRightIcon, SettingsIcon } from '@chakra-ui/icons';
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

import { AdditionalInfo } from '@ui/components/pages/AccountPage/FundedMarketsList/AdditionalInfo/index';
import { BorrowApy } from '@ui/components/pages/AccountPage/FundedMarketsList/BorrowApy';
import { BorrowBalance } from '@ui/components/pages/AccountPage/FundedMarketsList/BorrowBalance';
import { Chain } from '@ui/components/pages/AccountPage/FundedMarketsList/Chain';
import { Liquidity } from '@ui/components/pages/AccountPage/FundedMarketsList/Liquidity';
import { PoolName } from '@ui/components/pages/AccountPage/FundedMarketsList/PoolName';
import { SupplyApy } from '@ui/components/pages/AccountPage/FundedMarketsList/SupplyApy';
import { SupplyBalance } from '@ui/components/pages/AccountPage/FundedMarketsList/SupplyBalance';
import { TokenName } from '@ui/components/pages/AccountPage/FundedMarketsList/TokenName';
import { TotalBorrow } from '@ui/components/pages/AccountPage/FundedMarketsList/TotalBorrow';
import { TotalSupply } from '@ui/components/pages/AccountPage/FundedMarketsList/TotalSupply';
import { UserStats } from '@ui/components/pages/AccountPage/UserStats/index';
import { CButton, CIconButton } from '@ui/components/shared/Button';
import { GradientButton } from '@ui/components/shared/GradientButton';
import { GradientText } from '@ui/components/shared/GradientText';
import { TableHeaderCell } from '@ui/components/shared/TableHeaderCell';
import {
  ALL,
  BORROW_APY,
  BORROW_BALANCE,
  BORROWABLE,
  CHAIN,
  COLLATERAL,
  HIDDEN,
  LIQUIDITY,
  MARKET_LTV,
  MARKETS_COUNT_PER_PAGE,
  MIDAS_LOCALSTORAGE_KEYS,
  PAUSED,
  POOL_NAME,
  PROTECTED,
  REWARDS,
  SEARCH,
  SUPPLY_APY,
  SUPPLY_BALANCE,
  TOTAL_BORROW,
  TOTAL_SUPPLY,
} from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { FundedAsset, resQuery } from '@ui/hooks/useAllFundedInfo';
import { useColors } from '@ui/hooks/useColors';
import { useDebounce } from '@ui/hooks/useDebounce';
import { useIsMobile, useIsSemiSmallScreen } from '@ui/hooks/useScreenSize';
import { sortAssets } from '@ui/utils/sorts';

export type Market = {
  chain: FundedAsset;
  poolName: FundedAsset;
  market: FundedAsset;
  supplyApy: FundedAsset;
  supplyBalance: FundedAsset;
  borrowApy: FundedAsset;
  borrowBalance: FundedAsset;
  totalSupply: FundedAsset;
  totalBorrow: FundedAsset;
  liquidity: FundedAsset;
};

export const FundedMarketsList = ({
  info,
  initSorting,
  initColumnVisibility,
}: {
  info: resQuery;
  initSorting: SortingState;
  initColumnVisibility: VisibilityState;
}) => {
  const {
    fundedAssets: assets,
    allClaimableRewards,
    totalSupplyAPYs: totalSupplyApyPerAsset,
    borrowAPYs: borrowApyPerAsset,
    rewards,
    totalSupplyBalanceNative,
    totalSupplyBalanceFiat,
    totalBorrowBalanceNative,
    totalBorrowBalanceFiat,
  } = info;

  const { address } = useMultiMidas();
  const [collateralCounts, protectedCounts, borrowableCounts, pausedCounts] = useMemo(() => {
    return [
      assets.filter((asset) => asset.membership).length,
      assets.filter((asset) => asset.isBorrowPaused && !asset.isSupplyPaused).length,
      assets.filter((asset) => !asset.isBorrowPaused).length,
      assets.filter((asset) => asset.isBorrowPaused && asset.isSupplyPaused).length,
    ];
  }, [assets]);

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
      if (columnId === MARKET_LTV) {
        return rowB.original.market.underlyingSymbol.localeCompare(
          rowA.original.market.underlyingSymbol
        );
      } else if (columnId === CHAIN) {
        return Number(rowB.original.market.chainId) > Number(rowA.original.market.chainId) ? 1 : -1;
      } else if (columnId === POOL_NAME) {
        return rowB.original.market.poolName.localeCompare(rowA.original.market.poolName);
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
    [totalSupplyApyPerAsset, borrowApyPerAsset]
  );

  const data: Market[] = useMemo(() => {
    return sortAssets(assets).map((asset) => {
      return {
        chain: asset,
        poolName: asset,
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
        accessorFn: (row) => row.chain,
        id: CHAIN,
        header: (context) => <TableHeaderCell context={context}>Chain</TableHeaderCell>,
        cell: ({ getValue }) => <Chain asset={getValue<FundedAsset>()} />,
        footer: (props) => props.column.id,
        sortingFn: assetSort,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.market,
        id: MARKET_LTV,
        header: (context) => <TableHeaderCell context={context}>Market / LTV</TableHeaderCell>,
        cell: ({ getValue }) => <TokenName asset={getValue<FundedAsset>()} assets={assets} />,
        footer: (props) => props.column.id,
        filterFn: assetFilter,
        sortingFn: assetSort,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.poolName,
        id: POOL_NAME,
        header: (context) => <TableHeaderCell context={context}>Pool Name</TableHeaderCell>,
        cell: ({ getValue }) => <PoolName asset={getValue<FundedAsset>()} />,
        footer: (props) => props.column.id,
        sortingFn: assetSort,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.supplyApy,
        id: SUPPLY_APY,
        cell: ({ getValue }) => (
          <SupplyApy
            asset={getValue<FundedAsset>()}
            rewards={rewards}
            totalSupplyApyPerAsset={totalSupplyApyPerAsset}
          />
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
          <BorrowApy asset={getValue<FundedAsset>()} borrowApyPerAsset={borrowApyPerAsset} />
        ),
        header: (context) => <TableHeaderCell context={context}>Borrow APY</TableHeaderCell>,
        footer: (props) => props.column.id,
        sortingFn: assetSort,
      },
      {
        accessorFn: (row) => row.supplyBalance,
        id: SUPPLY_BALANCE,
        cell: ({ getValue }) => <SupplyBalance asset={getValue<FundedAsset>()} />,
        header: (context) => <TableHeaderCell context={context}>Supply Balance</TableHeaderCell>,

        footer: (props) => props.column.id,
        sortingFn: assetSort,
      },
      {
        accessorFn: (row) => row.borrowBalance,
        id: BORROW_BALANCE,
        cell: ({ getValue }) => <BorrowBalance asset={getValue<FundedAsset>()} />,
        header: (context) => <TableHeaderCell context={context}>Borrow Balance</TableHeaderCell>,

        footer: (props) => props.column.id,
        sortingFn: assetSort,
      },
      {
        accessorFn: (row) => row.totalSupply,
        id: TOTAL_SUPPLY,
        cell: ({ getValue }) => <TotalSupply asset={getValue<FundedAsset>()} />,
        header: (context) => <TableHeaderCell context={context}>Total Supply</TableHeaderCell>,

        footer: (props) => props.column.id,
        sortingFn: assetSort,
      },
      {
        accessorFn: (row) => row.totalBorrow,
        id: TOTAL_BORROW,
        cell: ({ getValue }) => <TotalBorrow asset={getValue<FundedAsset>()} />,
        header: (context) => <TableHeaderCell context={context}>Total Borrow</TableHeaderCell>,

        footer: (props) => props.column.id,
        sortingFn: assetSort,
      },
      {
        accessorFn: (row) => row.liquidity,
        id: LIQUIDITY,
        cell: ({ getValue }) => <Liquidity asset={getValue<FundedAsset>()} />,
        header: (context) => <TableHeaderCell context={context}>Liquidity</TableHeaderCell>,

        footer: (props) => props.column.id,
        sortingFn: assetSort,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rewards, totalSupplyApyPerAsset, assets, borrowApyPerAsset]);

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
    const data = { ...oldObj, userMarketSorting: sorting, userMarketColumnVisibility: arr };
    localStorage.setItem(MIDAS_LOCALSTORAGE_KEYS, JSON.stringify(data));
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
            <UserStats
              assets={assets}
              borrowApyPerAsset={borrowApyPerAsset}
              totalBorrowBalanceFiat={totalBorrowBalanceFiat}
              totalBorrowBalanceNative={totalBorrowBalanceNative}
              totalSupplyApyPerAsset={totalSupplyApyPerAsset}
              totalSupplyBalanceFiat={totalSupplyBalanceFiat}
              totalSupplyBalanceNative={totalSupplyBalanceNative}
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
            <Center fontWeight="bold" height="100%" width="100%">{`${data.length} All`}</Center>
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
                  {`${
                    (allClaimableRewards && Object.keys(allClaimableRewards).length) || 0
                  } Rewards`}
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
                {`${collateralCounts} Collateral`}
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
                {`${borrowableCounts} Borrowable`}
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
                {`${protectedCounts} Protected`}
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
                {`${pausedCounts} Paused`}
              </Center>
            </CButton>
          )}
        </ButtonGroup>

        <Flex alignItems="flex-end" className="searchAsset" gap={2} justifyContent="flex-start">
          <ControlledSearchInput onUpdate={(searchText) => setSearchText(searchText)} />
          <Popover placement="bottom-end">
            <PopoverTrigger>
              <IconButton
                aria-label="Column Settings"
                icon={<SettingsIcon fontSize={20} />}
                maxWidth={10}
                variant="_outline"
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
              </PopoverBody>
            </PopoverContent>
          </Popover>
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
                    px={{
                      base: header.column.id === MARKET_LTV ? 4 : 1,
                      lg: header.column.id === MARKET_LTV ? 70 : 2,
                    }}
                    py={4}
                    textTransform="capitalize"
                  >
                    <HStack
                      justifyContent={
                        header.column.id === CHAIN
                          ? 'center'
                          : header.column.id === MARKET_LTV || header.column.id === POOL_NAME
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
                        borrowBalanceFiat={row.original.market.totalBorrowBalanceFiat}
                        comptrollerAddress={row.original.market.comptroller}
                        poolChainId={Number(row.original.market.chainId)}
                        row={row}
                        rows={table.getCoreRowModel().rows}
                        supplyBalanceFiat={row.original.market.totalSupplyBalanceFiat}
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
