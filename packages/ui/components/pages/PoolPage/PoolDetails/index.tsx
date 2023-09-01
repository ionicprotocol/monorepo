import { ArrowBackIcon, ChevronDownIcon, ChevronUpIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Img,
  Link,
  Skeleton,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Text,
  VStack
} from '@chakra-ui/react';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import { colord, extend } from 'colord';
import mixPlugin from 'colord/plugins/mix';
import { utils } from 'ethers';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';

import { RewardsBanner } from '@ui/components/pages/PoolPage/RewardsBanner/index';
import { ClipboardValueIconButton } from '@ui/components/shared/ClipboardValue';
import { Center } from '@ui/components/shared/Flex';
import { CardBox } from '@ui/components/shared/IonicBox';
import { LoadingText } from '@ui/components/shared/LoadingText';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { HEALTH_FACTOR } from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useExtraPoolInfo } from '@ui/hooks/ionic/useExtraPoolInfo';
import { useHealthFactor } from '@ui/hooks/pools/useHealthFactor';
import { useChainConfig } from '@ui/hooks/useChainConfig';
import { useColors } from '@ui/hooks/useColors';
import { usePoolData } from '@ui/hooks/usePoolData';
import { smallUsdFormatter } from '@ui/utils/bigUtils';
import { getScanUrlByChainId } from '@ui/utils/networkData';
import { shortAddress } from '@ui/utils/shortAddress';

extend([mixPlugin]);

