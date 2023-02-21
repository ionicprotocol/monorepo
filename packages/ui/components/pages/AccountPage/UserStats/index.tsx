import {
  Box,
  Divider,
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
import { utils } from 'ethers';
import { useMemo } from 'react';

import { UserStat } from '@ui/components/pages/PoolPage/UserStats/UserStat';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { FundedAsset } from '@ui/hooks/useAllFundedInfo';
import { useColors } from '@ui/hooks/useColors';
import {
  midUsdFormatter,
  smallFormatter,
  smallUsdFormatter,
  tokenFormatter,
} from '@ui/utils/bigUtils';
import { sortTopUserBorrowedAssets, sortTopUserSuppliedAssets } from '@ui/utils/sorts';

export const UserStats = ({
  assets,
  totalSupplyApyPerAsset,
  borrowApyPerAsset,
}: {
  assets: FundedAsset[];
  totalSupplyApyPerAsset: { [market: string]: number };
  borrowApyPerAsset: { [market: string]: number };
}) => {
  const [
    topSuppliedAssets,
    topBorrowedAssets,
    totalSupplyBalanceNative,
    totalSupplyBalanceFiat,
    totalBorrowBalanceNative,
    totalBorrowBalanceFiat,
    chainId,
  ] = useMemo(() => {
    if (assets.length > 0) {
      return [
        sortTopUserSuppliedAssets(assets),
        sortTopUserBorrowedAssets(assets),
        assets[0].totalSupplyBalanceNative,
        assets[0].totalSupplyBalanceFiat,
        assets[0].totalBorrowBalanceNative,
        assets[0].totalBorrowBalanceFiat,
        Number(assets[0].chainId),
      ];
    } else {
      return [[], [], 0, 0, 0, 0, 0];
    }
  }, [assets]);

  const totalSupplyApy = useMemo(() => {
    if (totalSupplyApyPerAsset) {
      if (totalSupplyBalanceNative === 0)
        return { totalApy: 0, totalSupplied: 0, estimatedUsd: 0, estimatedPerAsset: [] };

      let _totalApy = 0;
      const _estimatedPerAsset: {
        underlying: string;
        symbol: string;
        supplied: string;
        estimated: number;
        apy: number;
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
            underlying: asset.underlyingToken,
            supplied: smallFormatter.format(suppliedNum),
            apy: totalSupplyApyPerAsset[asset.cToken] * 100,
            estimated: totalSupplyApyPerAsset[asset.cToken] * suppliedNum,
            symbol: asset.underlyingSymbol,
          });
        }
      });

      const _estimatedUsd = totalSupplyBalanceFiat * _totalApy;

      return {
        totalApy: _totalApy * 100,
        totalSupplied: totalSupplyBalanceFiat,
        estimatedUsd: _estimatedUsd,
        estimatedPerAsset: _estimatedPerAsset,
      };
    }

    return undefined;
  }, [assets, totalSupplyBalanceNative, totalSupplyBalanceFiat, totalSupplyApyPerAsset]);

  const totalBorrowApy = useMemo(() => {
    if (borrowApyPerAsset) {
      if (totalBorrowBalanceNative === 0)
        return { totalApy: 0, totalBorrowed: 0, estimatedUsd: 0, estimatedPerAsset: [] };

      let _totalApy = 0;
      const _estimatedPerAsset: {
        underlying: string;
        symbol: string;
        borrowed: string;
        estimated: number;
        apy: number;
      }[] = [];

      assets.map((asset) => {
        _totalApy +=
          (borrowApyPerAsset[asset.cToken] * asset.borrowBalanceNative) / totalBorrowBalanceNative;

        if (asset.borrowBalanceNative !== 0) {
          const borrowedNum = parseFloat(
            utils.formatUnits(asset.borrowBalance, asset.underlyingDecimals.toNumber())
          );
          _estimatedPerAsset.push({
            underlying: asset.underlyingToken,
            borrowed: smallFormatter.format(borrowedNum),
            apy: borrowApyPerAsset[asset.cToken] * 100,
            estimated: borrowApyPerAsset[asset.cToken] * borrowedNum,
            symbol: asset.underlyingSymbol,
          });
        }
      });

      const _estimatedUsd = totalBorrowBalanceFiat * _totalApy;

      return {
        totalApy: _totalApy * 100,
        totalBorrowed: totalBorrowBalanceFiat,
        estimatedUsd: _estimatedUsd,
        estimatedPerAsset: _estimatedPerAsset,
      };
    }

    return undefined;
  }, [assets, totalBorrowBalanceNative, totalBorrowBalanceFiat, borrowApyPerAsset]);

  const { cPage, cCard } = useColors();

  return (
    <Grid gap={4} templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} w="100%">
      <Popover trigger="hover">
        <PopoverTrigger>
          <Flex>
            <UserStat label="Your Supply" value={midUsdFormatter(totalSupplyBalanceFiat)} />
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
              <VStack alignItems="flex-start" spacing={0} width={'100%'}>
                <Text fontWeight="bold">Top supplied assets</Text>
                {topSuppliedAssets.slice(0, 3).map((asset, index) => (
                  <Flex key={index}>
                    {asset.supplyBalanceFiat > 0 && (
                      <HStack mt={1}>
                        <TokenIcon address={asset.underlyingToken} chainId={chainId} size="md" />
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
            <UserStat label="Your Borrow" value={midUsdFormatter(totalBorrowBalanceFiat)} />
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
              <VStack alignItems="flex-start" spacing={0} width={'100%'}>
                <Text fontWeight="bold">Top borrowed assets</Text>
                {topBorrowedAssets.slice(0, 3).map((asset, index) => (
                  <Flex key={index}>
                    {asset.borrowBalanceFiat > 0 && (
                      <HStack mt={1}>
                        <TokenIcon address={asset.underlyingToken} chainId={chainId} size="md" />
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
              secondValue={
                totalSupplyApy ? '~ ' + smallUsdFormatter(totalSupplyApy.estimatedUsd) : ''
              }
              value={totalSupplyApy ? totalSupplyApy.totalApy.toFixed(2) + '%' : '-'}
            />
          </Flex>
        </PopoverTrigger>
        <PopoverContent minW="350px" p={2} width="min-content">
          <PopoverArrow
            sx={{
              '--popper-arrow-shadow-color': cPage.primary.borderColor,
            }}
          />
          <PopoverBody>
            <VStack alignItems="flex-start">
              <Text fontWeight="bold">Effective Supply APY</Text>
              <Text>
                The expected annual percentage yield(APY) on supplied assets received by this
                account, assuming the current variable interest rates on all supplied assets remains
                constant
              </Text>
              {totalSupplyApy && totalSupplyApy.estimatedPerAsset.length > 0 ? (
                <VStack pt={2}>
                  <Divider bg={cCard.dividerColor} />

                  <VStack alignItems="flex-start" pt={2}>
                    {totalSupplyApy.estimatedPerAsset.map((data, index) => {
                      return (
                        <HStack key={index}>
                          <TokenIcon address={data.underlying} chainId={chainId} size="sm" />
                          <Text whiteSpace="nowrap">
                            {data.supplied} {data.symbol} at {data.apy.toFixed(2)}% APY yield{' '}
                            <b>
                              {smallFormatter.format(data.estimated)} {data.symbol}/year
                            </b>
                          </Text>
                        </HStack>
                      );
                    })}
                    <Divider bg={cCard.borderColor} />
                    <HStack alignSelf="self-end">
                      <Text whiteSpace="nowrap">
                        {smallFormatter.format(totalSupplyApy.totalSupplied)} USD at{' '}
                        {totalSupplyApy.totalApy.toFixed(2)}% APY yield{' '}
                        <b>{smallFormatter.format(totalSupplyApy.estimatedUsd)} USD/year</b>
                      </Text>
                    </HStack>
                  </VStack>
                </VStack>
              ) : null}
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Popover>
      <Popover trigger="hover">
        <PopoverTrigger>
          <Flex>
            <UserStat
              label="Effective Borrow APY"
              secondValue={
                totalBorrowApy ? '~ ' + smallUsdFormatter(totalBorrowApy.estimatedUsd) : ''
              }
              value={totalBorrowApy ? totalBorrowApy.totalApy.toFixed(2) + '%' : '-'}
            />
          </Flex>
        </PopoverTrigger>
        <PopoverContent minW="350px" p={2} width="min-content">
          <PopoverArrow
            sx={{
              '--popper-arrow-shadow-color': cPage.primary.borderColor,
            }}
          />
          <PopoverBody>
            <VStack alignItems="flex-start">
              <Text fontWeight="bold">Effective Borrow APY</Text>
              <Text>
                The expected annual percentage yield(APY) on borrowed assets received by this
                account, assuming the current variable interest rates on all borrowed assets remains
                constant
              </Text>
              {totalBorrowApy && totalBorrowApy.estimatedPerAsset.length > 0 ? (
                <VStack pt={2}>
                  <Divider bg={cCard.dividerColor} />

                  <VStack alignItems="flex-start" pt={2}>
                    {totalBorrowApy.estimatedPerAsset.map((data, index) => {
                      return (
                        <HStack key={index}>
                          <TokenIcon address={data.underlying} chainId={chainId} size="sm" />
                          <Text whiteSpace="nowrap">
                            {data.borrowed} {data.symbol} at {data.apy.toFixed(2)}% APY yield{' '}
                            <b>
                              {smallFormatter.format(data.estimated)} {data.symbol}/year
                            </b>
                          </Text>
                        </HStack>
                      );
                    })}
                    <Divider bg={cCard.borderColor} />
                    <HStack alignSelf="self-end">
                      <Text whiteSpace="nowrap">
                        {smallFormatter.format(totalBorrowApy.totalBorrowed)} USD at{' '}
                        {totalBorrowApy.totalApy.toFixed(2)}% APY yield{' '}
                        <b>{smallFormatter.format(totalBorrowApy.estimatedUsd)} USD/year</b>
                      </Text>
                    </HStack>
                  </VStack>
                </VStack>
              ) : null}
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Grid>
  );
};
