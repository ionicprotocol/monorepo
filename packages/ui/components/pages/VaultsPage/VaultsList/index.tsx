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
import { SupportedChains } from '@midas-capital/types';
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
import { Fragment, useEffect, useMemo, useState } from 'react';
import * as React from 'react';

import { Chain } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/Chain';
import { ChainFilterButton } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/index';
import { SupplyApy } from '@ui/components/pages/PoolPage/MarketsList/SupplyApy';
import { SupplyBalance } from '@ui/components/pages/PoolPage/MarketsList/SupplyBalance';
import { TokenName } from '@ui/components/pages/PoolPage/MarketsList/TokenName';
import { UserStats } from '@ui/components/pages/VaultsPage/UserStats/index';
import { CButton, CIconButton } from '@ui/components/shared/Button';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { TableHeaderCell } from '@ui/components/shared/TableHeaderCell';
import {
  ALL,
  BORROWABLE,
  CHAIN,
  COLLATERAL,
  HIDDEN,
  MARKETS_COUNT_PER_PAGE,
  MIDAS_LOCALSTORAGE_KEYS,
  PAUSED,
  POOL_NAME,
  PROTECTED,
  REWARDS,
  SEARCH,
  SUPPLY_APY,
  SUPPLY_BALANCE,
  VAULT,
} from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { FundedAsset, resQuery } from '@ui/hooks/useAllFundedInfo';
import { useEnabledChains } from '@ui/hooks/useChainConfig';
import { useColors } from '@ui/hooks/useColors';
import { useDebounce } from '@ui/hooks/useDebounce';
import { useIsMobile, useIsSemiSmallScreen } from '@ui/hooks/useScreenSize';
import { sortAssets } from '@ui/utils/sorts';
import { AdditionalInfo } from 'ui/components/pages/VaultsPage/VaultsList/AdditionalInfo/index';

export type Market = {
  chain: FundedAsset;
  vault: FundedAsset;
  supplyApy: FundedAsset;
  supplyBalance: FundedAsset;
};

