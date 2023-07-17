import { Box, Flex, Grid, HStack, Text, VStack } from '@chakra-ui/react';
import { useMemo } from 'react';

import { PoolStat } from '@ui/components/pages/PoolPage/PoolStats/PoolStat';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import type { PoolData } from '@ui/types/TokensDataMap';
import { smallFormatter, smallUsdFormatter, tokenFormatter } from '@ui/utils/bigUtils';
import {
  sortTopBorrowedAssets,
  sortTopLiquidityAssets,
  sortTopSuppliedAssets,
  sortTopUtilizationAssets
} from '@ui/utils/sorts';

export const PoolStats = ({ poolData }: { poolData: PoolData | null | undefined }) => {
  const [topBorrowedAssets, topSuppliedAssets, topLiquidityAssets, topUtilizationAssets] =
    useMemo(() => {
      if (poolData && poolData.assets.length > 0) {
        return [
          sortTopBorrowedAssets(poolData.assets),
          sortTopSuppliedAssets(poolData.assets),
          sortTopLiquidityAssets(poolData.assets),
          sortTopUtilizationAssets(poolData.assets)
        ];
      } else {
        return [[], [], [], []];
      }
    }, [poolData]);

  return (
    <Grid
      gap={4}
      my={4}
      templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
      w="100%"
    >
      <PopoverTooltip
        body={
          topSuppliedAssets.length > 0 && topSuppliedAssets[0].totalSupplyFiat > 0 ? (
            <VStack alignItems="flex-start" spacing={0} width={'100%'}>
              <Text fontWeight="bold">Top supplied assets</Text>
              {topSuppliedAssets.slice(0, 3).map((asset, index) => (
                <Flex key={index}>
                  {asset.totalSupplyFiat > 0 && (
                    <HStack mt={1}>
                      {poolData && (
                        <TokenIcon
                          address={asset.underlyingToken}
                          chainId={poolData.chainId}
                          size="md"
                        />
                      )}
                      <Box ml="3">
                        <Text fontWeight="bold" mt={1}>
                          {smallUsdFormatter(asset.totalSupplyFiat)}
                        </Text>
                        <Text>
                          {tokenFormatter(
                            asset.totalSupply,
                            asset.underlyingDecimals,
                            asset.underlyingSymbol
                          )}
                        </Text>
                      </Box>
                    </HStack>
                  )}
                </Flex>
              ))}
            </VStack>
          ) : null
        }
        contentProps={{ p: 2, width: { base: '250px', sm: 'fit-content' } }}
      >
        <Flex height="100%">
          <PoolStat
            label="Total Supply"
            value={poolData ? smallUsdFormatter(poolData.totalSuppliedFiat, true) : undefined}
          />
        </Flex>
      </PopoverTooltip>

      <PopoverTooltip
        body={
          topBorrowedAssets.length > 0 && topBorrowedAssets[0].totalBorrowFiat > 0 ? (
            <VStack alignItems="flex-start" spacing={0} width={'100%'}>
              <Text fontWeight="bold">Top borrowed assets</Text>
              {topBorrowedAssets.slice(0, 3).map((asset, index) => (
                <Flex key={index}>
                  {asset.totalBorrowFiat > 0 && (
                    <HStack mt={1}>
                      {poolData && (
                        <TokenIcon
                          address={asset.underlyingToken}
                          chainId={poolData.chainId}
                          size="md"
                        />
                      )}
                      <Box ml="3">
                        <Text fontWeight="bold" mt={1}>
                          {smallUsdFormatter(asset.totalBorrowFiat)}
                        </Text>
                        <Text>
                          {tokenFormatter(
                            asset.totalBorrow,
                            asset.underlyingDecimals,
                            asset.underlyingSymbol
                          )}
                        </Text>
                      </Box>
                    </HStack>
                  )}
                </Flex>
              ))}
            </VStack>
          ) : null
        }
        contentProps={{ p: 2, width: { base: '250px', sm: 'fit-content' } }}
      >
        <Flex height="100%">
          <PoolStat
            label="Total Borrow"
            value={poolData ? smallUsdFormatter(poolData?.totalBorrowedFiat, true) : undefined}
          />
        </Flex>
      </PopoverTooltip>

      <PopoverTooltip
        body={
          topLiquidityAssets.length > 0 && topLiquidityAssets[0].liquidityFiat > 0 ? (
            <VStack alignItems="flex-start" spacing={0} width={'100%'}>
              <Text fontWeight="bold">Top liquidity assets</Text>
              {topLiquidityAssets.slice(0, 3).map((asset, index) => (
                <Flex key={index}>
                  {asset.liquidityFiat > 0 && (
                    <HStack mt={1}>
                      {poolData && (
                        <TokenIcon
                          address={asset.underlyingToken}
                          chainId={poolData.chainId}
                          size="md"
                        />
                      )}
                      <Box ml="3">
                        <Text fontWeight="bold" mt={1}>
                          {smallUsdFormatter(asset.liquidityFiat)}
                        </Text>
                        <Text>
                          {tokenFormatter(
                            asset.liquidity,
                            asset.underlyingDecimals,
                            asset.underlyingSymbol
                          )}
                        </Text>
                      </Box>
                    </HStack>
                  )}
                </Flex>
              ))}
            </VStack>
          ) : null
        }
        contentProps={{ p: 2, width: { base: '250px', sm: 'fit-content' } }}
      >
        <Flex height="100%">
          <PoolStat
            label="Total Liquidity"
            value={
              poolData ? smallUsdFormatter(poolData?.totalAvailableLiquidityFiat, true) : undefined
            }
          />
        </Flex>
      </PopoverTooltip>

      <PopoverTooltip
        body={
          topUtilizationAssets.length > 0 && topUtilizationAssets[0].utilization > 0 ? (
            <VStack alignItems="flex-start" spacing={0} width={'100%'}>
              <Text fontWeight="bold">Top utilization assets</Text>
              {topUtilizationAssets.slice(0, 3).map((asset, index) => (
                <Flex key={index}>
                  {asset.utilization > 0 && (
                    <HStack mt={1}>
                      {poolData && (
                        <TokenIcon
                          address={asset.underlyingToken}
                          chainId={poolData.chainId}
                          size="md"
                        />
                      )}
                      <Box ml="3">
                        <Text fontWeight="bold" mt={1}>
                          {smallFormatter(asset.utilization, true)}%
                        </Text>
                        <Text>{asset.underlyingSymbol}</Text>
                      </Box>
                    </HStack>
                  )}
                </Flex>
              ))}
            </VStack>
          ) : null
        }
        contentProps={{ p: 2, width: { base: '250px', sm: 'fit-content' } }}
      >
        <Flex height="100%">
          <PoolStat
            label="Pool Utilization"
            value={poolData ? poolData.utilization.toFixed(2) + '%' : undefined}
          />
        </Flex>
      </PopoverTooltip>
    </Grid>
  );
};
