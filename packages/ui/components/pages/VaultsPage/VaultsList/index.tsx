import { ChevronLeftIcon, ChevronRightIcon, SettingsIcon } from '@chakra-ui/icons';
import {
  Box,
  Center,
  Checkbox,
  Flex,
  Hide,
  HStack,
  IconButton,
  Input,
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
  VStack
} from '@chakra-ui/react';
import type { SupportedChains, VaultData } from '@ionicprotocol/types';
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
import { Fragment, useEffect, useMemo, useState } from 'react';
import * as React from 'react';

import { ChainFilterButtons } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/ChainFilterButtons';
import { ChainFilterDropdown } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/ChainFilterDropdown';
import { Chain } from '@ui/components/pages/VaultsPage/VaultsList/Chain';
import { SupplyApy } from '@ui/components/pages/VaultsPage/VaultsList/SupplyApy';
import { TokenName } from '@ui/components/pages/VaultsPage/VaultsList/TokenName';
import { TotalSupply } from '@ui/components/pages/VaultsPage/VaultsList/TotalSupply';
import { Banner } from '@ui/components/shared/Banner';
import { MidasBox } from '@ui/components/shared/Box';
import { CIconButton } from '@ui/components/shared/Button';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { TableHeaderCell } from '@ui/components/shared/TableHeaderCell';
import {
  ALL,
  CHAIN,
  HIDDEN,
  IONIC_LOCALSTORAGE_KEYS,
  MARKETS_COUNT_PER_PAGE,
  POOL_NAME,
  SEARCH,
  SUPPLY_APY,
  TOTAL_SUPPLY,
  VAULT,
  VAULTS_COUNT_PER_PAGE
} from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useEnabledChains } from '@ui/hooks/useChainConfig';
import { useColors } from '@ui/hooks/useColors';
import { useDebounce } from '@ui/hooks/useDebounce';
import { useIsMobile } from '@ui/hooks/useScreenSize';
import type { Err, VaultsPerChainStatus } from '@ui/types/ComponentPropsType';
import { sortVaults } from '@ui/utils/sorts';
import { AdditionalInfo } from 'ui/components/pages/VaultsPage/VaultsList/AdditionalInfo/index';

export type VaultRowData = {
  chain: VaultData;
  supplyApy: VaultData;
  totalSupply: VaultData;
  vault: VaultData;
};

