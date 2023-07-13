import { ChevronLeftIcon, ChevronRightIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import {
  Center,
  Divider,
  Flex,
  Hide,
  HStack,
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
import { utils } from 'ethers';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import * as React from 'react';

import { Asset } from '@ui/components/pages/PoolPage/YourSupplies/Asset';
import { Collateral } from '@ui/components/pages/PoolPage/YourSupplies/Collateral';
import { Details } from '@ui/components/pages/PoolPage/YourSupplies/Details';
import { SupplyApy } from '@ui/components/pages/PoolPage/YourSupplies/SupplyApy';
import { Withdraw } from '@ui/components/pages/PoolPage/YourSupplies/Withdraw';
import { YourBalance } from '@ui/components/pages/PoolPage/YourSupplies/YourBalance';
import { CIconButton } from '@ui/components/shared/Button';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { SearchInput } from '@ui/components/shared/SearchInput';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { TableHeaderCell } from '@ui/components/shared/TableHeaderCell';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import {
  APY,
  ASSET,
  COLLATERAL,
  DETAILS,
  MARKETS_COUNT_PER_PAGE,
  SEARCH,
  WITHDRAW,
  YOUR_BALANCE,
} from '@ui/constants/index';
import { useAssets } from '@ui/hooks/useAssets';
import { useColors } from '@ui/hooks/useColors';
import { useRewards } from '@ui/hooks/useRewards';
import { useTotalSupplyAPYs } from '@ui/hooks/useTotalSupplyAPYs';
import { useYourSuppliesRowData } from '@ui/hooks/yourSupplies/useYourSuppliesRowData';
import type { MarketData, PoolData } from '@ui/types/TokensDataMap';
import { smallFormatter, smallUsdFormatter } from '@ui/utils/bigUtils';

export type YourSupplyRowData = {
  apy: MarketData;
  asset: MarketData;
  collateral: MarketData;
  yourBalance: MarketData;
};

export const YourSupplies = ({ poolData }: { poolData: PoolData }) => {
  const {
    id: poolId,
    chainId,
    assets,
    totalSupplyBalanceFiat,
    totalCollateralSupplyBalanceFiat,
  } = poolData;
  const [sorting, setSorting] = useState<SortingState>([{ desc: true, id: ASSET }]);
  const [pagination, onPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: MARKETS_COUNT_PER_PAGE[0],
  });
  const [globalFilter, setGlobalFilter] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const { data: allRewards } = useRewards({ chainId, poolId: poolId.toString() });
  const { data: assetInfos } = useAssets(chainId ? [chainId] : []);
  const { data: totalSupplyApyPerAsset } = useTotalSupplyAPYs(
    assets,
    chainId,
    allRewards,
    assetInfos
  );

  const totalSupplyApy = useMemo(() => {
    if (totalSupplyApyPerAsset) {
      if (poolData.totalSupplyBalanceNative === 0)
        return { estimatedPerAsset: [], estimatedUsd: 0, totalApy: 0, totalSupplied: 0 };

      let _totalApy = 0;
      const _estimatedPerAsset: {
        apy: number;
        estimated: number;
        supplied: string;
        symbol: string;
        underlying: string;
      }[] = [];

      let _estimatedUsd = 0;

      poolData.assets.map((asset) => {
        _estimatedUsd +=
          totalSupplyApyPerAsset[asset.cToken].apy * asset.supplyBalanceFiat +
          (totalSupplyApyPerAsset[asset.cToken].totalApy -
            totalSupplyApyPerAsset[asset.cToken].apy) *
            asset.netSupplyBalanceFiat;

        _totalApy +=
          (totalSupplyApyPerAsset[asset.cToken].apy * asset.supplyBalanceNative +
            (totalSupplyApyPerAsset[asset.cToken].totalApy -
              totalSupplyApyPerAsset[asset.cToken].apy) *
              asset.netSupplyBalanceNative) /
          poolData.totalSupplyBalanceNative;

        if (asset.supplyBalanceNative !== 0) {
          const suppliedNum = parseFloat(
            utils.formatUnits(asset.supplyBalance, asset.underlyingDecimals.toNumber())
          );

          const netSuppliedNum = parseFloat(
            utils.formatUnits(asset.netSupplyBalance, asset.underlyingDecimals.toNumber())
          );

          _estimatedPerAsset.push({
            apy: totalSupplyApyPerAsset[asset.cToken].totalApy * 100,
            estimated:
              totalSupplyApyPerAsset[asset.cToken].apy * suppliedNum +
              (totalSupplyApyPerAsset[asset.cToken].totalApy -
                totalSupplyApyPerAsset[asset.cToken].apy) *
                netSuppliedNum,
            supplied: smallFormatter(suppliedNum),
            symbol: asset.underlyingSymbol,
            underlying: asset.underlyingToken,
          });
        }
      });

      return {
        estimatedPerAsset: _estimatedPerAsset,
        estimatedUsd: _estimatedUsd,
        totalApy: _totalApy * 100,
        totalSupplied: poolData.totalSupplyBalanceFiat,
      };
    }

    return undefined;
  }, [
    poolData.assets,
    poolData.totalSupplyBalanceNative,
    poolData.totalSupplyBalanceFiat,
    totalSupplyApyPerAsset,
  ]);

  const assetFilter: FilterFn<YourSupplyRowData> = useCallback(
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

  const assetSort: SortingFn<YourSupplyRowData> = useCallback(
    (rowA, rowB, columnId) => {
      if (columnId === ASSET) {
        return rowB.original.asset.underlyingSymbol.localeCompare(
          rowA.original.asset.underlyingSymbol
        );
      } else if (columnId === YOUR_BALANCE) {
        return rowA.original.asset.supplyBalanceFiat > rowB.original.asset.supplyBalanceFiat
          ? 1
          : -1;
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
    [totalSupplyApyPerAsset]
  );

  const tableData = useYourSuppliesRowData(poolData?.assets);

  const columns: ColumnDef<YourSupplyRowData>[] = useMemo(() => {
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
        accessorFn: (row) => row.yourBalance,
        cell: ({ getValue }) => <YourBalance asset={getValue<MarketData>()} chainId={chainId} />,
        enableSorting: false,
        footer: (props) => props.column.id,
        header: (context) => <TableHeaderCell context={context}>{YOUR_BALANCE}</TableHeaderCell>,
        id: YOUR_BALANCE,
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
          return <Withdraw asset={row.getValue(ASSET)} />;
        },
        header: () => null,
        id: WITHDRAW,
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
        <Text size="xl">Your Supplies</Text>
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
        </Flex>
      </Flex>
      <Flex flexWrap="wrap" gap="32px">
        <VStack alignItems="flex-start">
          <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
            Balance
          </Text>
          <Text color={'iWhite'} size="lg">
            {smallUsdFormatter(totalSupplyBalanceFiat, true)}
          </Text>
        </VStack>
        <VStack alignItems="flex-start">
          <Flex direction="row" gap={1} height="18px">
            <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
              APY
            </Text>
            <SimpleTooltip
              label={
                'The expected annual percentage yield(APY) on supplied assets received by this account, assuming the current variable interest rates on all supplied assets remains constant'
              }
            >
              <InfoOutlineIcon
                color={'iLightGray'}
                height="fit-content"
                ml={1}
                verticalAlign="baseLine"
              />
            </SimpleTooltip>
          </Flex>

          <PopoverTooltip
            body={
              <VStack alignItems="flex-start">
                {totalSupplyApy && totalSupplyApy.estimatedPerAsset.length > 0 ? (
                  <VStack pt={2} width="100%">
                    <VStack alignItems="flex-start" pt={2} width="100%">
                      {totalSupplyApy.estimatedPerAsset.map((data) => {
                        return (
                          <HStack key={data.underlying}>
                            <TokenIcon
                              address={data.underlying}
                              chainId={poolData.chainId}
                              size="sm"
                            />
                            <Text whiteSpace="nowrap">
                              {data.supplied} {data.symbol} at {data.apy.toFixed(2)}% APY yield{' '}
                              <b>
                                {smallFormatter(data.estimated)} {data.symbol}/year
                              </b>
                            </Text>
                          </HStack>
                        );
                      })}
                      <Divider bg={cIPage.dividerColor} />
                      <HStack alignSelf="self-end">
                        <Text whiteSpace="nowrap">
                          {smallFormatter(totalSupplyApy.totalSupplied)} USD at{' '}
                          {totalSupplyApy.totalApy.toFixed(2)}% APY yield{' '}
                          <b>{smallFormatter(totalSupplyApy.estimatedUsd)} USD/year</b>
                        </Text>
                      </HStack>
                    </VStack>
                  </VStack>
                ) : null}
              </VStack>
            }
            contentProps={{ minWidth: { base: '300px', sm: '350px' }, p: 2 }}
          >
            <Text size={'lg'}>
              {totalSupplyApy ? totalSupplyApy.totalApy.toFixed(2) + '%' : '-'}
            </Text>
          </PopoverTooltip>
        </VStack>
        <VStack alignItems="flex-start">
          <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
            Collateral
          </Text>
          <Text color={'iWhite'} size="lg">
            {smallUsdFormatter(totalCollateralSupplyBalanceFiat, true)}
          </Text>
        </VStack>
      </Flex>
      <Center>
        <Divider bg={cIPage.dividerColor} orientation="horizontal" />
      </Center>

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
                    <HStack justifyContent={header.id === COLLATERAL ? 'center' : 'flex-start'}>
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
