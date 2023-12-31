import { Button, Flex, HStack, Link, Skeleton, Text, VStack } from '@chakra-ui/react';
import { utils } from 'ethers';
import { useMemo } from 'react';
import { BiLinkExternal } from 'react-icons/bi';

import { CardBox } from '@ui/components/shared/IonicBox';
import { LoadingText } from '@ui/components/shared/LoadingText';
import { useOracle } from '@ui/hooks/ionic/useOracle';
import type { MarketData } from '@ui/types/TokensDataMap';
import { smallFormatter, smallUsdFormatter } from '@ui/utils/bigUtils';
import { getScanUrlByChainId } from '@ui/utils/networkData';

const AssetDetails = ({
  asset,
  chainId,
  isLoading
}: {
  asset?: MarketData;
  chainId: number;
  isLoading: boolean;
}) => {
  const scanUrl = useMemo(() => getScanUrlByChainId(chainId), [chainId]);
  const { data: oracle } = useOracle(asset?.underlyingToken, chainId);

  return (
    <CardBox>
      <Flex
        alignItems="center"
        flexWrap="wrap"
        gap={4}
        justifyContent={{ base: 'space-between' }}
        mb={{ base: '24px' }}
        width="100%"
      >
        <Text size="xl" textAlign="left">
          Asset Details
        </Text>
        <Flex direction={{ base: 'row' }} gap={{ base: '10px' }}>
          <HStack>
            {oracle && (
              <Link href={`${scanUrl}/address/${oracle}`} isExternal rel="noreferrer">
                <Button
                  rightIcon={<BiLinkExternal fontSize={'20px'} strokeWidth={'0.5px'} />}
                  variant={'ghost'}
                >
                  Oracle Contract
                </Button>
              </Link>
            )}
            <Link href={`${scanUrl}/address/${asset?.underlyingToken}`} isExternal rel="noreferrer">
              <Button
                rightIcon={<BiLinkExternal fontSize={'20px'} strokeWidth={'0.5px'} />}
                variant={'ghost'}
              >
                Token Contract
              </Button>
            </Link>
            <Link href={`${scanUrl}/address/${asset?.cToken}`} isExternal rel="noreferrer">
              <Button
                rightIcon={<BiLinkExternal fontSize={'20px'} strokeWidth={'0.5px'} />}
                variant={'ghost'}
              >
                Market Contract
              </Button>
            </Link>
          </HStack>
        </Flex>
      </Flex>
      <Flex direction={{ base: 'column' }} width={'100%'}>
        <Flex flexWrap="wrap" gap="32px">
          <VStack alignItems="flex-start">
            <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
              Asset Supplied
            </Text>
            <Skeleton isLoaded={!isLoading}>
              {isLoading ? (
                <LoadingText />
              ) : (
                <Text color={'iWhite'} size="lg">
                  {asset ? `${smallUsdFormatter(asset.supplyBalanceFiat, true)}` : '--'}
                </Text>
              )}
            </Skeleton>
          </VStack>
          <VStack alignItems="flex-start">
            <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
              Asset Borrowed
            </Text>
            <Skeleton isLoaded={!isLoading}>
              {isLoading ? (
                <LoadingText />
              ) : (
                <Text color={'iWhite'} size="lg">
                  {asset ? `${smallUsdFormatter(asset.borrowBalanceFiat, true)}` : '--'}
                </Text>
              )}
            </Skeleton>
          </VStack>
          <VStack alignItems="flex-start">
            <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
              Asset Utilization
            </Text>
            <Skeleton isLoaded={!isLoading}>
              {isLoading ? (
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
              Loan-To-Value
            </Text>
            <Skeleton isLoaded={!isLoading}>
              {isLoading ? (
                <LoadingText />
              ) : (
                <Text color={'iWhite'} size="lg">
                  {asset
                    ? `${Number(utils.formatUnits(asset.collateralFactor, 16)).toFixed(0)}%`
                    : '--'}
                </Text>
              )}
            </Skeleton>
          </VStack>
          <VStack alignItems="flex-start">
            <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
              Reserve Factor
            </Text>
            <Skeleton isLoaded={!isLoading}>
              {isLoading ? (
                <LoadingText />
              ) : (
                <Text color={'iWhite'} size="lg">
                  {asset
                    ? `${Number(utils.formatUnits(asset.reserveFactor, 16)).toFixed(0)}%`
                    : '--'}
                </Text>
              )}
            </Skeleton>
          </VStack>
          <VStack alignItems="flex-start">
            <Text color={'iLightGray'} size={'sm'} textTransform="uppercase">
              Admin Fee
            </Text>
            <Skeleton isLoaded={!isLoading}>
              {isLoading ? (
                <LoadingText />
              ) : (
                <Text color={'iWhite'} size="lg">
                  {asset ? `${Number(utils.formatUnits(asset.adminFee, 16)).toFixed(0)}%` : '--'}
                </Text>
              )}
            </Skeleton>
          </VStack>
        </Flex>
      </Flex>
    </CardBox>
  );
};

export default AssetDetails;
