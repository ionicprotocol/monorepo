import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  Center,
  Divider,
  Flex,
  Hide,
  HStack,
  Select,
  Switch,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import type {
  ColumnDef,
  FilterFn,
  PaginationState,
  SortingFn,
  SortingState,
} from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { constants } from 'ethers';
import * as React from 'react';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';

import { Asset } from '@ui/components/pages/PoolPage/AssetsToSupply/Asset';
import { Collateral } from '@ui/components/pages/PoolPage/AssetsToSupply/Collateral';
import { Details } from '@ui/components/pages/PoolPage/AssetsToSupply/Details';
import { Supply } from '@ui/components/pages/PoolPage/AssetsToSupply/Supply';
import { SupplyApy } from '@ui/components/pages/PoolPage/AssetsToSupply/SupplyApy';
import { WalletBalance } from '@ui/components/pages/PoolPage/AssetsToSupply/WalletBalance';
import { CIconButton } from '@ui/components/shared/Button';
import { SearchInput } from '@ui/components/shared/SearchInput';
import { TableHeaderCell } from '@ui/components/shared/TableHeaderCell';
import {
  APY,
  ASSET,
  COLLATERAL,
  DETAILS,
  MARKETS_COUNT_PER_PAGE,
  POOLS_COUNT_PER_PAGE,
  SEARCH,
  SUPPLY,
  WALLET_BALANCE,
} from '@ui/constants/index';
import { useAssetsToSupplyData } from '@ui/hooks/assetsToSupply/useAssetsToSupplyData';
import { useAssets } from '@ui/hooks/useAssets';
import { useColors } from '@ui/hooks/useColors';
import { useRewards } from '@ui/hooks/useRewards';
import { useTokensBalance } from '@ui/hooks/useTokenBalance';
import { useTotalSupplyAPYs } from '@ui/hooks/useTotalSupplyAPYs';
import type { MarketData, PoolData } from '@ui/types/TokensDataMap';

export type AssetToSupplyRowData = {
  apy: MarketData;
  asset: MarketData;
  collateral: MarketData;
  walletBalance: MarketData;
};