export const VaultsList = ({
  vaultsPerChain,
  initSorting,
  initColumnVisibility,
  isLoading
}: {
  initColumnVisibility: VisibilityState;
  initSorting: SortingState;
  isLoading: boolean;
  vaultsPerChain: VaultsPerChainStatus;
}) => {
  const { address } = useMultiIonic();
  const [err, setErr] = useState<Err | undefined>();
  const [isLoadingPerChain, setIsLoadingPerChain] = useState(false);
  const [selectedFilteredVaults, setSelectedFilteredVaults] = useState<VaultData[]>([]);

  const [sorting, setSorting] = useState<SortingState>(initSorting);
  const [pagination, onPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: VAULTS_COUNT_PER_PAGE[0]
  });

  const [globalFilter, setGlobalFilter] = useState<(SupportedChains | string)[]>([ALL]);
  const [columnVisibility, setColumnVisibility] = useState(initColumnVisibility);
  const [searchText, setSearchText] = useState('');

  const enabledChains = useEnabledChains();

  const allVaults = useMemo(() => {
    return Object.values(vaultsPerChain).reduce((res, vaults) => {
      if (vaults.data && vaults.data.length > 0) {
        res.push(...vaults.data);
      }

      return res;
    }, [] as VaultData[]);
  }, [vaultsPerChain]);

  const loadingStatusPerChain = useMemo(() => {
    const _loadingStatusPerChain: { [chainId: string]: boolean } = {};

    Object.entries(vaultsPerChain).map(([chainId, vaults]) => {
      _loadingStatusPerChain[chainId] = vaults.isLoading;
    });

    return _loadingStatusPerChain;
  }, [vaultsPerChain]);

  useEffect(() => {
    const vaults: VaultData[] = [];

    if (globalFilter.includes(ALL)) {
      setSelectedFilteredVaults([...allVaults]);
    } else {
      globalFilter.map((filter) => {
        const data = vaultsPerChain[filter.toString()]?.data;

        if (data) {
          vaults.push(...data);
        }
      });

      setSelectedFilteredVaults(vaults);
    }
  }, [globalFilter, vaultsPerChain, allVaults]);

  const vaultFilter: FilterFn<VaultRowData> = (row, columnId, value) => {
    if (
      (!searchText ||
        (value.includes(SEARCH) &&
          (row.original.vault.symbol.toLowerCase().includes(searchText.toLowerCase()) ||
            row.original.vault.asset.toLowerCase().includes(searchText.toLowerCase())))) &&
      (!value.includes(HIDDEN) ||
        (value.includes(HIDDEN) && !row.original.vault.totalSupply.isZero()))
    ) {
      if (value.includes(ALL) || value.includes(row.original.vault.chainId)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  const vaultSort: SortingFn<VaultRowData> = React.useCallback((rowA, rowB, columnId) => {
    if (columnId === VAULT) {
      return rowB.original.vault.symbol.localeCompare(rowA.original.vault.symbol);
    } else if (columnId === CHAIN) {
      return Number(rowB.original.vault.chainId) > Number(rowA.original.vault.chainId) ? 1 : -1;
    } else if (columnId === SUPPLY_APY) {
      return Number(rowB.original.vault.supplyApy) > Number(rowA.original.vault.supplyApy) ? 1 : -1;
    } else if (columnId === TOTAL_SUPPLY) {
      return rowB.original.vault.totalSupply.gt(rowA.original.vault.totalSupply) ? 1 : -1;
    } else {
      return 0;
    }
  }, []);

  const data: VaultRowData[] = useMemo(() => {
    return sortVaults(allVaults).map((vault) => {
      return {
        chain: vault,
        supplyApy: vault,
        totalSupply: vault,
        vault: vault
      };
    });
  }, [allVaults]);

  const columns: ColumnDef<VaultRowData>[] = useMemo(() => {
    return [
      {
        accessorFn: (row) => row.chain,
        cell: ({ getValue }) => <Chain chainId={Number(getValue<VaultData>().chainId)} />,
        enableHiding: false,
        footer: (props) => props.column.id,
        header: () => null,
        id: CHAIN,
        sortingFn: vaultSort
      },
      {
        accessorFn: (row) => row.vault,
        cell: ({ getValue }) => (
          <TokenName
            chainId={Number(getValue<VaultData>().chainId)}
            symbol={getValue<VaultData>().symbol}
            underlying={getValue<VaultData>().asset}
          />
        ),
        enableHiding: false,
        filterFn: vaultFilter,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{VAULT}</TableHeaderCell>,
        id: VAULT,
        sortingFn: vaultSort
      },
      {
        accessorFn: (row) => row.supplyApy,
        cell: ({ getValue }) => <SupplyApy vault={getValue<VaultData>()} />,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{SUPPLY_APY}</TableHeaderCell>,
        id: SUPPLY_APY,
        sortingFn: vaultSort
      },
      {
        accessorFn: (row) => row.totalSupply,
        cell: ({ getValue }) => <TotalSupply vault={getValue<VaultData>()} />,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{TOTAL_SUPPLY}</TableHeaderCell>,
        id: TOTAL_SUPPLY,
        sortingFn: vaultSort
      }
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    globalFilterFn: vaultFilter,
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

  const onFilter = (filter: SupportedChains | string) => {
    let _globalFilter: (SupportedChains | string)[] = [];

    if (globalFilter.includes(filter)) {
      if (filter === ALL) {
        _globalFilter = [enabledChains[0]];
      } else {
        _globalFilter = globalFilter.filter((f) => f !== filter);

        if (_globalFilter.length === 0) {
          _globalFilter = [ALL];
        }
      }
    } else {
      if (globalFilter.includes(ALL)) {
        _globalFilter = [filter];
      } else if (
        filter === ALL ||
        enabledChains.length === globalFilter.filter((f) => f !== ALL && f != SEARCH).length + 1
      ) {
        _globalFilter = [ALL];
      } else {
        _globalFilter = [...globalFilter, filter];
      }
    }

    if (globalFilter.includes(SEARCH) && globalFilter.includes(HIDDEN)) {
      setGlobalFilter([..._globalFilter, SEARCH, HIDDEN]);
    } else if (globalFilter.includes(SEARCH)) {
      setGlobalFilter([..._globalFilter, SEARCH]);
    } else if (globalFilter.includes(HIDDEN)) {
      setGlobalFilter([..._globalFilter, HIDDEN]);
    } else {
      setGlobalFilter([..._globalFilter]);
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
    const data = { ...oldObj, vaultColumnVisibility: arr, vaultSorting: sorting };
    localStorage.setItem(IONIC_LOCALSTORAGE_KEYS, JSON.stringify(data));
  }, [sorting, columnVisibility]);

  useEffect(() => {
    const selectedChainId = Object.keys(vaultsPerChain).find((chainId) =>
      globalFilter.includes(Number(chainId))
    );
    if (selectedChainId) {
      setErr(vaultsPerChain[selectedChainId].error);
      setIsLoadingPerChain(vaultsPerChain[selectedChainId].isLoading);
    } else {
      setErr(undefined);
      setIsLoadingPerChain(false);
    }
  }, [globalFilter, vaultsPerChain]);

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
            mx={4}
          >
            {/* <UserStats
              assets={assets}
              totalSupplyApyPerAsset={totalSupplyApyPerAsset}
              totalSupplyBalanceFiat={totalSupplyBalanceFiat}
              totalSupplyBalanceNative={totalSupplyBalanceNative}
            /> */}
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
      >
        <Flex
          alignItems="center"
          flexWrap="wrap-reverse"
          gap={3}
          justifyContent={['center', 'center', 'space-between']}
          mb={3}
          width="100%"
        >
          <ChainFilterButtons
            globalFilter={globalFilter}
            isLoading={isLoading}
            loadingStatusPerChain={loadingStatusPerChain}
            onFilter={onFilter}
            props={{ display: { base: 'none', lg: 'inline-flex' } }}
          />
          <ChainFilterDropdown
            globalFilter={globalFilter}
            isLoading={isLoading}
            loadingStatusPerChain={loadingStatusPerChain}
            onFilter={onFilter}
            props={{ display: { base: 'inline-flex', lg: 'none' } }}
          />

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
      <MidasBox overflowX="auto" width="100%">
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
              textAlign: 'center'
            }}
            descriptions={[
              {
                text: `Unable to retrieve Vaults. Please try again later.`
              }
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
                          base: header.column.id === VAULT ? 2 : 1,
                          lg: header.column.id === VAULT ? 4 : 2
                        }}
                        py={6}
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
                      className={row.original.vault.symbol}
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
                          <AdditionalInfo row={row} />
                        </Td>
                      </Tr>
                    )}
                  </Fragment>
                ))
              ) : selectedFilteredVaults.length === 0 ? (
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
      </MidasBox>
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
