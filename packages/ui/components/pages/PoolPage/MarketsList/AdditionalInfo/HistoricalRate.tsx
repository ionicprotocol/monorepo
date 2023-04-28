import { Box, ButtonGroup, Center, Flex, Spinner, Stack, Text, VStack } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { useState } from 'react';

import { CButton } from '@ui/components/shared/Button';
import {
  MILLI_SECONDS_PER_DAY,
  MILLI_SECONDS_PER_MONTH,
  MILLI_SECONDS_PER_WEEK,
  MILLI_SECONDS_PER_YEAR,
  PRICE,
  TVL,
} from '@ui/constants/index';
import { useColors } from '@ui/hooks/useColors';
import { useHistoryData } from '@ui/hooks/useHistoryData';
import type { MarketData } from '@ui/types/TokensDataMap';

const HistoryChart = dynamic(() => import('@ui/components/shared/HistoryChart'), {
  ssr: false,
});

export const TimeFrames = [
  { label: '1D', milliSeconds: MILLI_SECONDS_PER_DAY },
  { label: '1W', milliSeconds: MILLI_SECONDS_PER_WEEK },
  { label: '1M', milliSeconds: MILLI_SECONDS_PER_MONTH },
  { label: '1Y', milliSeconds: MILLI_SECONDS_PER_YEAR },
];

export const Modes = [PRICE, TVL];

export const HistoricalRate = ({
  asset,
  poolChainId,
}: {
  asset: MarketData;
  poolChainId: number;
}) => {
  const [mode, setMode] = useState<string>(PRICE);
  const [milliSeconds, setMilliSeconds] = useState<number>(MILLI_SECONDS_PER_DAY);
  const { cCard } = useColors();
  const { data: historyData, isLoading } = useHistoryData(
    mode,
    asset.underlyingToken,
    asset.cToken,
    poolChainId,
    milliSeconds
  );

  return (
    <VStack borderRadius="20" spacing={0} width="100%">
      <Box
        background={cCard.headingBgColor}
        borderBottom="none"
        borderColor={cCard.borderColor}
        borderTopRadius={12}
        borderWidth={2}
        height={14}
        px={4}
        width="100%"
      >
        <Flex alignItems="center" height="100%" justifyContent="space-between">
          <Text py={0.5}>Historical Rate</Text>
          <ButtonGroup
            flexFlow={'row wrap'}
            gap={0}
            height={8}
            isAttached={true}
            justifyContent="flex-start"
            spacing={0}
          >
            {Modes.map((_mode) => {
              return (
                <CButton
                  borderRadius={8}
                  height="100%"
                  isSelected={mode === _mode}
                  key={_mode}
                  onClick={() => setMode(_mode)}
                  p={2}
                  variant="filter"
                >
                  <Center fontWeight="bold" height="100%" width="100%">
                    {_mode}
                  </Center>
                </CButton>
              );
            })}
          </ButtonGroup>
        </Flex>
      </Box>
      <Box
        borderBottomRadius={12}
        borderColor={cCard.borderColor}
        borderWidth={2}
        pb={4}
        width="100%"
      >
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
          <Stack height={'200px'} width={'100%'}>
            {!isLoading ? (
              historyData && historyData.length > 0 ? (
                <HistoryChart historyData={historyData} milliSeconds={milliSeconds} mode={mode} />
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
    </VStack>
  );
};
