import {
  Box,
  ButtonGroup,
  CircularProgress,
  CircularProgressLabel,
  Divider,
  Flex,
  Icon,
  Skeleton,
  Text,
  VStack
} from '@chakra-ui/react';
import { utils } from 'ethers';
import { useState } from 'react';
import { BsCheckCircle } from 'react-icons/bs';

import { CButton } from '@ui/components/shared/Button';
import { Center } from '@ui/components/shared/Flex';
import HistoryChart from '@ui/components/shared/HistoryChart';
import { LoadingText } from '@ui/components/shared/LoadingText';
import {
  APY,
  MILLI_SECONDS_PER_MONTH,
  MILLI_SECONDS_PER_YEAR,
  MILLI_SECONDS_SIX_MONTH
} from '@ui/constants/index';
import { useAssets } from '@ui/hooks/useAssets';
import { useColors } from '@ui/hooks/useColors';
import { useHistoryData } from '@ui/hooks/useHistoryData';
import { useRewards } from '@ui/hooks/useRewards';
import { useSupplyCap } from '@ui/hooks/useSupplyCap';
import { useTotalSupplyAPYs } from '@ui/hooks/useTotalSupplyAPYs';
import type { MarketData } from '@ui/types/TokensDataMap';
import { smallFormatter, smallUsdFormatter } from '@ui/utils/bigUtils';

export const TimeFrames = [
  { label: '1M', milliSeconds: MILLI_SECONDS_PER_MONTH },
  { label: '6M', milliSeconds: MILLI_SECONDS_SIX_MONTH },
  { label: '1Y', milliSeconds: MILLI_SECONDS_PER_YEAR }
];

