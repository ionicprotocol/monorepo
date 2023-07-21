import { Box, Divider, Flex, Grid, HStack, Text, VStack } from '@chakra-ui/react';
import { utils } from 'ethers';
import { useMemo } from 'react';

import { UserStat } from '@ui/components/pages/PoolPage/UserStats/UserStat';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import type { FundedAsset } from '@ui/hooks/useAllFundedInfo';
import { useColors } from '@ui/hooks/useColors';
import { smallFormatter, smallUsdFormatter, tokenFormatter } from '@ui/utils/bigUtils';
import { sortTopUserSuppliedAssets } from '@ui/utils/sorts';

export const UserStats = ({
  assets,
  totalSupplyApyPerAsset,
  totalSupplyBalanceNative,
  totalSupplyBalanceFiat
}: {
  assets: FundedAsset[];
  totalSupplyApyPerAsset: { [market: string]: number };
  totalSupplyBalanceFiat: number;
  totalSupplyBalanceNative: number;
}) => {
  const [topSuppliedAssets] = useMemo(() => {
    if (assets.length > 0) {
      return [sortTopUserSuppliedAssets(assets)];
    } else {
      return [[]];
    }
  }, [assets]);

  const totalSupplyApy = useMemo(() => {
    if (totalSupplyApyPerAsset) {
      if (totalSupplyBalanceNative === 0)
        return { estimatedPerAsset: [], estimatedUsd: 0, totalApy: 0, totalSupplied: 0 };

      let _totalApy = 0;
      const _estimatedPerAsset: {
        apy: number;
        chainId: number;
        estimated: number;
        supplied: string;
        symbol: string;
        underlying: string;
      }[] = [];

      assets.map((asset) => {
        _totalApy +=
          (totalSupplyApyPerAsset[asset.cToken] * asset.supplyBalanceNative) /
          totalSupplyBalanceNative;

        if (asset.supplyBalanceNative !== 0) {
          const suppliedNum = parseFloat(
            utils.formatUnits(asset.supplyBalance, asset.underlyingDecimals.toNumber())
          );

          _estimatedPerAsset.push({
            apy: totalSupplyApyPerAsset[asset.cToken] * 100,
            chainId: Number(asset.chainId),
            estimated: totalSupplyApyPerAsset[asset.cToken] * suppliedNum,
            supplied: smallFormatter(suppliedNum),
            symbol: asset.underlyingSymbol,
            underlying: asset.underlyingToken
          });
        }
      });

      const _estimatedUsd = totalSupplyBalanceFiat * _totalApy;

      return {
        estimatedPerAsset: _estimatedPerAsset,
        estimatedUsd: _estimatedUsd,
        totalApy: _totalApy * 100,
        totalSupplied: totalSupplyBalanceFiat
      };
    }

    return undefined;
  }, [assets, totalSupplyBalanceNative, totalSupplyBalanceFiat, totalSupplyApyPerAsset]);

  const { cCard } = useColors();

  return (
    <Grid gap={4} templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)' }} w="100%">
      <PopoverTooltip
        body={
          topSuppliedAssets.length > 0 && topSuppliedAssets[0].supplyBalanceFiat > 0 ? (
            <VStack alignItems="flex-start" spacing={0} width={'100%'}>
              <Text fontWeight="bold">Top supplied assets</Text>
              {topSuppliedAssets.slice(0, 3).map((asset, index) => (
                <Flex key={index}>
                  {asset.supplyBalanceFiat > 0 && (
                    <HStack mt={1}>
                      <TokenIcon
                        address={asset.underlyingToken}
                        chainId={Number(asset.chainId)}
                        size="md"
                      />
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
          ) : null
        }
        contentProps={{ p: 2, width: 'fit-content' }}
        visible={topSuppliedAssets.length > 0 && topSuppliedAssets[0].supplyBalanceFiat > 0}
      >
        <Flex height="100%">
          <UserStat label="Your Supply" value={smallUsdFormatter(totalSupplyBalanceFiat, true)} />
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
              <VStack pt={2}>
                <Divider bg={cCard.dividerColor} />

                <VStack alignItems="flex-start" pt={2}>
                  {totalSupplyApy.estimatedPerAsset.map((data, index) => {
                    return (
                      <HStack key={index}>
                        <TokenIcon address={data.underlying} chainId={data.chainId} size="sm" />
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
        contentProps={{ minW: { base: '300px', sm: '350px' }, p: 2 }}
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
    </Grid>
  );
};
