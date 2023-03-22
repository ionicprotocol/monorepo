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
import type { Row } from '@tanstack/react-table';
import { useMemo } from 'react';

import type { PoolRowData } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/index';
import ClaimPoolRewardsButton from '@ui/components/shared/ClaimPoolRewardsButton';
import { ClipboardValueIconButton } from '@ui/components/shared/ClipboardValue';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { usePoolDetails } from '@ui/hooks/fuse/usePoolDetails';
import { useRewardTokensOfPool } from '@ui/hooks/rewards/useRewardTokensOfPool';
import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';
import type { PoolData } from '@ui/types/TokensDataMap';
import { smallUsdFormatter } from '@ui/utils/bigUtils';
import { getBlockTimePerMinuteByChainId, getScanUrlByChainId } from '@ui/utils/networkData';
import { shortAddress } from '@ui/utils/shortAddress';

export const AdditionalInfo = ({ row }: { row: Row<PoolRowData> }) => {
  const pool: PoolData = row.original.poolName;
  const { getSdk, address } = useMultiMidas();
  const { data: usdPrices } = useAllUsdPrices();
  const usdPrice = useMemo(() => {
    if (usdPrices && usdPrices[pool.chainId.toString()]) {
      return usdPrices[pool.chainId.toString()].value;
    } else {
      return undefined;
    }
  }, [usdPrices, pool.chainId]);
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
        alignItems="stretch"
        gap={4}
        templateColumns={{
          base: 'repeat(1, 1fr)',
          lg: 'repeat(2, 1fr)',
        }}
        w="100%"
      >
        <VStack ml={{ base: 0, lg: 24 }} spacing={{ base: 4, lg: 8 }}>
          <Grid
            alignItems="flex-start"
            gap={4}
            templateColumns={{
              base: 'repeat(1, 1fr)',
              lg: 'repeat(2, 1fr)',
            }}
            w="100%"
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
                  <Text fontWeight="bold" size="md" textAlign="center">
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
                  <Text fontWeight="bold" size="md" textAlign="center">
                    -
                  </Text>
                </SimpleTooltip>
              )}
            </VStack>
          </Grid>
          <Grid
            alignItems="flex-start"
            gap={4}
            templateColumns={{
              base: 'repeat(1, 1fr)',
              lg: 'repeat(2, 1fr)',
            }}
            w="100%"
          >
            {rewardTokens.length > 0 && (
              <VStack>
                <Text mr={4} size="md" textAlign="center">
                  Offering Rewards
                </Text>
                <AvatarGroup max={30} size="sm">
                  {rewardTokens.map((token, i) => (
                    <TokenIcon address={token} chainId={pool.chainId} key={i} />
                  ))}
                </AvatarGroup>
              </VStack>
            )}
            <ClaimPoolRewardsButton poolAddress={pool.comptroller} poolChainId={pool.chainId} />
          </Grid>
        </VStack>
        <VStack>
          <Grid
            gap={2}
            templateColumns={{
              base: 'repeat(13, 1fr)',
              lg: 'repeat(13, 1fr)',
            }}
            w="100%"
          >
            <GridItem alignSelf="center" colSpan={6} justifyContent="flex-end">
              <Text size="md" textAlign="end">
                Most Supplied Asset
              </Text>
            </GridItem>
            <GridItem colSpan={1} textAlign="center">
              {poolDetails?.mostSuppliedAsset ? (
                <TokenIcon
                  address={poolDetails.mostSuppliedAsset.underlyingToken}
                  chainId={pool.chainId}
                  height={35}
                  width={35}
                />
              ) : (
                <Text>-</Text>
              )}
            </GridItem>
            <GridItem alignSelf="center" colSpan={6}>
              <Text size="md" textAlign="left">
                {poolDetails?.mostSuppliedAsset &&
                  usdPrice &&
                  smallUsdFormatter(poolDetails.mostSuppliedAsset.totalSupplyNative * usdPrice)}
              </Text>
            </GridItem>
          </Grid>
          <Grid
            gap={2}
            templateColumns={{
              base: 'repeat(13, 1fr)',
              lg: 'repeat(13, 1fr)',
            }}
            w="100%"
          >
            <GridItem alignSelf="center" colSpan={6} justifyContent="flex-end">
              <Text size="md" textAlign="end">
                Top Lending APY
              </Text>
            </GridItem>
            <GridItem colSpan={1} textAlign="center">
              {poolDetails?.topLendingAPYAsset ? (
                <TokenIcon
                  address={poolDetails.topLendingAPYAsset.underlyingToken}
                  chainId={pool.chainId}
                  height={35}
                  width={35}
                />
              ) : (
                <Text>-</Text>
              )}
            </GridItem>
            <GridItem alignSelf="center" colSpan={6}>
              <Text size="md" textAlign="left">
                {topLendingApy && `${topLendingApy}% APY`}
              </Text>
            </GridItem>
          </Grid>
          <Grid
            gap={2}
            templateColumns={{
              base: 'repeat(13, 1fr)',
              lg: 'repeat(13, 1fr)',
            }}
            w="100%"
          >
            <GridItem alignSelf="center" colSpan={6} justifyContent="flex-end">
              <Text size="md" textAlign="end">
                Top Stable Borrow APR
              </Text>
            </GridItem>
            <GridItem colSpan={1} textAlign="center">
              {poolDetails?.topBorrowAPRAsset ? (
                <TokenIcon
                  address={poolDetails.topBorrowAPRAsset.underlyingToken}
                  chainId={pool.chainId}
                  height={35}
                  width={35}
                />
              ) : (
                <Text>-</Text>
              )}
            </GridItem>
            <GridItem alignSelf="center" colSpan={6}>
              <Text size="md" textAlign="left">
                {topBorrowApr && `${topBorrowApr}% APR`}
              </Text>
            </GridItem>
          </Grid>
          <Grid
            gap={4}
            py={2}
            templateColumns={{
              base: 'repeat(13, 1fr)',
              lg: 'repeat(13, 1fr)',
            }}
            w="100%"
          >
            <GridItem alignSelf="center" colSpan={6} justifyContent="flex-end">
              <Text size="md" textAlign="end">
                Pool Address
              </Text>
            </GridItem>
            <GridItem colSpan={7} textAlign="center">
              {pool.comptroller ? (
                <HStack>
                  <SimpleTooltip label={`${scanUrl}/address/${pool.comptroller}`}>
                    <Button
                      as={Link}
                      fontSize={{ base: 14, md: 16 }}
                      height="auto"
                      href={`${scanUrl}/address/${pool.comptroller}`}
                      isExternal
                      m={0}
                      minWidth={6}
                      p={0}
                      variant="_link"
                    >
                      {shortAddress(pool.comptroller, 6, 4)}
                    </Button>
                  </SimpleTooltip>
                  <ClipboardValueIconButton value={pool.comptroller} />
                </HStack>
              ) : (
                <Text fontWeight="bold" size="md">
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
