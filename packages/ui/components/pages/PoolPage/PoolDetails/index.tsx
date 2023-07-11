import { ArrowBackIcon } from '@chakra-ui/icons';
import { Button, Grid, GridItem, HStack, Img, Link, Skeleton, Text } from '@chakra-ui/react';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import { utils } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';

import { ClipboardValueIconButton } from '@ui/components/shared/ClipboardValue';
import { Center, Column, Row } from '@ui/components/shared/Flex';
import { CardBox } from '@ui/components/shared/IonicBox';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useExtraPoolInfo } from '@ui/hooks/fuse/useExtraPoolInfo';
import { useChainConfig } from '@ui/hooks/useChainConfig';
import { useColors } from '@ui/hooks/useColors';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { smallUsdFormatter } from '@ui/utils/bigUtils';
import { getScanUrlByChainId } from '@ui/utils/networkData';
import { shortAddress } from '@ui/utils/shortAddress';

const PoolDetails = ({ chainId, poolId }: { chainId: string; poolId: string }) => {
  const { data: poolData, isLoading: isPoolDataLoading } = useFusePoolData(poolId, Number(chainId));
  const { cCard } = useColors();
  const router = useRouter();
  const { data } = useExtraPoolInfo(poolData?.comptroller, poolData?.chainId);

  const { setGlobalLoading, currentSdk } = useMultiIonic();
  const addRecentTransaction = useAddRecentTransaction();
  const scanUrl = useMemo(
    () => poolData?.chainId && getScanUrlByChainId(poolData.chainId),
    [poolData?.chainId]
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const chainConfig = useChainConfig(poolData?.chainId);

  const acceptOwnership = useCallback(async () => {
    if (!poolData?.comptroller || !currentSdk) return;
    setIsLoading(true);
    const unitroller = currentSdk.createUnitroller(poolData.comptroller);
    const tx = await unitroller._acceptAdmin();
    addRecentTransaction({ description: 'Accept ownership', hash: tx.hash });
    await tx.wait();
    setIsLoading(false);

    await queryClient.refetchQueries();
  }, [poolData?.comptroller, currentSdk, queryClient, addRecentTransaction]);

  return (
    <CardBox>
      <HStack spacing={4}>
        <ArrowBackIcon
          cursor="pointer"
          fontSize="2xl"
          fontWeight="extrabold"
          onClick={() => {
            setGlobalLoading(true);
            router.back();
          }}
        />
        {chainConfig ? (
          <Img
            alt={chainConfig.specificParams.metadata.name}
            borderRadius="50%"
            height="25px"
            minHeight="25px"
            minWidth="25px"
            src={chainConfig.specificParams.metadata.img}
            width="25px"
          />
        ) : null}
        <Skeleton isLoaded={!isPoolDataLoading} minW={'100px'}>
          <Text fontWeight="bold" size="2xl" textAlign="left">
            {poolData ? poolData.name : 'Pool'}
          </Text>
        </Skeleton>
      </HStack>
      <Column
        crossAxisAlignment="flex-start"
        height="100%"
        mainAxisAlignment="flex-start"
        width="100%"
      >
        <Row
          crossAxisAlignment="center"
          flexShrink={0}
          height="60px"
          mainAxisAlignment="space-between"
          px={4}
          width="100%"
        >
          <Text fontWeight="bold" size="md">{`Pool Details`}</Text>

          {data?.isPowerfulAdmin ? (
            <Center
              cursor="pointer"
              fontWeight="bold"
              onClick={() => {
                setGlobalLoading(true);
                router.push(`/${poolData?.chainId}/pool/${poolId}/edit`);
              }}
              px={2}
            >
              Edit
            </Center>
          ) : data?.isPendingAdmin ? (
            <Button isDisabled={isLoading} isLoading={isLoading} onClick={acceptOwnership}>
              Accept Ownership
            </Button>
          ) : null}
        </Row>

        {poolData ? (
          <Grid
            gridArea={{ borderColor: 'red', borderTopWidth: 1 }}
            templateColumns={{
              base: 'repeat(1, 1fr)',
              lg: 'repeat(4, 1fr)',
              md: 'repeat(2, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
            width="100%"
          >
            <HStack borderColor={cCard.dividerColor} borderTopWidth={1} pb={3} pt={4} px={4}>
              <Text size="md">Total Supplied</Text>
              <Text fontWeight="bold" size="md">
                {smallUsdFormatter(poolData?.totalSuppliedFiat, true)}
              </Text>
            </HStack>
            <HStack borderColor={cCard.dividerColor} borderTopWidth={1} pb={3} pt={4} px={4}>
              <Text size="md">Total Borrowed</Text>
              <Text fontWeight="bold" size="md">
                {smallUsdFormatter(poolData?.totalBorrowedFiat, true)}
              </Text>
            </HStack>
            <HStack borderColor={cCard.dividerColor} borderTopWidth={1} pb={3} pt={4} px={4}>
              <Text size="md">Available Liquidity</Text>
              <Text fontWeight="bold" size="md">
                {smallUsdFormatter(poolData?.totalAvailableLiquidityFiat, true)}
              </Text>
            </HStack>
            <HStack borderColor={cCard.dividerColor} borderTopWidth={1} pb={3} pt={4} px={4}>
              <Text size="md">Pool Utilization</Text>
              <Text fontWeight="bold" size="md">
                {poolData?.totalSuppliedFiat.toString() === '0'
                  ? '0%'
                  : poolData.utilization.toFixed(2) + '%'}
              </Text>
            </HStack>

            <HStack borderColor={cCard.dividerColor} borderTopWidth={1} pb={3} pt={4} px={4}>
              <Text size="md">Upgradeable</Text>
              <Text fontWeight="bold" size="md">
                {data ? (data.upgradeable ? 'Yes' : 'No') : '?'}
              </Text>
            </HStack>
            <HStack borderColor={cCard.dividerColor} borderTopWidth={1} pb={3} pt={4} px={4}>
              <Text size="md">Admin</Text>
              {data?.admin ? (
                <HStack>
                  <SimpleTooltip label={`${scanUrl}/address/${data.admin}`}>
                    <Button
                      as={Link}
                      fontSize={{ base: 14, md: 16 }}
                      height="auto"
                      href={`${scanUrl}/address/${data.admin}`}
                      isExternal
                      m={0}
                      minWidth={6}
                      p={0}
                      variant="_link"
                    >
                      {shortAddress(data.admin, 6, 4)}
                    </Button>
                  </SimpleTooltip>

                  <ClipboardValueIconButton value={data.admin} />
                </HStack>
              ) : (
                <Text fontWeight="bold" size="md">
                  ?
                </Text>
              )}
            </HStack>
            <HStack borderColor={cCard.dividerColor} borderTopWidth={1} pb={3} pt={4} px={4}>
              <Text size="md">Platform Fee</Text>
              <Text fontWeight="bold" size="md">
                {poolData?.assets.length > 0
                  ? Number(utils.formatUnits(poolData?.assets[0].fuseFee, 16)).toPrecision(2) + '%'
                  : '10%'}
              </Text>
            </HStack>
            <HStack borderColor={cCard.dividerColor} borderTopWidth={1} pb={3} pt={4} px={4}>
              <Text size="md">Average Admin Fee</Text>
              <Text fontWeight="bold" size="md">
                {poolData?.assets
                  .reduce(
                    (a, b, _, { length }) => a + Number(utils.formatUnits(b.adminFee, 16)) / length,
                    0
                  )
                  .toFixed(1) + '%'}
              </Text>
            </HStack>

            <HStack borderColor={cCard.dividerColor} borderTopWidth={1} pb={3} pt={4} px={4}>
              <Text size="md">Close Factor</Text>
              <Text fontWeight="bold" size="md">
                {data?.closeFactor
                  ? data.closeFactor.div(parseUnits('1', 16)).toNumber() + '%'
                  : '?%'}
              </Text>
            </HStack>
            <HStack borderColor={cCard.dividerColor} borderTopWidth={1} pb={3} pt={4} px={4}>
              <Text size="md">Liquidation Incentive</Text>
              <Text fontWeight="bold" size="md">
                {data?.liquidationIncentive
                  ? data.liquidationIncentive.div(parseUnits('1', 16)).toNumber() - 100 + '%'
                  : '?%'}
              </Text>
            </HStack>

            <HStack borderColor={cCard.dividerColor} borderTopWidth={1} pb={3} pt={4} px={4}>
              <Text size="md">Oracle</Text>
              <Text fontWeight="bold" size="md">
                {data ? data.oracle : '?'}
              </Text>
            </HStack>

            <HStack borderColor={cCard.dividerColor} borderTopWidth={1} pb={3} pt={4} px={4}>
              <Text size="md">Whitelist</Text>
              <Text fontWeight="bold" size="md">
                {data ? (data.enforceWhitelist ? 'Yes' : 'No') : '?'}
              </Text>
            </HStack>
            <GridItem colSpan={{ base: 1, lg: 4, md: 2, sm: 2 }}>
              <HStack
                aria-colspan={4}
                borderColor={cCard.dividerColor}
                borderTopWidth={1}
                pb={3}
                pt={4}
                px={4}
                wrap="wrap"
              >
                <Text size="md">Pool Address:</Text>
                <HStack>
                  <SimpleTooltip label={`${scanUrl}/address/${poolData?.comptroller}`}>
                    <Button
                      as={Link}
                      fontSize={{ base: 14, md: 16 }}
                      height="auto"
                      href={`${scanUrl}/address/${poolData?.comptroller}`}
                      isExternal
                      m={0}
                      minWidth={6}
                      p={0}
                      variant="_link"
                    >
                      {shortAddress(poolData?.comptroller, 6, 4)}
                    </Button>
                  </SimpleTooltip>
                  <ClipboardValueIconButton value={poolData?.comptroller} />
                </HStack>
              </HStack>
            </GridItem>
          </Grid>
        ) : (
          <Column
            crossAxisAlignment="flex-start"
            height="100%"
            mainAxisAlignment="flex-start"
            pb={1}
            width="100%"
          >
            <Skeleton height={200} width="100%" />
          </Column>
        )}
      </Column>
    </CardBox>
  );
};

export default PoolDetails;
