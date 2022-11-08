import { CheckIcon, CopyIcon } from '@chakra-ui/icons';
import {
  Button,
  Grid,
  GridItem,
  HStack,
  Link,
  Skeleton,
  Text,
  useClipboard,
} from '@chakra-ui/react';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import { utils } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { MidasBox } from '@ui/components/shared/Box';
import { Center, Column, Row } from '@ui/components/shared/Flex';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useExtraPoolInfo } from '@ui/hooks/fuse/useExtraPoolInfo';
import { useColors } from '@ui/hooks/useColors';
import { MarketData, PoolData } from '@ui/types/TokensDataMap';
import { midUsdFormatter } from '@ui/utils/bigUtils';
import { getScanUrlByChainId } from '@ui/utils/networkData';
import { shortAddress } from '@ui/utils/shortAddress';

const PoolDetails = ({ data: poolData }: { data?: PoolData | null }) => {
  const { assets, totalSuppliedFiat, totalBorrowedFiat, totalAvailableLiquidityFiat, comptroller } =
    poolData || {
      assets: [] as Array<MarketData>,
      totalSuppliedFiat: 0,
      totalBorrowedFiat: 0,
      totalAvailableLiquidityFiat: 0,
      comptroller: '',
    };

  const { cCard } = useColors();
  const router = useRouter();
  const poolId = router.query.poolId as string;
  const { data } = useExtraPoolInfo(poolData?.comptroller, poolData?.chainId);

  const [copiedText, setCopiedText] = useState<string>('');
  const { hasCopied, onCopy } = useClipboard(copiedText);
  const { setGlobalLoading, currentSdk } = useMultiMidas();
  const addRecentTransaction = useAddRecentTransaction();
  const scanUrl = useMemo(
    () => poolData?.chainId && getScanUrlByChainId(poolData.chainId),
    [poolData?.chainId]
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const acceptOwnership = useCallback(async () => {
    if (!comptroller || !currentSdk) return;
    setIsLoading(true);
    const unitroller = currentSdk.createUnitroller(comptroller);
    const tx = await unitroller._acceptAdmin();
    addRecentTransaction({ hash: tx.hash, description: 'Accept ownership' });
    await tx.wait();
    setIsLoading(false);

    await queryClient.refetchQueries();
  }, [comptroller, currentSdk, queryClient, addRecentTransaction]);

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
    <MidasBox height="auto" width="100%">
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        height="100%"
        width="100%"
      >
        <Row
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          width="100%"
          px={4}
          height="60px"
          flexShrink={0}
        >
          <Text variant="mdText" fontWeight="bold">{`Pool Details`}</Text>

          {data?.isPowerfulAdmin ? (
            <Center
              px={2}
              fontWeight="bold"
              cursor="pointer"
              onClick={() => {
                setGlobalLoading(true);
                router.push(`/${poolData?.chainId}/pool/${poolId}/edit`);
              }}
            >
              Edit
            </Center>
          ) : data?.isPendingAdmin ? (
            <Button onClick={acceptOwnership} isLoading={isLoading} isDisabled={isLoading}>
              Accept Ownership
            </Button>
          ) : null}
        </Row>

        {poolData ? (
          <Grid
            templateColumns={{
              base: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            }}
            width="100%"
            gridArea={{ borderTopWidth: 1, borderColor: 'red' }}
          >
            <HStack px={4} pt={4} pb={3} borderTopWidth={1} borderColor={cCard.dividerColor}>
              <Text variant="smText">Total Supplied</Text>
              <Text variant="smText" fontWeight="bold">
                {midUsdFormatter(totalSuppliedFiat)}
              </Text>
            </HStack>
            <HStack px={4} pt={4} pb={3} borderTopWidth={1} borderColor={cCard.dividerColor}>
              <Text variant="smText">Total Borrowed</Text>
              <Text variant="smText" fontWeight="bold">
                {midUsdFormatter(totalBorrowedFiat)}
              </Text>
            </HStack>
            <HStack px={4} pt={4} pb={3} borderTopWidth={1} borderColor={cCard.dividerColor}>
              <Text variant="smText">Available Liquidity</Text>
              <Text variant="smText" fontWeight="bold">
                {midUsdFormatter(totalAvailableLiquidityFiat)}
              </Text>
            </HStack>
            <HStack px={4} pt={4} pb={3} borderTopWidth={1} borderColor={cCard.dividerColor}>
              <Text variant="smText">Pool Utilization</Text>
              <Text variant="smText" fontWeight="bold">
                {totalSuppliedFiat.toString() === '0'
                  ? '0%'
                  : poolData.utilization.toFixed(2) + '%'}
              </Text>
            </HStack>

            <HStack px={4} pt={4} pb={3} borderTopWidth={1} borderColor={cCard.dividerColor}>
              <Text variant="smText">Upgradeable</Text>
              <Text variant="smText" fontWeight="bold">
                {data ? (data.upgradeable ? 'Yes' : 'No') : '?'}
              </Text>
            </HStack>
            <HStack px={4} pt={4} pb={3} borderTopWidth={1} borderColor={cCard.dividerColor}>
              <Text variant="smText">Admin</Text>
              {data?.admin ? (
                <HStack>
                  <SimpleTooltip label={`${scanUrl}/address/${data.admin}`}>
                    <Button
                      minWidth={6}
                      m={0}
                      p={0}
                      variant="_link"
                      as={Link}
                      href={`${scanUrl}/address/${data.admin}`}
                      isExternal
                      fontSize={{ base: 14, md: 16 }}
                      height="auto"
                    >
                      {shortAddress(data.admin, 6, 4)}
                    </Button>
                  </SimpleTooltip>

                  <Button
                    variant="_link"
                    minW={0}
                    mt="-8px !important"
                    p={0}
                    onClick={() => setCopiedText(data.admin)}
                    fontSize={18}
                    height="auto"
                  >
                    {copiedText === data.admin ? (
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
            <HStack px={4} pt={4} pb={3} borderTopWidth={1} borderColor={cCard.dividerColor}>
              <Text variant="smText">Platform Fee</Text>
              <Text variant="smText" fontWeight="bold">
                {assets.length > 0
                  ? Number(utils.formatUnits(assets[0].fuseFee, 16)).toPrecision(2) + '%'
                  : '10%'}
              </Text>
            </HStack>
            <HStack px={4} pt={4} pb={3} borderTopWidth={1} borderColor={cCard.dividerColor}>
              <Text variant="smText">Average Admin Fee</Text>
              <Text variant="smText" fontWeight="bold">
                {assets
                  .reduce(
                    (a, b, _, { length }) => a + Number(utils.formatUnits(b.adminFee, 16)) / length,
                    0
                  )
                  .toFixed(1) + '%'}
              </Text>
            </HStack>

            <HStack px={4} pt={4} pb={3} borderTopWidth={1} borderColor={cCard.dividerColor}>
              <Text variant="smText">Close Factor</Text>
              <Text variant="smText" fontWeight="bold">
                {data?.closeFactor
                  ? data.closeFactor.div(parseUnits('1', 16)).toNumber() + '%'
                  : '?%'}
              </Text>
            </HStack>
            <HStack px={4} pt={4} pb={3} borderTopWidth={1} borderColor={cCard.dividerColor}>
              <Text variant="smText">Liquidation Incentive</Text>
              <Text variant="smText" fontWeight="bold">
                {data?.liquidationIncentive
                  ? data.liquidationIncentive.div(parseUnits('1', 16)).toNumber() - 100 + '%'
                  : '?%'}
              </Text>
            </HStack>

            <HStack px={4} pt={4} pb={3} borderTopWidth={1} borderColor={cCard.dividerColor}>
              <Text variant="smText">Oracle</Text>
              <Text variant="smText" fontWeight="bold">
                {data ? data.oracle : '?'}
              </Text>
            </HStack>

            <HStack px={4} pt={4} pb={3} borderTopWidth={1} borderColor={cCard.dividerColor}>
              <Text variant="smText">Whitelist</Text>
              <Text variant="smText" fontWeight="bold">
                {data ? (data.enforceWhitelist ? 'Yes' : 'No') : '?'}
              </Text>
            </HStack>
            <GridItem colSpan={{ base: 1, sm: 2, md: 2, lg: 4 }}>
              <HStack
                aria-colspan={4}
                px={4}
                pt={4}
                pb={3}
                wrap="wrap"
                borderTopWidth={1}
                borderColor={cCard.dividerColor}
              >
                <Text variant="smText">Pool Address:</Text>
                <HStack>
                  <SimpleTooltip label={`${scanUrl}/address/${comptroller}`}>
                    <Button
                      minWidth={6}
                      m={0}
                      p={0}
                      variant="_link"
                      as={Link}
                      href={`${scanUrl}/address/${comptroller}`}
                      isExternal
                      fontSize={{ base: 14, md: 16 }}
                      height="auto"
                    >
                      {shortAddress(comptroller, 6, 4)}
                    </Button>
                  </SimpleTooltip>
                  <Button
                    variant="_link"
                    minW={0}
                    mt="-8px !important"
                    p={0}
                    onClick={() => setCopiedText(comptroller)}
                    fontSize={18}
                    height="auto"
                  >
                    {copiedText === comptroller ? (
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
              </HStack>
            </GridItem>
          </Grid>
        ) : (
          <Column
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            height="100%"
            width="100%"
            pb={1}
          >
            <Skeleton width="100%" height={200}></Skeleton>
          </Column>
        )}
      </Column>
    </MidasBox>
  );
};

export default PoolDetails;
