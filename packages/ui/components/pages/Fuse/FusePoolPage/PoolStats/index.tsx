import {
  Box,
  Flex,
  Grid,
  HStack,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useMemo } from 'react';

import { PoolStat } from '@ui/components/pages/Fuse/FusePoolPage/PoolStats/PoolStat';
import { CTokenIcon } from '@ui/components/shared/CTokenIcon';
import { PoolData } from '@ui/types/TokensDataMap';
import { midUsdFormatter, smallUsdFormatter } from '@ui/utils/bigUtils';
import { sortTopBorrowedAssets, sortTopSuppliedAssets } from '@ui/utils/sorts';

export const PoolStats = ({ poolData }: { poolData: PoolData | null | undefined }) => {
  const [topBorrowedAssets, topSuppliedAssets] = useMemo(() => {
    if (poolData && poolData.assets.length > 0) {
      return [sortTopBorrowedAssets(poolData.assets), sortTopSuppliedAssets(poolData.assets)];
    } else {
      return [[], []];
    }
  }, [poolData]);

  return (
    <Grid
      templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
      gap={4}
      w="100%"
      my={4}
    >
      <Popover trigger="hover">
        <PopoverTrigger>
          <Flex>
            <PoolStat
              label="Total Supply"
              value={poolData ? midUsdFormatter(poolData.totalSuppliedFiat) : undefined}
            />
          </Flex>
        </PopoverTrigger>
        {topSuppliedAssets.length > 0 && (
          <PopoverContent p={2}>
            <PopoverArrow />
            <PopoverBody>
              <VStack width={'100%'} alignItems="flex-start" spacing={0}>
                <Text fontWeight="bold">Top supplied assets</Text>
                {topSuppliedAssets.slice(0, 3).map((asset, index) => (
                  <Flex key={index}>
                    {asset.totalSupplyFiat > 0 && (
                      <HStack mt={2}>
                        {poolData && (
                          <CTokenIcon
                            size="md"
                            address={asset.underlyingToken}
                            chainId={poolData.chainId}
                          />
                        )}
                        <Box ml="3">
                          <Text fontWeight="bold">{smallUsdFormatter(asset.totalSupplyFiat)}</Text>
                          <Text>{asset.underlyingSymbol}</Text>
                        </Box>
                      </HStack>
                    )}
                  </Flex>
                ))}
              </VStack>
            </PopoverBody>
          </PopoverContent>
        )}
      </Popover>
      <Popover trigger="hover">
        <PopoverTrigger>
          <Flex>
            <PoolStat
              label="Total Borrow"
              value={poolData ? midUsdFormatter(poolData?.totalBorrowedFiat) : undefined}
            />
          </Flex>
        </PopoverTrigger>
        {topBorrowedAssets.length > 0 && (
          <PopoverContent p={2}>
            <PopoverArrow />
            <PopoverBody>
              <VStack width={'100%'} alignItems="flex-start" spacing={0}>
                <Text fontWeight="bold">Top borrowed assets</Text>
                {topBorrowedAssets.slice(0, 3).map((asset, index) => (
                  <Flex key={index}>
                    {asset.totalBorrowFiat > 0 && (
                      <HStack mt={2}>
                        {poolData && (
                          <CTokenIcon
                            size="md"
                            address={asset.underlyingToken}
                            chainId={poolData.chainId}
                          />
                        )}
                        <Box ml="3">
                          <Text fontWeight="bold">{smallUsdFormatter(asset.totalBorrowFiat)}</Text>
                          <Text>{asset.underlyingSymbol}</Text>
                        </Box>
                      </HStack>
                    )}
                  </Flex>
                ))}
              </VStack>
            </PopoverBody>
          </PopoverContent>
        )}
      </Popover>

      <PoolStat
        label="Liquidity"
        value={poolData ? midUsdFormatter(poolData?.totalAvailableLiquidityFiat) : undefined}
      />
      <PoolStat
        label="Utilization"
        value={poolData ? poolData.utilization.toFixed(2) + '%' : undefined}
      />
    </Grid>
  );
};
