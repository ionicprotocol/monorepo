import { ArrowBackIcon } from '@chakra-ui/icons';
import { Flex, HStack, IconButton, Img, Link, Skeleton, Text, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { BiLinkExternal, BiWallet } from 'react-icons/bi';

import { CardBox } from '@ui/components/shared/IonicBox';
import { LoadingText } from '@ui/components/shared/LoadingText';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useAddTokenToWallet } from '@ui/hooks/useAddTokenToWallet';
import { useUsdPrice } from '@ui/hooks/useAllUsdPrices';
import { useChainConfig } from '@ui/hooks/useChainConfig';
import { usePoolData } from '@ui/hooks/usePoolData';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { smallFormatter, smallUsdFormatter } from '@ui/utils/bigUtils';
import { getScanUrlByChainId } from '@ui/utils/networkData';

export const AssetInfo = ({
  cToken,
  chainId,
  poolId
}: {
  cToken: string;
  chainId: number;
  poolId: string;
}) => {
  const { data: poolData, isLoading: isPoolDataLoading } = usePoolData(poolId, chainId);

  const router = useRouter();
  const { setGlobalLoading } = useMultiIonic();
  const chainConfig = useChainConfig(poolData?.chainId);
  const { data: usdPrice, isLoading: isPriceLoading } = useUsdPrice(chainId.toString());
  const scanUrl = useMemo(() => getScanUrlByChainId(chainId), [chainId]);
  const asset = poolData?.assets.find((asset) => asset.cToken === cToken);

  const successToast = useSuccessToast();
  const errorToast = useErrorToast();
  const addToken = useAddTokenToWallet({
    errorToast,
    successToast,
    underlyingAddress: asset?.underlyingToken,
    underlyingDecimals: Number(asset?.underlyingDecimals),
    underlyingSymbol: asset?.underlyingSymbol
  });

  return (
    <CardBox py={0}>
      <Flex
        alignItems={'center'}
        direction={'row'}
        gap={4}
        justifyContent={'space-between'}
        width={'100%'}
      >
        <Flex direction={'column'} gap={'20px'} py={{ base: '20px' }}>
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
              <HStack alignItems={'baseline'}>
                <Skeleton isLoaded={!isPoolDataLoading}>
                  {isPoolDataLoading ? (
                    <LoadingText size={'xl'} />
                  ) : (
                    <Text size="xl" textAlign="left">
                      {asset ? asset.underlyingName : '--'}
                    </Text>
                  )}
                </Skeleton>
                <Skeleton isLoaded={!isPoolDataLoading}>
                  {isPoolDataLoading ? (
                    <LoadingText />
                  ) : (
                    <Text color={'iGray'} textAlign="left">
                      {asset ? asset.underlyingSymbol : '--'}
                    </Text>
                  )}
                </Skeleton>
              </HStack>
              <HStack spacing={1}>
                <SimpleTooltip label={'Add token to wallet'}>
                  <IconButton
                    alignSelf={'center'}
                    aria-label="asset wallet"
                    icon={<BiWallet fontSize={'24px'} strokeWidth={'0.5px'} />}
                    onClick={addToken}
                  />
                </SimpleTooltip>
                <Link
                  href={`${scanUrl}/address/${asset?.underlyingToken}`}
                  isExternal
                  rel="noreferrer"
                >
                  <IconButton
                    alignSelf={'center'}
                    aria-label="asset link"
                    icon={<BiLinkExternal fontSize={'24px'} strokeWidth={'0.5px'} />}
                  />
                </Link>
              </HStack>
            </HStack>
          </Flex>
          <Flex direction={{ base: 'column' }} width={'100%'}>
            <Flex flexWrap="wrap" gap="32px">
              <VStack alignItems="flex-start">
                <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                  Reserve Size
                </Text>
                <Skeleton isLoaded={!isPoolDataLoading}>
                  {isPoolDataLoading ? (
                    <LoadingText />
                  ) : (
                    <Text color={'iWhite'} size="lg">
                      $213.00M*
                    </Text>
                  )}
                </Skeleton>
              </VStack>
              <VStack alignItems="flex-start">
                <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                  Available Liquidity
                </Text>
                <Skeleton isLoaded={!isPoolDataLoading}>
                  {isPoolDataLoading ? (
                    <LoadingText />
                  ) : (
                    <Text color={'iWhite'} size="lg">
                      {asset ? smallUsdFormatter(asset.liquidityFiat, true) : '--'}
                    </Text>
                  )}
                </Skeleton>
              </VStack>
              <VStack alignItems="flex-start">
                <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                  Utilization Rate
                </Text>
                <Skeleton isLoaded={!isPoolDataLoading}>
                  {isPoolDataLoading ? (
                    <LoadingText />
                  ) : (
                    <Text color={'iWhite'} size="lg">
                      {asset ? `${smallFormatter(asset.utilization, true)}%` : '--'}
                    </Text>
                  )}
                </Skeleton>
              </VStack>
              <VStack alignItems="flex-start">
                <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
                  Oracle Price
                </Text>
                <HStack>
                  <Skeleton isLoaded={!isPriceLoading}>
                    {isPriceLoading ? (
                      <LoadingText />
                    ) : (
                      <Text color={'iWhite'} size="lg">
                        {usdPrice ? smallUsdFormatter(usdPrice, true) : '--'}
                      </Text>
                    )}
                  </Skeleton>
                  <IconButton
                    alignSelf={'center'}
                    aria-label="asset link"
                    icon={<BiLinkExternal fontSize={'20px'} strokeWidth={'0.5px'} />}
                  />
                </HStack>
              </VStack>
            </Flex>
          </Flex>
        </Flex>
        <Flex
          height={{ base: '150px' }}
          overflow={'hidden'}
          position={'relative'}
          width={{ base: '400px' }}
        >
          <Img
            alt=""
            borderRadius="50%"
            position={'absolute'}
            src={asset?.logoUrl}
            top={{ base: '-90px' }}
            width={{ base: '400px' }}
          />
        </Flex>
        <Flex alignSelf={'self-start'} py={{ base: '20px' }}>
          <HStack>
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
            <Text>{poolData?.name}</Text>
          </HStack>
        </Flex>
      </Flex>
    </CardBox>
  );
};
