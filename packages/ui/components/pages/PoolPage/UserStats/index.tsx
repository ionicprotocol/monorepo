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

import { UserStat } from '@ui/components/pages/PoolPage/UserStats/UserStat';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useAssets } from '@ui/hooks/useAssets';
import { useColors } from '@ui/hooks/useColors';
import { useRewards } from '@ui/hooks/useRewards';
import { useBorrowApyPerAsset, useTotalSupplyApyPerAsset } from '@ui/hooks/useTotalApy';
import { PoolData } from '@ui/types/TokensDataMap';
import { midUsdFormatter, smallUsdFormatter, tokenFormatter } from '@ui/utils/bigUtils';
import { sortTopUserBorrowedAssets, sortTopUserSuppliedAssets } from '@ui/utils/sorts';

export const UserStats = ({ poolData }: { poolData: PoolData }) => {
  const [topSuppliedAssets, topBorrowedAssets] = useMemo(() => {
    if (poolData && poolData.assets.length > 0) {
      return [
        sortTopUserSuppliedAssets(poolData.assets),
        sortTopUserBorrowedAssets(poolData.assets),
      ];
    } else {
      return [[], []];
    }
  }, [poolData]);

  const { data: assetInfos } = useAssets(poolData.chainId);
  const { data: allRewards } = useRewards({
    poolId: poolData.id.toString(),
    chainId: poolData.chainId,
  });

  const { data: totalSupplyApyPerAsset } = useTotalSupplyApyPerAsset(
    poolData.assets,
    poolData.chainId,
    allRewards,
    assetInfos
  );

  const { data: borrowApyPerAsset } = useBorrowApyPerAsset(poolData.assets, poolData.chainId);

  const totalSupplyApy = useMemo(() => {
    if (totalSupplyApyPerAsset) {
      if (poolData.totalSupplyBalanceNative === 0) return { totalApy: 0, estimatedUsd: 0 };

      let _totalApy = 0;
      poolData.assets.map((asset) => {
        _totalApy +=
          (totalSupplyApyPerAsset[asset.cToken] * asset.supplyBalanceNative) /
          poolData.totalSupplyBalanceNative;
      });

      const _estimatedUsd = poolData.totalSupplyBalanceFiat * _totalApy;

      return {
        totalApy: _totalApy * 100,
        estimatedUsd: _estimatedUsd,
      };
    }

    return undefined;
  }, [
    poolData.assets,
    poolData.totalSupplyBalanceNative,
    poolData.totalSupplyBalanceFiat,
    totalSupplyApyPerAsset,
  ]);

  const totalBorrowApy = useMemo(() => {
    if (borrowApyPerAsset) {
      if (poolData.totalBorrowBalanceNative === 0) return { totalApy: 0, estimatedUsd: 0 };

      let _totalApy = 0;
      poolData.assets.map((asset) => {
        _totalApy +=
          (borrowApyPerAsset[asset.cToken] * asset.borrowBalanceNative) /
          poolData.totalBorrowBalanceNative;
      });

      const _estimatedUsd = poolData.totalBorrowBalanceFiat * _totalApy;

      return {
        totalApy: _totalApy * 100,
        estimatedUsd: _estimatedUsd,
      };
    }

    return undefined;
  }, [
    poolData.assets,
    poolData.totalBorrowBalanceNative,
    poolData.totalBorrowBalanceFiat,
    borrowApyPerAsset,
  ]);

  const { cPage } = useColors();

  return (
    <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={4} w="100%">
      <Popover trigger="hover">
        <PopoverTrigger>
          <Flex>
            <UserStat
              label="Your Supply"
              value={poolData ? midUsdFormatter(poolData.totalSupplyBalanceFiat) : undefined}
            />
          </Flex>
        </PopoverTrigger>
        {topSuppliedAssets.length > 0 && topSuppliedAssets[0].supplyBalanceFiat > 0 && (
          <PopoverContent p={2} width="fit-content">
            <PopoverArrow
              sx={{
                '--popper-arrow-shadow-color': cPage.primary.borderColor,
              }}
            />
            <PopoverBody>
              <VStack width={'100%'} alignItems="flex-start" spacing={0}>
                <Text fontWeight="bold">Top supplied assets</Text>
                {topSuppliedAssets.slice(0, 3).map((asset, index) => (
                  <Flex key={index}>
                    {asset.supplyBalanceFiat > 0 && (
                      <HStack mt={1}>
                        {poolData && (
                          <TokenIcon
                            size="md"
                            address={asset.underlyingToken}
                            chainId={poolData.chainId}
                          />
                        )}
                        <Box ml="3">
                          <Text fontWeight="bold" mt={1}>
                            {smallUsdFormatter(asset.supplyBalanceFiat)}
                          </Text>
                          <Text>
                            {tokenFormatter(asset.supplyBalance, asset.underlyingDecimals)}{' '}
                            {asset.underlyingSymbol}
                          </Text>
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
            <UserStat
              label="Your Borrow"
              value={poolData ? midUsdFormatter(poolData?.totalBorrowBalanceFiat) : undefined}
            />
          </Flex>
        </PopoverTrigger>
        {topBorrowedAssets.length > 0 && topBorrowedAssets[0].borrowBalanceFiat > 0 && (
          <PopoverContent p={2} width="fit-content">
            <PopoverArrow
              sx={{
                '--popper-arrow-shadow-color': cPage.primary.borderColor,
              }}
            />
            <PopoverBody>
              <VStack width={'100%'} alignItems="flex-start" spacing={0}>
                <Text fontWeight="bold">Top borrowed assets</Text>
                {topBorrowedAssets.slice(0, 3).map((asset, index) => (
                  <Flex key={index}>
                    {asset.borrowBalanceFiat > 0 && (
                      <HStack mt={1}>
                        {poolData && (
                          <TokenIcon
                            size="md"
                            address={asset.underlyingToken}
                            chainId={poolData.chainId}
                          />
                        )}
                        <Box ml="3">
                          <Text fontWeight="bold" mt={1}>
                            {smallUsdFormatter(asset.borrowBalanceFiat)}
                          </Text>
                          <Text>
                            {tokenFormatter(asset.borrowBalance, asset.underlyingDecimals)}{' '}
                            {asset.underlyingSymbol}
                          </Text>
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
            <UserStat
              label="Effective Supply APY"
              value={totalSupplyApy ? totalSupplyApy.totalApy.toFixed(2) + '%' : '-'}
              secondValue={
                totalSupplyApy ? '~ ' + smallUsdFormatter(totalSupplyApy.estimatedUsd) : ''
              }
            />
          </Flex>
        </PopoverTrigger>
        <PopoverContent p={2} width="fit-content">
          <PopoverArrow
            sx={{
              '--popper-arrow-shadow-color': cPage.primary.borderColor,
            }}
          />
          <PopoverBody>
            <Text>Total effective APY of all your supplied assets</Text>
          </PopoverBody>
        </PopoverContent>
      </Popover>
      <Popover trigger="hover">
        <PopoverTrigger>
          <Flex>
            <UserStat
              label="Effective Borrow APY"
              value={totalBorrowApy ? totalBorrowApy.totalApy.toFixed(2) + '%' : '-'}
              secondValue={
                totalBorrowApy ? '~ ' + smallUsdFormatter(totalBorrowApy.estimatedUsd) : ''
              }
            />
          </Flex>
        </PopoverTrigger>
        <PopoverContent p={2} width="fit-content">
          <PopoverArrow
            sx={{
              '--popper-arrow-shadow-color': cPage.primary.borderColor,
            }}
          />
          <PopoverBody>
            <Text>Total effective APY of all your borrowed assets</Text>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Grid>
  );
};