const PoolDetails = ({ chainId, poolId }: { chainId: string; poolId: string }) => {
  const { data: poolData, isLoading: isPoolDataLoading } = usePoolData(poolId, Number(chainId));
  const router = useRouter();
  const { data: extraPoolInfo, isLoading: isExtraPoolInfoLoading } = useExtraPoolInfo(
    poolData?.comptroller,
    poolData?.chainId
  );
  const { cIPage } = useColors();
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

  const { data: healthFactor } = useHealthFactor(poolData?.comptroller, poolData?.chainId);

  const mixedColor = useCallback((ratio: number) => {
    let color1 = '';
    let color2 = '';
    let _ratio = 0;
    if (ratio < 0.5) {
      color1 = '#FF3864'; // iRed
      color2 = '#F1F996'; // iYello
      _ratio = ratio * 2;
    } else {
      _ratio = (ratio - 0.5) * 2;
      color1 = '#F1F996'; // iYello
      color2 = '#39FF88'; // iGreen
    }

    return colord(color1).mix(color2, _ratio).toHex();
  }, []);

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
        mb={'10px'}
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
              height="35px"
              minHeight="35px"
              minWidth="35px"
              src={chainConfig.specificParams.metadata.img}
              width="35px"
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
      <Flex mb={'20px'}>
        <RewardsBanner chainId={chainId} poolId={poolId} />
      </Flex>

      <Flex direction={{ base: 'column' }} width={'100%'}>
        <Flex flexWrap="wrap" gap="32px">
          <VStack alignItems="flex-start">
            <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
              Net Worth
            </Text>
            <Skeleton isLoaded={!isPoolDataLoading}>
              {isPoolDataLoading ? (
                <LoadingText />
              ) : (
                <Text color={'iWhite'} size="lg">
                  {poolData ? smallUsdFormatter(poolData.totalSuppliedFiat, true) : '--'}
                </Text>
              )}
            </Skeleton>
          </VStack>
          <VStack alignItems="flex-start">
            <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
              Net Apr
            </Text>
            <Skeleton isLoaded={!isPoolDataLoading}>
              {isPoolDataLoading ? (
                <LoadingText />
              ) : (
                <Text color={'iWhite'} size="lg">
                  1.56%
                </Text>
              )}
            </Skeleton>
          </VStack>

          <VStack alignItems="flex-start">
            <Flex direction="row" gap={1} height="18px">
              <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                Health Factor
              </Text>
              <PopoverTooltip
                body={
                  healthFactor ? (
                    <Flex alignItems={'flex-start'} direction={{ base: 'column' }} gap={'8px'}>
                      <Flex justifyContent={'space-between'} width={'100%'}>
                        <Text color={'iLightGray'} textTransform="uppercase">
                          Health Factor
                        </Text>
                        <Text color={mixedColor(Number(healthFactor) / HEALTH_FACTOR.MAX)}>
                          {healthFactor}
                        </Text>
                      </Flex>
                      <Slider
                        aria-label="slider-ex-1"
                        max={HEALTH_FACTOR.MAX}
                        min={HEALTH_FACTOR.MIN}
                        mt={'20px'}
                        value={Number(healthFactor)}
                        variant="health"
                      >
                        <SliderMark
                          color={mixedColor(Number(healthFactor) / HEALTH_FACTOR.MAX)}
                          value={Number(healthFactor)}
                        >
                          {healthFactor}
                        </SliderMark>
                        <SliderTrack>
                          <SliderFilledTrack />
                        </SliderTrack>
                        <PopoverTooltip
                          body={
                            <VStack spacing={1}>
                              <Text color={'iRed'}>1.00</Text>
                              <Text color={'iRed'}>Liquidation value</Text>
                            </VStack>
                          }
                          popoverProps={{ isOpen: true, placement: 'bottom', variant: 'ghost' }}
                        >
                          <Box
                            borderColor={'iRed'}
                            borderWidth={'1px'}
                            height={'14px'}
                            ml={'55px'}
                            width={'2px'}
                          />
                        </PopoverTooltip>

                        <SliderThumb />
                      </Slider>
                      <Center mb={'5px'} mt={'50px'} width={'100%'}>
                        <Divider bg={cIPage.dividerColor} orientation="horizontal" width="100%" />
                      </Center>
                      <Text color={'iWhite'}>
                        If the health factor goes below 1, the liquidation of your collateral might
                        be triggered
                      </Text>
                    </Flex>
                  ) : null
                }
                bodyProps={{ p: 0 }}
                contentProps={{ width: '340px' }}
                popoverProps={{ placement: 'top' }}
                visible={!!healthFactor}
              >
                <InfoOutlineIcon
                  color={'iLightGray'}
                  height="fit-content"
                  ml={1}
                  verticalAlign="baseLine"
                />
              </PopoverTooltip>
            </Flex>
            <Skeleton isLoaded={!isPoolDataLoading}>
              {isPoolDataLoading ? (
                <LoadingText />
              ) : (
                <Text
                  color={
                    healthFactor ? mixedColor(Number(healthFactor) / HEALTH_FACTOR.MAX) : 'iWhite'
                  }
                  size="lg"
                >
                  {healthFactor ? healthFactor : '-'}
                </Text>
              )}
            </Skeleton>
          </VStack>
        </Flex>
        <Flex justifyContent={'flex-end'} width={'100%'}>
          <HStack cursor="pointer" onClick={() => setIsMoreInfo(!isMoreInfo)}>
            <Text size="md" width="max-content">
              {isMoreInfo ? 'Hide info' : 'More info'}
            </Text>
            {isMoreInfo ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </HStack>
        </Flex>

        {isMoreInfo ? (
          <>
            <Center height={5} mb={'20px'}>
              <Divider bg={cIPage.dividerColor} orientation="horizontal" width="100%" />
            </Center>
            <Flex flexWrap="wrap" gap="32px" mb={'10px'}>
              <VStack alignItems="flex-start">
                <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                  Total Supply
                </Text>
                <Skeleton isLoaded={!isPoolDataLoading}>
                  {isPoolDataLoading ? (
                    <LoadingText />
                  ) : (
                    <Text color={'iWhite'} size="lg">
                      {poolData ? smallUsdFormatter(poolData.totalSuppliedFiat, true) : '-'}
                    </Text>
                  )}
                </Skeleton>
              </VStack>
              <VStack alignItems="flex-start">
                <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                  Total Borrowed
                </Text>
                <Skeleton isLoaded={!isPoolDataLoading}>
                  {isPoolDataLoading ? (
                    <LoadingText />
                  ) : (
                    <Text color={'iWhite'} size="lg">
                      {poolData ? smallUsdFormatter(poolData.totalBorrowedFiat, true) : '-'}
                    </Text>
                  )}
                </Skeleton>
              </VStack>
              <VStack alignItems="flex-start">
                <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                  Total Liquidity
                </Text>
                <Skeleton isLoaded={!isPoolDataLoading}>
                  {isPoolDataLoading ? (
                    <LoadingText />
                  ) : (
                    <Text color={'iWhite'} size="lg">
                      {poolData ? smallUsdFormatter(poolData.totalLiquidityFiat, true) : '-'}
                    </Text>
                  )}
                </Skeleton>
              </VStack>
              <VStack alignItems="flex-start">
                <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                  Pool Utilization
                </Text>
                <Skeleton isLoaded={!isPoolDataLoading}>
                  {isPoolDataLoading ? (
                    <LoadingText />
                  ) : (
                    <Text color={'iWhite'} size="lg">
                      {poolData ? `${poolData.utilization.toFixed(2)}%` : '-'}
                    </Text>
                  )}
                </Skeleton>
              </VStack>
            </Flex>
            <Center height={5} mb={'20px'}>
              <Divider bg={cIPage.dividerColor} orientation="horizontal" width="100%" />
            </Center>
            <Flex direction={{ base: 'row' }} gap={'40px'} width={'800px'}>
              <VStack flex={1} gap={'8px'}>
                <Flex justifyContent={'space-between'} width={'100%'}>
                  <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                    Upgradeable
                  </Text>
                  <Skeleton isLoaded={!isExtraPoolInfoLoading}>
                    {isExtraPoolInfoLoading ? (
                      <LoadingText />
                    ) : (
                      <Text color={'iWhite'} textAlign={'end'}>
                        {extraPoolInfo ? (extraPoolInfo.upgradeable ? 'Yes' : 'No') : '-'}
                      </Text>
                    )}
                  </Skeleton>
                </Flex>
                <Flex justifyContent={'space-between'} width={'100%'}>
                  <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                    Admin
                  </Text>
                  <Skeleton isLoaded={!isExtraPoolInfoLoading}>
                    {isExtraPoolInfoLoading ? (
                      <LoadingText />
                    ) : extraPoolInfo ? (
                      <HStack>
                        <SimpleTooltip label={`${scanUrl}/address/${extraPoolInfo.admin}`}>
                          <Button
                            as={Link}
                            fontSize={{ base: '14px' }}
                            height="auto"
                            href={`${scanUrl}/address/${extraPoolInfo.admin}`}
                            isExternal
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
                </Flex>
                <Flex justifyContent={'space-between'} width={'100%'}>
                  <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                    Close Factor
                  </Text>
                  <Skeleton isLoaded={!isExtraPoolInfoLoading}>
                    {isExtraPoolInfoLoading ? (
                      <LoadingText />
                    ) : (
                      <Text color={'iWhite'} textAlign={'end'}>
                        {extraPoolInfo
                          ? Number(utils.formatUnits(extraPoolInfo.closeFactor, 16)) + '%'
                          : '-'}
                      </Text>
                    )}
                  </Skeleton>
                </Flex>
              </VStack>
              <Center>
                <Divider bg={cIPage.dividerColor} orientation="vertical" width="2px" />
              </Center>
              <VStack flex={1} gap={'8px'}>
                <Flex justifyContent={'space-between'} width={'100%'}>
                  <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                    Oracle
                  </Text>
                  <Skeleton isLoaded={!isExtraPoolInfoLoading}>
                    {isExtraPoolInfoLoading ? (
                      <LoadingText />
                    ) : (
                      <Text color={'iWhite'} textAlign={'end'}>
                        {extraPoolInfo ? extraPoolInfo.oracle : '-'}
                      </Text>
                    )}
                  </Skeleton>
                </Flex>
                <Flex justifyContent={'space-between'} width={'100%'}>
                  <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                    Whitelist
                  </Text>
                  <Skeleton isLoaded={!isExtraPoolInfoLoading}>
                    {isExtraPoolInfoLoading ? (
                      <LoadingText />
                    ) : (
                      <Text color={'iWhite'} textAlign={'end'}>
                        {extraPoolInfo ? (extraPoolInfo.enforceWhitelist ? 'Yes' : 'No') : '-'}
                      </Text>
                    )}
                  </Skeleton>
                </Flex>
                <Flex justifyContent={'space-between'} width={'100%'}>
                  <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                    Pool Address
                  </Text>
                  <Skeleton isLoaded={!isPoolDataLoading}>
                    {isPoolDataLoading ? (
                      <LoadingText />
                    ) : poolData ? (
                      <HStack>
                        <SimpleTooltip label={`${scanUrl}/address/${poolData.comptroller}`}>
                          <Button
                            as={Link}
                            fontSize={{ base: '14px' }}
                            height="auto"
                            href={`${scanUrl}/address/${poolData.comptroller}`}
                            isExternal
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
                </Flex>
              </VStack>
            </Flex>
          </>
        ) : null}
      </Flex>
    </CardBox>
  );
};

export default PoolDetails;
