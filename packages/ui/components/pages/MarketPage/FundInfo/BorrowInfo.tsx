import {
  Box,
  ButtonGroup,
  CircularProgress,
  CircularProgressLabel,
  Divider,
  Flex,
  IconButton,
  Skeleton,
  Text,
  VStack
} from '@chakra-ui/react';
import { utils } from 'ethers';
import { useState } from 'react';
import { BiLinkExternal } from 'react-icons/bi';

import { CButton } from '@ui/components/shared/Button';
import { Center } from '@ui/components/shared/Flex';
import HistoryChart from '@ui/components/shared/HistoryChart';
import { LoadingText } from '@ui/components/shared/LoadingText';
import {
  BORROW_APY,
  MILLI_SECONDS_PER_MONTH,
  MILLI_SECONDS_PER_YEAR,
  MILLI_SECONDS_SIX_MONTH
} from '@ui/constants/index';
import { useBorrowAPYs } from '@ui/hooks/useBorrowAPYs';
import { useBorrowCap } from '@ui/hooks/useBorrowCap';
import { useColors } from '@ui/hooks/useColors';
import { useHistoryData } from '@ui/hooks/useHistoryData';
import type { MarketData } from '@ui/types/TokensDataMap';
import { smallFormatter, smallUsdFormatter } from '@ui/utils/bigUtils';

export const TimeFrames = [
  { label: '1M', milliSeconds: MILLI_SECONDS_PER_MONTH },
  { label: '6M', milliSeconds: MILLI_SECONDS_SIX_MONTH },
  { label: '1Y', milliSeconds: MILLI_SECONDS_PER_YEAR }
];

export const BorrowInfo = ({
  asset,
  assets,
  chainId,
  comptroller,
  isLoading
}: {
  asset?: MarketData;
  assets?: MarketData[];
  chainId: number;
  comptroller?: string;
  isLoading: boolean;
}) => {
  const { cIPage } = useColors();
  const [milliSeconds, setMilliSeconds] = useState<number>(MILLI_SECONDS_PER_MONTH);
  const { data: historyData, isLoading: isHistoryDataLoading } = useHistoryData(
    BORROW_APY,
    asset?.underlyingToken,
    asset?.cToken,
    chainId,
    milliSeconds
  );

  // const { data: historyData, isLoading: isHistoryDataLoading } = useHistoryData(
  //   BORROW_APY,
  //   '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  //   '0x3Af258d24EBdC03127ED6cEb8e58cA90835fbca5',
  //   56,
  //   milliSeconds
  // );
  const { data: borrowCap, isLoading: isBorrowCapLoading } = useBorrowCap({
    chainId,
    comptroller,
    market: asset
  });
  const { data: borrowApys, isLoading: isApyLoading } = useBorrowAPYs(assets, chainId);

  return (
    <Flex>
      <Flex direction={{ base: 'column' }} width={'100%'}>
        <Flex direction={{ base: 'row' }} width={'100%'}>
          <Flex flex={3} gap={{ base: '32px' }}>
            <CircularProgress
              color={'iGreen'}
              height={'74px'}
              size="74px"
              thickness="12px"
              trackColor={'iGray'}
              value={
                borrowCap && asset
                  ? (Number(utils.formatUnits(asset.totalBorrow)) * 100) / borrowCap.tokenCap
                  : 0
              }
            >
              <CircularProgressLabel fontSize={'12px'}>
                {borrowCap && asset ? (
                  (
                    (Number(utils.formatUnits(asset.totalBorrow)) * 100) /
                    borrowCap.tokenCap
                  ).toFixed(2)
                ) : (
                  <Text fontSize={'48px'}>∞</Text>
                )}
              </CircularProgressLabel>
            </CircularProgress>
            <Flex direction={{ base: 'column' }} gap={{ base: '4px' }}>
              <Text variant={'itemTitle'}>Total Borrowed</Text>
              <Skeleton isLoaded={!isLoading && !isBorrowCapLoading}>
                {isLoading || isBorrowCapLoading ? (
                  <LoadingText />
                ) : (
                  <Text size={'lg'}>
                    {asset ? smallFormatter(Number(utils.formatUnits(asset.totalBorrow))) : '--'}
                    {borrowCap ? ` of ${smallFormatter(borrowCap.tokenCap)}` : ''}
                  </Text>
                )}
              </Skeleton>
              <Skeleton isLoaded={!isLoading && !isBorrowCapLoading}>
                {isLoading || isBorrowCapLoading ? (
                  <LoadingText />
                ) : (
                  <Text color={'iGray'}>
                    {asset ? smallUsdFormatter(asset.totalBorrowFiat) : '--'}
                    {borrowCap ? ` of ${smallUsdFormatter(borrowCap.usdCap)}` : ''}
                  </Text>
                )}
              </Skeleton>
            </Flex>
            <Flex direction={{ base: 'column' }} gap={{ base: '4px' }}>
              <Text variant={'itemTitle'}>Borrowing Rate</Text>
              <Skeleton isLoaded={!isApyLoading}>
                {isApyLoading ? (
                  <LoadingText />
                ) : (
                  <Text size={'lg'}>{borrowApys && asset ? borrowApys[asset.cToken] : '--'}%</Text>
                )}
              </Skeleton>
            </Flex>
            <Flex direction={{ base: 'column' }} gap={{ base: '4px' }}>
              <Text variant={'itemTitle'}>Borrow Cap</Text>
              <Skeleton isLoaded={!isBorrowCapLoading}>
                {isBorrowCapLoading ? (
                  <LoadingText />
                ) : borrowCap ? (
                  <Text size={'lg'}>{borrowCap.tokenCap}</Text>
                ) : (
                  <Text fontSize={'48px'}>∞</Text>
                )}
              </Skeleton>
            </Flex>
          </Flex>
          <Center height={'100%'} mx={{ base: '24px' }}>
            <Divider bg={cIPage.dividerColor} orientation="vertical" width="1px" />
          </Center>
          <Flex flex={2} gap={{ base: '32px' }}>
            <Flex direction={{ base: 'column' }} flex={1} gap={{ base: '8px' }}>
              <Flex justifyContent={'space-between'}>
                <Text variant={'itemTitle'}>Reserve Factor</Text>
                <Skeleton isLoaded={!isLoading}>
                  {isLoading ? (
                    <LoadingText />
                  ) : (
                    <Text variant={'itemDesc'}>
                      {asset
                        ? `${Number(utils.formatUnits(asset.reserveFactor, 16)).toFixed(0)}%`
                        : '--'}
                    </Text>
                  )}
                </Skeleton>
              </Flex>
              <Flex justifyContent={'space-between'}>
                <Text variant={'itemTitle'}>Collector Contract</Text>
                <IconButton
                  alignSelf={'center'}
                  aria-label="collector link"
                  icon={<BiLinkExternal fontSize={'20px'} strokeWidth={'0.5px'} />}
                />
              </Flex>
            </Flex>
          </Flex>{' '}
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
                          mode={BORROW_APY}
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