export const AssetsToSupply = ({ poolData }: { poolData: PoolData }) => {
  const { id: poolId, chainId } = poolData;
  const [sorting, setSorting] = useState<SortingState>([{ desc: true, id: ASSET }]);
  const [pagination, onPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: POOLS_COUNT_PER_PAGE[0],
  });
  const [globalFilter, setGlobalFilter] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const { data: allRewards } = useRewards({ chainId, poolId: poolId.toString() });
  const { data: assetInfos } = useAssets(chainId ? [chainId] : []);
  const { data: totalSupplyApyPerAsset } = useTotalSupplyAPYs(
    poolData?.assets,
    chainId,
    allRewards,
    assetInfos
  );
  const { data: balancePerAsset } = useTokensBalance(
    poolData?.assets.map((asset) => asset.underlyingToken),
    chainId
  );

  const assetFilter: FilterFn<AssetToSupplyRowData> = useCallback(
    (row, columnId, value) => {
      const asset = row.original.asset;

      if (
        !searchText ||
        (value.includes(SEARCH) &&
          (asset.underlyingName.toLowerCase().includes(searchText.toLowerCase()) ||
            asset.underlyingSymbol.toLowerCase().includes(searchText.toLowerCase())))
      ) {
        return true;
      } else {
        return false;
      }
    },
    [searchText]
  );

  const assetSort: SortingFn<AssetToSupplyRowData> = useCallback(
    (rowA, rowB, columnId) => {
      if (columnId === ASSET) {
        return rowB.original.asset.underlyingSymbol.localeCompare(
          rowA.original.asset.underlyingSymbol
        );
      } else if (columnId === WALLET_BALANCE) {
        const rowABalance =
          balancePerAsset && balancePerAsset[rowA.original.asset.underlyingToken]
            ? balancePerAsset[rowA.original.asset.underlyingToken]
            : constants.Zero;
        const rowBBalance =
          balancePerAsset && balancePerAsset[rowB.original.asset.underlyingToken]
            ? balancePerAsset[rowB.original.asset.underlyingToken]
            : constants.Zero;
        return rowABalance.gt(rowBBalance) ? 1 : -1;
      } else if (columnId === APY) {
        const rowAAPY =
          totalSupplyApyPerAsset && totalSupplyApyPerAsset[rowA.original.asset.cToken]
            ? totalSupplyApyPerAsset[rowA.original.asset.cToken].totalApy
            : 0;
        const rowBSupplyAPY =
          totalSupplyApyPerAsset && totalSupplyApyPerAsset[rowA.original.asset.cToken]
            ? totalSupplyApyPerAsset[rowB.original.asset.cToken].totalApy
            : 0;
        return rowAAPY > rowBSupplyAPY ? 1 : -1;
      } else {
        return 1;
      }
    },
    [totalSupplyApyPerAsset, balancePerAsset]
  );

  const tableData = useAssetsToSupplyData(poolData?.assets);

  const columns: ColumnDef<AssetToSupplyRowData>[] = useMemo(() => {
    return [
      {
        accessorFn: (row) => row.asset,
        cell: ({ getValue }) => <Asset asset={getValue<MarketData>()} poolChainId={chainId} />,
        filterFn: assetFilter,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{ASSET}</TableHeaderCell>,
        id: ASSET,
        sortingFn: assetSort,
      },
      {
        accessorFn: (row) => row.walletBalance,
        cell: ({ getValue }) => <WalletBalance asset={getValue<MarketData>()} chainId={chainId} />,
        enableSorting: false,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{WALLET_BALANCE}</TableHeaderCell>,
        id: WALLET_BALANCE,
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
        sortingFn: assetSort,
      },
      {
        accessorFn: (row) => row.collateral,
        cell: ({ getValue }) => <Collateral asset={getValue<MarketData>()} />,
        enableSorting: false,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{COLLATERAL}</TableHeaderCell>,
        id: COLLATERAL,
        sortingFn: assetSort,
      },
      {
        cell: ({ row }) => {
          return <Supply asset={row.getValue(ASSET)} />;
        },
        header: () => null,
        id: SUPPLY,
      },
      {
        cell: ({ row }) => {
          return <Details asset={row.getValue(ASSET)} />;
        },
        header: () => null,
        id: DETAILS,
      },
    ];
  }, [allRewards, assetFilter, assetSort, chainId, totalSupplyApyPerAsset]);

  const table = useReactTable({
    columns,
    data: tableData,
    enableSortingRemoval: false,
    getColumnCanGlobalFilter: () => true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: assetFilter,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: onPagination,
    onSortingChange: setSorting,
    state: {
      globalFilter,
      pagination,
      sorting,
    },
  });

  const { cCard, cIPage, cIRow } = useColors();

  useEffect(() => {
    if (searchText) {
      setGlobalFilter([...globalFilter, SEARCH]);
    } else {
      setGlobalFilter(globalFilter.filter((f) => f !== SEARCH));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  return (
    <Flex direction="column" gap="24px">
      <Flex
        alignItems="center"
        flexWrap="wrap"
        gap={4}
        justifyContent={['center', 'center', 'space-between']}
        width="100%"
      >
        <Text size="xl">Assets to Supply</Text>
        <Flex
          alignItems="center"
          className="searchAsset"
          direction="row"
          gap={2}
          justifyContent="center"
        >
          <SearchInput
            inputProps={{ width: '120px' }}
            onSearch={(searchText) => setSearchText(searchText)}
            placeholder="Search by asset"
          />
          <Center height={5}>
            <Divider bg={cIPage.dividerColor} orientation="vertical" width="2px" />
          </Center>
          <HStack>
            <Text size="md" width="max-content">
              Show assets with 0 balance
            </Text>
            <Switch
              h="20px"
              // isChecked={true}
              // isDisabled={isUpdating || !isEditableAdmin}
              ml="auto"
              // onChange={toggleBorrowState}
            />
          </HStack>
          <Center height={5}>
            <Divider bg={cIPage.dividerColor} orientation="vertical" width="2px" />
          </Center>
          <HStack>
            <Text size="md" width="max-content">
              Sort by
            </Text>
            <ChevronDownIcon />
          </HStack>
        </Flex>
      </Flex>

      <Table style={{ borderCollapse: 'separate', borderSpacing: '0 16px' }}>
        <Thead>
          {table.getHeaderGroups().map((headerGroup) => (
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
          {table.getRowModel().rows && table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
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
                        borderRightRadius={index === row.getVisibleCells().length - 1 ? '20px' : 0}
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
          ) : poolData.assets.length === 0 ? (
            <Tr>
              <Td border="none" colSpan={table.getHeaderGroups()[0].headers.length}>
                <Center py={8}>There are no assets to supply.</Center>
              </Td>
            </Tr>
          ) : (
            <Tr>
              <Td border="none" colSpan={table.getHeaderGroups()[0].headers.length}>
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
    </Flex>
  );
};
