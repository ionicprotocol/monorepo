import { CheckIcon, CopyIcon } from '@chakra-ui/icons';
import {
  AvatarGroup,
  Box,
  Button,
  Grid,
  HStack,
  Link,
  Spinner,
  Text,
  useClipboard,
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
  const { getSdk } = useMultiMidas();
  const cgId = useCgId(pool.chainId);
  const { data: usdPrice } = useUSDPrice(cgId);
  const rewardTokens = useRewardTokensOfPool(pool.comptroller);
  const poolDetails = usePoolDetails(pool.assets);
  const sdk = getSdk(pool.chainId.toString());
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

  const [copiedText, setCopiedText] = useState<string>('');
  const { hasCopied, onCopy } = useClipboard(copiedText);

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
      <ClaimPoolRewardsButton poolAddress={pool.comptroller} />
      <Grid
        templateColumns={{
          base: 'repeat(1, 1fr)',
          lg: 'repeat(2, 1fr)',
        }}
        w="100%"
        gap={4}
        alignItems="flex-end"
      >
        <Box
          height="200px"
          width="100%"
          overflow="hidden"
          className="hide-bottom-tooltip"
          flexShrink={0}
        >
          <Text variant="smText" textAlign="center">
            Your Borrow Balance
          </Text>

          {usdPrice ? (
            <SimpleTooltip
              label={(pool.totalBorrowBalanceNative * usdPrice).toString()}
              isDisabled={pool.totalBorrowBalanceNative * usdPrice === 0}
            >
              <Text variant="smText" textAlign="center">
                {smallUsdFormatter(pool.totalBorrowBalanceNative * usdPrice)}
                {pool.totalBorrowBalanceNative * usdPrice > 0 &&
                  pool.totalBorrowBalanceNative * usdPrice < 0.01 &&
                  '+'}
              </Text>
            </SimpleTooltip>
          ) : (
            <Spinner />
          )}

          <Text variant="smText" textAlign="center">
            Your Supply Balance
          </Text>

          {usdPrice ? (
            <SimpleTooltip
              label={(pool.totalSupplyBalanceNative * usdPrice).toString()}
              isDisabled={pool.totalSupplyBalanceNative * usdPrice === 0}
            >
              <Text variant="smText" textAlign="center">
                {smallUsdFormatter(pool.totalSupplyBalanceNative * usdPrice)}
                {pool.totalSupplyBalanceNative * usdPrice > 0 &&
                  pool.totalSupplyBalanceNative * usdPrice < 0.01 &&
                  '+'}
              </Text>
            </SimpleTooltip>
          ) : (
            <Spinner />
          )}
          {rewardTokens.length > 0 && (
            <>
              <Text variant="smText" textAlign="center" mr={4}>
                Rewards:
              </Text>
              <AvatarGroup size="sm" max={30}>
                {rewardTokens.map((token, i) => (
                  <CTokenIcon key={i} address={token} chainId={pool.chainId} />
                ))}
              </AvatarGroup>
            </>
          )}

          <Text variant="smText" textAlign="center">
            Most Supplied Asset
          </Text>

          {poolDetails?.mostSuppliedAsset && (
            <CTokenIcon
              address={poolDetails.mostSuppliedAsset.underlyingToken}
              chainId={pool.chainId}
              width={35}
              height={35}
            />
          )}

          <Text variant="smText" textAlign="center">
            {poolDetails?.mostSuppliedAsset &&
              usdPrice &&
              smallUsdFormatter(poolDetails.mostSuppliedAsset.totalSupplyNative * usdPrice)}
          </Text>

          <Text variant="smText" textAlign="center">
            Top Lending APY
          </Text>

          {poolDetails?.topLendingAPYAsset && (
            <CTokenIcon
              address={poolDetails.topLendingAPYAsset.underlyingToken}
              chainId={pool.chainId}
              width={35}
              height={35}
            />
          )}

          <Text variant="smText" textAlign="center">
            {topLendingApy}% APY
          </Text>

          <Text variant="smText">Top Stable Borrow APR</Text>

          {poolDetails?.topBorrowAPRAsset && (
            <CTokenIcon
              address={poolDetails.topBorrowAPRAsset.underlyingToken}
              chainId={pool.chainId}
              width={35}
              height={35}
            />
          )}

          <Text variant="smText" textAlign="center">
            {topBorrowApr}% APR
          </Text>

          <HStack px={4} pt={4} pb={3}>
            <Text variant="smText">Pool Address</Text>
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
          </HStack>
        </Box>
      </Grid>
    </Box>
  );
};
