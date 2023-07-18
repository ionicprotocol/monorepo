import {
  Box,
  ButtonGroup,
  CircularProgress,
  CircularProgressLabel,
  Divider,
  Flex,
  Icon,
  Spinner,
  Stack,
  Text,
  VStack
} from '@chakra-ui/react';
import { useState } from 'react';
import { BsCheckCircle } from 'react-icons/bs';

import { CButton } from '@ui/components/shared/Button';
import { Center } from '@ui/components/shared/Flex';
import HistoryChart from '@ui/components/shared/HistoryChart';
import {
  APY,
  MILLI_SECONDS_PER_MONTH,
  MILLI_SECONDS_PER_YEAR,
  MILLI_SECONDS_SIX_MONTH
} from '@ui/constants/index';
import { useColors } from '@ui/hooks/useColors';
import { useHistoryData } from '@ui/hooks/useHistoryData';
import type { MarketData } from '@ui/types/TokensDataMap';

export const TimeFrames = [
  { label: '1M', milliSeconds: MILLI_SECONDS_PER_MONTH },
  { label: '6M', milliSeconds: MILLI_SECONDS_SIX_MONTH },
  { label: '1Y', milliSeconds: MILLI_SECONDS_PER_YEAR }
];

export const SupplyInfo = ({ asset, chainId }: { asset: MarketData; chainId: number }) => {
  const { cIPage } = useColors();
  const [milliSeconds, setMilliSeconds] = useState<number>(MILLI_SECONDS_PER_MONTH);
  console.warn(asset, chainId);
  // const { data: historyData, isLoading } = useHistoryData(
  //   APY,
  //   asset.underlyingToken,
  //   asset.cToken,
  //   chainId,
  //   milliSeconds
  // );

  const { data: historyData, isLoading } = useHistoryData(
    APY,
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    '0x3Af258d24EBdC03127ED6cEb8e58cA90835fbca5',
    56,
    milliSeconds
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
              <Text color={'iLightGray'} textTransform={'uppercase'}>
                Total Supplied
              </Text>
              <Text size={'lg'}>213.04M of 1.76B</Text>
              <Text color={'iGray'}>$213.00M of $1.76B</Text>
            </Flex>
            <Flex direction={{ base: 'column' }} gap={{ base: '4px' }}>
              <Text color={'iLightGray'} textTransform={'uppercase'}>
                APR
              </Text>
              <Text size={'lg'}>2.50%</Text>
            </Flex>
          </Flex>
          <Center height={'100%'} mx={{ base: '24px' }}>
            <Divider bg={cIPage.dividerColor} orientation="vertical" width="1px" />
          </Center>
          <Flex flex={1} gap={{ base: '32px' }}>
            <Flex
              alignItems={'center'}
              direction={{ base: 'column' }}
              justifyContent={{ base: 'space-between' }}
            >
              <Icon as={BsCheckCircle} color={'iGreen'} fontSize="50px" />
              <Text>Can be collateral</Text>
            </Flex>
            <Flex direction={{ base: 'column' }} flex={1} gap={{ base: '8px' }}>
              <Flex justifyContent={'space-between'}>
                <Text color={'iLightGray'} textTransform={'uppercase'}>
                  Max LTV
                </Text>
                <Text>77.00%</Text>
              </Flex>
              <Flex justifyContent={'space-between'}>
                <Text color={'iLightGray'} textTransform={'uppercase'}>
                  Liquidation Thershold
                </Text>
                <Text>79.00%</Text>
              </Flex>
              <Flex justifyContent={'space-between'}>
                <Text color={'iLightGray'} textTransform={'uppercase'}>
                  Liquidation Penalty
                </Text>
                <Text>4.50%</Text>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
        <Flex>
          <Box pb={4} width="100%">
            <VStack>
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
                      variant="filter"
                    >
                      <Center fontWeight="bold" height="100%" width="100%">
                        {tf.label}
                      </Center>
                    </CButton>
                  );
                })}
              </ButtonGroup>
              <Stack height={'300px'} width={'100%'}>
                {!isLoading ? (
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
                  <Center height="100%">
                    <Spinner mt={-8} />
                  </Center>
                )}
              </Stack>
            </VStack>
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
};
