import { ArrowBackIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { Button, Flex, HStack, Img, Link, Skeleton, Text, VStack } from '@chakra-ui/react';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import { utils } from 'ethers';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';

import { ClipboardValueIconButton } from '@ui/components/shared/ClipboardValue';
import { Center } from '@ui/components/shared/Flex';
import { CardBox } from '@ui/components/shared/IonicBox';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useExtraPoolInfo } from '@ui/hooks/fuse/useExtraPoolInfo';
import { useChainConfig } from '@ui/hooks/useChainConfig';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { smallUsdFormatter } from '@ui/utils/bigUtils';
import { getScanUrlByChainId } from '@ui/utils/networkData';
import { shortAddress } from '@ui/utils/shortAddress';

const PoolDetails = ({ chainId, poolId }: { chainId: string; poolId: string }) => {
  const { data: poolData, isLoading: isPoolDataLoading } = useFusePoolData(poolId, Number(chainId));
  const router = useRouter();
  const { data: extraPoolInfo, isLoading: isExtraPoolInfoLoading } = useExtraPoolInfo(
    poolData?.comptroller,
    poolData?.chainId
  );

  const { setGlobalLoading, currentSdk } = useMultiIonic();
  const addRecentTransaction = useAddRecentTransaction();
  const scanUrl = useMemo(
    () => poolData?.chainId && getScanUrlByChainId(poolData.chainId),
    [poolData?.chainId]
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMoreInfo, setIsMoreInfo] = useState<boolean>(false);
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
      <Flex
        alignItems="center"
        flexWrap="wrap"
        gap={4}
        justifyContent={['center', 'center', 'space-between']}
        mb={'20px'}
        width="100%"
      >
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
            <Text size="xl" textAlign="left">
              {poolData ? poolData.name : 'Pool'}
            </Text>
          </Skeleton>
        </HStack>
        {extraPoolInfo?.isPowerfulAdmin ? (
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
        ) : extraPoolInfo?.isPendingAdmin ? (
          <Button isDisabled={isLoading} isLoading={isLoading} onClick={acceptOwnership}>
            Accept Ownership
          </Button>
        ) : null}
      </Flex>

      <Flex direction={{ base: 'row' }} flexWrap="wrap" gap="32px">
        <VStack alignItems="flex-start">
          <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
            Total Supply
          </Text>
          <Skeleton isLoaded={!isPoolDataLoading} minW="80px">
            <Text color={'iWhite'} size="lg">
              {poolData ? smallUsdFormatter(poolData.totalSuppliedFiat, true) : '-'}
            </Text>
          </Skeleton>
        </VStack>
        <VStack alignItems="flex-start">
          <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
            Total Borrowed
          </Text>
          <Skeleton isLoaded={!isPoolDataLoading} minW="80px">
            <Text color={'iWhite'} size="lg">
              {poolData ? smallUsdFormatter(poolData.totalBorrowedFiat, true) : '-'}
            </Text>
          </Skeleton>
        </VStack>
        <VStack alignItems="flex-start">
          <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
            Total Liquidity
          </Text>
          <Skeleton isLoaded={!isPoolDataLoading} minW="80px">
            <Text color={'iWhite'} size="lg">
              {poolData ? smallUsdFormatter(poolData.totalLiquidityFiat, true) : '-'}
            </Text>
          </Skeleton>
        </VStack>
        <VStack alignItems="flex-start">
          <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
            Pool Utilization
          </Text>
          <Skeleton isLoaded={!isPoolDataLoading} minW="80px">
            <Text color={'iWhite'} size="lg">
              {poolData ? `${poolData.utilization.toFixed(2)}%` : '-'}
            </Text>
          </Skeleton>
        </VStack>
        {isMoreInfo ? (
          <>
            <VStack alignItems="flex-start">
              <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                Upgradeable
              </Text>
              <Skeleton isLoaded={!isExtraPoolInfoLoading} minW="80px">
                <Text color={'iWhite'} size="lg">
                  {extraPoolInfo ? (extraPoolInfo.upgradeable ? 'Yes' : 'No') : '-'}
                </Text>
              </Skeleton>
            </VStack>
            <VStack alignItems="flex-start">
              <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                Admin
              </Text>
              <Skeleton isLoaded={!isExtraPoolInfoLoading} minW="80px">
                {extraPoolInfo ? (
                  <HStack>
                    <SimpleTooltip label={`${scanUrl}/address/${extraPoolInfo.admin}`}>
                      <Button
                        as={Link}
                        fontSize={{ base: '20px' }}
                        height="auto"
                        href={`${scanUrl}/address/${extraPoolInfo.admin}`}
                        isExternal
                        lineHeight={{ base: '30px' }}
                        m={0}
                        minWidth={6}
                        p={0}
                        variant="ghost"
                      >
                        {shortAddress(extraPoolInfo.admin, 6, 4)}
                      </Button>
                    </SimpleTooltip>
                    <ClipboardValueIconButton value={extraPoolInfo.admin} />
                  </HStack>
                ) : (
                  <Text color={'iWhite'} size="lg">
                    {'-'}
                  </Text>
                )}
              </Skeleton>
            </VStack>
            <VStack alignItems="flex-start">
              <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                Platform Fee
              </Text>
              <Skeleton isLoaded={!isPoolDataLoading} minW="80px">
                <Text color={'iWhite'} size="lg">
                  {poolData && poolData.assets.length > 0
                    ? Number(utils.formatUnits(poolData.assets[0].fuseFee, 16)).toPrecision(2) + '%'
                    : '-'}
                </Text>
              </Skeleton>
            </VStack>
            <VStack alignItems="flex-start">
              <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                Average Admin Fee
              </Text>
              <Skeleton isLoaded={!isPoolDataLoading} minW="80px">
                <Text color={'iWhite'} size="lg">
                  {poolData && poolData.assets.length > 0
                    ? poolData.assets
                        .reduce(
                          (a, b, _, { length }) =>
                            a + Number(utils.formatUnits(b.adminFee, 16)) / length,
                          0
                        )
                        .toFixed(1) + '%'
                    : '-'}
                </Text>
              </Skeleton>
            </VStack>
            <VStack alignItems="flex-start">
              <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                Close Factor
              </Text>
              <Skeleton isLoaded={!isExtraPoolInfoLoading} minW="80px">
                <Text color={'iWhite'} size="lg">
                  {extraPoolInfo
                    ? Number(utils.formatUnits(extraPoolInfo.closeFactor, 16)) + '%'
                    : '-'}
                </Text>
              </Skeleton>
            </VStack>
            <VStack alignItems="flex-start">
              <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                Liquidation Incentive
              </Text>
              <Skeleton isLoaded={!isExtraPoolInfoLoading} minW="80px">
                <Text color={'iWhite'} size="lg">
                  {extraPoolInfo
                    ? Number(utils.formatUnits(extraPoolInfo.liquidationIncentive, 16)) - 100 + '%'
                    : '-'}
                </Text>
              </Skeleton>
            </VStack>
            <VStack alignItems="flex-start">
              <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                Oracle
              </Text>
              <Skeleton isLoaded={!isExtraPoolInfoLoading} minW="80px">
                <Text color={'iWhite'} size="lg">
                  {extraPoolInfo ? extraPoolInfo.oracle : '-'}
                </Text>
              </Skeleton>
            </VStack>
            <VStack alignItems="flex-start">
              <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                Whitelist
              </Text>
              <Skeleton isLoaded={!isExtraPoolInfoLoading} minW="80px">
                <Text color={'iWhite'} size="lg">
                  {extraPoolInfo ? (extraPoolInfo.enforceWhitelist ? 'Yes' : 'No') : '-'}
                </Text>
              </Skeleton>
            </VStack>
            <VStack alignItems="flex-start">
              <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                Pool Address
              </Text>
              <Skeleton isLoaded={!isExtraPoolInfoLoading} minW="80px">
                {poolData ? (
                  <HStack>
                    <SimpleTooltip label={`${scanUrl}/address/${poolData.comptroller}`}>
                      <Button
                        as={Link}
                        fontSize={{ base: '20px' }}
                        height="auto"
                        href={`${scanUrl}/address/${poolData.comptroller}`}
                        isExternal
                        lineHeight={{ base: '30px' }}
                        m={0}
                        minWidth={6}
                        p={0}
                        variant="ghost"
                      >
                        {shortAddress(poolData.comptroller, 6, 4)}
                      </Button>
                    </SimpleTooltip>
                    <ClipboardValueIconButton value={poolData.comptroller} />
                  </HStack>
                ) : (
                  <Text color={'iWhite'} size="lg">
                    {'-'}
                  </Text>
                )}
              </Skeleton>
            </VStack>
          </>
        ) : null}
      </Flex>
      <Flex justifyContent={'flex-end'} width={'100%'}>
        <HStack cursor="pointer" onClick={() => setIsMoreInfo(!isMoreInfo)}>
          <Text size="md" width="max-content">
            More info
          </Text>
          {isMoreInfo ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </HStack>
      </Flex>
    </CardBox>
  );
};

export default PoolDetails;