export const VaultsList = ({
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
  } = info;

  const { address } = useMultiMidas();

  const assetFilter: FilterFn<Market> = (row, columnId, value) => {
    if (
      (!searchText ||
        (value.includes(SEARCH) &&
          (row.original.vault.underlyingName.toLowerCase().includes(searchText.toLowerCase()) ||
            row.original.vault.underlyingSymbol.toLowerCase().includes(searchText.toLowerCase()) ||
            row.original.vault.cToken.toLowerCase().includes(searchText.toLowerCase())))) &&
      (!value.includes(HIDDEN) ||
        (value.includes(HIDDEN) &&
          (!row.original.vault.supplyBalance.isZero() ||
            !row.original.vault.borrowBalance.isZero())))
    ) {
      if (
        value.includes(ALL) ||
        (value.includes(REWARDS) &&
          allClaimableRewards &&
          allClaimableRewards[row.original.vault.cToken]) ||
        (value.includes(COLLATERAL) && row.original.vault.membership) ||
        (value.includes(PROTECTED) &&
          row.original.vault.isBorrowPaused &&
          !row.original.vault.isSupplyPaused) ||
        (value.includes(BORROWABLE) && !row.original.vault.isBorrowPaused) ||
        (value.includes(PAUSED) &&
          row.original.vault.isBorrowPaused &&
          row.original.vault.isSupplyPaused)
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
      if (columnId === VAULT) {
        return rowB.original.vault.underlyingSymbol.localeCompare(
          rowA.original.vault.underlyingSymbol
        );
      } else if (columnId === CHAIN) {
        return Number(rowB.original.vault.chainId) > Number(rowA.original.vault.chainId) ? 1 : -1;
      } else if (columnId === SUPPLY_APY) {
        const rowASupplyAPY = totalSupplyApyPerAsset
          ? totalSupplyApyPerAsset[rowA.original.vault.cToken]
          : 0;
        const rowBSupplyAPY = totalSupplyApyPerAsset
          ? totalSupplyApyPerAsset[rowB.original.vault.cToken]
          : 0;
        return rowASupplyAPY > rowBSupplyAPY ? 1 : -1;
      } else if (columnId === SUPPLY_BALANCE) {
        return rowA.original.vault.supplyBalanceFiat > rowB.original.vault.supplyBalanceFiat
          ? 1
          : -1;
      } else {
        return 0;
      }
    },
    [totalSupplyApyPerAsset]
  );

  const data: Market[] = useMemo(() => {
    return sortAssets(assets).map((asset) => {
      return {
        chain: asset,
        vault: asset,
        supplyApy: asset,
        supplyBalance: asset,
      };
    });
  }, [assets]);

  const columns: ColumnDef<Market>[] = useMemo(() => {
    return [
      {
        accessorFn: (row) => row.chain,
        id: CHAIN,
        header: () => null,
        cell: ({ getValue }) => <Chain chainId={Number(getValue<FundedAsset>().chainId)} />,
        footer: (props) => props.column.id,
        sortingFn: assetSort,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.vault,
        id: VAULT,
        header: (context) => <TableHeaderCell context={context}>Vault</TableHeaderCell>,
        cell: ({ getValue }) => (
          <TokenName
            asset={getValue<FundedAsset>()}
            assets={assets}
            poolAddress={getValue<FundedAsset>().comptroller}
            poolChainId={Number(getValue<FundedAsset>().chainId)}
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
          <SupplyApy
            asset={getValue<FundedAsset>()}
            poolChainId={Number(getValue<FundedAsset>().chainId)}
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
        accessorFn: (row) => row.supplyBalance,
        id: SUPPLY_BALANCE,
        cell: ({ getValue }) => (
          <SupplyBalance
            asset={getValue<FundedAsset>()}
            poolChainId={Number(getValue<FundedAsset>().chainId)}
          />
        ),
        header: (context) => <TableHeaderCell context={context}>Supply Balance</TableHeaderCell>,

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

  const [globalFilter, setGlobalFilter] = useState<(SupportedChains | string)[]>([ALL]);
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

  const enabledChains = useEnabledChains();

  const onFilter = (filter: SupportedChains | string) => {
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
        <Flex
          alignItems="center"
          flexWrap="wrap-reverse"
          gap={3}
          justifyContent={['center', 'center', 'space-between']}
          mb={3}
          width="100%"
        >
          <ButtonGroup
            flexFlow={'row wrap'}
            gap={0}
            isAttached
            justifyContent="flex-start"
            spacing={0}
          >
            <CButton
              isSelected={globalFilter.includes(ALL)}
              onClick={() => onFilter(ALL)}
              px={4}
              variant="filter"
            >
              <Text>{isSemiSmallScreen ? 'All' : 'All Chains'}</Text>
            </CButton>
            {enabledChains.map((chainId) => {
              return (
                <ChainFilterButton
                  chainId={chainId}
                  globalFilter={globalFilter}
                  isLoading={false}
                  key={chainId}
                  onFilter={onFilter}
                />
              );
            })}
          </ButtonGroup>

          <Flex alignItems="flex-end" className="searchAsset" gap={2} justifyContent="center">
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
            >
              <IconButton
                aria-label="Column Settings"
                icon={<SettingsIcon fontSize={20} />}
                maxWidth={10}
                variant="_outline"
              />
            </PopoverTooltip>
          </Flex>
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
                      base: header.column.id === VAULT ? 2 : 1,
                      lg: header.column.id === VAULT ? 4 : 2,
                    }}
                    py={4}
                    textTransform="capitalize"
                  >
                    <HStack
                      justifyContent={
                        header.column.id === CHAIN
                          ? 'center'
                          : header.column.id === VAULT || header.column.id === POOL_NAME
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
                  className={row.original.vault.underlyingSymbol}
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
                        comptrollerAddress={row.original.vault.comptroller}
                        poolChainId={Number(row.original.vault.chainId)}
                        row={row}
                        rows={table.getCoreRowModel().rows}
                      />
                    </Td>
                  </Tr>
                )}
              </Fragment>
            ))
          ) : assets.length === 0 ? (
            <Tr>
              <Td border="none" colSpan={table.getHeaderGroups()[0].headers.length}>
                <Center py={8}>No vaults in this chain.</Center>
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

      {/* Pagination Elements */}
      <Flex alignItems="center" className="pagination" gap={4} justifyContent="flex-end" p={4}>
        <HStack>
          <Hide below="lg">
            <Text>Vaults Per Page</Text>
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
