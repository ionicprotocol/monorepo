import { Box, Divider, Flex, Grid, HStack, Text, VStack } from '@chakra-ui/react';
import { utils } from 'ethers';
import { useMemo } from 'react';

import { UserStat } from '@ui/components/pages/PoolPage/UserStats/UserStat';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useAssets } from '@ui/hooks/useAssets';
import { useBorrowAPYs } from '@ui/hooks/useBorrowAPYs';
import { useColors } from '@ui/hooks/useColors';
import { useRewards } from '@ui/hooks/useRewards';
import { useTotalSupplyAPYs } from '@ui/hooks/useTotalSupplyAPYs';
import type { PoolData } from '@ui/types/TokensDataMap';
import { smallFormatter, smallUsdFormatter, tokenFormatter } from '@ui/utils/bigUtils';
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

  const { data: assetInfos } = useAssets([poolData.chainId]);
  const { data: allRewards } = useRewards({
    chainId: poolData.chainId,
    poolId: poolData.id.toString(),
  });

  const { data: totalSupplyApyPerAsset } = useTotalSupplyAPYs(
    poolData.assets,
    poolData.chainId,
    allRewards,
    assetInfos
  );

  const { data: borrowApyPerAsset } = useBorrowAPYs(poolData.assets, poolData.chainId);

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

  const totalBorrowApy = useMemo(() => {
    if (borrowApyPerAsset) {
      if (poolData.totalBorrowBalanceNative === 0)
        return { estimatedPerAsset: [], estimatedUsd: 0, totalApy: 0, totalBorrowed: 0 };

      let _totalApy = 0;
      const _estimatedPerAsset: {
        apy: number;
        borrowed: string;
        estimated: number;
        symbol: string;
        underlying: string;
      }[] = [];

      poolData.assets.map((asset) => {
        _totalApy +=
          (borrowApyPerAsset[asset.cToken] * asset.borrowBalanceNative) /
          poolData.totalBorrowBalanceNative;

        if (asset.borrowBalanceNative !== 0) {
          const borrowedNum = parseFloat(
            utils.formatUnits(asset.borrowBalance, asset.underlyingDecimals.toNumber())
          );
          _estimatedPerAsset.push({
            apy: borrowApyPerAsset[asset.cToken] * 100,
            borrowed: smallFormatter(borrowedNum),
            estimated: borrowApyPerAsset[asset.cToken] * borrowedNum,
            symbol: asset.underlyingSymbol,
            underlying: asset.underlyingToken,
          });
        }
      });

      const _estimatedUsd = poolData.totalBorrowBalanceFiat * _totalApy;

      return {
        estimatedPerAsset: _estimatedPerAsset,
        estimatedUsd: _estimatedUsd,
        totalApy: _totalApy * 100,
        totalBorrowed: poolData.totalBorrowBalanceFiat,
      };
    }

    return undefined;
  }, [
    poolData.assets,
    poolData.totalBorrowBalanceNative,
    poolData.totalBorrowBalanceFiat,
    borrowApyPerAsset,
  ]);

  const { cCard } = useColors();

  return (
    <Grid gap={4} templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} w="100%">
      <PopoverTooltip
        body={
          topSuppliedAssets.length > 0 && topSuppliedAssets[0].supplyBalanceFiat > 0 ? (
            <VStack alignItems="flex-start" spacing={0} width={'100%'}>
              <Text fontWeight="bold">Top supplied assets</Text>
              {topSuppliedAssets.slice(0, 3).map((asset, index) => (
                <Flex key={index}>
                  {asset.supplyBalanceFiat > 0 && (
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
                          {smallUsdFormatter(asset.supplyBalanceFiat)}
                        </Text>
                        <Text>
                          {tokenFormatter(
                            asset.supplyBalance,
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
        contentProps={{ p: 2, width: 'fit-content' }}
        visible={topSuppliedAssets.length > 0 && topSuppliedAssets[0].supplyBalanceFiat > 0}
      >
        <Flex height="100%">
          <UserStat
            label="Your Supply"
            value={poolData ? smallUsdFormatter(poolData.totalSupplyBalanceFiat, true) : undefined}
          />
        </Flex>
      </PopoverTooltip>

      <PopoverTooltip
        body={
          topBorrowedAssets.length > 0 && topBorrowedAssets[0].borrowBalanceFiat > 0 ? (
            <VStack alignItems="flex-start" spacing={0} width={'100%'}>
              <Text fontWeight="bold">Top borrowed assets</Text>
              {topBorrowedAssets.slice(0, 3).map((asset, index) => (
                <Flex key={index}>
                  {asset.borrowBalanceFiat > 0 && (
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
                          {smallUsdFormatter(asset.borrowBalanceFiat)}
                        </Text>
                        <Text>
                          {tokenFormatter(
                            asset.borrowBalance,
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
        contentProps={{ p: 2, width: 'fit-content' }}
        visible={topBorrowedAssets.length > 0 && topBorrowedAssets[0].borrowBalanceFiat > 0}
      >
        <Flex height="100%">
          <UserStat
            label="Your Borrow"
            value={poolData ? smallUsdFormatter(poolData?.totalBorrowBalanceFiat, true) : undefined}
          />
        </Flex>
      </PopoverTooltip>

      <PopoverTooltip
        body={
          <VStack alignItems="flex-start">
            <Text fontWeight="bold">Effective Supply APY</Text>
            <Text>
              The expected annual percentage yield(APY) on supplied assets received by this account,
              assuming the current variable interest rates on all supplied assets remains constant
            </Text>
            {totalSupplyApy && totalSupplyApy.estimatedPerAsset.length > 0 ? (
              <VStack pt={2} width="100%">
                <Divider bg={cCard.dividerColor} />

                <VStack alignItems="flex-start" pt={2} width="100%">
                  {totalSupplyApy.estimatedPerAsset.map((data) => {
                    return (
                      <HStack key={data.underlying}>
                        <TokenIcon address={data.underlying} chainId={poolData.chainId} size="sm" />
                        <Text whiteSpace="nowrap">
                          {data.supplied} {data.symbol} at {data.apy.toFixed(2)}% APY yield{' '}
                          <b>
                            {smallFormatter(data.estimated)} {data.symbol}/year
                          </b>
                        </Text>
                      </HStack>
                    );
                  })}
                  <Divider bg={cCard.borderColor} />
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
        <Flex height="100%">
          <UserStat
            label="Effective Supply APY"
            secondValue={
              totalSupplyApy ? '~ ' + smallUsdFormatter(totalSupplyApy.estimatedUsd) : ''
            }
            value={totalSupplyApy ? totalSupplyApy.totalApy.toFixed(2) + '%' : '-'}
          />
        </Flex>
      </PopoverTooltip>

      <PopoverTooltip
        body={
          <VStack alignItems="flex-start">
            <Text fontWeight="bold">Effective Borrow APY</Text>
            <Text>
              The expected annual percentage yield(APY) on borrowed assets received by this account,
              assuming the current variable interest rates on all borrowed assets remains constant
            </Text>
            {totalBorrowApy && totalBorrowApy.estimatedPerAsset.length > 0 ? (
              <VStack pt={2} width="100%">
                <Divider bg={cCard.dividerColor} />

                <VStack alignItems="flex-start" pt={2} width="100%">
                  {totalBorrowApy.estimatedPerAsset.map((data) => {
                    return (
                      <HStack key={data.underlying}>
                        <TokenIcon address={data.underlying} chainId={poolData.chainId} size="sm" />
                        <Text whiteSpace="nowrap">
                          {data.borrowed} {data.symbol} at {data.apy.toFixed(2)}% APY yield{' '}
                          <b>
                            {smallFormatter(data.estimated)} {data.symbol}/year
                          </b>
                        </Text>
                      </HStack>
                    );
                  })}
                  <Divider bg={cCard.borderColor} />
                  <HStack alignSelf="self-end">
                    <Text whiteSpace="nowrap">
                      {smallFormatter(totalBorrowApy.totalBorrowed)} USD at{' '}
                      {totalBorrowApy.totalApy.toFixed(2)}% APY yield{' '}
                      <b>{smallFormatter(totalBorrowApy.estimatedUsd)} USD/year</b>
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
            ) : null}
          </VStack>
        }
        contentProps={{ minW: { base: '300px', sm: '350px' }, p: 2 }}
      >
        <Flex height="100%">
          <UserStat
            label="Effective Borrow APY"
            secondValue={
              totalBorrowApy ? '~ ' + smallUsdFormatter(totalBorrowApy.estimatedUsd) : ''
            }
            value={totalBorrowApy ? totalBorrowApy.totalApy.toFixed(2) + '%' : '-'}
          />
        </Flex>
      </PopoverTooltip>
    </Grid>
  );
};