export const SupplyInfo = ({
  asset,
  assets,
  chainId,
  comptroller,
  isLoading,
  poolId
}: {
  asset?: MarketData;
  assets?: MarketData[];
  chainId: number;
  comptroller?: string;
  isLoading: boolean;
  poolId: string;
}) => {
  const { cIPage } = useColors();
  const [milliSeconds, setMilliSeconds] = useState<number>(MILLI_SECONDS_PER_MONTH);
  const { data: historyData, isLoading: isHistoryDataLoading } = useHistoryData(
    APY,
    asset?.underlyingToken,
    asset?.cToken,
    chainId,
    milliSeconds
  );
  const { data: supplyCap, isLoading: isSupplyCapLoading } = useSupplyCap({
    chainId,
    comptroller,
    market: asset
  });
  const { data: allRewards } = useRewards({ chainId, poolId: poolId.toString() });
  const { data: assetInfos } = useAssets(chainId ? [chainId] : []);
  const { data: totalSupplyApyPerAsset, isLoading: isApyLoading } = useTotalSupplyAPYs(
    assets,
    chainId,
    allRewards,
    assetInfos
  );

  return (
    <Flex>
      <Flex direction={{ base: 'column' }} width={'100%'}>
        <Flex direction={{ base: 'row' }} width={'100%'}>
          <Flex flex={1} gap={{ base: '32px' }}>
            <CircularProgress
              color={'iGreen'}
              height={'74px'}
              size="74px"
              thickness="12px"
              trackColor={'iGray'}
              value={12.1}
            >
              <CircularProgressLabel fontSize={'12px'}>12.10%</CircularProgressLabel>
            </CircularProgress>
            <Flex direction={{ base: 'column' }} gap={{ base: '4px' }}>
              <Text variant={'itemTitle'}>Total Supplied</Text>
              <Skeleton isLoaded={!isLoading && !isSupplyCapLoading}>
                <Text size={'lg'}>
                  {asset ? smallFormatter(Number(utils.formatUnits(asset.totalSupply))) : '--'}
                  {supplyCap ? ` of ${smallFormatter(supplyCap.tokenCap)}` : ''}
                </Text>
              </Skeleton>
              <Skeleton isLoaded={!isLoading && !isSupplyCapLoading}>
                <Text color={'iGray'}>
                  {asset ? smallUsdFormatter(asset.totalSupplyFiat) : '--'}
                  {supplyCap ? ` of ${smallUsdFormatter(supplyCap.usdCap)}` : ''}
                </Text>
              </Skeleton>
            </Flex>
            <Flex direction={{ base: 'column' }} gap={{ base: '4px' }}>
              <Text variant={'itemTitle'}>APR</Text>
              <Skeleton isLoaded={!isApyLoading}>
                <Text size={'lg'}>
                  {totalSupplyApyPerAsset && asset
                    ? totalSupplyApyPerAsset[asset.cToken].totalApy
                    : '--'}
                  %
                </Text>
              </Skeleton>
            </Flex>
          </Flex>
          <Center height={'100%'} mx={{ base: '24px' }}>
            <Divider bg={cIPage.dividerColor} orientation="vertical" width="1px" />
          </Center>
          <Flex flex={1} gap={{ base: '32px' }}>
            {asset?.membership ? (
              <Flex
                alignItems={'center'}
                direction={{ base: 'column' }}
                justifyContent={{ base: 'space-between' }}
              >
                <Icon as={BsCheckCircle} color={'iGreen'} fontSize="50px" />
                <Text>Can be collateral</Text>
              </Flex>
            ) : null}
            <Flex direction={{ base: 'column' }} flex={1} gap={{ base: '8px' }}>
              <Flex justifyContent={'space-between'}>
                <Text variant={'itemTitle'}>Max LTV</Text>
                <Skeleton isLoaded={!isLoading}>
                  {isLoading ? (
                    <LoadingText />
                  ) : (
                    <Text variant={'itemDesc'}>
                      {asset
                        ? `${Number(utils.formatUnits(asset.collateralFactor, 16)).toFixed(0)}%`
                        : '--'}
                    </Text>
                  )}
                </Skeleton>
              </Flex>
              <Flex justifyContent={'space-between'}>
                <Text variant={'itemTitle'}>Liquidation Thershold</Text>
                <Text>79.00%</Text>
              </Flex>
              <Flex justifyContent={'space-between'}>
                <Text variant={'itemTitle'}>Liquidation Penalty</Text>
                <Text>4.50%</Text>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
        <Flex>
          <Box pb={4} width="100%">
            <VStack width={'100%'}>
              <ButtonGroup
                alignSelf="self-end"
                flexFlow={'row wrap'}
                gap={0}
                height={8}
                isAttached={true}
                justifyContent="flex-start"
                mr={4}
                mt={4}
                spacing={0}
                zIndex={1}
              >
                {TimeFrames.map((tf) => {
                  return (
                    <CButton
                      borderRadius={8}
                      height="100%"
                      isSelected={milliSeconds === tf.milliSeconds}
                      key={tf.label}
                      onClick={() => setMilliSeconds(tf.milliSeconds)}
                      p={2}
                      variant="_filter"
                    >
                      <Center fontWeight="bold" height="100%" width="100%">
                        {tf.label}
                      </Center>
                    </CButton>
                  );
                })}
              </ButtonGroup>
              <Box width={'100%'}>
                <Skeleton isLoaded={!isHistoryDataLoading}>
                  <Box height={'300px'} width={'100%'}>
                    {!isHistoryDataLoading ? (
                      historyData && historyData.length > 0 ? (
                        <HistoryChart
                          historyData={historyData}
                          milliSeconds={milliSeconds}
                          mode={APY}
                        />
                      ) : (
                        <Center height="100%">
                          <Text mt="-8" size="md">
                            Not available
                          </Text>
                        </Center>
                      )
                    ) : (
                      <Center height="100%" width={'100%'}>
                        <Text>--</Text>
                      </Center>
                    )}
                  </Box>
                </Skeleton>
              </Box>
            </VStack>
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
};
