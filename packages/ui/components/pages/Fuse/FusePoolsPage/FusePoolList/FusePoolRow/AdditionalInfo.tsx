import { CheckIcon, CopyIcon } from '@chakra-ui/icons';
import {
  AvatarGroup,
  Box,
  Button,
  Grid,
  GridItem,
  HStack,
  Link,
  Spinner,
  Text,
  useClipboard,
  VStack,
} from '@chakra-ui/react';
import { FusePoolData } from '@midas-capital/types';
import { Row } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';

import { PoolRowData } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/index';
import ClaimPoolRewardsButton from '@ui/components/shared/ClaimPoolRewardsButton';
import { CTokenIcon } from '@ui/components/shared/CTokenIcon';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { usePoolDetails } from '@ui/hooks/fuse/usePoolDetails';
import { useRewardTokensOfPool } from '@ui/hooks/rewards/useRewardTokensOfPool';
import { useCgId } from '@ui/hooks/useChainConfig';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';
import { smallUsdFormatter } from '@ui/utils/bigUtils';
import { getBlockTimePerMinuteByChainId, getScanUrlByChainId } from '@ui/utils/networkData';
import { shortAddress } from '@ui/utils/shortAddress';

export const AdditionalInfo = ({ row }: { row: Row<PoolRowData> }) => {
  const pool: FusePoolData = row.original.poolName;
  const { getSdk, address } = useMultiMidas();
  const cgId = useCgId(pool.chainId);
  const { data: usdPrice } = useUSDPrice(cgId);
  const rewardTokens = useRewardTokensOfPool(pool.comptroller, pool.chainId);
  const poolDetails = usePoolDetails(pool.assets, pool.chainId);
  const sdk = useMemo(() => getSdk(pool.chainId), [getSdk, pool.chainId]);
  const scanUrl = useMemo(() => getScanUrlByChainId(pool.chainId), [pool.chainId]);
  const [copiedText, setCopiedText] = useState<string>('');
  const { hasCopied, onCopy } = useClipboard(copiedText);

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

  const supplyBalance = useMemo(() => {
    if (address && usdPrice) {
      return pool.totalSupplyBalanceNative * usdPrice;
    }
  }, [address, pool, usdPrice]);

  const borrowBalance = useMemo(() => {
    if (address && usdPrice) {
      return pool.totalBorrowBalanceNative * usdPrice;
    }
  }, [address, pool, usdPrice]);

  useEffect(() => {
    if (copiedText) {
      onCopy();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [copiedText]);

  useEffect(() => {
    if (!hasCopied) {
      setCopiedText('');
    }
  }, [hasCopied]);

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
              <Text variant="smText" textAlign="center">
                Your Supply Balance
              </Text>
              {supplyBalance !== undefined ? (
                <SimpleTooltip label={`$${supplyBalance.toString()}`}>
                  <Text variant="smText" textAlign="center">
                    {smallUsdFormatter(supplyBalance)}
                    {supplyBalance > 0 && supplyBalance < 0.01 && '+'}
                  </Text>
                </SimpleTooltip>
              ) : usdPrice ? (
                <SimpleTooltip label="Connect your wallet">
                  <Text variant="smText" fontWeight="bold" textAlign="center">
                    -
                  </Text>
                </SimpleTooltip>
              ) : (
                <Spinner />
              )}
            </VStack>
            <VStack>
              <Text variant="smText" textAlign="center">
                Your Borrow Balance
              </Text>
              {borrowBalance !== undefined ? (
                <SimpleTooltip label={`$${borrowBalance.toString()}`}>
                  <Text variant="smText" textAlign="center">
                    {smallUsdFormatter(borrowBalance)}
                    {borrowBalance > 0 && borrowBalance < 0.01 && '+'}
                  </Text>
                </SimpleTooltip>
              ) : usdPrice ? (
                <SimpleTooltip label="Connect your wallet">
                  <Text variant="smText" fontWeight="bold" textAlign="center">
                    -
                  </Text>
                </SimpleTooltip>
              ) : (
                <Spinner />
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
                <Text variant="smText" textAlign="center" mr={4}>
                  Offering Rewards
                </Text>
                <AvatarGroup size="sm" max={30}>
                  {rewardTokens.map((token, i) => (
                    <CTokenIcon key={i} address={token} chainId={pool.chainId} />
                  ))}
                </AvatarGroup>
              </VStack>
            )}
            <ClaimPoolRewardsButton poolAddress={pool.comptroller} />
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
              <Text variant="smText" textAlign="end">
                Most Supplied Asset
              </Text>
            </GridItem>
            <GridItem colSpan={1} textAlign="center">
              {poolDetails?.mostSuppliedAsset && (
                <CTokenIcon
                  address={poolDetails.mostSuppliedAsset.underlyingToken}
                  chainId={pool.chainId}
                  width={35}
                  height={35}
                />
              )}
            </GridItem>
            <GridItem colSpan={6} alignSelf="center">
              <Text variant="smText" textAlign="left">
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
              <Text variant="smText" textAlign="end">
                Top Lending APY
              </Text>
            </GridItem>
            <GridItem colSpan={1} textAlign="center">
              {poolDetails?.topLendingAPYAsset && (
                <CTokenIcon
                  address={poolDetails.topLendingAPYAsset.underlyingToken}
                  chainId={pool.chainId}
                  width={35}
                  height={35}
                />
              )}
            </GridItem>
            <GridItem colSpan={6} alignSelf="center">
              <Text variant="smText" textAlign="left">
                {topLendingApy}% APY
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
              <Text variant="smText" textAlign="end">
                Top Stable Borrow APR
              </Text>
            </GridItem>
            <GridItem colSpan={1} textAlign="center">
              {poolDetails?.topBorrowAPRAsset && (
                <CTokenIcon
                  address={poolDetails.topBorrowAPRAsset.underlyingToken}
                  chainId={pool.chainId}
                  width={35}
                  height={35}
                />
              )}
            </GridItem>
            <GridItem colSpan={6} alignSelf="center">
              <Text variant="smText" textAlign="left">
                {topBorrowApr}% APR
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
              <Text variant="smText" textAlign="end">
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

                  <Button
                    variant="_link"
                    minW={0}
                    mt="-8px !important"
                    p={0}
                    onClick={() => setCopiedText(pool.comptroller)}
                    fontSize={18}
                    height="auto"
                  >
                    {copiedText === pool.comptroller ? (
                      <SimpleTooltip label="Copied">
                        <CheckIcon />
                      </SimpleTooltip>
                    ) : (
                      <SimpleTooltip label="Click to copy">
                        <CopyIcon />
                      </SimpleTooltip>
                    )}
                  </Button>
                </HStack>
              ) : (
                <Text variant="smText" fontWeight="bold">
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
