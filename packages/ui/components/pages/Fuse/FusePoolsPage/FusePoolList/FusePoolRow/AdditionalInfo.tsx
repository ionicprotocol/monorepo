import {
  AvatarGroup,
  Box,
  Button,
  Grid,
  GridItem,
  HStack,
  Link,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Row } from '@tanstack/react-table';
import { useMemo } from 'react';

import { PoolRowData } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/index';
import ClaimPoolRewardsButton from '@ui/components/shared/ClaimPoolRewardsButton';
import { ClipboardValueIconButton } from '@ui/components/shared/ClipboardValue';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { usePoolDetails } from '@ui/hooks/fuse/usePoolDetails';
import { useRewardTokensOfPool } from '@ui/hooks/rewards/useRewardTokensOfPool';
import { useNativePriceInUSD } from '@ui/hooks/useNativePriceInUSD';
import { PoolData } from '@ui/types/TokensDataMap';
import { smallUsdFormatter } from '@ui/utils/bigUtils';
import { getBlockTimePerMinuteByChainId, getScanUrlByChainId } from '@ui/utils/networkData';
import { shortAddress } from '@ui/utils/shortAddress';

export const AdditionalInfo = ({ row }: { row: Row<PoolRowData> }) => {
  const pool: PoolData = row.original.poolName;
  const { getSdk, address } = useMultiMidas();
  const { data: usdPrice } = useNativePriceInUSD(pool.chainId);
  const rewardTokens = useRewardTokensOfPool(pool.comptroller, pool.chainId);
  const poolDetails = usePoolDetails(pool.assets, pool.chainId);
  const sdk = useMemo(() => getSdk(pool.chainId), [getSdk, pool.chainId]);
  const scanUrl = useMemo(() => getScanUrlByChainId(pool.chainId), [pool.chainId]);

  const topLendingApy = useMemo(() => {
    if (sdk && poolDetails) {
      return sdk
        .ratePerBlockToAPY(
          poolDetails.topLendingAPYAsset.supplyRatePerBlock,
          getBlockTimePerMinuteByChainId(sdk.chainId)
        )
        .toFixed(2);
    }
  }, [sdk, poolDetails]);

  const topBorrowApr = useMemo(() => {
    if (sdk && poolDetails) {
      return sdk
        .ratePerBlockToAPY(
          poolDetails.topBorrowAPRAsset.borrowRatePerBlock,
          getBlockTimePerMinuteByChainId(sdk.chainId)
        )
        .toFixed(2);
    }
  }, [sdk, poolDetails]);

  return (
    <Box>
      <Grid
        templateColumns={{
          base: 'repeat(1, 1fr)',
          lg: 'repeat(2, 1fr)',
        }}
        w="100%"
        gap={4}
        alignItems="stretch"
      >
        <VStack spacing={{ base: 4, lg: 8 }} ml={{ base: 0, lg: 24 }}>
          <Grid
            templateColumns={{
              base: 'repeat(1, 1fr)',
              lg: 'repeat(2, 1fr)',
            }}
            w="100%"
            gap={4}
            alignItems="flex-start"
          >
            <VStack>
              <Text size="md" textAlign="center">
                Your Supply Balance
              </Text>
              {address ? (
                <SimpleTooltip label={`$${pool.totalSupplyBalanceFiat.toString()}`}>
                  <Text size="md" textAlign="center">
                    {smallUsdFormatter(pool.totalSupplyBalanceFiat)}
                    {pool.totalSupplyBalanceFiat > 0 && pool.totalSupplyBalanceFiat < 0.01 && '+'}
                  </Text>
                </SimpleTooltip>
              ) : (
                <SimpleTooltip label="Connect your wallet">
                  <Text size="md" fontWeight="bold" textAlign="center">
                    -
                  </Text>
                </SimpleTooltip>
              )}
            </VStack>
            <VStack>
              <Text size="md" textAlign="center">
                Your Borrow Balance
              </Text>
              {address ? (
                <SimpleTooltip label={`$${pool.totalBorrowBalanceFiat.toString()}`}>
                  <Text size="md" textAlign="center">
                    {smallUsdFormatter(pool.totalBorrowBalanceFiat)}
                    {pool.totalBorrowBalanceFiat > 0 && pool.totalBorrowBalanceFiat < 0.01 && '+'}
                  </Text>
                </SimpleTooltip>
              ) : (
                <SimpleTooltip label="Connect your wallet">
                  <Text size="md" fontWeight="bold" textAlign="center">
                    -
                  </Text>
                </SimpleTooltip>
              )}
            </VStack>
          </Grid>
          <Grid
            templateColumns={{
              base: 'repeat(1, 1fr)',
              lg: 'repeat(2, 1fr)',
            }}
            w="100%"
            gap={4}
            alignItems="flex-start"
          >
            {rewardTokens.length > 0 && (
              <VStack>
                <Text size="md" textAlign="center" mr={4}>
                  Offering Rewards
                </Text>
                <AvatarGroup size="sm" max={30}>
                  {rewardTokens.map((token, i) => (
                    <TokenIcon key={i} address={token} chainId={pool.chainId} />
                  ))}
                </AvatarGroup>
              </VStack>
            )}
            <ClaimPoolRewardsButton poolAddress={pool.comptroller} poolChainId={pool.chainId} />
          </Grid>
        </VStack>
        <VStack>
          <Grid
            templateColumns={{
              base: 'repeat(13, 1fr)',
              lg: 'repeat(13, 1fr)',
            }}
            w="100%"
            gap={2}
          >
            <GridItem justifyContent="flex-end" colSpan={6} alignSelf="center">
              <Text size="md" textAlign="end">
                Most Supplied Asset
              </Text>
            </GridItem>
            <GridItem colSpan={1} textAlign="center">
              {poolDetails?.mostSuppliedAsset ? (
                <TokenIcon
                  address={poolDetails.mostSuppliedAsset.underlyingToken}
                  chainId={pool.chainId}
                  width={35}
                  height={35}
                />
              ) : (
                <Text>-</Text>
              )}
            </GridItem>
            <GridItem colSpan={6} alignSelf="center">
              <Text size="md" textAlign="left">
                {poolDetails?.mostSuppliedAsset &&
                  usdPrice &&
                  smallUsdFormatter(poolDetails.mostSuppliedAsset.totalSupplyNative * usdPrice)}
              </Text>
            </GridItem>
          </Grid>
          <Grid
            templateColumns={{
              base: 'repeat(13, 1fr)',
              lg: 'repeat(13, 1fr)',
            }}
            w="100%"
            gap={2}
          >
            <GridItem justifyContent="flex-end" colSpan={6} alignSelf="center">
              <Text size="md" textAlign="end">
                Top Lending APY
              </Text>
            </GridItem>
            <GridItem colSpan={1} textAlign="center">
              {poolDetails?.topLendingAPYAsset ? (
                <TokenIcon
                  address={poolDetails.topLendingAPYAsset.underlyingToken}
                  chainId={pool.chainId}
                  width={35}
                  height={35}
                />
              ) : (
                <Text>-</Text>
              )}
            </GridItem>
            <GridItem colSpan={6} alignSelf="center">
              <Text size="md" textAlign="left">
                {topLendingApy && `${topLendingApy}% APY`}
              </Text>
            </GridItem>
          </Grid>
          <Grid
            templateColumns={{
              base: 'repeat(13, 1fr)',
              lg: 'repeat(13, 1fr)',
            }}
            w="100%"
            gap={2}
          >
            <GridItem justifyContent="flex-end" colSpan={6} alignSelf="center">
              <Text size="md" textAlign="end">
                Top Stable Borrow APR
              </Text>
            </GridItem>
            <GridItem colSpan={1} textAlign="center">
              {poolDetails?.topBorrowAPRAsset ? (
                <TokenIcon
                  address={poolDetails.topBorrowAPRAsset.underlyingToken}
                  chainId={pool.chainId}
                  width={35}
                  height={35}
                />
              ) : (
                <Text>-</Text>
              )}
            </GridItem>
            <GridItem colSpan={6} alignSelf="center">
              <Text size="md" textAlign="left">
                {topBorrowApr && `${topBorrowApr}% APR`}
              </Text>
            </GridItem>
          </Grid>
          <Grid
            templateColumns={{
              base: 'repeat(13, 1fr)',
              lg: 'repeat(13, 1fr)',
            }}
            w="100%"
            gap={4}
            py={2}
          >
            <GridItem justifyContent="flex-end" colSpan={6} alignSelf="center">
              <Text size="md" textAlign="end">
                Pool Address
              </Text>
            </GridItem>
            <GridItem colSpan={7} textAlign="center">
              {pool.comptroller ? (
                <HStack>
                  <SimpleTooltip label={`${scanUrl}/address/${pool.comptroller}`}>
                    <Button
                      minWidth={6}
                      m={0}
                      p={0}
                      variant="_link"
                      as={Link}
                      href={`${scanUrl}/address/${pool.comptroller}`}
                      isExternal
                      fontSize={{ base: 14, md: 16 }}
                      height="auto"
                    >
                      {shortAddress(pool.comptroller, 6, 4)}
                    </Button>
                  </SimpleTooltip>
                  <ClipboardValueIconButton value={pool.comptroller} />
                </HStack>
              ) : (
                <Text size="md" fontWeight="bold">
                  ?
                </Text>
              )}
            </GridItem>
          </Grid>
        </VStack>
      </Grid>
    </Box>
  );
};
